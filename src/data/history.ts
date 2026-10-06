import type { DailyStat } from '@/types';
import { makeRng } from '@/utils/random';
import { NOW } from './orders';

/** 12 months of aggregated marketplace history (pre-dating the detailed mock orders).
 *  Dashboards add live orders on top of this so KPIs stay internally consistent. */
const rng = makeRng(2026);
export const history: DailyStat[] = [];
for (let d = 365; d >= 1; d--) {
  const date = new Date(NOW);
  date.setDate(date.getDate() - d);
  const t = (365 - d) / 365; // growth over the year
  const dow = date.getDay();
  const weekend = dow === 5 || dow === 6 || dow === 0 ? 1.18 : 1;
  const m = date.getMonth();
  const seasonal = m === 2 || m === 3 ? 1.35 : m === 7 ? 1.25 : m === 10 ? 1.4 : 1; // Ramadan/Eid, Azadi, 11.11
  const noise = 0.85 + rng.next() * 0.3;
  const orders = Math.round((34 + 26 * t) * weekend * seasonal * noise);
  const aov = 1480 + rng.int(-120, 160);
  history.push({
    date: date.toISOString().slice(0, 10),
    orders,
    gmv: orders * aov,
    newCustomers: Math.round(orders * (2.6 + rng.next())),
    newSellers: rng.int(1, 6),
    visitors: Math.round(orders * (38 + rng.int(0, 12))),
  });
}

/** Share of marketplace GMV per seller (history only). */
export const SELLER_SHARE: Record<string, number> = {
  S1001: 0.15, S1002: 0.038, S1003: 0.034, S1004: 0.031, S1005: 0.042, S1006: 0.033, S1007: 0.05, S1008: 0.06, S1009: 0.02, S1010: 0.028,
  S1011: 0.024, S1012: 0.018, S1013: 0.016, S1014: 0.11, S1015: 0.07, S1016: 0.055, S1017: 0.015, S1018: 0.014, S1019: 0.011,
};
export const CATEGORY_SHARE: Record<string, number> = {
  electronics: 0.19, 'mobiles-tablets': 0.17, 'computers-laptops': 0.09, fashion: 0.14, beauty: 0.07, 'home-living': 0.08, grocery: 0.06,
  appliances: 0.08, 'sports-fitness': 0.035, 'toys-kids': 0.025, automotive: 0.015, 'books-stationery': 0.01, 'health-wellness': 0.015, 'jewelry-accessories': 0.01, 'pet-supplies': 0.005,
};
export const CITY_SHARE: Record<string, number> = { Karachi: 0.29, Lahore: 0.24, Islamabad: 0.12, Rawalpindi: 0.08, Faisalabad: 0.07, Multan: 0.05, Peshawar: 0.05, Hyderabad: 0.035, Sialkot: 0.025, Gujranwala: 0.02, Quetta: 0.015 };
export const PAYMENT_SHARE: Record<string, number> = { cod: 0.58, card: 0.14, jazzcash: 0.12, easypaisa: 0.09, bank: 0.07 };
export const TRAFFIC_SOURCES = [
  { name: 'Search', value: 38 }, { name: 'Direct', value: 22 }, { name: 'Social', value: 18 }, { name: 'Campaigns', value: 14 }, { name: 'Referral', value: 8 },
];
