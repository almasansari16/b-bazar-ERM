import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, User, MapPin, ChevronDown, LayoutGrid, Package, Bell, LogOut, MessageSquare, Search, Store, Shield, Menu, Check, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Logo } from '@/components/common/Logo';
import { SearchBar } from './SearchBar';
import { MegaMenu } from './MegaMenu';
import { useCart, cartCount } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useAuth } from '@/store/useAuth';
import { useUI } from '@/store/useUI';
import { useMarket } from '@/store/useMarket';
import { Dropdown, MenuItem, Drawer, Modal } from '@/components/ui/Overlay';
import { Avatar } from '@/components/ui/Avatar';
import { CITIES, deliveryDays } from '@/utils/delivery';
import { toast } from 'sonner';
import { DynamicIcon } from '@/components/common/DynamicIcon';

const NAV = [
  { label: 'Deals', to: '/shop?sort=discount' },
  { label: 'Flash Sale', to: '/shop?tag=flash', hot: true },
  { label: 'New Arrivals', to: '/shop?tag=new' },
  { label: 'Best Sellers', to: '/shop?tag=bestseller' },
  { label: 'Brands', to: '/shop?view=brands' },
  { label: 'Grocery', to: '/category/grocery' },
  { label: 'Fashion', to: '/category/fashion' },
  { label: 'Electronics', to: '/category/electronics' },
  { label: 'Home & Living', to: '/category/home-living' },
];

export function CustomerHeader() {
  const count = useCart(cartCount);
  const lastAdded = useCart((s) => s.lastAdded);
  const wish = useWishlist((s) => s.ids.length);
  const { user, logout } = useAuth();
  const { city, setCity } = useUI();
  const unread = useMarket((s) => s.notifications.filter((n) => !n.read).length);
  const categories = useMarket((s) => s.categories);
  const nav = useNavigate();
  const [mega, setMega] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { if (!lastAdded) return; setBump(true); const t = setTimeout(() => setBump(false), 450); return () => clearTimeout(t); }, [lastAdded]);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 40); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);

  return (
    <>
      {/* Utility bar */}
      <div className="hidden bg-brand-900 text-[12px] text-white/80 md:block">
        <div className="container-x flex h-8 items-center justify-between">
          <p>Welcome to <b className="text-white">B-Bazar</b> — Everything You Need. All in One Bazar.</p>
          <nav aria-label="Utility" className="flex items-center gap-5">
            <Link to="/register?seller=1" className="hover:text-white">Sell on B-Bazar</Link>
            <Link to="/help" className="hover:text-white">Help Center</Link>
            <Link to="/orders" className="hover:text-white">Track Order</Link>
            <Link to="/page/download-app" className="hover:text-white">Download App</Link>
          </nav>
        </div>
      </div>

      <header className={cn('sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur transition-shadow', scrolled && 'shadow-card')}>
        <div className="container-x flex h-16 items-center gap-3 md:h-[72px] md:gap-6">
          <button type="button" className="-ml-1 grid h-10 w-10 place-items-center rounded-lg hover:bg-muted lg:hidden" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu className="h-5 w-5" /></button>
          <Logo className="shrink-0" />
          <SearchBar className="hidden flex-1 md:block" />

          <button type="button" onClick={() => setCityOpen(true)} className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted xl:flex" aria-label={`Deliver to ${city}. Change location`}>
            <MapPin className="h-5 w-5 text-brand-600" />
            <span className="leading-tight"><span className="block text-[11px] text-ink-soft">Deliver to</span><span className="flex items-center gap-0.5 text-sm font-bold">{city}<ChevronDown className="h-3.5 w-3.5" /></span></span>
          </button>

          <div className="ml-auto flex items-center gap-0.5 md:ml-0 md:gap-1">
            <button type="button" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-muted md:hidden" aria-label="Search" onClick={() => setMobileSearch(true)}><Search className="h-5 w-5" /></button>
            <IconLink to="/wishlist" label="Wishlist" count={wish} className="hidden sm:grid"><Heart className="h-[22px] w-[22px]" /></IconLink>
            {user ? (
              <Dropdown trigger={({ toggle }) => (
                <button type="button" onClick={toggle} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted" aria-label="Account menu">
                  <Avatar name={user.name} size="sm" />
                  <span className="hidden text-left leading-tight lg:block"><span className="block text-[11px] text-ink-soft">Hello,</span><span className="block text-sm font-bold">{user.name.split(' ')[0]}</span></span>
                </button>
              )}>
                {(close) => (
                  <div className="w-56">
                    <div className="border-b border-line px-3 pb-2.5 pt-1.5"><p className="text-sm font-bold">{user.name}</p><p className="truncate text-xs text-ink-soft">{user.email}</p></div>
                    <div className="py-1">
                      <MenuItem icon={<User className="h-4 w-4" />} onClick={() => { close(); nav('/account'); }}>My Account</MenuItem>
                      <MenuItem icon={<Package className="h-4 w-4" />} onClick={() => { close(); nav('/orders'); }}>My Orders</MenuItem>
                      <MenuItem icon={<Bell className="h-4 w-4" />} onClick={() => { close(); nav('/account/notifications'); }}>Notifications {unread > 0 && <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{unread}</span>}</MenuItem>
                      <MenuItem icon={<MessageSquare className="h-4 w-4" />} onClick={() => { close(); nav('/account/messages'); }}>Messages</MenuItem>
                      {user.role === 'seller' && <MenuItem icon={<Store className="h-4 w-4" />} onClick={() => { close(); nav('/seller/dashboard'); }}>Seller Center</MenuItem>}
                      {user.role === 'admin' && <MenuItem icon={<Shield className="h-4 w-4" />} onClick={() => { close(); nav('/admin/dashboard'); }}>Admin Console</MenuItem>}
                    </div>
                    <div className="border-t border-line pt-1"><MenuItem danger icon={<LogOut className="h-4 w-4" />} onClick={() => { close(); logout(); toast.success('Signed out'); nav('/'); }}>Sign out</MenuItem></div>
                  </div>
                )}
              </Dropdown>
            ) : (
              <Link to="/login" className="flex items-center gap-2 rounded-lg p-2 text-sm font-semibold hover:bg-muted"><User className="h-[22px] w-[22px]" /><span className="hidden lg:inline">Sign in</span></Link>
            )}
            <IconLink to="/cart" label="Cart" count={count} bump={bump}><ShoppingCart className="h-[22px] w-[22px]" /></IconLink>
          </div>
        </div>
        {/* Mobile: tap-to-search bar + location */}
        <div className="container-x pb-3 md:hidden">
          <button type="button" onClick={() => setMobileSearch(true)} className="flex h-10 w-full items-center gap-2 rounded-xl bg-muted px-3 text-left text-sm text-slate-500"><Search className="h-4 w-4" />Search products, brands…</button>
          <button type="button" onClick={() => setCityOpen(true)} className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft"><MapPin className="h-3.5 w-3.5 text-brand-600" />Deliver to <b className="text-ink">{city}</b><ChevronDown className="h-3 w-3" /></button>
        </div>
        {/* Category nav */}
        <nav aria-label="Shop navigation" className="hidden border-t border-line lg:block" onMouseLeave={() => setMega(false)}>
          <div className="container-x relative flex h-11 items-center gap-1">
            <button type="button" onMouseEnter={() => setMega(true)} onClick={() => setMega((v) => !v)} aria-expanded={mega}
              className={cn('flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-bold transition', mega ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100')}>
              <LayoutGrid className="h-4 w-4" />Categories<ChevronDown className={cn('h-3.5 w-3.5 transition', mega && 'rotate-180')} />
            </button>
            {NAV.map((n) => (
              <NavLink key={n.label} to={n.to} onMouseEnter={() => setMega(false)} className="flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-ink hover:bg-muted hover:text-brand-700">
                {n.hot && <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />}{n.label}
              </NavLink>
            ))}
            {mega && <MegaMenu onClose={() => setMega(false)} />}
          </div>
        </nav>
      </header>

      {/* Mobile search sheet */}
      <Drawer open={mobileSearch} onClose={() => setMobileSearch(false)} side="bottom" title="Search">
        <div className="min-h-[60vh] p-4"><SearchBar autoFocus onDone={() => setMobileSearch(false)} /></div>
      </Drawer>

      {/* Mobile menu */}
      <Drawer open={mobileMenu} onClose={() => setMobileMenu(false)} side="left" title="Browse B-Bazar">
        <div className="p-3">
          <p className="px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Shop by category</p>
          <ul>
            {categories.filter((c) => c.enabled).sort((a, b) => a.order - b.order).map((c) => (
              <li key={c.slug}><Link to={`/category/${c.slug}`} onClick={() => setMobileMenu(false)} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted">
                <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${c.color}14`, color: c.color }}><DynamicIcon name={c.icon} className="h-4 w-4" /></span>{c.name}</Link></li>
            ))}
          </ul>
          <p className="px-2 pb-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Discover</p>
          {NAV.slice(0, 5).map((n) => <Link key={n.label} to={n.to} onClick={() => setMobileMenu(false)} className="block rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted">{n.label}</Link>)}
          <div className="mt-4 border-t border-line pt-3">
            <Link to="/register?seller=1" onClick={() => setMobileMenu(false)} className="block rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted">Sell on B-Bazar</Link>
            <Link to="/help" onClick={() => setMobileMenu(false)} className="block rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted">Help Center</Link>
          </div>
        </div>
      </Drawer>

      <Modal open={cityOpen} onClose={() => setCityOpen(false)} title="Choose your delivery city" description="Delivery times and fees are estimated for your city.">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CITIES.map((c) => {
            const [a, b] = deliveryDays(c);
            return (
              <li key={c}>
                <button type="button" onClick={() => { setCity(c); setCityOpen(false); toast.success(`Delivering to ${c}`); }}
                  className={cn('flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition', c === city ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-slate-300')}>
                  <span><span className="block text-sm font-semibold">{c}</span><span className="text-xs text-ink-soft">{a}–{b} days delivery</span></span>
                  {c === city && <Check className="h-4 w-4 text-brand-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}

function IconLink({ to, label, count, children, className, bump }: { to: string; label: string; count: number; children: React.ReactNode; className?: string; bump?: boolean }) {
  return (
    <Link to={to} className={cn('relative grid h-10 w-10 place-items-center rounded-lg hover:bg-muted', className)} aria-label={`${label}${count ? `, ${count} items` : ''}`}>
      <span className={cn(bump && 'animate-bump')}>{children}</span>
      {count > 0 && <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{count > 99 ? '99+' : count}</span>}
    </Link>
  );
}
