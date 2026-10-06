import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, Menu, Search, Bell, LogOut, ExternalLink, type LucideIcon, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { LogoMark } from '@/components/common/Logo';
import { Tooltip, Drawer, Dropdown, MenuItem } from '@/components/ui/Overlay';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/store/useAuth';
import { useMarket } from '@/store/useMarket';
import { DemoPanel } from '@/components/common/DemoPanel';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { timeAgo } from '@/utils/format';
import type { Notification, Role } from '@/types';

export interface NavItem { to: string; label: string; icon: LucideIcon; badge?: number }
export interface NavGroup { title?: string; items: NavItem[] }

export function DashboardShell({ role, product, groups, collapsed, setCollapsed, notifications, headerExtra, profileName, profileSub, accent = 'brand' }: {
  role: Role; product: string; groups: NavGroup[]; collapsed: boolean; setCollapsed: (v: boolean) => void; notifications: Notification[];
  headerExtra?: ReactNode; profileName: string; profileSub: string; accent?: 'brand' | 'dark';
}) {
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState('');
  const { user, loginAs, logout } = useAuth();
  const markAll = useMarket((s) => s.markAllNotifications);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const unread = notifications.filter((n) => !n.read).length;

  if (user?.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-lift">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Lock className="h-7 w-7" /></div>
          <h1 className="text-xl font-extrabold">{product} requires a {role} account</h1>
          <p className="mt-2 text-sm text-ink-soft">{user ? `You're signed in as ${user.name} (${user.role}).` : 'You are not signed in.'} Use the demo {role} account to continue.</p>
          <div className="mt-6 flex flex-col gap-2">
            <Button size="lg" onClick={() => { loginAs(role); toast.success(`Signed in as demo ${role}`); }}>Continue as demo {role}</Button>
            <Link to="/login" className="text-sm font-semibold text-brand-600 hover:underline">Sign in with credentials</Link>
            <Link to="/" className="text-sm text-ink-soft hover:underline">Back to B-Bazar</Link>
          </div>
        </div>
      </div>
    );
  }

  const sidebar = (isMobile: boolean) => (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-4', collapsed && !isMobile && 'justify-center px-0')}>
        <Link to={`/${role}/dashboard`} className="flex items-center gap-2.5" aria-label={`${product} home`}>
          <LogoMark mono className="h-9 w-9" />
          {(!collapsed || isMobile) && <span className="leading-tight"><span className="block text-[15px] font-extrabold text-white">B-Bazar</span><span className="block text-[11px] font-medium text-white/60">{product}</span></span>}
        </Link>
      </div>
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4" aria-label={`${product} navigation`}>
        {groups.map((g, gi) => (
          <div key={gi} className="mb-4">
            {g.title && (!collapsed || isMobile) && <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[.14em] text-white/40">{g.title}</p>}
            {g.title && collapsed && !isMobile && gi > 0 && <div className="mx-3 mb-2 h-px bg-white/10" />}
            <ul className="space-y-0.5">
              {g.items.map(({ to, label, icon: Icon, badge }) => (
                <li key={to}>
                  <Tooltip label={label} side="right" disabled={!collapsed || isMobile}>
                    <NavLink to={to} onClick={() => setMobile(false)} aria-label={collapsed && !isMobile ? label : undefined}
                      className={({ isActive }) => cn('group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition',
                        collapsed && !isMobile ? 'w-10 justify-center px-0' : 'w-full',
                        isActive ? 'bg-white text-brand-800 shadow-sm' : 'text-white/75 hover:bg-white/10 hover:text-white')}>
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {(!collapsed || isMobile) && <span className="flex-1 truncate">{label}</span>}
                      {(!collapsed || isMobile) && !!badge && <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-ink">{badge}</span>}
                    </NavLink>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {!isMobile && (
        <button type="button" onClick={() => setCollapsed(!collapsed)} className="flex h-12 items-center justify-center gap-2 border-t border-white/10 text-xs font-semibold text-white/60 hover:text-white" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" />Collapse</>}
        </button>
      )}
    </div>
  );

  const bg = accent === 'dark' ? 'bg-[#16133A]' : 'bg-brand-800';
  return (
    <div className="min-h-screen bg-canvas">
      <ScrollToTop />
      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 lg:block', bg, collapsed ? 'w-[72px]' : 'w-64')}>{sidebar(false)}</aside>
      <Drawer open={mobile} onClose={() => setMobile(false)} side="left" width="max-w-[280px]">
        <div className={cn('h-full', bg)}>{sidebar(true)}</div>
      </Drawer>

      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[72px]' : 'lg:pl-64')}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-muted lg:hidden" onClick={() => setMobile(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
          <form className="hidden max-w-md flex-1 md:block" onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav(`/${role}/${role === 'seller' ? 'products' : 'orders'}?q=${encodeURIComponent(q)}`); }} role="search">
            <label className="relative block">
              <span className="sr-only">Search {product}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={role === 'seller' ? 'Search products, orders, customers…' : 'Search orders, sellers, products…'} className="h-10 w-full rounded-lg border border-line bg-slate-50 pl-9 pr-16 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10" />
              <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-white px-1.5 text-[10px] text-ink-soft lg:block">Enter</kbd>
            </label>
          </form>
          <div className="ml-auto flex items-center gap-2">
            {headerExtra}
            <Dropdown trigger={({ toggle }) => (
              <button type="button" onClick={toggle} className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-muted" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">{unread}</span>}
              </button>
            )} className="w-[340px] max-w-[calc(100vw-2rem)] p-0">
              {(close) => (
                <div>
                  <div className="flex items-center justify-between border-b border-line px-4 py-3"><p className="text-sm font-bold">Notifications</p><button type="button" onClick={markAll} className="text-xs font-semibold text-brand-600 hover:underline">Mark all read</button></div>
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 && <li className="px-4 py-8 text-center text-sm text-ink-soft">You're all caught up.</li>}
                    {notifications.slice(0, 8).map((n) => (
                      <li key={n.id}><button type="button" onClick={() => { close(); n.link && nav(n.link); }} className="flex w-full gap-3 border-b border-line/60 px-4 py-3 text-left hover:bg-muted">
                        <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand-600')} />
                        <span className="min-w-0"><span className="block text-sm font-semibold">{n.title}</span><span className="block text-xs text-ink-soft">{n.body}</span><span className="text-[11px] text-slate-400">{timeAgo(n.date)}</span></span>
                      </button></li>
                    ))}
                  </ul>
                </div>
              )}
            </Dropdown>
            <Dropdown trigger={({ toggle }) => (
              <button type="button" onClick={toggle} className="flex items-center gap-2.5 rounded-lg p-1 pr-2 hover:bg-muted" aria-label="Profile menu">
                <Avatar name={profileName} size="sm" square color={role === 'seller' ? '#4338CA' : '#7C3AED'} />
                <span className="hidden text-left leading-tight sm:block"><span className="block text-sm font-bold">{profileName}</span><span className="block text-[11px] text-ink-soft">{profileSub}</span></span>
              </button>
            )}>
              {(close) => (<>
                <MenuItem icon={<ExternalLink className="h-4 w-4" />} onClick={() => { close(); nav('/'); }}>View marketplace</MenuItem>
                <MenuItem icon={<LogOut className="h-4 w-4" />} danger onClick={() => { close(); logout(); nav('/login'); toast.success('Signed out'); }}>Sign out</MenuItem>
              </>)}
            </Dropdown>
          </div>
        </header>
        <main key={pathname} className="mx-auto w-full max-w-[1480px] animate-fade-in px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <DemoPanel />
    </div>
  );
}
