import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Flame, Sparkles, Trophy, Store as StoreIcon, ShieldCheck, Lock, Truck, RotateCcw, Headset, BadgeCheck, Smartphone, Star, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useMarket } from '@/store/useMarket';
import { useUI } from '@/store/useUI';
import { useLiveProducts, useSellerMap, useProductMap } from '@/hooks/useCatalog';
import { useCountdown } from '@/hooks/useCountdown';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SmartImage } from '@/components/common/SmartImage';
import { ProductGrid, ProductRail } from '@/components/product/ProductGrid';
import { CategoryCard, QuickCategory, SellerCard } from '@/components/customer/Cards';
import { SectionHeader, Tabs } from '@/components/ui/Display';
import { LinkButton } from '@/components/ui/Button';
import { StoreBadges } from '@/components/customer/StoreBadges';
import { formatPKR, discountPct } from '@/utils/format';
import type { Banner, Product } from '@/types';

const THEMES: Record<Banner['theme'], string> = {
  indigo: 'from-[#1E1B4B] via-[#312E81] to-[#4338CA]',
  violet: 'from-[#312E81] via-[#5B21B6] to-[#7C3AED]',
  teal: 'from-[#134E4A] via-[#0E7490] to-[#0891B2]',
  amber: 'from-[#78350F] via-[#B45309] to-[#D97706]',
};

export default function Home() {
  usePageMeta('', 'Shop electronics, fashion, grocery and more from verified Pakistani sellers. Cash on delivery, JazzCash & Easypaisa.');
  const loading = useSimulatedLoad('home', 550);
  const products = useLiveProducts();
  const categories = useMarket((s) => s.categories).filter((c) => c.enabled).sort((a, b) => a.order - b.order);
  const sellers = useMarket((s) => s.sellers);
  const banners = useMarket((s) => s.banners).filter((b) => b.active);

  const by = (tag: Product['tags'][number]) => products.filter((p) => p.tags.includes(tag));
  const sellerStats = useMemo(() => {
    const m: Record<string, { sold: number; products: number }> = {};
    products.forEach((p) => { m[p.sellerId] = m[p.sellerId] ?? { sold: 0, products: 0 }; m[p.sellerId].sold += p.sold; m[p.sellerId].products += 1; });
    return m;
  }, [products]);
  const topSellers = sellers.filter((s) => s.status === 'approved').sort((a, b) => (sellerStats[b.id]?.sold ?? 0) - (sellerStats[a.id]?.sold ?? 0)).slice(0, 6);
  const categoryCounts = useMemo(() => products.reduce<Record<string, number>>((m, p) => ((m[p.category] = (m[p.category] ?? 0) + 1), m), {}), [products]);

  return (
    <div className="space-y-10 pb-6 sm:space-y-14">
      <Hero banners={banners.filter((b) => b.placement === 'hero')} products={by('trending')} />

      {/* Quick categories */}
      <section className="container-x" aria-labelledby="qc">
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between"><h2 id="qc" className="text-lg font-extrabold">Shop by Category</h2><Link to="/shop" className="text-sm font-semibold text-brand-600 hover:underline">View All</Link></div>
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 sm:grid sm:grid-cols-6 sm:gap-y-6 lg:grid-cols-12">
            {categories.slice(0, 12).map((c) => <QuickCategory key={c.slug} category={c} />)}
          </div>
        </div>
      </section>

      <FlashSale products={by('flash')} loading={loading} />

      <section className="container-x" aria-labelledby="sbc">
        <SectionHeader title={<span id="sbc">Explore Categories</span>} subtitle="Hand-picked collections from Pakistan's favourite sellers" action={<Link to="/shop" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:underline sm:flex">All categories<ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {['electronics', 'fashion', 'beauty', 'home-living', 'grocery', 'sports-fitness', 'automotive', 'toys-kids'].map((slug) => {
            const c = categories.find((x) => x.slug === slug);
            return c ? <CategoryCard key={slug} category={c} count={categoryCounts[slug]} /> : null;
          })}
        </div>
      </section>

      <section className="container-x" aria-labelledby="trend">
        <SectionHeader title={<span id="trend">Trending Now</span>} icon={<Flame className="h-6 w-6 text-red-500" />} subtitle="What Pakistan is shopping this week" action={<Link to="/shop?tag=trending" className="text-sm font-semibold text-brand-600 hover:underline">View All</Link>} />
        <ProductGrid products={by('trending').slice(0, 10)} loading={loading} cols="five" skeletons={10} />
      </section>

      <PromoBanners banners={banners.filter((b) => b.placement === 'promo')} />

      <section className="container-x" aria-labelledby="best">
        <SectionHeader title={<span id="best">Best Sellers</span>} icon={<Trophy className="h-6 w-6 text-amber-500" />} subtitle="Top-rated by thousands of verified buyers" action={<Link to="/shop?tag=bestseller" className="text-sm font-semibold text-brand-600 hover:underline">View All</Link>} />
        <ProductRail products={by('bestseller').slice(0, 12)} highlightTag="bestseller" loading={loading} />
      </section>

      <section className="container-x" aria-labelledby="new">
        <SectionHeader title={<span id="new">New Arrivals</span>} icon={<Sparkles className="h-6 w-6 text-accent-500" />} subtitle="Fresh drops from our sellers" action={<Link to="/shop?tag=new" className="text-sm font-semibold text-brand-600 hover:underline">View All</Link>} />
        <ProductGrid products={[...by('new')].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10)} loading={loading} cols="five" highlightTag="new" skeletons={5} />
      </section>

      <section className="container-x" aria-labelledby="sellers">
        <SectionHeader title={<span id="sellers">Top Sellers</span>} icon={<StoreIcon className="h-6 w-6 text-brand-600" />} subtitle="Verified stores with outstanding ratings" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {topSellers.map((s) => <SellerCard key={s.id} seller={s} sold={sellerStats[s.id]?.sold ?? 0} products={sellerStats[s.id]?.products ?? 0} />)}
        </div>
      </section>

      <Recommended loading={loading} />

      <FeaturedBrands products={products} />

      <AppPromo />

      <WhyBazar />
    </div>
  );
}

function Hero({ banners, products }: { banners: Banner[]; products: Product[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;
  useEffect(() => { if (paused || n < 2) return; const t = setInterval(() => setI((x) => (x + 1) % n), 6000); return () => clearInterval(t); }, [paused, n]);
  const b = banners[i % Math.max(1, n)];
  const sellers = useSellerMap();
  if (!b) return null;
  const picks = products.slice(i * 3, i * 3 + 3).length === 3 ? products.slice(i * 3, i * 3 + 3) : products.slice(0, 3);
  return (
    <section className="container-x pt-4 sm:pt-6" aria-roledescription="carousel" aria-label="Featured promotions" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br text-white transition-colors duration-700', THEMES[b.theme])}>
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-accent-500/20 blur-2xl" />
          <div className="relative grid min-h-[300px] items-center gap-6 p-6 sm:min-h-[340px] sm:p-10 md:grid-cols-[1.1fr_1fr]">
            <div key={b.id} className="animate-fade-in" aria-live="polite">
              {b.eyebrow && <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur"><Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />{b.eyebrow}</span>}
              <h1 className="mt-4 text-[28px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-[44px]">{b.title}</h1>
              <p className="mt-3 max-w-md text-sm text-white/80 sm:text-base">{b.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton to={b.link} size="lg" variant="accent" className="font-bold">{b.cta}<ArrowRight className="h-4 w-4" /></LinkButton>
                <LinkButton to="/shop" size="lg" variant="ghost" className="text-white hover:bg-white/10">Browse all</LinkButton>
              </div>
            </div>
            <div key={`v-${b.id}`} className="relative hidden h-[260px] animate-fade-in md:block">
              {picks.map((p, k) => (
                <Link key={p.id} to={`/product/${p.id}`} className={cn('absolute w-[46%] rounded-2xl bg-white p-2 text-ink shadow-pop transition hover:-translate-y-1',
                  k === 0 && 'left-0 top-6 rotate-[-4deg]', k === 1 && 'left-[30%] top-0 z-10', k === 2 && 'right-0 top-10 rotate-[5deg]')}>
                  <SmartImage src={p.images[0]} alt={p.title} icon={p.icon} tint={sellers[p.sellerId]?.color} className="aspect-square rounded-xl" eager />
                  <p className="mt-1.5 truncate px-1 text-[11px] font-semibold">{p.title}</p>
                  <p className="flex items-center justify-between px-1 pb-0.5"><span className="text-sm font-extrabold">{formatPKR(p.price)}</span><span className="rounded bg-red-500 px-1 text-[10px] font-bold text-white">-{discountPct(p.price, p.originalPrice)}%</span></p>
                </Link>
              ))}
            </div>
          </div>
          <div className="absolute bottom-4 left-6 flex items-center gap-2 sm:left-10">
            {banners.map((x, k) => <button key={x.id} type="button" onClick={() => setI(k)} aria-label={`Show slide ${k + 1}: ${x.title}`} aria-current={k === i} className={cn('h-1.5 rounded-full transition-all', k === i ? 'w-7 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70')} />)}
          </div>
          <div className="absolute bottom-3 right-4 hidden gap-2 sm:flex">
            <button type="button" onClick={() => setI((x) => (x - 1 + n) % n)} className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25" aria-label="Previous slide"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => setI((x) => (x + 1) % n)} className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25" aria-label="Next slide"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="hidden grid-rows-2 gap-4 lg:grid">
          <Link to="/page/download-app" className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-line transition hover:shadow-lift">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">New user offer</p>
              <p className="mt-1 text-lg font-extrabold leading-snug">Rs. 500 off your first order</p>
              <p className="mt-1 text-xs text-ink-soft">Use code <b className="rounded bg-violet-50 px-1.5 py-0.5 font-mono text-violet-700">WELCOME500</b></p>
            </div>
            <span className="text-sm font-semibold text-brand-600">Claim now →</span>
          </Link>
          <Link to="/shop?delivery=free" className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-accent-50 p-5 ring-1 ring-accent-100 transition hover:shadow-lift">
            <Truck className="absolute -right-3 -top-2 h-24 w-24 text-accent-500/15" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent-700">Delivered by B-Bazar</p>
              <p className="mt-1 text-lg font-extrabold leading-snug">Free delivery over Rs. 2,999</p>
              <p className="mt-1 text-xs text-ink-soft">Karachi 1–2 days · Lahore & Islamabad 2–4 days</p>
            </div>
            <span className="text-sm font-semibold text-accent-700">Shop eligible items →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FlashSale({ products, loading }: { products: Product[]; loading: boolean }) {
  const end = useMemo(() => { const d = new Date(); d.setHours(23, 59, 59, 0); return d.getTime() + 2 * 864e5; }, []);
  const t = useCountdown(end);
  const [tab, setTab] = useState<'all' | 'electronics' | 'fashion' | 'home'>('all');
  const filtered = products.filter((p) => tab === 'all' || (tab === 'electronics' ? ['electronics', 'mobiles-tablets', 'computers-laptops', 'appliances'].includes(p.category) : tab === 'fashion' ? ['fashion', 'beauty', 'jewelry-accessories'].includes(p.category) : ['home-living', 'grocery'].includes(p.category)));
  const pad = (x: number) => String(x).padStart(2, '0');
  return (
    <section className="container-x" aria-labelledby="flash">
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line bg-gradient-to-r from-red-50 via-amber-50 to-white px-4 py-4 sm:px-6">
          <h2 id="flash" className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl"><span className="grid h-8 w-8 place-items-center rounded-lg bg-red-500 text-white"><Zap className="h-5 w-5 fill-white" /></span>Flash Sale</h2>
          <div className="flex items-center gap-2" role="timer" aria-label={`Ends in ${t.d} days ${t.h} hours ${t.m} minutes`}>
            <span className="hidden text-xs font-semibold text-ink-soft sm:inline">Ending in</span>
            {[t.d, t.h, t.m, t.s].map((v, k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="grid h-8 min-w-[34px] place-items-center rounded-md bg-ink px-1 font-mono text-sm font-bold tabular-nums text-white">{pad(v)}</span>
                {k < 3 && <span className="font-bold text-ink">:</span>}
              </span>
            ))}
          </div>
          <Link to="/shop?tag=flash" className="ml-auto text-sm font-semibold text-red-600 hover:underline">Shop all deals</Link>
        </div>
        <div className="px-4 pt-3 sm:px-6">
          <Tabs variant="pill" size="sm" value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All' }, { value: 'electronics', label: 'Electronics' }, { value: 'fashion', label: 'Fashion' }, { value: 'home', label: 'Home' }]} />
        </div>
        <div className="p-4 sm:p-6">
          <ProductRail products={filtered.slice(0, 12)} variant="flash" loading={loading} />
        </div>
      </div>
    </section>
  );
}

function PromoBanners({ banners }: { banners: Banner[] }) {
  return (
    <section className="container-x" aria-label="Promotions">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {banners.map((b) => (
          <Link key={b.id} to={b.link} className={cn('group relative flex min-h-[150px] overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white', THEMES[b.theme])}>
            <SmartImage src={b.image} alt="" icon="Sparkles" tint="#ffffff" className="absolute inset-y-0 right-0 w-1/2 opacity-30 mix-blend-luminosity transition group-hover:opacity-40 [mask-image:linear-gradient(to_left,black,transparent)]" />
            <div className="relative flex flex-col">
              <p className="text-xl font-extrabold">{b.title}</p>
              <p className="mt-1 max-w-[70%] text-sm text-white/80">{b.subtitle}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold">{b.cta}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Recommended({ loading }: { loading: boolean }) {
  const viewed = useUI((s) => s.viewed);
  const map = useProductMap();
  const products = useLiveProducts();
  const anchor = viewed.map((id) => map[id]).find(Boolean);
  const similar = anchor ? products.filter((p) => p.category === anchor.category && p.id !== anchor.id).slice(0, 6) : [];
  const viewedCats = new Set(viewed.map((id) => map[id]?.category).filter(Boolean));
  const recommended = products.filter((p) => viewedCats.has(p.category) || p.tags.includes('top')).filter((p) => !similar.includes(p) && p.id !== anchor?.id).sort((a, b) => b.rating - a.rating).slice(0, 10);
  return (
    <section className="container-x space-y-8" aria-labelledby="picked">
      <div className="rounded-2xl bg-brand-gradient-soft p-4 sm:p-6">
        <SectionHeader title={<span id="picked">Picked for You</span>} icon={<Star className="h-6 w-6 fill-violet-500 text-violet-500" />} subtitle="Personalised from your browsing on B-Bazar" />
        {anchor && similar.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"><Eye className="h-4 w-4 text-brand-600" />Because you viewed <Link to={`/product/${anchor.id}`} className="text-brand-700 hover:underline">{anchor.title}</Link></p>
            <ProductRail products={similar} variant="compact" loading={loading} />
          </div>
        )}
        <p className="mb-3 text-sm font-semibold text-ink">Recommended for you</p>
        <ProductGrid products={recommended} loading={loading} cols="five" skeletons={5} />
      </div>
    </section>
  );
}

function FeaturedBrands({ products }: { products: Product[] }) {
  const brands = useMemo(() => {
    const m = new Map<string, { count: number; category: string }>();
    products.forEach((p) => m.set(p.brand, { count: (m.get(p.brand)?.count ?? 0) + 1, category: p.category }));
    return [...m.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 12);
  }, [products]);
  const palette = ['#312E81', '#7C3AED', '#0891B2', '#059669', '#DB2777', '#B45309'];
  return (
    <section className="container-x" aria-labelledby="brands">
      <SectionHeader title={<span id="brands">Featured Brands</span>} subtitle="Official and authorised brand partners" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {brands.map(([name, info], k) => (
          <Link key={name} to={`/search?q=${encodeURIComponent(name)}`} className="group flex h-20 flex-col items-center justify-center rounded-xl border border-line bg-white px-2 transition hover:border-brand-200 hover:shadow-lift">
            <span className="text-[15px] font-extrabold tracking-tight sm:text-base" style={{ color: palette[k % palette.length] }}>{name}</span>
            <span className="text-[11px] text-ink-soft">{info.count} products</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AppPromo() {
  return (
    <section className="container-x" aria-labelledby="app">
      <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-10 text-white sm:px-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-accent-500/25 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"><Smartphone className="h-3.5 w-3.5" />B-Bazar App</p>
            <h2 id="app" className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Take B-Bazar Everywhere</h2>
            <p className="mt-3 max-w-md text-white/75">Shop faster, track orders and discover exclusive deals from your phone.</p>
            <ul className="mt-5 grid max-w-md grid-cols-2 gap-2 text-sm text-white/85">
              {['App-only flash deals', 'Live order tracking', 'One-tap JazzCash checkout', 'Price-drop alerts'].map((x) => <li key={x} className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-accent-100" />{x}</li>)}
            </ul>
            <div className="mt-6"><StoreBadges dark /></div>
          </div>
          <div className="relative mx-auto hidden h-[300px] w-[170px] md:block" aria-hidden="true">
            <div className="absolute inset-0 rotate-[-6deg] rounded-[32px] border-[6px] border-white/90 bg-canvas shadow-pop">
              <div className="h-full overflow-hidden rounded-[26px] bg-white p-2.5 text-ink">
                <div className="mb-2 h-16 rounded-xl bg-brand-gradient" />
                <div className="grid grid-cols-2 gap-1.5">{['#4338CA', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#DB2777'].map((c) => <div key={c} className="h-14 rounded-lg" style={{ background: `${c}22` }} />)}</div>
                <div className="mt-2 h-6 rounded-md bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyBazar() {
  const items = [
    [BadgeCheck, 'Verified Sellers', 'Every store passes KYC and quality checks before going live.'],
    [Lock, 'Secure Payments', 'COD, cards, JazzCash and Easypaisa with buyer protection.'],
    [Truck, 'Fast Delivery', '1–2 days in Karachi, 2–4 days in Lahore & Islamabad.'],
    [RotateCcw, 'Easy Returns', '7-day hassle-free returns with free pickup on most items.'],
    [Headset, '24/7 Support', 'Real people on chat, email and phone — day or night.'],
    [ShieldCheck, 'Authentic Products', '100% genuine or your money back, guaranteed.'],
  ] as const;
  return (
    <section className="container-x" aria-labelledby="why">
      <SectionHeader title={<span id="why">Why Shop on B-Bazar?</span>} subtitle="Shopping you can trust, from discovery to doorstep" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {items.map(([Icon, t, d]) => (
          <div key={t} className="flex gap-4 rounded-xl border border-line bg-white p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></span>
            <div><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-ink-soft">{d}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
