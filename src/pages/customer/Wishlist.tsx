import { Heart, ShoppingCart, Trash2, GitCompare, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useWishlist } from '@/store/useWishlist';
import { useUI } from '@/store/useUI';
import { useProductMap, useSellerMap, useLiveProducts } from '@/hooks/useCatalog';
import { useShopActions } from '@/hooks/useShopActions';
import { usePageMeta } from '@/hooks/usePageMeta';
import { EmptyState, PriceDisplay, Rating, SectionHeader, Breadcrumb } from '@/components/ui/Display';
import { Button, LinkButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Overlay';
import { SmartImage } from '@/components/common/SmartImage';
import { ProductRail } from '@/components/product/ProductGrid';
import { formatPKR, discountPct } from '@/utils/format';
import { cn } from '@/utils/cn';
import { useState } from 'react';

export default function Wishlist() {
  usePageMeta('Wishlist');
  const { ids, remove } = useWishlist();
  const { compare, toggleCompare } = useUI();
  const map = useProductMap();
  const sellers = useSellerMap();
  const live = useLiveProducts();
  const { addToCart } = useShopActions();
  const [showCompare, setShowCompare] = useState(false);
  const items = ids.map((id) => map[id]).filter(Boolean);
  const cmp = compare.map((id) => map[id]).filter(Boolean);

  return (
    <div className="container-x py-5 sm:py-6">
      <Breadcrumb items={[{ label: 'Wishlist' }]} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">My Wishlist <span className="text-base font-semibold text-ink-soft">({items.length})</span></h1>
        {cmp.length > 0 && <Button variant="secondary" onClick={() => setShowCompare(true)}><GitCompare className="h-4 w-4" />Compare ({cmp.length})</Button>}
      </div>
      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-line bg-white"><EmptyState icon={<Heart className="h-7 w-7" />} title="Your wishlist is empty" message="Tap the heart on any product to save it here for later." action={<LinkButton to="/shop">Explore products</LinkButton>} /></div>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="flex gap-3 rounded-xl border border-line bg-white p-3">
              <Link to={`/product/${p.id}`} className="shrink-0"><SmartImage src={p.images[0]} alt={p.title} icon={p.icon} tint={sellers[p.sellerId]?.color} className="h-28 w-28 rounded-lg" /></Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link to={`/product/${p.id}`} className="line-clamp-2 text-sm font-semibold hover:text-brand-700">{p.title}</Link>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">{sellers[p.sellerId]?.name}<BadgeCheck className="h-3.5 w-3.5 fill-brand-600 text-white" /></p>
                <div className="mt-1"><Rating value={p.rating} count={p.reviewCount} size="xs" /></div>
                <PriceDisplay price={p.price} original={p.originalPrice} size="sm" className="mt-1" />
                {p.stock <= 0 && <p className="text-xs font-semibold text-red-600">Out of stock</p>}
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  <Button size="xs" onClick={() => addToCart(p)} disabled={p.stock <= 0}><ShoppingCart className="h-3.5 w-3.5" />Add to Cart</Button>
                  <Button size="xs" variant={compare.includes(p.id) ? 'secondary' : 'outline'} onClick={() => toggleCompare(p.id)} aria-pressed={compare.includes(p.id)}><GitCompare className="h-3.5 w-3.5" />Compare</Button>
                  <Button size="xs" variant="ghost" className="text-red-600" onClick={() => { remove(p.id); toast('Removed from wishlist.'); }}><Trash2 className="h-3.5 w-3.5" />Remove</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <section className="mt-10"><SectionHeader title="You might also like" /><ProductRail products={live.filter((p) => !ids.includes(p.id) && p.tags.includes('top')).slice(0, 12)} /></section>
      <Modal open={showCompare} onClose={() => setShowCompare(false)} title="Compare products" size="xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <tbody>
              <tr><th className="w-32" />{cmp.map((p) => <td key={p.id} className="p-2 align-top"><SmartImage src={p.images[0]} alt={p.title} icon={p.icon} className="aspect-square rounded-lg" /><p className="mt-2 line-clamp-2 font-semibold">{p.title}</p></td>)}</tr>
              {([['Price', (p) => formatPKR(p.price)], ['Discount', (p) => `${discountPct(p.price, p.originalPrice)}%`], ['Rating', (p) => `${p.rating} ★ (${p.reviewCount})`], ['Brand', (p) => p.brand], ['Seller', (p) => sellers[p.sellerId]?.name], ['Warranty', (p) => p.warranty], ['Delivery', (p) => (p.freeDelivery ? 'Free' : 'Rs. 199')], ['Stock', (p) => (p.stock ? 'In stock' : 'Out of stock')]] as [string, (p: typeof cmp[number]) => string | undefined][]).map(([k, fn], i) => (
                <tr key={k} className={cn(i % 2 === 0 && 'bg-slate-50')}><th className="p-2 text-left text-xs font-bold uppercase text-ink-soft">{k}</th>{cmp.map((p) => <td key={p.id} className="p-2">{fn(p)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
