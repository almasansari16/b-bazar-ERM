import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMarket } from '@/store/useMarket';
import { megaMenu } from '@/data/categories';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export function MegaMenu({ onClose }: { onClose: () => void }) {
  const categories = useMarket((s) => s.categories).filter((c) => c.enabled).sort((a, b) => a.order - b.order);
  const [hover, setHover] = useState(categories[0]?.slug);
  const current = categories.find((c) => c.slug === hover) ?? categories[0];
  return (
    <div className="absolute left-4 right-4 top-full z-50 mt-px grid grid-cols-[240px_1fr] overflow-hidden rounded-b-2xl border border-t-0 border-line bg-white shadow-pop animate-fade-in sm:left-6 lg:left-8 lg:right-8">
      <ul className="max-h-[440px] overflow-y-auto border-r border-line bg-slate-50/60 py-2">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link to={`/category/${c.slug}`} onMouseEnter={() => setHover(c.slug)} onFocus={() => setHover(c.slug)} onClick={onClose}
              className={cn('flex items-center gap-3 px-4 py-2 text-sm font-medium', c.slug === hover ? 'bg-white text-brand-700' : 'text-ink hover:text-brand-700')}>
              <DynamicIcon name={c.icon} className="h-4 w-4" />{c.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-[1fr_1fr_220px] gap-8 p-6">
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: current.color }}><DynamicIcon name={current.icon} className="h-4 w-4" />{current.name}</p>
          <ul className="space-y-2">
            {current.subcategories.map((s) => (
              <li key={s.slug}><Link onClick={onClose} to={`/category/${current.slug}?sub=${encodeURIComponent(s.name)}`} className="text-sm text-ink-soft hover:text-brand-700">{s.name}</Link></li>
            ))}
          </ul>
          <Link onClick={onClose} to={`/category/${current.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">Shop all {current.short}<ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {megaMenu.slice(0, 4).map((m) => (
            <div key={m.title}>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink"><DynamicIcon name={m.icon} className="h-3.5 w-3.5 text-brand-600" />{m.title}</p>
              <ul className="space-y-1">{m.links.map((l) => <li key={l}><Link onClick={onClose} to={`/search?q=${encodeURIComponent(l)}`} className="text-[13px] text-ink-soft hover:text-brand-700">{l}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <Link to="/shop?tag=flash" onClick={onClose} className="relative flex flex-col justify-end overflow-hidden rounded-xl bg-brand-gradient p-5 text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <p className="text-xs font-semibold text-white/75">This week only</p>
          <p className="mt-1 text-xl font-extrabold leading-tight">Flash deals up to 50% off</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">Shop now<ArrowRight className="h-4 w-4" /></span>
        </Link>
      </div>
    </div>
  );
}
