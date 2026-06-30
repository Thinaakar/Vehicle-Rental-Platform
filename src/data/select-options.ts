import type { SelectOption } from '@/components/ui/PremiumSelect';

export const vehicleStatusOptions: SelectOption[] = [
  { value: 'Available', label: 'Available' },
  { value: 'Active', label: 'Active' },
  { value: 'Maintenance', label: 'Maintenance' },
];

export const vehicleCategoryOptions: SelectOption[] = [
  { value: 'Cars', label: 'Cars' },
  { value: 'Bikes', label: 'Bikes' },
  { value: 'Luxury Cars', label: 'Luxury Cars' },
  { value: 'SUVs', label: 'SUVs' },
  { value: 'Vans', label: 'Vans' },
  { value: 'Trucks', label: 'Trucks' },
  { value: 'Electric Vehicles', label: 'Electric Vehicles' },
];

export const transmissionOptions: SelectOption[] = [
  { value: 'Automatic', label: 'Automatic' },
  { value: 'Manual', label: 'Manual' },
];

export const fuelOptions: SelectOption[] = [
  { value: 'Electric', label: 'Electric' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Petrol', label: 'Petrol' },
  { value: 'Diesel', label: 'Diesel' },
];

export const revenuePeriodOptions: SelectOption[] = [
  { value: '6m', label: 'Last 6 months' },
  { value: 'ytd', label: 'Year to date' },
  { value: '12m', label: 'Last 12 months' },
];

export const marketplaceSortOptions: SelectOption[] = [
  { value: 'featured', label: 'Sort by featured' },
  { value: 'price-asc', label: 'Price low to high' },
  { value: 'rating-desc', label: 'Rating high to low' },
  { value: 'newest', label: 'Newest' },
];

export function toSelectOptions(values: string[], formatLabel?: (value: string) => string): SelectOption[] {
  return values.map((value) => ({
    value,
    label: formatLabel ? formatLabel(value) : value,
  }));
}
