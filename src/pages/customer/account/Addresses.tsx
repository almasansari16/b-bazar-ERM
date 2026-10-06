import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Overlay';
import { Input, Select, Field, Checkbox } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/Display';
import { CITIES, PROVINCES, CITY_PROVINCE } from '@/utils/delivery';
import type { Address } from '@/types';

const blank: Address = { id: '', label: 'Home', name: '', phone: '', line: '', city: 'Karachi', province: 'Sindh', postal: '' };
export default function Addresses() {
  usePageMeta('Addresses');
  const addresses = useMarket((s) => s.addresses);
  const upsert = useMarket((s) => s.upsertAddress);
  const del = useMarket((s) => s.deleteAddress);
  const [edit, setEdit] = useState<Address | null>(null);
  const [remove, setRemove] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const save = () => {
    if (!edit) return;
    if (edit.name.trim().length < 3 || edit.line.trim().length < 8 || !/^(\+92|0)3\d{2}[\s-]?\d{7}$/.test(edit.phone.trim()) || !/^\d{5}$/.test(edit.postal)) { setErr('Please complete all fields: name, valid mobile number, full address and 5-digit postal code.'); return; }
    upsert({ ...edit, id: edit.id || `A${Date.now()}` }); setEdit(null); setErr(''); toast.success('Address saved.');
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Addresses</h1><Button onClick={() => setEdit({ ...blank })}><Plus className="h-4 w-4" />Add New Address</Button></div>
      {addresses.length === 0 ? <div className="rounded-2xl border border-line bg-white"><EmptyState icon={<MapPin className="h-7 w-7" />} title="No saved addresses" action={<Button onClick={() => setEdit({ ...blank })}>Add address</Button>} /></div> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center gap-2"><span className="font-bold">{a.name}</span><Badge>{a.label}</Badge>{a.isDefault && <Badge tone="brand">Default</Badge>}</div>
              <p className="mt-2 text-sm text-ink-soft">{a.line}<br />{a.city}, {a.province} {a.postal}<br />{a.phone}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="xs" variant="outline" onClick={() => setEdit(a)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
                {!a.isDefault && <Button size="xs" variant="outline" onClick={() => { upsert({ ...a, isDefault: true }); toast.success('Default address updated.'); }}><Star className="h-3.5 w-3.5" />Set default</Button>}
                <Button size="xs" variant="ghost" className="text-red-600" onClick={() => setRemove(a.id)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit address' : 'Add new address'} footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save address</Button></>}>
        {edit && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" htmlFor="ad-n" required><Input id="ad-n" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Mobile number" htmlFor="ad-p" required><Input id="ad-p" value={edit.phone} placeholder="0300 1234567" onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
            <Field label="Address" htmlFor="ad-l" required className="sm:col-span-2"><Input id="ad-l" value={edit.line} onChange={(e) => setEdit({ ...edit, line: e.target.value })} /></Field>
            <Field label="City" htmlFor="ad-c"><Select id="ad-c" value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value, province: CITY_PROVINCE[e.target.value] ?? edit.province })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Province" htmlFor="ad-pr"><Select id="ad-pr" value={edit.province} onChange={(e) => setEdit({ ...edit, province: e.target.value })}>{PROVINCES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Postal code" htmlFor="ad-z" required><Input id="ad-z" value={edit.postal} inputMode="numeric" onChange={(e) => setEdit({ ...edit, postal: e.target.value.replace(/\D/g, '').slice(0, 5) })} /></Field>
            <Field label="Label" htmlFor="ad-lb"><Select id="ad-lb" value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })}><option>Home</option><option>Office</option><option>Other</option></Select></Field>
            <Checkbox className="sm:col-span-2" checked={!!edit.isDefault} onChange={(v) => setEdit({ ...edit, isDefault: v })} label="Make this my default address" />
            {err && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{err}</p>}
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!remove} onClose={() => setRemove(null)} tone="danger" title="Delete address?" message="This address will be removed from your account." confirmLabel="Delete" onConfirm={() => { del(remove!); toast('Address deleted.'); }} />
    </div>
  );
}
