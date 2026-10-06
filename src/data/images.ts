/** Unsplash photo helper. Images always render through <SmartImage>, which falls back
 *  to a branded illustration if the remote photo cannot load (offline, blocked, removed). */
export const unsplash = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
