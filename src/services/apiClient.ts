/**
 * API client — the single switch between mock data and a real backend.
 *
 * Today every service resolves from the in-browser Zustand store (mock mode).
 * To connect a .NET / Node / Python backend, set VITE_API_URL and replace the
 * body of each service method with `http.get(...)` / `http.post(...)` — page
 * components do not need to change.
 */
import { useUI } from '@/store/useUI';

export const API_URL = import.meta.env.VITE_API_URL as string | undefined;
export const USE_MOCK = !API_URL;

const latency = () => (useUI.getState().simulateSlowNetwork ? 1400 : 250 + Math.random() * 250);
export const mock = <T,>(value: T | (() => T)): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(typeof value === 'function' ? (value as () => T)() : value), latency()));

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
export const http = {
  get: <T,>(p: string) => request<T>('GET', p),
  post: <T,>(p: string, b?: unknown) => request<T>('POST', p, b),
  put: <T,>(p: string, b?: unknown) => request<T>('PUT', p, b),
  del: <T,>(p: string) => request<T>('DELETE', p),
};
