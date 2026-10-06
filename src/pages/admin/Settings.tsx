import { useState } from 'react';
import { Settings, Store, Percent, CreditCard, Truck, Bell, Mail, MessageSquare, Shield, Users, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { Card } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Field, Select, Switch, Textarea } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { LogoMark } from '@/components/common/Logo';
import { CITIES } from '@/utils/delivery';

type S = 'general' | 'marketplace' | 'commission' | 'payment' | 'shipping' | 'notifications' | 'email' | 'sms' | 'security' | 'roles' | 'appearance';
const NAV: [S, string, typeof Settings][] = [['general', 'General', Settings], ['marketplace', 'Marketplace', Store], ['commission', 'Commission', Percent], ['payment', 'Payment', CreditCard], ['shipping', 'Shipping', Truck], ['notifications', 'Notifications', Bell], ['email', 'Email', Mail], ['sms', 'SMS', MessageSquare], ['security', 'Security', Shield], ['roles', 'Roles & Permissions', Users], ['appearance', 'Appearance', Palette]];

function Toggle({ label, desc, def = true }: { label: string; desc?: string; def?: boolean }) {
  const [v, setV] = useState(def);
  return <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0"><div><p className="text-sm font-semibold">{label}</p>{desc && <p className="text-xs text-ink-soft">{desc}</p>}</div><Switch checked={v} onChange={setV} label={label} /></div>;
}

export default function AdminSettings() {
  usePageMeta('Settings · Admin');
  const [sec, setSec] = useState<S>('general');
  const [brand, setBrand] = useState('#4338CA');
  return (
    <>
      <PageHeader title="Settings" subtitle="Platform configuration" actions={<Button onClick={() => toast.success('Settings saved.')}>Save changes</Button>} />
      <div className="grid items-start gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="p-2"><nav className="no-scrollbar flex gap-1 overflow-x-auto lg:block lg:space-y-0.5" aria-label="Settings sections">{NAV.map(([k, l, I]) => <button key={k} type="button" onClick={() => setSec(k)} aria-current={sec === k} className={cn('flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium lg:w-full', sec === k ? 'bg-brand-50 text-brand-700' : 'hover:bg-muted')}><I className="h-4 w-4" />{l}</button>)}</nav></Card>
        <Card className="min-w-0 p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-extrabold">{NAV.find((n) => n[0] === sec)![1]}</h2>
          {sec === 'general' && <div className="grid gap-4 sm:grid-cols-2"><Field label="Marketplace name" htmlFor="g1"><Input id="g1" defaultValue="B-Bazar" /></Field><Field label="Tagline" htmlFor="g2"><Input id="g2" defaultValue="Everything You Need. All in One Bazar." /></Field><Field label="Support email" htmlFor="g3"><Input id="g3" defaultValue="support@bbazar.pk" /></Field><Field label="Support phone" htmlFor="g4"><Input id="g4" defaultValue="021-111-22927" /></Field><Field label="Currency" htmlFor="g5"><Select id="g5"><option>PKR — Pakistani Rupee (Rs.)</option></Select></Field><Field label="Time zone" htmlFor="g6"><Select id="g6"><option>Asia/Karachi (UTC+5)</option></Select></Field></div>}
          {sec === 'marketplace' && <div><Toggle label="Allow new seller registrations" /><Toggle label="Require manual product approval" desc="Every new listing goes to the moderation queue" /><Toggle label="Allow guest checkout" def={false} /><Toggle label="Show seller ratings publicly" /><Toggle label="Enable product Q&A" /></div>}
          {sec === 'commission' && <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><Field label="Default commission (%)" htmlFor="c1"><Input id="c1" type="number" defaultValue={8} /></Field><Field label="Payment processing fee (%)" htmlFor="c2"><Input id="c2" type="number" defaultValue={2} /></Field><Field label="Fixed fee per order (PKR)" htmlFor="c3"><Input id="c3" type="number" defaultValue={25} /></Field></div><p className="text-sm text-ink-soft">Category and seller overrides are managed in <Link to="/admin/commissions" className="font-semibold text-brand-600">Commissions</Link>.</p></div>}
          {sec === 'payment' && <ul className="space-y-2">{[['Cash on Delivery', 'Courier remittance T+3', true], ['Visa / Mastercard', 'Acquirer: demo gateway', true], ['JazzCash', 'Merchant ID MC-1042', true], ['Easypaisa', 'Store ID 88721', true], ['Bank Transfer (Raast/IBFT)', 'Meezan Bank', true], ['Buy now, pay later', 'Coming soon', false]].map(([n, d, on]) => <li key={n as string} className="flex items-center justify-between rounded-xl border border-line p-4"><div><p className="text-sm font-semibold">{n as string}</p><p className="text-xs text-ink-soft">{d as string}</p></div><Switch checked={on as boolean} onChange={() => toast.info('Gateway settings are read-only in the demo.')} label={n as string} /></li>)}</ul>}
          {sec === 'shipping' && <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><Field label="Standard fee (PKR)" htmlFor="s1"><Input id="s1" type="number" defaultValue={199} /></Field><Field label="Express fee (PKR)" htmlFor="s2"><Input id="s2" type="number" defaultValue={449} /></Field><Field label="Free delivery above (PKR)" htmlFor="s3"><Input id="s3" type="number" defaultValue={2999} /></Field></div><div className="overflow-x-auto"><table className="w-full min-w-[420px] text-sm"><thead><tr className="border-b border-line text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft"><th className="py-2">City</th><th>Delivery days</th><th>Express</th></tr></thead><tbody>{CITIES.map((c) => <tr key={c} className="border-b border-line/70"><td className="py-2 font-medium">{c}</td><td>{c === 'Karachi' ? '1–2' : ['Lahore', 'Islamabad'].includes(c) ? '2–4' : '3–7'}</td><td>{['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'].includes(c) ? <Badge tone="success">Available</Badge> : <Badge>—</Badge>}</td></tr>)}</tbody></table></div></div>}
          {sec === 'notifications' && <div><Toggle label="Order status push notifications" /><Toggle label="Price-drop alerts for wishlists" /><Toggle label="Abandoned cart reminders" /><Toggle label="Admin alerts for refund spikes" /></div>}
          {sec === 'email' && <div className="grid gap-4 sm:grid-cols-2"><Field label="Sender name" htmlFor="e1"><Input id="e1" defaultValue="B-Bazar" /></Field><Field label="Sender address" htmlFor="e2"><Input id="e2" defaultValue="no-reply@bbazar.pk" /></Field><Field label="Order confirmation template" htmlFor="e3" className="sm:col-span-2"><Textarea id="e3" rows={4} defaultValue={'Assalam o Alaikum {{name}},\n\nYour order {{order_id}} has been placed. Expected delivery: {{eta}}.\n\n— Team B-Bazar'} /></Field></div>}
          {sec === 'sms' && <div className="grid gap-4 sm:grid-cols-2"><Field label="SMS provider" htmlFor="m1"><Select id="m1"><option>Jazz Business SMS</option><option>Telenor Bulk SMS</option></Select></Field><Field label="Masking" htmlFor="m2"><Input id="m2" defaultValue="B-BAZAR" /></Field><div className="sm:col-span-2"><Toggle label="OTP via SMS" /><Toggle label="Out-for-delivery SMS" /></div></div>}
          {sec === 'security' && <div><Toggle label="Require 2FA for all admin users" /><Toggle label="Lock account after 5 failed sign-ins" /><Toggle label="IP allow-list for admin console" def={false} /><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Session timeout" htmlFor="sec1"><Select id="sec1"><option>30 minutes</option><option>2 hours</option><option>8 hours</option></Select></Field></div></div>}
          {sec === 'roles' && <p className="text-sm text-ink-soft">Roles and their permission matrix are managed in <Link to="/admin/users" className="font-semibold text-brand-600">Admin Users</Link>.</p>}
          {sec === 'appearance' && <div className="space-y-4"><div className="flex items-center gap-4"><LogoMark className="h-14 w-14" /><div><p className="font-bold">B-Bazar logo</p><p className="text-xs text-ink-soft">Full logo, compact icon and favicon</p></div></div><Field label="Primary brand colour" htmlFor="ap1"><div className="flex items-center gap-3"><Input id="ap1" type="color" value={brand} onChange={(e) => setBrand(e.target.value)} className="h-10 w-16 p-1" /><span className="font-mono text-sm">{brand}</span><span className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: brand }}>Preview button</span></div></Field><Toggle label="Show seasonal theme (Eid / Azadi)" def={false} /></div>}
        </Card>
      </div>
    </>
  );
}
