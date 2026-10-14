import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { ACTIVITY_LEVELS, BLOOD_TYPES, SPECIALTY_KEYS } from '@baymax/shared';

const patientSchema = new Schema(
  {
    dateOfBirth: Date,
    sex: { type: String, enum: ['female', 'male'] },
    nationality: String,
    address: String,
    heightCm: Number,
    weightKg: Number,
    bloodType: { type: String, enum: BLOOD_TYPES },
    activityLevel: { type: String, enum: ACTIVITY_LEVELS },
    smoker: { type: Boolean, default: false },
    allergies: { type: [String], default: [] },
    conditions: { type: [{ _id: false, name: String, since: Date }], default: [] },
    vaccines: { type: [{ _id: false, name: String, date: Date }], default: [] },
    surgeries: {
      type: [{ _id: false, name: String, date: Date, recovered: Boolean }],
      default: [],
    },
    familyHistory: { type: [{ _id: false, condition: String, relation: String }], default: [] },
    medications: {
      type: [{ _id: false, name: String, dosage: String, frequency: String }],
      default: [],
    },
  },
  { _id: false },
);

const doctorSchema = new Schema(
  {
    specialty: { type: String, enum: SPECIALTY_KEYS, required: true, index: true },
    bio: { type: String, default: '' },
    clinic: { type: String, required: true },
    city: { type: String, required: true },
    yearsOfExperience: { type: Number, required: true },
    education: { type: String, required: true },
    consultationFeeCents: { type: Number, required: true },
    languages: { type: [String], default: ['English'] },
    rating: { type: Number, default: 5 },
    reviewsCount: { type: Number, default: 0 },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    role: { type: String, enum: ['patient', 'doctor'], required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    phone: String,
    avatarColor: { type: String, required: true },
    patient: { type: patientSchema, default: undefined },
    doctor: { type: doctorSchema, default: undefined },
    resetToken: {
      type: new Schema({ hash: String, expiresAt: Date }, { _id: false }),
      select: false,
      default: undefined,
    },
  },
  { timestamps: true },
);

userSchema.index({ fullName: 'text', 'doctor.clinic': 'text', 'doctor.city': 'text' });

export type UserRecord = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserRecord>;
export const UserModel = model('User', userSchema);
