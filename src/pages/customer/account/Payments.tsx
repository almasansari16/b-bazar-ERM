import { useState } from 'react';
import { CreditCard, Smartphone, Plus, Trash2, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useMarket } from '@/store/useMarket';
import { useAuth } from '@/store/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPKR } from '@/utils/format';

export default function Payments() {
  usePageMeta('Payment Methods');
  const user = useAuth((s) => s.user)!;
  const wallet = useMarket((s) => s.customers.find((c) => c.id === user.id)?.wallet ?? 0);
  const [methods, setMethods] = useState([
    { id: 'pm1', kind: 'card', label: 'Visa •••• 4242', sub: 'Expires 08/28 · Meezan Bank', def: true },
    { id: 'pm2', kind: 'wallet', label: 'JazzCash', sub: '0300 •••• 567', def: false },
    { id: 'pm3', kind: 'wallet', label: 'Easypaisa', sub: '0345 •••• 112', def: false },
  ]);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Payment Methods</h1>
      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Saved methods</h2><Button size="sm" variant="secondary" onClick={() => { setMethods((m) => [...m, { id: `pm${Date.now()}`, kind: 'card', label: 'Mastercard •••• 5100', sub: 'Expires 11/29 · HBL', def: false }]); toast.success('Card added (demo).'); }}><Plus className="h-4 w-4" />Add card</Button></div>
          <ul className="space-y-3">
            {methods.map((m) => (
              <li key={m.id} className="flex items-center gap-4 rounded-xl border border-line p-4">
                <span className="grid h-10 w-14 place-items-center rounded-lg bg-brand-gradient text-white">{m.kind === 'card' ? <CreditCard className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}</span>
                <div className="flex-1"><p className="flex items-center gap-2 text-sm font-semibold">{m.label}{m.def && <Badge tone="brand">Default</Badge>}</p><p className="text-xs text-ink-soft">{m.sub}</p></div>
                <button type="button" aria-label={`Remove ${m.label}`} onClick={() => { setMethods((x) => x.filter((y) => y.id !== m.id)); toast('Payment method removed.'); }} className="rounded p-2 text-ink-soft hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-soft">Card details are tokenised by our payment partner. B-Bazar never stores your full card number.</p>
        </div>
        <div className="rounded-2xl bg-brand-gradient p-5 text-white">
          <p className="flex items-center gap-2 text-sm text-white/80"><Wallet className="h-4 w-4" />B-Bazar Wallet</p>
          <p className="mt-2 text-3xl font-extrabold">{formatPKR(wallet)}</p>
          <p className="text-xs text-white/70">Refunds and cashback land here instantly</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2"><span className="flex items-center gap-2"><ArrowDownLeft className="h-4 w-4 text-emerald-300" />Refund · BBZ-20260918</span><span>+Rs. 1,000</span></li>
            <li className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2"><span className="flex items-center gap-2"><ArrowDownLeft className="h-4 w-4 text-emerald-300" />Cashback · Tech Week</span><span>+Rs. 250</span></li>
            <li className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2"><span className="flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-amber-300" />Used on order</span><span>−Rs. 0</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
