import { Outlet, useLocation } from 'react-router-dom';
import { CustomerHeader } from '@/components/navigation/CustomerHeader';
import { Footer } from '@/components/navigation/Footer';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { DemoPanel } from '@/components/common/DemoPanel';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export default function CustomerLayout() {
  const { pathname } = useLocation();
  const bare = ['/login', '/register', '/forgot-password'].includes(pathname);
  const hideBottom = pathname.startsWith('/product/') || pathname === '/checkout' || pathname === '/cart';
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only z-[100] rounded-lg bg-brand-600 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <ScrollToTop />
      {!bare && <CustomerHeader />}
      <main id="main" key={pathname} className="flex-1 animate-fade-in pb-20 md:pb-0">
        <Outlet />
      </main>
      {!bare && <Footer />}
      {!bare && !hideBottom && <MobileBottomNav />}
      <DemoPanel />
    </div>
  );
}
