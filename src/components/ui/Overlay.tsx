import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

function useLockAndEscape(open: boolean, onClose: () => void, ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus],input,button')?.focus(), 30);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; prev?.focus?.(); };
  }, [open, onClose, ref]);
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; description?: string; children?: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLockAndEscape(open, onClose, ref);
  if (!open) return null;
  const w = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="modal-title" className={cn('relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-pop animate-fade-in sm:rounded-2xl', w)}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close dialog"><X className="h-4 w-4" /></Button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, children, footer, side = 'right', width = 'max-w-md' }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode; side?: 'right' | 'left' | 'bottom'; width?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLockAndEscape(open, onClose, ref);
  if (!open) return null;
  const pos = side === 'right' ? `right-0 top-0 h-full w-full ${width} animate-slide-in` : side === 'left' ? `left-0 top-0 h-full w-[86%] ${width} animate-slide-in-l` : 'bottom-0 left-0 right-0 max-h-[88vh] rounded-t-2xl animate-slide-up';
  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-slate-900/50 animate-fade-in" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={cn('absolute flex flex-col bg-white shadow-pop', pos)}>
        {title && (
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-base font-bold">{title}</h2>
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close panel"><X className="h-4 w-4" /></Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', tone = 'primary' }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; tone?: 'primary' | 'danger';
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={<>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }} data-autofocus>{confirmLabel}</Button>
    </>}>
      <p className="text-sm text-ink-soft">{message}</p>
    </Modal>
  );
}

/** Lightweight dropdown menu (click outside / Escape to close). */
export function Dropdown({ trigger, children, align = 'right', className }: { trigger: (p: { open: boolean; toggle: () => void }) => ReactNode; children: (close: () => void) => ReactNode; align?: 'left' | 'right'; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div role="menu" className={cn('absolute top-full z-50 mt-2 min-w-[200px] rounded-xl border border-line bg-white p-1.5 shadow-pop animate-fade-in', align === 'right' ? 'right-0' : 'left-0', className)}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
export function MenuItem({ onClick, children, danger, icon }: { onClick?: () => void; children: ReactNode; danger?: boolean; icon?: ReactNode }) {
  return (
    <button role="menuitem" type="button" onClick={onClick} className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-muted focus-visible:bg-muted focus-visible:outline-none', danger ? 'text-red-600' : 'text-ink')}>
      {icon}{children}
    </button>
  );
}

export function Tooltip({ label, children, side = 'top', disabled }: { label: string; children: ReactNode; side?: 'top' | 'right'; disabled?: boolean }) {
  if (disabled) return <>{children}</>;
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span role="tooltip" className={cn('pointer-events-none absolute z-[90] whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
        side === 'top' ? 'bottom-full left-1/2 mb-1.5 -translate-x-1/2' : 'left-full top-1/2 ml-2 -translate-y-1/2')}>{label}</span>
    </span>
  );
}
