import { z } from 'zod';
import {
  ACTIVITY_LEVELS,
  BLOOD_TYPES,
  PRODUCT_CATEGORIES,
  SPECIALTY_KEYS,
  ARTICLE_CATEGORIES,
} from './constants';

const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Must be a valid date');
const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Enter a valid email address'));
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const patientProfileSchema = z.object({
  dateOfBirth: isoDate.optional(),
  sex: z.enum(['female', 'male']).optional(),
  nationality: z.string().trim().max(60).optional(),
  address: z.string().trim().max(200).optional(),
  heightCm: z.number().min(40).max(260).optional(),
  weightKg: z.number().min(2).max(400).optional(),
  bloodType: z.enum(BLOOD_TYPES).optional(),
  activityLevel: z.enum(ACTIVITY_LEVELS).optional(),
  smoker: z.boolean().default(false),
  allergies: z.array(z.string().trim().min(1).max(60)).max(50).default([]),
  conditions: z
    .array(z.object({ name: trimmed(1, 80, 'Condition'), since: isoDate.optional() }))
    .max(50)
    .default([]),
  vaccines: z
    .array(z.object({ name: trimmed(1, 80, 'Vaccine'), date: isoDate.optional() }))
    .max(50)
    .default([]),
  surgeries: z
    .array(
      z.object({
        name: trimmed(1, 80, 'Surgery'),
        date: isoDate.optional(),
        recovered: z.boolean().default(true),
      }),
    )
    .max(50)
    .default([]),
  familyHistory: z
    .array(
      z.object({ condition: trimmed(1, 80, 'Condition'), relation: trimmed(1, 40, 'Relation') }),
    )
    .max(50)
    .default([]),
  medications: z
    .array(
      z.object({
        name: trimmed(1, 80, 'Medication'),
        dosage: z.string().trim().max(40),
        frequency: z.string().trim().max(40),
      }),
    )
    .max(50)
    .default([]),
});

export const doctorProfileSchema = z.object({
  specialty: z.enum(SPECIALTY_KEYS),
  bio: z.string().trim().max(1000).default(''),
  clinic: trimmed(2, 120, 'Clinic'),
  city: trimmed(2, 80, 'City'),
  yearsOfExperience: z.number().int().min(0).max(70),
  education: trimmed(2, 160, 'Education'),
  consultationFeeCents: z.number().int().min(0).max(1_000_000),
  languages: z.array(z.string().trim().min(2).max(30)).min(1).max(10).default(['English']),
});

const accountFields = {
  fullName: trimmed(2, 80, 'Full name'),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().max(30).optional(),
};

export const registerPatientSchema = z.object({
  ...accountFields,
  role: z.literal('patient'),
  patient: patientProfileSchema.default({
    smoker: false,
    allergies: [],
    conditions: [],
    vaccines: [],
    surgeries: [],
    familyHistory: [],
    medications: [],
  }),
});

export const registerDoctorSchema = z.object({
  ...accountFields,
  role: z.literal('doctor'),
  doctor: doctorProfileSchema,
});

export const registerSchema = z.discriminatedUnion('role', [
  registerPatientSchema,
  registerDoctorSchema,
]);

export const updateMeSchema = z.object({
  fullName: trimmed(2, 80, 'Full name').optional(),
  phone: z.string().trim().max(30).optional(),
  patient: patientProfileSchema.partial().optional(),
  doctor: doctorProfileSchema.partial().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export const createSlotsSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm'),
    durationMinutes: z.number().int().min(10).max(240).default(30),
    /** Minutes from UTC of the doctor's device, so local times are stored correctly. */
    timezoneOffsetMinutes: z.number().int().min(-840).max(840).default(0),
  })
  .refine((v) => v.startTime < v.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export const bookAppointmentSchema = z.object({
  slotId: z.string().min(1),
  reason: trimmed(3, 500, 'Reason'),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['cancelled', 'completed']),
  notes: z.string().trim().max(2000).optional(),
});

export const createQuestionSchema = z.object({
  title: trimmed(10, 160, 'Title'),
  body: trimmed(10, 4000, 'Details'),
  tags: z.array(z.string().trim().toLowerCase().min(2).max(24)).max(5).default([]),
});

export const createAnswerSchema = z.object({ body: trimmed(2, 4000, 'Answer') });

export const createArticleSchema = z.object({
  title: trimmed(10, 160, 'Title'),
  summary: trimmed(20, 300, 'Summary'),
  body: trimmed(100, 20000, 'Body'),
  category: z.enum(ARTICLE_CATEGORIES.map((c) => c.key) as [string, ...string[]]),
});

export const productQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.enum(PRODUCT_CATEGORIES.map((c) => c.key) as [string, ...string[]]).optional(),
});

export const shippingSchema = z.object({
  fullName: trimmed(2, 80, 'Full name'),
  line1: trimmed(4, 160, 'Address'),
  city: trimmed(2, 80, 'City'),
  phone: trimmed(6, 30, 'Phone'),
});

export const createOrderSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1, 'Your cart is empty')
    .max(50),
  shipping: shippingSchema,
});

export const predictSchema = z.object({
  symptoms: z.array(z.string().min(1).max(60)).min(1, 'Select at least one symptom').max(30),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterPatientInput = z.input<typeof registerPatientSchema>;
export type RegisterDoctorInput = z.input<typeof registerDoctorSchema>;
export type UpdateMeInput = z.input<typeof updateMeSchema>;
export type CreateSlotsInput = z.input<typeof createSlotsSchema>;
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CreateQuestionInput = z.input<typeof createQuestionSchema>;
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ShippingInput = z.infer<typeof shippingSchema>;
export type PredictInput = z.infer<typeof predictSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
