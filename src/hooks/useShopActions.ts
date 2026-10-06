import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import type { Product } from '@/types';

export function useShopActions() {
  const add = useCart((s) => s.add);
  const toggle = useWishlist((s) => s.toggle);
  const nav = useNavigate();
  const addToCart = useCallback((p: Product, qty = 1, variant?: string) => {
    if (p.stock <= 0) { toast.error(`${p.title} is out of stock.`); return false; }
    add(p.id, qty, variant ?? p.colors?.[0] ?? p.sizes?.[0] ?? p.storage?.[0]);
    toast.success('Product added to cart.', { description: p.title, action: { label: 'View cart', onClick: () => nav('/cart') } });
    return true;
  }, [add, nav]);
  const buyNow = useCallback((p: Product, qty = 1, variant?: string) => { if (addToCart(p, qty, variant)) nav('/cart'); }, [addToCart, nav]);
  const toggleWish = useCallback((p: Product) => {
    const on = toggle(p.id);
    if (on) toast.success('Added to wishlist.', { description: p.title });
    else toast('Removed from wishlist.', { description: p.title });
  }, [toggle]);
  return { addToCart, buyNow, toggleWish };
}
