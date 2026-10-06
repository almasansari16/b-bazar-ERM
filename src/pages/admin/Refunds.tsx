import { useState } from 'react';
import { RotateCcw, Clock, CheckCircle2, XCircle, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useSellerMap } from '@/hooks/useCatalog';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard } from '@/components/dashboard';
import { Card, Tabs } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { formatPKR, formatDate } from '@/utils/format';
import type { ReturnRequest } from '@/types';

type S = ReturnRequest['status'];
export default function AdminRefunds() {
  usePageMeta('Returns & Refunds · Admin');
  const returns = useMarket((s) => s.returns);
  const setStatus = useMarket((s) => s.setReturnStatus);
  const updateOrder = useMarket((s) => s.updateOrderStatus);
  const sellers = useSellerMap();
  const loading = useSimulatedLoad('aref', 400);
  const [tab, setTab] = useState<'all' | S>('all');
  const c = (s: S) => returns.filter((r) => r.status === s).length;
  const act = (r: ReturnRequest, to: S) => {
    setStatus(r.id, to);
    if (to === 'completed') updateOrder(r.orderId, 'refunded');
    toast.success({ approved: 'Return approved — pickup scheduled.', rejected: 'Return rejected.', refund_pending: 'Item received — refund pending.', completed: 'Refund completed.', requested: '' }[to], { description: r.id });
  };
  const next: Partial<Record<S, [S, string]>> = { requested: ['approved', 'Approve'], approved: ['refund_pending', 'Mark received'], refund_pending: ['completed', 'Issue refund'] };
  const cols: Column<ReturnRequest>[] = [
    { key: 'id', header: 'Request ID', primary: true, render: (r) => <span className="font-mono text-xs font-bold">{r.id}</span>, sortValue: (r) => r.id },
    { key: 'order', header: 'Order', render: (r) => <span className="font-mono text-xs text-brand-700">{r.orderId}</span> },
    { key: 'customer', header: 'Customer', render: (r) => r.customer, sortValue: (r) => r.customer },
    { key: 'seller', header: 'Seller', render: (r) => sellers[r.sellerId]?.name, sortValue: (r) => r.sellerId },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-xs">{r.reason}</span>, sortValue: (r) => r.reason },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => <b className="tabular-nums">{formatPKR(r.amount)}</b>, sortValue: (r) => r.amount },
    { key: 'date', header: 'Requested', render: (r) => <span className="text-xs text-ink-soft">{formatDate(r.date)}</span>, sortValue: (r) => r.date },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
  ];
  return (
    <>
      <PageHeader title="Returns & Refunds" subtitle="Approve returns, confirm pickups and issue refunds" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <KpiCard loading={loading} label="Return Requests" value={c('requested')} icon={<RotateCcw className="h-5 w-5" />} tone="warning" />
        <KpiCard loading={loading} label="Refund Pending" value={c('refund_pending')} icon={<Clock className="h-5 w-5" />} tone="violet" />
        <KpiCard loading={loading} label="Approved" value={c('approved')} icon={<BadgeCheck className="h-5 w-5" />} />
        <KpiCard loading={loading} label="Rejected" value={c('rejected')} icon={<XCircle className="h-5 w-5" />} tone="danger" />
        <KpiCard loading={loading} label="Completed" value={c('completed')} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
      </div>
      <Card className="mt-6">
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All', count: returns.length }, { value: 'requested', label: 'Requested', count: c('requested') }, { value: 'approved', label: 'Approved', count: c('approved') }, { value: 'refund_pending', label: 'Refund Pending', count: c('refund_pending') }, { value: 'completed', label: 'Completed', count: c('completed') }, { value: 'rejected', label: 'Rejected', count: c('rejected') }]} />
        <DataTable data={returns.filter((r) => tab === 'all' || r.status === tab)} columns={cols} rowKey={(r) => r.id} loading={loading} searchKeys={(r) => `${r.id} ${r.orderId} ${r.customer} ${r.product}`} searchPlaceholder="Search request, order or customer"
          rowActions={(r) => <>{next[r.status] && <Button size="xs" variant={r.status === 'refund_pending' ? 'success' : 'secondary'} onClick={() => act(r, next[r.status]![0])}>{next[r.status]![1]}</Button>}{r.status === 'requested' && <Button size="xs" variant="ghost" className="text-red-600" onClick={() => act(r, 'rejected')}>Reject</Button>}</>} />
      </Card>
    </>
  );
}
