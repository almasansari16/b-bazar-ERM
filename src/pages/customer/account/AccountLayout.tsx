import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, CreditCard, Bell, MessageSquare, Ticket, Gift, RotateCcw, LifeBuoy, LogOut, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useAuth } from '@/store/useAuth';
import { useMarket } from '@/store/useMarket';
import { Avatar } from '@/components/ui/Avatar';

export const ACCOUNT_NAV = [
  { to: '/account', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/account/profile', label: 'My Profile', icon: User },
  { to: '/orders', label: 'My Orders', icon: Package },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/payments', label: 'Payment Methods', icon: CreditCard },
  { to: '/account/notifications', label: 'Notifications', icon: Bell },
  { to: '/account/messages', label: 'Messages', icon: MessageSquare },
  { to: '/account/coupons', label: 'Coupons', icon: Ticket },
  { to: '/account/rewards', label: 'Rewards', icon: Gift },
  { to: '/account/returns', label: 'Returns & Refunds', icon: RotateCcw },
  { to: '/help', label: 'Help Center', icon: LifeBuoy },
];

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const unread = useMarket((s) => s.notifications.filter((n) => !n.read).length);
  const msgs = useMarket((s) => s.conversations.reduce((n, c) => n + c.unread, 0));
  const nav = useNavigate();
  if (!user) return <Navigate to="/login?next=/account" replace />;
  return (
    <div className="container-x py-5 sm:py-6">
      <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-line bg-white p-3 lg:sticky lg:top-[140px]" aria-label="Account navigation">
          <div className="flex items-center gap-3 border-b border-line px-2 pb-3 pt-1">
            <Avatar name={user.name} />
            <div className="min-w-0"><p className="truncate font-bold">{user.name}</p><p className="truncate text-xs text-ink-soft">{user.email}</p></div>
          </div>
          <nav className="no-scrollbar -mx-1 mt-2 flex gap-1 overflow-x-auto px-1 lg:mx-0 lg:block lg:space-y-0.5 lg:px-0">
            {ACCOUNT_NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'bg-brand-50 text-brand-700' : 'text-ink hover:bg-muted')}>
                <Icon className="h-4 w-4" />{label}
                {label === 'Notifications' && unread > 0 && <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{unread}</span>}
                {label === 'Messages' && msgs > 0 && <span className="ml-auto rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">{msgs}</span>}
              </NavLink>
            ))}
            <button type="button" onClick={() => { logout(); toast.success('Signed out'); nav('/'); }} className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 lg:w-full"><LogOut className="h-4 w-4" />Logout</button>
          </nav>
        </aside>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}
