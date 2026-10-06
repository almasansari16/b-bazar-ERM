import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { routes } from '@/routes';

// In-memory routing for the single-file hosted demo; clean URLs everywhere else.
const router = import.meta.env.VITE_ROUTER === 'hash' ? createMemoryRouter(routes) : createBrowserRouter(routes);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: 'Inter, system-ui, sans-serif' } }} />
    </>
  );
}
