import { Schema, model, type InferSchemaType } from 'mongoose';

const appointmentSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    slot: { type: Schema.Types.ObjectId, ref: 'TimeSlot', required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    reason: { type: String, required: true },
    notes: String,
  },
  { timestamps: true },
);

export type AppointmentRecord = InferSchemaType<typeof appointmentSchema>;
export const AppointmentModel = model('Appointment', appointmentSchema);
