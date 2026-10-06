import { useState } from 'react';
import { Plus, Pause, Play, Megaphone, Zap, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useSellerMap } from '@/hooks/useCatalog';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard } from '@/components/dashboard';
import { Card, Tabs } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Field, Select } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Overlay';
import { formatPKR, formatPKRCompact, formatDate, formatNumber } from '@/utils/format';
import type { Promotion } from '@/types';

const TL: Record<Promotion['type'], string> = { discount: 'Discount', coupon: 'Coupon', flash_sale: 'Flash Sale', bundle: 'Bundle', free_shipping: 'Free Shipping' };
export default function AdminPromotions() {
  usePageMeta('Promotions · Admin');
  const promos = useMarket((s) => s.promotions);
  const upsert = useMarket((s) => s.upsertPromotion);
  const sellers = useSellerMap();
  const loading = useSimulatedLoad('aprm', 400);
  const [scope, setScope] = useState<'all' | 'platform' | 'seller'>('all');
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', type: 'flash_sale' as Promotion['type'], discount: 'Up to 40%', start: new Date().toISOString().slice(0, 10), end: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10) });
  const list = promos.filter((p) => scope === 'all' || (scope === 'platform' ? p.sellerId === 'platform' : p.sellerId !== 'platform'));
  const cols: Column<Promotion>[] = [
    { key: 'name', header: 'Campaign', primary: true, render: (p) => <div><p className="font-semibold">{p.name}</p><p className="text-xs text-ink-soft">{p.discount}</p></div>, sortValue: (p) => p.name },
    { key: 'owner', header: 'Owner', render: (p) => (p.sellerId === 'platform' ? <Badge tone="violet">B-Bazar</Badge> : <span className="text-xs">{sellers[p.sellerId]?.name}</span>) },
    { key: 'type', header: 'Type', render: (p) => <Badge tone="outline">{TL[p.type]}</Badge>, sortValue: (p) => p.type },
    { key: 'products', header: 'Products', align: 'right', render: (p) => formatNumber(p.products), sortValue: (p) => p.products },
    { key: 'period', header: 'Period', render: (p) => <span className="text-xs text-ink-soft">{formatDate(p.start)} – {formatDate(p.end)}</span>, sortValue: (p) => p.start },
    { key: 'usage', header: 'Usage', align: 'right', render: (p) => formatNumber(p.usage), sortValue: (p) => p.usage },
    { key: 'revenue', header: 'Revenue', align: 'right', render: (p) => <b>{formatPKR(p.revenue)}</b>, sortValue: (p) => p.revenue },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} />, sortValue: (p) => p.status },
  ];
  return (
    <>
      <PageHeader title="Promotions" subtitle="Marketplace campaigns and seller promotions" actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New campaign</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard loading={loading} featured label="Campaign GMV" value={formatPKRCompact(promos.reduce((n, p) => n + p.revenue, 0))} icon={<Megaphone className="h-5 w-5" />} />
        <KpiCard loading={loading} label="Live campaigns" value={promos.filter((p) => p.status === 'active').length} icon={<Zap className="h-5 w-5" />} tone="danger" />
        <KpiCard loading={loading} label="Scheduled" value={promos.filter((p) => p.status === 'scheduled').length} icon={<CalendarClock className="h-5 w-5" />} tone="violet" />
        <KpiCard loading={loading} label="Participating products" value={formatNumber(promos.filter((p) => p.status === 'active').reduce((n, p) => n + p.products, 0))} icon={<Megaphone className="h-5 w-5" />} tone="accent" />
      </div>
      <Card className="mt-6">
        <Tabs className="px-3" value={scope} onChange={setScope} tabs={[{ value: 'all', label: 'All', count: promos.length }, { value: 'platform', label: 'Marketplace' }, { value: 'seller', label: 'Seller campaigns' }]} />
        <DataTable data={list} columns={cols} rowKey={(p) => p.id} loading={loading} searchKeys={(p) => p.name} searchPlaceholder="Search campaigns" selectable={false}
          rowActions={(p) => p.status === 'active' ? <Button size="xs" variant="outline" onClick={() => { upsert({ ...p, status: 'paused' }); toast('Campaign paused.'); }}><Pause className="h-3.5 w-3.5" />Pause</Button> : p.status === 'paused' || p.status === 'scheduled' ? <Button size="xs" variant="outline" onClick={() => { upsert({ ...p, status: 'active' }); toast.success('Campaign is live.'); }}><Play className="h-3.5 w-3.5" />Go live</Button> : null} />
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="New marketplace campaign" footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { if (f.name.length < 3) { toast.error('Enter a campaign name.'); return; } upsert({ id: `PR${Date.now()}`, name: f.name, type: f.type, sellerId: 'platform', products: 0, start: f.start, end: f.end, usage: 0, revenue: 0, status: new Date(f.start) > new Date() ? 'scheduled' : 'active', discount: f.discount }); setOpen(false); toast.success('Campaign created. Sellers can now nominate products.'); }}>Create</Button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" htmlFor="pm-n" className="sm:col-span-2"><Input id="pm-n" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. 12.12 Year-End Sale" /></Field>
          <Field label="Type" htmlFor="pm-t"><Select id="pm-t" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as Promotion['type'] })}>{Object.entries(TL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <Field label="Headline offer" htmlFor="pm-d"><Input id="pm-d" value={f.discount} onChange={(e) => setF({ ...f, discount: e.target.value })} /></Field>
          <Field label="Start" htmlFor="pm-s"><Input id="pm-s" type="date" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></Field>
          <Field label="End" htmlFor="pm-e"><Input id="pm-e" type="date" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></Field>
        </div>
      </Modal>
    </>
  );
}
