import { useState } from 'react';
import { Plus, Pencil, Trash2, Copy, Power } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useMarket } from '@/store/useMarket';
import { useCategoryMap } from '@/hooks/useCatalog';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { Card, Tabs, ProgressBar } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Field, Select, Checkbox } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal, ConfirmDialog, Tooltip } from '@/components/ui/Overlay';
import { formatPKR, formatDate, formatNumber } from '@/utils/format';
import type { Coupon } from '@/types';

const blank = (): Coupon => ({ id: `CP${Date.now()}`, code: '', type: 'percentage', value: 10, minOrder: 1000, maxDiscount: 1000, start: new Date().toISOString().slice(0, 10), end: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10), usageLimit: 1000, used: 0, categories: [], sellers: [], status: 'active', description: '' });
export default function AdminCoupons() {
  usePageMeta('Coupons · Admin');
  const coupons = useMarket((s) => s.coupons);
  const sellers = useMarket((s) => s.sellers).filter((s) => s.status === 'approved');
  const { upsertCoupon, deleteCoupon } = useMarket();
  const cats = useCategoryMap();
  const loading = useSimulatedLoad('acp', 400);
  const [tab, setTab] = useState<'all' | Coupon['status']>('all');
  const [edit, setEdit] = useState<Coupon | null>(null);
  const [del, setDel] = useState<Coupon | null>(null);
  const [err, setErr] = useState('');
  const value = (c: Coupon) => (c.type === 'percentage' ? `${c.value}%${c.maxDiscount ? ` (max ${formatPKR(c.maxDiscount)})` : ''}` : c.type === 'fixed' ? formatPKR(c.value) : 'Free shipping');
  const cols: Column<Coupon>[] = [
    { key: 'code', header: 'Code', primary: true, render: (c) => <div><span className="rounded-md border border-dashed border-brand-300 bg-brand-50 px-2 py-0.5 font-mono text-xs font-bold text-brand-700">{c.code}</span><p className="mt-1 text-xs text-ink-soft">{c.description}</p></div>, sortValue: (c) => c.code },
    { key: 'value', header: 'Discount', render: (c) => <span className="text-sm font-semibold">{value(c)}</span>, sortValue: (c) => c.value },
    { key: 'min', header: 'Min. Order', align: 'right', render: (c) => formatPKR(c.minOrder), sortValue: (c) => c.minOrder },
    { key: 'scope', header: 'Applies to', render: (c) => <span className="text-xs">{c.categories.length ? c.categories.map((x) => cats[x]?.short).join(', ') : c.sellers.length ? 'Specific seller' : 'All products'}</span> },
    { key: 'usage', header: 'Usage', render: (c) => <div className="w-28"><p className="text-xs tabular-nums">{formatNumber(c.used)} / {formatNumber(c.usageLimit)}</p><ProgressBar value={(c.used / c.usageLimit) * 100} className="mt-1" /></div>, sortValue: (c) => c.used / c.usageLimit },
    { key: 'dates', header: 'Valid', render: (c) => <span className="text-xs text-ink-soft">{formatDate(c.start)} – {formatDate(c.end)}</span>, sortValue: (c) => c.end },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} />, sortValue: (c) => c.status },
  ];
  const save = () => {
    if (!edit) return;
    if (!/^[A-Z0-9]{4,16}$/.test(edit.code)) { setErr('Code must be 4–16 letters or numbers.'); return; }
    if (coupons.some((c) => c.code === edit.code && c.id !== edit.id)) { setErr('This code already exists.'); return; }
    if (edit.end < edit.start) { setErr('End date must be after the start date.'); return; }
    upsertCoupon({ ...edit, description: edit.description || `${edit.type === 'percentage' ? `${edit.value}%` : edit.type === 'fixed' ? `Rs. ${edit.value}` : 'Free shipping'} off orders above Rs. ${edit.minOrder.toLocaleString()}`, status: edit.status === 'disabled' ? 'disabled' : new Date(edit.start) > new Date() ? 'scheduled' : 'active' });
    toast.success('Coupon saved.'); setEdit(null); setErr('');
  };
  const c = (s: Coupon['status']) => coupons.filter((x) => x.status === s).length;
  return (
    <>
      <PageHeader title="Coupons" subtitle="Platform-wide and seller-specific discount codes" actions={<Button onClick={() => setEdit(blank())}><Plus className="h-4 w-4" />Create Coupon</Button>} />
      <Card>
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All', count: coupons.length }, { value: 'active', label: 'Active', count: c('active') }, { value: 'scheduled', label: 'Scheduled', count: c('scheduled') }, { value: 'expired', label: 'Expired', count: c('expired') }, { value: 'disabled', label: 'Disabled', count: c('disabled') }]} />
        <DataTable data={coupons.filter((x) => tab === 'all' || x.status === tab)} columns={cols} rowKey={(x) => x.id} loading={loading} searchKeys={(x) => `${x.code} ${x.description}`} searchPlaceholder="Search code" selectable={false}
          rowActions={(x) => <>
            <Tooltip label="Edit"><Button size="icon-sm" variant="ghost" aria-label="Edit coupon" onClick={() => setEdit(x)}><Pencil className="h-4 w-4" /></Button></Tooltip>
            <Tooltip label="Duplicate"><Button size="icon-sm" variant="ghost" aria-label="Duplicate coupon" onClick={() => setEdit({ ...x, id: `CP${Date.now()}`, code: `${x.code}2`, used: 0 })}><Copy className="h-4 w-4" /></Button></Tooltip>
            <Tooltip label={x.status === 'disabled' ? 'Enable' : 'Disable'}><Button size="icon-sm" variant="ghost" aria-label="Toggle coupon" onClick={() => { upsertCoupon({ ...x, status: x.status === 'disabled' ? 'active' : 'disabled' }); toast.success(`${x.code} ${x.status === 'disabled' ? 'enabled' : 'disabled'}.`); }}><Power className={cn('h-4 w-4', x.status === 'disabled' ? 'text-emerald-600' : 'text-amber-600')} /></Button></Tooltip>
            <Tooltip label="Delete"><Button size="icon-sm" variant="ghost" className="text-red-600" aria-label="Delete coupon" onClick={() => setDel(x)}><Trash2 className="h-4 w-4" /></Button></Tooltip>
          </>} />
      </Card>
      <Modal open={!!edit} onClose={() => { setEdit(null); setErr(''); }} title={coupons.some((x) => x.id === edit?.id) ? 'Edit coupon' : 'Create coupon'} size="lg" footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save coupon</Button></>}>
        {edit && <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Code" htmlFor="cp-code" required className="sm:col-span-1"><Input id="cp-code" className="font-mono uppercase" value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase().replace(/\s/g, '') })} placeholder="SAVE20" /></Field>
          <Field label="Type" htmlFor="cp-type"><Select id="cp-type" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as Coupon['type'] })}><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option><option value="free_shipping">Free Shipping</option></Select></Field>
          {edit.type !== 'free_shipping' && <Field label={edit.type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (PKR)'} htmlFor="cp-val"><Input id="cp-val" type="number" value={edit.value} onChange={(e) => setEdit({ ...edit, value: Number(e.target.value) })} /></Field>}
          <Field label="Minimum Order (PKR)" htmlFor="cp-min"><Input id="cp-min" type="number" value={edit.minOrder} onChange={(e) => setEdit({ ...edit, minOrder: Number(e.target.value) })} /></Field>
          {edit.type === 'percentage' && <Field label="Maximum Discount (PKR)" htmlFor="cp-max"><Input id="cp-max" type="number" value={edit.maxDiscount ?? 0} onChange={(e) => setEdit({ ...edit, maxDiscount: Number(e.target.value) || undefined })} /></Field>}
          <Field label="Usage Limit" htmlFor="cp-lim"><Input id="cp-lim" type="number" value={edit.usageLimit} onChange={(e) => setEdit({ ...edit, usageLimit: Number(e.target.value) })} /></Field>
          <Field label="Start Date" htmlFor="cp-s"><Input id="cp-s" type="date" value={edit.start.slice(0, 10)} onChange={(e) => setEdit({ ...edit, start: e.target.value })} /></Field>
          <Field label="End Date" htmlFor="cp-e"><Input id="cp-e" type="date" value={edit.end.slice(0, 10)} onChange={(e) => setEdit({ ...edit, end: e.target.value })} /></Field>
          <Field label="Status" htmlFor="cp-st"><Select id="cp-st" value={edit.status === 'disabled' ? 'disabled' : 'active'} onChange={(e) => setEdit({ ...edit, status: e.target.value as Coupon['status'] })}><option value="active">Active</option><option value="disabled">Disabled</option></Select></Field>
          <Field label="Description" htmlFor="cp-d" className="sm:col-span-3"><Input id="cp-d" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} placeholder="Shown to customers" /></Field>
          <div className="sm:col-span-3"><p className="mb-2 text-[13px] font-semibold">Applicable Categories <span className="font-normal text-ink-soft">(none = all)</span></p><div className="flex flex-wrap gap-x-4 gap-y-2">{Object.values(cats).map((ct) => <Checkbox key={ct.slug} checked={edit.categories.includes(ct.slug)} onChange={(v) => setEdit({ ...edit, categories: v ? [...edit.categories, ct.slug] : edit.categories.filter((x) => x !== ct.slug) })} label={ct.short} />)}</div></div>
          <Field label="Applicable Sellers" htmlFor="cp-sel" className="sm:col-span-3"><Select id="cp-sel" value={edit.sellers[0] ?? ''} onChange={(e) => setEdit({ ...edit, sellers: e.target.value ? [e.target.value] : [] })}><option value="">All sellers</option>{sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
          {err && <p role="alert" className="text-sm font-medium text-red-600 sm:col-span-3">{err}</p>}
        </div>}
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} tone="danger" title={`Delete ${del?.code}?`} confirmLabel="Delete" message="Customers will no longer be able to use this code." onConfirm={() => { deleteCoupon(del!.id); toast.success('Coupon deleted.'); }} />
    </>
  );
}
