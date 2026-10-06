import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, RotateCcw, CreditCard, Truck, User, Store, ChevronDown, MessageSquare, Phone, Mail } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Input } from '@/components/ui/Form';
import { LinkButton } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export const FAQS: [string, string][] = [
  ['How do I track my order?', 'Go to My Orders and tap Track on any order. You can also enter your order or tracking number on the Track Order page.'],
  ['Which payment methods are accepted?', 'Cash on Delivery, Visa/Mastercard, bank transfer, JazzCash and Easypaisa.'],
  ['How long does delivery take?', 'Karachi 1–2 days, Lahore and Islamabad 2–4 days, other cities 3–7 days.'],
  ['What is the return policy?', 'Most items can be returned within 7 days of delivery. We arrange a free pickup and refund to your original payment method or B-Bazar Wallet.'],
  ['How do I become a seller?', 'Tap “Sell on B-Bazar”, register your business with CNIC and bank details, and our team will verify your store within 48 hours.'],
  ['Is my payment information secure?', 'Yes. Card payments are tokenised by PCI-DSS compliant partners and B-Bazar never stores your full card number.'],
];
export default function Help() {
  usePageMeta('Help Center');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<number | null>(0);
  const topics = [[Package, 'Orders', '/orders'], [Truck, 'Delivery', '/page/shipping'], [RotateCcw, 'Returns', '/page/returns'], [CreditCard, 'Payments', '/account/payments'], [User, 'Account', '/account'], [Store, 'Selling', '/register?seller=1']] as const;
  const faqs = FAQS.filter(([a, b]) => `${a} ${b}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <section className="bg-brand-gradient py-12 text-center text-white">
        <div className="container-x max-w-2xl">
          <h1 className="text-3xl font-extrabold sm:text-4xl">How can we help?</h1>
          <div className="mt-6 text-ink"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search help articles" icon={<Search className="h-4 w-4" />} className="h-12" aria-label="Search help" /></div>
        </div>
      </section>
      <div className="container-x py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{topics.map(([I, t, to]) => <Link key={t} to={to} className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-5 text-center transition hover:shadow-lift"><I className="h-6 w-6 text-brand-600" /><span className="text-sm font-semibold">{t}</span></Link>)}</div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-line bg-white"><h2 className="border-b border-line px-5 py-4 text-lg font-extrabold">Frequently asked questions</h2>
            <ul>{faqs.map(([qq, a], i) => (
              <li key={qq} className="border-b border-line last:border-0"><button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold">{qq}<ChevronDown className={cn('h-4 w-4 shrink-0 transition', open === i && 'rotate-180')} /></button>{open === i && <p className="px-5 pb-4 text-sm text-ink-soft">{a}</p>}</li>
            ))}</ul>
          </section>
          <aside className="space-y-3 rounded-2xl border border-line bg-white p-5">
            <h2 className="font-bold">Still need help?</h2>
            <LinkButton to="/account/messages" className="w-full"><MessageSquare className="h-4 w-4" />Chat with Support</LinkButton>
            <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-brand-600" />021-111-BAZAR (22927)</p>
            <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-brand-600" />support@bbazar.pk</p>
            <p className="text-xs text-ink-soft">Available 24/7, including weekends.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
