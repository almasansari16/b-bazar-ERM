import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Heart, Wallet, Gift, ChevronRight } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useMarket } from '@/store/useMarket';
import { useWishlist } from '@/store/useWishlist';
import { usePageMeta } from '@/hooks/usePageMeta';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SmartImage } from '@/components/common/SmartImage';
import { ProgressBar } from '@/components/ui/Display';
import { formatPKR, formatDate } from '@/utils/format';

export default function AccountHome() {
  usePageMeta('My Account');
  const user = useAuth((s) => s.user)!;
  const orders = useMarket((s) => s.orders).filter((o) => o.customerId === user.id);
  const customer = useMarket((s) => s.customers.find((c) => c.id === user.id));
  const wish = useWishlist((s) => s.ids.length);
  const pending = orders.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const points = customer?.rewardPoints ?? 0;
  const cards = [
    { label: 'Total Orders', value: orders.length, icon: Package, to: '/orders', tone: 'bg-brand-50 text-brand-600' },
    { label: 'Pending', value: pending, icon: Clock, to: '/orders', tone: 'bg-amber-50 text-amber-600' },
    { label: 'Delivered', value: delivered, icon: CheckCircle2, to: '/orders', tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Wishlist', value: wish, icon: Heart, to: '/wishlist', tone: 'bg-red-50 text-red-500' },
    { label: 'Wallet', value: formatPKR(customer?.wallet ?? 0), icon: Wallet, to: '/account/payments', tone: 'bg-accent-50 text-accent-600' },
  ];
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <p className="text-sm text-white/75">Assalam o Alaikum</p>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Welcome, {user.name.split(' ')[0]}!</h1>
        <div className="mt-4 max-w-sm">
          <p className="flex items-center justify-between text-xs"><span className="flex items-center gap-1"><Gift className="h-3.5 w-3.5" />Gold member · {points.toLocaleString()} points</span><span>{(5000 - points).toLocaleString()} to Platinum</span></p>
          <ProgressBar value={(points / 5000) * 100} className="mt-1.5 bg-white/20 [&>div]:bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, to, tone }) => (
          <Link key={label} to={to} className="rounded-xl border border-line bg-white p-4 transition hover:shadow-lift">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <p className="mt-3 text-xs font-semibold text-ink-soft">{label}</p>
            <p className="text-xl font-extrabold tabular-nums">{value}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="font-bold">Recent orders</h2><Link to="/orders" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link></div>
        <ul className="divide-y divide-line">
          {orders.slice(0, 4).map((o) => (
            <li key={o.id}><Link to={`/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
              <SmartImage src={o.items[0].image} alt="" icon={o.items[0].icon} className="h-12 w-12 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{o.items[0].title}{o.items.length > 1 && ` +${o.items.length - 1} more`}</p><p className="font-mono text-xs text-ink-soft">{o.id} · {formatDate(o.createdAt)}</p></div>
              <div className="hidden text-right sm:block"><p className="text-sm font-bold">{formatPKR(o.total)}</p></div>
              <StatusBadge status={o.status} /><ChevronRight className="h-4 w-4 text-ink-soft" />
            </Link></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
