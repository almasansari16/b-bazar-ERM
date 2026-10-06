import { useState } from 'react';
import { Check, EyeOff, Trash2, Flag, Search as SearchIcon, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useProductMap, useSellerMap } from '@/hooks/useCatalog';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { Card, Tabs, Rating } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Tooltip, ConfirmDialog, Modal } from '@/components/ui/Overlay';
import { formatDate } from '@/utils/format';
import type { Review } from '@/types';

type Tab = 'all' | Review['status'];
export default function AdminReviews() {
  usePageMeta('Reviews · Admin');
  const reviews = useMarket((s) => s.reviews);
  const { setReviewStatus, deleteReview } = useMarket();
  const products = useProductMap();
  const sellers = useSellerMap();
  const loading = useSimulatedLoad('arev', 400);
  const [tab, setTab] = useState<Tab>('flagged');
  const [del, setDel] = useState<Review | null>(null);
  const [inv, setInv] = useState<Review | null>(null);
  const c = (s: Review['status']) => reviews.filter((r) => r.status === s).length;
  const cols: Column<Review>[] = [
    { key: 'review', header: 'Review', primary: true, render: (r) => <div className="max-w-[320px]"><div className="flex items-center gap-2"><Rating value={r.rating} showValue={false} size="xs" /><b className="text-sm">{r.title}</b></div><p className="line-clamp-2 text-xs text-ink-soft">{r.body}</p></div>, sortValue: (r) => r.rating },
    { key: 'customer', header: 'Customer', render: (r) => <span className="flex items-center gap-1 text-sm">{r.customerName}{r.verified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-label="Verified purchase" />}</span>, sortValue: (r) => r.customerName },
    { key: 'product', header: 'Product', render: (r) => <span className="line-clamp-1 max-w-[180px] text-xs">{products[r.productId]?.title}</span> },
    { key: 'seller', header: 'Seller', render: (r) => <span className="text-xs">{sellers[r.sellerId]?.name}</span> },
    { key: 'date', header: 'Date', render: (r) => <span className="text-xs text-ink-soft">{formatDate(r.date)}</span>, sortValue: (r) => r.date },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
  ];
  const act = (r: Review, s: Review['status'], msg: string) => { setReviewStatus(r.id, s); toast.success(msg); };
  return (
    <>
      <PageHeader title="Reviews & Moderation" subtitle="Keep ratings trustworthy — approve, hide or investigate" />
      <Card>
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All', count: reviews.length }, { value: 'flagged', label: 'Flagged', count: c('flagged') }, { value: 'pending', label: 'Pending', count: c('pending') }, { value: 'published', label: 'Published', count: c('published') }, { value: 'hidden', label: 'Hidden', count: c('hidden') }]} />
        <DataTable data={reviews.filter((r) => tab === 'all' || r.status === tab)} columns={cols} rowKey={(r) => r.id} loading={loading} searchKeys={(r) => `${r.title} ${r.body} ${r.customerName}`} searchPlaceholder="Search review text or customer" emptyTitle="Nothing to moderate"
          bulkActions={(ids, clear) => <><Button size="xs" variant="success" onClick={() => { ids.forEach((id) => setReviewStatus(id, 'published')); toast.success(`${ids.length} reviews approved.`); clear(); }}>Approve</Button><Button size="xs" variant="outline" onClick={() => { ids.forEach((id) => setReviewStatus(id, 'hidden')); toast(`${ids.length} reviews hidden.`); clear(); }}>Hide</Button></>}
          rowActions={(r) => <>
            {r.status !== 'published' && <Tooltip label="Approve"><Button size="icon-sm" variant="success" aria-label="Approve review" onClick={() => act(r, 'published', 'Review approved and published.')}><Check className="h-4 w-4" /></Button></Tooltip>}
            {r.status !== 'hidden' && <Tooltip label="Hide"><Button size="icon-sm" variant="ghost" aria-label="Hide review" onClick={() => act(r, 'hidden', 'Review hidden from the product page.')}><EyeOff className="h-4 w-4" /></Button></Tooltip>}
            {r.status !== 'flagged' && <Tooltip label="Flag"><Button size="icon-sm" variant="ghost" aria-label="Flag review" onClick={() => act(r, 'flagged', 'Review flagged for follow-up.')}><Flag className="h-4 w-4" /></Button></Tooltip>}
            <Tooltip label="Investigate"><Button size="icon-sm" variant="ghost" aria-label="Investigate review" onClick={() => setInv(r)}><SearchIcon className="h-4 w-4" /></Button></Tooltip>
            <Tooltip label="Delete"><Button size="icon-sm" variant="ghost" className="text-red-600" aria-label="Delete review" onClick={() => setDel(r)}><Trash2 className="h-4 w-4" /></Button></Tooltip>
          </>} />
      </Card>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} tone="danger" title="Delete review permanently?" confirmLabel="Delete" message="This cannot be undone. Prefer “Hide” if the review may be restored later." onConfirm={() => { deleteReview(del!.id); toast.success('Review deleted.'); }} />
      <Modal open={!!inv} onClose={() => setInv(null)} title="Investigation" description={inv?.id} footer={<Button onClick={() => setInv(null)}>Close</Button>}>
        {inv && <ul className="space-y-2 text-sm">
          <li className="flex justify-between"><span className="text-ink-soft">Verified purchase</span><b>{inv.verified ? 'Yes' : 'No'}</b></li>
          <li className="flex justify-between"><span className="text-ink-soft">Reviewer's other reviews (30d)</span><b>{reviews.filter((x) => x.customerName === inv.customerName).length}</b></li>
          <li className="flex justify-between"><span className="text-ink-soft">Same-IP accounts</span><b>0</b></li>
          <li className="flex justify-between"><span className="text-ink-soft">Spam / toxicity score</span><b className={inv.rating <= 2 ? 'text-amber-600' : 'text-emerald-600'}>{inv.rating <= 2 ? 'Medium (0.41)' : 'Low (0.06)'}</b></li>
          <li className="rounded-lg bg-muted p-3 text-ink-soft">“{inv.body}”</li>
        </ul>}
      </Modal>
    </>
  );
}
