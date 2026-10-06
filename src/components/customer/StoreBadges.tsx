import { toast } from 'sonner';
import { cn } from '@/utils/cn';
const Apple = () => <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.2 5.8c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.6-1.3z" /></svg>;
const Play = () => <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M4 3.5v17l9-8.5z" fill="#06B6D4" /><path d="M4 3.5l9 8.5 3-2.8L5.6 2.9C5 2.6 4.4 2.9 4 3.5z" fill="#10B981" /><path d="M4 20.5l9-8.5 3 2.8-10.4 6.3c-.6.3-1.2.1-1.6-.6z" fill="#EF4444" /><path d="M16 9.2l3.3 1.9c.9.5.9 1.3 0 1.8L16 14.8 13 12z" fill="#F59E0B" /></svg>;
/** Visual-only app store buttons. */
export function StoreBadges({ dark }: { dark?: boolean }) {
  const cls = cn('flex h-12 items-center gap-2.5 rounded-xl px-4 text-left transition', dark ? 'bg-white text-ink hover:bg-white/90' : 'bg-ink text-white hover:bg-ink/90');
  const msg = () => toast.info('The B-Bazar app is coming soon to your store.');
  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={msg} className={cls}><Apple /><span className="leading-tight"><span className="block text-[10px] opacity-70">Download on the</span><span className="block text-sm font-bold">App Store</span></span></button>
      <button type="button" onClick={msg} className={cls}><Play /><span className="leading-tight"><span className="block text-[10px] opacity-70">Get it on</span><span className="block text-sm font-bold">Google Play</span></span></button>
    </div>
  );
}
