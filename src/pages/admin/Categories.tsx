import { useState } from 'react';
import { ChevronRight, ChevronUp, ChevronDown, Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useMarket } from '@/store/useMarket';
import { useLiveProducts } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { Card } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Switch, Input, Field, Select, Textarea } from '@/components/ui/Form';
import { Modal, ConfirmDialog, Tooltip } from '@/components/ui/Overlay';
import { DynamicIcon, ICON_NAMES } from '@/components/common/DynamicIcon';
import { slugify } from '@/utils/format';
import type { Category } from '@/types';

export default function AdminCategories() {
  usePageMeta('Categories · Admin');
  const categories = useMarket((s) => s.categories);
  const { upsertCategory, deleteCategory, moveCategory } = useMarket();
  const products = useLiveProducts();
  const [open, setOpen] = useState<string[]>(['cat-1', 'cat-4']);
  const [edit, setEdit] = useState<(Category & { subsText: string }) | null>(null);
  const [del, setDel] = useState<Category | null>(null);
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const count = (slug: string, sub?: string) => products.filter((p) => p.category === slug && (!sub || p.subcategory === sub)).length;
  const blank = (): Category & { subsText: string } => ({ id: `cat-${Date.now()}`, slug: '', name: '', short: '', icon: 'Package', description: '', color: '#4338CA', image: '', subcategories: [], enabled: true, order: categories.length + 1, subsText: '' });
  const save = () => {
    if (!edit || edit.name.trim().length < 2) { toast.error('Enter a category name.'); return; }
    const { subsText, ...c } = edit;
    upsertCategory({ ...c, slug: c.slug || slugify(c.name), short: c.short || c.name.split(' ')[0], subcategories: subsText.split(',').map((s) => s.trim()).filter(Boolean).map((n) => ({ name: n, slug: slugify(n) })) });
    toast.success('Category saved.'); setEdit(null);
  };
  return (
    <>
      <PageHeader title="Categories" subtitle={`${categories.length} top-level categories · ${categories.reduce((n, c) => n + c.subcategories.length, 0)} subcategories`} actions={<Button onClick={() => setEdit(blank())}><Plus className="h-4 w-4" />Add Category</Button>} />
      <Card>
        <div className="flex items-center gap-2 border-b border-line px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft"><span className="flex-1">Category tree</span><span className="hidden w-24 text-right sm:block">Products</span><span className="w-16 text-center">Enabled</span><span className="w-[140px] text-right">Actions</span></div>
        <ul role="tree" aria-label="Categories">
          {sorted.map((c, i) => {
            const isOpen = open.includes(c.id);
            return (
              <li key={c.id} role="treeitem" aria-expanded={isOpen} className="border-b border-line last:border-0">
                <div className={cn('flex items-center gap-2 px-3 py-2.5 sm:px-5', !c.enabled && 'opacity-60')}>
                  <button type="button" onClick={() => setOpen((o) => (isOpen ? o.filter((x) => x !== c.id) : [...o, c.id]))} className="grid h-7 w-7 place-items-center rounded hover:bg-muted" aria-label={isOpen ? 'Collapse' : 'Expand'}><ChevronRight className={cn('h-4 w-4 transition', isOpen && 'rotate-90')} /></button>
                  <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${c.color}18`, color: c.color }}><DynamicIcon name={c.icon} className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{c.name}</span><span className="block truncate text-xs text-ink-soft">/{c.slug} · {c.subcategories.length} subcategories</span></span>
                  <span className="hidden w-24 text-right text-sm tabular-nums sm:block">{count(c.slug)}</span>
                  <span className="grid w-16 place-items-center"><Switch checked={c.enabled} onChange={(v) => { upsertCategory({ ...c, enabled: v }); toast.success(`${c.name} ${v ? 'enabled' : 'disabled'}.`); }} label={`Enable ${c.name}`} /></span>
                  <span className="flex w-[140px] justify-end gap-0.5">
                    <Tooltip label="Move up"><Button size="icon-sm" variant="ghost" disabled={i === 0} onClick={() => moveCategory(c.id, -1)} aria-label="Move up"><ChevronUp className="h-4 w-4" /></Button></Tooltip>
                    <Tooltip label="Move down"><Button size="icon-sm" variant="ghost" disabled={i === sorted.length - 1} onClick={() => moveCategory(c.id, 1)} aria-label="Move down"><ChevronDown className="h-4 w-4" /></Button></Tooltip>
                    <Tooltip label="Edit"><Button size="icon-sm" variant="ghost" onClick={() => setEdit({ ...c, subsText: c.subcategories.map((s) => s.name).join(', ') })} aria-label="Edit"><Pencil className="h-4 w-4" /></Button></Tooltip>
                    <Tooltip label="Delete"><Button size="icon-sm" variant="ghost" className="text-red-600" onClick={() => setDel(c)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button></Tooltip>
                  </span>
                </div>
                {isOpen && (
                  <ul role="group" className="pb-2">
                    {c.subcategories.map((s) => (
                      <li key={s.slug} role="treeitem" className="flex items-center gap-2 py-1.5 pl-[76px] pr-5 text-sm sm:pl-[92px]">
                        <span className="h-px w-3 bg-line" /><FolderTree className="h-3.5 w-3.5 text-ink-soft" /><span className="flex-1">{s.name}</span><span className="hidden w-24 text-right text-xs tabular-nums text-ink-soft sm:block">{count(c.slug, s.name)}</span><span className="w-16" /><span className="w-[140px]" />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.slug ? 'Edit category' : 'Add category'} footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save category</Button></>}>
        {edit && <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" htmlFor="cn" required><Input id="cn" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
          <Field label="Slug" htmlFor="cs" hint="Leave blank to generate"><Input id="cs" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} /></Field>
          <Field label="Icon" htmlFor="ci"><Select id="ci" value={edit.icon} onChange={(e) => setEdit({ ...edit, icon: e.target.value })}>{ICON_NAMES.map((n) => <option key={n}>{n}</option>)}</Select></Field>
          <Field label="Colour" htmlFor="cc"><Input id="cc" type="color" value={edit.color} onChange={(e) => setEdit({ ...edit, color: e.target.value })} className="p-1" /></Field>
          <Field label="Description" htmlFor="cd" className="sm:col-span-2"><Textarea id="cd" rows={2} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
          <Field label="Subcategories" htmlFor="csub" hint="Comma separated" className="sm:col-span-2"><Textarea id="csub" rows={2} value={edit.subsText} onChange={(e) => setEdit({ ...edit, subsText: e.target.value })} /></Field>
        </div>}
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} tone="danger" title={`Delete ${del?.name}?`} confirmLabel="Delete" message={`${count(del?.slug ?? '')} products are in this category. They will be hidden from category browsing until reassigned.`} onConfirm={() => { deleteCategory(del!.id); toast.success('Category deleted.'); }} />
    </>
  );
}
