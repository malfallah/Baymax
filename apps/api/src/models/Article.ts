import { Schema, model } from 'mongoose';

const articleSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    body: { type: String, required: true },
    category: { type: String, required: true, index: true },
    readMinutes: { type: Number, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true },
);

articleSchema.index({ title: 'text', summary: 'text', body: 'text' });

export const ArticleModel = model('Article', articleSchema);
