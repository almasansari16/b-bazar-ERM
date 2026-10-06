import { useEffect, useState } from 'react';
export function useCountdown(target: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, target - now);
  return { d: Math.floor(diff / 864e5), h: Math.floor((diff / 3.6e6) % 24), m: Math.floor((diff / 6e4) % 60), s: Math.floor((diff / 1000) % 60) };
}
