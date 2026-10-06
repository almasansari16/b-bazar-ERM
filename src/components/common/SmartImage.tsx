import { useState, memo } from 'react';
import { cn } from '@/utils/cn';
import { DynamicIcon } from './DynamicIcon';

const OFFLINE = import.meta.env.VITE_ROUTER === 'hash'; // hosted single-file demo: remote images are blocked, use illustrations

/** Image with lazy loading, shimmer placeholder and a branded illustration fallback — never a broken image. */
export const SmartImage = memo(function SmartImage({ src, alt, icon = 'Package', tint = '#4338CA', className, imgClassName, eager }: {
  src?: string; alt: string; icon?: string; tint?: string; className?: string; imgClassName?: string; eager?: boolean;
}) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(OFFLINE || !src ? 'error' : 'loading');
  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {state !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          className={cn('h-full w-full object-cover transition-opacity duration-300', state === 'ok' ? 'opacity-100' : 'opacity-0', imgClassName)}
        />
      )}
      {state === 'loading' && <div className="skeleton absolute inset-0" />}
      {state === 'error' && <Illustration icon={icon} tint={tint} label={alt} />}
    </div>
  );
});

function Illustration({ icon, tint, label }: { icon: string; tint: string; label: string }) {
  return (
    <div role="img" aria-label={label} className="absolute inset-0 grid place-items-center" style={{ background: `radial-gradient(120% 90% at 30% 20%, ${tint}22, ${tint}0d 55%, #F8FAFC)` }}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full" style={{ background: `${tint}14` }} />
      <div className="absolute -bottom-8 -left-4 h-28 w-28 rounded-full" style={{ background: `${tint}10` }} />
      <div className="relative grid place-items-center rounded-2xl bg-white/80 p-[14%] shadow-sm ring-1 ring-black/5" style={{ color: tint }}>
        <DynamicIcon name={icon} className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.5} />
      </div>
    </div>
  );
}
