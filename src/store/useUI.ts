import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeStorage } from './persist';

interface UIState {
  city: string;
  recentSearches: string[];
  compare: string[];
  viewed: string[];
  pushViewed: (id: string) => void;
  sellerSidebarCollapsed: boolean;
  adminSidebarCollapsed: boolean;
  simulateSlowNetwork: boolean;
  setCity: (c: string) => void;
  pushSearch: (q: string) => void;
  clearSearches: () => void;
  toggleCompare: (id: string) => void;
  setCollapsed: (which: 'seller' | 'admin', v: boolean) => void;
  setSlow: (v: boolean) => void;
}
export const useUI = create<UIState>()(persist((set) => ({
  city: 'Karachi',
  recentSearches: ['wireless earbuds', 'lawn suit', 'air fryer'],
  compare: [],
  viewed: ['P10001', 'P10013'],
  pushViewed: (id) => set((s) => ({ viewed: [id, ...s.viewed.filter((x) => x !== id)].slice(0, 12) })),
  sellerSidebarCollapsed: false,
  adminSidebarCollapsed: false,
  simulateSlowNetwork: false,
  setCity: (city) => set({ city }),
  pushSearch: (q) => set((s) => ({ recentSearches: [q, ...s.recentSearches.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6) })),
  clearSearches: () => set({ recentSearches: [] }),
  toggleCompare: (id) => set((s) => ({ compare: s.compare.includes(id) ? s.compare.filter((x) => x !== id) : [...s.compare, id].slice(-4) })),
  setCollapsed: (which, v) => set(which === 'seller' ? { sellerSidebarCollapsed: v } : { adminSidebarCollapsed: v }),
  setSlow: (simulateSlowNetwork) => set({ simulateSlowNetwork }),
}), { name: 'bbazar-ui', storage: safeStorage }));
