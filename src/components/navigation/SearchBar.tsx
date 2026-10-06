import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, Clock, TrendingUp, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLiveProducts } from '@/hooks/useCatalog';
import { useMarket } from '@/store/useMarket';
import { useUI } from '@/store/useUI';
import { SmartImage } from '@/components/common/SmartImage';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { formatPKR } from '@/utils/format';

export const TRENDING = ['iphone', 'wireless earbuds', 'lawn suit', 'air fryer', 'smart watch', 'basmati rice'];

export function SearchBar({ className, autoFocus, onDone }: { className?: string; autoFocus?: boolean; onDone?: () => void }) {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();
  const products = useLiveProducts();
  const categories = useMarket((s) => s.categories);
  const { recentSearches, pushSearch, clearSearches } = useUI();

  useEffect(() => { setQ(params.get('q') ?? ''); }, [params]);
  useEffect(() => {
    const f = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  const term = q.trim().toLowerCase();
  const { suggestions, matches } = useMemo(() => {
    if (!term) return { suggestions: [] as string[], matches: [] as typeof products };
    const m = products.filter((p) => `${p.title} ${p.brand} ${p.subcategory}`.toLowerCase().includes(term));
    // phrase suggestions built from matching product titles ("wireless" → "Wireless Earbuds", "Wireless Mouse"…)
    const phrases = new Set<string>();
    for (const p of m) {
      const words = p.title.replace(/[()"]/g, '').split(' ');
      const i = words.findIndex((w) => w.toLowerCase().startsWith(term.split(' ')[0]));
      phrases.add(words.slice(Math.max(0, i), Math.max(0, i) + 2).join(' '));
      if (phrases.size >= 5) break;
    }
    return { suggestions: [...phrases], matches: m.slice(0, 4) };
  }, [term, products]);

  const go = (value: string) => {
    const v = value.trim();
    if (!v) return;
    pushSearch(v);
    setOpen(false);
    inputRef.current?.blur();
    onDone?.();
    nav(`/search?q=${encodeURIComponent(v)}`);
  };
  const options = term ? suggestions : [...recentSearches, ...TRENDING];

  return (
    <div ref={ref} className={cn('relative', className)}>
      <form role="search" onSubmit={(e) => { e.preventDefault(); go(active >= 0 ? options[active] : q); }} className="flex h-11 items-stretch overflow-hidden rounded-xl border-2 border-brand-600 bg-white focus-within:ring-4 focus-within:ring-brand-500/15">
        <label htmlFor="global-search" className="sr-only">Search B-Bazar</label>
        <input
          ref={inputRef}
          id="global-search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(options.length - 1, a + 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="Search for products, brands and categories..."
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-suggestions"
          className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-slate-400"
        />
        {q && <button type="button" onClick={() => { setQ(''); inputRef.current?.focus(); }} className="px-2 text-slate-400 hover:text-ink" aria-label="Clear search"><X className="h-4 w-4" /></button>}
        <button type="submit" className="grid w-14 place-items-center bg-brand-600 text-white transition hover:bg-brand-700" aria-label="Search"><Search className="h-5 w-5" /></button>
      </form>

      {open && (
        <div id="search-suggestions" className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-pop animate-fade-in">
          {!term ? (
            <div className="space-y-3 p-2">
              {recentSearches.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Recent searches</p><button type="button" onClick={clearSearches} className="text-xs font-semibold text-brand-600 hover:underline">Clear</button></div>
                  <ul>{recentSearches.map((s, i) => <li key={s}><button type="button" onClick={() => go(s)} className={cn('flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted', active === i && 'bg-muted')}><Clock className="h-4 w-4 text-slate-400" />{s}</button></li>)}</ul>
                </div>
              )}
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Trending searches</p>
                <div className="flex flex-wrap gap-1.5">{TRENDING.map((s, i) => <button key={s} type="button" onClick={() => go(s)} className={cn('inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-medium hover:bg-brand-50 hover:text-brand-700', active === recentSearches.length + i && 'bg-brand-50 text-brand-700')}><TrendingUp className="h-3 w-3" />{s}</button>)}</div>
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Popular categories</p>
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {categories.slice(0, 6).map((c) => (
                    <Link key={c.slug} to={`/category/${c.slug}`} onClick={() => { setOpen(false); onDone?.(); }} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted">
                      <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: `${c.color}14`, color: c.color }}><DynamicIcon name={c.icon} className="h-4 w-4" /></span>{c.short}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Suggested for you</p>
                <ProductRows items={products.filter((p) => p.tags.includes('trending')).slice(0, 3)} onPick={() => { setOpen(false); onDone?.(); }} />
              </div>
            </div>
          ) : (
            <div className="p-1">
              {suggestions.length > 0 ? (
                <ul className="mb-2">
                  {suggestions.map((s, i) => (
                    <li key={s}>
                      <button type="button" onClick={() => go(s)} className={cn('flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted', active === i && 'bg-muted')}>
                        <Search className="h-4 w-4 text-slate-400" /><Highlight text={s} term={term} /><ArrowUpRight className="ml-auto h-3.5 w-3.5 text-slate-300" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p className="px-2 py-3 text-sm text-ink-soft">No suggestions for “{q}”. Press Enter to search anyway.</p>}
              {matches.length > 0 && <><p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Products</p><ProductRows items={matches} onPick={() => { setOpen(false); onDone?.(); }} /></>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function Highlight({ text, term }: { text: string; term: string }) {
  const i = text.toLowerCase().indexOf(term);
  if (i < 0) return <span>{text}</span>;
  return <span>{text.slice(0, i)}<b className="text-brand-700">{text.slice(i, i + term.length)}</b>{text.slice(i + term.length)}</span>;
}
function ProductRows({ items, onPick }: { items: ReturnType<typeof useLiveProducts>; onPick: () => void }) {
  return (
    <ul>
      {items.map((p) => (
        <li key={p.id}>
          <Link to={`/product/${p.id}`} onClick={onPick} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted">
            <SmartImage src={p.images[0].replace('w=900', 'w=120')} alt={p.title} icon={p.icon} className="h-10 w-10 shrink-0 rounded-md" />
            <span className="min-w-0 flex-1 truncate text-sm">{p.title}</span>
            <span className="text-sm font-bold tabular-nums">{formatPKR(p.price)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
