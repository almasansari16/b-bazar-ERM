import type { Customer, Address } from '@/types';
import { makeRng } from '@/utils/random';

const names: [string, string][] = [
  ['Ahmed Khan', 'Karachi'], ['Muhammad Usman', 'Lahore'], ['Ayesha Siddiqui', 'Karachi'], ['Fatima Noor', 'Islamabad'], ['Hamza Ahmed', 'Rawalpindi'],
  ['Hassan Raza', 'Lahore'], ['Sara Ali', 'Karachi'], ['Maham Khan', 'Peshawar'], ['Bilal Hussain', 'Faisalabad'], ['Zara Sheikh', 'Lahore'],
  ['Omar Farooq', 'Multan'], ['Iqra Javed', 'Hyderabad'], ['Ali Haider', 'Islamabad'], ['Mahnoor Abbasi', 'Karachi'], ['Danish Mirza', 'Sialkot'],
  ['Hira Aslam', 'Gujranwala'], ['Saad Qureshi', 'Karachi'], ['Laiba Tariq', 'Lahore'], ['Faizan Malik', 'Quetta'], ['Areeba Chaudhry', 'Rawalpindi'],
  ['Talha Rehman', 'Karachi'], ['Noor ul Ain', 'Lahore'], ['Kashif Mehmood', 'Faisalabad'], ['Sana Baig', 'Islamabad'], ['Rizwan Akhtar', 'Multan'],
  ['Amna Yousaf', 'Karachi'], ['Junaid Iqbal', 'Peshawar'], ['Mehak Shah', 'Hyderabad'], ['Arslan Butt', 'Lahore'], ['Hafsa Anwar', 'Karachi'],
];

const rng = makeRng(77);
export const customers: Customer[] = names.map(([name, city], i) => {
  const joined = new Date('2026-10-01');
  joined.setDate(joined.getDate() - rng.int(10, 900));
  return {
    id: `C${1001 + i}`,
    name, city,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@gmail.com`,
    phone: `+92 3${rng.int(0, 4)}${rng.int(0, 9)} ${rng.int(1000000, 9999999)}`,
    joined: joined.toISOString(),
    status: i === 18 ? 'blocked' : 'active',
    wallet: i === 0 ? 1250 : rng.int(0, 6) * 250,
    rewardPoints: i === 0 ? 2480 : rng.int(0, 3000),
  };
});
customers[0].email = 'customer@bbazar.com';
customers[0].phone = '+92 300 1234567';

export const AREAS: Record<string, string[]> = {
  Karachi: ['House 42, Block 7, Gulshan-e-Iqbal', 'Flat 304, Clifton Block 5', 'House 18, DHA Phase 6', 'Plot 11, North Nazimabad Block H', 'House 7, PECHS Block 2'],
  Lahore: ['House 23, Block C, Johar Town', '12-A Gulberg III', 'House 56, DHA Phase 5', 'House 9, Model Town Extension'],
  Islamabad: ['House 14, Street 21, F-10/2', 'Flat 6, G-11 Markaz', 'House 31, E-11/3'],
  Rawalpindi: ['House 88, Bahria Town Phase 4', 'House 5, Satellite Town Block B'],
  default: ['House 21, Main Boulevard', 'House 3, Civil Lines', 'Shop 12, Saddar Road'],
};

export const defaultAddresses: Address[] = [
  { id: 'A1', label: 'Home', name: 'Ahmed Khan', phone: '+92 300 1234567', line: 'House 42, Block 7, Gulshan-e-Iqbal', city: 'Karachi', province: 'Sindh', postal: '75300', isDefault: true },
  { id: 'A2', label: 'Office', name: 'Ahmed Khan', phone: '+92 300 1234567', line: 'Office 1204, Ocean Tower, Clifton', city: 'Karachi', province: 'Sindh', postal: '75600' },
];
