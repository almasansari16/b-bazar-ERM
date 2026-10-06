import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import CustomerLayout from '@/layouts/CustomerLayout';
import SellerLayout from '@/layouts/SellerLayout';
import AdminLayout from '@/layouts/AdminLayout';
import { PageFallback } from '@/components/common/PageFallback';
import { RouteError } from '@/pages/RouteError';

const L = (f: () => Promise<{ default: React.ComponentType }>) => {
  const C = lazy(f);
  return <Suspense fallback={<PageFallback />}><C /></Suspense>;
};
const wrap = (el: ReactNode) => el;

// Customer
const Home = () => L(() => import('@/pages/customer/Home'));
const Shop = () => L(() => import('@/pages/customer/Shop'));
const ProductDetail = () => L(() => import('@/pages/customer/ProductDetail'));
const StorePage = () => L(() => import('@/pages/customer/Store'));
const Cart = () => L(() => import('@/pages/customer/Cart'));
const Checkout = () => L(() => import('@/pages/customer/Checkout'));
const OrderSuccess = () => L(() => import('@/pages/customer/OrderSuccess'));
const Orders = () => L(() => import('@/pages/customer/Orders'));
const OrderDetail = () => L(() => import('@/pages/customer/OrderDetail'));
const Wishlist = () => L(() => import('@/pages/customer/Wishlist'));
const Account = () => L(() => import('@/pages/customer/account/AccountLayout'));
const AccountHome = () => L(() => import('@/pages/customer/account/AccountHome'));
const Profile = () => L(() => import('@/pages/customer/account/Profile'));
const Addresses = () => L(() => import('@/pages/customer/account/Addresses'));
const Payments = () => L(() => import('@/pages/customer/account/Payments'));
const Notifications = () => L(() => import('@/pages/customer/account/Notifications'));
const Messages = () => L(() => import('@/pages/customer/account/Messages'));
const AccountExtras = () => L(() => import('@/pages/customer/account/Extras'));
const Help = () => L(() => import('@/pages/customer/Help'));
const Info = () => L(() => import('@/pages/customer/Info'));
const Login = () => L(() => import('@/pages/auth/Login'));
const Register = () => L(() => import('@/pages/auth/Register'));
const Forgot = () => L(() => import('@/pages/auth/ForgotPassword'));
const NotFound = () => L(() => import('@/pages/NotFound'));

// Seller
const SDash = () => L(() => import('@/pages/seller/Dashboard'));
const SOrders = () => L(() => import('@/pages/seller/Orders'));
const SProducts = () => L(() => import('@/pages/seller/Products'));
const SProductForm = () => L(() => import('@/pages/seller/ProductForm'));
const SInventory = () => L(() => import('@/pages/seller/Inventory'));
const SCustomers = () => L(() => import('@/pages/seller/Customers'));
const SMessages = () => L(() => import('@/pages/seller/Messages'));
const SReviews = () => L(() => import('@/pages/seller/Reviews'));
const SPromotions = () => L(() => import('@/pages/seller/Promotions'));
const SAnalytics = () => L(() => import('@/pages/seller/Analytics'));
const SPayouts = () => L(() => import('@/pages/seller/Payouts'));
const SStore = () => L(() => import('@/pages/seller/StoreSettings'));
const SSettings = () => L(() => import('@/pages/seller/Settings'));

// Admin
const ADash = () => L(() => import('@/pages/admin/Dashboard'));
const AUsers = () => L(() => import('@/pages/admin/Users'));
const ACustomers = () => L(() => import('@/pages/admin/Customers'));
const ASellers = () => L(() => import('@/pages/admin/Sellers'));
const AProducts = () => L(() => import('@/pages/admin/Products'));
const ACategories = () => L(() => import('@/pages/admin/Categories'));
const AOrders = () => L(() => import('@/pages/admin/Orders'));
const ACommissions = () => L(() => import('@/pages/admin/Commissions'));
const APayments = () => L(() => import('@/pages/admin/Payments'));
const ARefunds = () => L(() => import('@/pages/admin/Refunds'));
const AReviews = () => L(() => import('@/pages/admin/Reviews'));
const ACoupons = () => L(() => import('@/pages/admin/Coupons'));
const APromotions = () => L(() => import('@/pages/admin/Promotions'));
const AReports = () => L(() => import('@/pages/admin/Reports'));
const AContent = () => L(() => import('@/pages/admin/Content'));
const ASupport = () => L(() => import('@/pages/admin/Support'));
const ASettings = () => L(() => import('@/pages/admin/Settings'));

export const routes: RouteObject[] = [
  {
    element: <CustomerLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: wrap(<Home />) },
      { path: '/shop', element: <Shop /> },
      { path: '/category/:slug', element: <Shop /> },
      { path: '/search', element: <Shop /> },
      { path: '/product/:id', element: <ProductDetail /> },
      { path: '/store/:id', element: <StorePage /> },
      { path: '/cart', element: <Cart /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/order-success', element: <OrderSuccess /> },
      { path: '/orders', element: <Orders /> },
      { path: '/orders/:id', element: <OrderDetail /> },
      { path: '/track', element: <Orders /> },
      { path: '/wishlist', element: <Wishlist /> },
      {
        path: '/account', element: <Account />, children: [
          { index: true, element: <AccountHome /> },
          { path: 'profile', element: <Profile /> },
          { path: 'addresses', element: <Addresses /> },
          { path: 'payments', element: <Payments /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'messages', element: <Messages /> },
          { path: ':section', element: <AccountExtras /> },
        ],
      },
      { path: '/help', element: <Help /> },
      { path: '/page/:slug', element: <Info /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <Forgot /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/seller',
    element: <SellerLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/seller/dashboard" replace /> },
      { path: 'dashboard', element: <SDash /> },
      { path: 'orders', element: <SOrders /> },
      { path: 'products', element: <SProducts /> },
      { path: 'products/new', element: <SProductForm /> },
      { path: 'products/:id', element: <SProductForm /> },
      { path: 'inventory', element: <SInventory /> },
      { path: 'customers', element: <SCustomers /> },
      { path: 'messages', element: <SMessages /> },
      { path: 'reviews', element: <SReviews /> },
      { path: 'promotions', element: <SPromotions /> },
      { path: 'analytics', element: <SAnalytics /> },
      { path: 'payouts', element: <SPayouts /> },
      { path: 'store', element: <SStore /> },
      { path: 'settings', element: <SSettings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <ADash /> },
      { path: 'users', element: <AUsers /> },
      { path: 'customers', element: <ACustomers /> },
      { path: 'sellers', element: <ASellers /> },
      { path: 'products', element: <AProducts /> },
      { path: 'categories', element: <ACategories /> },
      { path: 'orders', element: <AOrders /> },
      { path: 'commissions', element: <ACommissions /> },
      { path: 'payments', element: <APayments /> },
      { path: 'refunds', element: <ARefunds /> },
      { path: 'returns', element: <Navigate to="/admin/refunds" replace /> },
      { path: 'reviews', element: <AReviews /> },
      { path: 'coupons', element: <ACoupons /> },
      { path: 'promotions', element: <APromotions /> },
      { path: 'reports', element: <AReports /> },
      { path: 'content', element: <AContent /> },
      { path: 'support', element: <ASupport /> },
      { path: 'settings', element: <ASettings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
