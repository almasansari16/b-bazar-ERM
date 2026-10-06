import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeStorage } from './persist';

export interface CartLine { key: string; productId: string; qty: number; variant?: string; selected: boolean; addedAt: number }
interface CartState {
  lines: CartLine[];
  coupon: string | null;
  lastAdded: number;
  add: (productId: string, qty?: number, variant?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  toggle: (key: string) => void;
  toggleAll: (v: boolean) => void;
  applyCoupon: (code: string | null) => void;
  clearSelected: () => void;
  clear: () => void;
}
export const useCart = create<CartState>()(persist((set) => ({
  lines: [],
  coupon: null,
  lastAdded: 0,
  add: (productId, qty = 1, variant) => set((s) => {
    const key = `${productId}::${variant ?? ''}`;
    const existing = s.lines.find((l) => l.key === key);
    const lines = existing
      ? s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(10, l.qty + qty), selected: true } : l))
      : [{ key, productId, qty, variant, selected: true, addedAt: Date.now() }, ...s.lines];
    return { lines, lastAdded: Date.now() };
  }),
  setQty: (key, qty) => set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)) })),
  remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
  toggle: (key) => set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, selected: !l.selected } : l)) })),
  toggleAll: (v) => set((s) => ({ lines: s.lines.map((l) => ({ ...l, selected: v })) })),
  applyCoupon: (coupon) => set({ coupon }),
  clearSelected: () => set((s) => ({ lines: s.lines.filter((l) => !l.selected), coupon: null })),
  clear: () => set({ lines: [], coupon: null }),
}), { name: 'bbazar-cart', storage: safeStorage, partialize: (s) => ({ lines: s.lines, coupon: s.coupon }) }));

export const cartCount = (s: CartState) => s.lines.reduce((n, l) => n + l.qty, 0);
