import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ShoppingBag, Store } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { AuthShell, SocialButtons } from './AuthShell';
import { OtpStep } from './ForgotPassword';
import { Input, Field, Checkbox, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { CITIES } from '@/utils/delivery';

const schema = z.object({
  name: z.string().trim().min(3, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().regex(/^03\d{2}[\s-]?\d{7}$/, 'Use format 0300 1234567'),
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Include an uppercase letter').regex(/\d/, 'Include a number'),
  store: z.string().optional(),
  city: z.string().optional(),
  terms: z.literal(true, { message: 'Please accept the terms to continue' }),
});
type F = z.infer<typeof schema>;

export default function Register() {
  usePageMeta('Create account');
  const [params] = useSearchParams();
  const [type, setType] = useState<'customer' | 'seller'>(params.get('seller') ? 'seller' : 'customer');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const registerUser = useAuth((s) => s.register);
  const nav = useNavigate();
  const { register, handleSubmit, setValue, watch, getValues, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', phone: '', password: '', store: '', city: 'Karachi', terms: false as unknown as true } });
  const terms = watch('terms');
  const submit = handleSubmit(async (v) => {
    if (type === 'seller' && (!v.store || v.store.trim().length < 3)) { toast.error('Enter your store name'); return; }
    await new Promise((r) => setTimeout(r, 500)); setStep('otp');
  });
  if (step === 'otp') {
    return (
      <AuthShell title="Verify your number" subtitle={`We sent a 6-digit code to ${getValues('phone')}. (Demo: any 6 digits work.)`}>
        <OtpStep onVerified={() => {
          const v = getValues();
          if (type === 'seller') { toast.success('Seller application submitted! Our team will verify your store within 48 hours.'); nav('/'); return; }
          registerUser(v.name, v.email); toast.success('Account created — welcome to B-Bazar!'); nav('/');
        }} />
      </AuthShell>
    );
  }
  return (
    <AuthShell title={type === 'seller' ? 'Start selling on B-Bazar' : 'Create your account'} subtitle={type === 'seller' ? 'Reach millions of shoppers. No setup fee.' : 'It takes less than a minute.'} footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link></>}>
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1" role="radiogroup" aria-label="Account type">
        {([['customer', 'Shopper', ShoppingBag], ['seller', 'Seller', Store]] as const).map(([k, l, I]) => <button key={k} type="button" role="radio" aria-checked={type === k} onClick={() => setType(k)} className={cn('flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold', type === k ? 'bg-white shadow-sm' : 'text-ink-soft')}><I className="h-4 w-4" />{l}</button>)}
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" htmlFor="r-name" error={errors.name?.message}><Input id="r-name" autoComplete="name" {...register('name')} aria-invalid={!!errors.name} /></Field>
        {type === 'seller' && <div className="grid gap-4 sm:grid-cols-2"><Field label="Store name" htmlFor="r-store"><Input id="r-store" {...register('store')} placeholder="e.g. Karachi Gadgets" /></Field><Field label="City" htmlFor="r-city"><Select id="r-city" {...register('city')}>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select></Field></div>}
        <Field label="Email" htmlFor="r-email" error={errors.email?.message}><Input id="r-email" type="email" autoComplete="email" {...register('email')} aria-invalid={!!errors.email} /></Field>
        <Field label="Mobile number" htmlFor="r-phone" error={errors.phone?.message} hint="We'll send an OTP to verify"><Input id="r-phone" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" {...register('phone')} aria-invalid={!!errors.phone} /></Field>
        <Field label="Password" htmlFor="r-pass" error={errors.password?.message} hint="8+ characters with an uppercase letter and a number"><Input id="r-pass" type="password" autoComplete="new-password" {...register('password')} aria-invalid={!!errors.password} /></Field>
        <div>
          <Checkbox checked={!!terms} onChange={(v) => setValue('terms', v as true, { shouldValidate: true })} label={<span className="text-sm">I agree to the <Link to="/page/terms" className="font-semibold text-brand-600">Terms</Link> and <Link to="/page/privacy" className="font-semibold text-brand-600">Privacy Policy</Link></span>} />
          {errors.terms && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.terms.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>{type === 'seller' ? 'Apply as seller' : 'Create account'}</Button>
      </form>
      {type === 'customer' && <><div className="my-6 flex items-center gap-3 text-xs text-ink-soft"><span className="h-px flex-1 bg-line" />or sign up with<span className="h-px flex-1 bg-line" /></div><SocialButtons onClick={(p) => toast.info(`${p} sign-up is a UI demo.`)} /></>}
    </AuthShell>
  );
}
