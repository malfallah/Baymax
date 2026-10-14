import type { Types } from 'mongoose';
import type {
  Answer,
  Appointment,
  Article,
  Doctor,
  DoctorProfile,
  Order,
  PatientProfile,
  PersonSummary,
  Product,
  Question,
  Role,
  TimeSlot,
  User,
} from '@baymax/shared';

/* Lean document shapes as returned by `.lean()` queries. */
type Id = Types.ObjectId | string;
const iso = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString() : undefined);

export interface LeanUser {
  _id: Id;
  role: Role;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarColor: string;
  patient?: Record<string, unknown> | null;
  doctor?: (Omit<DoctorProfile, 'languages'> & { languages?: string[] }) | null;
  createdAt?: Date;
}

function toPatientProfile(p: Record<string, unknown> = {}): PatientProfile {
  const dated = <T extends Record<string, unknown>>(list: unknown, key: string) =>
    ((list as T[] | undefined) ?? []).map((item) => ({
      ...item,
      [key]: iso(item[key] as Date | undefined),
    }));
  return {
    dateOfBirth: iso(p.dateOfBirth as Date | undefined),
    sex: p.sex as PatientProfile['sex'],
    nationality: p.nationality as string | undefined,
    address: p.address as string | undefined,
    heightCm: p.heightCm as number | undefined,
    weightKg: p.weightKg as number | undefined,
    bloodType: p.bloodType as PatientProfile['bloodType'],
    activityLevel: p.activityLevel as PatientProfile['activityLevel'],
    smoker: Boolean(p.smoker),
    allergies: (p.allergies as string[] | undefined) ?? [],
    conditions: dated(p.conditions, 'since') as unknown as PatientProfile['conditions'],
    vaccines: dated(p.vaccines, 'date') as unknown as PatientProfile['vaccines'],
    surgeries: dated(p.surgeries, 'date') as unknown as PatientProfile['surgeries'],
    familyHistory: (p.familyHistory as PatientProfile['familyHistory'] | undefined) ?? [],
    medications: (p.medications as PatientProfile['medications'] | undefined) ?? [],
  };
}

function toDoctorProfile(d: NonNullable<LeanUser['doctor']>): DoctorProfile {
  return {
    specialty: d.specialty,
    bio: d.bio ?? '',
    clinic: d.clinic,
    city: d.city,
    yearsOfExperience: d.yearsOfExperience,
    education: d.education,
    consultationFeeCents: d.consultationFeeCents,
    languages: d.languages ?? [],
    rating: d.rating,
    reviewsCount: d.reviewsCount,
  };
}

export function toUser(u: LeanUser): User {
  const base = {
    id: String(u._id),
    fullName: u.fullName,
    email: u.email,
    phone: u.phone ?? undefined,
    avatarColor: u.avatarColor,
    createdAt: iso(u.createdAt) ?? new Date().toISOString(),
  };
  return u.role === 'doctor'
    ? { ...base, role: 'doctor', doctor: toDoctorProfile(u.doctor!) }
    : { ...base, role: 'patient', patient: toPatientProfile(u.patient ?? {}) };
}

export function toPerson(u: Pick<LeanUser, '_id' | 'fullName' | 'avatarColor'>): PersonSummary {
  return { id: String(u._id), fullName: u.fullName, avatarColor: u.avatarColor };
}

export function toAuthor(u: Pick<LeanUser, '_id' | 'fullName' | 'avatarColor' | 'role'>) {
  return { ...toPerson(u), role: u.role };
}

export function toDoctor(u: LeanUser, nextAvailable?: Date): Doctor {
  return { ...toPerson(u), ...toDoctorProfile(u.doctor!), nextAvailable: iso(nextAvailable) };
}

export function toSlot(s: {
  _id: Id;
  doctor: Id;
  start: Date;
  end: Date;
  status: string;
}): TimeSlot {
  return {
    id: String(s._id),
    doctorId: String(s.doctor),
    start: iso(s.start)!,
    end: iso(s.end)!,
    status: s.status as TimeSlot['status'],
  };
}

export interface LeanAppointment {
  _id: Id;
  slot: Id;
  start: Date;
  end: Date;
  status: string;
  reason: string;
  notes?: string | null;
  patient: LeanUser;
  doctor: LeanUser;
  createdAt?: Date;
}

export function toAppointment(a: LeanAppointment): Appointment {
  return {
    id: String(a._id),
    slotId: String(a.slot),
    start: iso(a.start)!,
    end: iso(a.end)!,
    status: a.status as Appointment['status'],
    reason: a.reason,
    notes: a.notes ?? undefined,
    patient: toPerson(a.patient),
    doctor: {
      ...toPerson(a.doctor),
      specialty: a.doctor.doctor!.specialty,
      clinic: a.doctor.doctor!.clinic,
      city: a.doctor.doctor!.city,
    },
    createdAt: iso(a.createdAt)!,
  };
}

export function toArticle(a: {
  _id: Id;
  title: string;
  summary: string;
  body: string;
  category: string;
  readMinutes: number;
  author: LeanUser;
  publishedAt: Date;
}): Article {
  return {
    id: String(a._id),
    title: a.title,
    summary: a.summary,
    body: a.body,
    category: a.category as Article['category'],
    readMinutes: a.readMinutes,
    author: toAuthor(a.author),
    publishedAt: iso(a.publishedAt)!,
  };
}

export function toQuestion(q: {
  _id: Id;
  title: string;
  body: string;
  tags: string[];
  author: LeanUser;
  answers: { _id: Id; body: string; author: LeanUser; createdAt: Date }[];
  createdAt: Date;
}): Question {
  return {
    id: String(q._id),
    title: q.title,
    body: q.body,
    tags: q.tags,
    author: toAuthor(q.author),
    answers: q.answers.map((a): Answer => ({
      id: String(a._id),
      body: a.body,
      author: toAuthor(a.author),
      createdAt: iso(a.createdAt)!,
    })),
    createdAt: iso(q.createdAt)!,
  };
}

export function toProduct(p: Omit<Product, 'id'> & { _id: Id }): Product {
  return {
    id: String(p._id),
    name: p.name,
    brand: p.brand,
    category: p.category,
    description: p.description,
    activeIngredient: p.activeIngredient,
    usage: p.usage,
    priceCents: p.priceCents,
    stock: p.stock,
    rating: p.rating,
  };
}

export function toOrder(o: {
  _id: Id;
  items: Order['items'];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: string;
  shipping?: { [K in keyof Order['shipping']]?: string | null } | null;
  createdAt: Date;
}): Order {
  return {
    id: String(o._id),
    items: o.items.map(({ productId, name, priceCents, quantity }) => ({
      productId,
      name,
      priceCents,
      quantity,
    })),
    subtotalCents: o.subtotalCents,
    shippingCents: o.shippingCents,
    totalCents: o.totalCents,
    status: o.status as Order['status'],
    shipping: {
      fullName: o.shipping?.fullName ?? '',
      line1: o.shipping?.line1 ?? '',
      city: o.shipping?.city ?? '',
      phone: o.shipping?.phone ?? '',
    },
    createdAt: iso(o.createdAt)!,
  };
}

/** Fields to populate for person summaries. */
export const PERSON_FIELDS = 'fullName avatarColor role doctor';
