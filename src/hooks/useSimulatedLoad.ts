import { useEffect, useState } from 'react';
import { useUI } from '@/store/useUI';
/** Shows skeletons briefly on first mount — mirrors real API latency. */
export function useSimulatedLoad(key: unknown = 0, ms = 450) {
  const slow = useUI((s) => s.simulateSlowNetwork);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), slow ? 1500 : ms);
    return () => clearTimeout(t);
  }, [key, ms, slow]);
  return loading;
}
