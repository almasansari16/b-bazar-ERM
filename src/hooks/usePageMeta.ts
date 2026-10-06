import { useEffect } from 'react';
/** Sets document title + meta description (SEO-friendly per-route metadata). */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | B-Bazar` : 'B-Bazar — Everything You Need. All in One Bazar.';
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
      m.setAttribute('content', description);
    }
  }, [title, description]);
}
