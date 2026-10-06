import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, BadgeCheck, Truck, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Product, Seller } from '@/types';
import { SmartImage } from '@/components/common/SmartImage';
import { Rating, PriceDisplay, ProgressBar, Skeleton } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { useWishlist } from '@/store/useWishlist';
import { useShopActions } from '@/hooks/useShopActions';
import { discountPct, formatCompact } from '@/utils/format';

export type CardVariant = 'default' | 'flash' | 'compact' | 'list';
const TAG_BADGE: Record<string, [string, string]> = {
  new: ['Just Added', 'bg-accent-500 text-white'],
  bestseller: ['Best Seller', 'bg-amber-400 text-ink'],
  top: ['Top Rated', 'bg-emerald-500 text-white'],
};

/** The one reusable product card: grid (default), flash-sale, compact rail and list layouts. */
export const ProductCard = memo(function ProductCard({ product: p, seller, variant = 'default', highlightTag, className }: {
  product: Product; seller?: Seller; variant?: CardVariant; highlightTag?: 'new' | 'bestseller' | 'top'; className?: string;
}) {
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const { addToCart, buyNow, toggleWish } = useShopActions();
  const [pop, setPop] = useState(false);
  const pct = discountPct(p.price, p.originalPrice);
  const out = p.stock <= 0;
  const tint = seller?.color ?? '#4338CA';
  const badge = highlightTag ? TAG_BADGE[highlightTag] : null;
  const href = `/product/${p.id}`;

  const wishBtn = (
    <button type="button" onClick={(e) => { e.preventDefault(); toggleWish(p); setPop(true); setTimeout(() => setPop(false), 350); }}
      aria-pressed={wished} aria-label={wished ? `Remove ${p.title} from wishlist` : `Add ${p.title} to wishlist`}
      className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:scale-105">
      <Heart className={cn('h-4 w-4 transition', wished ? 'fill-red-500 text-red-500' : 'text-slate-500', pop && 'animate-pop')} />
    </button>
  );

  if (variant === 'list') {
    return (
      <article className={cn('group flex gap-4 rounded-xl border border-line bg-white p-3 transition hover:shadow-lift sm:p-4', className)}>
        <Link to={href} className="relative block w-28 shrink-0 sm:w-44">
          <SmartImage src={p.images[0]} alt={p.title} icon={p.icon} tint={tint} className="aspect-square rounded-lg" imgClassName="transition duration-500 group-hover:scale-105" />
          {pct > 0 && <span className="absolute left-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white">-{pct}%</span>}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link to={href} className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand-700 sm:text-base">{p.title}</Link>
          {seller && <SellerLine seller={seller} />}
          <div className="mt-1"><Rating value={p.rating} count={p.reviewCount} size="xs" /></div>
          <p className="mt-2 hidden line-clamp-2 text-xs text-ink-soft sm:block">{p.highlights.join(' · ')}</p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
            <div><PriceDisplay price={p.price} original={p.originalPrice} />{p.freeDelivery && <FreeDelivery />}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon-sm" onClick={() => toggleWish(p)} aria-label="Toggle wishlist"><Heart className={cn('h-4 w-4', wished && 'fill-red-500 text-red-500')} /></Button>
              <Button size="sm" onClick={() => addToCart(p)} disabled={out}><ShoppingCart className="h-4 w-4" />{out ? 'Sold out' : 'Add to Cart'}</Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  const soldPct = Math.min(96, Math.round((p.sold / (p.sold + p.stock + 40)) * 100));
  return (
    <article className={cn('group relative flex h-full flex-col overflow-hidden rounded-xl border border-line/80 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-transparent hover:shadow-lift', className)}>
      <Link to={href} className="relative block" tabIndex={-1} aria-hidden="true">
        <SmartImage src={p.images[0]} alt="" icon={p.icon} tint={tint} className="aspect-square" imgClassName="transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {pct > 0 && <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white">-{pct}%</span>}
          {badge && <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-bold', badge[1])}>{badge[0]}</span>}
        </div>
        {out && <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1.5 text-center text-xs font-semibold text-white">Out of stock</span>}
        {!out && p.stock <= 6 && variant !== 'flash' && <span className="absolute bottom-2 left-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-red-600 shadow-sm">Only {p.stock} left</span>}
      </Link>
      {wishBtn}
      <div className={cn('flex flex-1 flex-col p-3', variant === 'compact' && 'p-2.5')}>
        <h3 className={cn('line-clamp-2 font-medium leading-snug text-ink', variant === 'compact' ? 'text-[13px]' : 'text-[13px] sm:text-sm')}>
          <Link to={href} className="after:absolute after:inset-0 after:content-[''] hover:text-brand-700 focus-visible:outline-none"><span className="relative">{p.title}</span></Link>
        </h3>
        {seller && variant === 'default' && <SellerLine seller={seller} />}
        <div className="mt-1.5"><Rating value={p.rating} count={p.reviewCount} size="xs" /></div>
        <div className="mt-2"><PriceDisplay price={p.price} original={p.originalPrice} size="sm" /></div>
        {variant === 'flash' ? (
          <div className="mt-2.5">
            <ProgressBar value={soldPct} tone="danger" />
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-ink-soft"><Zap className="h-3 w-3 fill-amber-400 text-amber-500" />{formatCompact(p.sold)} sold</p>
          </div>
        ) : (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {p.freeDelivery && <FreeDelivery />}
            {variant === 'default' && <span className="text-[11px] text-ink-soft">{formatCompact(p.sold)} sold</span>}
          </div>
        )}
        {variant === 'default' && (
          <div className="relative z-10 mt-auto pt-3">
            <div className="flex gap-1.5">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => addToCart(p)} disabled={out}><ShoppingCart className="h-4 w-4" /><span>{out ? 'Sold out' : 'Add to Cart'}</span></Button>
              <Button size="sm" className="hidden flex-1 lg:inline-flex lg:max-w-0 lg:overflow-hidden lg:px-0 lg:opacity-0 lg:transition-all lg:group-hover:max-w-[120px] lg:group-hover:px-3 lg:group-hover:opacity-100 lg:group-focus-within:max-w-[120px] lg:group-focus-within:px-3 lg:group-focus-within:opacity-100" onClick={() => buyNow(p)} disabled={out}>Buy Now</Button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
});

function SellerLine({ seller }: { seller: Seller }) {
  return (
    <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-ink-soft">
      {seller.name}{seller.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-brand-600 text-white" aria-label="Verified seller" />}
    </p>
  );
}
function FreeDelivery() {
  return <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"><Truck className="h-3 w-3" />Free Delivery</span>;
}

export function ProductCardSkeleton({ variant = 'default' }: { variant?: CardVariant }) {
  if (variant === 'list') return <div className="flex gap-4 rounded-xl border border-line bg-white p-4"><Skeleton className="h-32 w-32 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/3" /><Skeleton className="h-5 w-24" /></div></div>;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white" aria-hidden="true">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-3"><Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-2/3" /><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-24" />{variant === 'default' && <Skeleton className="h-9 w-full" />}</div>
    </div>
  );
}
