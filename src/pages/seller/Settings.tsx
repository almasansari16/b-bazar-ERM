import { useState } from 'react';
import { toast } from 'sonner';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSeller } from '@/hooks/useSeller';
import { PageHeader } from '@/components/dashboard';
import { Card, CardHeader, Tabs } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Field, Switch, Select } from '@/components/ui/Form';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

type Tab = 'account' | 'shipping' | 'payments' | 'notifications' | 'team';
export default function SellerSettings() {
  usePageMeta('Settings · Seller Center');
  const { seller } = useSeller();
  const [tab, setTab] = useState<Tab>('account');
  const [n, setN] = useState({ newOrder: true, lowStock: true, reviews: true, payouts: true, marketing: false, sms: true });
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your account, shipping and team" actions={<Button onClick={() => toast.success('Settings saved.')}>Save settings</Button>} />
      <Card>
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[{ value: 'account', label: 'Account' }, { value: 'shipping', label: 'Shipping' }, { value: 'payments', label: 'Payout Account' }, { value: 'notifications', label: 'Notifications' }, { value: 'team', label: 'Team' }]} />
        <div className="p-5 sm:p-6">
          {tab === 'account' && <div className="grid max-w-2xl gap-4 sm:grid-cols-2"><Field label="Owner name" htmlFor="o-n"><Input id="o-n" defaultValue={seller.owner} /></Field><Field label="Login email" htmlFor="o-e"><Input id="o-e" defaultValue="seller@bbazar.com" /></Field><Field label="Language" htmlFor="o-l"><Select id="o-l"><option>English</option><option>اردو (Urdu)</option></Select></Field><Field label="Time zone" htmlFor="o-t"><Select id="o-t"><option>Asia/Karachi (PKT, UTC+5)</option></Select></Field></div>}
          {tab === 'shipping' && <div className="max-w-2xl space-y-4"><Field label="Default courier" htmlFor="sh-c"><Select id="sh-c"><option>TCS</option><option>Leopards Courier</option><option>M&P Express</option><option>B-Bazar Express (fulfilled)</option></Select></Field><Field label="Handling time" htmlFor="sh-h"><Select id="sh-h"><option>Same day</option><option>1 business day</option><option>2 business days</option></Select></Field><div className="flex items-center justify-between rounded-xl border border-line p-4"><div><p className="text-sm font-semibold">Ship nationwide</p><p className="text-xs text-ink-soft">Deliver to all 300+ serviceable cities</p></div><Switch checked onChange={() => toast.info('Nationwide shipping is required for verified sellers.')} label="Ship nationwide" /></div></div>}
          {tab === 'payments' && <div className="max-w-2xl space-y-4"><div className="flex items-center justify-between rounded-xl border border-line p-4"><div><p className="font-semibold">Meezan Bank Ltd</p><p className="font-mono text-sm text-ink-soft">PK36 MEZN •••• •••• 6789</p></div><Badge tone="success">Verified</Badge></div><Field label="Payout frequency" htmlFor="p-f"><Select id="p-f"><option>Weekly (Monday)</option><option>Bi-weekly</option><option>Monthly</option></Select></Field></div>}
          {tab === 'notifications' && <ul className="max-w-2xl divide-y divide-line">{([['newOrder', 'New orders', 'Instant alert for every new order'], ['lowStock', 'Low stock', 'When a product reaches its reorder level'], ['reviews', 'New reviews', 'When customers review your products'], ['payouts', 'Payouts', 'When a payout is processed'], ['marketing', 'Campaign invitations', 'Mega sales and featured placements'], ['sms', 'SMS alerts', 'Text messages for urgent order issues']] as [keyof typeof n, string, string][]).map(([k, t, d]) => <li key={k} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-semibold">{t}</p><p className="text-xs text-ink-soft">{d}</p></div><Switch checked={n[k]} onChange={(v) => setN({ ...n, [k]: v })} label={t} /></li>)}</ul>}
          {tab === 'team' && <div className="max-w-2xl"><ul className="divide-y divide-line rounded-xl border border-line">{[['Faisal Mehmood', 'Owner'], ['Areeba Khan', 'Order Manager'], ['Zubair Ali', 'Catalog Editor']].map(([nm, r]) => <li key={nm} className="flex items-center gap-3 p-3"><Avatar name={nm} size="sm" /><span className="flex-1 text-sm font-semibold">{nm}</span><Badge>{r}</Badge></li>)}</ul><Button variant="outline" className="mt-3" onClick={() => toast.success('Invitation sent.')}>Invite team member</Button></div>}
        </div>
      </Card>
      <Card className="mt-4"><CardHeader title="Danger zone" subtitle="Temporarily close your store (holiday mode) from the top bar toggle." /><div className="p-5"><Button variant="outline" className="text-red-600" onClick={() => toast.info('Contact seller support to deactivate your store.')}>Deactivate store</Button></div></Card>
    </>
  );
}
