import type { Order } from '@baymax/shared';
import type { BadgeTone } from '../ui';

export const ORDER_STATUS: Record<Order['status'], { label: string; tone: BadgeTone }> = {
  pending: { label: 'Awaiting payment', tone: 'warning' },
  paid: { label: 'Processing', tone: 'primary' },
  shipped: { label: 'Shipped', tone: 'primary' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};
