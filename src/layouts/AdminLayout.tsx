import { LayoutDashboard, ShoppingCart, Package, FolderTree, Users, Store, CreditCard, Percent, Undo2, Star, Megaphone, Ticket, BarChart3, FileText, LifeBuoy, Settings, UserCog } from 'lucide-react';
import { DashboardShell, type NavGroup } from './DashboardShell';
import { useUI } from '@/store/useUI';
import { useMarket } from '@/store/useMarket';
import { useAuth } from '@/store/useAuth';
import { Badge } from '@/components/ui/Badge';

export default function AdminLayout() {
  const { adminSidebarCollapsed, setCollapsed } = useUI();
  const user = useAuth((s) => s.user);
  const pendingProducts = useMarket((s) => s.products.filter((p) => p.status === 'pending').length);
  const pendingSellers = useMarket((s) => s.sellers.filter((p) => p.status === 'pending').length);
  const openTickets = useMarket((s) => s.tickets.filter((t) => t.status === 'open' || t.status === 'escalated').length);
  const refunds = useMarket((s) => s.returns.filter((r) => r.status === 'requested' || r.status === 'refund_pending').length);
  const notes = useMarket((s) => s.adminNotifications);
  const groups: NavGroup[] = [
    { title: 'Marketplace', items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/products', label: 'Products', icon: Package, badge: pendingProducts },
      { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    ] },
    { title: 'Users', items: [
      { to: '/admin/customers', label: 'Customers', icon: Users },
      { to: '/admin/sellers', label: 'Sellers', icon: Store, badge: pendingSellers },
      { to: '/admin/users', label: 'Admin Users', icon: UserCog },
    ] },
    { title: 'Finance', items: [
      { to: '/admin/payments', label: 'Payments', icon: CreditCard },
      { to: '/admin/commissions', label: 'Commissions', icon: Percent },
      { to: '/admin/refunds', label: 'Returns & Refunds', icon: Undo2, badge: refunds },
    ] },
    { title: 'Growth', items: [
      { to: '/admin/promotions', label: 'Promotions', icon: Megaphone },
      { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
      { to: '/admin/reviews', label: 'Reviews', icon: Star },
      { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    ] },
    { title: 'System', items: [
      { to: '/admin/content', label: 'Content', icon: FileText },
      { to: '/admin/support', label: 'Support', icon: LifeBuoy, badge: openTickets },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ] },
  ];
  const base = [
    { id: 'an1', type: 'system' as const, title: `${pendingSellers} sellers awaiting approval`, body: 'Review KYC documents and approve new stores.', date: new Date(Date.now() - 1.8e6).toISOString(), read: false, link: '/admin/sellers' },
    { id: 'an2', type: 'system' as const, title: `${pendingProducts} products in moderation`, body: 'Listings are waiting for content review.', date: new Date(Date.now() - 5.4e6).toISOString(), read: false, link: '/admin/products' },
    { id: 'an3', type: 'order' as const, title: 'Refund spike in Fashion', body: 'Return requests up 18% week over week.', date: new Date(Date.now() - 864e5).toISOString(), read: true, link: '/admin/refunds' },
  ];
  return (
    <DashboardShell role="admin" product="Administration" accent="dark" groups={groups} collapsed={adminSidebarCollapsed} setCollapsed={(v) => setCollapsed('admin', v)}
      notifications={[...notes, ...base]} profileName={user?.name ?? 'Admin'} profileSub="Super Admin"
      headerExtra={<Badge tone="success" dot className="hidden sm:inline-flex">All systems operational</Badge>} />
  );
}
