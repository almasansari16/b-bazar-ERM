import { cn } from '@/utils/cn';
import { initials } from '@/utils/format';
const COLORS = ['#4338CA', '#7C3AED', '#0891B2', '#059669', '#DB2777', '#EA580C', '#B45309', '#475569'];
const colorFor = (s: string) => COLORS[[...s].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORS.length];
export function Avatar({ name, color, size = 'md', className, square }: { name: string; color?: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string; square?: boolean }) {
  const s = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' }[size];
  const c = color ?? colorFor(name);
  return (
    <span className={cn('inline-grid shrink-0 place-items-center font-bold text-white', square ? 'rounded-xl' : 'rounded-full', s, className)} style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)` }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
