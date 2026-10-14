import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import {
  SPECIALTY_KEYS,
  createSlotsSchema,
  generateSlotWindows,
  overlaps,
  type DashboardStats,
} from '@baymax/shared';
import { badRequest, notFound } from '../lib/errors';
import { assertId } from '../lib/ids';
import { toDoctor, toSlot, type LeanUser } from '../lib/serialize';
import { validate } from '../lib/validate';
import { currentUserId, requireAuth, requireRole } from '../middleware/auth';
import { AppointmentModel } from '../models/Appointment';
import { TimeSlotModel } from '../models/TimeSlot';
import { UserModel } from '../models/User';

const listQuery = z.object({
  specialty: z.enum(SPECIALTY_KEYS).optional(),
  q: z.string().trim().max(80).optional(),
});

const rangeQuery = z.object({
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
});

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Earliest open future slot for each of the given doctors. */
async function nextAvailableByDoctor(doctorIds: Types.ObjectId[]) {
  const rows = await TimeSlotModel.aggregate<{ _id: Types.ObjectId; next: Date }>([
    { $match: { doctor: { $in: doctorIds }, status: 'available', start: { $gt: new Date() } } },
    { $group: { _id: '$doctor', next: { $min: '$start' } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.next]));
}

export const doctorsRouter = Router();

doctorsRouter.get('/doctors', async (req, res) => {
  const { specialty, q } = validate(listQuery, req.query);
  const filter: Record<string, unknown> = { role: 'doctor' };
  if (specialty) filter['doctor.specialty'] = specialty;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ fullName: rx }, { 'doctor.clinic': rx }, { 'doctor.city': rx }];
  }
  const doctors = await UserModel.find(filter)
    .sort({ 'doctor.rating': -1, fullName: 1 })
    .lean<LeanUser[]>();
  const next = await nextAvailableByDoctor(doctors.map((d) => new Types.ObjectId(String(d._id))));
  res.json(doctors.map((d) => toDoctor(d, next.get(String(d._id)))));
});

doctorsRouter.get('/doctors/:id', async (req, res) => {
  const id = assertId(req.params.id, 'Doctor');
  const doctor = await UserModel.findOne({ _id: id, role: 'doctor' }).lean<LeanUser>();
  if (!doctor) throw notFound('Doctor');
  const next = await nextAvailableByDoctor([new Types.ObjectId(id)]);
  res.json(toDoctor(doctor, next.get(id)));
});

doctorsRouter.get('/doctors/:id/slots', async (req, res) => {
  const id = assertId(req.params.id, 'Doctor');
  const { from, to } = validate(rangeQuery, req.query);
  const start: Record<string, Date> = {
    $gt: new Date(Math.max(Date.now(), from ? Date.parse(from) : 0)),
  };
  if (to) start.$lt = new Date(to);
  const slots = await TimeSlotModel.find({ doctor: id, status: 'available', start })
    .sort({ start: 1 })
    .limit(500)
    .lean();
  res.json(slots.map(toSlot));
});

/* ---------- Doctor-only: manage own availability ---------- */

doctorsRouter.get('/me/slots', requireAuth, requireRole('doctor'), async (req, res) => {
  const { from, to } = validate(rangeQuery, req.query);
  const start: Record<string, Date> = { $gte: from ? new Date(from) : new Date() };
  if (to) start.$lt = new Date(to);
  const slots = await TimeSlotModel.find({ doctor: currentUserId(req), start })
    .sort({ start: 1 })
    .limit(1000)
    .lean();
  res.json(slots.map(toSlot));
});

doctorsRouter.post('/me/slots', requireAuth, requireRole('doctor'), async (req, res) => {
  const input = validate(createSlotsSchema, req.body);
  const doctor = currentUserId(req);
  const windows = generateSlotWindows(input).filter((w) => Date.parse(w.start) > Date.now());
  if (windows.length === 0)
    throw badRequest('Choose a future time window long enough for at least one slot');

  const existing = await TimeSlotModel.find({
    doctor,
    start: { $lt: new Date(windows.at(-1)!.end) },
    end: { $gt: new Date(windows[0]!.start) },
  }).lean();
  const fresh = windows.filter(
    (w) =>
      !existing.some((e) =>
        overlaps(w, { start: e.start.toISOString(), end: e.end.toISOString() }),
      ),
  );
  if (fresh.length === 0) throw badRequest('Those times overlap slots you already have');

  const created = await TimeSlotModel.insertMany(
    fresh.map((w) => ({ doctor, start: w.start, end: w.end })),
  );
  res.status(201).json(created.map((s) => toSlot(s.toObject())));
});

doctorsRouter.delete('/me/slots/:id', requireAuth, requireRole('doctor'), async (req, res) => {
  const id = assertId(req.params.id, 'Slot');
  const slot = await TimeSlotModel.findOne({ _id: id, doctor: currentUserId(req) });
  if (!slot) throw notFound('Slot');
  if (slot.status === 'booked')
    throw badRequest('This slot is booked. Cancel the appointment first.');
  await slot.deleteOne();
  res.status(204).end();
});

doctorsRouter.get('/me/stats', requireAuth, requireRole('doctor'), async (req, res) => {
  const doctor = currentUserId(req);
  const now = new Date();
  const [upcomingAppointments, completedAppointments, openSlots, patients] = await Promise.all([
    AppointmentModel.countDocuments({ doctor, status: 'confirmed', start: { $gte: now } }),
    AppointmentModel.countDocuments({ doctor, status: 'completed' }),
    TimeSlotModel.countDocuments({ doctor, status: 'available', start: { $gte: now } }),
    AppointmentModel.distinct('patient', { doctor, status: 'completed' }),
  ]);
  const stats: DashboardStats = {
    upcomingAppointments,
    completedAppointments,
    openSlots,
    patientsSeen: patients.length,
  };
  res.json(stats);
});
