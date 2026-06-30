export const RENTAL_LOCATIONS = [
  'Los Angeles, CA',
  'San Francisco, CA',
  'Miami, FL',
  'New York, NY',
  'Chicago, IL',
  'Seattle, WA',
  'Beverly Hills, CA',
] as const;

export const rentalLocationOptions = [
  { value: '', label: 'Select Location' },
  ...RENTAL_LOCATIONS.map((location) => ({ value: location, label: location })),
];

export const rentalLocationOptionsRequired = RENTAL_LOCATIONS.map((location) => ({
  value: location,
  label: location,
}));
