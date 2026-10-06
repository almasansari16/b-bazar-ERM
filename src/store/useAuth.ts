import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeStorage } from './persist';
import type { Role, User } from '@/types';

export const DEMO_PASSWORD = 'Demo@123';
export const DEMO_USERS: Record<Role, User> = {
  customer: { id: 'C1001', name: 'Ahmed Khan', email: 'customer@bbazar.com', role: 'customer', phone: '+92 300 1234567' },
  seller: { id: 'U-S1001', name: 'Faisal Mehmood', email: 'seller@bbazar.com', role: 'seller', sellerId: 'S1001' },
  admin: { id: 'U-A1', name: 'Nadia Hussain', email: 'admin@bbazar.com', role: 'admin' },
};

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => User | null;
  loginAs: (role: Role) => User;
  register: (name: string, email: string) => User;
  logout: () => void;
}
export const useAuth = create<AuthState>()(persist((set) => ({
  user: DEMO_USERS.customer,
  login: (email, password) => {
    const u = Object.values(DEMO_USERS).find((x) => x.email === email.trim().toLowerCase());
    if (!u || password !== DEMO_PASSWORD) return null;
    set({ user: u });
    return u;
  },
  loginAs: (role) => { set({ user: DEMO_USERS[role] }); return DEMO_USERS[role]; },
  register: (name, email) => { const u: User = { ...DEMO_USERS.customer, name, email }; set({ user: u }); return u; },
  logout: () => set({ user: null }),
}), { name: 'bbazar-auth', storage: safeStorage }));
