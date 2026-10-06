import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Truck, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-brand-gradient p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 top-20 h-96 w-96 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
        <Logo tone="light" />
        <div className="relative my-auto max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight">Everything You Need.<br />All in One Bazar.</h2>
          <p className="mt-4 text-white/80">Join millions of shoppers and 1,200+ verified sellers across Pakistan.</p>
          <ul className="mt-8 space-y-3 text-sm">
            {[[BadgeCheck, 'Verified sellers & authentic products'], [Truck, 'Fast delivery to 300+ cities'], [ShieldCheck, 'Cash on delivery, JazzCash & Easypaisa']].map(([I, t]) => { const Icon = I as typeof Truck; return <li key={t as string} className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15"><Icon className="h-4 w-4" /></span>{t as string}</li>; })}
          </ul>
        </div>
        <p className="relative text-xs text-white/60">© 2026 B-Bazar. All rights reserved.</p>
      </div>
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <div className="lg:hidden"><Logo /></div>
        <div className="mx-auto my-auto w-full max-w-md py-8">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
        </div>
        <p className="text-center text-xs text-ink-soft"><Link to="/" className="hover:underline">Back to B-Bazar</Link> · <Link to="/help" className="hover:underline">Help</Link></p>
      </div>
    </div>
  );
}

export function SocialButtons({ onClick }: { onClick: (p: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={() => onClick('Google')} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white text-sm font-semibold hover:bg-muted">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" /><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8C3.9 20.5 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.7 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.1 4.9l3.6-2.8z" /><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1C17.5 2.1 15 1 12 1 7.7 1 3.9 3.5 2.1 7.1l3.6 2.8C6.6 7.3 9.1 5.4 12 5.4z" /></svg>Google
      </button>
      <button type="button" onClick={() => onClick('Facebook')} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white text-sm font-semibold hover:bg-muted">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877F2" /><path fill="#fff" d="M13.4 19v-5.3h1.8l.3-2.1h-2.1v-1.3c0-.6.2-1 1-1h1.1V7.4c-.2 0-.9-.1-1.6-.1-1.6 0-2.7 1-2.7 2.8v1.5H9.4v2.1h1.8V19z" /></svg>Facebook
      </button>
    </div>
  );
}
