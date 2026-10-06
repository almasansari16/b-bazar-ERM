import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

const field = 'w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:bg-muted aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-500/10';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }>(function Input({ className, icon, ...p }, ref) {
  if (!icon) return <input ref={ref} className={cn(field, 'h-10', className)} {...p} />;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input ref={ref} className={cn(field, 'h-10 pl-9', className)} {...p} />
    </div>
  );
});
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(field, 'min-h-[96px] py-2.5', className)} {...p} />;
});
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...p }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(field, 'h-10 appearance-none pr-9', className)} {...p}>{children}</select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
    </div>
  );
});

export function Field({ label, error, hint, children, required, htmlFor, className }: { label: string; error?: string; hint?: string; children: ReactNode; required?: boolean; htmlFor?: string; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? <p role="alert" className="text-xs font-medium text-red-600">{error}</p> : hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({ checked, onChange, label, className, id, ...rest }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; className?: string; id?: string; 'aria-label'?: string }) {
  const auto = useId();
  const cid = id ?? auto;
  return (
    <label htmlFor={cid} className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-ink', className)}>
      <span className="relative inline-flex">
        <input id={cid} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-label={rest['aria-label']} />
        <span className="grid h-[18px] w-[18px] place-items-center rounded-[5px] border border-slate-300 bg-white transition peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-1">
          <Check className={cn('h-3 w-3 text-white transition', checked ? 'opacity-100' : 'opacity-0')} strokeWidth={3} />
        </span>
      </span>
      {label}
    </label>
  );
}

export function Radio({ checked, onChange, label, name, value, className }: { checked: boolean; onChange: () => void; label?: ReactNode; name: string; value: string; className?: string }) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 text-sm', className)}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="grid h-[18px] w-[18px] place-items-center rounded-full border border-slate-300 bg-white peer-checked:border-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500">
        <span className={cn('h-2.5 w-2.5 rounded-full bg-brand-600 transition', checked ? 'scale-100' : 'scale-0')} />
      </span>
      {label}
    </label>
  );
}

export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label?: string; id?: string }) {
  return (
    <button id={id} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2', checked ? 'bg-brand-600' : 'bg-slate-300')}>
      <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  );
}
