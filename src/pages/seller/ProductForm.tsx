import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ImagePlus, X, Video, Save, Send, Info, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useSeller } from '@/hooks/useSeller';
import { useMarket } from '@/store/useMarket';
import { usePageMeta } from '@/hooks/usePageMeta';
import { sellerService } from '@/services';
import { PageHeader } from '@/components/dashboard';
import { Card, Tabs, PriceDisplay } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select, Field, Switch } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SmartImage } from '@/components/common/SmartImage';
import { ICON_NAMES } from '@/components/common/DynamicIcon';
import { slugify, discountPct } from '@/utils/format';
import type { Product } from '@/types';

const schema = z.object({
  title: z.string().trim().min(8, 'Product name should be at least 8 characters').max(120),
  sku: z.string().trim().min(3, 'SKU is required'),
  category: z.string().min(1, 'Choose a category'),
  subcategory: z.string().min(1, 'Choose a subcategory'),
  brand: z.string().trim().min(2, 'Brand is required'),
  short: z.string().trim().max(160, 'Keep it under 160 characters').optional(),
  description: z.string().trim().min(30, 'Description should be at least 30 characters'),
  video: z.string().optional(),
  price: z.coerce.number().min(50, 'Price must be at least Rs. 50'),
  originalPrice: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.coerce.number().int().min(0),
  barcode: z.string().optional(),
  weight: z.coerce.number().min(0),
  length: z.coerce.number().min(0), width: z.coerce.number().min(0), height: z.coerce.number().min(0),
  warranty: z.string(),
  returnPolicy: z.string(),
  colors: z.string().optional(), sizes: z.string().optional(), storage: z.string().optional(), material: z.string().optional(),
  tags: z.string().optional(),
  seoTitle: z.string().max(70, 'Max 70 characters').optional(),
  seoDescription: z.string().max(160, 'Max 160 characters').optional(),
  freeDelivery: z.boolean(),
  icon: z.string(),
}).refine((v) => !v.originalPrice || v.originalPrice >= v.price, { path: ['originalPrice'], message: 'Compare-at price must be higher than the selling price' });
type F = z.input<typeof schema>;
type FOut = z.output<typeof schema>;

type Tab = 'basic' | 'pricing' | 'inventory' | 'variants' | 'shipping' | 'seo';
const TAB_FIELDS: Record<Tab, (keyof F)[]> = {
  basic: ['title', 'sku', 'category', 'subcategory', 'brand', 'short', 'description'], pricing: ['price', 'originalPrice'], inventory: ['stock', 'lowStockThreshold', 'barcode'],
  variants: ['colors', 'sizes', 'storage', 'material'], shipping: ['weight', 'length', 'width', 'height', 'warranty', 'returnPolicy'], seo: ['seoTitle', 'seoDescription', 'tags'],
};
const split = (s?: string) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : undefined);

export default function ProductForm() {
  const { id } = useParams();
  const editing = useMarket((s) => s.products.find((p) => p.id === id));
  usePageMeta(editing ? 'Edit Product' : 'Add Product');
  const { seller, sellerId } = useSeller();
  const categories = useMarket((s) => s.categories);
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('basic');
  const [images, setImages] = useState<string[]>(editing?.images.slice(0, 4) ?? []);
  const [imgUrl, setImgUrl] = useState('');
  const [submitting, setSubmitting] = useState<'draft' | 'submit' | null>(null);

  const { register, handleSubmit, control, setValue, formState: { errors }, trigger } = useForm<F, unknown, FOut>({
    resolver: zodResolver(schema),
    defaultValues: editing ? {
      title: editing.title, sku: editing.sku, category: editing.category, subcategory: editing.subcategory, brand: editing.brand, short: editing.highlights[0], description: editing.description, video: '',
      price: editing.price, originalPrice: editing.originalPrice, stock: editing.stock, lowStockThreshold: editing.lowStockThreshold, barcode: '8964000' + editing.id.slice(1),
      weight: editing.weightKg ?? 0.5, length: 20, width: 15, height: 8, warranty: editing.warranty, returnPolicy: editing.returnPolicy,
      colors: editing.colors?.join(', '), sizes: editing.sizes?.join(', '), storage: editing.storage?.join(', '), material: editing.specs.Material ?? '', tags: editing.tags.join(', '),
      seoTitle: editing.title.slice(0, 70), seoDescription: editing.description.slice(0, 160), freeDelivery: editing.freeDelivery, icon: editing.icon,
    } : {
      title: '', sku: `TZ-${Math.floor(1000 + Math.random() * 9000)}`, category: seller.category, subcategory: '', brand: '', short: '', description: '', video: '', price: 0, originalPrice: 0, stock: 50, lowStockThreshold: 10, barcode: '',
      weight: 0.5, length: 20, width: 15, height: 8, warranty: '1 Year Brand Warranty', returnPolicy: '7 days easy return', colors: '', sizes: '', storage: '', material: '', tags: '', seoTitle: '', seoDescription: '', freeDelivery: true, icon: 'Package',
    },
  });
  const v = useWatch({ control });
  const cat = categories.find((c) => c.slug === v.category);
  useEffect(() => { if (cat && !cat.subcategories.some((s) => s.name === v.subcategory) && !editing) setValue('subcategory', ''); }, [v.category]); // eslint-disable-line react-hooks/exhaustive-deps
  const errorTabs = useMemo(() => (Object.keys(TAB_FIELDS) as Tab[]).filter((t) => TAB_FIELDS[t].some((f) => errors[f])), [errors]);

  const save = (status: 'draft' | 'pending') => handleSubmit(async (d) => {
    if (status === 'pending' && images.length === 0) { toast.error('Add at least one product image before submitting.'); setTab('basic'); return; }
    setSubmitting(status === 'draft' ? 'draft' : 'submit');
    const now = new Date().toISOString();
    const product: Product = {
      ...(editing ?? { rating: 0, reviewCount: 0, sold: 0, reserved: 0, createdAt: now, installments: d.price >= 20000 }),
      id: editing?.id ?? `P${Date.now().toString().slice(-6)}`, slug: slugify(d.title), title: d.title, brand: d.brand, category: d.category, subcategory: d.subcategory, sellerId,
      price: d.price, originalPrice: d.originalPrice || d.price, stock: d.stock, lowStockThreshold: d.lowStockThreshold, images: images.length ? images : [''], icon: d.icon,
      description: d.description, highlights: [d.short || `Genuine ${d.brand} product`, 'Quality-checked before dispatch', d.freeDelivery ? 'Free delivery across Pakistan' : 'Fast nationwide delivery', d.returnPolicy],
      specs: { Brand: d.brand, ...(d.material ? { Material: d.material } : {}), Weight: `${d.weight} kg`, Dimensions: `${d.length} × ${d.width} × ${d.height} cm` },
      colors: split(d.colors), sizes: split(d.sizes), storage: split(d.storage), tags: (editing?.tags ?? ['new']),
      freeDelivery: d.freeDelivery, warranty: d.warranty, returnPolicy: d.returnPolicy, sku: d.sku, status: status === 'draft' ? 'draft' : 'pending', submittedAt: status === 'pending' ? now : editing?.submittedAt, weightKg: d.weight,
    } as Product;
    if (editing) await sellerService.updateProduct(editing.id, product); else await sellerService.createProduct(product);
    setSubmitting(null);
    toast.success(status === 'draft' ? 'Draft saved.' : 'Product submitted for approval.', { description: status === 'pending' ? 'B-Bazar moderation usually reviews listings within 2 hours.' : undefined });
    nav('/seller/products');
  }, () => { toast.error('Please fix the highlighted fields.'); })();

  const addImage = (src: string) => { if (images.length >= 8) { toast.error('Maximum 8 images.'); return; } setImages((x) => [...x, src]); };
  const onFiles = (files: FileList | null) => {
    Array.from(files ?? []).slice(0, 8 - images.length).forEach((f) => {
      if (f.size > 1.5 * 1024 * 1024) { toast.error(`${f.name} is larger than 1.5 MB.`); return; }
      const r = new FileReader(); r.onload = () => addImage(String(r.result)); r.readAsDataURL(f);
    });
  };
  const e = (k: keyof F) => errors[k]?.message as string | undefined;

  return (
    <>
      <button type="button" onClick={() => nav('/seller/products')} className="mb-3 flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" />Back to products</button>
      <PageHeader title={editing ? 'Edit Product' : 'Add Product'} subtitle={editing ? <span className="flex items-center gap-2">{editing.sku} <StatusBadge status={editing.status} /></span> : 'New listings are reviewed by B-Bazar before going live.'}
        actions={<><Button variant="outline" onClick={() => save('draft')} loading={submitting === 'draft'}><Save className="h-4 w-4" />Save Draft</Button><Button variant="gradient" onClick={() => save('pending')} loading={submitting === 'submit'}><Send className="h-4 w-4" />Submit for Approval</Button></>} />

      {errorTabs.length > 0 && <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" />Some fields need attention in: {errorTabs.map((t) => <button key={t} type="button" onClick={() => setTab(t)} className="font-semibold capitalize underline">{t}</button>)}</div>}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <Tabs className="px-3" value={tab} onChange={async (t) => { await trigger(TAB_FIELDS[tab]); setTab(t); }} tabs={([['basic', 'Basic Information'], ['pricing', 'Pricing'], ['inventory', 'Inventory'], ['variants', 'Variants'], ['shipping', 'Shipping'], ['seo', 'SEO']] as [Tab, string][]).map(([value, label]) => ({ value, label: <span className="flex items-center gap-1.5">{label}{errorTabs.includes(value) && <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-label="has errors" />}</span> }))} />
          <form className="space-y-5 p-5 sm:p-6" onSubmit={(ev) => ev.preventDefault()} noValidate>
            {tab === 'basic' && <>
              <Field label="Product Name" htmlFor="f-title" required error={e('title')}><Input id="f-title" {...register('title')} aria-invalid={!!errors.title} placeholder="e.g. Wireless Earbuds Pro X with ANC" /></Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="SKU" htmlFor="f-sku" required error={e('sku')}><Input id="f-sku" {...register('sku')} className="font-mono" /></Field>
                <Field label="Category" htmlFor="f-cat" required error={e('category')}><Select id="f-cat" {...register('category')}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select></Field>
                <Field label="Subcategory" htmlFor="f-sub" required error={e('subcategory')}><Select id="f-sub" {...register('subcategory')} aria-invalid={!!errors.subcategory}><option value="">Select…</option>{cat?.subcategories.map((s) => <option key={s.slug}>{s.name}</option>)}</Select></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Brand" htmlFor="f-brand" required error={e('brand')}><Input id="f-brand" {...register('brand')} aria-invalid={!!errors.brand} /></Field>
                <Field label="Illustration icon" htmlFor="f-icon" hint="Shown when images are unavailable"><Select id="f-icon" {...register('icon')}>{ICON_NAMES.map((n) => <option key={n}>{n}</option>)}</Select></Field>
              </div>
              <Field label="Short Description" htmlFor="f-short" error={e('short')} hint={`${(v.short ?? '').length}/160 · Shown as the first highlight`}><Input id="f-short" {...register('short')} /></Field>
              <Field label="Description" htmlFor="f-desc" required error={e('description')}><Textarea id="f-desc" rows={6} {...register('description')} aria-invalid={!!errors.description} placeholder="Describe features, materials, what's in the box…" /></Field>
              <div>
                <p className="mb-1.5 text-[13px] font-semibold">Product Images <span className="font-normal text-ink-soft">({images.length}/8 · first image is the cover)</span></p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {images.map((src, i) => (
                    <div key={i} className={cn('group relative aspect-square overflow-hidden rounded-xl border-2', i === 0 ? 'border-brand-600' : 'border-line')}>
                      <SmartImage src={src} alt={`Product image ${i + 1}`} icon={v.icon} tint={seller.color} className="h-full w-full" />
                      {i === 0 && <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 text-[10px] font-bold text-white">Cover</span>}
                      <button type="button" onClick={() => setImages((x) => x.filter((_, k) => k !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow" aria-label={`Remove image ${i + 1}`}><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  {images.length < 8 && <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-xs font-semibold text-ink-soft hover:border-brand-300 hover:text-brand-700"><ImagePlus className="h-6 w-6" />Upload<input type="file" accept="image/*" multiple className="sr-only" onChange={(ev) => onFiles(ev.target.files)} /></label>}
                </div>
                <div className="mt-2 flex gap-2"><Input value={imgUrl} onChange={(ev) => setImgUrl(ev.target.value)} placeholder="…or paste an image URL" aria-label="Image URL" /><Button variant="outline" onClick={() => { if (imgUrl.startsWith('http')) { addImage(imgUrl); setImgUrl(''); } else toast.error('Enter a valid image URL.'); }}><Plus className="h-4 w-4" />Add</Button></div>
              </div>
              <Field label="Video URL" htmlFor="f-video" hint="YouTube or MP4 link (optional)"><Input id="f-video" {...register('video')} icon={<Video className="h-4 w-4" />} placeholder="https://" /></Field>
            </>}
            {tab === 'pricing' && <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Price (PKR)" htmlFor="f-price" required error={e('price')}><Input id="f-price" type="number" min={0} {...register('price')} aria-invalid={!!errors.price} /></Field>
                <Field label="Compare at Price (PKR)" htmlFor="f-orig" error={e('originalPrice')} hint="Original price shown struck through"><Input id="f-orig" type="number" min={0} {...register('originalPrice')} aria-invalid={!!errors.originalPrice} /></Field>
                <Field label="Discount" htmlFor="f-disc"><Input id="f-disc" readOnly value={`${discountPct(Number(v.price) || 0, Number(v.originalPrice) || 0)}%`} className="bg-muted" /></Field>
              </div>
              <div className="rounded-xl bg-muted p-4"><p className="mb-2 text-xs font-semibold text-ink-soft">Customer will see</p><PriceDisplay price={Number(v.price) || 0} original={Number(v.originalPrice) || 0} size="lg" showSave /></div>
              <p className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-800"><Info className="mt-0.5 h-4 w-4 shrink-0" />B-Bazar commission for {cat?.name ?? 'this category'} is deducted at payout. Your estimated net per unit: <b>Rs. {Math.round((Number(v.price) || 0) * 0.92).toLocaleString()}</b>.</p>
            </>}
            {tab === 'inventory' && <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Stock" htmlFor="f-stock" required error={e('stock')}><Input id="f-stock" type="number" min={0} {...register('stock')} /></Field>
              <Field label="Low Stock Threshold" htmlFor="f-low" hint="Alert when stock falls to this level"><Input id="f-low" type="number" min={0} {...register('lowStockThreshold')} /></Field>
              <Field label="Barcode (EAN/UPC)" htmlFor="f-bar"><Input id="f-bar" {...register('barcode')} className="font-mono" /></Field>
            </div>}
            {tab === 'variants' && <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Color" htmlFor="f-col" hint="Comma separated, e.g. Black, White"><Input id="f-col" {...register('colors')} /></Field>
              <Field label="Size" htmlFor="f-size" hint="e.g. S, M, L, XL"><Input id="f-size" {...register('sizes')} /></Field>
              <Field label="Storage" htmlFor="f-sto" hint="e.g. 128GB, 256GB"><Input id="f-sto" {...register('storage')} /></Field>
              <Field label="Material" htmlFor="f-mat"><Input id="f-mat" {...register('material')} /></Field>
              {(split(v.colors) ?? []).length > 0 && <div className="sm:col-span-2"><p className="mb-2 text-xs font-semibold text-ink-soft">Variant preview</p><div className="flex flex-wrap gap-2">{(split(v.colors) ?? []).flatMap((c) => (split(v.sizes) ?? split(v.storage) ?? ['']).map((s) => <span key={c + s} className="rounded-lg border border-line px-2.5 py-1 text-xs">{c}{s && ` / ${s}`}</span>))}</div></div>}
            </div>}
            {tab === 'shipping' && <>
              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="Weight (kg)" htmlFor="f-w"><Input id="f-w" type="number" step="0.1" {...register('weight')} /></Field>
                <Field label="Length (cm)" htmlFor="f-l"><Input id="f-l" type="number" {...register('length')} /></Field>
                <Field label="Width (cm)" htmlFor="f-wd"><Input id="f-wd" type="number" {...register('width')} /></Field>
                <Field label="Height (cm)" htmlFor="f-h"><Input id="f-h" type="number" {...register('height')} /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Warranty" htmlFor="f-war"><Select id="f-war" {...register('warranty')}>{['No warranty', '6 Months Seller Warranty', '1 Year Brand Warranty', '2 Years Brand Warranty'].map((x) => <option key={x}>{x}</option>)}</Select></Field>
                <Field label="Return Policy" htmlFor="f-ret"><Select id="f-ret" {...register('returnPolicy')}>{['7 days easy return', '14 days return', 'No returns (hygiene)'].map((x) => <option key={x}>{x}</option>)}</Select></Field>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-line p-4"><div><p className="text-sm font-semibold">Offer free delivery</p><p className="text-xs text-ink-soft">Listings with free delivery get a badge and rank higher</p></div><Switch checked={!!v.freeDelivery} onChange={(x) => setValue('freeDelivery', x)} label="Free delivery" /></div>
            </>}
            {tab === 'seo' && <>
              <Field label="SEO Title" htmlFor="f-seot" error={e('seoTitle')} hint={`${(v.seoTitle ?? '').length}/70`}><Input id="f-seot" {...register('seoTitle')} /></Field>
              <Field label="SEO Description" htmlFor="f-seod" error={e('seoDescription')} hint={`${(v.seoDescription ?? '').length}/160`}><Textarea id="f-seod" rows={3} {...register('seoDescription')} /></Field>
              <Field label="Tags" htmlFor="f-tags" hint="Comma separated keywords"><Input id="f-tags" {...register('tags')} /></Field>
              <div className="rounded-xl border border-line p-4"><p className="mb-1 text-xs font-semibold text-ink-soft">Search preview</p><p className="truncate text-[15px] text-[#1a0dab]">{v.seoTitle || v.title || 'Product title'} | B-Bazar</p><p className="text-xs text-emerald-700">bbazar.pk › product › {slugify(v.title || 'product')}</p><p className="line-clamp-2 text-xs text-ink-soft">{v.seoDescription || v.description || 'Product description will appear here.'}</p></div>
            </>}
          </form>
        </Card>
        <aside className="space-y-4 xl:sticky xl:top-24">
          <Card className="p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Listing preview</p>
            <SmartImage src={images[0]} alt="" icon={v.icon} tint={seller.color} className="aspect-square rounded-xl" />
            <p className="mt-3 line-clamp-2 text-sm font-semibold">{v.title || 'Your product name'}</p>
            <p className="text-xs text-ink-soft">{seller.name}</p>
            <PriceDisplay price={Number(v.price) || 0} original={Number(v.originalPrice) || 0} size="sm" className="mt-1" />
          </Card>
          <Card className="p-5 text-sm">
            <p className="font-bold">Approval checklist</p>
            <ul className="mt-3 space-y-2">
              {[[(v.title ?? '').length >= 8, 'Descriptive product name'], [images.length > 0, 'At least one image'], [(v.description ?? '').length >= 30, 'Detailed description'], [Number(v.price) > 0, 'Price set'], [!!v.subcategory, 'Subcategory selected']].map(([ok, l]) => (
                <li key={l as string} className="flex items-center gap-2"><span className={cn('grid h-4 w-4 place-items-center rounded-full text-[10px] text-white', ok ? 'bg-emerald-500' : 'bg-slate-300')}>✓</span><span className={ok ? '' : 'text-ink-soft'}>{l as string}</span></li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
