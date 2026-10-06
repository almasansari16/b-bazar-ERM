import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Heart, ShoppingCart, Tag, Truck, BadgeCheck, ShieldCheck, Store, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useMarket } from '@/store/useMarket';
import { useAuth } from '@/store/useAuth';
import { useCartDetails } from '@/hooks/useCartDetails';
import { useLiveProducts } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SmartImage } from '@/components/common/SmartImage';
import { Checkbox, Input } from '@/components/ui/Form';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState, SectionHeader, ProgressBar, Breadcrumb } from '@/components/ui/Display';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { ProductRail } from '@/components/product/ProductGrid';
import { formatPKR } from '@/utils/format';
import { validateCoupon } from '@/utils/pricing';
import { FREE_DELIVERY_THRESHOLD } from '@/utils/delivery';

export default function Cart() {
  usePageMeta('Shopping Cart');
  const { setQty, remove, toggle, toggleAll, applyCoupon } = useCart();
  const wishToggle = useWishlist((s) => s.toggle);
  const wishIds = useWishlist((s) => s.ids);
  const coupons = useMarket((s) => s.coupons);
  const user = useAuth((s) => s.user);
  const { lines, groups, coupon, totals } = useCartDetails();
  const live = useLiveProducts();
  const nav = useNavigate();
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);

  const allSelected = lines.length > 0 && lines.every((l) => l.selected);
  const inCart = new Set(lines.map((l) => l.productId));
  const cats = new Set(lines.map((l) => l.product.category));
  const fbt = live.filter((p) => cats.has(p.category) && !inCart.has(p.id)).sort((a, b) => b.sold - a.sold).slice(0, 10);
  const recommended = live.filter((p) => p.tags.includes('bestseller') && !inCart.has(p.id)).slice(0, 12);

  const apply = (c = code) => {
    const found = coupons.find((x) => x.code.toUpperCase() === c.trim().toUpperCase());
    const err = validateCoupon(found, totals.subtotal, lines.filter((l) => l.selected));
    if (err) { setCodeErr(err); return; }
    applyCoupon(found!.code); setCode(''); setCodeErr('');
    toast.success('Coupon applied successfully.', { description: found!.description });
  };

  if (lines.length === 0) {
    return (
      <div className="container-x py-8">
        <div className="rounded-2xl border border-line bg-white">
          <EmptyState icon={<ShoppingCart className="h-7 w-7" />} title="Your cart is empty" message="Looks like you haven't added anything yet. Explore today's deals and find something you'll love." action={<><LinkButton to="/">Start Shopping</LinkButton><LinkButton to="/wishlist" variant="outline">View Wishlist</LinkButton></>} />
        </div>
        <section className="mt-10"><SectionHeader title="Recommended for you" /><ProductRail products={recommended} /></section>
      </div>
    );
  }

  return (
    <div className="container-x py-5 pb-32 sm:py-6 lg:pb-6">
      <Breadcrumb items={[{ label: 'Cart' }]} />
      <h1 className="mt-3 text-2xl font-extrabold">Shopping Cart <span className="text-base font-semibold text-ink-soft">({lines.reduce((n, l) => n + l.qty, 0)} items)</span></h1>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-4">
          {totals.freeDeliveryGap > 0 && totals.subtotal > 0 ? (
            <div className="rounded-xl border border-accent-100 bg-accent-50 p-4">
              <p className="flex items-center gap-2 text-sm"><Truck className="h-4 w-4 text-accent-700" />Add <b>{formatPKR(totals.freeDeliveryGap)}</b> more for <b>Free Delivery</b></p>
              <ProgressBar value={(totals.subtotal / FREE_DELIVERY_THRESHOLD) * 100} className="mt-2 bg-white" />
            </div>
          ) : totals.subtotal > 0 && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><Truck className="h-4 w-4" />You've unlocked Free Delivery!</p>}

          <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
            <Checkbox checked={allSelected} onChange={toggleAll} label={<span className="font-semibold">Select all ({lines.length})</span>} />
            <button type="button" className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline disabled:opacity-40" disabled={!lines.some((l) => l.selected)} onClick={() => setConfirm('selected')}><Trash2 className="h-4 w-4" />Remove selected</button>
          </div>

          {groups.map((g) => (
            <section key={g[0].product.sellerId} className="overflow-hidden rounded-xl border border-line bg-white" aria-label={`Items from ${g[0].seller?.name}`}>
              <div className="flex items-center gap-2 border-b border-line bg-slate-50/60 px-4 py-2.5 text-sm">
                <Store className="h-4 w-4 text-brand-600" /><Link to={`/store/${g[0].seller?.slug}`} className="font-bold hover:text-brand-700">{g[0].seller?.name}</Link>
                {g[0].seller?.verified && <BadgeCheck className="h-4 w-4 fill-brand-600 text-white" aria-label="Verified seller" />}
              </div>
              <ul className="divide-y divide-line">
                {g.map((l) => {
                  const out = l.product.stock <= 0;
                  return (
                    <li key={l.key} className="flex gap-3 p-4">
                      <div className="pt-8"><Checkbox aria-label={`Select ${l.product.title}`} checked={l.selected} onChange={() => toggle(l.key)} /></div>
                      <Link to={`/product/${l.productId}`} className="shrink-0"><SmartImage src={l.product.images[0]} alt={l.product.title} icon={l.product.icon} tint={l.seller?.color} className="h-20 w-20 rounded-lg sm:h-24 sm:w-24" /></Link>
                      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start">
                        <div className="min-w-0 flex-1">
                          <Link to={`/product/${l.productId}`} className="line-clamp-2 text-sm font-semibold hover:text-brand-700">{l.product.title}</Link>
                          {l.variant && <p className="mt-0.5 text-xs text-ink-soft">Variant: {l.variant}</p>}
                          {out ? <p className="mt-1 text-xs font-semibold text-red-600">Out of stock — remove to continue</p> : l.product.stock <= 6 && <p className="mt-1 text-xs font-semibold text-amber-600">Only {l.product.stock} left</p>}
                          <div className="mt-2 flex gap-3 text-xs">
                            <button type="button" onClick={() => { const on = wishToggle(l.productId); toast.success(on ? 'Moved to wishlist.' : 'Removed from wishlist.'); }} className="flex items-center gap-1 font-semibold text-ink-soft hover:text-brand-700"><Heart className={wishIds.includes(l.productId) ? 'h-3.5 w-3.5 fill-red-500 text-red-500' : 'h-3.5 w-3.5'} />Wishlist</button>
                            <button type="button" onClick={() => { remove(l.key); toast('Removed from cart.', { description: l.product.title }); }} className="flex items-center gap-1 font-semibold text-ink-soft hover:text-red-600"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <div className="text-right"><p className="font-extrabold tabular-nums">{formatPKR(l.product.price * l.qty)}</p>{l.product.originalPrice > l.product.price && <p className="text-xs text-ink-soft line-through">{formatPKR(l.product.originalPrice * l.qty)}</p>}</div>
                          <div className="flex h-9 items-center rounded-lg border border-line">
                            <button type="button" onClick={() => setQty(l.key, l.qty - 1)} disabled={l.qty <= 1} className="grid h-full w-9 place-items-center hover:bg-muted disabled:opacity-40" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="w-8 text-center text-sm font-semibold tabular-nums">{l.qty}</span>
                            <button type="button" onClick={() => setQty(l.key, Math.min(l.product.stock, l.qty + 1))} disabled={l.qty >= Math.min(10, l.product.stock)} className="grid h-full w-9 place-items-center hover:bg-muted disabled:opacity-40" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-[140px]" aria-label="Order summary">
          <div className="rounded-xl border border-line bg-white p-5">
            <h2 className="text-lg font-extrabold">Order Summary</h2>
            <div className="mt-4">
              <label htmlFor="promo" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"><Tag className="h-4 w-4 text-brand-600" />Promo code</label>
              {coupon && !totals.couponError ? (
                <div className="flex items-center justify-between rounded-lg border border-dashed border-emerald-400 bg-emerald-50 px-3 py-2">
                  <span className="text-sm"><b className="font-mono text-emerald-700">{coupon.code}</b><span className="block text-xs text-ink-soft">{coupon.description}</span></span>
                  <button type="button" onClick={() => applyCoupon(null)} aria-label="Remove coupon" className="rounded p-1 hover:bg-white"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); apply(); }}>
                  <Input id="promo" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeErr(''); }} placeholder="e.g. BAZAR10" aria-invalid={!!codeErr} className="font-mono uppercase" />
                  <Button type="submit" variant="secondary" disabled={!code.trim()}>Apply</Button>
                </form>
              )}
              {(codeErr || (coupon && totals.couponError)) && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{codeErr || totals.couponError}</p>}
              {!coupon && <div className="mt-2 flex flex-wrap gap-1.5">{['BAZAR10', 'WELCOME500', 'FREESHIP'].map((c) => <button key={c} type="button" onClick={() => apply(c)} className="rounded-md border border-dashed border-brand-300 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-700 hover:bg-brand-50">{c}</button>)}</div>}
            </div>
            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <Row label={`Subtotal (${totals.items} items)`} value={formatPKR(totals.subtotal)} />
              <Row label="Delivery fee" value={totals.delivery === 0 ? <span className="font-semibold text-emerald-600">Free</span> : formatPKR(totals.delivery)} />
              {totals.discount > 0 && <Row label="Coupon discount" value={<span className="font-semibold text-emerald-600">−{formatPKR(totals.discount)}</span>} />}
              <div className="flex items-center justify-between border-t border-line pt-3"><dt className="font-bold">Total</dt><dd className="text-xl font-extrabold tabular-nums">{formatPKR(totals.total)}</dd></div>
              {totals.savings + totals.discount > 0 && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">You save {formatPKR(totals.savings + totals.discount)} on this order</p>}
            </dl>
            <Button size="lg" variant="gradient" className="mt-5 hidden w-full lg:inline-flex" disabled={totals.items === 0} onClick={() => nav(user ? '/checkout' : '/login?next=/checkout')}>Proceed to Checkout<ArrowRight className="h-4 w-4" /></Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-soft"><ShieldCheck className="h-3.5 w-3.5" />Secure checkout · Buyer Protection</p>
          </div>
        </aside>
      </div>

      {fbt.length > 0 && <section className="mt-10"><SectionHeader title="Frequently bought together" subtitle="Shoppers who bought items in your cart also added" /><ProductRail products={fbt} variant="compact" /></section>}
      <section className="mt-10"><SectionHeader title="Recommended products" /><ProductRail products={recommended} /></section>

      {/* Sticky mobile checkout */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1"><p className="text-xs text-ink-soft">Total ({totals.items} items)</p><p className="text-lg font-extrabold tabular-nums">{formatPKR(totals.total)}</p></div>
          <Button size="lg" variant="gradient" disabled={totals.items === 0} onClick={() => nav(user ? '/checkout' : '/login?next=/checkout')}>Checkout</Button>
        </div>
      </div>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} tone="danger" title="Remove selected items?" message="The selected items will be removed from your cart." confirmLabel="Remove"
        onConfirm={() => { lines.filter((l) => l.selected).forEach((l) => remove(l.key)); toast('Items removed from cart.'); }} />
    </div>
  );
}
const Row = ({ label, value }: { label: string; value: React.ReactNode }) => <div className="flex items-center justify-between"><dt className="text-ink-soft">{label}</dt><dd className="tabular-nums">{value}</dd></div>;
