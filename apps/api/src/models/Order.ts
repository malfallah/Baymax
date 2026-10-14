import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        _id: false,
        productId: { type: String, required: true },
        name: { type: String, required: true },
        priceCents: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    subtotalCents: { type: Number, required: true },
    shippingCents: { type: Number, required: true },
    totalCents: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shipping: {
      fullName: String,
      line1: String,
      city: String,
      phone: String,
    },
    paymentProvider: { type: String, enum: ['stripe', 'demo'], required: true },
    paymentIntentId: String,
  },
  { timestamps: true },
);

export const OrderModel = model('Order', orderSchema);
