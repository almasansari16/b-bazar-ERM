import { toast } from 'sonner';
import { MapPin, Phone, Truck, CreditCard, Printer } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { Drawer } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SmartImage } from '@/components/common/SmartImage';
import { OrderTimeline, PAYMENT_NAME } from '@/components/customer/OrderTimeline';
import { useMarket } from '@/store/useMarket';
import { formatDateTime, formatPKR } from '@/utils/format';

export const NEXT_STATUS: Partial<Record<OrderStatus, [OrderStatus, string]>> = {
  pending: ['confirmed', 'Confirm order'], confirmed: ['packed', 'Mark as packed'], processing: ['packed', 'Mark as packed'], packed: ['shipped', 'Hand to courier'], shipped: ['out_for_delivery', 'Out for delivery'], out_for_delivery: ['delivered', 'Mark delivered'],
};

/** Full order lifecycle drawer (seller & admin). */
export function OrderDrawer({ order, onClose, scope }: { order: Order | null; onClose: () => void; scope: 'seller' | 'admin' }) {
  const update = useMarket((s) => s.updateOrderStatus);
  const live = useMarket((s) => s.orders.find((o) => o.id === order?.id));
  const o = live ? { ...live, items: order!.items } : order;
  if (!o) return null;
  const next = NEXT_STATUS[o.status];
  return (
    <Drawer open={!!order} onClose={onClose} title={`Order ${o.id}`} width="max-w-lg"
      footer={<div className="flex flex-wrap gap-2">
        {next && <Button className="flex-1" onClick={() => { update(o.id, next[0]); toast.success(`${o.id}: ${next[1].toLowerCase()} — customer notified.`); }}>{next[1]}</Button>}
        {['pending', 'confirmed', 'processing'].includes(o.status) && <Button variant="outline" className="text-red-600" onClick={() => { update(o.id, 'cancelled'); toast('Order cancelled.'); }}>Cancel</Button>}
        {scope === 'admin' && o.status === 'delivered' && <Button variant="outline" onClick={() => { update(o.id, 'refunded'); toast.success('Refund issued.'); }}>Issue refund</Button>}
        <Button variant="outline" size="icon" aria-label="Print invoice" onClick={() => toast.info('Invoice PDF generated (demo).')}><Printer className="h-4 w-4" /></Button>
      </div>}>
      <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-center gap-2"><StatusBadge status={o.status} /><StatusBadge status={o.paymentStatus} /><span className="text-xs text-ink-soft">{formatDateTime(o.createdAt)}</span></div>
        <section className="rounded-xl border border-line p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Customer</p>
          <p className="font-semibold">{o.customerName}</p>
          <p className="mt-1 flex items-start gap-2 text-sm text-ink-soft"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{o.address.line}, {o.address.city}, {o.address.province}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft"><Phone className="h-4 w-4" />{o.address.phone}</p>
        </section>
        <section>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Items</p>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {o.items.map((it) => <li key={it.productId} className="flex items-center gap-3 p-3"><SmartImage src={it.image} alt={it.title} icon={it.icon} className="h-12 w-12 shrink-0 rounded-lg" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{it.title}</p><p className="text-xs text-ink-soft">{it.sellerName}{it.variant && ` · ${it.variant}`} · ×{it.qty}</p></div><p className="text-sm font-bold">{formatPKR(it.price * it.qty)}</p></li>)}
          </ul>
        </section>
        <section className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-muted p-3"><p className="flex items-center gap-1.5 text-xs text-ink-soft"><CreditCard className="h-3.5 w-3.5" />Payment</p><p className="font-semibold">{PAYMENT_NAME[o.payment]}</p></div>
          <div className="rounded-xl bg-muted p-3"><p className="flex items-center gap-1.5 text-xs text-ink-soft"><Truck className="h-3.5 w-3.5" />{o.courier}</p><p className="font-mono text-xs font-semibold">{o.tracking}</p></div>
        </section>
        <dl className="space-y-1.5 rounded-xl border border-line p-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatPKR(o.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-soft">Delivery</dt><dd>{o.deliveryFee ? formatPKR(o.deliveryFee) : 'Free'}</dd></div>
          {o.discount > 0 && <div className="flex justify-between"><dt className="text-ink-soft">Discount</dt><dd>−{formatPKR(o.discount)}</dd></div>}
          <div className="flex justify-between border-t border-line pt-1.5 font-bold"><dt>Order total</dt><dd>{formatPKR(o.total)}</dd></div>
        </dl>
        <section><p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Lifecycle</p><OrderTimeline order={o} /></section>
      </div>
    </Drawer>
  );
}
