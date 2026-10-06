import { useMemo } from 'react';
import { CreditCard, Banknote, Clock, AlertTriangle, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard, ChartCard } from '@/components/dashboard';
import { Donut } from '@/components/dashboard/Charts';
import { Card, CardHeader } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PAYMENT_NAME } from '@/components/customer/OrderTimeline';
import { paymentBreakdown } from '@/utils/analytics';
import { formatPKR, formatDateTime, formatNumber } from '@/utils/format';
import type { Order } from '@/types';

export default function AdminPayments() {
  usePageMeta('Payments · Admin');
  const orders = useMarket((s) => s.orders);
  const sellers = useMarket((s) => s.sellers).filter((s) => s.status === 'approved');
  const loading = useSimulatedLoad('apay', 400);
  const collected = orders.filter((o) => o.paymentStatus === 'paid').reduce((n, o) => n + o.total, 0);
  const codPending = orders.filter((o) => o.payment === 'cod' && o.paymentStatus === 'pending').reduce((n, o) => n + o.total, 0);
  const refunded = orders.filter((o) => o.paymentStatus === 'refunded').reduce((n, o) => n + o.total, 0);
  const payouts = useMemo(() => sellers.slice(0, 8).map((s, i) => ({ seller: s.name, amount: 40000 + ((i * 73127) % 260000), due: new Date(Date.now() + (i % 3) * 864e5).toISOString(), status: i % 4 === 0 ? 'processing' : 'pending' })), [sellers]);
  const cols: Column<Order>[] = [
    { key: 'ref', header: 'Reference', primary: true, render: (o) => <span className="font-mono text-xs font-bold">PAY-{o.id.slice(-9)}</span> },
    { key: 'order', header: 'Order', render: (o) => <span className="font-mono text-xs text-brand-700">{o.id}</span>, sortValue: (o) => o.id },
    { key: 'customer', header: 'Customer', render: (o) => o.customerName, sortValue: (o) => o.customerName },
    { key: 'method', header: 'Method', render: (o) => PAYMENT_NAME[o.payment], sortValue: (o) => o.payment },
    { key: 'amount', header: 'Amount', align: 'right', render: (o) => <b className="tabular-nums">{formatPKR(o.total)}</b>, sortValue: (o) => o.total },
    { key: 'gateway', header: 'Gateway', render: (o) => <span className="text-xs text-ink-soft">{{ cod: 'Courier remittance', card: 'Card acquirer', jazzcash: 'JazzCash API', easypaisa: 'Easypaisa API', bank: 'Raast / IBFT' }[o.payment]}</span> },
    { key: 'date', header: 'Date', render: (o) => <span className="text-xs text-ink-soft">{formatDateTime(o.createdAt)}</span>, sortValue: (o) => o.createdAt },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.paymentStatus} />, sortValue: (o) => o.paymentStatus },
  ];
  return (
    <>
      <PageHeader title="Payments" subtitle="Collections, COD remittances, refunds and seller payouts" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard loading={loading} featured label="Collected" value={formatPKR(collected)} icon={<CreditCard className="h-5 w-5" />} hint="Recent orders" />
        <KpiCard loading={loading} label="COD awaiting remittance" value={formatPKR(codPending)} icon={<Banknote className="h-5 w-5" />} tone="warning" />
        <KpiCard loading={loading} label="Refunded" value={formatPKR(refunded)} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" />
        <KpiCard loading={loading} label="Payouts due" value={formatPKR(payouts.reduce((n, p) => n + p.amount, 0))} icon={<Clock className="h-5 w-5" />} tone="violet" hint={`${payouts.length} sellers this week`} />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card><CardHeader title="Transactions" /><div className="mt-2"><DataTable data={orders} columns={cols} rowKey={(o) => o.id} loading={loading} searchKeys={(o) => `${o.id} ${o.customerName} ${o.payment}`} searchPlaceholder="Search transactions" selectable={false} pageSize={8} /></div></Card>
        <div className="space-y-4">
          <ChartCard loading={loading} title="Payment Methods" subtitle="Share of all orders" height={220}><Donut data={paymentBreakdown(orders, 18000)} center={{ label: 'orders', value: formatNumber(18000 + orders.length) }} /></ChartCard>
          <Card><CardHeader title="Upcoming seller payouts" action={<Button size="xs" onClick={() => toast.success('Payout batch released to 8 sellers.')}><Landmark className="h-3.5 w-3.5" />Release batch</Button>} />
            <ul className="mt-3 divide-y divide-line">{payouts.map((p) => <li key={p.seller} className="flex items-center justify-between gap-2 px-5 py-2.5 text-sm"><span className="min-w-0 truncate font-medium">{p.seller}</span><span className="tabular-nums">{formatPKR(p.amount)}</span><StatusBadge status={p.status} /></li>)}</ul>
          </Card>
        </div>
      </div>
    </>
  );
}
