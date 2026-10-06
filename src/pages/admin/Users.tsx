import { useState } from 'react';
import { Plus, ShieldCheck, Check, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { Card, CardHeader } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Overlay';
import { Input, Field, Select } from '@/components/ui/Form';
import { timeAgo } from '@/utils/format';

interface AdminUser { id: string; name: string; email: string; role: string; status: 'active' | 'inactive'; lastActive: string; twoFa: boolean }
const ROLES = ['Super Admin', 'Operations Manager', 'Catalog Moderator', 'Finance', 'Support Agent', 'Marketing'];
const PERMS = ['Dashboard', 'Orders', 'Products', 'Sellers', 'Customers', 'Finance', 'Promotions', 'Content', 'Settings'];
const MATRIX: Record<string, string[]> = {
  'Super Admin': PERMS, 'Operations Manager': ['Dashboard', 'Orders', 'Products', 'Sellers', 'Customers'], 'Catalog Moderator': ['Dashboard', 'Products', 'Sellers'],
  Finance: ['Dashboard', 'Orders', 'Finance'], 'Support Agent': ['Orders', 'Customers'], Marketing: ['Dashboard', 'Promotions', 'Content'],
};
const seed: AdminUser[] = [
  ['Nadia Hussain', 'admin@bbazar.com', 'Super Admin', 0.1], ['Kamran Abbasi', 'kamran@bbazar.pk', 'Operations Manager', 1], ['Sana Rafiq', 'sana@bbazar.pk', 'Support Agent', 0.3], ['Usman Tariq', 'usman@bbazar.pk', 'Support Agent', 4],
  ['Mariam Shah', 'mariam@bbazar.pk', 'Catalog Moderator', 2], ['Adeel Qadir', 'adeel@bbazar.pk', 'Finance', 26], ['Hina Yousuf', 'hina@bbazar.pk', 'Marketing', 6], ['Bilal Chaudhry', 'bilal@bbazar.pk', 'Catalog Moderator', 200],
].map(([name, email, role, h], i) => ({ id: `AU${100 + i}`, name: name as string, email: email as string, role: role as string, status: (h as number) > 100 ? 'inactive' : 'active', lastActive: new Date(Date.now() - (h as number) * 3.6e6).toISOString(), twoFa: i !== 7 }));

export default function AdminUsers() {
  usePageMeta('Admin Users · Admin');
  const [users, setUsers] = useState(seed);
  const [invite, setInvite] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Support Agent' });
  const cols: Column<AdminUser>[] = [
    { key: 'name', header: 'User', primary: true, render: (u) => <div className="flex items-center gap-2.5"><Avatar name={u.name} size="sm" /><div><p className="font-semibold">{u.name}</p><p className="text-xs text-ink-soft">{u.email}</p></div></div>, sortValue: (u) => u.name },
    { key: 'role', header: 'Role', render: (u) => <Badge tone={u.role === 'Super Admin' ? 'violet' : 'brand'}>{u.role}</Badge>, sortValue: (u) => u.role },
    { key: '2fa', header: '2FA', render: (u) => (u.twoFa ? <span className="flex items-center gap-1 text-xs text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" />On</span> : <span className="text-xs text-amber-600">Off</span>) },
    { key: 'last', header: 'Last active', render: (u) => <span className="text-xs text-ink-soft">{timeAgo(u.lastActive)}</span>, sortValue: (u) => u.lastActive },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} />, sortValue: (u) => u.status },
  ];
  return (
    <>
      <PageHeader title="Admin Users" subtitle="Staff accounts, roles and permissions" actions={<Button onClick={() => setInvite(true)}><Plus className="h-4 w-4" />Invite user</Button>} />
      <Card><DataTable data={users} columns={cols} rowKey={(u) => u.id} searchKeys={(u) => `${u.name} ${u.email} ${u.role}`} searchPlaceholder="Search staff" selectable={false}
        rowActions={(u) => <Select aria-label={`Role for ${u.name}`} value={u.role} onChange={(e) => { setUsers((x) => x.map((y) => (y.id === u.id ? { ...y, role: e.target.value } : y))); toast.success(`${u.name} is now ${e.target.value}.`); }} className="h-8 w-44 text-xs">{ROLES.map((r) => <option key={r}>{r}</option>)}</Select>} /></Card>
      <Card className="mt-6">
        <CardHeader title="Roles & Permissions" subtitle="What each role can access" />
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
          <thead><tr className="border-y border-line bg-slate-50"><th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft">Role</th>{PERMS.map((p) => <th key={p} className="px-2 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-ink-soft">{p}</th>)}</tr></thead>
          <tbody>{ROLES.map((r) => <tr key={r} className="border-b border-line last:border-0"><td className="px-4 py-2.5 font-semibold">{r}</td>{PERMS.map((p) => <td key={p} className="px-2 py-2.5 text-center">{MATRIX[r].includes(p) ? <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Allowed" /> : <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="Not allowed" />}</td>)}</tr>)}</tbody>
        </table></div>
      </Card>
      <Modal open={invite} onClose={() => setInvite(false)} title="Invite admin user" footer={<><Button variant="outline" onClick={() => setInvite(false)}>Cancel</Button><Button onClick={() => { if (!form.name || !/\S+@\S+/.test(form.email)) { toast.error('Enter a name and valid email.'); return; } setUsers((u) => [...u, { id: `AU${Date.now()}`, ...form, status: 'active', lastActive: new Date().toISOString(), twoFa: false }]); setInvite(false); toast.success(`Invitation sent to ${form.email}.`); }}>Send invite</Button></>}>
        <div className="grid gap-3"><Field label="Name" htmlFor="iu-n"><Input id="iu-n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Email" htmlFor="iu-e"><Input id="iu-e" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field><Field label="Role" htmlFor="iu-r"><Select id="iu-r" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</Select></Field></div>
      </Modal>
    </>
  );
}
