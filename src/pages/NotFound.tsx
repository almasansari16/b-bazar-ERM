import { Compass } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { LinkButton } from '@/components/ui/Button';
export default function NotFound() {
  usePageMeta('Page not found');
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-10">
      <div className="text-center">
        <p className="bg-brand-gradient bg-clip-text text-8xl font-extrabold tracking-tighter text-transparent">404</p>
        <div className="mx-auto mt-2 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600"><Compass className="h-6 w-6" /></div>
        <h1 className="mt-4 text-2xl font-extrabold">This aisle doesn't exist</h1>
        <p className="mt-2 text-ink-soft">The page you're looking for may have moved or never existed.</p>
        <div className="mt-6 flex justify-center gap-2"><LinkButton to="/">Go to homepage</LinkButton><LinkButton to="/shop" variant="outline">Browse products</LinkButton></div>
      </div>
    </div>
  );
}
