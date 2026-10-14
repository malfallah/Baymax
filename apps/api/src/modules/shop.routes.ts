import { Router } from 'express';
import {
  createOrderSchema,
  productQuerySchema,
  shippingFor,
  type PaymentIntentResult,
} from '@baymax/shared';
import { badRequest, notFound } from '../lib/errors';
import { assertId } from '../lib/ids';
import { toOrder, toProduct } from '../lib/serialize';
import { validate } from '../lib/validate';
import { currentUserId, requireAuth } from '../middleware/auth';
import { OrderModel } from '../models/Order';
import { ProductModel } from '../models/Product';
import { UserModel } from '../models/User';
import { createPaymentIntent, isPaymentSucceeded, paymentsEnabled } from '../services/payments';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const shopRouter = Router();

/* eslint-disable @typescript-eslint/no-explicit-any -- lean docs are shaped by serializers */
shopRouter.get('/products', async (req, res) => {
  const { q, category } = validate(productQuerySchema, req.query);
  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { brand: rx }, { activeIngredient: rx }];
  }
  const products = await ProductModel.find(filter).sort({ rating: -1, name: 1 }).lean<any[]>();
  res.json(products.map(toProduct));
});

shopRouter.get('/products/:id', async (req, res) => {
  const product = await ProductModel.findById(assertId(req.params.id, 'Product')).lean<any>();
  if (!product) throw notFound('Product');
  res.json(toProduct(product));
});

shopRouter.get('/orders', requireAuth, async (req, res) => {
  const orders = await OrderModel.find({ user: currentUserId(req) })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean<any[]>();
  res.json(orders.map(toOrder));
});

shopRouter.get('/orders/:id', requireAuth, async (req, res) => {
  const order = await OrderModel.findOne({
    _id: assertId(req.params.id, 'Order'),
    user: currentUserId(req),
  }).lean<any>();
  if (!order) throw notFound('Order');
  res.json(toOrder(order));
});

/** Creates a pending order with server-side pricing and returns how to pay for it. */
shopRouter.post('/orders', requireAuth, async (req, res) => {
  const { items, shipping } = validate(createOrderSchema, req.body);
  const userId = currentUserId(req);
  items.forEach((i) => assertId(i.productId, 'Product'));

  const products = await ProductModel.find({ _id: { $in: items.map((i) => i.productId) } });
  const lines = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw notFound('Product');
    if (product.stock < item.quantity)
      throw badRequest(`Only ${product.stock} × ${product.name} left in stock`);
    return {
      productId: product.id as string,
      name: product.name,
      priceCents: product.priceCents,
      quantity: item.quantity,
    };
  });
  const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
  const shippingCents = shippingFor(subtotalCents);

  const order = await OrderModel.create({
    user: userId,
    items: lines,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    shipping,
    paymentProvider: paymentsEnabled() ? 'stripe' : 'demo',
  });

  const payment: PaymentIntentResult = { provider: 'demo', orderId: order.id };
  if (paymentsEnabled()) {
    const user = await UserModel.findById(userId).lean();
    const intent = await createPaymentIntent(order.totalCents, order.id, user?.email ?? '');
    order.paymentIntentId = intent!.id;
    await order.save();
    Object.assign(payment, {
      provider: 'stripe',
      clientSecret: intent!.client_secret ?? undefined,
    });
  }
  res.status(201).json({ order: toOrder(order.toObject()), payment });
});

/** Marks an order paid once payment is verified and reserves the stock. */
shopRouter.post('/orders/:id/confirm', requireAuth, async (req, res) => {
  const order = await OrderModel.findOne({
    _id: assertId(req.params.id, 'Order'),
    user: currentUserId(req),
  });
  if (!order) throw notFound('Order');
  if (order.status === 'pending') {
    if (
      order.paymentProvider === 'stripe' &&
      !(await isPaymentSucceeded(order.paymentIntentId ?? ''))
    ) {
      throw badRequest('Payment has not completed yet');
    }
    for (const item of order.items) {
      const updated = await ProductModel.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );
      if (updated.modifiedCount === 0) throw badRequest(`${item.name} just sold out`);
    }
    order.status = 'paid';
    await order.save();
  }
  res.json(toOrder(order.toObject()));
});
