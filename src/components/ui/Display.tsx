import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Star, Home } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatPKR, discountPct } from '@/utils/format';
import { Button } from './Button';

export function Card({ children, className, as: As = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' }) {
  return <As className={cn('rounded-xl border border-line bg-white shadow-card', className)}>{children}</As>;
}
export function CardHeader({ title, subtitle, action, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, className, size = 'md', variant = 'underline' }: {
  tabs: { value: T; label: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; className?: string; size?: 'sm' | 'md'; variant?: 'underline' | 'pill';
}) {
  return (
    <div role="tablist" className={cn('no-scrollbar flex gap-1 overflow-x-auto', variant === 'underline' && 'border-b border-line', className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button key={t.value} role="tab" aria-selected={active} type="button" onClick={() => onChange(t.value)}
            className={cn('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              size === 'sm' ? 'text-xs' : 'text-sm',
              variant === 'underline'
                ? cn('-mb-px border-b-2 px-3 py-2.5', active ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-soft hover:text-ink')
                : cn('rounded-full px-3.5 py-1.5', active ? 'bg-brand-600 text-white' : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'))}>
            {t.label}
            {t.count !== undefined && <span className={cn('rounded-full px-1.5 text-[11px]', active ? (variant === 'pill' ? 'bg-white/20' : 'bg-brand-50') : 'bg-muted')}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-md', className)} aria-hidden="true" />;
}

export function EmptyState({ icon, title, message, action, className }: { icon: ReactNode; title: string; message?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="relative mb-5">
        <div className="absolute inset-0 scale-150 rounded-full bg-brand-50" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white text-brand-600 shadow-lift ring-1 ring-brand-100">{icon}</div>
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{message}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <Button variant="outline" size="icon-sm" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-ink-soft">…</span>}
          <button type="button" onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}
            className={cn('h-8 min-w-8 rounded-md px-2 text-sm font-semibold', n === page ? 'bg-brand-600 text-white' : 'text-ink hover:bg-muted')}>{n}</button>
        </span>
      ))}
      <Button variant="outline" size="icon-sm" onClick={() => onChange(page + 1)} disabled={page === pages} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
    </nav>
  );
}

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="no-scrollbar overflow-x-auto">
      <ol className="flex items-center gap-1.5 whitespace-nowrap text-xs text-ink-soft">
        <li><Link to="/" className="flex items-center gap-1 hover:text-brand-600"><Home className="h-3.5 w-3.5" /><span className="sr-only">Home</span></Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
            {it.to ? <Link to={it.to} className="hover:text-brand-600">{it.label}</Link> : <span aria-current="page" className="font-medium text-ink">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Rating({ value, count, size = 'sm', showValue = true }: { value: number; count?: number; size?: 'xs' | 'sm' | 'md'; showValue?: boolean }) {
  const s = { xs: 'h-3 w-3', sm: 'h-3.5 w-3.5', md: 'h-4 w-4' }[size];
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${value} out of 5${count !== undefined ? `, ${count} reviews` : ''}`}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn(s, i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')} aria-hidden="true" />
        ))}
      </span>
      {showValue && <span className="text-xs font-semibold text-ink">{value ? value.toFixed(1) : 'New'}</span>}
      {count !== undefined && <span className="text-xs text-ink-soft">({count.toLocaleString()})</span>}
    </span>
  );
}

export function PriceDisplay({ price, original, size = 'md', className, showSave }: { price: number; original?: number; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string; showSave?: boolean }) {
  const pct = original ? discountPct(price, original) : 0;
  const s = { sm: 'text-[15px]', md: 'text-lg', lg: 'text-2xl', xl: 'text-[32px]' }[size];
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className={cn('font-extrabold tracking-tight text-ink tabular-nums', s)}>{formatPKR(price)}</span>
      {pct > 0 && (
        <>
          <span className="text-xs text-ink-soft line-through tabular-nums">{formatPKR(original!)}</span>
          <span className="text-xs font-bold text-red-600">-{pct}%</span>
        </>
      )}
      {showSave && pct > 0 && <span className="w-full text-xs font-semibold text-emerald-600">Save {formatPKR(original! - price)}</span>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action, icon }: { title: ReactNode; subtitle?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{icon}{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({ value, className, tone = 'brand' }: { value: number; className?: string; tone?: 'brand' | 'danger' | 'success' | 'warning' }) {
  const c = { brand: 'bg-brand-gradient', danger: 'bg-gradient-to-r from-red-500 to-amber-400', success: 'bg-emerald-500', warning: 'bg-amber-400' }[tone];
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn('h-full rounded-full transition-all', c)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
