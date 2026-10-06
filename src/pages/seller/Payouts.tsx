import { useMemo, useState } from 'react';
import { Wallet, Clock, CheckCircle2, CalendarClock, Landmark, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useSeller } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard } from '@/components/dashboard';
import { Card } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { commissionRate } from '@/utils/analytics';
import { formatPKR, formatDate, addDays } from '@/utils/format';
import { downloadCSV } from '@/utils/csv';
import type { Payout } from '@/types';

export default function SellerPayouts() {
  usePageMeta('Payouts · Seller Center');
  const { orders, sellerId } = useSeller();
  const rules = useMarket((s) => s.commissions);
  const loading = useSimulatedLoad('spay', 400);
  const [withdraw, setWithdraw] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const tx = useMemo<Payout[]>(() => orders.filter((o) => !['cancelled'].includes(o.status)).map((o, i) => {
    const amount = o.sellerTotal;
    const fee = Math.round(o.items.reduce((n, it) => n + it.price * it.qty * (commissionRate(rules, it.category, sellerId) / 100), 0) + 25);
    const status: Payout['status'] = o.status === 'refunded' ? 'on_hold' : o.status === 'delivered' ? (i % 3 === 0 && !withdrawn ? 'processing' : 'paid') : 'pending';
    return { id: `TX-${o.id.slice(-4)}${i}`, orderId: o.id, amount, fee, net: amount - fee, date: o.createdAt, status };
  }), [orders, rules, sellerId, withdrawn]);
  const sum = (s: Payout['status'][]) => tx.filter((t) => s.includes(t.status)).reduce((n, t) => n + t.net, 0);
  const available = withdrawn ? 0 : sum(['processing']);
  const nextPayout = (() => { const d = new Date(); const add = (8 - d.getDay()) % 7 || 7; return addDays(d, add); })();
  const cols: Column<Payout>[] = [
    { key: 'id', header: 'Transaction ID', primary: true, render: (t) => <span className="font-mono text-xs font-bold">{t.id}</span> },
    { key: 'order', header: 'Order', render: (t) => <span className="font-mono text-xs text-brand-700">{t.orderId}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (t) => <span className="tabular-nums">{formatPKR(t.amount)}</span>, sortValue: (t) => t.amount },
    { key: 'fee', header: 'Fee', align: 'right', render: (t) => <span className="tabular-nums text-red-600">−{formatPKR(t.fee)}</span>, sortValue: (t) => t.fee },
    { key: 'net', header: 'Net Amount', align: 'right', render: (t) => <b className="tabular-nums">{formatPKR(t.net)}</b>, sortValue: (t) => t.net },
    { key: 'date', header: 'Date', render: (t) => <span className="text-ink-soft">{formatDate(t.date)}</span>, sortValue: (t) => t.date },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} />, sortValue: (t) => t.status },
  ];
  return (
    <>
      <PageHeader title="Payouts" subtitle="Earnings are released 7 days after delivery" actions={<><Button variant="outline" onClick={() => { downloadCSV('payouts.csv', tx.map((t) => ({ ...t }))); toast.success('Statement exported.'); }}><Download className="h-4 w-4" />Statement</Button><Button variant="gradient" disabled={available <= 0} onClick={() => setWithdraw(true)}><Landmark className="h-4 w-4" />Withdraw</Button></>} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard loading={loading} featured label="Available Balance" value={formatPKR(available)} icon={<Wallet className="h-5 w-5" />} hint="Ready to withdraw" />
        <KpiCard loading={loading} label="Pending Balance" value={formatPKR(sum(['pending']))} icon={<Clock className="h-5 w-5" />} tone="warning" hint="Orders in transit" />
        <KpiCard loading={loading} label="Total Paid" value={formatPKR(sum(['paid']) + 184320 + (withdrawn ? sum(['processing']) : 0))} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" hint="Incl. previous cycles" />
        <KpiCard loading={loading} label="Next Payout" value={formatDate(nextPayout.toISOString())} icon={<CalendarClock className="h-5 w-5" />} tone="violet" hint="Weekly · Meezan Bank ••6789" />
      </div>
      <Card className="mt-6"><DataTable data={tx} columns={cols} rowKey={(t) => t.id} loading={loading} searchKeys={(t) => `${t.id} ${t.orderId}`} searchPlaceholder="Search transaction or order" selectable={false} /></Card>
      <ConfirmDialog open={withdraw} onClose={() => setWithdraw(false)} title="Withdraw balance" confirmLabel={`Withdraw ${formatPKR(available)}`} message={`${formatPKR(available)} will be transferred to Meezan Bank ••6789 within 1 working day.`} onConfirm={() => { setWithdrawn(true); toast.success('Withdrawal requested.'); }} />
    </>
  );
}
