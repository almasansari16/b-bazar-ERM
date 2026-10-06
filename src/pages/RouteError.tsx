import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button, LinkButton } from '@/components/ui/Button';
import { Logo } from '@/components/common/Logo';

/** "Something went wrong" — catches render errors in any route. */
export function RouteError() {
  const err = useRouteError();
  const msg = isRouteErrorResponse(err) ? `${err.status} ${err.statusText}` : err instanceof Error ? err.message : 'Unknown error';
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-500"><AlertTriangle className="h-8 w-8" /></div>
        <h1 className="text-2xl font-extrabold">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-soft">We hit an unexpected problem loading this page. Your cart and orders are safe.</p>
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 font-mono text-xs text-ink-soft">{msg}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4" />Try again</Button>
          <LinkButton to="/" variant="outline">Go to homepage</LinkButton>
        </div>
      </div>
    </div>
  );
}
