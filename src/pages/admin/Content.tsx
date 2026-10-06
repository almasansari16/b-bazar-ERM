import { useState } from 'react';
import { Image, LayoutGrid, Star, Zap, Megaphone, HelpCircle, Link2, Pencil, Eye, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useMarket } from '@/store/useMarket';
import { useLiveProducts } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { Card, CardHeader } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Field, Select, Switch, Textarea, Checkbox } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Overlay';
import { SmartImage } from '@/components/common/SmartImage';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { FAQS } from '@/pages/customer/Help';
import type { Banner } from '@/types';

type Section = 'hero' | 'promo' | 'featured' | 'categories' | 'flash' | 'announce' | 'faq' | 'footer';
const NAV: [Section, string, typeof Image][] = [['hero', 'Homepage banners', Image], ['promo', 'Promotional banners', Megaphone], ['featured', 'Featured products', Star], ['categories', 'Featured categories', LayoutGrid], ['flash', 'Flash sale', Zap], ['announce', 'Announcements', Megaphone], ['faq', 'FAQs', HelpCircle], ['footer', 'Footer links', Link2]];
const THEME: Record<Banner['theme'], string> = { indigo: 'from-[#1E1B4B] to-[#4338CA]', violet: 'from-[#312E81] to-[#7C3AED]', teal: 'from-[#134E4A] to-[#0891B2]', amber: 'from-[#78350F] to-[#D97706]' };

export default function AdminContent() {
  usePageMeta('Content · Admin');
  const banners = useMarket((s) => s.banners);
  const upsertBanner = useMarket((s) => s.upsertBanner);
  const categories = useMarket((s) => s.categories);
  const upsertCategory = useMarket((s) => s.upsertCategory);
  const products = useLiveProducts();
  const updateProduct = useMarket((s) => s.updateProduct);
  const nav = useNavigate();
  const [sec, setSec] = useState<Section>('hero');
  const [edit, setEdit] = useState<Banner | null>(null);
  const [announce, setAnnounce] = useState({ text: 'Free delivery on orders above Rs. 2,999 — this week only!', active: true });
  const [faqs, setFaqs] = useState(FAQS);
  const [footer, setFooter] = useState([['About B-Bazar', '/page/about'], ['Help Center', '/help'], ['Returns & Refunds', '/page/returns'], ['Privacy Policy', '/page/privacy'], ['Terms & Conditions', '/page/terms']]);

  const bannerList = (placement: Banner['placement']) => (
    <Card>
      <CardHeader title={placement === 'hero' ? 'Homepage hero carousel' : 'Promotional banners'} subtitle="Changes publish instantly to the storefront" action={<Button size="sm" onClick={() => setEdit({ id: `B${Date.now()}`, placement, title: '', subtitle: '', cta: 'Shop Now', link: '/shop', image: '', theme: 'indigo', active: true })}><Plus className="h-4 w-4" />Add banner</Button>} />
      <ul className="grid gap-3 p-5 sm:grid-cols-2">
        {banners.filter((b) => b.placement === placement).map((b) => (
          <li key={b.id} className={cn('overflow-hidden rounded-xl border border-line', !b.active && 'opacity-60')}>
            <div className={cn('relative h-28 bg-gradient-to-br p-4 text-white', THEME[b.theme])}><SmartImage src={b.image} alt="" icon="Image" tint="#ffffff" className="absolute inset-y-0 right-0 w-1/3 opacity-30" /><p className="relative text-[10px] font-semibold uppercase text-white/70">{b.eyebrow}</p><p className="relative line-clamp-2 font-extrabold">{b.title}</p><span className="relative mt-1 inline-block rounded bg-white/20 px-2 py-0.5 text-[11px]">{b.cta}</span></div>
            <div className="flex items-center justify-between gap-2 p-3"><span className="truncate font-mono text-xs text-ink-soft">{b.link}</span><span className="flex items-center gap-1"><Switch checked={b.active} onChange={(v) => { upsertBanner({ ...b, active: v }); toast.success(v ? 'Banner published.' : 'Banner hidden.'); }} label={`Show ${b.title}`} /><Button size="icon-sm" variant="ghost" aria-label="Edit banner" onClick={() => setEdit(b)}><Pencil className="h-4 w-4" /></Button></span></div>
          </li>
        ))}
      </ul>
    </Card>
  );

  return (
    <>
      <PageHeader title="Content" subtitle="Manage what shoppers see on the storefront" actions={<Button variant="outline" onClick={() => nav('/')}><Eye className="h-4 w-4" />View storefront</Button>} />
      <div className="grid items-start gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="p-2"><nav className="no-scrollbar flex gap-1 overflow-x-auto lg:block lg:space-y-0.5" aria-label="Content sections">{NAV.map(([k, l, I]) => <button key={k} type="button" onClick={() => setSec(k)} aria-current={sec === k} className={cn('flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium lg:w-full', sec === k ? 'bg-brand-50 text-brand-700' : 'hover:bg-muted')}><I className="h-4 w-4" />{l}</button>)}</nav></Card>
        <div className="min-w-0">
          {sec === 'hero' && bannerList('hero')}
          {sec === 'promo' && bannerList('promo')}
          {sec === 'featured' && <Card><CardHeader title="Featured products" subtitle="Toggle the Trending tag to feature on the homepage" /><ul className="grid gap-2 p-5 sm:grid-cols-2">{products.slice(0, 30).map((p) => <li key={p.id}><Checkbox className="w-full rounded-lg border border-line p-2" checked={p.tags.includes('trending')} onChange={(v) => { updateProduct(p.id, { tags: v ? [...p.tags, 'trending'] : p.tags.filter((t) => t !== 'trending') }); toast.success(v ? 'Featured on homepage.' : 'Removed from homepage.'); }} label={<span className="line-clamp-1 text-sm">{p.title}</span>} /></li>)}</ul></Card>}
          {sec === 'categories' && <Card><CardHeader title="Featured categories" subtitle="Enabled categories appear in navigation; order is set in Categories" /><ul className="grid gap-2 p-5 sm:grid-cols-3">{categories.map((c) => <li key={c.id} className="flex items-center justify-between rounded-lg border border-line p-3"><span className="flex items-center gap-2 text-sm"><DynamicIcon name={c.icon} className="h-4 w-4" />{c.name}</span><Switch checked={c.enabled} onChange={(v) => upsertCategory({ ...c, enabled: v })} label={c.name} /></li>)}</ul></Card>}
          {sec === 'flash' && <Card><CardHeader title="Flash sale" subtitle="Products tagged for the homepage flash sale rail" /><ul className="grid gap-2 p-5 sm:grid-cols-2">{products.slice(0, 40).map((p) => <li key={p.id}><Checkbox className="w-full rounded-lg border border-line p-2" checked={p.tags.includes('flash')} onChange={(v) => updateProduct(p.id, { tags: v ? [...p.tags, 'flash'] : p.tags.filter((t) => t !== 'flash') })} label={<span className="line-clamp-1 text-sm">{p.title}</span>} /></li>)}</ul></Card>}
          {sec === 'announce' && <Card className="p-5"><h3 className="font-bold">Site-wide announcement</h3><div className="mt-4 space-y-3"><Field label="Message" htmlFor="an"><Textarea id="an" rows={2} value={announce.text} onChange={(e) => setAnnounce({ ...announce, text: e.target.value })} /></Field><div className="flex items-center gap-3"><Switch checked={announce.active} onChange={(v) => setAnnounce({ ...announce, active: v })} label="Show announcement" /><span className="text-sm">Show on storefront</span></div><div className="rounded-lg bg-brand-900 px-4 py-2 text-center text-xs text-white">{announce.text}</div><Button onClick={() => toast.success('Announcement published.')}>Publish</Button></div></Card>}
          {sec === 'faq' && <Card><CardHeader title="FAQs" subtitle="Shown in the Help Center" action={<Button size="sm" onClick={() => setFaqs((f) => [...f, ['New question', 'Answer']])}><Plus className="h-4 w-4" />Add FAQ</Button>} /><ul className="space-y-3 p-5">{faqs.map(([q, a], i) => <li key={i} className="space-y-2 rounded-xl border border-line p-3"><Input aria-label="Question" value={q} onChange={(e) => setFaqs((f) => f.map((x, k) => (k === i ? [e.target.value, x[1]] : x)))} className="font-semibold" /><Textarea aria-label="Answer" rows={2} value={a} onChange={(e) => setFaqs((f) => f.map((x, k) => (k === i ? [x[0], e.target.value] : x)))} /><Button size="xs" variant="ghost" className="text-red-600" onClick={() => setFaqs((f) => f.filter((_, k) => k !== i))}><Trash2 className="h-3.5 w-3.5" />Remove</Button></li>)}</ul><div className="px-5 pb-5"><Button onClick={() => toast.success('FAQs saved.')}>Save FAQs</Button></div></Card>}
          {sec === 'footer' && <Card><CardHeader title="Footer links" /><ul className="space-y-2 p-5">{footer.map(([l, h], i) => <li key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2"><Input aria-label="Label" value={l} onChange={(e) => setFooter((f) => f.map((x, k) => (k === i ? [e.target.value, x[1]] : x)))} /><Input aria-label="URL" className="font-mono text-xs" value={h} onChange={(e) => setFooter((f) => f.map((x, k) => (k === i ? [x[0], e.target.value] : x)))} /><Button size="icon" variant="ghost" aria-label="Remove link" onClick={() => setFooter((f) => f.filter((_, k) => k !== i))}><Trash2 className="h-4 w-4" /></Button></li>)}</ul><div className="flex gap-2 px-5 pb-5"><Button variant="outline" onClick={() => setFooter((f) => [...f, ['New link', '/']])}><Plus className="h-4 w-4" />Add link</Button><Button onClick={() => toast.success('Footer updated.')}>Save</Button></div></Card>}
        </div>
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Banner" size="lg" footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={() => { if (!edit!.title) { toast.error('Add a title.'); return; } upsertBanner(edit!); toast.success('Banner saved and published.'); setEdit(null); }}>Save</Button></>}>
        {edit && <div className="grid gap-3 sm:grid-cols-2">
          <div className={cn('rounded-xl bg-gradient-to-br p-5 text-white sm:col-span-2', THEME[edit.theme])}><p className="text-[11px] uppercase text-white/70">{edit.eyebrow}</p><p className="text-xl font-extrabold">{edit.title || 'Banner title'}</p><p className="text-sm text-white/80">{edit.subtitle}</p><span className="mt-3 inline-block rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-bold text-ink">{edit.cta}</span></div>
          <Field label="Eyebrow" htmlFor="b-ey"><Input id="b-ey" value={edit.eyebrow ?? ''} onChange={(e) => setEdit({ ...edit, eyebrow: e.target.value })} /></Field>
          <Field label="Theme" htmlFor="b-th"><Select id="b-th" value={edit.theme} onChange={(e) => setEdit({ ...edit, theme: e.target.value as Banner['theme'] })}><option value="indigo">Indigo</option><option value="violet">Violet</option><option value="teal">Teal</option><option value="amber">Amber</option></Select></Field>
          <Field label="Title" htmlFor="b-t" className="sm:col-span-2"><Input id="b-t" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
          <Field label="Subtitle" htmlFor="b-s" className="sm:col-span-2"><Input id="b-s" value={edit.subtitle} onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })} /></Field>
          <Field label="Button text" htmlFor="b-c"><Input id="b-c" value={edit.cta} onChange={(e) => setEdit({ ...edit, cta: e.target.value })} /></Field>
          <Field label="Link" htmlFor="b-l"><Input id="b-l" value={edit.link} onChange={(e) => setEdit({ ...edit, link: e.target.value })} className="font-mono text-xs" /></Field>
          <Field label="Image URL" htmlFor="b-i" className="sm:col-span-2"><Input id="b-i" value={edit.image} onChange={(e) => setEdit({ ...edit, image: e.target.value })} /></Field>
        </div>}
      </Modal>
    </>
  );
}
