import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/store/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Input, Select, Field, Switch } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useState } from 'react';

const schema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().regex(/^(\+92|0)3\d{2}[\s-]?\d{7}$/, 'Enter a valid Pakistani mobile number'),
  gender: z.string(),
  dob: z.string().optional(),
});
type F = z.infer<typeof schema>;

export default function Profile() {
  usePageMeta('My Profile');
  const user = useAuth((s) => s.user)!;
  const [twoFa, setTwoFa] = useState(true);
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { name: user.name, email: user.email, phone: user.phone ?? '+92 300 1234567', gender: 'Male', dob: '1994-06-14' } });
  const save = handleSubmit(async (v) => { await new Promise((r) => setTimeout(r, 500)); useAuth.setState({ user: { ...user, name: v.name, email: v.email, phone: v.phone } }); toast.success('Profile updated.'); });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">My Profile</h1>
      <form onSubmit={save} noValidate className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-4"><Avatar name={user.name} size="lg" /><div><p className="font-bold">{user.name}</p><button type="button" className="text-sm font-semibold text-brand-600 hover:underline" onClick={() => toast.info('Photo upload is available in the mobile app.')}>Change photo</button></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="p-name" required error={errors.name?.message}><Input id="p-name" {...register('name')} aria-invalid={!!errors.name} /></Field>
          <Field label="Email" htmlFor="p-email" required error={errors.email?.message}><Input id="p-email" type="email" {...register('email')} aria-invalid={!!errors.email} /></Field>
          <Field label="Mobile number" htmlFor="p-phone" required error={errors.phone?.message} hint="Used for delivery updates and OTP"><Input id="p-phone" {...register('phone')} aria-invalid={!!errors.phone} /></Field>
          <Field label="Gender" htmlFor="p-gender"><Select id="p-gender" {...register('gender')}><option>Male</option><option>Female</option><option>Prefer not to say</option></Select></Field>
          <Field label="Date of birth" htmlFor="p-dob"><Input id="p-dob" type="date" {...register('dob')} /></Field>
        </div>
        <div className="mt-6 flex justify-end"><Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save changes</Button></div>
      </form>
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-bold">Security</h2>
        <div className="mt-4 flex items-center justify-between gap-4 border-b border-line pb-4"><div><p className="text-sm font-semibold">Two-step verification</p><p className="text-xs text-ink-soft">Get an OTP by SMS on new sign-ins</p></div><Switch checked={twoFa} onChange={(v) => { setTwoFa(v); toast.success(v ? '2-step verification on' : '2-step verification off'); }} label="Two-step verification" /></div>
        <div className="flex items-center justify-between gap-4 pt-4"><div><p className="text-sm font-semibold">Password</p><p className="text-xs text-ink-soft">Last changed 3 months ago</p></div><Button variant="outline" size="sm" onClick={() => toast.success('Password reset link sent to your email.')}>Change password</Button></div>
      </div>
    </div>
  );
}
