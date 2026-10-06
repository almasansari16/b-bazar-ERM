import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headset } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { SocialIcon, SOCIALS } from '@/components/common/SocialIcons';
import { StoreBadges } from '@/components/customer/StoreBadges';

const COLS: { title: string; links: [string, string][] }[] = [
  { title: 'B-Bazar', links: [['About B-Bazar', '/page/about'], ['Careers', '/page/careers'], ['Press', '/page/press'], ['Contact Us', '/page/contact']] },
  { title: 'Customer Service', links: [['Help Center', '/help'], ['Track Order', '/orders'], ['Returns & Refunds', '/page/returns'], ['Shipping Policy', '/page/shipping']] },
  { title: 'Sell & Earn', links: [['Sell on B-Bazar', '/register?seller=1'], ['Seller Center', '/seller/dashboard'], ['Seller Academy', '/page/seller-academy'], ['Advertise', '/page/advertise']] },
  { title: 'Legal', links: [['Privacy Policy', '/page/privacy'], ['Terms & Conditions', '/page/terms'], ['Buyer Protection', '/page/buyer-protection'], ['Download App', '/page/download-app']] },
];
const PAYMENTS = ['COD', 'VISA', 'Mastercard', 'JazzCash', 'Easypaisa', 'Bank Transfer'];

export function Footer() {
  return (
    <footer className="mt-16 bg-brand-900 text-white/75" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="border-b border-white/10">
        <div className="container-x grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {[[Truck, 'Nationwide delivery', '1–2 days in Karachi'], [ShieldCheck, 'Buyer protection', 'Secure payments'], [RotateCcw, '7-day returns', 'Easy & free pickup'], [Headset, '24/7 support', 'Chat, email or call']].map(([I, t, s]) => {
            const Icon = I as typeof Truck;
            return (
              <div key={t as string} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-accent-100"><Icon className="h-5 w-5" /></span>
                <span><span className="block text-sm font-semibold text-white">{t as string}</span><span className="text-xs">{s as string}</span></span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <Logo tone="light" />
          <p className="mt-4 text-sm leading-relaxed">Everything You Need. All in One Bazar. Shop from 1,200+ verified Pakistani sellers with cash on delivery, JazzCash and Easypaisa.</p>
          <div className="mt-5 flex gap-2">
            {SOCIALS.map((s) => <a key={s} href="#" onClick={(e) => e.preventDefault()} aria-label={`B-Bazar on ${s}`} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"><SocialIcon name={s} className="h-4 w-4" /></a>)}
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-bold text-white">{c.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">{c.links.map(([l, to]) => <li key={l}><Link to={to} className="hover:text-white">{l}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="container-x flex flex-col gap-6 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">We accept</p>
          <div className="flex flex-wrap gap-2">{PAYMENTS.map((p) => <span key={p} className="rounded-md bg-white px-2.5 py-1 text-[11px] font-bold text-brand-800">{p}</span>)}</div>
        </div>
        <StoreBadges dark />
      </div>
      <div className="bg-black/20 pb-20 md:pb-0">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-4 text-xs md:flex-row">
          <p>© 2026 B-Bazar. All rights reserved.</p>
          <p className="text-white/50">Made in Pakistan · Prices in PKR</p>
        </div>
      </div>
    </footer>
  );
}
