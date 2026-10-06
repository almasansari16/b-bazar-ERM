import type { ReactNode } from 'react';
import type { Product } from '@/types';
import { ProductCard, ProductCardSkeleton, type CardVariant } from './ProductCard';
import { useSellerMap } from '@/hooks/useCatalog';
import { cn } from '@/utils/cn';

export function ProductGrid({ products, loading, variant = 'default', cols = 'default', highlightTag, skeletons = 8, empty }: {
  products: Product[]; loading?: boolean; variant?: CardVariant; cols?: 'default' | 'wide' | 'five'; highlightTag?: 'new' | 'bestseller' | 'top'; skeletons?: number; empty?: ReactNode;
}) {
  const sellers = useSellerMap();
  const grid = variant === 'list' ? 'grid-cols-1' : cols === 'five' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : cols === 'wide' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4';
  if (!loading && products.length === 0 && empty) return <>{empty}</>;
  return (
    <div className={cn('grid gap-3 sm:gap-4', grid)}>
      {loading
        ? Array.from({ length: skeletons }).map((_, i) => <ProductCardSkeleton key={i} variant={variant} />)
        : products.map((p) => <ProductCard key={p.id} product={p} seller={sellers[p.sellerId]} variant={variant} highlightTag={highlightTag} />)}
    </div>
  );
}

/** Horizontally scrollable rail (snap on mobile). */
export function ProductRail({ products, variant = 'default', highlightTag, loading }: { products: Product[]; variant?: CardVariant; highlightTag?: 'new' | 'bestseller' | 'top'; loading?: boolean }) {
  const sellers = useSellerMap();
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:px-0">
      {(loading ? Array.from({ length: 6 }) : products).map((p, i) => (
        <div key={loading ? i : (p as Product).id} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-[23%] lg:w-[calc((100%-5*1rem)/6)]">
          {loading ? <ProductCardSkeleton variant={variant} /> : <ProductCard product={p as Product} seller={sellers[(p as Product).sellerId]} variant={variant} highlightTag={highlightTag} />}
        </div>
      ))}
    </div>
  );
}
