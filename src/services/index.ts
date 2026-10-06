/**
 * Service layer — one module per backend resource. Each method documents the
 * REST endpoint it will call once a backend exists. In mock mode they read and
 * write the persisted marketplace store.
 */
import { useMarket, type PlaceOrderInput } from '@/store/useMarket';
import type { Product, Order, Seller, Category, Customer, Coupon, Promotion } from '@/types';
import { mock, http, USE_MOCK } from './apiClient';
import { lifetimeMarketplace, lifetimeSeller } from '@/utils/analytics';

const db = () => useMarket.getState();

export const productService = {
  /** GET /api/products */
  list: (): Promise<Product[]> => (USE_MOCK ? mock(() => db().products.filter((p) => p.status === 'approved')) : http.get('/api/products')),
  /** GET /api/products/:id */
  get: (id: string): Promise<Product | undefined> => (USE_MOCK ? mock(() => db().products.find((p) => p.id === id || p.slug === id)) : http.get(`/api/products/${id}`)),
};

export const categoryService = {
  /** GET /api/categories */
  list: (): Promise<Category[]> => (USE_MOCK ? mock(() => db().categories) : http.get('/api/categories')),
};

export const sellerService = {
  /** GET /api/sellers */
  list: (): Promise<Seller[]> => (USE_MOCK ? mock(() => db().sellers) : http.get('/api/sellers')),
  /** GET /api/seller/dashboard */
  dashboard: (sellerId: string) => (USE_MOCK ? mock(() => lifetimeSeller(db().orders, sellerId)) : http.get(`/api/seller/dashboard`)),
  /** POST /api/seller/products */
  createProduct: (p: Product) => (USE_MOCK ? mock(() => { db().addProduct(p); return p; }) : http.post<Product>('/api/seller/products', p)),
  /** PUT /api/seller/products/:id */
  updateProduct: (id: string, patch: Partial<Product>) => (USE_MOCK ? mock(() => db().updateProduct(id, patch)) : http.put(`/api/seller/products/${id}`, patch)),
};

export const orderService = {
  /** GET /api/orders */
  list: (): Promise<Order[]> => (USE_MOCK ? mock(() => db().orders) : http.get('/api/orders')),
  /** POST /api/orders */
  place: (input: PlaceOrderInput): Promise<Order> => (USE_MOCK ? mock(() => db().placeOrder(input)) : http.post('/api/orders', input)),
};

export const customerService = {
  /** GET /api/customers */
  list: (): Promise<Customer[]> => (USE_MOCK ? mock(() => db().customers) : http.get('/api/customers')),
};

export const paymentService = {
  /** POST /api/payments/intent — mock: always succeeds (no real gateway) */
  authorize: (method: string, amount: number) => mock({ ok: true, method, amount, reference: `PAY-${Date.now()}` }),
};

export const promotionService = {
  /** GET /api/promotions */
  list: (): Promise<Promotion[]> => (USE_MOCK ? mock(() => db().promotions) : http.get('/api/promotions')),
  /** POST /api/coupons/validate */
  validateCoupon: (code: string): Promise<Coupon | undefined> =>
    USE_MOCK ? mock(() => db().coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase())) : http.post('/api/coupons/validate', { code }),
};

export const adminService = {
  /** GET /api/admin/dashboard */
  dashboard: () => (USE_MOCK ? mock(() => lifetimeMarketplace(db().orders)) : http.get('/api/admin/dashboard')),
  /** POST /api/admin/products/:id/approve */
  approveProduct: (id: string) => (USE_MOCK ? mock(() => db().setProductStatus(id, 'approved')) : http.post(`/api/admin/products/${id}/approve`)),
  /** POST /api/admin/sellers/:id/approve */
  approveSeller: (id: string) => (USE_MOCK ? mock(() => db().setSellerStatus(id, 'approved')) : http.post(`/api/admin/sellers/${id}/approve`)),
};
