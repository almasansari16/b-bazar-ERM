import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Upload, Download, Pencil, Eye, Trash2, Copy, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { useSeller } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { useCategoryMap } from '@/hooks/useCatalog';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { Card, Tabs } from '@/components/ui/Display';
import { Button, LinkButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ConfirmDialog, Modal, Tooltip } from '@/components/ui/Overlay';
import { SmartImage } from '@/components/common/SmartImage';
import { formatPKR, formatNumber } from '@/utils/format';
import { downloadCSV } from '@/utils/csv';
import type { Product } from '@/types';

type Tab = 'all' | 'active' | 'draft' | 'out' | 'low' | 'pending' | 'rejected';
export default function SellerProducts() {
  usePageMeta('Products · Seller Center');
  const { products, seller } = useSeller();
  const cats = useCategoryMap();
  const { setProductStatus, deleteProduct, addProduct } = useMarket();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const loading = useSimulatedLoad('sprod', 450);
  const [tab, setTab] = useState<Tab>('all');
  const [del, setDel] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const match: Record<Tab, (p: Product) => boolean> = {
    all: () => true, active: (p) => p.status === 'approved' && p.stock > 0, draft: (p) => p.status === 'draft', out: (p) => p.status === 'approved' && p.stock === 0,
    low: (p) => p.status === 'approved' && p.stock > 0 && p.stock <= p.lowStockThreshold, pending: (p) => p.status === 'pending', rejected: (p) => p.status === 'rejected',
  };
  const list = useMemo(() => products.filter(match[tab]).filter((p) => !params.get('q') || p.title.toLowerCase().includes(params.get('q')!.toLowerCase())), [products, tab, params]); // eslint-disable-line react-hooks/exhaustive-deps
  const statusOf = (p: Product) => (p.status !== 'approved' ? p.status : p.stock === 0 ? 'out_of_stock' : p.stock <= p.lowStockThreshold ? 'low_stock' : 'active');
  const cols: Column<Product>[] = [
    { key: 'product', header: 'Product', primary: true, render: (p) => <div className="flex items-center gap-3"><SmartImage src={p.images[0]} alt="" icon={p.icon} tint={seller.color} className="h-11 w-11 shrink-0 rounded-lg" /><div className="min-w-0"><p className="line-clamp-1 max-w-[240px] font-medium">{p.title}</p><p className="text-xs text-ink-soft">{p.brand}</p></div></div>, sortValue: (p) => p.title },
    { key: 'sku', header: 'SKU', render: (p) => <span className="font-mono text-xs text-ink-soft">{p.sku}</span> },
    { key: 'category', header: 'Category', render: (p) => <span className="text-xs">{cats[p.category]?.short} · {p.subcategory}</span>, sortValue: (p) => p.category },
    { key: 'price', header: 'Price', align: 'right', render: (p) => <span className="tabular-nums">{formatPKR(p.price)}</span>, sortValue: (p) => p.price },
    { key: 'stock', header: 'Stock', align: 'right', render: (p) => <span className={p.stock === 0 ? 'font-bold text-red-600' : p.stock <= p.lowStockThreshold ? 'font-bold text-amber-600' : 'tabular-nums'}>{p.stock}</span>, sortValue: (p) => p.stock },
    { key: 'sales', header: 'Sales', align: 'right', render: (p) => <span className="tabular-nums">{formatNumber(p.sold)}</span>, sortValue: (p) => p.sold },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={statusOf(p)} />, sortValue: (p) => statusOf(p) },
  ];
  const c = (t: Tab) => products.filter(match[t]).length;
  return (
    <>
      <PageHeader title="Products" subtitle={`${products.length} listings in ${seller.name}`} actions={<>
        <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" />Import Products</Button>
        <Button variant="outline" onClick={() => { downloadCSV('products.csv', list.map((p) => ({ sku: p.sku, title: p.title, price: p.price, stock: p.stock, status: p.status }))); toast.success('Product list exported.'); }}><Download className="h-4 w-4" />Export</Button>
        <LinkButton to="/seller/products/new"><Plus className="h-4 w-4" />Add Product</LinkButton>
      </>} />
      <Card>
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All', count: c('all') }, { value: 'active', label: 'Active', count: c('active') }, { value: 'draft', label: 'Draft', count: c('draft') }, { value: 'out', label: 'Out of Stock', count: c('out') }, { value: 'low', label: 'Low Stock', count: c('low') }, { value: 'pending', label: 'Pending Approval', count: c('pending') }, { value: 'rejected', label: 'Rejected', count: c('rejected') }]} />
        <DataTable data={list} columns={cols} rowKey={(p) => p.id} loading={loading} searchKeys={(p) => `${p.title} ${p.sku} ${p.brand}`} searchPlaceholder="Search name, SKU or brand"
          onRowClick={(p) => nav(`/seller/products/${p.id}`)}
          bulkActions={(ids, clear) => <>
            <Button size="xs" variant="outline" onClick={() => { ids.forEach((id) => setProductStatus(id, 'draft')); toast.success(`${ids.length} products moved to draft.`); clear(); }}><Archive className="h-3.5 w-3.5" />Unpublish</Button>
            <Button size="xs" variant="outline" className="text-red-600" onClick={() => { ids.forEach(deleteProduct); toast.success(`${ids.length} products deleted.`); clear(); }}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
          </>}
          rowActions={(p) => <>
            <Tooltip label="Edit"><Button size="icon-sm" variant="ghost" aria-label={`Edit ${p.title}`} onClick={() => nav(`/seller/products/${p.id}`)}><Pencil className="h-4 w-4" /></Button></Tooltip>
            <Tooltip label="View in store"><Button size="icon-sm" variant="ghost" aria-label={`View ${p.title}`} onClick={() => nav(`/product/${p.id}`)}><Eye className="h-4 w-4" /></Button></Tooltip>
            <Tooltip label="Duplicate"><Button size="icon-sm" variant="ghost" aria-label={`Duplicate ${p.title}`} onClick={() => { addProduct({ ...p, id: `P${Date.now()}`, title: `${p.title} (Copy)`, status: 'draft', sold: 0, sku: `${p.sku}-C` }); toast.success('Product duplicated as draft.'); }}><Copy className="h-4 w-4" /></Button></Tooltip>
            <Tooltip label="Delete"><Button size="icon-sm" variant="ghost" className="text-red-600" aria-label={`Delete ${p.title}`} onClick={() => setDel(p)}><Trash2 className="h-4 w-4" /></Button></Tooltip>
          </>}
          emptyTitle="No products in this view" emptyMessage="Add a product to start selling." />
      </Card>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} tone="danger" title="Delete product?" message={`“${del?.title}” will be removed from your store and the marketplace.`} confirmLabel="Delete" onConfirm={() => { deleteProduct(del!.id); toast.success('Product deleted.'); }} />
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import products" description="Upload a CSV using the B-Bazar product template." footer={<><Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button><Button onClick={() => { setImportOpen(false); toast.success('Import queued — 0 rows processed (demo).'); }}>Upload</Button></>}>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line p-8 text-center hover:border-brand-300"><Upload className="h-8 w-8 text-brand-600" /><span className="text-sm font-semibold">Drop CSV here or click to browse</span><span className="text-xs text-ink-soft">Max 5,000 rows · .csv or .xlsx</span><input type="file" accept=".csv,.xlsx" className="sr-only" onChange={(e) => e.target.files?.[0] && toast.info(`Selected ${e.target.files[0].name}`)} /></label>
      </Modal>
    </>
  );
}
