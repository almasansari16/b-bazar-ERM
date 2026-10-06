import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, MapPin, Truck, Store, MessageSquare, RotateCcw, Star, XCircle, FileQuestion, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Breadcrumb, Skeleton, EmptyState } from '@/components/ui/Display';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button, LinkButton } from '@/components/ui/Button';
import { ConfirmDialog, Modal } from '@/components/ui/Overlay';
import { Select, Textarea, Field } from '@/components/ui/Form';
import { SmartImage } from '@/components/common/SmartImage';
import { OrderTimeline, PAYMENT_NAME } from '@/components/customer/OrderTimeline';
import { WriteReview } from '@/components/product/Reviews';
import { formatDateTime, formatPKR } from '@/utils/format';

export default function OrderDetail() {
  const { id } = useParams();
  usePageMeta(`Order ${id}`);
  const order = useMarket((s) => s.orders.find((o) => o.id === id));
  const products = useMarket((s) => s.products);
  const update = useMarket((s) => s.updateOrderStatus);
  const loading = useSimulatedLoad(id, 350);
  const nav = useNavigate();
  const [cancel, setCancel] = useState(false);
  const [review, setReview] = useState<string | null>(null);
  const [ret, setRet] = useState(false);
  const [reason, setReason] = useState('Size does not fit');

  if (loading) return <div className="container-x space-y-4 py-6"><Skeleton className="h-6 w-60" /><Skeleton className="h-72 rounded-2xl" /></div>;
  if (!order) return <div className="container-x py-10"><div className="rounded-2xl border border-line bg-white"><EmptyState icon={<FileQuestion className="h-7 w-7" />} title="Order not found" message="Check the order number and try again." action={<LinkButton to="/orders">My Orders</LinkButton>} /></div></div>;
  const reviewProduct = products.find((p) => p.id === review);

  return (
    <div className="container-x py-5 sm:py-6">
      <Breadcrumb items={[{ label: 'My Orders', to: '/orders' }, { label: order.id }]} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-xl font-extrabold sm:text-2xl">{order.id}</h1>
        <button type="button" aria-label="Copy order number" onClick={async () => { try { await navigator.clipboard.writeText(order.id); toast.success('Copied'); } catch { /* ignore */ } }} className="text-ink-soft hover:text-brand-600"><Copy className="h-4 w-4" /></button>
        <StatusBadge status={order.status} />
        <p className="w-full text-sm text-ink-soft sm:ml-auto sm:w-auto">Placed {formatDateTime(order.createdAt)}</p>
      </div>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5 sm:p-6" aria-labelledby="track-h">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 id="track-h" className="text-lg font-extrabold">Tracking</h2>
              {!['cancelled', 'refunded', 'delivered'].includes(order.status) && <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Estimated delivery: {order.eta}</p>}
            </div>
            <div className="grid gap-6 md:grid-cols-[1fr_240px]">
              <OrderTimeline order={order} />
              <dl className="space-y-3 rounded-xl bg-muted p-4 text-sm">
                <div><dt className="text-xs text-ink-soft">Courier</dt><dd className="flex items-center gap-1.5 font-semibold"><Truck className="h-4 w-4 text-brand-600" />{order.courier}</dd></div>
                <div><dt className="text-xs text-ink-soft">Tracking number</dt><dd className="font-mono font-semibold">{order.tracking}</dd></div>
                <div><dt className="text-xs text-ink-soft">Delivery</dt><dd className="font-semibold capitalize">{order.deliveryMethod}</dd></div>
                <div><dt className="text-xs text-ink-soft">Seller</dt><dd className="font-semibold">{[...new Set(order.items.map((i) => i.sellerName))].join(', ')}</dd></div>
              </dl>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white" aria-labelledby="items-h">
            <h2 id="items-h" className="border-b border-line px-5 py-4 text-lg font-extrabold">Products</h2>
            <ul className="divide-y divide-line">
              {order.items.map((it) => (
                <li key={it.productId} className="flex flex-wrap items-center gap-4 p-5">
                  <SmartImage src={it.image} alt={it.title} icon={it.icon} className="h-20 w-20 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1"><p className="font-semibold">{it.title}</p><p className="flex items-center gap-1 text-xs text-ink-soft"><Store className="h-3.5 w-3.5" />{it.sellerName}{it.variant && ` · ${it.variant}`} · Qty {it.qty}</p><p className="mt-1 font-bold">{formatPKR(it.price * it.qty)}</p></div>
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'delivered' && <Button size="sm" variant="secondary" onClick={() => setReview(it.productId)}><Star className="h-4 w-4" />Write review</Button>}
                    <LinkButton to={`/product/${it.productId}`} size="sm" variant="outline">Buy again</LinkButton>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-brand-600" />Delivery address</h2>
            <p className="text-sm font-semibold">{order.address.name}</p>
            <p className="text-sm text-ink-soft">{order.address.line}<br />{order.address.city}, {order.address.province} {order.address.postal}<br />{order.address.phone}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold"><Receipt className="h-4 w-4 text-brand-600" />Payment summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">Method</dt><dd className="font-semibold">{PAYMENT_NAME[order.payment]}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Status</dt><dd><StatusBadge status={order.paymentStatus} /></dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatPKR(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Delivery</dt><dd>{order.deliveryFee ? formatPKR(order.deliveryFee) : 'Free'}</dd></div>
              {order.discount > 0 && <div className="flex justify-between"><dt className="text-ink-soft">Discount</dt><dd className="text-emerald-600">−{formatPKR(order.discount)}</dd></div>}
              <div className="flex justify-between border-t border-line pt-2"><dt className="font-bold">Total</dt><dd className="text-lg font-extrabold">{formatPKR(order.total)}</dd></div>
            </dl>
          </div>
          <div className="grid gap-2">
            <Button variant="outline" onClick={() => nav('/account/messages')}><MessageSquare className="h-4 w-4" />Chat with seller</Button>
            {['pending', 'confirmed'].includes(order.status) && <Button variant="outline" className="text-red-600" onClick={() => setCancel(true)}><XCircle className="h-4 w-4" />Cancel order</Button>}
            {order.status === 'delivered' && <Button variant="outline" onClick={() => setRet(true)}><RotateCcw className="h-4 w-4" />Return or refund</Button>}
          </div>
        </aside>
      </div>
      <ConfirmDialog open={cancel} onClose={() => setCancel(false)} tone="danger" title="Cancel this order?" message="The seller will be notified and any prepaid amount will be refunded within 3–5 working days." confirmLabel="Cancel order" onConfirm={() => { update(order.id, 'cancelled'); toast.success('Order cancelled.'); }} />
      {reviewProduct && <WriteReview open={!!review} onClose={() => setReview(null)} product={reviewProduct} />}
      <Modal open={ret} onClose={() => setRet(false)} title="Request a return" description="Free pickup within 7 days of delivery." footer={<><Button variant="outline" onClick={() => setRet(false)}>Cancel</Button><Button onClick={() => { useMarket.setState((s) => ({ returns: [{ id: `RT-${Date.now().toString().slice(-4)}`, orderId: order.id, customer: order.customerName, sellerId: order.items[0].sellerId, product: order.items[0].title, reason, amount: order.items[0].price * order.items[0].qty, status: 'requested', date: new Date().toISOString() }, ...s.returns] })); setRet(false); toast.success('Return request submitted. We will arrange a pickup.'); }}>Submit request</Button></>}>
        <div className="space-y-4">
          <Field label="Reason" htmlFor="ret-reason"><Select id="ret-reason" value={reason} onChange={(e) => setReason(e.target.value)}>{['Size does not fit', 'Item damaged in transit', 'Wrong item received', 'Not as described', 'Changed my mind'].map((r) => <option key={r}>{r}</option>)}</Select></Field>
          <Field label="Details (optional)" htmlFor="ret-details"><Textarea id="ret-details" placeholder="Tell us more so we can help faster" /></Field>
        </div>
      </Modal>
    </div>
  );
}
