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

const ts = (): TemplateField[] => [
  { key: 'createdAt', label: 'Created', type: 'timestamp', required: true },
  { key: 'updatedAt', label: 'Updated', type: 'timestamp', required: true },
];

/** DriveXPro — Firestore tables under templates/drivexpro/tables/{key}/records */
export const appTemplate = {
  key: 'drivexpro',
  label: 'DriveXPro',
  tables: [
    {
      key: 'users',
      label: 'Users',
      order: 10,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'email', label: 'Email', type: 'string', required: true },
        { key: 'role', label: 'Role', type: 'string', required: true },
        { key: 'vendorId', label: 'Vendor', type: 'reference', refTable: 'vendors' },
        { key: 'vendorName', label: 'Vendor Name', type: 'string' },
        { key: 'avatar', label: 'Avatar', type: 'string' },
        { key: 'status', label: 'Status', type: 'string', required: true },
        { key: 'passwordHash', label: 'Password Hash', type: 'string', required: true },
        ...ts(),
      ],
    },
    {
      key: 'vendors',
      label: 'Vendors',
      order: 20,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'location', label: 'Location', type: 'string' },
        { key: 'status', label: 'Status', type: 'string', required: true },
        ...ts(),
      ],
    },
    {
      key: 'vehicles',
      label: 'Vehicles',
      order: 30,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'category', label: 'Category', type: 'string', required: true },
        { key: 'price', label: 'Price', type: 'number', required: true },
        { key: 'image', label: 'Image', type: 'string', required: true },
        { key: 'location', label: 'Location', type: 'string', required: true },
        { key: 'rating', label: 'Rating', type: 'number', required: true },
        { key: 'transmission', label: 'Transmission', type: 'string', required: true },
        { key: 'fuel', label: 'Fuel', type: 'string', required: true },
        { key: 'seats', label: 'Seats', type: 'number', required: true },
        { key: 'vendorId', label: 'Vendor', type: 'reference', refTable: 'vendors', required: true },
        { key: 'vendorName', label: 'Vendor Name', type: 'string', required: true },
        { key: 'status', label: 'Status', type: 'string', required: true },
        ...ts(),
      ],
    },
    {
      key: 'bookings',
      label: 'Bookings',
      order: 40,
      fields: [
        { key: 'vehicleId', label: 'Vehicle', type: 'reference', refTable: 'vehicles', required: true },
        { key: 'vehicleName', label: 'Vehicle Name', type: 'string', required: true },
        { key: 'vehicleImage', label: 'Vehicle Image', type: 'string', required: true },
        { key: 'customerId', label: 'Customer', type: 'reference', refTable: 'users', required: true },
        { key: 'customerName', label: 'Customer Name', type: 'string', required: true },
        { key: 'vendorId', label: 'Vendor', type: 'reference', refTable: 'vendors', required: true },
        { key: 'startDate', label: 'Start Date', type: 'string', required: true },
        { key: 'endDate', label: 'End Date', type: 'string', required: true },
        { key: 'totalAmount', label: 'Total', type: 'number', required: true },
        { key: 'status', label: 'Status', type: 'string', required: true },
        { key: 'createdAt', label: 'Created', type: 'string', required: true },
        ...ts(),
      ],
    },
    {
      key: 'reviews',
      label: 'Reviews',
      order: 50,
      fields: [
        { key: 'vehicleId', label: 'Vehicle', type: 'reference', refTable: 'vehicles', required: true },
        { key: 'vehicleName', label: 'Vehicle Name', type: 'string', required: true },
        { key: 'customerId', label: 'Customer', type: 'reference', refTable: 'users', required: true },
        { key: 'customerName', label: 'Customer Name', type: 'string', required: true },
        { key: 'rating', label: 'Rating', type: 'number', required: true },
        { key: 'comment', label: 'Comment', type: 'string', required: true },
        { key: 'date', label: 'Date', type: 'string', required: true },
        ...ts(),
      ],
    },
    {
      key: 'favorites',
      label: 'Favorites',
      order: 60,
      fields: [
        { key: 'userId', label: 'User', type: 'reference', refTable: 'users', required: true },
        { key: 'vehicleId', label: 'Vehicle', type: 'reference', refTable: 'vehicles', required: true },
        { key: 'createdAt', label: 'Created', type: 'timestamp', required: true },
      ],
    },
    {
      key: 'appAssets',
      label: 'App Assets',
      order: 70,
      fields: [
        { key: 'url', label: 'URL', type: 'string', required: true },
        { key: 'path', label: 'Path', type: 'string', required: true },
        { key: 'contentType', label: 'Content Type', type: 'string', required: true },
        { key: 'kind', label: 'Kind', type: 'string', required: true },
        { key: 'vehicleId', label: 'Vehicle ID', type: 'string' },
        ...ts(),
      ],
    },
    {
      key: 'roles',
      label: 'Portal Roles',
      order: 80,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'permissions', label: 'Permissions', type: 'string', required: true },
        { key: 'status', label: 'Status', type: 'string', required: true },
        ...ts(),
      ],
    },
  ],
};
