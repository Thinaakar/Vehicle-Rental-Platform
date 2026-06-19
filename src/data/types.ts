export type TemplateFieldType = 'string' | 'number' | 'boolean' | 'timestamp' | 'reference';

export type TemplateField = {
  key: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  refTable?: string;
};

export type TemplateTable = {
  key: string;
  label: string;
  order: number;
  fields: TemplateField[];
};

export const appTemplate = {
  key: 'vehicle-rental',
  label: 'Vehicle Rental Platform',
  tables: [
    {
      key: 'users',
      label: 'Users',
      order: 10,
      fields: [
        { key: 'displayName', label: 'Name', type: 'string', required: true },
        { key: 'email', label: 'Email', type: 'string', required: true },
        { key: 'role', label: 'Role', type: 'string', required: true },
        { key: 'createdAt', label: 'Created', type: 'timestamp', required: true },
        { key: 'updatedAt', label: 'Updated', type: 'timestamp', required: true },
      ],
    },
    {
      key: 'vehicles',
      label: 'Vehicles',
      order: 20,
      fields: [
        { key: 'name', label: 'Vehicle Name', type: 'string', required: true },
        { key: 'category', label: 'Category', type: 'string', required: true },
        { key: 'price', label: 'Price Per Day', type: 'number', required: true },
        { key: 'image', label: 'Image URL', type: 'string', required: true },
        { key: 'location', label: 'Location', type: 'string', required: true },
        { key: 'rating', label: 'Rating', type: 'number', required: true },
        { key: 'transmission', label: 'Transmission', type: 'string', required: true },
        { key: 'fuel', label: 'Fuel Type', type: 'string', required: true },
        { key: 'seats', label: 'Seating Capacity', type: 'number', required: true },
        { key: 'vendorId', label: 'Vendor ID', type: 'string', required: true },
        { key: 'vendorName', label: 'Vendor Name', type: 'string', required: true },
        { key: 'status', label: 'Status', type: 'string', required: true },
      ],
    },
    {
      key: 'bookings',
      label: 'Bookings',
      order: 30,
      fields: [
        { key: 'vehicleId', label: 'Vehicle ID', type: 'reference', refTable: 'vehicles', required: true },
        { key: 'vehicleName', label: 'Vehicle Name', type: 'string', required: true },
        { key: 'vehicleImage', label: 'Vehicle Image', type: 'string', required: true },
        { key: 'customerId', label: 'Customer ID', type: 'string', required: true },
        { key: 'customerName', label: 'Customer Name', type: 'string', required: true },
        { key: 'vendorId', label: 'Vendor ID', type: 'string', required: true },
        { key: 'startDate', label: 'Start Date', type: 'string', required: true },
        { key: 'endDate', label: 'End Date', type: 'string', required: true },
        { key: 'totalAmount', label: 'Total Amount', type: 'number', required: true },
        { key: 'status', label: 'Status', type: 'string', required: true },
        { key: 'createdAt', label: 'Created At', type: 'timestamp', required: true },
      ],
    },
    {
      key: 'reviews',
      label: 'Reviews',
      order: 40,
      fields: [
        { key: 'vehicleId', label: 'Vehicle ID', type: 'reference', refTable: 'vehicles', required: true },
        { key: 'customerId', label: 'Customer ID', type: 'string', required: true },
        { key: 'customerName', label: 'Customer Name', type: 'string', required: true },
        { key: 'rating', label: 'Rating', type: 'number', required: true },
        { key: 'comment', label: 'Comment', type: 'string', required: true },
        { key: 'date', label: 'Date', type: 'string', required: true },
      ],
    },
  ],
} as const;
