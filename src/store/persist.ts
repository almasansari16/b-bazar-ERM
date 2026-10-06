import { createJSONStorage } from 'zustand/middleware';
/** localStorage wrapper that never throws (private mode, blocked storage, sandboxed previews). */
const memory = new Map<string, string>();
export const safeStorage = createJSONStorage(() => ({
  getItem: (k: string) => { try { return localStorage.getItem(k); } catch { return memory.get(k) ?? null; } },
  setItem: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { memory.set(k, v); } },
  removeItem: (k: string) => { try { localStorage.removeItem(k); } catch { memory.delete(k); } },
}));
