import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, Star, UserPlus, UserCheck, MessageSquare, MapPin, Calendar, Package, Store as StoreIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useLiveProducts } from '@/hooks/useCatalog';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Tabs, EmptyState, Rating, Skeleton } from '@/components/ui/Display';
import { Button, LinkButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { Avatar } from '@/components/ui/Avatar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { formatCompact, formatDate } from '@/utils/format';
import { useNavigate } from 'react-router-dom';

type Tab = 'home' | 'products' | 'categories' | 'reviews' | 'about';

export default function StorePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const seller = useMarket((s) => s.sellers.find((x) => x.slug === id || x.id === id));
  const reviews = useMarket((s) => s.reviews);
  const all = useLiveProducts();
  const loading = useSimulatedLoad(id, 400);
  const [tab, setTab] = useState<Tab>('home');
  const [following, setFollowing] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  usePageMeta(seller?.name ?? 'Store', seller?.description);
  const products = useMemo(() => all.filter((p) => p.sellerId === seller?.id), [all, seller]);
  const sold = products.reduce((n, p) => n + p.sold, 0);
  const storeReviews = reviews.filter((r) => r.sellerId === seller?.id && r.status === 'published');

  if (loading) return <div className="container-x py-6"><Skeleton className="h-48 rounded-2xl" /><div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div></div>;
  if (!seller || seller.status !== 'approved') {
    return <div className="container-x py-10"><div className="rounded-2xl border border-line bg-white"><EmptyState icon={<StoreIcon className="h-7 w-7" />} title="Seller unavailable" message="This store is not accepting orders right now. Browse thousands of products from other verified sellers." action={<LinkButton to="/shop">Continue shopping</LinkButton>} /></div></div>;
  }
  const storeCats = [...new Set(products.map((p) => p.subcategory))];
  const filtered = products.filter((p) => (!q || p.title.toLowerCase().includes(q.toLowerCase())) && (!cat || p.subcategory === cat));

  return (
    <div className="container-x py-5 sm:py-6">
      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="relative h-32 sm:h-44" style={{ background: `linear-gradient(120deg, ${seller.color}, ${seller.color}aa 45%, #7C3AED)` }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          <p className="absolute bottom-4 right-5 hidden text-right text-sm font-semibold text-white/90 sm:block">{seller.tagline}</p>
        </div>
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:px-6">
          <Avatar name={seller.name} color={seller.color} size="xl" square className="-mt-10 ring-4 ring-white" />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold">{seller.name}{seller.verified && <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700"><BadgeCheck className="h-3.5 w-3.5" />Verified Seller</span>}{seller.official && <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-white">Official</span>}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
              <span className="flex items-center gap-1 font-semibold text-ink"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{seller.rating} ★</span>
              <span><b className="text-ink">{seller.positive}%</b> positive rating</span>
              <span><b className="text-ink">{formatCompact(sold)}</b> products sold</span>
              <span><b className="text-ink">{formatCompact(seller.followers + (following ? 1 : 0))}</b> followers</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant={following ? 'secondary' : 'primary'} onClick={() => { setFollowing((v) => !v); toast.success(following ? `Unfollowed ${seller.name}` : `You're now following ${seller.name}`); }}>{following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{following ? 'Following' : 'Follow'}</Button>
            <Button variant="outline" onClick={() => nav('/account/messages')}><MessageSquare className="h-4 w-4" />Chat</Button>
          </div>
        </div>
        <Tabs className="px-3 sm:px-5" value={tab} onChange={setTab} tabs={[{ value: 'home', label: 'Home' }, { value: 'products', label: 'Products', count: products.length }, { value: 'categories', label: 'Categories' }, { value: 'reviews', label: 'Reviews', count: storeReviews.length }, { value: 'about', label: 'About' }]} />
      </section>

      <div className="mt-6">
        {tab === 'home' && (
          <div className="space-y-8">
            <div className="grid gap-3 sm:grid-cols-3">
              {[['Free delivery', 'On orders above Rs. 2,999'], ['Ships in 24h', `Dispatched from ${seller.city}`], ['Store coupon', seller.id === 'S1001' ? 'TECHZONE5 · 5% off' : 'BAZAR10 · 10% off']].map(([t, s]) => (
                <div key={t} className="rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-4"><p className="font-bold text-brand-800">{t}</p><p className="text-sm text-ink-soft">{s}</p></div>
              ))}
            </div>
            <div><h2 className="mb-4 text-lg font-extrabold">Top picks from {seller.name}</h2><ProductGrid products={[...products].sort((a, b) => b.sold - a.sold).slice(0, 8)} /></div>
          </div>
        )}
        {tab === 'products' && (
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="w-full sm:w-72"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search in ${seller.name}`} icon={<Search className="h-4 w-4" />} aria-label="Search store" /></div>
              {cat && <Button variant="secondary" size="sm" onClick={() => setCat('')}>{cat} ✕</Button>}
            </div>
            <ProductGrid products={filtered} empty={<EmptyState icon={<Package className="h-7 w-7" />} title="No products found" message="Try a different search." />} />
          </div>
        )}
        {tab === 'categories' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {storeCats.map((c) => <button key={c} type="button" onClick={() => { setCat(c); setTab('products'); }} className="rounded-xl border border-line bg-white p-5 text-left transition hover:shadow-lift"><p className="font-bold">{c}</p><p className="text-sm text-ink-soft">{products.filter((p) => p.subcategory === c).length} products</p></button>)}
          </div>
        )}
        {tab === 'reviews' && (
          <div className="rounded-2xl border border-line bg-white p-5">
            {storeReviews.length === 0 ? <EmptyState icon={<Star className="h-7 w-7" />} title="No reviews yet" /> : (
              <ul className="divide-y divide-line">{storeReviews.map((r) => (
                <li key={r.id} className="py-4"><div className="flex items-center gap-2"><Avatar name={r.customerName} size="xs" /><span className="text-sm font-semibold">{r.customerName}</span><Rating value={r.rating} showValue={false} size="xs" /><span className="text-xs text-ink-soft">{formatDate(r.date)}</span></div><p className="mt-1.5 text-sm font-semibold">{r.title}</p><p className="text-sm text-ink-soft">{r.body}</p><p className="mt-1 text-xs text-ink-soft">on {products.find((p) => p.id === r.productId)?.title}</p></li>
              ))}</ul>
            )}
          </div>
        )}
        {tab === 'about' && (
          <div className="grid gap-4 rounded-2xl border border-line bg-white p-6 md:grid-cols-[1fr_280px]">
            <div><h2 className="text-lg font-bold">About {seller.name}</h2><p className="mt-2 text-sm leading-relaxed text-ink-soft">{seller.description}</p></div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-600" />{seller.city}, Pakistan</li>
              <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-brand-600" />Selling since {formatDate(seller.joined)}</li>
              <li className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-brand-600" />{seller.responseRate}% chat response rate</li>
              <li className="flex items-center gap-2"><Package className="h-4 w-4 text-brand-600" />{products.length} active listings</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
