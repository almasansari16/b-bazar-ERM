import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Heart, Package, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWishlist } from '@/store/useWishlist';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/shop', label: 'Categories', icon: LayoutGrid },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/account', label: 'Account', icon: User },
];
export function MobileBottomNav() {
  const wish = useWishlist((s) => s.ids.length);
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-safe backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => cn('relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold', isActive ? 'text-brand-600' : 'text-ink-soft')}>
              {({ isActive }) => (<>
                {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-600" />}
                <span className="relative"><Icon className={cn('h-[22px] w-[22px]', isActive && to === '/wishlist' && 'fill-brand-600')} />
                  {to === '/wishlist' && wish > 0 && <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] text-white">{wish}</span>}
                </span>{label}
              </>)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
