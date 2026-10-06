import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, LayoutGrid, List, X, SearchX, ChevronDown, Star, PackageSearch } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLiveProducts, useSellerMap } from '@/hooks/useCatalog';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Breadcrumb, EmptyState, Pagination } from '@/components/ui/Display';
import { Checkbox, Select, Input } from '@/components/ui/Form';
import { Button, LinkButton } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Overlay';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { discountPct, formatPKR } from '@/utils/format';
import { TRENDING } from '@/components/navigation/SearchBar';
import type { Product } from '@/types';

type Sort = 'recommended' | 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'discount';
const SORTS: [Sort, string][] = [['recommended', 'Recommended'], ['popular', 'Popular'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['newest', 'Newest'], ['rating', 'Top Rated'], ['discount', 'Biggest Discount']];
const PRICE_BANDS: [string, number, number][] = [['Under Rs. 1,000', 0, 999], ['Rs. 1,000 – 5,000', 1000, 5000], ['Rs. 5,000 – 20,000', 5000, 20000], ['Rs. 20,000 – 100,000', 20000, 100000], ['Above Rs. 100,000', 100000, Infinity]];
const TAG_TITLE: Record<string, string> = { flash: 'Flash Sale', new: 'New Arrivals', bestseller: 'Best Sellers', trending: 'Trending Now', top: 'Top Rated' };
const PAGE = 24;

interface Filters { cats: string[]; subs: string[]; brands: string[]; sellers: string[]; colors: string[]; sizes: string[]; min: string; max: string; rating: number; inStock: boolean; discount: number; freeDelivery: boolean }
const EMPTY: Filters = { cats: [], subs: [], brands: [], sellers: [], colors: [], sizes: [], min: '', max: '', rating: 0, inStock: false, discount: 0, freeDelivery: false };

export default function Shop() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const q = params.get('q')?.trim() ?? '';
  const tag = params.get('tag') ?? '';
  const sort = (params.get('sort') as Sort) || (q ? 'recommended' : 'popular');
  const all = useLiveProducts();
  const sellers = useSellerMap();
  const categories = useMarket((s) => s.categories);
  const category = categories.find((c) => c.slug === slug);
  const [f, setF] = useState<Filters>(EMPTY);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [drawer, setDrawer] = useState(false);
  const [page, setPage] = useState(1);
  const loading = useSimulatedLoad(`${slug}|${q}|${tag}`, 450);

  const subParam = params.get('sub');
  const deliveryParam = params.get('delivery');
  useEffect(() => {
    setF({ ...EMPTY, subs: subParam ? [subParam] : [], freeDelivery: deliveryParam === 'free' });
    setPage(1);
  }, [slug, q, tag, subParam, deliveryParam]);

  const title = category?.name ?? (q ? `Results for “${q}”` : tag ? TAG_TITLE[tag] ?? 'Shop' : 'All Products');
  usePageMeta(category?.name ?? (q ? `Search: ${q}` : TAG_TITLE[tag] ?? 'Shop'), category?.description);

  // Base scope = route (category / search / tag); facets are computed from it
  const scope = useMemo(() => {
    let list = all;
    if (category) list = list.filter((p) => p.category === category.slug);
    if (tag) list = list.filter((p) => p.tags.includes(tag as Product['tags'][number]));
    if (q) {
      const terms = q.toLowerCase().split(/\s+/);
      list = list.filter((p) => { const hay = `${p.title} ${p.brand} ${p.subcategory} ${p.category} ${sellers[p.sellerId]?.name}`.toLowerCase(); return terms.every((t) => hay.includes(t)); });
    }
    return list;
  }, [all, category, tag, q, sellers]);

  const results = useMemo(() => {
    let list = scope.filter((p) =>
      (!f.cats.length || f.cats.includes(p.category)) &&
      (!f.subs.length || f.subs.includes(p.subcategory)) &&
      (!f.brands.length || f.brands.includes(p.brand)) &&
      (!f.sellers.length || f.sellers.includes(p.sellerId)) &&
      (!f.colors.length || p.colors?.some((c) => f.colors.includes(c))) &&
      (!f.sizes.length || p.sizes?.some((c) => f.sizes.includes(c))) &&
      (!f.min || p.price >= Number(f.min)) && (!f.max || p.price <= Number(f.max)) &&
      p.rating >= f.rating && (!f.inStock || p.stock > 0) && discountPct(p.price, p.originalPrice) >= f.discount && (!f.freeDelivery || p.freeDelivery));
    const s = [...list];
    switch (sort) {
      case 'price-asc': s.sort((a, b) => a.price - b.price); break;
      case 'price-desc': s.sort((a, b) => b.price - a.price); break;
      case 'newest': s.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case 'rating': s.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount); break;
      case 'popular': s.sort((a, b) => b.sold - a.sold); break;
      case 'discount': s.sort((a, b) => discountPct(b.price, b.originalPrice) - discountPct(a.price, a.originalPrice)); break;
      default: s.sort((a, b) => b.rating * Math.log(b.sold + 2) - a.rating * Math.log(a.sold + 2));
    }
    return s;
  }, [scope, f, sort]);

  const facets = useMemo(() => {
    const count = (fn: (p: Product) => string[] | string | undefined) => {
      const m = new Map<string, number>();
      scope.forEach((p) => { const v = fn(p); (Array.isArray(v) ? v : v ? [v] : []).forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)); });
      return [...m.entries()].sort((a, b) => b[1] - a[1]);
    };
    return { cats: count((p) => p.category), subs: count((p) => p.subcategory), brands: count((p) => p.brand), sellers: count((p) => p.sellerId), colors: count((p) => p.colors), sizes: count((p) => p.sizes) };
  }, [scope]);

  const toggle = (k: 'cats' | 'subs' | 'brands' | 'sellers' | 'colors' | 'sizes', v: string) => { setPage(1); setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v] })); };
  const active = [
    ...f.cats.map((v) => ({ label: categories.find((c) => c.slug === v)?.short ?? v, clear: () => toggle('cats', v) })),
    ...f.subs.map((v) => ({ label: v, clear: () => toggle('subs', v) })),
    ...f.brands.map((v) => ({ label: v, clear: () => toggle('brands', v) })),
    ...f.sellers.map((v) => ({ label: sellers[v]?.name ?? v, clear: () => toggle('sellers', v) })),
    ...f.colors.map((v) => ({ label: v, clear: () => toggle('colors', v) })),
    ...f.sizes.map((v) => ({ label: `Size ${v}`, clear: () => toggle('sizes', v) })),
    ...(f.min || f.max ? [{ label: `${f.min ? formatPKR(+f.min) : 'Rs. 0'} – ${f.max ? formatPKR(+f.max) : 'Any'}`, clear: () => setF((x) => ({ ...x, min: '', max: '' })) }] : []),
    ...(f.rating ? [{ label: `${f.rating}★ & up`, clear: () => setF((x) => ({ ...x, rating: 0 })) }] : []),
    ...(f.inStock ? [{ label: 'In stock', clear: () => setF((x) => ({ ...x, inStock: false })) }] : []),
    ...(f.discount ? [{ label: `${f.discount}%+ off`, clear: () => setF((x) => ({ ...x, discount: 0 })) }] : []),
    ...(f.freeDelivery ? [{ label: 'Free delivery', clear: () => setF((x) => ({ ...x, freeDelivery: false })) }] : []),
  ];
  const pages = Math.ceil(results.length / PAGE);
  const shown = results.slice((page - 1) * PAGE, page * PAGE);

  const panel = (
    <div className="space-y-1">
      {!category && facets.cats.length > 1 && (
        <Facet title="Categories">{facets.cats.map(([v, n]) => <Checkbox key={v} className="w-full py-1" checked={f.cats.includes(v)} onChange={() => toggle('cats', v)} label={<FacetLabel label={categories.find((c) => c.slug === v)?.name ?? v} n={n} />} />)}</Facet>
      )}
      {facets.subs.length > 1 && <Facet title={category ? 'Categories' : 'Subcategory'}>{facets.subs.slice(0, 10).map(([v, n]) => <Checkbox key={v} className="w-full py-1" checked={f.subs.includes(v)} onChange={() => toggle('subs', v)} label={<FacetLabel label={v} n={n} />} />)}</Facet>}
      <Facet title="Brand">{facets.brands.slice(0, 10).map(([v, n]) => <Checkbox key={v} className="w-full py-1" checked={f.brands.includes(v)} onChange={() => toggle('brands', v)} label={<FacetLabel label={v} n={n} />} />)}</Facet>
      <Facet title="Price">
        <div className="space-y-1.5">
          {PRICE_BANDS.map(([l, a, b]) => {
            const on = f.min === String(a) && f.max === (b === Infinity ? '' : String(b));
            return <button key={l} type="button" onClick={() => setF((x) => ({ ...x, min: on ? '' : String(a), max: on || b === Infinity ? '' : String(b) }))} className={cn('block w-full rounded-md px-2 py-1 text-left text-sm', on ? 'bg-brand-50 font-semibold text-brand-700' : 'hover:bg-muted')}>{l}</button>;
          })}
          <div className="flex items-center gap-2 pt-1">
            <Input aria-label="Minimum price" inputMode="numeric" placeholder="Min" value={f.min} onChange={(e) => setF((x) => ({ ...x, min: e.target.value.replace(/\D/g, '') }))} className="h-9" />
            <span className="text-ink-soft">–</span>
            <Input aria-label="Maximum price" inputMode="numeric" placeholder="Max" value={f.max} onChange={(e) => setF((x) => ({ ...x, max: e.target.value.replace(/\D/g, '') }))} className="h-9" />
          </div>
        </div>
      </Facet>
      <Facet title="Rating">
        {[4.5, 4, 3.5].map((r) => (
          <button key={r} type="button" onClick={() => setF((x) => ({ ...x, rating: x.rating === r ? 0 : r }))} aria-pressed={f.rating === r} className={cn('flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm', f.rating === r ? 'bg-brand-50 font-semibold text-brand-700' : 'hover:bg-muted')}>
            <span className="flex">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={cn('h-3.5 w-3.5', i <= Math.floor(r) ? 'fill-amber-400 text-amber-400' : i - 0.5 === r ? 'fill-amber-200 text-amber-400' : 'fill-slate-200 text-slate-200')} />)}</span>{r} & up
          </button>
        ))}
      </Facet>
      <Facet title="Availability"><Checkbox className="py-1" checked={f.inStock} onChange={(v) => setF((x) => ({ ...x, inStock: v }))} label="In stock only" /></Facet>
      <Facet title="Discount">
        {[10, 20, 30, 40].map((d) => <button key={d} type="button" aria-pressed={f.discount === d} onClick={() => setF((x) => ({ ...x, discount: x.discount === d ? 0 : d }))} className={cn('mb-1 mr-1 rounded-full border px-3 py-1 text-xs font-semibold', f.discount === d ? 'border-brand-600 bg-brand-600 text-white' : 'border-line hover:border-slate-300')}>{d}% or more</button>)}
      </Facet>
      <Facet title="Delivery"><Checkbox className="py-1" checked={f.freeDelivery} onChange={(v) => setF((x) => ({ ...x, freeDelivery: v }))} label="Free Delivery" /></Facet>
      <Facet title="Seller">{facets.sellers.slice(0, 8).map(([v, n]) => <Checkbox key={v} className="w-full py-1" checked={f.sellers.includes(v)} onChange={() => toggle('sellers', v)} label={<FacetLabel label={sellers[v]?.name ?? v} n={n} />} />)}</Facet>
      {facets.colors.length > 0 && <Facet title="Color" closed>{facets.colors.slice(0, 10).map(([v, n]) => <Checkbox key={v} className="w-full py-1" checked={f.colors.includes(v)} onChange={() => toggle('colors', v)} label={<FacetLabel label={v} n={n} />} />)}</Facet>}
      {facets.sizes.length > 0 && <Facet title="Size" closed><div className="flex flex-wrap gap-1.5">{facets.sizes.map(([v]) => <button key={v} type="button" aria-pressed={f.sizes.includes(v)} onClick={() => toggle('sizes', v)} className={cn('min-w-10 rounded-md border px-2 py-1 text-xs font-semibold', f.sizes.includes(v) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line')}>{v}</button>)}</div></Facet>}
    </div>
  );

  const noResults = !loading && scope.length === 0 && q;
  return (
    <div className="container-x py-5 sm:py-6">
      <Breadcrumb items={[...(category ? [{ label: 'Shop', to: '/shop' }, { label: category.name }] : q ? [{ label: 'Search' }, { label: q }] : [{ label: tag ? TAG_TITLE[tag] ?? 'Shop' : 'Shop' }])]} />

      {category && (
        <div className="mt-4 flex items-center gap-4 overflow-hidden rounded-2xl p-5 sm:p-6" style={{ background: `linear-gradient(120deg, ${category.color}18, ${category.color}05)` }}>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white shadow-sm" style={{ color: category.color }}><DynamicIcon name={category.icon} className="h-7 w-7" /></span>
          <div className="min-w-0"><h1 className="text-2xl font-extrabold sm:text-3xl">{category.name}</h1><p className="text-sm text-ink-soft">{category.description}</p></div>
        </div>
      )}
      {category && (
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {category.subcategories.map((s) => <button key={s.slug} type="button" onClick={() => toggle('subs', s.name)} aria-pressed={f.subs.includes(s.name)} className={cn('shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium', f.subs.includes(s.name) ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white hover:border-slate-300')}>{s.name}</button>)}
        </div>
      )}

      {noResults ? (
        <div className="mt-6 rounded-2xl border border-line bg-white">
          <EmptyState icon={<SearchX className="h-7 w-7" />} title="No products found." message={`We couldn't find anything for “${q}”. Check the spelling or try a broader term.`}
            action={<div className="max-w-md"><p className="mb-3 text-sm font-semibold">Try a related search</p><div className="flex flex-wrap justify-center gap-2">{TRENDING.map((t) => <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-brand-50 hover:text-brand-700">{t}</Link>)}</div><div className="mt-5"><LinkButton to="/shop" variant="outline">Browse all products</LinkButton></div></div>} />
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-[132px] max-h-[calc(100vh-150px)] overflow-y-auto rounded-xl border border-line bg-white p-4">
              <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold">Filters</h2>{active.length > 0 && <button type="button" onClick={() => setF(EMPTY)} className="text-xs font-semibold text-brand-600 hover:underline">Clear all</button>}</div>
              {panel}
            </div>
          </aside>
          <section aria-label="Products" className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                {!category && <h1 className="truncate text-xl font-extrabold sm:text-2xl">{title}</h1>}
                <p className="text-sm text-ink-soft" aria-live="polite">{loading ? 'Loading products…' : <><b className="text-ink">{results.length.toLocaleString()}</b> {results.length === 1 ? 'result' : 'results'}{q && <> for “{q}”</>}</>}</p>
              </div>
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}><SlidersHorizontal className="h-4 w-4" />Filters{active.length > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{active.length}</span>}</Button>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="hidden text-sm text-ink-soft sm:block">Sort by</label>
                <Select id="sort" value={sort} onChange={(e) => { const p = new URLSearchParams(params); p.set('sort', e.target.value); setParams(p, { replace: true }); }} className="h-9 w-44">
                  {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </div>
              <div className="hidden rounded-lg border border-line bg-white p-0.5 sm:flex" role="group" aria-label="View">
                <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={cn('grid h-8 w-8 place-items-center rounded-md', view === 'grid' ? 'bg-brand-50 text-brand-700' : 'text-ink-soft')} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></button>
                <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} className={cn('grid h-8 w-8 place-items-center rounded-md', view === 'list' ? 'bg-brand-50 text-brand-700' : 'text-ink-soft')} aria-label="List view"><List className="h-4 w-4" /></button>
              </div>
            </div>
            {q && !loading && (
              <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto text-sm">
                <span className="shrink-0 text-ink-soft">Related:</span>
                {[...new Set(scope.flatMap((p) => [p.subcategory, p.brand]))].slice(0, 6).map((s) => <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="shrink-0 rounded-full bg-white px-3 py-1 ring-1 ring-line hover:ring-brand-300">{s}</Link>)}
              </div>
            )}
            {active.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {active.map((a) => <button key={a.label} type="button" onClick={a.clear} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-2 text-xs font-semibold text-brand-700 hover:bg-brand-100" aria-label={`Remove filter ${a.label}`}>{a.label}<X className="h-3.5 w-3.5" /></button>)}
                <button type="button" onClick={() => setF(EMPTY)} className="text-xs font-semibold text-ink-soft hover:text-ink">Clear all</button>
              </div>
            )}
            <div className="mt-4">
              <ProductGrid products={shown} loading={loading} variant={view === 'list' ? 'list' : 'default'} skeletons={view === 'list' ? 4 : 12}
                empty={<div className="rounded-2xl border border-line bg-white"><EmptyState icon={<PackageSearch className="h-7 w-7" />} title="No products match these filters" message="Try removing a filter or widening the price range." action={<Button variant="outline" onClick={() => setF(EMPTY)}>Clear filters</Button>} /></div>} />
            </div>
            {pages > 1 && !loading && <div className="mt-8 flex justify-center"><Pagination page={page} pages={pages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></div>}
          </section>
        </div>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} side="bottom" title="Filters" footer={<div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setF(EMPTY)}>Clear all</Button><Button className="flex-1" onClick={() => setDrawer(false)}>Show {results.length} results</Button></div>}>
        <div className="p-4">{panel}</div>
      </Drawer>
    </div>
  );
}

function Facet({ title, children, closed }: { title: string; children: ReactNode; closed?: boolean }) {
  const [open, setOpen] = useState(!closed);
  return (
    <div className="border-b border-line py-3 last:border-0">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between text-left text-[13px] font-bold text-ink">{title}<ChevronDown className={cn('h-4 w-4 text-ink-soft transition', open && 'rotate-180')} /></button>
      {open && <div className="mt-2 max-h-60 overflow-y-auto pr-1">{children}</div>}
    </div>
  );
}
const FacetLabel = ({ label, n }: { label: string; n: number }) => <span className="flex flex-1 justify-between gap-2"><span className="truncate">{label}</span><span className="text-xs text-ink-soft">{n}</span></span>;
