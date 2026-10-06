export const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Gujranwala'] as const;
export const PROVINCES = ['Sindh', 'Punjab', 'Islamabad Capital Territory', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir'] as const;
export const CITY_PROVINCE: Record<string, string> = {
  Karachi: 'Sindh', Hyderabad: 'Sindh', Lahore: 'Punjab', Rawalpindi: 'Punjab', Faisalabad: 'Punjab', Multan: 'Punjab',
  Sialkot: 'Punjab', Gujranwala: 'Punjab', Islamabad: 'Islamabad Capital Territory', Peshawar: 'Khyber Pakhtunkhwa', Quetta: 'Balochistan',
};
/** Delivery estimate in days per city. */
export const deliveryDays = (city: string): [number, number] => {
  if (city === 'Karachi') return [1, 2];
  if (city === 'Lahore' || city === 'Islamabad') return [2, 4];
  return [3, 7];
};
export const STANDARD_DELIVERY_FEE = 199;
export const EXPRESS_DELIVERY_FEE = 449;
export const FREE_DELIVERY_THRESHOLD = 2999;
