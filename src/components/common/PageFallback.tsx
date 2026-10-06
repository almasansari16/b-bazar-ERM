import { Skeleton } from '@/components/ui/Display';
export function PageFallback() {
  return (
    <div className="container-x space-y-4 py-8" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}</div>
    </div>
  );
}
