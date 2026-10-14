import type { Product } from '@baymax/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from './storage';

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const MAX_PER_ITEM = 10;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (product, quantity = 1) =>
        set(({ lines }) => {
          const existing = lines.find((l) => l.product.id === product.id);
          if (!existing)
            return {
              lines: [
                ...lines,
                { product, quantity: Math.min(quantity, MAX_PER_ITEM, product.stock) },
              ],
            };
          return {
            lines: lines.map((l) =>
              l.product.id === product.id
                ? { ...l, quantity: Math.min(l.quantity + quantity, MAX_PER_ITEM, product.stock) }
                : l,
            ),
          };
        }),
      setQuantity: (productId, quantity) =>
        set(({ lines }) => ({
          lines:
            quantity <= 0
              ? lines.filter((l) => l.product.id !== productId)
              : lines.map((l) =>
                  l.product.id === productId
                    ? { ...l, quantity: Math.min(quantity, MAX_PER_ITEM, l.product.stock) }
                    : l,
                ),
        })),
      remove: (productId) =>
        set(({ lines }) => ({ lines: lines.filter((l) => l.product.id !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'baymax.cart', storage: jsonStorage },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.product.priceCents * l.quantity, 0);
