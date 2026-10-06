import { useMemo } from 'react';
import { Users, Repeat, Wallet, MapPin } from 'lucide-react';
import { useSeller } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard } from '@/components/dashboard';
import { Card } from '@/components/ui/Display';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { formatPKR, formatDate } from '@/utils/format';
import { lifetimeSeller } from '@/utils/analytics';

interface Row { id: string; name: string; city: string; orders: number; spent: number; last: string; email: string }
export default function SellerCustomers() {
  usePageMeta('Customers · Seller Center');
  const { orders, sellerId } = useSeller();
  const customers = useMarket((s) => s.customers);
  const all = useMarket((s) => s.orders);
  const loading = useSimulatedLoad('scust', 400);
  const rows = useMemo<Row[]>(() => {
    const m = new Map<string, Row>();
    orders.forEach((o) => {
      const c = customers.find((x) => x.id === o.customerId);
      const r = m.get(o.customerId) ?? { id: o.customerId, name: o.customerName, city: o.address.city, orders: 0, spent: 0, last: o.createdAt, email: c?.email ?? '' };
      r.orders += 1; r.spent += o.sellerTotal; if (o.createdAt > r.last) r.last = o.createdAt;
      m.set(o.customerId, r);
    });
    return [...m.values()].sort((a, b) => b.spent - a.spent);
  }, [orders, customers]);
  const repeat = rows.filter((r) => r.orders > 1).length;
  const life = lifetimeSeller(all, sellerId);
  const cols: Column<Row>[] = [
    { key: 'name', header: 'Customer', primary: true, render: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} size="sm" /><div><p className="font-medium">{r.name}</p><p className="text-xs text-ink-soft">{r.email}</p></div></div>, sortValue: (r) => r.name },
    { key: 'city', header: 'City', render: (r) => <span className="flex items-center gap-1 text-sm"><MapPin className="h-3.5 w-3.5 text-ink-soft" />{r.city}</span>, sortValue: (r) => r.city },
    { key: 'orders', header: 'Orders', align: 'right', render: (r) => <span className="tabular-nums">{r.orders}</span>, sortValue: (r) => r.orders },
    { key: 'spent', header: 'Total Spent', align: 'right', render: (r) => <b className="tabular-nums">{formatPKR(r.spent)}</b>, sortValue: (r) => r.spent },
    { key: 'last', header: 'Last Order', render: (r) => <span className="text-ink-soft">{formatDate(r.last)}</span>, sortValue: (r) => r.last },
    { key: 'segment', header: 'Segment', render: (r) => <Badge tone={r.orders > 2 ? 'violet' : r.orders > 1 ? 'brand' : 'neutral'}>{r.orders > 2 ? 'Loyal' : r.orders > 1 ? 'Returning' : 'New'}</Badge> },
  ];
  return (
    <>
      <PageHeader title="Customers" subtitle="People who bought from your store" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard loading={loading} label="Total Customers" value={life.customers.toLocaleString()} icon={<Users className="h-5 w-5" />} />
        <KpiCard loading={loading} label="Recent Buyers" value={rows.length} icon={<Users className="h-5 w-5" />} tone="accent" hint="Last 30 days" />
        <KpiCard loading={loading} label="Repeat Rate" value={`${Math.round((repeat / Math.max(1, rows.length)) * 100)}%`} icon={<Repeat className="h-5 w-5" />} tone="violet" />
        <KpiCard loading={loading} label="Avg. Spend" value={formatPKR(rows.reduce((n, r) => n + r.spent, 0) / Math.max(1, rows.length))} icon={<Wallet className="h-5 w-5" />} tone="success" />
      </div>
      <Card className="mt-6"><DataTable data={rows} columns={cols} rowKey={(r) => r.id} loading={loading} searchKeys={(r) => `${r.name} ${r.city} ${r.email}`} searchPlaceholder="Search customers" selectable={false} /></Card>
    </>
  );
}
