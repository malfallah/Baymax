import { Schema, model } from 'mongoose';
import { PRODUCT_CATEGORIES } from '@baymax/shared';

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES.map((c) => c.key),
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    activeIngredient: { type: String, required: true },
    usage: { type: String, required: true },
    priceCents: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 5 },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', brand: 'text', activeIngredient: 'text' });

export const ProductModel = model('Product', productSchema);
