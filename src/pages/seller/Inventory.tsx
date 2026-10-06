import { useState } from 'react';
import { Boxes, AlertTriangle, PackageX, RefreshCw, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useSeller } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, KpiCard } from '@/components/dashboard';
import { Card, Tabs, ProgressBar } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Overlay';
import { SmartImage } from '@/components/common/SmartImage';
import { formatPKRCompact, formatNumber } from '@/utils/format';
import type { Product } from '@/types';

type Tab = 'all' | 'low' | 'out' | 'healthy';
export default function Inventory() {
  usePageMeta('Inventory · Seller Center');
  const { products } = useSeller();
  const update = useMarket((s) => s.updateProduct);
  const loading = useSimulatedLoad('inv', 450);
  const [tab, setTab] = useState<Tab>('all');
  const [restock, setRestock] = useState<Product | null>(null);
  const [qty, setQty] = useState(25);
  const live = products.filter((p) => p.status === 'approved');
  const value = live.reduce((n, p) => n + p.price * p.stock, 0);
  const low = live.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const out = live.filter((p) => p.stock === 0);
  const sold = live.reduce((n, p) => n + p.sold, 0);
  const avgStock = live.reduce((n, p) => n + p.stock, 0) / Math.max(1, live.length);
  const turnover = (sold / 12 / Math.max(1, avgStock * live.length)) * 12;
  const statusOf = (p: Product) => (p.stock === 0 ? 'out_of_stock' : p.stock <= p.lowStockThreshold ? 'low_stock' : 'in_stock');
  const list = live.filter((p) => tab === 'all' || (tab === 'low' ? low.includes(p) : tab === 'out' ? out.includes(p) : statusOf(p) === 'in_stock'));
  const cols: Column<Product>[] = [
    { key: 'product', header: 'Product', primary: true, render: (p) => <div className="flex items-center gap-3"><SmartImage src={p.images[0]} alt="" icon={p.icon} className="h-10 w-10 shrink-0 rounded-lg" /><span className="line-clamp-1 max-w-[240px] font-medium">{p.title}</span></div>, sortValue: (p) => p.title },
    { key: 'sku', header: 'SKU', render: (p) => <span className="font-mono text-xs text-ink-soft">{p.sku}</span> },
    { key: 'available', header: 'Available', align: 'right', render: (p) => <div className="w-24 text-right"><span className="font-semibold tabular-nums">{p.stock - p.reserved}</span><ProgressBar value={Math.min(100, (p.stock / (p.lowStockThreshold * 6)) * 100)} tone={p.stock === 0 ? 'danger' : p.stock <= p.lowStockThreshold ? 'warning' : 'success'} className="mt-1" /></div>, sortValue: (p) => p.stock },
    { key: 'reserved', header: 'Reserved', align: 'right', render: (p) => <span className="tabular-nums text-ink-soft">{p.reserved}</span>, sortValue: (p) => p.reserved },
    { key: 'sold', header: 'Sold', align: 'right', render: (p) => <span className="tabular-nums">{formatNumber(p.sold)}</span>, sortValue: (p) => p.sold },
    { key: 'reorder', header: 'Reorder Level', align: 'right', render: (p) => <span className="tabular-nums">{p.lowStockThreshold}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={statusOf(p)} />, sortValue: (p) => p.stock },
  ];
  return (
    <>
      <PageHeader title="Inventory" subtitle="Track stock levels and restock before you run out" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard loading={loading} featured label="Total Inventory Value" value={formatPKRCompact(value)} icon={<Boxes className="h-5 w-5" />} hint={`${formatNumber(live.reduce((n, p) => n + p.stock, 0))} units on hand`} />
        <KpiCard loading={loading} label="Low Stock" value={low.length} icon={<AlertTriangle className="h-5 w-5" />} tone="warning" hint="At or below reorder level" />
        <KpiCard loading={loading} label="Out of Stock" value={out.length} icon={<PackageX className="h-5 w-5" />} tone="danger" hint="Hidden from search results" />
        <KpiCard loading={loading} label="Inventory Turnover" value={`${turnover.toFixed(1)}×`} icon={<RefreshCw className="h-5 w-5" />} tone="success" hint="Annualised" />
      </div>
      <Card className="mt-6">
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All', count: live.length }, { value: 'low', label: 'Low Stock', count: low.length }, { value: 'out', label: 'Out of Stock', count: out.length }, { value: 'healthy', label: 'Healthy' }]} />
        <DataTable data={list} columns={cols} rowKey={(p) => p.id} loading={loading} searchKeys={(p) => `${p.title} ${p.sku}`} searchPlaceholder="Search product or SKU"
          bulkActions={(ids, clear) => <Button size="xs" variant="outline" onClick={() => { ids.forEach((id) => { const p = live.find((x) => x.id === id)!; update(id, { stock: p.stock + 50 }); }); toast.success(`Added 50 units to ${ids.length} products.`); clear(); }}><Plus className="h-3.5 w-3.5" />Restock +50</Button>}
          rowActions={(p) => <Button size="xs" variant={p.stock <= p.lowStockThreshold ? 'primary' : 'outline'} onClick={() => { setRestock(p); setQty(Math.max(25, p.lowStockThreshold * 3)); }}>Restock</Button>} />
      </Card>
      <Modal open={!!restock} onClose={() => setRestock(null)} title="Update stock" description={restock?.title} footer={<><Button variant="outline" onClick={() => setRestock(null)}>Cancel</Button><Button onClick={() => { update(restock!.id, { stock: restock!.stock + qty }); toast.success(`Stock updated: ${restock!.stock + qty} units.`); setRestock(null); }}>Add {qty} units</Button></>}>
        <div className="flex items-end gap-3">
          <Field label="Units to add" htmlFor="rq" className="flex-1"><Input id="rq" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} /></Field>
          <Button variant="outline" size="icon" onClick={() => setQty((q) => Math.max(1, q - 10))} aria-label="Minus 10"><Minus className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => setQty((q) => q + 10)} aria-label="Plus 10"><Plus className="h-4 w-4" /></Button>
        </div>
        <p className="mt-3 text-sm text-ink-soft">Current: <b className="text-ink">{restock?.stock}</b> → New: <b className="text-ink">{(restock?.stock ?? 0) + qty}</b></p>
      </Modal>
    </>
  );
}
