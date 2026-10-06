import type { Category } from '@/types';
import { unsplash } from './images';

const c = (
  order: number, slug: string, name: string, short: string, icon: string, color: string, img: string, description: string, subs: string[],
): Category => ({
  id: `cat-${order}`, order, slug, name, short, icon, color, image: unsplash(img, 800), description, enabled: true,
  subcategories: subs.map((s) => ({ name: s, slug: s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-') })),
});

export const categories: Category[] = [
  c(1, 'electronics', 'Electronics', 'Electronics', 'Headphones', '#4338CA', '1505740420928-5e560c06d30e', 'Audio, wearables, smart home and gadgets', ['Audio', 'Wearables', 'Chargers & Power', 'Gaming', 'TV & Video', 'Cameras', 'Accessories']),
  c(2, 'mobiles-tablets', 'Mobiles & Tablets', 'Mobiles', 'Smartphone', '#7C3AED', '1511707171634-5f897ff02aa9', 'Latest smartphones, tablets and accessories', ['Smartphones', 'Tablets', 'Feature Phones', 'Cases & Covers', 'Screen Protectors']),
  c(3, 'computers-laptops', 'Computers & Laptops', 'Computers', 'Laptop', '#0891B2', '1496181133206-80ce9b88a853', 'Laptops, monitors and peripherals', ['Laptops', 'Monitors', 'Keyboards & Mice', 'Storage', 'Networking']),
  c(4, 'fashion', 'Fashion', 'Fashion', 'Shirt', '#DB2777', '1445205170230-053b83016050', 'Lawn, kurtas, sneakers and everyday style', ['Men', 'Women', 'Kids', 'Shoes', 'Watches', 'Bags']),
  c(5, 'beauty', 'Beauty & Personal Care', 'Beauty', 'Sparkles', '#E11D48', '1596462502278-27bfdc403348', 'Skincare, makeup, haircare and fragrance', ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Grooming']),
  c(6, 'home-living', 'Home & Living', 'Home', 'Sofa', '#B45309', '1555041469-a586c61ea9bc', 'Decor, kitchen, bedding and storage', ['Furniture', 'Kitchen', 'Decor', 'Lighting', 'Bedding', 'Storage']),
  c(7, 'grocery', 'Grocery & Essentials', 'Grocery', 'ShoppingBasket', '#059669', '1542838132-92c53300491e', 'Pantry staples, beverages and household', ['Rice & Atta', 'Cooking Oil', 'Beverages', 'Snacks', 'Breakfast', 'Household']),
  c(8, 'health-wellness', 'Health & Wellness', 'Health', 'HeartPulse', '#0D9488', '1505576399279-565b52d4ac71', 'Vitamins, devices and personal health', ['Vitamins', 'Medical Devices', 'Personal Care', 'Nutrition']),
  c(9, 'sports-fitness', 'Sports & Fitness', 'Sports', 'Dumbbell', '#EA580C', '1517836357463-d25dfeac3438', 'Gym gear, cricket, football and running', ['Gym Equipment', 'Yoga', 'Running', 'Cricket', 'Football', 'Cycling']),
  c(10, 'toys-kids', 'Toys & Kids', 'Kids', 'Baby', '#F59E0B', '1558060370-d644479cb6f7', 'Toys, school bags and baby care', ['Learning Toys', 'Remote Control', 'School Supplies', 'Baby Care']),
  c(11, 'automotive', 'Automotive', 'Automotive', 'Car', '#475569', '1492144534655-ae79c964c9d7', 'Car care, bike gear and accessories', ['Car Accessories', 'Car Care', 'Lighting', 'Bike Gear']),
  c(12, 'books-stationery', 'Books & Stationery', 'Books', 'BookOpen', '#9333EA', '1512820790803-83ca734da794', 'Books, notebooks and office supplies', ['Business', 'Education', 'Children', 'Technology', 'History', 'Stationery']),
  c(13, 'appliances', 'Appliances', 'Appliances', 'Refrigerator', '#2563EB', '1556911220-bff31c812dba', 'Kitchen and home appliances', ['Kitchen Appliances', 'Cooling', 'Laundry', 'Irons & Steamers']),
  c(14, 'jewelry-accessories', 'Jewelry & Accessories', 'Jewelry', 'Gem', '#BE185D', '1515562141207-7a88fb7ce338', 'Jewelry, sunglasses and wallets', ['Jewelry', 'Sunglasses', 'Wallets', 'Belts']),
  c(15, 'pet-supplies', 'Pet Supplies', 'Pets', 'PawPrint', '#65A30D', '1583337130417-3346a1be7dee', 'Food, toys and care for pets', ['Cat Food', 'Dog Food', 'Pet Toys', 'Pet Care']),
];

/** Mega-menu columns (desktop) */
export const megaMenu: { title: string; icon: string; slug: string; links: string[] }[] = [
  { title: 'Electronics', icon: 'Headphones', slug: 'electronics', links: ['Mobiles', 'Laptops', 'Tablets', 'Audio', 'Cameras', 'Accessories'] },
  { title: 'Fashion', icon: 'Shirt', slug: 'fashion', links: ['Men', 'Women', 'Kids', 'Shoes', 'Watches', 'Accessories'] },
  { title: 'Home', icon: 'Sofa', slug: 'home-living', links: ['Furniture', 'Kitchen', 'Decor', 'Lighting', 'Storage'] },
  { title: 'Beauty', icon: 'Sparkles', slug: 'beauty', links: ['Skincare', 'Makeup', 'Haircare', 'Fragrances'] },
  { title: 'Grocery', icon: 'ShoppingBasket', slug: 'grocery', links: ['Rice & Atta', 'Beverages', 'Snacks', 'Household'] },
];
