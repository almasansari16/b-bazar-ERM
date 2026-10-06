import { useParams, Navigate } from 'react-router-dom';
import { Ticket, Gift, RotateCcw, Copy, Trophy, Star, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useAuth } from '@/store/useAuth';
import { useCart } from '@/store/useCart';
import { usePageMeta } from '@/hooks/usePageMeta';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, ProgressBar } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { formatDate, formatPKR } from '@/utils/format';

export default function Extras() {
  const { section } = useParams();
  if (section === 'coupons') return <Coupons />;
  if (section === 'rewards') return <Rewards />;
  if (section === 'returns') return <Returns />;
  return <Navigate to="/account" replace />;
}

function Coupons() {
  usePageMeta('My Coupons');
  const coupons = useMarket((s) => s.coupons).filter((c) => c.status === 'active' && !c.sellers.length);
  const apply = useCart((s) => s.applyCoupon);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Coupons</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {coupons.map((c) => (
          <div key={c.id} className="relative flex overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-brand-gradient p-3 text-center text-white">
              <span className="text-2xl font-extrabold">{c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? `Rs.${c.value}` : <Truck className="h-7 w-7" />}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">{c.type === 'free_shipping' ? 'Free ship' : 'Off'}</span>
            </div>
            <div className="absolute left-[106px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-canvas" aria-hidden="true" />
            <div className="flex-1 p-4">
              <p className="font-mono text-sm font-bold text-brand-700">{c.code}</p>
              <p className="text-sm">{c.description}</p>
              <p className="mt-1 text-xs text-ink-soft">Min. order {formatPKR(c.minOrder)} · Valid till {formatDate(c.end)}</p>
              <div className="mt-3 flex gap-2">
                <Button size="xs" onClick={() => { apply(c.code); toast.success(`${c.code} will be applied at checkout.`); }}>Use now</Button>
                <Button size="xs" variant="ghost" onClick={async () => { try { await navigator.clipboard.writeText(c.code); toast.success('Code copied.'); } catch { toast.info(c.code); } }}><Copy className="h-3.5 w-3.5" />Copy</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Rewards() {
  usePageMeta('Rewards');
  const user = useAuth((s) => s.user)!;
  const pts = useMarket((s) => s.customers.find((c) => c.id === user.id)?.rewardPoints ?? 0);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">B-Bazar Rewards</h1>
      <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-6 text-ink">
        <p className="flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4" />Gold Member</p>
        <p className="mt-1 text-4xl font-extrabold">{pts.toLocaleString()} <span className="text-lg">points</span></p>
        <p className="text-sm">Worth {formatPKR(pts / 2)} on your next order</p>
        <ProgressBar value={(pts / 5000) * 100} className="mt-4 bg-white/40 [&>div]:bg-ink" />
        <p className="mt-1 text-xs">{Math.max(0, 5000 - pts).toLocaleString()} points to Platinum (free express delivery)</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[['Earn', '1 point for every Rs. 100 spent', Star], ['Redeem', '2 points = Rs. 1 at checkout', Gift], ['Level up', 'Platinum unlocks free express delivery', Trophy]].map(([t, d, I]) => {
          const Icon = I as typeof Star;
          return <div key={t as string} className="rounded-2xl border border-line bg-white p-5"><Icon className="h-6 w-6 text-amber-500" /><p className="mt-3 font-bold">{t as string}</p><p className="text-sm text-ink-soft">{d as string}</p></div>;
        })}
      </div>
    </div>
  );
}

function Returns() {
  usePageMeta('Returns & Refunds');
  const user = useAuth((s) => s.user)!;
  const orders = useMarket((s) => s.orders);
  const returns = useMarket((s) => s.returns).filter((r) => orders.find((o) => o.id === r.orderId)?.customerId === user.id);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Returns & Refunds</h1>
      <div className="rounded-2xl border border-line bg-white">
        {returns.length === 0 ? <EmptyState icon={<RotateCcw className="h-7 w-7" />} title="No return requests" message="You can request a return from any delivered order within 7 days." /> : (
          <ul className="divide-y divide-line">{returns.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 p-5"><Ticket className="h-5 w-5 text-brand-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{r.product}</p><p className="text-xs text-ink-soft">{r.id} · Order {r.orderId} · {r.reason}</p></div><p className="text-sm font-bold">{formatPKR(r.amount)}</p><StatusBadge status={r.status} /></li>
          ))}</ul>
        )}
      </div>
    </div>
  );
}
