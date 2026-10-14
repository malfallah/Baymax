import { Router } from 'express';
import { z } from 'zod';
import { bookAppointmentSchema, updateAppointmentSchema } from '@baymax/shared';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors';
import { assertId } from '../lib/ids';
import { PERSON_FIELDS, toAppointment, type LeanAppointment } from '../lib/serialize';
import { validate } from '../lib/validate';
import { currentUserId, requireAuth, requireRole } from '../middleware/auth';
import { AppointmentModel } from '../models/Appointment';
import { TimeSlotModel } from '../models/TimeSlot';

const listQuery = z.object({ scope: z.enum(['upcoming', 'past', 'all']).default('all') });

async function loadAppointment(id: string) {
  const appointment = await AppointmentModel.findById(id)
    .populate('patient', PERSON_FIELDS)
    .populate('doctor', PERSON_FIELDS)
    .lean<LeanAppointment>();
  if (!appointment) throw notFound('Appointment');
  return appointment;
}

export const appointmentsRouter = Router();
appointmentsRouter.use('/appointments', requireAuth);

appointmentsRouter.get('/appointments', async (req, res) => {
  const { scope } = validate(listQuery, req.query);
  const auth = req.auth!;
  const filter: Record<string, unknown> = { [auth.role]: auth.sub };
  const now = new Date();
  if (scope === 'upcoming') Object.assign(filter, { status: 'confirmed', start: { $gte: now } });
  if (scope === 'past') filter.$or = [{ start: { $lt: now } }, { status: { $ne: 'confirmed' } }];

  const appointments = await AppointmentModel.find(filter)
    .sort({ start: scope === 'upcoming' ? 1 : -1 })
    .limit(200)
    .populate('patient', PERSON_FIELDS)
    .populate('doctor', PERSON_FIELDS)
    .lean<LeanAppointment[]>();
  res.json(appointments.map(toAppointment));
});

appointmentsRouter.get('/appointments/:id', async (req, res) => {
  const appointment = await loadAppointment(assertId(req.params.id, 'Appointment'));
  const me = currentUserId(req);
  if (String(appointment.patient._id) !== me && String(appointment.doctor._id) !== me)
    throw notFound('Appointment');
  res.json(toAppointment(appointment));
});

appointmentsRouter.post('/appointments', requireRole('patient'), async (req, res) => {
  const { slotId, reason } = validate(bookAppointmentSchema, req.body);
  assertId(slotId, 'Slot');
  const patient = currentUserId(req);

  // Atomically claim the slot so two patients can never book the same time.
  const slot = await TimeSlotModel.findOneAndUpdate(
    { _id: slotId, status: 'available', start: { $gt: new Date() } },
    { $set: { status: 'booked' } },
    { returnDocument: 'after' },
  );
  if (!slot) throw conflict('Sorry, that time was just taken. Please choose another slot.');

  try {
    const created = await AppointmentModel.create({
      patient,
      doctor: slot.doctor,
      slot: slot._id,
      start: slot.start,
      end: slot.end,
      reason,
    });
    res.status(201).json(toAppointment(await loadAppointment(created.id)));
  } catch (error) {
    await TimeSlotModel.updateOne({ _id: slot._id }, { $set: { status: 'available' } });
    throw error;
  }
});

appointmentsRouter.patch('/appointments/:id', async (req, res) => {
  const id = assertId(req.params.id, 'Appointment');
  const { status, notes } = validate(updateAppointmentSchema, req.body);
  const auth = req.auth!;
  const appointment = await AppointmentModel.findById(id);
  if (!appointment || String(appointment[auth.role]) !== auth.sub) throw notFound('Appointment');
  if (appointment.status !== 'confirmed')
    throw badRequest(`This appointment is already ${appointment.status}`);
  if (status === 'completed' && auth.role !== 'doctor')
    throw forbidden('Only the doctor can complete an appointment');

  appointment.status = status;
  if (notes !== undefined && auth.role === 'doctor') appointment.notes = notes;
  await appointment.save();

  // Free the slot again when a future appointment is cancelled.
  if (status === 'cancelled' && appointment.start > new Date()) {
    await TimeSlotModel.updateOne({ _id: appointment.slot }, { $set: { status: 'available' } });
  }
  res.json(toAppointment(await loadAppointment(id)));
});
