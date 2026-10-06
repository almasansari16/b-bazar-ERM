import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Truck, ShoppingBag, FileText, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { usePageMeta } from '@/hooks/usePageMeta';
import { LinkButton } from '@/components/ui/Button';
import { SmartImage } from '@/components/common/SmartImage';
import { formatPKR } from '@/utils/format';
import { PAYMENT_NAME } from '@/components/customer/OrderTimeline';

export default function OrderSuccess() {
  usePageMeta('Order Confirmed');
  const [params] = useSearchParams();
  const order = useMarket((s) => s.orders.find((o) => o.id === params.get('id'))) ?? useMarket.getState().orders.find((o) => o.id === 'BBZ-20261005-1042')!;
  const copy = async () => { try { await navigator.clipboard.writeText(order.id); toast.success('Order number copied.'); } catch { toast.info(order.id); } };
  return (
    <div className="container-x py-8 sm:py-12">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
        <div className="relative bg-brand-gradient px-6 pb-10 pt-10 text-center text-white">
          <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, #fff 2px, transparent 2px), radial-gradient(circle at 80% 30%, #06B6D4 3px, transparent 3px), radial-gradient(circle at 60% 80%, #F59E0B 2px, transparent 2px)', backgroundSize: '90px 90px, 120px 120px, 70px 70px' }} />
          <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-white text-emerald-500 shadow-pop animate-pop"><CheckCircle2 className="h-12 w-12" strokeWidth={2.2} /></div>
          <h1 className="relative mt-5 text-3xl font-extrabold">Order Confirmed!</h1>
          <p className="relative mt-2 text-white/80">Thank you, {order.customerName.split(' ')[0]}. We've sent the details to your phone.</p>
        </div>
        <div className="space-y-5 p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-muted p-4"><p className="text-xs text-ink-soft">Order number</p><p className="mt-1 flex items-center gap-2 font-mono text-base font-bold">{order.id}<button type="button" onClick={copy} aria-label="Copy order number" className="text-ink-soft hover:text-brand-600"><Copy className="h-4 w-4" /></button></p></div>
            <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-800">Expected delivery</p><p className="mt-1 flex items-center gap-2 text-base font-bold text-emerald-800"><Truck className="h-4 w-4" />{order.eta}</p></div>
          </div>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {order.items.map((it) => (
              <li key={it.productId} className="flex items-center gap-3 p-3"><SmartImage src={it.image} alt={it.title} icon={it.icon} className="h-12 w-12 shrink-0 rounded-lg" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{it.title}</p><p className="text-xs text-ink-soft">{it.sellerName} · Qty {it.qty}</p></div><p className="text-sm font-bold">{formatPKR(it.price * it.qty)}</p></li>
            ))}
          </ul>
          <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
            <dt className="text-ink-soft">Payment</dt><dd className="text-right font-semibold">{PAYMENT_NAME[order.payment]}</dd>
            <dt className="text-ink-soft">Deliver to</dt><dd className="text-right">{order.address.line}, {order.address.city}</dd>
            <dt className="font-bold">Total</dt><dd className="text-right text-lg font-extrabold">{formatPKR(order.total)}</dd>
          </dl>
          <div className="grid gap-2 sm:grid-cols-3">
            <LinkButton to={`/orders/${order.id}`} variant="gradient" size="lg"><Truck className="h-4 w-4" />Track Order</LinkButton>
            <LinkButton to="/" variant="outline" size="lg"><ShoppingBag className="h-4 w-4" />Continue Shopping</LinkButton>
            <LinkButton to={`/orders/${order.id}`} variant="secondary" size="lg"><FileText className="h-4 w-4" />View Order</LinkButton>
          </div>
          <p className="text-center text-xs text-ink-soft">This order now appears in <Link to="/orders" className="font-semibold text-brand-600">your orders</Link>, the seller's order list and the admin console.</p>
        </div>
      </div>
    </div>
  );
}
