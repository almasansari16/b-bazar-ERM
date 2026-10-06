import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, CheckCircle2, Package, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useSeller, type SellerOrder } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { OrderDrawer, NEXT_STATUS } from '@/components/dashboard/OrderDrawer';
import { Card, Tabs } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PAYMENT_NAME } from '@/components/customer/OrderTimeline';
import { formatPKR, formatDateTime } from '@/utils/format';
import { downloadCSV } from '@/utils/csv';
import type { Order, OrderStatus } from '@/types';

type Tab = 'all' | OrderStatus;
export default function SellerOrders() {
  usePageMeta('Orders · Seller Center');
  const { orders } = useSeller();
  const update = useMarket((s) => s.updateOrderStatus);
  const [params] = useSearchParams();
  const loading = useSimulatedLoad('sorders', 450);
  const [tab, setTab] = useState<Tab>('all');
  const [payment, setPayment] = useState('');
  const [date, setDate] = useState('all');
  const [drawer, setDrawer] = useState<Order | null>(null);
  const q = params.get('q') ?? '';

  const filtered = useMemo(() => orders.filter((o) => {
    if (tab !== 'all' && !(tab === 'shipped' ? ['shipped', 'out_for_delivery'].includes(o.status) : tab === 'confirmed' ? ['confirmed', 'processing'].includes(o.status) : o.status === tab)) return false;
    if (payment && o.payment !== payment) return false;
    if (date !== 'all') { const days = { today: 1, '7d': 7, '30d': 30 }[date] ?? 999; if (Date.now() - new Date(o.createdAt).getTime() > days * 864e5) return false; }
    return !q || `${o.id} ${o.customerName}`.toLowerCase().includes(q.toLowerCase());
  }), [orders, tab, payment, date, q]);

  const count = (s: OrderStatus[]) => orders.filter((o) => s.includes(o.status)).length;
  const cols: Column<SellerOrder>[] = [
    { key: 'id', header: 'Order ID', primary: true, render: (o) => <span className="font-mono text-xs font-bold text-brand-700">{o.id}</span>, sortValue: (o) => o.id },
    { key: 'customer', header: 'Customer', render: (o) => <div><p className="font-medium">{o.customerName}</p><p className="text-xs text-ink-soft">{o.address.city}</p></div>, sortValue: (o) => o.customerName },
    { key: 'products', header: 'Products', render: (o) => <span className="line-clamp-2 max-w-[220px] text-xs text-ink-soft">{o.items.map((i) => `${i.title} ×${i.qty}`).join(', ')}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (o) => <b className="tabular-nums">{formatPKR(o.sellerTotal)}</b>, sortValue: (o) => o.sellerTotal },
    { key: 'payment', header: 'Payment', render: (o) => <div className="text-xs"><p>{PAYMENT_NAME[o.payment]}</p><StatusBadge status={o.paymentStatus} /></div>, sortValue: (o) => o.payment },
    { key: 'date', header: 'Date', render: (o) => <span className="text-xs text-ink-soft">{formatDateTime(o.createdAt)}</span>, sortValue: (o) => o.createdAt },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} />, sortValue: (o) => o.status },
  ];

  const bulk = (ids: string[], to: OrderStatus, clear: () => void) => {
    let n = 0;
    ids.forEach((id) => { const o = orders.find((x) => x.id === id); if (o && NEXT_STATUS[o.status]?.[0] === to) { update(id, to); n++; } });
    toast.success(n ? `${n} order${n > 1 ? 's' : ''} updated to ${to}.` : 'No selected orders could move to that status.');
    clear();
  };

  return (
    <>
      <PageHeader title="Orders" subtitle="Process, pack and ship your orders" actions={<Button variant="outline" onClick={() => { downloadCSV('techzone-orders.csv', filtered.map((o) => ({ id: o.id, customer: o.customerName, city: o.address.city, amount: o.sellerTotal, payment: o.payment, status: o.status, date: o.createdAt }))); toast.success('Orders exported.'); }}><Download className="h-4 w-4" />Export</Button>} />
      <Card>
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[
          { value: 'all', label: 'All', count: orders.length }, { value: 'pending', label: 'Pending', count: count(['pending']) }, { value: 'confirmed', label: 'Confirmed', count: count(['confirmed', 'processing']) },
          { value: 'packed', label: 'Packed', count: count(['packed']) }, { value: 'shipped', label: 'Shipped', count: count(['shipped', 'out_for_delivery']) }, { value: 'delivered', label: 'Delivered', count: count(['delivered']) },
          { value: 'cancelled', label: 'Cancelled', count: count(['cancelled']) }, { value: 'refunded', label: 'Refunded', count: count(['refunded']) },
        ]} />
        <DataTable data={filtered} columns={cols} rowKey={(o) => o.id} loading={loading} searchKeys={(o) => `${o.id} ${o.customerName} ${o.items.map((i) => i.title).join(' ')}`} searchPlaceholder="Search order ID or customer"
          onRowClick={setDrawer}
          toolbar={<>
            <Select aria-label="Filter by date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 w-36"><option value="all">All dates</option><option value="today">Today</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></Select>
            <Select aria-label="Filter by payment" value={payment} onChange={(e) => setPayment(e.target.value)} className="h-10 w-40"><option value="">All payments</option>{Object.entries(PAYMENT_NAME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
          </>}
          bulkActions={(ids, clear) => <>
            <Button size="xs" variant="outline" onClick={() => bulk(ids, 'confirmed', clear)}><CheckCircle2 className="h-3.5 w-3.5" />Confirm</Button>
            <Button size="xs" variant="outline" onClick={() => bulk(ids, 'packed', clear)}><Package className="h-3.5 w-3.5" />Pack</Button>
            <Button size="xs" variant="outline" onClick={() => bulk(ids, 'shipped', clear)}><Truck className="h-3.5 w-3.5" />Ship</Button>
          </>}
          rowActions={(o) => NEXT_STATUS[o.status] ? <Button size="xs" variant="secondary" onClick={() => { update(o.id, NEXT_STATUS[o.status]![0]); toast.success(`${o.id} updated.`); }}>{NEXT_STATUS[o.status]![1]}</Button> : <Button size="xs" variant="ghost" onClick={() => setDrawer(o)}>View</Button>}
          emptyTitle="No orders yet" emptyMessage="New orders will appear here as soon as customers check out." />
      </Card>
      <OrderDrawer order={drawer} onClose={() => setDrawer(null)} scope="seller" />
    </>
  );
}
