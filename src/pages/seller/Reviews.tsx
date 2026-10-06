import { useState } from 'react';
import { Star, MessageSquareReply, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useSeller } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { Card, Rating, EmptyState, ProgressBar } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Overlay';
import { Avatar } from '@/components/ui/Avatar';
import { SmartImage } from '@/components/common/SmartImage';
import { formatDate } from '@/utils/format';
import type { Review } from '@/types';

export default function SellerReviews() {
  usePageMeta('Reviews · Seller Center');
  const { sellerId, products, seller } = useSeller();
  const reviews = useMarket((s) => s.reviews).filter((r) => r.sellerId === sellerId && r.status !== 'hidden');
  const reply = useMarket((s) => s.replyReview);
  const [star, setStar] = useState(0);
  const [replying, setReplying] = useState<Review | null>(null);
  const [text, setText] = useState('');
  const [onlyUnanswered, setOnlyUnanswered] = useState(false);
  const list = reviews.filter((r) => (!star || r.rating === star) && (!onlyUnanswered || !r.sellerReply));
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.rating === s).length }));
  return (
    <>
      <PageHeader title="Reviews" subtitle="Respond to feedback — public replies build trust" />
      <div className="grid items-start gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="p-5">
          <p className="text-4xl font-extrabold">{seller.rating}</p><Rating value={seller.rating} showValue={false} size="md" /><p className="text-sm text-ink-soft">{reviews.length} recent reviews</p>
          <div className="mt-4 space-y-1.5" role="group" aria-label="Filter by rating">
            <button type="button" onClick={() => setStar(0)} aria-pressed={star === 0} className={cn('w-full rounded-md px-2 py-1.5 text-left text-sm font-semibold', star === 0 ? 'bg-brand-50 text-brand-700' : 'hover:bg-muted')}>All ratings</button>
            {dist.map((d) => <button key={d.s} type="button" onClick={() => setStar(d.s)} aria-pressed={star === d.s} className={cn('flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs', star === d.s ? 'bg-brand-50 font-semibold text-brand-700' : 'hover:bg-muted')}><span className="w-12">{d.s} Star</span><ProgressBar value={(d.n / Math.max(1, reviews.length)) * 100} tone="warning" className="flex-1" /><span className="w-5 text-right">{d.n}</span></button>)}
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyUnanswered} onChange={(e) => setOnlyUnanswered(e.target.checked)} className="accent-brand-600" />Only unanswered</label>
        </Card>
        <Card>
          {list.length === 0 ? <EmptyState icon={<Star className="h-7 w-7" />} title="No reviews match" message="Try another rating filter." /> : (
            <ul className="divide-y divide-line">
              {list.map((r) => {
                const p = products.find((x) => x.id === r.productId);
                return (
                  <li key={r.id} className="p-5">
                    <div className="flex flex-wrap items-start gap-3">
                      <Avatar name={r.customerName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">{r.customerName}{r.verified && <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" />Verified</span>}<span className="text-xs font-normal text-ink-soft">{formatDate(r.date)}</span></p>
                        <div className="mt-1 flex items-center gap-2"><Rating value={r.rating} showValue={false} size="xs" /><b className="text-sm">{r.title}</b></div>
                        <p className="mt-1 text-sm text-ink/85">{r.body}</p>
                        {p && <p className="mt-2 flex items-center gap-2 text-xs text-ink-soft"><SmartImage src={p.images[0]} alt="" icon={p.icon} className="h-6 w-6 rounded" />{p.title}</p>}
                        {r.sellerReply ? <div className="mt-3 rounded-lg border-l-2 border-brand-600 bg-brand-50/60 p-3 text-sm"><p className="text-xs font-bold text-brand-700">Your response</p>{r.sellerReply}</div>
                          : <Button size="xs" variant="secondary" className="mt-3" onClick={() => { setReplying(r); setText(r.rating >= 4 ? 'Thank you for your kind words! We look forward to serving you again.' : "We're sorry about your experience. Our team will contact you to make it right."); }}><MessageSquareReply className="h-3.5 w-3.5" />Respond</Button>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
      <Modal open={!!replying} onClose={() => setReplying(null)} title="Respond to review" description={`${replying?.customerName} · ${replying?.rating}★ ${replying?.title}`} footer={<><Button variant="outline" onClick={() => setReplying(null)}>Cancel</Button><Button onClick={() => { reply(replying!.id, text); toast.success('Response published.'); setReplying(null); }} disabled={text.trim().length < 5}>Publish response</Button></>}>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} aria-label="Response" />
        <p className="mt-2 text-xs text-ink-soft">Responses are public and appear under the review on the product page.</p>
      </Modal>
    </>
  );
}
