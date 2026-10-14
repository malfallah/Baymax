import bcrypt from 'bcryptjs';
import {
  DEMO_PASSWORD,
  SEED_ARTICLES,
  SEED_COMMUNITY,
  SEED_DOCTORS,
  SEED_PATIENT,
  SEED_PRODUCTS,
  SEED_QUESTIONS,
  avatarColorFor,
  generateSlotWindows,
} from '@baymax/shared';
import { AppointmentModel } from '../models/Appointment';
import { ArticleModel } from '../models/Article';
import { OrderModel } from '../models/Order';
import { ProductModel } from '../models/Product';
import { QuestionModel } from '../models/Question';
import { TimeSlotModel } from '../models/TimeSlot';
import { UserModel } from '../models/User';
import { readMinutesFor } from '../modules/community.routes';

const DAY = 86_400_000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Resets the database to a realistic demo dataset. */
export async function seedDatabase() {
  await Promise.all([
    UserModel.deleteMany({}),
    TimeSlotModel.deleteMany({}),
    AppointmentModel.deleteMany({}),
    ArticleModel.deleteMany({}),
    QuestionModel.deleteMany({}),
    ProductModel.deleteMany({}),
    OrderModel.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const doctors = await UserModel.insertMany(
    SEED_DOCTORS.map((d) => ({
      ...d,
      role: 'doctor',
      passwordHash,
      avatarColor: avatarColorFor(d.email),
    })),
  );
  const patient = await UserModel.create({
    ...SEED_PATIENT,
    role: 'patient',
    passwordHash,
    avatarColor: avatarColorFor(SEED_PATIENT.email),
  });
  const community = await UserModel.insertMany(
    SEED_COMMUNITY.map((c) => ({
      ...c,
      role: 'patient',
      passwordHash,
      avatarColor: avatarColorFor(c.email),
      patient: {},
    })),
  );
  const byEmail = new Map([...doctors, patient, ...community].map((u) => [u.email, u]));

  // Two weeks of weekday availability for every doctor (09:00–17:00 UTC).
  const slots = [];
  const today = new Date();
  for (const doctor of doctors) {
    for (let i = 1; i <= 14; i++) {
      const day = new Date(today.getTime() + i * DAY);
      if (day.getUTCDay() === 0 || day.getUTCDay() === 6) continue;
      for (const [startTime, endTime] of [
        ['09:00', '12:00'],
        ['13:00', '17:00'],
      ] as const) {
        for (const w of generateSlotWindows({
          date: isoDay(day),
          startTime,
          endTime,
          durationMinutes: 30,
        })) {
          slots.push({ doctor: doctor._id, start: w.start, end: w.end, status: 'available' });
        }
      }
    }
  }
  const insertedSlots = await TimeSlotModel.insertMany(slots);

  // Book a few upcoming appointments for the demo patient and the demo doctor.
  const book = async (doctorEmail: string, nth: number, reason: string) => {
    const doctor = byEmail.get(doctorEmail)!;
    const slot = insertedSlots.filter((s) => String(s.doctor) === String(doctor._id))[nth]!;
    slot.status = 'booked';
    await slot.save();
    return AppointmentModel.create({
      patient: patient._id,
      doctor: doctor._id,
      slot: slot._id,
      start: slot.start,
      end: slot.end,
      reason,
    });
  };
  await book(SEED_DOCTORS[0]!.email, 2, 'Annual check-up and blood pressure review');
  await book('sofia.martinez@baymax.health', 5, 'Recurring rash on forearms');
  await book(SEED_DOCTORS[0]!.email, 9, 'Follow-up on seasonal allergy treatment');

  // A completed past visit for history.
  const past = new Date(today.getTime() - 9 * DAY);
  past.setUTCHours(10, 0, 0, 0);
  const pastSlot = await TimeSlotModel.create({
    doctor: doctors[0]!._id,
    start: past,
    end: new Date(past.getTime() + 30 * 60_000),
    status: 'booked',
  });
  await AppointmentModel.create({
    patient: patient._id,
    doctor: doctors[0]!._id,
    slot: pastSlot._id,
    start: pastSlot.start,
    end: pastSlot.end,
    reason: 'Persistent sneezing and itchy eyes',
    status: 'completed',
    notes: 'Seasonal allergic rhinitis. Started cetirizine 10 mg daily. Review in 4 weeks.',
  });

  await ArticleModel.insertMany(
    SEED_ARTICLES.map((a) => ({
      ...a,
      readMinutes: readMinutesFor(a.body),
      author: byEmail.get(a.authorEmail)!._id,
      publishedAt: new Date(today.getTime() - a.daysAgo * DAY),
    })),
  );

  await QuestionModel.insertMany(
    SEED_QUESTIONS.map((q) => {
      const createdAt = new Date(today.getTime() - q.daysAgo * DAY);
      return {
        title: q.title,
        body: q.body,
        tags: q.tags,
        author: byEmail.get(q.authorEmail)!._id,
        createdAt,
        answers: q.answers.map((a) => ({
          body: a.body,
          author: byEmail.get(a.authorEmail)!._id,
          createdAt: new Date(createdAt.getTime() + a.hoursAfter * 3_600_000),
        })),
      };
    }),
  );

  await ProductModel.insertMany(SEED_PRODUCTS);

  return { doctors: doctors.length, slots: insertedSlots.length, products: SEED_PRODUCTS.length };
}
