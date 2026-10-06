import type { Seller } from '@/types';

const s = (
  n: number, slug: string, name: string, owner: string, city: string, category: string, rating: number, positive: number,
  followers: number, joined: string, color: string, tagline: string, extra: Partial<Seller> = {},
): Seller => ({
  id: `S${String(1000 + n)}`, slug, name, owner, city, category, rating, positive, followers, joined, color, tagline,
  email: `${slug.replace(/-/g, '')}@sellers.bbazar.pk`, phone: `+92 3${String(10 + n).padStart(2, '0')} ${String(1234567 + n * 7919).slice(0, 7)}`,
  responseRate: Math.min(99, 88 + (n % 11)), status: 'approved', verified: true,
  description: `${name} is a ${city}-based ${tagline.toLowerCase()} selling on B-Bazar since ${joined.slice(0, 4)}. Every order is quality-checked and dispatched within 24 hours.`,
  ...extra,
});

export const sellers: Seller[] = [
  s(1, 'techzone', 'TechZone PK', 'Faisal Mehmood', 'Karachi', 'electronics', 4.8, 98, 48200, '2021-03-12', '#4338CA', 'Authorised electronics retailer'),
  s(2, 'urban-cart', 'Urban Cart', 'Sana Javed', 'Lahore', 'fashion', 4.6, 95, 22100, '2022-01-08', '#DB2777', 'Everyday fashion label'),
  s(3, 'homenest', 'HomeNest', 'Imran Qureshi', 'Lahore', 'home-living', 4.7, 96, 18750, '2021-09-20', '#B45309', 'Home décor and kitchen store'),
  s(4, 'style-avenue', 'Style Avenue', 'Mehwish Tariq', 'Karachi', 'fashion', 4.5, 93, 15400, '2022-05-17', '#9333EA', 'Women’s eastern wear boutique'),
  s(5, 'glow-care', 'Glow & Care', 'Hira Shah', 'Islamabad', 'beauty', 4.7, 97, 31200, '2021-11-02', '#E11D48', 'Skincare and beauty retailer'),
  s(6, 'smart-gadgets-hub', 'Smart Gadgets Hub', 'Bilal Akhtar', 'Rawalpindi', 'electronics', 4.6, 94, 20900, '2022-02-25', '#0891B2', 'Gadgets and accessories store'),
  s(7, 'daily-essentials', 'Daily Essentials', 'Kamran Butt', 'Faisalabad', 'grocery', 4.5, 94, 12600, '2022-07-11', '#059669', 'Grocery and household supplier'),
  s(8, 'prime-electronics', 'Prime Electronics', 'Adnan Sheikh', 'Lahore', 'appliances', 4.6, 95, 17300, '2021-06-30', '#2563EB', 'Home appliance distributor'),
  s(9, 'modern-living', 'Modern Living', 'Rabia Anwar', 'Karachi', 'home-living', 4.4, 92, 9800, '2023-01-19', '#78716C', 'Furniture and lighting studio'),
  s(10, 'fitnation', 'FitNation', 'Usman Ghani', 'Lahore', 'sports-fitness', 4.7, 96, 14100, '2022-03-03', '#EA580C', 'Sports and fitness gear shop'),
  s(11, 'baby-world', 'Baby World', 'Nida Farooq', 'Karachi', 'toys-kids', 4.8, 98, 11900, '2022-08-14', '#F59E0B', 'Toys and baby care store'),
  s(12, 'autogear-pk', 'AutoGear Pakistan', 'Shahid Iqbal', 'Gujranwala', 'automotive', 4.5, 93, 8700, '2022-10-05', '#475569', 'Car and bike accessories dealer'),
  s(13, 'readers-hub', 'Readers Hub', 'Zainab Malik', 'Lahore', 'books-stationery', 4.8, 99, 10400, '2021-12-12', '#7C3AED', 'Independent bookshop'),
  s(14, 'bbazar-official', 'B-Bazar Official', 'B-Bazar Retail', 'Karachi', 'mobiles-tablets', 4.9, 99, 125000, '2020-11-01', '#312E81', 'Official B-Bazar store', { official: true }),
  s(15, 'mobile-mart', 'Mobile Mart', 'Waqas Ali', 'Islamabad', 'mobiles-tablets', 4.6, 95, 26300, '2021-08-08', '#6D28D9', 'Smartphone and tablet retailer'),
  s(16, 'laptop-lounge', 'Laptop Lounge', 'Omer Saeed', 'Karachi', 'computers-laptops', 4.7, 96, 13500, '2022-04-21', '#0E7490', 'Computers and peripherals shop'),
  s(17, 'health-plus', 'Health Plus', 'Dr. Ayesha Kamal', 'Islamabad', 'health-wellness', 4.6, 95, 7600, '2023-02-10', '#0D9488', 'Wellness and personal health store'),
  s(18, 'jewel-box', 'Jewel Box', 'Mariam Rauf', 'Lahore', 'jewelry-accessories', 4.5, 94, 6900, '2023-03-28', '#BE185D', 'Jewelry and accessories label'),
  s(19, 'pet-paradise', 'Pet Paradise', 'Ali Hassan', 'Karachi', 'pet-supplies', 4.7, 97, 5400, '2023-05-15', '#65A30D', 'Pet food and care shop'),
  s(20, 'kitchen-king', 'Kitchen King', 'Tariq Jamil', 'Multan', 'appliances', 0, 0, 0, '2026-09-29', '#CA8A04', 'Kitchen appliance wholesaler', { status: 'pending', verified: false }),
  s(21, 'urban-style', 'Urban Style', 'Hamid Raza', 'Peshawar', 'fashion', 3.9, 84, 3100, '2023-07-01', '#64748B', 'Streetwear and sneakers', { status: 'suspended', verified: false }),
  s(22, 'sialkot-sports', 'Sialkot Sports Co.', 'Nadeem Akram', 'Sialkot', 'sports-fitness', 0, 0, 0, '2026-10-01', '#16A34A', 'Hand-stitched sports goods maker', { status: 'pending', verified: false }),
];
