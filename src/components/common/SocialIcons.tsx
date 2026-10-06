/** Simple generic social glyphs (no third-party brand logos). */
const paths: Record<string, string> = {
  facebook: 'M14 8h2V5h-2.5C10.9 5 10 6.6 10 8.7V10H8v3h2v6h3v-6h2.4l.4-3H13V8.9c0-.6.3-.9 1-.9z',
  instagram: 'M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zm4 4.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5zm4.8-1.3a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8z',
  youtube: 'M20.6 8.2c-.2-.9-.9-1.6-1.8-1.8C17.2 6 12 6 12 6s-5.2 0-6.8.4c-.9.2-1.6.9-1.8 1.8C3 9.8 3 12 3 12s0 2.2.4 3.8c.2.9.9 1.6 1.8 1.8 1.6.4 6.8.4 6.8.4s5.2 0 6.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-3.8.4-3.8s0-2.2-.4-3.8zM10.2 14.6V9.4l4.5 2.6-4.5 2.6z',
  x: 'M5 5h3.6l3.7 5 4.2-5H19l-5.4 6.4L19.5 19h-3.6l-4-5.4L7.3 19H5.2l5.7-6.7z',
  linkedin: 'M6.5 9.5h-3V20h3V9.5zM5 4.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5zM20.5 14c0-3-1.6-4.7-4-4.7-1.4 0-2.4.8-2.8 1.5V9.5h-3V20h3v-5.5c0-1.4.6-2.4 1.9-2.4s1.9 1 1.9 2.4V20h3z',
};
export function SocialIcon({ name, className }: { name: keyof typeof paths; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d={paths[name]} fillRule="evenodd" /></svg>;
}
export const SOCIALS = Object.keys(paths) as (keyof typeof paths)[];
