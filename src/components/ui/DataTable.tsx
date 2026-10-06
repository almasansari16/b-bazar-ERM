import { useMemo, useState, type ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Columns3, Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Input, Checkbox } from './Form';
import { Button } from './Button';
import { Pagination, EmptyState, Skeleton } from './Display';
import { Dropdown } from './Overlay';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  hideable?: boolean;
  defaultHidden?: boolean;
  /** shown as the card title on mobile */
  primary?: boolean;
  align?: 'left' | 'right' | 'center';
}

/** Feature-complete table: search, sort, pagination, column visibility, bulk selection,
 *  row actions, sticky header, and a stacked card layout on mobile. */
export function DataTable<T>({ data, columns, rowKey, searchKeys, searchPlaceholder = 'Search…', pageSize = 10, bulkActions, toolbar, rowActions, onRowClick, loading, emptyTitle = 'Nothing here yet', emptyMessage, selectable = true }: {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  searchKeys?: (row: T) => string;
  searchPlaceholder?: string;
  pageSize?: number;
  bulkActions?: (selected: string[], clear: () => void) => ReactNode;
  toolbar?: ReactNode;
  rowActions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  selectable?: boolean;
}) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>(() => columns.filter((c) => c.defaultHidden).map((c) => c.key));

  const visible = columns.filter((c) => !hidden.includes(c.key));
  const filtered = useMemo(() => {
    let rows = data;
    if (q && searchKeys) { const n = q.toLowerCase(); rows = rows.filter((r) => searchKeys(r).toLowerCase().includes(n)); }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) rows = [...rows].sort((a, b) => { const x = col.sortValue!(a), y = col.sortValue!(b); return (x > y ? 1 : x < y ? -1 : 0) * sort.dir; });
    }
    return rows;
  }, [data, q, sort, columns, searchKeys]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * pageSize, cur * pageSize);
  const pageIds = rows.map(rowKey);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const toggleSort = (key: string) => setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }));

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-3 sm:p-4">
        {searchKeys && (
          <div className="w-full sm:w-72">
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={searchPlaceholder} icon={<Search className="h-4 w-4" />} aria-label={searchPlaceholder} />
          </div>
        )}
        {toolbar}
        <div className="ml-auto flex items-center gap-2">
          {selected.length > 0 && bulkActions && (
            <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-2 py-1 animate-fade-in">
              <span className="text-xs font-semibold text-brand-700">{selected.length} selected</span>
              {bulkActions(selected, () => setSelected([]))}
            </div>
          )}
          <Dropdown trigger={({ toggle }) => <Button variant="outline" size="sm" onClick={toggle} aria-label="Choose columns"><Columns3 className="h-4 w-4" /><span className="hidden sm:inline">Columns</span></Button>}>
            {() => (
              <div className="max-h-72 space-y-1 overflow-y-auto p-1">
                <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Visible columns</p>
                {columns.filter((c) => c.hideable !== false && !c.primary).map((c) => (
                  <Checkbox key={c.key} className="w-full rounded-md px-2 py-1.5 hover:bg-muted" checked={!hidden.includes(c.key)} onChange={(v) => setHidden((h) => (v ? h.filter((x) => x !== c.key) : [...h, c.key]))} label={c.header} />
                ))}
              </div>
            )}
          </Dropdown>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Inbox className="h-7 w-7" />} title={q ? 'No matching results' : emptyTitle} message={q ? `Nothing matches “${q}”. Try a different search.` : emptyMessage} />
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden max-h-[640px] overflow-auto md:block">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                <tr className="border-b border-line">
                  {selectable && (
                    <th className="w-10 px-4 py-3"><Checkbox aria-label="Select all on page" checked={allOnPage} onChange={(v) => setSelected((s) => (v ? [...new Set([...s, ...pageIds])] : s.filter((x) => !pageIds.includes(x))))} /></th>
                  )}
                  {visible.map((c) => (
                    <th key={c.key} scope="col" className={cn('whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center', c.className)}>
                      {c.sortValue ? (
                        <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 uppercase hover:text-ink">
                          {c.header}
                          {sort?.key === c.key ? (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                        </button>
                      ) : c.header}
                    </th>
                  ))}
                  {rowActions && <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-ink-soft">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const id = rowKey(r);
                  return (
                    <tr key={id} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cn('border-b border-line/70 transition last:border-0 hover:bg-slate-50/70', onRowClick && 'cursor-pointer', selected.includes(id) && 'bg-brand-50/40')}>
                      {selectable && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}><Checkbox aria-label={`Select row ${id}`} checked={selected.includes(id)} onChange={(v) => setSelected((s) => (v ? [...s, id] : s.filter((x) => x !== id)))} /></td>
                      )}
                      {visible.map((c) => <td key={c.key} className={cn('px-4 py-3 align-middle', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center', c.className)}>{c.render(r)}</td>)}
                      {rowActions && <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}><div className="flex justify-end gap-1">{rowActions(r)}</div></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <ul className="divide-y divide-line md:hidden">
            {rows.map((r) => {
              const id = rowKey(r);
              const primary = visible.find((c) => c.primary) ?? visible[0];
              return (
                <li key={id} className="p-4" onClick={onRowClick ? () => onRowClick(r) : undefined}>
                  <div className="flex items-start gap-3">
                    {selectable && <span onClick={(e) => e.stopPropagation()}><Checkbox aria-label={`Select row ${id}`} checked={selected.includes(id)} onChange={(v) => setSelected((s) => (v ? [...s, id] : s.filter((x) => x !== id)))} /></span>}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2">{primary.render(r)}</div>
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {visible.filter((c) => c !== primary).map((c) => (
                          <div key={c.key} className="min-w-0">
                            <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">{c.header}</dt>
                            <dd className="truncate text-[13px]">{c.render(r)}</dd>
                          </div>
                        ))}
                      </dl>
                      {rowActions && <div className="mt-3 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>{rowActions(r)}</div>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
            <p className="text-xs text-ink-soft">Showing <b className="text-ink">{(cur - 1) * pageSize + 1}–{Math.min(cur * pageSize, filtered.length)}</b> of <b className="text-ink">{filtered.length}</b></p>
            <Pagination page={cur} pages={pages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
