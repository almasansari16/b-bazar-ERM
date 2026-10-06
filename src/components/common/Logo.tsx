import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

/** B-Bazar mark: a "B" whose bowls form a shopping-bag silhouette, with a teal "deal dot". */
export function LogoMark({ className, mono }: { className?: string; mono?: boolean }) {
  const id = mono ? 'bbz-m' : 'bbz-g';
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9 shrink-0', className)} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mono ? '#fff' : '#312E81'} />
          <stop offset="1" stopColor={mono ? '#fff' : '#7C3AED'} />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={mono ? 'rgba(255,255,255,.14)' : `url(#${id})`} />
      <path d="M14 9.5v-1a6 6 0 0 1 12 0v1" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M13 12h9.2a5.3 5.3 0 0 1 2.6 9.9A5.8 5.8 0 0 1 22.6 33H13z" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M13 22h9.4" stroke="#fff" strokeWidth="3.2" />
      <circle cx="30.5" cy="11.5" r="3.2" fill="#06B6D4" />
    </svg>
  );
}

export function Logo({ className, to = '/', tone = 'dark', compact }: { className?: string; to?: string; tone?: 'dark' | 'light'; compact?: boolean }) {
  return (
    <Link to={to} className={cn('flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500', className)} aria-label="B-Bazar home">
      <LogoMark mono={tone === 'light'} />
      {!compact && (
        <span className={cn('text-[22px] font-extrabold leading-none tracking-tight', tone === 'light' ? 'text-white' : 'text-brand-800')}>
          B<span className={tone === 'light' ? 'text-accent-100' : 'text-violet-600'}>-</span>Bazar
        </span>
      )}
    </Link>
  );
}
