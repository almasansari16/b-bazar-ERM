import { useMemo, useState } from 'react';
import { Ban, CheckCircle2, Eye, Mail, Phone, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { Card } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Drawer, Tooltip } from '@/components/ui/Overlay';
import { formatPKR, formatDate } from '@/utils/format';
import type { Customer } from '@/types';

type Row = Customer & { orders: number; spent: number };
export default function AdminCustomers() {
  usePageMeta('Customers · Admin');
  const customers = useMarket((s) => s.customers);
  const orders = useMarket((s) => s.orders);
  const setStatus = useMarket((s) => s.setCustomerStatus);
  const loading = useSimulatedLoad('acust', 400);
  const [view, setView] = useState<Row | null>(null);
  const rows = useMemo<Row[]>(() => customers.map((c) => { const mine = orders.filter((o) => o.customerId === c.id); return { ...c, orders: mine.length, spent: mine.filter((o) => o.status !== 'cancelled').reduce((n, o) => n + o.total, 0) }; }), [customers, orders]);
  const current = view ? rows.find((r) => r.id === view.id) ?? view : null;
  const toggle = (c: Row) => { const to = c.status === 'active' ? 'blocked' : 'active'; setStatus(c.id, to); toast.success(to === 'blocked' ? `${c.name} blocked.` : `${c.name} reactivated.`); };
  const cols: Column<Row>[] = [
    { key: 'id', header: 'Customer ID', render: (c) => <span className="font-mono text-xs">{c.id}</span>, sortValue: (c) => c.id },
    { key: 'name', header: 'Name', primary: true, render: (c) => <div className="flex items-center gap-2.5"><Avatar name={c.name} size="sm" /><span className="font-semibold">{c.name}</span></div>, sortValue: (c) => c.name },
    { key: 'email', header: 'Email', render: (c) => <span className="text-xs text-ink-soft">{c.email}</span> },
    { key: 'phone', header: 'Phone', render: (c) => <span className="text-xs">{c.phone}</span> },
    { key: 'city', header: 'City', render: (c) => c.city, sortValue: (c) => c.city, defaultHidden: true },
    { key: 'orders', header: 'Orders', align: 'right', render: (c) => c.orders, sortValue: (c) => c.orders },
    { key: 'spent', header: 'Total Spent', align: 'right', render: (c) => <b className="tabular-nums">{formatPKR(c.spent)}</b>, sortValue: (c) => c.spent },
    { key: 'joined', header: 'Registration Date', render: (c) => <span className="text-ink-soft">{formatDate(c.joined)}</span>, sortValue: (c) => c.joined },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} />, sortValue: (c) => c.status },
  ];
  return (
    <>
      <PageHeader title="Customers" subtitle={`${customers.length} registered customers in this demo dataset`} />
      <Card>
        <DataTable data={rows} columns={cols} rowKey={(c) => c.id} loading={loading} searchKeys={(c) => `${c.id} ${c.name} ${c.email} ${c.phone} ${c.city}`} searchPlaceholder="Search name, email, phone" onRowClick={setView}
          bulkActions={(ids, clear) => <Button size="xs" variant="outline" onClick={() => { toast.success(`Email sent to ${ids.length} customers.`); clear(); }}><Mail className="h-3.5 w-3.5" />Email</Button>}
          rowActions={(c) => <><Tooltip label="View"><Button size="icon-sm" variant="ghost" aria-label="View customer" onClick={() => setView(c)}><Eye className="h-4 w-4" /></Button></Tooltip><Tooltip label={c.status === 'active' ? 'Block' : 'Unblock'}><Button size="icon-sm" variant="ghost" className={c.status === 'active' ? 'text-red-600' : 'text-emerald-600'} aria-label={c.status === 'active' ? 'Block customer' : 'Unblock customer'} onClick={() => toggle(c)}>{c.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</Button></Tooltip></>} />
      </Card>
      <Drawer open={!!current} onClose={() => setView(null)} title="Customer details" footer={current && <Button variant="outline" className={current.status === 'active' ? 'w-full text-red-600' : 'w-full'} onClick={() => toggle(current)}>{current.status === 'active' ? 'Block customer' : 'Unblock customer'}</Button>}>
        {current && <div className="space-y-5 p-5">
          <div className="flex items-center gap-3"><Avatar name={current.name} size="lg" /><div><p className="text-lg font-extrabold">{current.name}</p><p className="font-mono text-xs text-ink-soft">{current.id}</p><StatusBadge status={current.status} /></div></div>
          <ul className="space-y-2 text-sm"><li className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink-soft" />{current.email}</li><li className="flex items-center gap-2"><Phone className="h-4 w-4 text-ink-soft" />{current.phone}</li><li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-soft" />{current.city}</li><li className="flex items-center gap-2"><Users className="h-4 w-4 text-ink-soft" />Member since {formatDate(current.joined)}</li></ul>
          <dl className="grid grid-cols-3 gap-2 text-center">{[['Orders', current.orders], ['Spent', formatPKR(current.spent)], ['Wallet', formatPKR(current.wallet)]].map(([k, v]) => <div key={k as string} className="rounded-xl bg-muted p-3"><dt className="text-[11px] text-ink-soft">{k}</dt><dd className="text-sm font-bold">{v}</dd></div>)}</dl>
          <div><p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Recent orders</p><ul className="divide-y divide-line rounded-xl border border-line">{orders.filter((o) => o.customerId === current.id).slice(0, 6).map((o) => <li key={o.id} className="flex items-center justify-between p-3 text-sm"><span className="font-mono text-xs">{o.id}</span><span className="tabular-nums">{formatPKR(o.total)}</span><StatusBadge status={o.status} /></li>)}{current.orders === 0 && <li className="p-3 text-sm text-ink-soft">No orders yet.</li>}</ul></div>
        </div>}
      </Drawer>
    </>
  );
}
