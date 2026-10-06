import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, Skeleton } from '@/components/ui/Display';
import { RANGE_LABEL, type RangeKey } from '@/utils/analytics';

export const CHART = {
  indigo: '#4338CA', violet: '#7C3AED', cyan: '#06B6D4', emerald: '#10B981', amber: '#F59E0B', red: '#EF4444', slate: '#94A3B8',
  grid: '#EEF2F7', axis: '#94A3B8',
  series: ['#4338CA', '#06B6D4', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#64748B', '#DB2777'],
};
export const axisProps = { tick: { fill: '#64748B', fontSize: 11 }, axisLine: false, tickLine: false } as const;
export const tooltipStyle = {
  contentStyle: { borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px -8px rgba(15,23,42,.2)', fontSize: 12, padding: '8px 12px' },
  labelStyle: { fontWeight: 700, color: '#111827', marginBottom: 4 },
};

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[11px] font-bold uppercase tracking-[.14em] text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function KpiCard({ label, value, icon, delta, hint, tone = 'brand', featured, loading }: {
  label: string; value: ReactNode; icon: ReactNode; delta?: number; hint?: string; tone?: 'brand' | 'violet' | 'accent' | 'success' | 'warning' | 'danger'; featured?: boolean; loading?: boolean;
}) {
  const toneCls = { brand: 'bg-brand-50 text-brand-600', violet: 'bg-violet-50 text-violet-600', accent: 'bg-accent-50 text-accent-600', success: 'bg-emerald-50 text-emerald-600', warning: 'bg-amber-50 text-amber-600', danger: 'bg-red-50 text-red-600' }[tone];
  if (loading) return <Card className="p-5"><Skeleton className="mb-4 h-9 w-9 rounded-lg" /><Skeleton className="mb-2 h-3 w-24" /><Skeleton className="h-7 w-32" /></Card>;
  return (
    <Card className={cn('relative overflow-hidden p-5 transition hover:shadow-lift', featured && 'border-transparent bg-brand-gradient text-white')}>
      {featured && <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />}
      <div className="flex items-start justify-between gap-3">
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl', featured ? 'bg-white/15 text-white' : toneCls)}>{icon}</span>
        {delta !== undefined && (
          <span className={cn('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold', featured ? 'bg-white/15 text-white' : delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
      </div>
      <p className={cn('mt-4 text-xs font-semibold', featured ? 'text-white/75' : 'text-ink-soft')}>{label}</p>
      <p className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight tabular-nums">{value}</p>
      {hint && <p className={cn('mt-1 text-xs', featured ? 'text-white/70' : 'text-ink-soft')}>{hint}</p>}
    </Card>
  );
}

export function RangeFilter({ value, onChange, options = ['7d', '30d', '3m', '12m'] }: { value: RangeKey; onChange: (r: RangeKey) => void; options?: RangeKey[] }) {
  return (
    <div className="inline-flex rounded-lg bg-muted p-0.5" role="group" aria-label="Date range">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} aria-pressed={o === value}
          className={cn('rounded-md px-2.5 py-1 text-xs font-semibold transition', o === value ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink')}>{RANGE_LABEL[o]}</button>
      ))}
    </div>
  );
}

export function ChartCard({ title, subtitle, action, children, className, loading, height = 280 }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string; loading?: boolean; height?: number }) {
  return (
    <Card className={cn('min-w-0 p-5', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ height }} className="min-w-0">{loading ? <Skeleton className="h-full w-full rounded-lg" /> : children}</div>
    </Card>
  );
}

export function Legend({ items }: { items: { label: string; color: string; value?: string }[] }) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.label} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-2 text-ink-soft"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />{i.label}</span>
          {i.value && <span className="font-semibold tabular-nums text-ink">{i.value}</span>}
        </li>
      ))}
    </ul>
  );
}
