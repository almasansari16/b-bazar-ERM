import { useState } from 'react';
import { Percent, Ticket, Zap, Gift, Truck, Plus, Pause, Play, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useSeller } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard } from '@/components/dashboard';
import { Card } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Field, Select } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Overlay';
import { formatPKR, formatPKRCompact, formatDate, formatNumber } from '@/utils/format';
import type { Promotion } from '@/types';

const TYPES: { k: Promotion['type']; label: string; desc: string; icon: typeof Percent; color: string }[] = [
  { k: 'discount', label: 'Discount', desc: 'Percentage off selected products', icon: Percent, color: 'text-brand-600 bg-brand-50' },
  { k: 'coupon', label: 'Coupon', desc: 'Code customers enter at checkout', icon: Ticket, color: 'text-violet-600 bg-violet-50' },
  { k: 'flash_sale', label: 'Flash Sale', desc: 'Time-boxed deep discount', icon: Zap, color: 'text-red-600 bg-red-50' },
  { k: 'bundle', label: 'Bundle Offer', desc: 'Buy together and save', icon: Gift, color: 'text-amber-600 bg-amber-50' },
  { k: 'free_shipping', label: 'Free Shipping', desc: 'Waive delivery fees', icon: Truck, color: 'text-emerald-600 bg-emerald-50' },
];
const TYPE_LABEL = Object.fromEntries(TYPES.map((t) => [t.k, t.label]));

export default function SellerPromotions() {
  usePageMeta('Promotions · Seller Center');
  const { sellerId, products } = useSeller();
  const promos = useMarket((s) => s.promotions).filter((p) => p.sellerId === sellerId);
  const upsert = useMarket((s) => s.upsertPromotion);
  const loading = useSimulatedLoad('spromo', 400);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Promotion['type']>('discount');
  const [form, setForm] = useState({ name: '', discount: '15', start: new Date().toISOString().slice(0, 10), end: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), products: '5', code: '' });
  const active = promos.filter((p) => p.status === 'active');
  const cols: Column<Promotion>[] = [
    { key: 'name', header: 'Campaign', primary: true, render: (p) => <div><p className="font-semibold">{p.name}</p><p className="text-xs text-ink-soft">{p.discount}</p></div>, sortValue: (p) => p.name },
    { key: 'type', header: 'Type', render: (p) => <Badge tone="outline">{TYPE_LABEL[p.type]}</Badge>, sortValue: (p) => p.type },
    { key: 'products', header: 'Products', align: 'right', render: (p) => p.products, sortValue: (p) => p.products },
    { key: 'start', header: 'Start', render: (p) => <span className="text-ink-soft">{formatDate(p.start)}</span>, sortValue: (p) => p.start },
    { key: 'end', header: 'End', render: (p) => <span className="text-ink-soft">{formatDate(p.end)}</span>, sortValue: (p) => p.end },
    { key: 'usage', header: 'Usage', align: 'right', render: (p) => formatNumber(p.usage), sortValue: (p) => p.usage },
    { key: 'revenue', header: 'Revenue', align: 'right', render: (p) => <b>{formatPKR(p.revenue)}</b>, sortValue: (p) => p.revenue },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} />, sortValue: (p) => p.status },
  ];
  const create = () => {
    if (form.name.trim().length < 3) { toast.error('Give your campaign a name.'); return; }
    const p: Promotion = { id: `PR${Date.now().toString().slice(-5)}`, name: form.name, type, sellerId, products: Number(form.products), start: form.start, end: form.end, usage: 0, revenue: 0, status: new Date(form.start) > new Date() ? 'scheduled' : 'active', discount: type === 'free_shipping' ? 'Free delivery' : type === 'bundle' ? `Save Rs. ${form.discount}` : `${form.discount}% off${form.code ? ` · ${form.code}` : ''}` };
    upsert(p); setOpen(false); toast.success('Campaign created.', { description: p.name });
  };
  return (
    <>
      <PageHeader title="Promotions" subtitle="Run campaigns that drive traffic and conversions" actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Create Campaign</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard loading={loading} featured label="Campaign Revenue" value={formatPKRCompact(promos.reduce((n, p) => n + p.revenue, 0))} icon={<Megaphone className="h-5 w-5" />} delta={18.4} />
        <KpiCard loading={loading} label="Active Campaigns" value={active.length} icon={<Zap className="h-5 w-5" />} tone="danger" />
        <KpiCard loading={loading} label="Redemptions" value={formatNumber(promos.reduce((n, p) => n + p.usage, 0))} icon={<Ticket className="h-5 w-5" />} tone="violet" />
        <KpiCard loading={loading} label="Avg. Uplift" value="+23%" icon={<Percent className="h-5 w-5" />} tone="success" hint="vs. non-promo days" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TYPES.map((t) => <button key={t.k} type="button" onClick={() => { setType(t.k); setOpen(true); }} className="rounded-xl border border-line bg-white p-4 text-left transition hover:border-brand-200 hover:shadow-lift"><span className={cn('grid h-10 w-10 place-items-center rounded-xl', t.color)}><t.icon className="h-5 w-5" /></span><p className="mt-3 text-sm font-bold">{t.label}</p><p className="text-xs text-ink-soft">{t.desc}</p></button>)}
      </div>
      <Card className="mt-6">
        <DataTable data={promos} columns={cols} rowKey={(p) => p.id} loading={loading} searchKeys={(p) => p.name} searchPlaceholder="Search campaigns" selectable={false}
          rowActions={(p) => p.status === 'active' ? <Button size="xs" variant="outline" onClick={() => { upsert({ ...p, status: 'paused' }); toast('Campaign paused.'); }}><Pause className="h-3.5 w-3.5" />Pause</Button> : p.status === 'paused' ? <Button size="xs" variant="outline" onClick={() => { upsert({ ...p, status: 'active' }); toast.success('Campaign resumed.'); }}><Play className="h-3.5 w-3.5" />Resume</Button> : null} />
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Create campaign" size="lg" footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Launch campaign</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Campaign type">{TYPES.map((t) => <button key={t.k} type="button" role="radio" aria-checked={type === t.k} onClick={() => setType(t.k)} className={cn('flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-xs font-semibold', type === t.k ? 'border-brand-600 bg-brand-50' : 'border-line')}><t.icon className="h-5 w-5" />{t.label}</button>)}</div>
          <Field label="Campaign name" htmlFor="c-name" required><Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Weekend Audio Deals" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            {type !== 'free_shipping' && <Field label={type === 'bundle' ? 'Save (PKR)' : 'Discount (%)'} htmlFor="c-disc"><Input id="c-disc" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></Field>}
            {type === 'coupon' && <Field label="Coupon code" htmlFor="c-code"><Input id="c-code" className="font-mono uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="TECHZONE10" /></Field>}
            <Field label="Products" htmlFor="c-prod"><Select id="c-prod" value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })}><option value={String(products.length)}>All products ({products.length})</option><option value="5">Top 5 sellers</option><option value="1">Single product</option></Select></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date" htmlFor="c-start"><Input id="c-start" type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
            <Field label="End date" htmlFor="c-end"><Input id="c-end" type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
          </div>
        </div>
      </Modal>
    </>
  );
}
