import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '@/hooks/usePageMeta';
import { AuthShell } from './AuthShell';
import { Input, Field } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

export function OtpStep({ onVerified }: { onVerified: () => void }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { refs.current[0]?.focus(); }, []);
  useEffect(() => { if (timer <= 0) return; const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); }, [timer]);
  const set = (i: number, v: string) => {
    const d = v.replace(/\D/g, '');
    if (d.length > 1) { const arr = d.slice(0, 6).split(''); setCode([...arr, ...Array(6 - arr.length).fill('')]); refs.current[Math.min(5, arr.length)]?.focus(); return; }
    const next = [...code]; next[i] = d; setCode(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  const full = code.every(Boolean);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); onVerified(); }, 600); }} className="space-y-6">
      <fieldset><legend className="sr-only">Verification code</legend>
        <div className="flex justify-between gap-2">
          {code.map((c, i) => (
            <input key={i} ref={(el) => { refs.current[i] = el; }} value={c} inputMode="numeric" maxLength={6} aria-label={`Digit ${i + 1}`} onChange={(e) => set(i, e.target.value)} onKeyDown={(e) => { if (e.key === 'Backspace' && !c && i > 0) refs.current[i - 1]?.focus(); }}
              className="h-14 w-full max-w-[56px] rounded-xl border-2 border-line text-center text-xl font-bold focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
          ))}
        </div>
      </fieldset>
      <Button type="submit" size="lg" className="w-full" disabled={!full} loading={loading}>Verify</Button>
      <p className="text-center text-sm text-ink-soft">{timer > 0 ? <>Resend code in <b className="tabular-nums text-ink">0:{String(timer).padStart(2, '0')}</b></> : <button type="button" className="font-semibold text-brand-600 hover:underline" onClick={() => { setTimer(30); toast.success('A new code has been sent.'); }}>Resend code</button>}</p>
    </form>
  );
}

export default function ForgotPassword() {
  usePageMeta('Reset password');
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();
  if (step === 'otp') return <AuthShell title="Enter verification code" subtitle={`We sent a 6-digit code to ${email}. (Demo: any 6 digits.)`}><OtpStep onVerified={() => setStep('reset')} /></AuthShell>;
  if (step === 'reset') return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you don't use elsewhere.">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return; } setStep('done'); }}>
        <Field label="New password" htmlFor="np" error={err}><Input id="np" type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(''); }} autoComplete="new-password" /></Field>
        <Button type="submit" size="lg" className="w-full">Update password</Button>
      </form>
    </AuthShell>
  );
  if (step === 'done') return (
    <AuthShell title="Password updated" subtitle="You can now sign in with your new password.">
      <div className="text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" /><Button size="lg" className="mt-6 w-full" onClick={() => nav('/login')}>Back to sign in</Button></div>
    </AuthShell>
  );
  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a verification code." footer={<Link to="/login" className="font-semibold text-brand-600 hover:underline">Back to sign in</Link>}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Enter a valid email address.'); return; } setStep('otp'); toast.success('Verification code sent.'); }}>
        <Field label="Email" htmlFor="fp" error={err}><Input id="fp" type="email" icon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} autoComplete="email" /></Field>
        <Button type="submit" size="lg" className="w-full">Send code</Button>
      </form>
    </AuthShell>
  );
}
