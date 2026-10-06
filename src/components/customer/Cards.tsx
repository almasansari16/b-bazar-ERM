import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Star } from 'lucide-react';
import type { Category, Seller } from '@/types';
import { SmartImage } from '@/components/common/SmartImage';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { Avatar } from '@/components/ui/Avatar';
import { formatCompact } from '@/utils/format';
import { cn } from '@/utils/cn';

export function CategoryCard({ category: c, count }: { category: Category; count?: number }) {
  return (
    <Link to={`/category/${c.slug}`} className="group relative flex min-h-[180px] flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:shadow-lift sm:min-h-[220px]">
      <SmartImage src={c.image} alt="" icon={c.icon} tint={c.color} className="absolute inset-0" imgClassName="transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="relative mt-auto p-4 text-white">
        <span className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-white/20 backdrop-blur"><DynamicIcon name={c.icon} className="h-4 w-4" /></span>
        <h3 className="text-base font-bold sm:text-lg">{c.name}</h3>
        <p className="line-clamp-2 text-xs text-white/80">{c.description}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">Explore{count !== undefined && ` ${count} items`}<ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}

export function QuickCategory({ category: c }: { category: Category }) {
  return (
    <Link to={`/category/${c.slug}`} className="group flex w-[76px] shrink-0 flex-col items-center gap-2 text-center sm:w-auto">
      <span className="grid h-16 w-16 place-items-center rounded-2xl transition group-hover:-translate-y-0.5 group-hover:shadow-lift sm:h-[72px] sm:w-[72px]" style={{ background: `linear-gradient(145deg, ${c.color}1f, ${c.color}0a)`, color: c.color }}>
        <DynamicIcon name={c.icon} className="h-7 w-7" strokeWidth={1.7} />
      </span>
      <span className="line-clamp-2 text-[12px] font-medium leading-tight text-ink group-hover:text-brand-700">{c.name}</span>
    </Link>
  );
}

export function SellerCard({ seller: s, sold, products }: { seller: Seller; sold: number; products: number }) {
  return (
    <article className="group relative flex flex-col items-center rounded-xl border border-line bg-white p-5 text-center transition hover:shadow-lift">
      <div className="absolute inset-x-0 top-0 h-14 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${s.color}26, ${s.color}08)` }} />
      <Avatar name={s.name} color={s.color} size="lg" square className="relative ring-4 ring-white" />
      <h3 className="mt-3 flex items-center gap-1 text-sm font-bold">{s.name}{s.verified && <BadgeCheck className="h-4 w-4 fill-brand-600 text-white" aria-label="Verified seller" />}</h3>
      <p className="text-xs text-ink-soft">{s.tagline}</p>
      <div className="mt-3 flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 font-semibold"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{s.rating.toFixed(1)}</span>
        <span className="h-3 w-px bg-line" />
        <span className="text-ink-soft"><b className="text-ink">{formatCompact(sold)}</b> sold</span>
        <span className="h-3 w-px bg-line" />
        <span className="text-ink-soft"><b className="text-ink">{products}</b> items</span>
      </div>
      <Link to={`/store/${s.slug}`} className={cn('mt-4 w-full rounded-lg border border-brand-200 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-600 hover:text-white')}>Visit Store</Link>
    </article>
  );
}
