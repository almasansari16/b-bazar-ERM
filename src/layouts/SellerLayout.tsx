import { LayoutDashboard, ShoppingCart, Package, Boxes, Users, MessageSquare, Star, Megaphone, BarChart3, Wallet, Store, Settings } from 'lucide-react';
import { DashboardShell, type NavGroup } from './DashboardShell';
import { useUI } from '@/store/useUI';
import { useMarket } from '@/store/useMarket';
import { useAuth } from '@/store/useAuth';
import { Switch } from '@/components/ui/Form';
import { useState } from 'react';
import { toast } from 'sonner';

export const SELLER_ID = 'S1001';

export default function SellerLayout() {
  const { sellerSidebarCollapsed, setCollapsed } = useUI();
  const user = useAuth((s) => s.user);
  const sellerId = user?.sellerId ?? SELLER_ID;
  const seller = useMarket((s) => s.sellers.find((x) => x.id === sellerId));
  const pending = useMarket((s) => s.orders.filter((o) => o.status === 'pending' && o.items.some((i) => i.sellerId === sellerId)).length);
  const unreadMsgs = useMarket((s) => s.sellerInbox.reduce((n, c) => n + c.unread, 0));
  const notes = useMarket((s) => s.sellerNotifications);
  const [online, setOnline] = useState(true);
  const groups: NavGroup[] = [
    { items: [
      { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/seller/orders', label: 'Orders', icon: ShoppingCart, badge: pending },
      { to: '/seller/products', label: 'Products', icon: Package },
      { to: '/seller/inventory', label: 'Inventory', icon: Boxes },
      { to: '/seller/customers', label: 'Customers', icon: Users },
      { to: '/seller/messages', label: 'Messages', icon: MessageSquare, badge: unreadMsgs },
      { to: '/seller/reviews', label: 'Reviews', icon: Star },
    ] },
    { title: 'Grow', items: [
      { to: '/seller/promotions', label: 'Promotions', icon: Megaphone },
      { to: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/seller/payouts', label: 'Payouts', icon: Wallet },
    ] },
    { title: 'Store', items: [
      { to: '/seller/store', label: 'Store', icon: Store },
      { to: '/seller/settings', label: 'Settings', icon: Settings },
    ] },
  ];
  const fallbackNotes = [
    { id: 'sn1', type: 'order' as const, title: '3 orders need packing', body: 'Ship before 6 PM to keep your on-time rate above 95%.', date: new Date(Date.now() - 3.6e6).toISOString(), read: false, link: '/seller/orders' },
    { id: 'sn2', type: 'system' as const, title: 'Low stock alert', body: 'Some products are below their reorder level.', date: new Date(Date.now() - 7.2e6).toISOString(), read: false, link: '/seller/inventory' },
    { id: 'sn3', type: 'promotion' as const, title: 'Join 11.11 Mega Sale', body: 'Nominate products before 1 Nov for extra visibility.', date: new Date(Date.now() - 864e5).toISOString(), read: true, link: '/seller/promotions' },
  ];
  return (
    <DashboardShell role="seller" product="Seller Center" groups={groups} collapsed={sellerSidebarCollapsed} setCollapsed={(v) => setCollapsed('seller', v)}
      notifications={[...notes, ...fallbackNotes]} profileName={seller?.name ?? 'Seller'} profileSub={user?.name ?? ''}
      headerExtra={
        <div className="hidden items-center gap-2 rounded-lg border border-line px-3 py-1.5 sm:flex">
          <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden="true" />
          <span className="text-xs font-semibold">{online ? 'Store online' : 'On holiday'}</span>
          <Switch checked={online} onChange={(v) => { setOnline(v); toast.success(v ? 'Store is now online' : 'Holiday mode on — listings are paused'); }} label="Store status" />
        </div>
      } />
  );
}
