import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, ShoppingBag, Store, Shield, RotateCcw, Gauge, X, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useAuth, DEMO_USERS, DEMO_PASSWORD } from '@/store/useAuth';
import { useMarket } from '@/store/useMarket';
import { useCart } from '@/store/useCart';
import { useUI } from '@/store/useUI';
import { Switch } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Overlay';
import type { Role } from '@/types';

const ROLES: { role: Role; label: string; icon: typeof Store; to: string; desc: string }[] = [
  { role: 'customer', label: 'Customer', icon: ShoppingBag, to: '/', desc: 'Shop, checkout, track' },
  { role: 'seller', label: 'Seller', icon: Store, to: '/seller/dashboard', desc: 'TechZone PK' },
  { role: 'admin', label: 'Admin', icon: Shield, to: '/admin/dashboard', desc: 'Marketplace control' },
];

/** Development/demo control panel — intentionally discreet (bottom-left). */
export function DemoPanel() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { user, loginAs } = useAuth();
  const reset = useMarket((s) => s.resetDemo);
  const clearCart = useCart((s) => s.clear);
  const { simulateSlowNetwork, setSlow } = useUI();
  const nav = useNavigate();
  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Open demo controls"
        className="fixed bottom-20 right-3 z-[60] flex h-9 items-center gap-1.5 rounded-full bg-ink/85 px-3 text-xs font-semibold text-white shadow-pop backdrop-blur transition hover:bg-ink md:bottom-4">
        <FlaskConical className="h-3.5 w-3.5" />Demo
      </button>
      {open && (
        <div role="dialog" aria-label="Demo controls" className="fixed bottom-32 right-3 z-[60] w-[300px] rounded-2xl border border-line bg-white p-4 shadow-pop animate-fade-in md:bottom-16">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold">Demo controls</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close demo controls" className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Switch role</p>
          <div className="grid gap-1.5">
            {ROLES.map(({ role, label, icon: Icon, to, desc }) => (
              <button key={role} type="button" onClick={() => { loginAs(role); setOpen(false); nav(to); toast.success(`Signed in as ${label} (${DEMO_USERS[role].email})`); }}
                className={cn('flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition', user?.role === role ? 'border-brand-600 bg-brand-50' : 'border-line hover:bg-muted')}>
                <Icon className="h-4 w-4 text-brand-600" />
                <span className="flex-1"><span className="block text-sm font-semibold">{label}</span><span className="text-xs text-ink-soft">{desc}</span></span>
                {user?.role === role && <span className="text-[10px] font-bold text-brand-700">ACTIVE</span>}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-muted p-2.5 text-[11px] text-ink-soft"><KeyRound className="mr-1 inline h-3 w-3" />All demo accounts use password <b className="text-ink">{DEMO_PASSWORD}</b></div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
            <span className="flex items-center gap-2 text-sm"><Gauge className="h-4 w-4 text-ink-soft" />Simulate slow network</span>
            <Switch checked={simulateSlowNetwork} onChange={setSlow} label="Simulate slow network" />
          </div>
          <button type="button" onClick={() => setConfirm(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><RotateCcw className="h-4 w-4" />Reset demo data</button>
        </div>
      )}
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} tone="danger" title="Reset demo data?" confirmLabel="Reset"
        message="This restores all products, orders, sellers and settings to the original demo state and empties your cart."
        onConfirm={() => { reset(); clearCart(); toast.success('Demo data restored'); }} />
    </>
  );
}
