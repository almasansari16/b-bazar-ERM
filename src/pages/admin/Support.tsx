import { useState } from 'react';
import { LifeBuoy, Clock, CheckCircle2, AlertOctagon, MessageSquare, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard } from '@/components/dashboard';
import { Card, Tabs } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Select, Textarea } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Overlay';
import { Avatar } from '@/components/ui/Avatar';
import { timeAgo, formatDateTime } from '@/utils/format';
import type { SupportTicket } from '@/types';

const AGENTS = ['Sana (L1)', 'Usman (L1)', 'Mariam (L2)', 'Adeel (L2)', 'Unassigned'];
const CH = { chat: MessageSquare, email: Mail, phone: Phone };
export default function AdminSupport() {
  usePageMeta('Support · Admin');
  const tickets = useMarket((s) => s.tickets);
  const setStatus = useMarket((s) => s.setTicketStatus);
  const loading = useSimulatedLoad('asup', 400);
  const [tab, setTab] = useState<'all' | SupportTicket['status']>('all');
  const [view, setView] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const c = (s: SupportTicket['status']) => tickets.filter((t) => t.status === s).length;
  const cur = view ? tickets.find((t) => t.id === view.id) ?? view : null;
  const cols: Column<SupportTicket>[] = [
    { key: 'id', header: 'Ticket ID', render: (t) => <span className="font-mono text-xs font-bold">{t.id}</span>, sortValue: (t) => t.id },
    { key: 'subject', header: 'Subject', primary: true, render: (t) => { const I = CH[t.channel]; return <div className="flex items-center gap-2"><I className="h-4 w-4 shrink-0 text-ink-soft" aria-label={t.channel} /><span className="font-medium">{t.subject}</span></div>; }, sortValue: (t) => t.subject },
    { key: 'customer', header: 'Customer', render: (t) => t.customer, sortValue: (t) => t.customer },
    { key: 'seller', header: 'Seller', render: (t) => <span className="text-xs">{t.seller}</span> },
    { key: 'priority', header: 'Priority', render: (t) => <StatusBadge status={t.priority} />, sortValue: (t) => ['low', 'medium', 'high', 'urgent'].indexOf(t.priority) },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} />, sortValue: (t) => t.status },
    { key: 'agent', header: 'Assigned Agent', render: (t) => <span className={t.agent === 'Unassigned' ? 'text-xs text-amber-600' : 'text-xs'}>{t.agent}</span>, sortValue: (t) => t.agent },
    { key: 'created', header: 'Created', render: (t) => <span className="text-xs text-ink-soft">{timeAgo(t.created)}</span>, sortValue: (t) => t.created },
  ];
  return (
    <>
      <PageHeader title="Support" subtitle="Customer and seller tickets across chat, email and phone" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard loading={loading} label="Open Tickets" value={c('open')} icon={<LifeBuoy className="h-5 w-5" />} />
        <KpiCard loading={loading} label="Pending" value={c('pending')} icon={<Clock className="h-5 w-5" />} tone="warning" />
        <KpiCard loading={loading} label="Resolved" value={c('resolved')} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" hint="Avg. resolution 6h 40m" />
        <KpiCard loading={loading} label="Escalated" value={c('escalated')} icon={<AlertOctagon className="h-5 w-5" />} tone="danger" />
      </div>
      <Card className="mt-6">
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All', count: tickets.length }, { value: 'open', label: 'Open', count: c('open') }, { value: 'pending', label: 'Pending', count: c('pending') }, { value: 'escalated', label: 'Escalated', count: c('escalated') }, { value: 'resolved', label: 'Resolved', count: c('resolved') }]} />
        <DataTable data={tickets.filter((t) => tab === 'all' || t.status === tab)} columns={cols} rowKey={(t) => t.id} loading={loading} searchKeys={(t) => `${t.id} ${t.subject} ${t.customer} ${t.seller}`} searchPlaceholder="Search tickets" onRowClick={setView}
          bulkActions={(ids, clear) => <Button size="xs" variant="outline" onClick={() => { ids.forEach((id) => setStatus(id, 'resolved')); toast.success(`${ids.length} tickets resolved.`); clear(); }}>Resolve</Button>}
          rowActions={(t) => <Select aria-label={`Assign ${t.id}`} value={t.agent} onChange={(e) => { setStatus(t.id, t.status === 'open' ? 'pending' : t.status, e.target.value); toast.success(`${t.id} assigned to ${e.target.value}.`); }} className="h-8 w-36 text-xs">{AGENTS.map((a) => <option key={a}>{a}</option>)}</Select>} />
      </Card>
      <Drawer open={!!cur} onClose={() => setView(null)} title={cur ? `${cur.id} · ${cur.subject}` : ''} width="max-w-lg" footer={cur && <div className="flex flex-wrap gap-2"><Button className="flex-1" onClick={() => { if (reply.trim()) { toast.success('Reply sent to customer.'); setReply(''); setStatus(cur.id, 'pending'); } }}>Send reply</Button><Button variant="success" onClick={() => { setStatus(cur.id, 'resolved'); toast.success('Ticket resolved.'); }}>Resolve</Button><Button variant="outline" className="text-red-600" onClick={() => { setStatus(cur.id, 'escalated', 'Mariam (L2)'); toast('Escalated to L2.'); }}>Escalate</Button></div>}>
        {cur && <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2"><StatusBadge status={cur.status} /><StatusBadge status={cur.priority} /><span className="text-xs text-ink-soft">{formatDateTime(cur.created)} · via {cur.channel}</span></div>
          <dl className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg bg-muted p-3"><dt className="text-xs text-ink-soft">Customer</dt><dd className="font-semibold">{cur.customer}</dd></div><div className="rounded-lg bg-muted p-3"><dt className="text-xs text-ink-soft">Order</dt><dd className="font-mono text-xs font-semibold">{cur.orderId}</dd></div></dl>
          <div className="space-y-3 rounded-xl bg-slate-50 p-3">
            <div className="flex gap-2"><Avatar name={cur.customer} size="xs" /><p className="rounded-xl bg-white p-2.5 text-sm ring-1 ring-line">Hi, regarding order {cur.orderId}: {cur.subject.toLowerCase()}. Please help.</p></div>
            <div className="flex justify-end"><p className="max-w-[80%] rounded-xl bg-brand-600 p-2.5 text-sm text-white">Thanks for reaching out — {cur.agent.split(' ')[0]} here. I'm checking with {cur.seller} now.</p></div>
          </div>
          <Textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" aria-label="Reply" />
        </div>}
      </Drawer>
    </>
  );
}
