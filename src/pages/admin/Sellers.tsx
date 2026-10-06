import { useMemo, useState } from 'react';
import { Check, X, Ban, RotateCcw, Eye, FileCheck2, Store, BadgeCheck, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminService } from '@/services';
import { PageHeader, KpiCard } from '@/components/dashboard';
import { Card, Tabs } from '@/components/ui/Display';
import { Button, LinkButton } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Drawer, ConfirmDialog, Tooltip } from '@/components/ui/Overlay';
import { useCategoryMap } from '@/hooks/useCatalog';
import { lifetimeSeller } from '@/utils/analytics';
import { formatPKRCompact, formatNumber, formatDate } from '@/utils/format';
import type { Seller, SellerStatus } from '@/types';

type Row = Seller & { products: number; orders: number; revenue: number };
export default function AdminSellers() {
  usePageMeta('Sellers · Admin');
  const sellers = useMarket((s) => s.sellers);
  const products = useMarket((s) => s.products);
  const orders = useMarket((s) => s.orders);
  const setStatus = useMarket((s) => s.setSellerStatus);
  const cats = useCategoryMap();
  const loading = useSimulatedLoad('asel', 450);
  const [tab, setTab] = useState<'all' | SellerStatus>('all');
  const [view, setView] = useState<Row | null>(null);
  const [confirm, setConfirm] = useState<{ s: Row; to: SellerStatus } | null>(null);
  const rows = useMemo<Row[]>(() => sellers.map((s) => { const l = lifetimeSeller(orders, s.id); return { ...s, products: products.filter((p) => p.sellerId === s.id).length, orders: l.orders, revenue: l.revenue }; }), [sellers, products, orders]);
  const list = rows.filter((r) => tab === 'all' || r.status === tab);
  const act = async (s: Row, to: SellerStatus) => {
    if (to === 'approved') await adminService.approveSeller(s.id); else setStatus(s.id, to);
    toast.success(to === 'approved' ? 'Seller approved successfully.' : `Seller ${to}.`, { description: s.name });
    setView(null);
  };
  const cols: Column<Row>[] = [
    { key: 'id', header: 'Seller ID', render: (s) => <span className="font-mono text-xs">{s.id}</span>, sortValue: (s) => s.id },
    { key: 'store', header: 'Store Name', primary: true, render: (s) => <div className="flex items-center gap-2.5"><Avatar name={s.name} color={s.color} size="sm" square /><span className="font-semibold">{s.name}</span>{s.verified && <BadgeCheck className="h-4 w-4 fill-brand-600 text-white" />}</div>, sortValue: (s) => s.name },
    { key: 'owner', header: 'Owner', render: (s) => s.owner, sortValue: (s) => s.owner },
    { key: 'email', header: 'Email', render: (s) => <span className="text-xs text-ink-soft">{s.email}</span>, defaultHidden: true },
    { key: 'category', header: 'Category', render: (s) => <span className="text-xs">{cats[s.category]?.short}</span>, sortValue: (s) => s.category },
    { key: 'products', header: 'Products', align: 'right', render: (s) => s.products, sortValue: (s) => s.products },
    { key: 'orders', header: 'Orders', align: 'right', render: (s) => formatNumber(s.orders), sortValue: (s) => s.orders },
    { key: 'revenue', header: 'Revenue', align: 'right', render: (s) => <b className="tabular-nums">{formatPKRCompact(s.revenue)}</b>, sortValue: (s) => s.revenue },
    { key: 'rating', header: 'Rating', align: 'right', render: (s) => (s.rating ? `${s.rating} ★` : '—'), sortValue: (s) => s.rating },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} />, sortValue: (s) => s.status },
  ];
  const c = (st: SellerStatus) => rows.filter((r) => r.status === st).length;
  return (
    <>
      <PageHeader title="Sellers" subtitle="Approve, monitor and manage marketplace sellers" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard loading={loading} label="Approved" value={c('approved')} icon={<Store className="h-5 w-5" />} tone="success" />
        <KpiCard loading={loading} label="Pending review" value={c('pending')} icon={<FileCheck2 className="h-5 w-5" />} tone="warning" />
        <KpiCard loading={loading} label="Suspended" value={c('suspended')} icon={<Ban className="h-5 w-5" />} tone="danger" />
        <KpiCard loading={loading} label="Avg. rating" value={(rows.filter((r) => r.rating).reduce((n, r) => n + r.rating, 0) / Math.max(1, rows.filter((r) => r.rating).length)).toFixed(2)} icon={<BadgeCheck className="h-5 w-5" />} />
      </div>
      <Card className="mt-6">
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All', count: rows.length }, { value: 'pending', label: 'Pending', count: c('pending') }, { value: 'approved', label: 'Approved', count: c('approved') }, { value: 'suspended', label: 'Suspended', count: c('suspended') }, { value: 'rejected', label: 'Rejected', count: c('rejected') }]} />
        <DataTable data={list} columns={cols} rowKey={(s) => s.id} loading={loading} searchKeys={(s) => `${s.id} ${s.name} ${s.owner} ${s.email}`} searchPlaceholder="Search seller, owner or email" onRowClick={setView}
          bulkActions={(ids, clear) => <><Button size="xs" variant="success" onClick={() => { ids.forEach((id) => setStatus(id, 'approved')); toast.success(`${ids.length} sellers approved.`); clear(); }}>Approve</Button><Button size="xs" variant="outline" onClick={() => { ids.forEach((id) => setStatus(id, 'suspended')); toast(`${ids.length} sellers suspended.`); clear(); }}>Suspend</Button></>}
          rowActions={(s) => <>
            <Tooltip label="View"><Button size="icon-sm" variant="ghost" aria-label="View seller" onClick={() => setView(s)}><Eye className="h-4 w-4" /></Button></Tooltip>
            {s.status === 'pending' && <><Tooltip label="Approve"><Button size="icon-sm" variant="success" aria-label="Approve seller" onClick={() => act(s, 'approved')}><Check className="h-4 w-4" /></Button></Tooltip><Tooltip label="Reject"><Button size="icon-sm" variant="outline" aria-label="Reject seller" onClick={() => setConfirm({ s, to: 'rejected' })}><X className="h-4 w-4" /></Button></Tooltip></>}
            {s.status === 'approved' && <Tooltip label="Suspend"><Button size="icon-sm" variant="ghost" className="text-red-600" aria-label="Suspend seller" onClick={() => setConfirm({ s, to: 'suspended' })}><Ban className="h-4 w-4" /></Button></Tooltip>}
            {(s.status === 'suspended' || s.status === 'rejected') && <Tooltip label="Reinstate"><Button size="icon-sm" variant="ghost" aria-label="Reinstate seller" onClick={() => act(s, 'approved')}><RotateCcw className="h-4 w-4" /></Button></Tooltip>}
          </>} />
      </Card>
      <Drawer open={!!view} onClose={() => setView(null)} title="Seller details" width="max-w-lg" footer={view && <div className="flex flex-wrap gap-2">
        {view.status === 'pending' && <><Button variant="success" className="flex-1" onClick={() => act(view, 'approved')}><Check className="h-4 w-4" />Approve seller</Button><Button variant="outline" className="flex-1 text-red-600" onClick={() => setConfirm({ s: view, to: 'rejected' })}>Reject</Button></>}
        {view.status === 'approved' && <><LinkButton to={`/store/${view.slug}`} variant="outline" className="flex-1">Visit store</LinkButton><Button variant="outline" className="flex-1 text-red-600" onClick={() => setConfirm({ s: view, to: 'suspended' })}>Suspend</Button></>}
        {(view.status === 'suspended' || view.status === 'rejected') && <Button className="flex-1" onClick={() => act(view, 'approved')}>Reinstate</Button>}
      </div>}>
        {view && <div className="space-y-5 p-5">
          <div className="flex items-center gap-3"><Avatar name={view.name} color={view.color} size="lg" square /><div><p className="text-lg font-extrabold">{view.name}</p><p className="text-sm text-ink-soft">{view.tagline}</p><StatusBadge status={view.status} /></div></div>
          <dl className="grid grid-cols-3 gap-2 text-center">{[['Products', view.products], ['Orders', formatNumber(view.orders)], ['Revenue', formatPKRCompact(view.revenue)]].map(([k, v]) => <div key={k as string} className="rounded-xl bg-muted p-3"><dt className="text-[11px] text-ink-soft">{k}</dt><dd className="font-bold">{v}</dd></div>)}</dl>
          <ul className="space-y-2 text-sm"><li className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink-soft" />{view.email}</li><li className="flex items-center gap-2"><Phone className="h-4 w-4 text-ink-soft" />{view.phone}</li><li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-soft" />{view.city}</li><li className="text-ink-soft">Owner: <b className="text-ink">{view.owner}</b> · Applied {formatDate(view.joined)}</li></ul>
          <div><p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">KYC documents</p>
            <ul className="space-y-2">{['CNIC (front & back)', 'NTN certificate', 'Bank account proof', 'Warehouse photos'].map((d, i) => <li key={d} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm"><span className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-brand-600" />{d}</span>{view.status === 'pending' && i === 3 ? <StatusBadge status="pending" /> : <StatusBadge status="approved" />}</li>)}</ul>
          </div>
          <p className="rounded-lg bg-muted p-3 text-sm text-ink-soft">{view.description}</p>
        </div>}
      </Drawer>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} tone="danger" title={confirm?.to === 'rejected' ? 'Reject seller application?' : 'Suspend seller?'} confirmLabel={confirm?.to === 'rejected' ? 'Reject' : 'Suspend'}
        message={confirm?.to === 'suspended' ? `${confirm?.s.name}'s listings will be hidden from the marketplace immediately.` : `${confirm?.s.name} will be notified that the application was rejected.`} onConfirm={() => act(confirm!.s, confirm!.to)} />
    </>
  );
}
