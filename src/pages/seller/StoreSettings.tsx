import { useState } from 'react';
import { Eye, Upload, Palette, BadgeCheck, Star, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useSeller } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { Card, CardHeader } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Field, Checkbox, Select } from '@/components/ui/Form';
import { Avatar } from '@/components/ui/Avatar';
import { SmartImage } from '@/components/common/SmartImage';
import { CITIES } from '@/utils/delivery';

const SWATCHES = ['#4338CA', '#7C3AED', '#0891B2', '#059669', '#DB2777', '#EA580C', '#B45309', '#312E81'];
export default function StoreSettings() {
  usePageMeta('Store · Seller Center');
  const { seller, products } = useSeller();
  const updateSeller = useMarket((s) => s.updateSeller);
  const nav = useNavigate();
  const [f, setF] = useState({ name: seller.name, tagline: seller.tagline, description: seller.description, phone: seller.phone, email: seller.email, city: seller.city, color: seller.color, ntn: '4210187-6', business: 'TechZone Traders (Pvt) Ltd', address: 'Shop 14, Saddar Electronics Market, Karachi' });
  const [featured, setFeatured] = useState<string[]>(products.slice(0, 4).map((p) => p.id));
  const save = () => { updateSeller(seller.id, { name: f.name, tagline: f.tagline, description: f.description, phone: f.phone, email: f.email, city: f.city, color: f.color }); toast.success('Store updated — changes are live.'); };
  return (
    <>
      <PageHeader title="Store" subtitle="Customise how your storefront looks to shoppers" actions={<><Button variant="outline" onClick={() => nav(`/store/${seller.slug}`)}><Eye className="h-4 w-4" />Preview Store</Button><Button onClick={save}>Save changes</Button></>} />
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <Card><CardHeader title="Branding" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div><p className="mb-1.5 text-[13px] font-semibold">Store Logo</p><div className="flex items-center gap-3"><Avatar name={f.name} color={f.color} size="lg" square /><Button variant="outline" size="sm" onClick={() => toast.info('Logo upload saved (demo).')}><Upload className="h-4 w-4" />Upload</Button></div></div>
              <div><p className="mb-1.5 text-[13px] font-semibold">Store Banner</p><div className="flex items-center gap-3"><div className="h-14 w-28 rounded-lg" style={{ background: `linear-gradient(120deg, ${f.color}, #7C3AED)` }} /><Button variant="outline" size="sm" onClick={() => toast.info('Banner upload saved (demo).')}><Upload className="h-4 w-4" />Upload</Button></div></div>
              <div className="sm:col-span-2"><p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold"><Palette className="h-4 w-4" />Theme colour</p><div className="flex flex-wrap gap-2">{SWATCHES.map((c) => <button key={c} type="button" onClick={() => setF({ ...f, color: c })} aria-label={`Theme ${c}`} aria-pressed={f.color === c} className={cn('grid h-9 w-9 place-items-center rounded-full ring-2 ring-offset-2', f.color === c ? 'ring-ink' : 'ring-transparent')} style={{ background: c }}>{f.color === c && <Check className="h-4 w-4 text-white" />}</button>)}</div></div>
            </div>
          </Card>
          <Card><CardHeader title="Store details" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Store Name" htmlFor="s-name"><Input id="s-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
              <Field label="Tagline" htmlFor="s-tag"><Input id="s-tag" value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></Field>
              <Field label="Description" htmlFor="s-desc" className="sm:col-span-2"><Textarea id="s-desc" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
            </div>
          </Card>
          <Card><CardHeader title="Contact" />
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <Field label="Phone" htmlFor="s-ph"><Input id="s-ph" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
              <Field label="Email" htmlFor="s-em"><Input id="s-em" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
              <Field label="City" htmlFor="s-city"><Select id="s-city" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            </div>
          </Card>
          <Card><CardHeader title="Business Information" subtitle="Verified by B-Bazar — contact support to change" />
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <Field label="Registered name" htmlFor="s-bn"><Input id="s-bn" value={f.business} readOnly className="bg-muted" /></Field>
              <Field label="NTN" htmlFor="s-ntn"><Input id="s-ntn" value={f.ntn} readOnly className="bg-muted" /></Field>
              <Field label="Warehouse address" htmlFor="s-addr"><Input id="s-addr" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
            </div>
          </Card>
          <Card><CardHeader title="Featured Products" subtitle="Pick up to 4 products for your store homepage" />
            <div className="grid gap-2 p-5 sm:grid-cols-2">{products.filter((p) => p.status === 'approved').map((p) => <Checkbox key={p.id} className="rounded-lg border border-line p-2" checked={featured.includes(p.id)} onChange={(v) => setFeatured((x) => (v ? (x.length >= 4 ? (toast.error('Maximum 4 featured products.'), x) : [...x, p.id]) : x.filter((y) => y !== p.id)))} label={<span className="line-clamp-1 text-sm">{p.title}</span>} />)}</div>
          </Card>
          <Card><CardHeader title="Store Categories" />
            <div className="flex flex-wrap gap-2 p-5">{[...new Set(products.map((p) => p.subcategory))].map((c) => <span key={c} className="rounded-full bg-muted px-3 py-1 text-sm">{c}</span>)}</div>
          </Card>
        </div>
        <aside className="xl:sticky xl:top-24">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Theme Preview</p>
          <Card className="overflow-hidden">
            <div className="h-24" style={{ background: `linear-gradient(120deg, ${f.color}, ${f.color}aa 45%, #7C3AED)` }} />
            <div className="px-4 pb-4">
              <Avatar name={f.name} color={f.color} size="lg" square className="-mt-7 ring-4 ring-white" />
              <p className="mt-2 flex items-center gap-1 font-extrabold">{f.name}<BadgeCheck className="h-4 w-4 fill-brand-600 text-white" /></p>
              <p className="text-xs text-ink-soft">{f.tagline}</p>
              <p className="mt-1 flex items-center gap-1 text-xs"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{seller.rating} · {seller.positive}% positive</p>
              <div className="mt-3 grid grid-cols-2 gap-2">{products.filter((p) => featured.includes(p.id)).map((p) => <div key={p.id}><SmartImage src={p.images[0]} alt="" icon={p.icon} tint={f.color} className="aspect-square rounded-lg" /><p className="mt-1 truncate text-[11px]">{p.title}</p></div>)}</div>
              <Button className="mt-3 w-full" style={{ background: f.color }} onClick={() => nav(`/store/${seller.slug}`)}>Preview Store</Button>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
