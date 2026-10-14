import { Schema, model } from 'mongoose';

const answerSchema = new Schema(
  {
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const questionSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    tags: { type: [String], default: [], index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true },
);

questionSchema.index({ title: 'text', body: 'text' });

export const QuestionModel = model('Question', questionSchema);
