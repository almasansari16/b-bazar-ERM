import type { Review } from '@/types';
import { seedProducts } from './products';
import { makeRng } from '@/utils/random';
import { unsplash } from './images';

const rng = makeRng(555);
const TEMPLATES: [number, string, string][] = [
  [5, 'Exactly as described', 'Received it within two days in Karachi. Packaging was solid and the product feels premium. Highly recommended seller.'],
  [5, 'Value for money', 'Compared prices everywhere and B-Bazar had the best deal. Works perfectly, will definitely order again.'],
  [4, 'Good quality, slight delay', 'Product quality is great but delivery took one extra day. Seller kept me updated on WhatsApp though.'],
  [5, 'Original product', 'Checked the serial number and it is 100% original. COD option made it easy to trust.'],
  [4, 'Very good', 'Does the job well. Colour is slightly different from the pictures but I am happy overall.'],
  [3, 'Average experience', 'It is okay for the price. Box was a bit dented but the item itself was fine.'],
  [5, 'Superb!', 'Bought this as a gift for my brother and he loved it. Fast delivery to Lahore.'],
  [2, 'Size runs small', 'Had to return it because it ran a size small. Return process was smooth though.'],
  [5, 'Best purchase this year', 'Using it daily for three weeks now with no issues. Battery life is impressive.'],
  [4, 'Recommended', 'Good product and responsive seller. Would have given 5 stars with better packaging.'],
  [1, 'Wrong item received', 'Received a different colour than I ordered. Raised a return request and support is helping.'],
  [5, 'Amazing quality', 'Stitching and finishing are top notch. Worth every rupee.'],
];
const NAMES = ['Ahmed Khan', 'Ayesha Siddiqui', 'Hamza Ahmed', 'Sara Ali', 'Fatima Noor', 'Hassan Raza', 'Maham Khan', 'Bilal Hussain', 'Zara Sheikh', 'Omar Farooq', 'Iqra Javed', 'Danish Mirza', 'Laiba Tariq', 'Saad Qureshi', 'Areeba Chaudhry'];
const PHOTOS = ['1590658268037-6bf12165a8df', '1546868871-7041f2a55e12', '1608043152269-423dbba4e7e1', '1583391733956-6c78276477e2'];

const approved = seedProducts.filter((p) => p.status === 'approved');
const focus = approved.slice(0, 6); // first products get several reviews so PDP looks rich

export const seedReviews: Review[] = Array.from({ length: 48 }, (_, i) => {
  const p = i < 24 ? focus[i % focus.length] : rng.pick(approved);
  const [rating, title, body] = TEMPLATES[i % TEMPLATES.length];
  const d = new Date('2026-10-04T12:00:00+05:00');
  d.setDate(d.getDate() - rng.int(0, 120));
  return {
    id: `R${3001 + i}`,
    productId: p.id,
    sellerId: p.sellerId,
    customerName: NAMES[i % NAMES.length],
    rating, title, body,
    date: d.toISOString(),
    verified: rng.chance(0.85),
    helpful: rng.int(0, 64),
    photos: i % 5 === 0 ? [unsplash(PHOTOS[i % PHOTOS.length], 300)] : [],
    status: i === 10 ? 'flagged' : i === 22 ? 'pending' : i === 34 ? 'flagged' : i === 40 ? 'pending' : 'published',
    sellerReply: i % 4 === 0 && rating >= 4 ? 'Thank you for your kind words! We look forward to serving you again.' : undefined,
    variant: p.colors?.[0],
  };
});
