import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, ShoppingBag, Store, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, DEMO_USERS, DEMO_PASSWORD } from '@/store/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { AuthShell, SocialButtons } from './AuthShell';
import { Input, Field, Checkbox } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import type { Role } from '@/types';

const schema = z.object({ email: z.string().trim().email('Enter a valid email address'), password: z.string().min(6, 'Password must be at least 6 characters') });
type F = z.infer<typeof schema>;
const HOME: Record<Role, string> = { customer: '/', seller: '/seller/dashboard', admin: '/admin/dashboard' };

export default function Login() {
  usePageMeta('Sign in');
  const [params] = useSearchParams();
  const nav = useNavigate();
  const login = useAuth((s) => s.login);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const submit = handleSubmit(async (v) => {
    setError('');
    await new Promise((r) => setTimeout(r, 500));
    const u = login(v.email, v.password);
    if (!u) { setError('Incorrect email or password. Use one of the demo accounts below.'); return; }
    toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
    nav(params.get('next') ?? HOME[u.role], { replace: true });
  });
  const fill = (r: Role) => { setValue('email', DEMO_USERS[r].email); setValue('password', DEMO_PASSWORD); setError(''); };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to track orders, save items and check out faster." footer={<>New to B-Bazar? <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link></>}>
      <div className="mb-6 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <p className="mb-2 text-xs font-bold text-brand-800">Demo accounts · password <span className="font-mono">{DEMO_PASSWORD}</span></p>
        <div className="grid grid-cols-3 gap-2">
          {([['customer', ShoppingBag], ['seller', Store], ['admin', Shield]] as const).map(([r, I]) => (
            <button key={r} type="button" onClick={() => fill(r)} className="flex flex-col items-center gap-1 rounded-lg bg-white px-2 py-2 text-xs font-semibold capitalize ring-1 ring-line hover:ring-brand-400"><I className="h-4 w-4 text-brand-600" />{r}<span className="hidden truncate text-[10px] font-normal text-ink-soft sm:block">{DEMO_USERS[r].email}</span></button>
          ))}
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
        <Field label="Email" htmlFor="l-email" error={errors.email?.message}><Input id="l-email" type="email" autoComplete="email" icon={<Mail className="h-4 w-4" />} {...register('email')} aria-invalid={!!errors.email} placeholder="you@example.com" /></Field>
        <Field label="Password" htmlFor="l-pass" error={errors.password?.message}>
          <div className="relative"><Input id="l-pass" type={show ? 'text' : 'password'} autoComplete="current-password" icon={<Lock className="h-4 w-4" />} {...register('password')} aria-invalid={!!errors.password} className="pr-10" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
        </Field>
        <div className="flex items-center justify-between"><Checkbox checked={remember} onChange={setRemember} label="Remember me" /><Link to="/forgot-password" className="text-sm font-semibold text-brand-600 hover:underline">Forgot password?</Link></div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Sign in</Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-ink-soft"><span className="h-px flex-1 bg-line" />or continue with<span className="h-px flex-1 bg-line" /></div>
      <SocialButtons onClick={(p) => toast.info(`${p} sign-in is a UI demo. Use a demo account above.`)} />
    </AuthShell>
  );
}
