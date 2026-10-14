import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  DEMO_DOCTOR_EMAIL,
  DEMO_PASSWORD,
  DEMO_PATIENT_EMAIL,
  type Appointment,
  type Doctor,
  type TimeSlot,
} from '@baymax/shared';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123';

const { createApp } = await import('../src/app');
const { connectDatabase, disconnectDatabase } = await import('../src/db');
const { seedDatabase } = await import('../src/seed/seedData');

let mongo: MongoMemoryServer;
const app = createApp();

const login = async (email: string) => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: DEMO_PASSWORD })
    .expect(200);
  return res.body.token as string;
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  await seedDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
  await mongo?.stop();
});

describe('health', () => {
  it('reports status', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', payments: 'demo' });
  });
});

describe('auth', () => {
  it('registers a patient and returns a token without leaking the password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        role: 'patient',
        fullName: 'Test Person',
        email: 'Test@Example.com',
        password: 'Secret123',
      })
      .expect(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user).toMatchObject({ role: 'patient', email: 'test@example.com' });
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  it('rejects duplicate emails and weak passwords', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        role: 'patient',
        fullName: 'Again',
        email: 'test@example.com',
        password: 'Secret123',
      })
      .expect(409);
    const weak = await request(app)
      .post('/api/v1/auth/register')
      .send({ role: 'patient', fullName: 'Weak', email: 'weak@example.com', password: 'short' })
      .expect(422);
    expect(weak.body.error.details.fields.password).toBeDefined();
  });

  it('rejects bad credentials with a generic message', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: DEMO_PATIENT_EMAIL, password: 'nope' })
      .expect(401);
    expect(res.body.error.message).toBe('Incorrect email or password');
  });

  it('requires a token for /me and updates the profile', async () => {
    await request(app).get('/api/v1/me').expect(401);
    const token = await login(DEMO_PATIENT_EMAIL);
    const res = await request(app)
      .patch('/api/v1/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '+1 555 0000', patient: { weightKg: 64 } })
      .expect(200);
    expect(res.body.phone).toBe('+1 555 0000');
    expect(res.body.patient.weightKg).toBe(64);
    expect(res.body.patient.bloodType).toBe('O+');
  });
});

describe('booking flow', () => {
  let patientToken: string;
  let doctorToken: string;
  let doctor: Doctor;
  let slot: TimeSlot;
  let appointment: Appointment;

  beforeAll(async () => {
    patientToken = await login(DEMO_PATIENT_EMAIL);
    doctorToken = await login(DEMO_DOCTOR_EMAIL);
  });

  it('lists doctors by specialty with next availability', async () => {
    const res = await request(app).get('/api/v1/doctors?specialty=dermatology').expect(200);
    expect(res.body.length).toBeGreaterThan(0);
    doctor = res.body[0];
    expect(doctor.specialty).toBe('dermatology');
    expect(doctor.nextAvailable).toBeTypeOf('string');
  });

  it('books an available slot and prevents double booking', async () => {
    const slots = await request(app).get(`/api/v1/doctors/${doctor.id}/slots`).expect(200);
    slot = slots.body[0];
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ slotId: slot.id, reason: 'Skin check' })
      .expect(201);
    appointment = res.body;
    expect(appointment.doctor.id).toBe(doctor.id);
    await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ slotId: slot.id, reason: 'Skin check again' })
      .expect(409);
  });

  it('only lets patients book', async () => {
    await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ slotId: slot.id, reason: 'Not allowed' })
      .expect(403);
  });

  it('frees the slot when the patient cancels', async () => {
    await request(app)
      .patch(`/api/v1/appointments/${appointment.id}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ status: 'cancelled' })
      .expect(200);
    const slots = await request(app).get(`/api/v1/doctors/${doctor.id}/slots`).expect(200);
    expect(slots.body.map((s: TimeSlot) => s.id)).toContain(slot.id);
  });

  it('lets a doctor publish availability and see stats', async () => {
    const date = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    const created = await request(app)
      .post('/api/v1/me/slots')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ date, startTime: '09:00', endTime: '10:00', durationMinutes: 20 })
      .expect(201);
    expect(created.body).toHaveLength(3);
    await request(app)
      .post('/api/v1/me/slots')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ date, startTime: '09:00', endTime: '10:00', durationMinutes: 20 })
      .expect(400);
    const stats = await request(app)
      .get('/api/v1/me/stats')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);
    expect(stats.body.upcomingAppointments).toBeGreaterThan(0);
  });
});

describe('community', () => {
  it('lists articles and lets users ask and answer questions', async () => {
    const articles = await request(app).get('/api/v1/articles').expect(200);
    expect(articles.body.length).toBeGreaterThan(0);

    const token = await login(DEMO_PATIENT_EMAIL);
    const q = await request(app)
      .post('/api/v1/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'How much water should I drink daily?',
        body: 'Is eight glasses a day really the rule?',
        tags: ['hydration'],
      })
      .expect(201);
    const doctorToken = await login(DEMO_DOCTOR_EMAIL);
    const answered = await request(app)
      .post(`/api/v1/questions/${q.body.id}/answers`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ body: 'Drink to thirst and aim for pale yellow urine.' })
      .expect(201);
    expect(answered.body.answers[0].author.role).toBe('doctor');
  });

  it('returns 404 for malformed ids', async () => {
    await request(app).get('/api/v1/articles/not-an-id').expect(404);
  });
});

describe('pharmacy', () => {
  it('prices orders on the server and decrements stock on confirmation', async () => {
    const token = await login(DEMO_PATIENT_EMAIL);
    const products = await request(app).get('/api/v1/products?category=vitamins').expect(200);
    const product = products.body[0];
    const created = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: product.id, quantity: 2 }],
        shipping: {
          fullName: 'Alex Morgan',
          line1: '742 Valencia St',
          city: 'San Francisco',
          phone: '+1 415 555 0199',
        },
      })
      .expect(201);
    expect(created.body.payment.provider).toBe('demo');
    expect(created.body.order.subtotalCents).toBe(product.priceCents * 2);

    const confirmed = await request(app)
      .post(`/api/v1/orders/${created.body.order.id}/confirm`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(confirmed.body.status).toBe('paid');
    const after = await request(app).get(`/api/v1/products/${product.id}`).expect(200);
    expect(after.body.stock).toBe(product.stock - 2);
  });
});

describe('symptom checker', () => {
  it('predicts conditions without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/predictions')
      .send({ symptoms: ['itching', 'skin_rash', 'nodal_skin_eruptions'] })
      .expect(200);
    expect(res.body.candidates[0].disease).toBe('Fungal infection');
    expect(res.body.disclaimer).toBeTypeOf('string');
  });

  it('validates the request', async () => {
    await request(app).post('/api/v1/predictions').send({ symptoms: [] }).expect(422);
  });
});
