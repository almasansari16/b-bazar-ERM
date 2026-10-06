import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeStorage } from './persist';

interface WishlistState { ids: string[]; toggle: (id: string) => boolean; remove: (id: string) => void; has: (id: string) => boolean }
export const useWishlist = create<WishlistState>()(persist((set, get) => ({
  ids: ['P10002', 'P10028', 'P10046'],
  toggle: (id) => {
    const on = !get().ids.includes(id);
    set((s) => ({ ids: on ? [id, ...s.ids] : s.ids.filter((x) => x !== id) }));
    return on;
  },
  remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
  has: (id) => get().ids.includes(id),
}), { name: 'bbazar-wishlist', storage: safeStorage, partialize: (s) => ({ ids: s.ids }) }));
