import { Schema, model, type InferSchemaType } from 'mongoose';

const timeSlotSchema = new Schema(
  {
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: { type: String, enum: ['available', 'booked'], default: 'available' },
  },
  { timestamps: true },
);

timeSlotSchema.index({ doctor: 1, start: 1 }, { unique: true });
timeSlotSchema.index({ status: 1, start: 1 });

export type TimeSlotRecord = InferSchemaType<typeof timeSlotSchema>;
export const TimeSlotModel = model('TimeSlot', timeSlotSchema);
