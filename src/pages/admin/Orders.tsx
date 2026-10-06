import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { OrderDrawer } from '@/components/dashboard/OrderDrawer';
import { Card, Tabs } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PAYMENT_NAME } from '@/components/customer/OrderTimeline';
import { formatPKR, formatDateTime } from '@/utils/format';
import { downloadCSV } from '@/utils/csv';
import { CITIES } from '@/utils/delivery';
import type { Order } from '@/types';

type Tab = 'all' | 'open' | 'transit' | 'delivered' | 'issues';
const MATCH: Record<Tab, (o: Order) => boolean> = { all: () => true, open: (o) => ['pending', 'confirmed', 'processing', 'packed'].includes(o.status), transit: (o) => ['shipped', 'out_for_delivery'].includes(o.status), delivered: (o) => o.status === 'delivered', issues: (o) => ['cancelled', 'refunded'].includes(o.status) };

export default function AdminOrders() {
  usePageMeta('Orders · Admin');
  const orders = useMarket((s) => s.orders);
  const [params] = useSearchParams();
  const loading = useSimulatedLoad('aord', 450);
  const [tab, setTab] = useState<Tab>('all');
  const [city, setCity] = useState('');
  const [pay, setPay] = useState('');
  const [view, setView] = useState<Order | null>(null);
  const q = params.get('q') ?? '';
  const list = useMemo(() => orders.filter((o) => MATCH[tab](o) && (!city || o.address.city === city) && (!pay || o.payment === pay) && (!q || `${o.id} ${o.customerName}`.toLowerCase().includes(q.toLowerCase()))), [orders, tab, city, pay, q]);
  const cols: Column<Order>[] = [
    { key: 'id', header: 'Order ID', primary: true, render: (o) => <span className="font-mono text-xs font-bold text-brand-700">{o.id}</span>, sortValue: (o) => o.id },
    { key: 'customer', header: 'Customer', render: (o) => <div><p className="font-medium">{o.customerName}</p><p className="text-xs text-ink-soft">{o.address.city}</p></div>, sortValue: (o) => o.customerName },
    { key: 'seller', header: 'Seller', render: (o) => <span className="text-xs">{[...new Set(o.items.map((i) => i.sellerName))].join(', ')}</span> },
    { key: 'products', header: 'Products', render: (o) => <span className="line-clamp-1 max-w-[180px] text-xs text-ink-soft">{o.items.map((i) => i.title).join(', ')}</span>, defaultHidden: false },
    { key: 'amount', header: 'Amount', align: 'right', render: (o) => <b className="tabular-nums">{formatPKR(o.total)}</b>, sortValue: (o) => o.total },
    { key: 'payment', header: 'Payment', render: (o) => <div className="text-xs"><p>{PAYMENT_NAME[o.payment]}</p><StatusBadge status={o.paymentStatus} /></div>, sortValue: (o) => o.payment },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} />, sortValue: (o) => o.status },
    { key: 'date', header: 'Date', render: (o) => <span className="text-xs text-ink-soft">{formatDateTime(o.createdAt)}</span>, sortValue: (o) => o.createdAt },
  ];
  return (
    <>
      <PageHeader title="Orders" subtitle="Every order across all sellers — full lifecycle view" actions={<Button variant="outline" onClick={() => { downloadCSV('marketplace-orders.csv', list.map((o) => ({ id: o.id, customer: o.customerName, city: o.address.city, total: o.total, payment: o.payment, status: o.status, date: o.createdAt }))); toast.success('Orders exported.'); }}><Download className="h-4 w-4" />Export CSV</Button>} />
      <Card>
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={(['all', 'open', 'transit', 'delivered', 'issues'] as Tab[]).map((t) => ({ value: t, label: { all: 'All', open: 'Open', transit: 'In Transit', delivered: 'Delivered', issues: 'Cancelled & Refunded' }[t], count: orders.filter(MATCH[t]).length }))} />
        <DataTable data={list} columns={cols} rowKey={(o) => o.id} loading={loading} searchKeys={(o) => `${o.id} ${o.customerName} ${o.items.map((i) => `${i.title} ${i.sellerName}`).join(' ')}`} searchPlaceholder="Search order, customer, seller" onRowClick={setView}
          toolbar={<><Select aria-label="City" value={city} onChange={(e) => setCity(e.target.value)} className="h-10 w-36"><option value="">All cities</option>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select><Select aria-label="Payment" value={pay} onChange={(e) => setPay(e.target.value)} className="h-10 w-40"><option value="">All payments</option>{Object.entries(PAYMENT_NAME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></>}
          rowActions={(o) => <Button size="xs" variant="outline" onClick={() => setView(o)}>Manage</Button>} />
      </Card>
      <OrderDrawer order={view} onClose={() => setView(null)} scope="admin" />
    </>
  );
}
