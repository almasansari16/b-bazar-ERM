import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, Megaphone, Settings2, CheckCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useMarket } from '@/store/useMarket';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Tabs, EmptyState, Pagination } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { timeAgo } from '@/utils/format';

type Tab = 'all' | 'order' | 'promotion' | 'system';
const ICON = { order: Package, promotion: Megaphone, system: Settings2 };
const TONE = { order: 'bg-brand-50 text-brand-600', promotion: 'bg-amber-50 text-amber-600', system: 'bg-slate-100 text-slate-600' };

export default function Notifications() {
  usePageMeta('Notifications');
  const all = useMarket((s) => s.notifications);
  const mark = useMarket((s) => s.markNotification);
  const markAll = useMarket((s) => s.markAllNotifications);
  const [tab, setTab] = useState<Tab>('all');
  const [page, setPage] = useState(1);
  const nav = useNavigate();
  const list = all.filter((n) => tab === 'all' || n.type === tab);
  const pages = Math.ceil(list.length / 10);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-extrabold">Notifications</h1><Button variant="outline" size="sm" onClick={markAll}><CheckCheck className="h-4 w-4" />Mark all as read</Button></div>
      <div className="rounded-2xl border border-line bg-white">
        <Tabs className="px-3" value={tab} onChange={(t) => { setTab(t); setPage(1); }} tabs={[{ value: 'all', label: 'All', count: all.filter((n) => !n.read).length || undefined }, { value: 'order', label: 'Orders' }, { value: 'promotion', label: 'Promotions' }, { value: 'system', label: 'System' }]} />
        {list.length === 0 ? <EmptyState icon={<Bell className="h-7 w-7" />} title="No notifications" message="You're all caught up." /> : (
          <ul className="divide-y divide-line">
            {list.slice((page - 1) * 10, page * 10).map((n) => {
              const Icon = ICON[n.type];
              return (
                <li key={n.id}><button type="button" onClick={() => { mark(n.id); if (n.link) nav(n.link); }} className={cn('flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-slate-50', !n.read && 'bg-brand-50/40')}>
                  <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', TONE[n.type])}><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm font-semibold">{n.title}{!n.read && <span className="h-2 w-2 rounded-full bg-brand-600" aria-label="Unread" />}</span><span className="block text-sm text-ink-soft">{n.body}</span><span className="text-xs text-slate-400">{timeAgo(n.date)}</span></span>
                </button></li>
              );
            })}
          </ul>
        )}
        {pages > 1 && <div className="flex justify-center border-t border-line p-3"><Pagination page={page} pages={pages} onChange={setPage} /></div>}
      </div>
    </div>
  );
}
