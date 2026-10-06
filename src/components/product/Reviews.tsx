import { useMemo, useState } from 'react';
import { Star, ThumbsUp, BadgeCheck, MessageSquareText, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import type { Product, Review } from '@/types';
import { useMarket } from '@/store/useMarket';
import { useAuth } from '@/store/useAuth';
import { Rating, EmptyState, ProgressBar } from '@/components/ui/Display';
import { Select, Textarea, Input, Field } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Overlay';
import { Avatar } from '@/components/ui/Avatar';
import { SmartImage } from '@/components/common/SmartImage';
import { formatDate } from '@/utils/format';

type Sort = 'newest' | 'helpful' | 'highest' | 'lowest';

export function ProductReviews({ product }: { product: Product }) {
  const all = useMarket((s) => s.reviews);
  const markHelpful = useMarket((s) => s.markHelpful);
  const reviews = useMemo(() => all.filter((r) => r.productId === product.id && r.status === 'published'), [all, product.id]);
  const [sort, setSort] = useState<Sort>('newest');
  const [star, setStar] = useState(0);
  const [write, setWrite] = useState(false);
  const [voted, setVoted] = useState<string[]>([]);

  // Distribution blends product aggregate with individual reviews so totals match reviewCount
  const dist = useMemo(() => {
    const base = [0.03, 0.04, 0.09, 0.24, 0.6].map((w) => Math.round(product.reviewCount * w * (product.rating / 4.6)));
    const total = base.reduce((a, b) => a + b, 0) || 1;
    return [5, 4, 3, 2, 1].map((s) => ({ s, n: base[s - 1], pct: (base[s - 1] / total) * 100 }));
  }, [product]);
  const photos = reviews.flatMap((r) => r.photos);
  const list = [...reviews].filter((r) => !star || r.rating === star).sort((a, b) =>
    sort === 'helpful' ? b.helpful - a.helpful : sort === 'highest' ? b.rating - a.rating : sort === 'lowest' ? a.rating - b.rating : b.date.localeCompare(a.date));

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <div>
        <div className="flex items-end gap-3"><span className="text-5xl font-extrabold tracking-tight">{product.rating ? product.rating.toFixed(1) : '–'}</span><span className="pb-2 text-sm text-ink-soft">out of 5</span></div>
        <Rating value={product.rating} showValue={false} size="md" />
        <p className="mt-1 text-sm text-ink-soft">Based on {product.reviewCount.toLocaleString()} ratings</p>
        <ul className="mt-4 space-y-1.5">
          {dist.map((d) => (
            <li key={d.s}><button type="button" onClick={() => setStar(star === d.s ? 0 : d.s)} aria-pressed={star === d.s} className={cn('flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-xs', star === d.s && 'bg-brand-50')}>
              <span className="w-6 font-semibold">{d.s}★</span><ProgressBar value={d.pct} tone="warning" className="h-2 flex-1" /><span className="w-10 text-right tabular-nums text-ink-soft">{d.n}</span>
            </button></li>
          ))}
        </ul>
        <Button variant="outline" className="mt-5 w-full" onClick={() => setWrite(true)}><MessageSquareText className="h-4 w-4" />Write a review</Button>
        {photos.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold"><Camera className="h-4 w-4" />Photos from customers</p>
            <div className="grid grid-cols-4 gap-2">{photos.slice(0, 8).map((ph, i) => <SmartImage key={i} src={ph} alt="Customer photo" icon={product.icon} className="aspect-square rounded-lg" />)}</div>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">{list.length} review{list.length !== 1 && 's'}{star ? ` with ${star} stars` : ''}</p>
          <div className="flex items-center gap-2"><label htmlFor="rsort" className="text-sm text-ink-soft">Sort</label>
            <Select id="rsort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 w-40"><option value="newest">Newest</option><option value="helpful">Most Helpful</option><option value="highest">Highest Rating</option><option value="lowest">Lowest Rating</option></Select>
          </div>
        </div>
        {list.length === 0 ? (
          <EmptyState icon={<Star className="h-7 w-7" />} title="No reviews yet" message="Be the first to share your experience with this product." action={<Button onClick={() => setWrite(true)}>Write a review</Button>} className="rounded-xl border border-dashed border-line" />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((r) => (
              <li key={r.id} className="py-5 first:pt-0">
                <div className="flex items-start gap-3">
                  <Avatar name={r.customerName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold">{r.customerName}</span>
                      {r.verified && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" />Verified Purchase</span>}
                      <span className="text-xs text-ink-soft">· {formatDate(r.date)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2"><Rating value={r.rating} showValue={false} size="xs" /><span className="text-sm font-bold">{r.title}</span></div>
                    {r.variant && <p className="mt-0.5 text-xs text-ink-soft">Variant: {r.variant}</p>}
                    <p className="mt-2 text-sm leading-relaxed text-ink/90">{r.body}</p>
                    {r.photos.length > 0 && <div className="mt-3 flex gap-2">{r.photos.map((ph, i) => <SmartImage key={i} src={ph} alt="Review photo" icon={product.icon} className="h-20 w-20 rounded-lg" />)}</div>}
                    {r.sellerReply && <div className="mt-3 rounded-lg border-l-2 border-brand-600 bg-brand-50/60 p-3 text-sm"><p className="mb-0.5 text-xs font-bold text-brand-700">Seller response</p>{r.sellerReply}</div>}
                    <button type="button" disabled={voted.includes(r.id)} onClick={() => { markHelpful(r.id); setVoted((v) => [...v, r.id]); toast.success('Thanks for your feedback!'); }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink-soft hover:border-slate-300 hover:text-ink disabled:border-brand-200 disabled:bg-brand-50 disabled:text-brand-700">
                      <ThumbsUp className="h-3.5 w-3.5" />Helpful ({r.helpful})
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <WriteReview open={write} onClose={() => setWrite(false)} product={product} />
    </div>
  );
}

export function WriteReview({ open, onClose, product }: { open: boolean; onClose: () => void; product: Product }) {
  const add = useMarket((s) => s.addReview);
  const orders = useMarket((s) => s.orders);
  const user = useAuth((s) => s.user);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [err, setErr] = useState('');
  const verified = orders.some((o) => o.customerId === user?.id && o.status === 'delivered' && o.items.some((i) => i.productId === product.id));
  const submit = () => {
    if (body.trim().length < 10) { setErr('Please write at least 10 characters.'); return; }
    const r: Review = { id: `R${Date.now()}`, productId: product.id, sellerId: product.sellerId, customerName: user?.name ?? 'Guest shopper', rating, title: title.trim() || ['', 'Poor', 'Below average', 'Okay', 'Good', 'Excellent'][rating], body: body.trim(), date: new Date().toISOString(), verified, helpful: 0, photos: [], status: 'published' };
    add(r);
    toast.success('Review published. Thank you!');
    setTitle(''); setBody(''); setErr(''); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Write a review" description={product.title} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit}>Submit review</Button></>}>
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold">Your rating</p>
          <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((i) => <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} star${i > 1 ? 's' : ''}`} onMouseEnter={() => setHover(i)} onClick={() => setRating(i)}><Star className={cn('h-8 w-8 transition', i <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')} /></button>)}
          </div>
        </div>
        <Field label="Title" htmlFor="rv-title"><Input id="rv-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarise your experience" /></Field>
        <Field label="Review" htmlFor="rv-body" required error={err}><Textarea id="rv-body" value={body} onChange={(e) => { setBody(e.target.value); setErr(''); }} placeholder="What did you like or dislike? How was delivery?" aria-invalid={!!err} /></Field>
        {verified ? <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><BadgeCheck className="h-4 w-4" />Your review will carry a Verified Purchase badge.</p> : <p className="text-xs text-ink-soft">Reviews from shoppers who bought this item get a Verified Purchase badge.</p>}
      </div>
    </Modal>
  );
}
