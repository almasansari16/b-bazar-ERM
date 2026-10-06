import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Search, Truck, ChevronRight } from 'lucide-react';
import { useMarket } from '@/store/useMarket';
import { useAuth } from '@/store/useAuth';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Tabs, EmptyState, Skeleton, Breadcrumb } from '@/components/ui/Display';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/Form';
import { Button, LinkButton } from '@/components/ui/Button';
import { SmartImage } from '@/components/common/SmartImage';
import { OrderTimeline } from '@/components/customer/OrderTimeline';
import { formatDate, formatPKR } from '@/utils/format';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';

type Tab = 'all' | 'active' | 'shipped' | 'delivered' | 'cancelled';
const GROUP: Record<Tab, OrderStatus[]> = { all: [], active: ['pending', 'confirmed', 'processing', 'packed'], shipped: ['shipped', 'out_for_delivery'], delivered: ['delivered'], cancelled: ['cancelled', 'refunded'] };

export default function Orders() {
  usePageMeta('My Orders');
  const user = useAuth((s) => s.user);
  const all = useMarket((s) => s.orders);
  const loading = useSimulatedLoad('orders', 400);
  const [tab, setTab] = useState<Tab>('all');
  const [track, setTrack] = useState('');
  const nav = useNavigate();
  const mine = useMemo(() => all.filter((o) => o.customerId === (user?.id ?? 'C1001')), [all, user]);
  const list = mine.filter((o) => tab === 'all' || GROUP[tab].includes(o.status));

  return (
    <div className="container-x py-5 sm:py-6">
      <Breadcrumb items={[{ label: 'Account', to: '/account' }, { label: 'My Orders' }]} />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold">My Orders</h1>
        <form className="flex w-full gap-2 sm:w-auto" onSubmit={(e) => { e.preventDefault(); const o = all.find((x) => x.id.toLowerCase() === track.trim().toLowerCase() || x.tracking.toLowerCase() === track.trim().toLowerCase()); if (o) nav(`/orders/${o.id}`); else toast.error('No order found with that number. Check and try again.'); }}>
          <Input value={track} onChange={(e) => setTrack(e.target.value)} placeholder="Track by order or tracking no." icon={<Search className="h-4 w-4" />} aria-label="Order or tracking number" className="sm:w-72" />
          <Button type="submit" variant="secondary"><Truck className="h-4 w-4" />Track</Button>
        </form>
      </div>
      <div className="mt-5 rounded-2xl border border-line bg-white">
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={(['all', 'active', 'shipped', 'delivered', 'cancelled'] as Tab[]).map((t) => ({ value: t, label: { all: 'All', active: 'To Ship', shipped: 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled / Returned' }[t], count: t === 'all' ? mine.length : mine.filter((o) => GROUP[t].includes(o.status)).length }))} />
        <div className="space-y-4 p-4 sm:p-5">
          {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />) : list.length === 0 ? (
            <EmptyState icon={<Package className="h-7 w-7" />} title="No orders here yet" message="When you place an order it will show up here so you can track it." action={<LinkButton to="/">Start Shopping</LinkButton>} />
          ) : list.map((o) => (
            <article key={o.id} className="overflow-hidden rounded-xl border border-line">
              <header className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-slate-50/70 px-4 py-3 text-xs">
                <span><span className="text-ink-soft">Order </span><Link to={`/orders/${o.id}`} className="font-mono font-bold text-brand-700 hover:underline">{o.id}</Link></span>
                <span className="text-ink-soft">Placed {formatDate(o.createdAt)}</span>
                <span className="text-ink-soft">Total <b className="text-ink">{formatPKR(o.total)}</b></span>
                <span className="ml-auto"><StatusBadge status={o.status} /></span>
              </header>
              <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                <ul className="flex-1 space-y-3">
                  {o.items.map((it) => (
                    <li key={it.productId} className="flex items-center gap-3">
                      <SmartImage src={it.image} alt={it.title} icon={it.icon} className="h-14 w-14 shrink-0 rounded-lg" />
                      <div className="min-w-0"><Link to={`/product/${it.productId}`} className="line-clamp-1 text-sm font-semibold hover:text-brand-700">{it.title}</Link><p className="text-xs text-ink-soft">{it.sellerName} · Qty {it.qty}{it.variant && ` · ${it.variant}`}</p></div>
                    </li>
                  ))}
                </ul>
                <div className="md:w-[380px]"><OrderTimeline order={o} orientation="horizontal" /></div>
                <LinkButton to={`/orders/${o.id}`} variant="outline" size="sm" className="shrink-0">{o.status === 'delivered' ? 'View & Review' : 'Track'}<ChevronRight className="h-4 w-4" /></LinkButton>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
