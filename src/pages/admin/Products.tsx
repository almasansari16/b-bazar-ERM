import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Ban, Eye, Pencil, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useSellerMap, useCategoryMap } from '@/hooks/useCatalog';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminService } from '@/services';
import { PageHeader } from '@/components/dashboard';
import { Card, Tabs, PriceDisplay } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal, Drawer, Tooltip } from '@/components/ui/Overlay';
import { Select, Textarea, Field, Input } from '@/components/ui/Form';
import { SmartImage } from '@/components/common/SmartImage';
import { formatPKR, timeAgo } from '@/utils/format';
import type { Product, ProductStatus } from '@/types';

type Tab = 'pending' | 'approved' | 'rejected' | 'suspended';
export default function AdminProducts() {
  usePageMeta('Products · Admin');
  const products = useMarket((s) => s.products);
  const { setProductStatus, updateProduct } = useMarket();
  const sellers = useSellerMap();
  const cats = useCategoryMap();
  const nav = useNavigate();
  const loading = useSimulatedLoad('aprod', 450);
  const [tab, setTab] = useState<Tab>('pending');
  const [reject, setReject] = useState<Product | null>(null);
  const [reason, setReason] = useState('Images do not meet quality guidelines');
  const [view, setView] = useState<Product | null>(null);
  const [edit, setEdit] = useState<Product | null>(null);
  const list = useMemo(() => products.filter((p) => p.status === tab).sort((a, b) => (b.submittedAt ?? b.createdAt).localeCompare(a.submittedAt ?? a.createdAt)), [products, tab]);
  const approve = async (p: Product) => { await adminService.approveProduct(p.id); toast.success('Product approved — now visible to customers.', { description: p.title }); setView(null); };
  const set = (p: Product, s: ProductStatus, msg: string) => { setProductStatus(p.id, s); toast(msg, { description: p.title }); setView(null); };
  const cols: Column<Product>[] = [
    { key: 'product', header: 'Product', primary: true, render: (p) => <div className="flex items-center gap-3"><SmartImage src={p.images[0]} alt="" icon={p.icon} tint={sellers[p.sellerId]?.color} className="h-11 w-11 shrink-0 rounded-lg" /><div className="min-w-0"><p className="line-clamp-1 max-w-[240px] font-medium">{p.title}</p><p className="font-mono text-[11px] text-ink-soft">{p.sku}</p></div></div>, sortValue: (p) => p.title },
    { key: 'seller', header: 'Seller', render: (p) => sellers[p.sellerId]?.name, sortValue: (p) => sellers[p.sellerId]?.name ?? '' },
    { key: 'category', header: 'Category', render: (p) => <span className="text-xs">{cats[p.category]?.short}</span>, sortValue: (p) => p.category },
    { key: 'price', header: 'Price', align: 'right', render: (p) => <span className="tabular-nums">{formatPKR(p.price)}</span>, sortValue: (p) => p.price },
    { key: 'stock', header: 'Stock', align: 'right', render: (p) => p.stock, sortValue: (p) => p.stock },
    { key: 'submitted', header: 'Submitted', render: (p) => <span className="text-xs text-ink-soft">{timeAgo(p.submittedAt ?? p.createdAt)}</span>, sortValue: (p) => p.submittedAt ?? p.createdAt },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} />, sortValue: (p) => p.status },
  ];
  const c = (s: Tab) => products.filter((p) => p.status === s).length;
  return (
    <>
      <PageHeader title="Products" subtitle="Moderate listings before they reach customers" />
      <Card>
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[{ value: 'pending', label: 'Pending Approval', count: c('pending') }, { value: 'approved', label: 'Approved', count: c('approved') }, { value: 'rejected', label: 'Rejected', count: c('rejected') }, { value: 'suspended', label: 'Suspended', count: c('suspended') }]} />
        <DataTable data={list} columns={cols} rowKey={(p) => p.id} loading={loading} searchKeys={(p) => `${p.title} ${p.sku} ${sellers[p.sellerId]?.name}`} searchPlaceholder="Search product, SKU or seller" onRowClick={setView}
          emptyTitle={tab === 'pending' ? 'Moderation queue is empty' : 'No products here'} emptyMessage={tab === 'pending' ? 'New seller submissions will appear here.' : undefined}
          bulkActions={tab === 'pending' ? (ids, clear) => <Button size="xs" variant="success" onClick={() => { ids.forEach((id) => setProductStatus(id, 'approved')); toast.success(`${ids.length} products approved.`); clear(); }}>Approve all</Button> : tab === 'approved' ? (ids, clear) => <Button size="xs" variant="outline" onClick={() => { ids.forEach((id) => setProductStatus(id, 'suspended')); toast(`${ids.length} products suspended.`); clear(); }}>Suspend</Button> : undefined}
          rowActions={(p) => <>
            <Tooltip label="View"><Button size="icon-sm" variant="ghost" aria-label="View" onClick={() => setView(p)}><Eye className="h-4 w-4" /></Button></Tooltip>
            <Tooltip label="Edit"><Button size="icon-sm" variant="ghost" aria-label="Edit" onClick={() => setEdit(p)}><Pencil className="h-4 w-4" /></Button></Tooltip>
            {p.status !== 'approved' && <Tooltip label="Approve"><Button size="icon-sm" variant="success" aria-label="Approve" onClick={() => approve(p)}><Check className="h-4 w-4" /></Button></Tooltip>}
            {p.status === 'pending' && <Tooltip label="Reject"><Button size="icon-sm" variant="outline" aria-label="Reject" onClick={() => setReject(p)}><X className="h-4 w-4" /></Button></Tooltip>}
            {p.status === 'approved' && <Tooltip label="Suspend"><Button size="icon-sm" variant="ghost" className="text-red-600" aria-label="Suspend" onClick={() => set(p, 'suspended', 'Product suspended.')}><Ban className="h-4 w-4" /></Button></Tooltip>}
            {p.status === 'rejected' && <Tooltip label="Move to pending"><Button size="icon-sm" variant="ghost" aria-label="Re-review" onClick={() => set(p, 'pending', 'Moved back to review.')}><RotateCcw className="h-4 w-4" /></Button></Tooltip>}
          </>} />
      </Card>
      <Drawer open={!!view} onClose={() => setView(null)} title="Review listing" width="max-w-lg" footer={view && <div className="flex flex-wrap gap-2">
        {view.status !== 'approved' && <Button variant="success" className="flex-1" onClick={() => approve(view)}><Check className="h-4 w-4" />Approve</Button>}
        {view.status === 'pending' && <Button variant="outline" className="flex-1 text-red-600" onClick={() => setReject(view)}>Reject</Button>}
        {view.status === 'approved' && <><Button variant="outline" className="flex-1" onClick={() => nav(`/product/${view.id}`)}>View on site</Button><Button variant="outline" className="flex-1 text-red-600" onClick={() => set(view, 'suspended', 'Product suspended.')}>Suspend</Button></>}
      </div>}>
        {view && <div className="space-y-4 p-5">
          <SmartImage src={view.images[0]} alt={view.title} icon={view.icon} tint={sellers[view.sellerId]?.color} className="aspect-video rounded-xl" />
          <div><StatusBadge status={view.status} /><h3 className="mt-2 text-lg font-bold">{view.title}</h3><p className="text-sm text-ink-soft">{view.brand} · {sellers[view.sellerId]?.name} · {cats[view.category]?.name} › {view.subcategory}</p></div>
          <PriceDisplay price={view.price} original={view.originalPrice} size="lg" />
          <p className="text-sm text-ink/85">{view.description}</p>
          <ul className="space-y-1.5 rounded-xl bg-muted p-4 text-sm">{[['Images', view.images.filter(Boolean).length >= 1], ['Description ≥ 30 chars', view.description.length >= 30], ['Price below compare-at', view.originalPrice >= view.price], ['Prohibited keywords', true]].map(([k, ok]) => <li key={k as string} className="flex items-center gap-2">{ok ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-red-600" />}{k as string}</li>)}</ul>
        </div>}
      </Drawer>
      <Modal open={!!reject} onClose={() => setReject(null)} title="Reject product" description={reject?.title} footer={<><Button variant="outline" onClick={() => setReject(null)}>Cancel</Button><Button variant="danger" onClick={() => { set(reject!, 'rejected', 'Product rejected — seller notified.'); setReject(null); }}>Reject listing</Button></>}>
        <div className="space-y-3"><Field label="Reason" htmlFor="rj"><Select id="rj" value={reason} onChange={(e) => setReason(e.target.value)}>{['Images do not meet quality guidelines', 'Incomplete or misleading description', 'Counterfeit / brand authorisation required', 'Prohibited item', 'Pricing error'].map((r) => <option key={r}>{r}</option>)}</Select></Field><Field label="Note to seller" htmlFor="rjn"><Textarea id="rjn" placeholder="Explain what needs to change before resubmitting" /></Field></div>
      </Modal>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit product" description="Admin override — changes apply immediately" footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={() => { updateProduct(edit!.id, { title: edit!.title, price: edit!.price, stock: edit!.stock }); toast.success('Product updated.'); setEdit(null); }}>Save</Button></>}>
        {edit && <div className="grid gap-3 sm:grid-cols-2"><Field label="Title" htmlFor="et" className="sm:col-span-2"><Input id="et" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field><Field label="Price" htmlFor="ep"><Input id="ep" type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></Field><Field label="Stock" htmlFor="es"><Input id="es" type="number" value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: Number(e.target.value) })} /></Field></div>}
      </Modal>
    </>
  );
}
