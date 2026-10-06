import { Check, Package, ClipboardCheck, PackageCheck, Truck, Bike, Home, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Order, OrderStatus } from '@/types';
import { formatDateTime } from '@/utils/format';

const STEPS: { s: OrderStatus; label: string; icon: typeof Check }[] = [
  { s: 'pending', label: 'Order Placed', icon: ClipboardCheck },
  { s: 'confirmed', label: 'Confirmed', icon: Check },
  { s: 'packed', label: 'Packed', icon: Package },
  { s: 'shipped', label: 'Shipped', icon: Truck },
  { s: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
  { s: 'delivered', label: 'Delivered', icon: Home },
];
const RANK: Record<string, number> = { pending: 0, confirmed: 1, processing: 1, packed: 2, shipped: 3, out_for_delivery: 4, delivered: 5, refunded: 5 };

export function OrderTimeline({ order, orientation = 'vertical' }: { order: Order; orientation?: 'vertical' | 'horizontal' }) {
  const rank = RANK[order.status] ?? 0;
  const at = (s: OrderStatus) => order.timeline.find((t) => t.status === s)?.at;
  if (order.status === 'cancelled') {
    return <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-4 text-sm"><XCircle className="h-5 w-5 text-slate-500" /><div><p className="font-bold">Order cancelled</p><p className="text-ink-soft">{order.timeline.at(-1)?.note}</p></div></div>;
  }
  if (orientation === 'horizontal') {
    return (
      <ol className="grid grid-cols-6 gap-1" aria-label="Order progress">
        {STEPS.map((st, i) => {
          const done = i <= rank;
          return (
            <li key={st.s} className="flex flex-col items-center text-center">
              <div className="flex w-full items-center">
                <div className={cn('h-0.5 flex-1', i === 0 ? 'bg-transparent' : i <= rank ? 'bg-emerald-500' : 'bg-line')} />
                <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full', done ? 'bg-emerald-500 text-white' : 'bg-muted text-ink-soft')}><st.icon className="h-3.5 w-3.5" /></span>
                <div className={cn('h-0.5 flex-1', i === STEPS.length - 1 ? 'bg-transparent' : i < rank ? 'bg-emerald-500' : 'bg-line')} />
              </div>
              <span className={cn('mt-1.5 text-[10px] font-semibold leading-tight sm:text-xs', done ? 'text-ink' : 'text-ink-soft')}>{st.label}</span>
            </li>
          );
        })}
      </ol>
    );
  }
  return (
    <ol className="relative" aria-label="Tracking timeline">
      {STEPS.map((st, i) => {
        const done = i <= rank; const cur = i === rank;
        const time = at(st.s) ?? (st.s === 'confirmed' ? at('processing') : undefined);
        return (
          <li key={st.s} className="relative flex gap-4 pb-6 last:pb-0">
            {i < STEPS.length - 1 && <span className={cn('absolute left-[17px] top-9 h-[calc(100%-28px)] w-0.5', i < rank ? 'bg-emerald-500' : 'bg-line')} aria-hidden="true" />}
            <span className={cn('relative grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-white', done ? 'bg-emerald-500 text-white' : 'bg-muted text-slate-400', cur && 'ring-emerald-100')}><st.icon className="h-4 w-4" /></span>
            <div className="pt-1.5">
              <p className={cn('text-sm font-bold', !done && 'text-ink-soft')}>{st.label}{cur && order.status !== 'delivered' && <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">CURRENT</span>}</p>
              <p className="text-xs text-ink-soft">{done && time ? formatDateTime(time) : i === 5 ? `Expected ${order.eta}` : 'Pending'}</p>
              {done && <p className="text-xs text-ink-soft">{order.timeline.find((t) => t.status === st.s)?.note}</p>}
            </div>
          </li>
        );
      })}
      {order.status === 'refunded' && <li className="mt-4 flex items-center gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-800"><RotateCcw className="h-4 w-4" />Refund issued to your original payment method.</li>}
    </ol>
  );
}
export const PAYMENT_NAME: Record<string, string> = { cod: 'Cash on Delivery', card: 'Credit/Debit Card', jazzcash: 'JazzCash', easypaisa: 'Easypaisa', bank: 'Bank Transfer' };
export { PackageCheck };
