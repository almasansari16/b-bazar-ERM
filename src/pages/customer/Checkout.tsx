import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, MapPin, Truck, CreditCard, ClipboardCheck, Plus, Zap, Banknote, Landmark, Smartphone, Lock, AlertCircle, ChevronLeft, Pencil, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useMarket } from '@/store/useMarket';
import { useCart } from '@/store/useCart';
import { useAuth } from '@/store/useAuth';
import { useCartDetails } from '@/hooks/useCartDetails';
import { usePageMeta } from '@/hooks/usePageMeta';
import { orderService, paymentService } from '@/services';
import { SmartImage } from '@/components/common/SmartImage';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/Button';
import { Input, Select, Field } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { CITIES, PROVINCES, CITY_PROVINCE, deliveryDays, EXPRESS_DELIVERY_FEE } from '@/utils/delivery';
import { deliveryWindow, formatPKR } from '@/utils/format';
import type { Address, PaymentMethod } from '@/types';

const addressSchema = z.object({
  name: z.string().trim().min(3, 'Enter the full name of the recipient'),
  phone: z.string().trim().regex(/^(\+92|0)3\d{2}[\s-]?\d{7}$/, 'Enter a valid Pakistani mobile number, e.g. 0300 1234567'),
  line: z.string().trim().min(8, 'Enter house/flat number, street and area'),
  city: z.string().min(1, 'Select a city'),
  province: z.string().min(1, 'Select a province'),
  postal: z.string().trim().regex(/^\d{5}$/, 'Postal code must be 5 digits'),
  label: z.string().min(1),
});
type AddressForm = z.infer<typeof addressSchema>;

const STEPS = [
  { key: 'address', label: 'Delivery Address', icon: MapPin },
  { key: 'delivery', label: 'Delivery Method', icon: Truck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review Order', icon: ClipboardCheck },
] as const;

const PAYMENTS: { key: PaymentMethod; label: string; desc: string; icon: typeof Banknote; badge?: string }[] = [
  { key: 'cod', label: 'Cash on Delivery', desc: 'Pay in cash when your order arrives', icon: Banknote, badge: 'Most popular' },
  { key: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, UnionPay', icon: CreditCard },
  { key: 'jazzcash', label: 'JazzCash', desc: 'Pay from your JazzCash mobile account', icon: Smartphone, badge: 'Rs. 250 off with JAZZ250' },
  { key: 'easypaisa', label: 'Easypaisa', desc: 'Pay from your Easypaisa wallet', icon: Smartphone },
  { key: 'bank', label: 'Bank Transfer', desc: 'IBFT / Raast to B-Bazar account', icon: Landmark },
];

export default function Checkout() {
  usePageMeta('Checkout');
  const nav = useNavigate();
  const user = useAuth((s) => s.user);
  const addresses = useMarket((s) => s.addresses);
  const upsertAddress = useMarket((s) => s.upsertAddress);
  const clearSelected = useCart((s) => s.clearSelected);
  const [step, setStep] = useState(0);
  const [addrId, setAddrId] = useState(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id);
  const [adding, setAdding] = useState(addresses.length === 0);
  const [method, setMethod] = useState<'standard' | 'express'>('standard');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvc: '' });
  const [wallet, setWallet] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const { lines, coupon, totals } = useCartDetails(method);
  const selected = lines.filter((l) => l.selected && l.product.stock > 0);
  const address = addresses.find((a) => a.id === addrId);
  const [a, b] = deliveryDays(address?.city ?? 'Karachi');

  const form = useForm<AddressForm>({ resolver: zodResolver(addressSchema), defaultValues: { name: user?.name ?? '', phone: '', line: '', city: 'Karachi', province: 'Sindh', postal: '', label: 'Home' } });
  const city = form.watch('city');
  useEffect(() => { if (CITY_PROVINCE[city]) form.setValue('province', CITY_PROVINCE[city]); }, [city, form]);

  const paymentValid = useMemo(() => {
    if (payment === 'card') return /^\d{16}$/.test(card.number.replace(/\s/g, '')) && card.name.trim().length > 2 && /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp) && /^\d{3,4}$/.test(card.cvc);
    if (payment === 'jazzcash' || payment === 'easypaisa') return /^03\d{9}$/.test(wallet.replace(/\D/g, ''));
    return true;
  }, [payment, card, wallet]);

  if (!user) return <Navigate to="/login?next=/checkout" replace />;
  if (selected.length === 0 && !placing) return <Navigate to="/cart" replace />;

  const saveAddress = form.handleSubmit((v) => {
    const addr: Address = { id: `A${Date.now()}`, ...v, isDefault: addresses.length === 0 };
    upsertAddress(addr); setAddrId(addr.id); setAdding(false);
    toast.success('Address saved.');
  });

  const place = async () => {
    if (!address) return;
    setPlacing(true); setError('');
    try {
      if (payment === 'card' && card.number.replace(/\s/g, '').endsWith('0002')) throw new Error('Your bank declined this card. Try another card or choose Cash on Delivery.');
      if (payment !== 'cod') await paymentService.authorize(payment, totals.total);
      const order = await orderService.place({
        customerId: user.id, customerName: address.name,
        lines: selected.map((l) => ({ productId: l.productId, qty: l.qty, variant: l.variant })),
        address: { name: address.name, phone: address.phone, line: address.line, city: address.city, province: address.province, postal: address.postal },
        payment, deliveryMethod: method, deliveryFee: totals.delivery, discount: totals.discount, coupon: coupon && !totals.couponError ? coupon.code : undefined,
      });
      clearSelected();
      toast.success('Order placed successfully.');
      nav(`/order-success?id=${order.id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong placing your order.');
      setPlacing(false);
    }
  };

  const canNext = [!!address && !adding, true, paymentValid, true][step];

  return (
    <div className="min-h-screen pb-28 lg:pb-10">
      <div className="container-x py-5 sm:py-6">
        <div className="mb-6 flex items-center justify-between">
          <button type="button" onClick={() => (step === 0 ? nav('/cart') : setStep(step - 1))} className="flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" />{step === 0 ? 'Back to cart' : 'Back'}</button>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><Lock className="h-3.5 w-3.5" />Secure checkout</p>
        </div>
        <h1 className="sr-only">Checkout</h1>
        {/* Stepper */}
        <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Checkout progress">
          {STEPS.map((s, i) => {
            const done = i < step, cur = i === step;
            return (
              <li key={s.key} aria-current={cur ? 'step' : undefined}>
                <button type="button" disabled={i > step} onClick={() => setStep(i)} className="flex w-full flex-col items-center gap-1.5 text-center disabled:cursor-default sm:flex-row sm:text-left">
                  <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition', done ? 'border-emerald-500 bg-emerald-500 text-white' : cur ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white text-ink-soft')}>
                    {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </span>
                  <span className={cn('text-[11px] font-semibold leading-tight sm:text-sm', cur ? 'text-ink' : 'text-ink-soft')}><span className="hidden sm:inline">Step {i + 1}<br /></span>{s.label}</span>
                </button>
                <div className={cn('mt-2 h-1 rounded-full', i <= step ? 'bg-brand-600' : 'bg-line')} />
              </li>
            );
          })}
        </ol>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <section className="min-w-0 rounded-2xl border border-line bg-white p-5 sm:p-6" aria-live="polite">
            {step === 0 && (
              <div>
                <h2 className="text-lg font-extrabold">Where should we deliver?</h2>
                {!adding && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Saved addresses">
                    {addresses.map((ad) => (
                      <button key={ad.id} type="button" role="radio" aria-checked={addrId === ad.id} onClick={() => setAddrId(ad.id)} className={cn('rounded-xl border-2 p-4 text-left transition', addrId === ad.id ? 'border-brand-600 bg-brand-50/50' : 'border-line hover:border-slate-300')}>
                        <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold">{ad.name}<Badge tone="neutral">{ad.label}</Badge></span>{addrId === ad.id && <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white"><Check className="h-3 w-3" /></span>}</div>
                        <p className="mt-2 text-sm text-ink-soft">{ad.line}, {ad.city}, {ad.province} {ad.postal}</p>
                        <p className="mt-1 text-sm text-ink-soft">{ad.phone}</p>
                        {ad.isDefault && <p className="mt-2 text-xs font-semibold text-brand-700">Default address</p>}
                      </button>
                    ))}
                    <button type="button" onClick={() => setAdding(true)} className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-sm font-semibold text-brand-700 hover:border-brand-300 hover:bg-brand-50/40"><Plus className="h-5 w-5" />Add New Address</button>
                  </div>
                )}
                {adding && (
                  <form onSubmit={saveAddress} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
                    <Field label="Full name" htmlFor="a-name" required error={form.formState.errors.name?.message}><Input id="a-name" {...form.register('name')} aria-invalid={!!form.formState.errors.name} autoComplete="name" /></Field>
                    <Field label="Phone" htmlFor="a-phone" required error={form.formState.errors.phone?.message}><Input id="a-phone" {...form.register('phone')} placeholder="0300 1234567" inputMode="tel" aria-invalid={!!form.formState.errors.phone} autoComplete="tel" /></Field>
                    <Field label="Address" htmlFor="a-line" required error={form.formState.errors.line?.message} className="sm:col-span-2"><Input id="a-line" {...form.register('line')} placeholder="House 42, Block 7, Gulshan-e-Iqbal" aria-invalid={!!form.formState.errors.line} autoComplete="street-address" /></Field>
                    <Field label="City" htmlFor="a-city" required error={form.formState.errors.city?.message}><Select id="a-city" {...form.register('city')}>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
                    <Field label="Province" htmlFor="a-prov" required error={form.formState.errors.province?.message}><Select id="a-prov" {...form.register('province')}>{PROVINCES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
                    <Field label="Postal code" htmlFor="a-postal" required error={form.formState.errors.postal?.message}><Input id="a-postal" {...form.register('postal')} placeholder="75300" inputMode="numeric" aria-invalid={!!form.formState.errors.postal} autoComplete="postal-code" /></Field>
                    <Field label="Label" htmlFor="a-label"><Select id="a-label" {...form.register('label')}><option>Home</option><option>Office</option><option>Other</option></Select></Field>
                    <div className="flex gap-2 sm:col-span-2">
                      <Button type="submit">Save address</Button>
                      {addresses.length > 0 && <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>}
                    </div>
                  </form>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-lg font-extrabold">Choose delivery speed</h2>
                <p className="text-sm text-ink-soft">Delivering to {address?.city}</p>
                <div className="mt-4 grid gap-3" role="radiogroup" aria-label="Delivery method">
                  {([['standard', 'Standard Delivery', `${a}–${b} business days · ${deliveryWindow(new Date(), a, b)}`, totals.subtotal >= 2999 ? 'Free' : 'Rs. 199', Truck], ['express', 'Express Delivery', `Next-day in ${address?.city === 'Karachi' ? 'Karachi' : 'major cities'} · ${deliveryWindow(new Date(), Math.max(1, a - 1), Math.max(1, b - 1))}`, formatPKR(EXPRESS_DELIVERY_FEE), Zap]] as const).map(([k, t, d, fee, Icon]) => (
                    <button key={k} type="button" role="radio" aria-checked={method === k} onClick={() => setMethod(k)} className={cn('flex items-center gap-4 rounded-xl border-2 p-4 text-left transition', method === k ? 'border-brand-600 bg-brand-50/50' : 'border-line hover:border-slate-300')}>
                      <span className={cn('grid h-11 w-11 place-items-center rounded-xl', method === k ? 'bg-brand-600 text-white' : 'bg-muted text-ink-soft')}><Icon className="h-5 w-5" /></span>
                      <span className="flex-1"><span className="block font-bold">{t}</span><span className="text-sm text-ink-soft">{d}</span></span>
                      <span className="font-bold">{fee}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 flex items-center gap-2 rounded-lg bg-muted p-3 text-xs text-ink-soft"><ShieldCheck className="h-4 w-4 text-brand-600" />Delivered by B-Bazar logistics partners: TCS, Leopards, M&P and B-Bazar Express.</p>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-extrabold">How would you like to pay?</h2>
                <p className="text-sm text-ink-soft">This is a demo — no real payment is processed.</p>
                <div className="mt-4 grid gap-3" role="radiogroup" aria-label="Payment method">
                  {PAYMENTS.map((pm) => (
                    <div key={pm.key} className={cn('rounded-xl border-2 transition', payment === pm.key ? 'border-brand-600 bg-brand-50/30' : 'border-line')}>
                      <button type="button" role="radio" aria-checked={payment === pm.key} onClick={() => setPayment(pm.key)} className="flex w-full items-center gap-4 p-4 text-left">
                        <span className={cn('grid h-5 w-5 place-items-center rounded-full border-2', payment === pm.key ? 'border-brand-600' : 'border-slate-300')}>{payment === pm.key && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}</span>
                        <pm.icon className={cn('h-5 w-5', pm.key === 'jazzcash' ? 'text-red-600' : pm.key === 'easypaisa' ? 'text-emerald-600' : 'text-brand-600')} />
                        <span className="flex-1"><span className="block font-semibold">{pm.label}</span><span className="text-xs text-ink-soft">{pm.desc}</span></span>
                        {pm.badge && <Badge tone={pm.key === 'cod' ? 'brand' : 'warning'} className="hidden sm:inline-flex">{pm.badge}</Badge>}
                      </button>
                      {payment === pm.key && pm.key === 'card' && (
                        <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
                          <Field label="Card number" htmlFor="cc-num" className="sm:col-span-2" hint="Demo: any 16 digits. Ending in 0002 simulates a decline."><Input id="cc-num" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ') })} /></Field>
                          <Field label="Name on card" htmlFor="cc-name" className="sm:col-span-2"><Input id="cc-name" autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></Field>
                          <Field label="Expiry (MM/YY)" htmlFor="cc-exp"><Input id="cc-exp" autoComplete="cc-exp" placeholder="08/28" value={card.exp} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setCard({ ...card, exp: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v }); }} /></Field>
                          <Field label="CVC" htmlFor="cc-cvc"><Input id="cc-cvc" autoComplete="cc-csc" inputMode="numeric" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} /></Field>
                        </div>
                      )}
                      {payment === pm.key && (pm.key === 'jazzcash' || pm.key === 'easypaisa') && (
                        <div className="border-t border-line p-4"><Field label={`${pm.label} mobile number`} htmlFor="wallet" hint="You'll approve the payment in the app (simulated)."><Input id="wallet" inputMode="tel" placeholder="03001234567" value={wallet} onChange={(e) => setWallet(e.target.value.replace(/\D/g, '').slice(0, 11))} /></Field></div>
                      )}
                      {payment === pm.key && pm.key === 'bank' && (
                        <div className="space-y-1 border-t border-line p-4 text-sm"><p><b>Account title:</b> B-Bazar (Pvt) Ltd</p><p><b>Bank:</b> Meezan Bank · IBAN PK36 MEZN 0001 2345 6789 0123</p><p className="text-xs text-ink-soft">Your order is confirmed once the transfer is verified (usually within 2 hours).</p></div>
                      )}
                      {payment === pm.key && pm.key === 'cod' && <p className="border-t border-line p-4 text-sm text-ink-soft">Please keep <b className="text-ink">{formatPKR(totals.total)}</b> ready. Our rider can also accept JazzCash/Easypaisa on delivery.</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && address && (
              <div className="space-y-5">
                <h2 className="text-lg font-extrabold">Review your order</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  <ReviewBlock title="Deliver to" onEdit={() => setStep(0)}>{address.name}<br />{address.line}, {address.city}<br />{address.phone}</ReviewBlock>
                  <ReviewBlock title="Delivery" onEdit={() => setStep(1)}>{method === 'express' ? 'Express' : 'Standard'} delivery<br />Arrives {deliveryWindow(new Date(), method === 'express' ? Math.max(1, a - 1) : a, method === 'express' ? Math.max(1, b - 1) : b)}</ReviewBlock>
                  <ReviewBlock title="Payment" onEdit={() => setStep(2)}>{PAYMENTS.find((x) => x.key === payment)?.label}{payment === 'card' && <><br />•••• {card.number.slice(-4)}</>}</ReviewBlock>
                </div>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {selected.map((l) => (
                    <li key={l.key} className="flex items-center gap-3 p-3">
                      <SmartImage src={l.product.images[0]} alt={l.product.title} icon={l.product.icon} tint={l.seller?.color} className="h-14 w-14 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{l.product.title}</p><p className="text-xs text-ink-soft">{l.seller?.name}{l.variant && ` · ${l.variant}`} · Qty {l.qty}</p></div>
                      <p className="text-sm font-bold tabular-nums">{formatPKR(l.product.price * l.qty)}</p>
                    </li>
                  ))}
                </ul>
                {error && <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="h-5 w-5 shrink-0" /><div><p className="font-bold">Payment failed</p><p>{error}</p><button type="button" onClick={() => setStep(2)} className="mt-1 font-semibold underline">Change payment method</button></div></div>}
              </div>
            )}

            <div className="mt-6 hidden justify-end gap-2 border-t border-line pt-5 lg:flex">
              {step < 3 ? <Button size="lg" onClick={() => setStep(step + 1)} disabled={!canNext}>Continue to {STEPS[step + 1].label}</Button> : <Button size="lg" variant="gradient" onClick={place} loading={placing}>Place Order · {formatPKR(totals.total)}</Button>}
            </div>
          </section>

          <aside className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-6" aria-label="Order summary">
            <div className="mb-4 hidden items-center justify-between lg:flex"><h2 className="text-lg font-extrabold">Order Summary</h2><Logo compact /></div>
            <ul className="space-y-3">{selected.slice(0, 4).map((l) => <li key={l.key} className="flex items-center gap-3"><span className="relative"><SmartImage src={l.product.images[0]} alt="" icon={l.product.icon} className="h-12 w-12 rounded-lg" /><span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">{l.qty}</span></span><span className="line-clamp-2 flex-1 text-xs">{l.product.title}</span><span className="text-xs font-semibold tabular-nums">{formatPKR(l.product.price * l.qty)}</span></li>)}
              {selected.length > 4 && <li className="text-xs text-ink-soft">+{selected.length - 4} more items</li>}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">Items ({totals.items})</dt><dd className="tabular-nums">{formatPKR(totals.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Delivery</dt><dd className="tabular-nums">{totals.delivery ? formatPKR(totals.delivery) : <span className="font-semibold text-emerald-600">Free</span>}</dd></div>
              {totals.discount > 0 && <div className="flex justify-between"><dt className="text-ink-soft">Discount {coupon && `(${coupon.code})`}</dt><dd className="font-semibold tabular-nums text-emerald-600">−{formatPKR(totals.discount)}</dd></div>}
              <div className="flex items-center justify-between border-t border-line pt-3"><dt className="font-bold">Total</dt><dd className="text-xl font-extrabold tabular-nums">{formatPKR(totals.total)}</dd></div>
            </dl>
          </aside>
        </div>
      </div>
      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        {step < 3
          ? <Button size="lg" className="w-full" onClick={() => setStep(step + 1)} disabled={!canNext}>Continue · {STEPS[step + 1].label}</Button>
          : <Button size="lg" variant="gradient" className="w-full" onClick={place} loading={placing}>Place Order · {formatPKR(totals.total)}</Button>}
      </div>
    </div>
  );
}
function ReviewBlock({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="rounded-xl bg-muted p-3 text-sm">
      <div className="mb-1 flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">{title}</p><button type="button" onClick={onEdit} className="text-brand-600" aria-label={`Edit ${title}`}><Pencil className="h-3.5 w-3.5" /></button></div>
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}
