/**
 * Demo backend that mirrors the Baymax REST API entirely on-device.
 *
 * It powers the hosted web demo (GitHub Pages) and lets the app run without a
 * server. Data is seeded from @baymax/shared and persisted with AsyncStorage
 * (localStorage on the web), so bookings, orders and posts survive reloads.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEMO_PASSWORD,
  SEED_ARTICLES,
  SEED_COMMUNITY,
  SEED_DOCTORS,
  SEED_PATIENT,
  SEED_PRODUCTS,
  SEED_QUESTIONS,
  avatarColorFor,
  bookAppointmentSchema,
  changePasswordSchema,
  createAnswerSchema,
  createArticleSchema,
  createOrderSchema,
  createQuestionSchema,
  createSlotsSchema,
  generateSlotWindows,
  loginSchema,
  overlaps,
  predictConditions,
  predictSchema,
  registerSchema,
  shippingFor,
  updateAppointmentSchema,
  updateMeSchema,
  type Answer,
  type Appointment,
  type Article,
  type AuthResponse,
  type DashboardStats,
  type Doctor,
  type DoctorUser,
  type Order,
  type PatientUser,
  type PersonSummary,
  type Product,
  type Question,
  type Role,
  type TimeSlot,
  type User,
} from '@baymax/shared';
import type { z } from 'zod';
import { ApiError } from '../api/errors';
import type { ApiRequest, Transport } from '../api/client';

const STORAGE_KEY = 'baymax.demo.v2';
const DAY = 86_400_000;
const LATENCY_MS = 220;

interface StoredUser {
  user: User;
  password: string;
}

interface StoredAppointment {
  id: string;
  slotId: string;
  patientId: string;
  doctorId: string;
  start: string;
  end: string;
  status: Appointment['status'];
  reason: string;
  notes?: string;
  createdAt: string;
}

interface StoredQuestion {
  id: string;
  title: string;
  body: string;
  tags: string[];
  authorId: string;
  createdAt: string;
  answers: { id: string; body: string; authorId: string; createdAt: string }[];
}

interface StoredArticle extends Omit<Article, 'author'> {
  authorId: string;
}

interface StoredOrder extends Order {
  userId: string;
}

interface DemoDb {
  version: 2;
  users: StoredUser[];
  slots: TimeSlot[];
  slotDays: Record<string, string[]>;
  appointments: StoredAppointment[];
  articles: StoredArticle[];
  questions: StoredQuestion[];
  products: Product[];
  orders: StoredOrder[];
}

/* ---------------------------------------------------------------- helpers */

let counter = 0;
const newId = () =>
  `${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fail = (
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): never => {
  throw new ApiError(status, code, message, fields);
};
const notFound = (what: string) => fail(404, 'not_found', `${what} not found`);

function parse<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) fields[issue.path.join('.') || '_'] ??= issue.message;
    fail(422, 'validation_error', result.error.issues[0]?.message ?? 'Invalid request', fields);
  }
  return (result as { data: z.output<S> }).data;
}

const matches = (text: string, q?: string) => !q || text.toLowerCase().includes(q.toLowerCase());

/* -------------------------------------------------------------- seeding */

function seed(): DemoDb {
  const now = Date.now();
  const users: StoredUser[] = [];

  for (const d of SEED_DOCTORS) {
    const user: DoctorUser = {
      id: newId(),
      role: 'doctor',
      fullName: d.fullName,
      email: d.email,
      phone: d.phone,
      avatarColor: avatarColorFor(d.email),
      createdAt: new Date(now - 400 * DAY).toISOString(),
      doctor: d.doctor,
    };
    users.push({ user, password: DEMO_PASSWORD });
  }
  const patient: PatientUser = {
    id: newId(),
    role: 'patient',
    fullName: SEED_PATIENT.fullName,
    email: SEED_PATIENT.email,
    phone: SEED_PATIENT.phone,
    avatarColor: avatarColorFor(SEED_PATIENT.email),
    createdAt: new Date(now - 200 * DAY).toISOString(),
    patient: SEED_PATIENT.patient,
  };
  users.push({ user: patient, password: DEMO_PASSWORD });
  for (const c of SEED_COMMUNITY) {
    users.push({
      user: {
        id: newId(),
        role: 'patient',
        fullName: c.fullName,
        email: c.email,
        avatarColor: avatarColorFor(c.email),
        createdAt: new Date(now - 100 * DAY).toISOString(),
        patient: {
          smoker: false,
          allergies: [],
          conditions: [],
          vaccines: [],
          surgeries: [],
          familyHistory: [],
          medications: [],
        },
      },
      password: DEMO_PASSWORD,
    });
  }
  const byEmail = new Map(users.map((u) => [u.user.email, u.user]));

  const db: DemoDb = {
    version: 2,
    users,
    slots: [],
    slotDays: {},
    appointments: [],
    articles: SEED_ARTICLES.map((a) => ({
      id: newId(),
      title: a.title,
      summary: a.summary,
      body: a.body,
      category: a.category,
      readMinutes: Math.max(1, Math.round(a.body.split(/\s+/).length / 200)),
      authorId: byEmail.get(a.authorEmail)!.id,
      publishedAt: new Date(now - a.daysAgo * DAY).toISOString(),
    })),
    questions: SEED_QUESTIONS.map((q) => {
      const createdAt = now - q.daysAgo * DAY;
      return {
        id: newId(),
        title: q.title,
        body: q.body,
        tags: q.tags,
        authorId: byEmail.get(q.authorEmail)!.id,
        createdAt: new Date(createdAt).toISOString(),
        answers: q.answers.map((a) => ({
          id: newId(),
          body: a.body,
          authorId: byEmail.get(a.authorEmail)!.id,
          createdAt: new Date(createdAt + a.hoursAfter * 3_600_000).toISOString(),
        })),
      };
    }),
    products: SEED_PRODUCTS.map((p) => ({ id: newId(), ...p })),
    orders: [],
  };

  ensureSlots(db);

  // Upcoming visits for the demo patient, plus one completed visit.
  const book = (doctorEmail: string, nth: number, reason: string) => {
    const doctorId = byEmail.get(doctorEmail)!.id;
    const slot = db.slots.filter((s) => s.doctorId === doctorId && s.status === 'available')[nth];
    if (!slot) return;
    slot.status = 'booked';
    db.appointments.push({
      id: newId(),
      slotId: slot.id,
      patientId: patient.id,
      doctorId,
      start: slot.start,
      end: slot.end,
      status: 'confirmed',
      reason,
      createdAt: nowIso(),
    });
  };
  book(SEED_DOCTORS[0]!.email, 3, 'Annual check-up and blood pressure review');
  book('sofia.martinez@baymax.health', 6, 'Recurring rash on forearms');
  book(SEED_DOCTORS[0]!.email, 12, 'Follow-up on seasonal allergy treatment');

  const past = new Date(now - 9 * DAY);
  past.setHours(10, 0, 0, 0);
  const pastSlot: TimeSlot = {
    id: newId(),
    doctorId: byEmail.get(SEED_DOCTORS[0]!.email)!.id,
    start: past.toISOString(),
    end: new Date(past.getTime() + 30 * 60_000).toISOString(),
    status: 'booked',
  };
  db.slots.push(pastSlot);
  db.appointments.push({
    id: newId(),
    slotId: pastSlot.id,
    patientId: patient.id,
    doctorId: pastSlot.doctorId,
    start: pastSlot.start,
    end: pastSlot.end,
    status: 'completed',
    reason: 'Persistent sneezing and itchy eyes',
    notes: 'Seasonal allergic rhinitis. Started cetirizine 10 mg daily. Review in 4 weeks.',
    createdAt: past.toISOString(),
  });

  // Doctor's own patients for the demo doctor dashboard.
  const demoDoctor = byEmail.get(SEED_DOCTORS[0]!.email)!;
  const community = SEED_COMMUNITY.map((c) => byEmail.get(c.email)!);
  community.forEach((member, i) => {
    const slot = db.slots.filter((s) => s.doctorId === demoDoctor.id && s.status === 'available')[
      i * 4
    ];
    if (!slot) return;
    slot.status = 'booked';
    db.appointments.push({
      id: newId(),
      slotId: slot.id,
      patientId: member.id,
      doctorId: demoDoctor.id,
      start: slot.start,
      end: slot.end,
      status: 'confirmed',
      reason: i === 0 ? 'Blood pressure follow-up' : 'Child fever — persistent for three days',
      createdAt: nowIso(),
    });
  });

  return db;
}

/** Keeps two weeks of weekday availability open for every doctor (local time). */
function ensureSlots(db: DemoDb) {
  const today = new Date();
  for (const { user } of db.users) {
    if (user.role !== 'doctor') continue;
    const days = new Set(db.slotDays[user.id] ?? []);
    for (let i = 0; i <= 14; i++) {
      const day = new Date(today.getTime() + i * DAY);
      if (day.getDay() === 0 || day.getDay() === 6) continue;
      const key = localDate(day);
      if (days.has(key)) continue;
      days.add(key);
      for (const [startTime, endTime] of [
        ['09:00', '12:00'],
        ['13:30', '17:00'],
      ] as const) {
        for (const w of generateSlotWindows({
          date: key,
          startTime,
          endTime,
          durationMinutes: 30,
          timezoneOffsetMinutes: day.getTimezoneOffset(),
        })) {
          if (Date.parse(w.start) > Date.now())
            db.slots.push({ id: newId(), doctorId: user.id, ...w, status: 'available' });
        }
      }
    }
    db.slotDays[user.id] = [...days].filter((d) => Date.parse(d) > Date.now() - 30 * DAY);
  }
}

/* ---------------------------------------------------------- persistence */

let dbPromise: Promise<DemoDb> | null = null;

async function load(): Promise<DemoDb> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const db = JSON.parse(raw) as DemoDb;
      if (db.version === 2) {
        ensureSlots(db);
        return db;
      }
    }
  } catch {
    // Corrupt or unavailable storage — start fresh.
  }
  const db = seed();
  await save(db);
  return db;
}

async function save(db: DemoDb) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage may be unavailable (private mode); the session still works in memory.
  }
}

export async function resetDemoData() {
  dbPromise = Promise.resolve(seed());
  await save(await dbPromise);
}

/* ---------------------------------------------------------- projections */

function userById(db: DemoDb, id: string) {
  return db.users.find((u) => u.user.id === id)?.user;
}
const person = (u: User): PersonSummary => ({
  id: u.id,
  fullName: u.fullName,
  avatarColor: u.avatarColor,
});
const author = (u: User) => ({ ...person(u), role: u.role });

function toDoctor(db: DemoDb, u: DoctorUser): Doctor {
  const next = db.slots
    .filter(
      (s) => s.doctorId === u.id && s.status === 'available' && Date.parse(s.start) > Date.now(),
    )
    .reduce<string | undefined>((min, s) => (!min || s.start < min ? s.start : min), undefined);
  return { ...person(u), ...u.doctor, nextAvailable: next };
}

function toAppointment(db: DemoDb, a: StoredAppointment): Appointment {
  const doctor = userById(db, a.doctorId) as DoctorUser;
  const patient = userById(db, a.patientId)!;
  return {
    id: a.id,
    slotId: a.slotId,
    start: a.start,
    end: a.end,
    status: a.status,
    reason: a.reason,
    notes: a.notes,
    patient: person(patient),
    doctor: {
      ...person(doctor),
      specialty: doctor.doctor.specialty,
      clinic: doctor.doctor.clinic,
      city: doctor.doctor.city,
    },
    createdAt: a.createdAt,
  };
}

function toArticle(db: DemoDb, a: StoredArticle): Article {
  const { authorId, ...rest } = a;
  return { ...rest, author: author(userById(db, authorId)!) };
}

function toQuestion(db: DemoDb, q: StoredQuestion): Question {
  return {
    id: q.id,
    title: q.title,
    body: q.body,
    tags: q.tags,
    author: author(userById(db, q.authorId)!),
    createdAt: q.createdAt,
    answers: q.answers.map((a): Answer => ({
      id: a.id,
      body: a.body,
      createdAt: a.createdAt,
      author: author(userById(db, a.authorId)!),
    })),
  };
}

const stripOrder = ({ userId: _userId, ...order }: StoredOrder): Order => order;

/* --------------------------------------------------------------- routes */

interface Ctx {
  db: DemoDb;
  params: string[];
  query: Record<string, string | undefined>;
  body: unknown;
  me: () => User;
  requireRole: (role: Role) => User;
}

type Handler = (ctx: Ctx) => unknown;
const routes: [ApiRequest['method'], RegExp, Handler][] = [];
const route = (method: ApiRequest['method'], pattern: string, handler: Handler) =>
  routes.push([method, new RegExp(`^${pattern.replace(/:\w+/g, '([^/]+)')}$`), handler]);

const authResponse = (user: User): AuthResponse => ({ token: `demo.${user.id}`, user });

route('POST', '/auth/login', ({ db, body }) => {
  const { email, password } = parse(loginSchema, body);
  const record = db.users.find((u) => u.user.email === email);
  if (!record || record.password !== password)
    fail(401, 'unauthorized', 'Incorrect email or password');
  return authResponse(record!.user);
});

route('POST', '/auth/register', ({ db, body }) => {
  const input = parse(registerSchema, body);
  if (db.users.some((u) => u.user.email === input.email))
    fail(409, 'conflict', 'An account with this email already exists');
  const base = {
    id: newId(),
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    avatarColor: avatarColorFor(input.email),
    createdAt: nowIso(),
  };
  const user: User =
    input.role === 'doctor'
      ? { ...base, role: 'doctor', doctor: { ...input.doctor, rating: 5, reviewsCount: 0 } }
      : { ...base, role: 'patient', patient: input.patient };
  db.users.push({ user, password: input.password });
  return authResponse(user);
});

route('POST', '/auth/forgot-password', ({ body }) => {
  parse(loginSchema.pick({ email: true }), body);
  return { message: 'If an account exists for that email, a reset link is on its way.' };
});

route('GET', '/me', ({ me }) => me());

route('PATCH', '/me', ({ me, body }) => {
  const input = parse(updateMeSchema, body);
  const user = me();
  if (input.fullName !== undefined) user.fullName = input.fullName;
  if (input.phone !== undefined) user.phone = input.phone;
  if (user.role === 'patient' && input.patient) Object.assign(user.patient, input.patient);
  if (user.role === 'doctor' && input.doctor) Object.assign(user.doctor, input.doctor);
  return user;
});

route('POST', '/me/password', ({ db, me, body }) => {
  const { currentPassword, newPassword } = parse(changePasswordSchema, body);
  const record = db.users.find((u) => u.user.id === me().id)!;
  if (record.password !== currentPassword)
    fail(400, 'bad_request', 'Your current password is incorrect');
  record.password = newPassword;
  return undefined;
});

route('GET', '/doctors', ({ db, query }) =>
  db.users
    .map((u) => u.user)
    .filter((u): u is DoctorUser => u.role === 'doctor')
    .filter((u) => !query.specialty || u.doctor.specialty === query.specialty)
    .filter((u) => matches(`${u.fullName} ${u.doctor.clinic} ${u.doctor.city}`, query.q))
    .sort((a, b) => b.doctor.rating - a.doctor.rating || a.fullName.localeCompare(b.fullName))
    .map((u) => toDoctor(db, u)),
);

route('GET', '/doctors/:id', ({ db, params }) => {
  const user = userById(db, params[0]!);
  if (!user || user.role !== 'doctor') return notFound('Doctor');
  return toDoctor(db, user as DoctorUser);
});

route('GET', '/doctors/:id/slots', ({ db, params }) =>
  db.slots
    .filter(
      (s) =>
        s.doctorId === params[0] && s.status === 'available' && Date.parse(s.start) > Date.now(),
    )
    .sort((a, b) => a.start.localeCompare(b.start)),
);

route('GET', '/me/slots', ({ db, requireRole, query }) => {
  const me = requireRole('doctor');
  const from = query.from ? Date.parse(query.from) : Date.now();
  const to = query.to ? Date.parse(query.to) : Infinity;
  return db.slots
    .filter((s) => s.doctorId === me.id && Date.parse(s.start) >= from && Date.parse(s.start) < to)
    .sort((a, b) => a.start.localeCompare(b.start));
});

route('POST', '/me/slots', ({ db, requireRole, body }) => {
  const me = requireRole('doctor');
  const windows = generateSlotWindows(parse(createSlotsSchema, body)).filter(
    (w) => Date.parse(w.start) > Date.now(),
  );
  if (windows.length === 0)
    fail(400, 'bad_request', 'Choose a future time window long enough for at least one slot');
  const mine = db.slots.filter((s) => s.doctorId === me.id);
  const fresh = windows.filter((w) => !mine.some((s) => overlaps(w, s)));
  if (fresh.length === 0) fail(400, 'bad_request', 'Those times overlap slots you already have');
  const created = fresh.map((w): TimeSlot => ({
    id: newId(),
    doctorId: me.id,
    ...w,
    status: 'available',
  }));
  db.slots.push(...created);
  return created;
});

route('DELETE', '/me/slots/:id', ({ db, requireRole, params }) => {
  const me = requireRole('doctor');
  const slot = db.slots.find((s) => s.id === params[0] && s.doctorId === me.id);
  if (!slot) return notFound('Slot');
  if (slot.status === 'booked')
    fail(400, 'bad_request', 'This slot is booked. Cancel the appointment first.');
  db.slots = db.slots.filter((s) => s !== slot);
  return undefined;
});

route('GET', '/me/stats', ({ db, requireRole }): DashboardStats => {
  const me = requireRole('doctor');
  const mine = db.appointments.filter((a) => a.doctorId === me.id);
  const now = Date.now();
  return {
    upcomingAppointments: mine.filter((a) => a.status === 'confirmed' && Date.parse(a.start) >= now)
      .length,
    completedAppointments: mine.filter((a) => a.status === 'completed').length,
    openSlots: db.slots.filter(
      (s) => s.doctorId === me.id && s.status === 'available' && Date.parse(s.start) >= now,
    ).length,
    patientsSeen: new Set(mine.filter((a) => a.status === 'completed').map((a) => a.patientId))
      .size,
  };
});

route('GET', '/appointments', ({ db, me, query }) => {
  const user = me();
  const now = Date.now();
  const scope = query.scope ?? 'all';
  const key = user.role === 'doctor' ? 'doctorId' : 'patientId';
  return db.appointments
    .filter((a) => a[key] === user.id)
    .filter((a) => {
      const upcoming = a.status === 'confirmed' && Date.parse(a.start) >= now;
      return scope === 'all' || (scope === 'upcoming' ? upcoming : !upcoming);
    })
    .sort((a, b) =>
      scope === 'upcoming' ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start),
    )
    .map((a) => toAppointment(db, a));
});

route('GET', '/appointments/:id', ({ db, me, params }) => {
  const user = me();
  const a = db.appointments.find(
    (x) => x.id === params[0] && (x.patientId === user.id || x.doctorId === user.id),
  );
  if (!a) return notFound('Appointment');
  return toAppointment(db, a);
});

route('POST', '/appointments', ({ db, requireRole, body }) => {
  const me = requireRole('patient');
  const { slotId, reason } = parse(bookAppointmentSchema, body);
  const slot = db.slots.find((s) => s.id === slotId);
  if (!slot || slot.status !== 'available' || Date.parse(slot.start) <= Date.now()) {
    fail(409, 'conflict', 'Sorry, that time was just taken. Please choose another slot.');
  }
  slot!.status = 'booked';
  const appointment: StoredAppointment = {
    id: newId(),
    slotId,
    patientId: me.id,
    doctorId: slot!.doctorId,
    start: slot!.start,
    end: slot!.end,
    status: 'confirmed',
    reason,
    createdAt: nowIso(),
  };
  db.appointments.push(appointment);
  return toAppointment(db, appointment);
});

route('PATCH', '/appointments/:id', ({ db, me, params, body }) => {
  const user = me();
  const { status, notes } = parse(updateAppointmentSchema, body);
  const a = db.appointments.find(
    (x) => x.id === params[0] && (user.role === 'doctor' ? x.doctorId : x.patientId) === user.id,
  );
  if (!a) return notFound('Appointment');
  if (a.status !== 'confirmed') fail(400, 'bad_request', `This appointment is already ${a.status}`);
  if (status === 'completed' && user.role !== 'doctor')
    fail(403, 'forbidden', 'Only the doctor can complete an appointment');
  a.status = status;
  if (notes !== undefined && user.role === 'doctor') a.notes = notes;
  if (status === 'cancelled' && Date.parse(a.start) > Date.now()) {
    const slot = db.slots.find((s) => s.id === a.slotId);
    if (slot) slot.status = 'available';
  }
  return toAppointment(db, a);
});

route('GET', '/articles', ({ db, query }) =>
  db.articles
    .filter(
      (a) =>
        (!query.category || a.category === query.category) &&
        matches(`${a.title} ${a.summary}`, query.q),
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((a) => toArticle(db, a)),
);

route('GET', '/articles/:id', ({ db, params }) => {
  const a = db.articles.find((x) => x.id === params[0]);
  return a ? toArticle(db, a) : notFound('Article');
});

route('POST', '/articles', ({ db, requireRole, body }) => {
  const me = requireRole('doctor');
  const input = parse(createArticleSchema, body);
  const article: StoredArticle = {
    id: newId(),
    ...input,
    category: input.category as Article['category'],
    readMinutes: Math.max(1, Math.round(input.body.split(/\s+/).length / 200)),
    authorId: me.id,
    publishedAt: nowIso(),
  };
  db.articles.push(article);
  return toArticle(db, article);
});

route('GET', '/questions', ({ db, query }) =>
  db.questions
    .filter(
      (q) => (!query.tag || q.tags.includes(query.tag)) && matches(`${q.title} ${q.body}`, query.q),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((q) => toQuestion(db, q)),
);

route('GET', '/questions/:id', ({ db, params }) => {
  const q = db.questions.find((x) => x.id === params[0]);
  return q ? toQuestion(db, q) : notFound('Question');
});

route('POST', '/questions', ({ db, me, body }) => {
  const user = me();
  const input = parse(createQuestionSchema, body);
  const question: StoredQuestion = {
    id: newId(),
    ...input,
    authorId: user.id,
    createdAt: nowIso(),
    answers: [],
  };
  db.questions.push(question);
  return toQuestion(db, question);
});

route('POST', '/questions/:id/answers', ({ db, me, params, body }) => {
  const user = me();
  const { body: text } = parse(createAnswerSchema, body);
  const q = db.questions.find((x) => x.id === params[0]);
  if (!q) return notFound('Question');
  q.answers.push({ id: newId(), body: text, authorId: user.id, createdAt: nowIso() });
  return toQuestion(db, q);
});

route('GET', '/products', ({ db, query }) =>
  db.products
    .filter(
      (p) =>
        (!query.category || p.category === query.category) &&
        matches(`${p.name} ${p.brand} ${p.activeIngredient}`, query.q),
    )
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name)),
);

route(
  'GET',
  '/products/:id',
  ({ db, params }) => db.products.find((p) => p.id === params[0]) ?? notFound('Product'),
);

route('GET', '/orders', ({ db, me }) =>
  db.orders
    .filter((o) => o.userId === me().id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(stripOrder),
);

route('GET', '/orders/:id', ({ db, me, params }) => {
  const order = db.orders.find((o) => o.id === params[0] && o.userId === me().id);
  return order ? stripOrder(order) : notFound('Order');
});

route('POST', '/orders', ({ db, me, body }) => {
  const user = me();
  const { items, shipping } = parse(createOrderSchema, body);
  const lines = items.map((item) => {
    const product = db.products.find((p) => p.id === item.productId) ?? notFound('Product');
    if (product.stock < item.quantity)
      fail(400, 'bad_request', `Only ${product.stock} × ${product.name} left in stock`);
    return {
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      quantity: item.quantity,
    };
  });
  const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
  const shippingCents = shippingFor(subtotalCents);
  const order: StoredOrder = {
    id: newId(),
    userId: user.id,
    items: lines,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    status: 'pending',
    shipping,
    createdAt: nowIso(),
  };
  db.orders.push(order);
  return { order: stripOrder(order), payment: { provider: 'demo', orderId: order.id } };
});

route('POST', '/orders/:id/confirm', ({ db, me, params }) => {
  const order =
    db.orders.find((o) => o.id === params[0] && o.userId === me().id) ?? notFound('Order');
  if (order.status === 'pending') {
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) product.stock = Math.max(0, product.stock - item.quantity);
    }
    order.status = 'paid';
  }
  return stripOrder(order);
});

route('POST', '/predictions', ({ body }) => predictConditions(parse(predictSchema, body).symptoms));

/* ------------------------------------------------------------ transport */

const MUTATING = new Set(['POST', 'PATCH', 'DELETE']);

export const demoTransport: Transport = async ({ method, path, query, body, token }) => {
  await sleep(LATENCY_MS);
  dbPromise ??= load();
  const db = await dbPromise;

  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue;
    const match = pattern.exec(path);
    if (!match) continue;

    const me = () => {
      const id = token?.startsWith('demo.') ? token.slice(5) : undefined;
      const user = id ? userById(db, id) : undefined;
      if (!user) fail(401, 'unauthorized', 'Authentication required');
      return user!;
    };
    const ctx: Ctx = {
      db,
      params: match.slice(1).map(decodeURIComponent),
      query: Object.fromEntries(
        Object.entries(query ?? {}).map(([k, v]) => [k, v === undefined ? undefined : String(v)]),
      ),
      body,
      me,
      requireRole: (role) => {
        const user = me();
        if (user.role !== role) fail(403, 'forbidden', 'You do not have permission to do that');
        return user;
      },
    };
    // Work on a JSON snapshot so callers can never mutate the store by reference.
    const result = handler(ctx);
    if (MUTATING.has(method)) await save(db);
    return result === undefined ? undefined : JSON.parse(JSON.stringify(result));
  }
  return fail(404, 'not_found', `Route ${method} ${path} not found`);
};
