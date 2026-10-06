import { useState } from 'react';
import { Plus, Pencil, Trash2, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useCategoryMap, useSellerMap } from '@/hooks/useCatalog';
import { useAdminStats } from '@/hooks/useAdminStats';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard } from '@/components/dashboard';
import { Card } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Field, Select } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal, ConfirmDialog } from '@/components/ui/Overlay';
import { formatDate, formatPKRCompact } from '@/utils/format';
import { DEFAULT_COMMISSION } from '@/data/marketing';
import type { CommissionRule } from '@/types';

export default function AdminCommissions() {
  usePageMeta('Commissions · Admin');
  const rules = useMarket((s) => s.commissions);
  const { upsertCommission, deleteCommission } = useMarket();
  const sellersList = useMarket((s) => s.sellers);
  const cats = useCategoryMap();
  const sellers = useSellerMap();
  const stats = useAdminStats();
  const [edit, setEdit] = useState<CommissionRule | null>(null);
  const [del, setDel] = useState<CommissionRule | null>(null);
  const cols: Column<CommissionRule>[] = [
    { key: 'seller', header: 'Seller', primary: true, render: (r) => <span className="font-semibold">{r.seller === 'all' ? 'All sellers' : sellers[r.seller]?.name}</span>, sortValue: (r) => r.seller },
    { key: 'category', header: 'Category', render: (r) => cats[r.category]?.name ?? r.category, sortValue: (r) => r.category },
    { key: 'rate', header: 'Commission %', align: 'right', render: (r) => <span className="rounded-md bg-brand-50 px-2 py-0.5 font-bold text-brand-700">{r.rate}%</span>, sortValue: (r) => r.rate },
    { key: 'effective', header: 'Effective Date', render: (r) => formatDate(r.effective), sortValue: (r) => r.effective },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
  ];
  const save = () => {
    if (!edit || edit.rate < 0 || edit.rate > 40) { toast.error('Commission must be between 0% and 40%.'); return; }
    upsertCommission(edit); toast.success('Commission rule saved.'); setEdit(null);
  };
  return (
    <>
      <PageHeader title="Commissions" subtitle={`Default rate ${DEFAULT_COMMISSION}% applies when no rule matches. Seller-specific rules override category rules.`} actions={<Button onClick={() => setEdit({ id: `CM${Date.now()}`, category: 'electronics', seller: 'all', rate: 8, effective: new Date().toISOString().slice(0, 10), status: 'active' })}><Plus className="h-4 w-4" />Add Rule</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard featured label="Blended commission" value={`${stats.blendedCommission.toFixed(2)}%`} icon={<Percent className="h-5 w-5" />} hint="GMV-weighted" />
        <KpiCard label="Commission earned" value={formatPKRCompact(stats.gmv * stats.blendedCommission / 100)} icon={<Percent className="h-5 w-5" />} tone="success" hint="Trailing 12 months" />
        <KpiCard label="Active rules" value={rules.filter((r) => r.status === 'active').length} icon={<Percent className="h-5 w-5" />} tone="violet" />
        <KpiCard label="Seller overrides" value={rules.filter((r) => r.seller !== 'all').length} icon={<Percent className="h-5 w-5" />} tone="accent" />
      </div>
      <Card className="mt-6"><DataTable data={rules} columns={cols} rowKey={(r) => r.id} searchKeys={(r) => `${cats[r.category]?.name} ${sellers[r.seller]?.name ?? 'all'}`} searchPlaceholder="Search category or seller" selectable={false}
        rowActions={(r) => <><Button size="icon-sm" variant="ghost" aria-label="Edit rule" onClick={() => setEdit(r)}><Pencil className="h-4 w-4" /></Button><Button size="icon-sm" variant="ghost" className="text-red-600" aria-label="Delete rule" onClick={() => setDel(r)}><Trash2 className="h-4 w-4" /></Button></>} /></Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Commission rule" footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save rule</Button></>}>
        {edit && <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Category" htmlFor="cr-c"><Select id="cr-c" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{Object.values(cats).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select></Field>
          <Field label="Seller" htmlFor="cr-s"><Select id="cr-s" value={edit.seller} onChange={(e) => setEdit({ ...edit, seller: e.target.value })}><option value="all">All sellers</option>{sellersList.filter((s) => s.status === 'approved').map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
          <Field label="Commission %" htmlFor="cr-r"><Input id="cr-r" type="number" step="0.5" value={edit.rate} onChange={(e) => setEdit({ ...edit, rate: Number(e.target.value) })} /></Field>
          <Field label="Effective date" htmlFor="cr-d"><Input id="cr-d" type="date" value={edit.effective.slice(0, 10)} onChange={(e) => setEdit({ ...edit, effective: e.target.value, status: new Date(e.target.value) > new Date() ? 'scheduled' : 'active' })} /></Field>
          <Field label="Status" htmlFor="cr-st"><Select id="cr-st" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as CommissionRule['status'] })}><option value="active">Active</option><option value="scheduled">Scheduled</option><option value="inactive">Inactive</option></Select></Field>
        </div>}
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} tone="danger" title="Delete rule?" confirmLabel="Delete" message="Orders will fall back to the category or default commission rate." onConfirm={() => { deleteCommission(del!.id); toast.success('Rule deleted.'); }} />
    </>
  );
}
