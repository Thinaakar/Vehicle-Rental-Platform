import type { Booking, Vehicle } from '@/data/platform-types';

export const MOCK_DATA_VERSION = '4';
export const MOCK_DATA_VERSION_KEY = 'vr_mock_data_version';

export function calcBookingTotal(pricePerDay: number, startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const rentalCharges = pricePerDay * days;
  const taxes = Math.round(rentalCharges * 0.12);
  const securityDeposit = Math.round(pricePerDay * 0.5);
  return rentalCharges + taxes + securityDeposit;
}

function bookingTotal(vehicle: Pick<Vehicle, 'price'>, startDate: string, endDate: string) {
  return calcBookingTotal(vehicle.price, startDate, endDate);
}

export function applyVehicleStatusesFromBookings(vehicles: Vehicle[], bookings: Booking[]): Vehicle[] {
  const activeVehicleIds = new Set(
    bookings.filter((booking) => booking.status === 'Active').map((booking) => booking.vehicleId),
  );

  return vehicles.map((vehicle) => {
    if (vehicle.status === 'Maintenance') return vehicle;
    if (activeVehicleIds.has(vehicle.id)) return { ...vehicle, status: 'Active' as const };
    return { ...vehicle, status: 'Available' as const };
  });
}

type BookingSeed = Omit<Booking, 'totalAmount' | 'vehicleImage' | 'vendorId'> & {
  totalAmount?: number;
  vehicleImage?: string;
  vendorId?: string;
};

function finalizeBooking(seed: BookingSeed, vehicle: Vehicle): Booking {
  return {
    ...seed,
    vehicleImage: vehicle.image,
    vendorId: vehicle.vendorId,
    totalAmount: seed.totalAmount ?? bookingTotal(vehicle, seed.startDate, seed.endDate),
  };
}

/** Demo pipeline anchored to June 2026 — covers every rental stage. */
export function buildDefaultBookings(vehicles: Vehicle[]): Booking[] {
  const byId = Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])) as Record<string, Vehicle>;

  const seeds: BookingSeed[] = [
    // Pending — awaiting approval
    {
      id: 'bk-101',
      vehicleId: 'veh-2',
      vehicleName: 'Tesla Model S Plaid',
      customerId: 'user-customer',
      customerName: 'John Customer',
      vendorId: 'vendor-2',
      startDate: '2026-06-25',
      endDate: '2026-06-28',
      status: 'Pending',
      createdAt: '2026-06-17T16:20:00Z',
    },
    {
      id: 'bk-102',
      vehicleId: 'veh-4',
      vehicleName: 'Audi R8 V10 Performance',
      customerId: 'cust-david',
      customerName: 'David Chen',
      vendorId: 'vendor-1',
      startDate: '2026-07-02',
      endDate: '2026-07-05',
      status: 'Pending',
      createdAt: '2026-06-16T11:45:00Z',
    },
    {
      id: 'bk-103',
      vehicleId: 'veh-6',
      vehicleName: 'Ducati Panigale V4 S',
      customerId: 'cust-maria',
      customerName: 'Maria Lopez',
      vendorId: 'vendor-1',
      startDate: '2026-06-20',
      endDate: '2026-06-21',
      status: 'Pending',
      createdAt: '2026-06-18T08:10:00Z',
    },
    // Approved — confirmed, pickup upcoming
    {
      id: 'bk-201',
      vehicleId: 'veh-1',
      vehicleName: 'Porsche 911 GT3 RS',
      customerId: 'user-customer',
      customerName: 'John Customer',
      vendorId: 'vendor-1',
      startDate: '2026-06-22',
      endDate: '2026-06-25',
      status: 'Approved',
      createdAt: '2026-06-12T09:15:00Z',
    },
    {
      id: 'bk-202',
      vehicleId: 'veh-7',
      vehicleName: 'Rivian R1T Launch Edition',
      customerId: 'cust-sarah',
      customerName: 'Sarah Jenkins',
      vendorId: 'vendor-2',
      startDate: '2026-06-28',
      endDate: '2026-06-30',
      status: 'Approved',
      createdAt: '2026-06-14T13:30:00Z',
    },
    // Active — on the road (Jun 18, 2026)
    {
      id: 'bk-301',
      vehicleId: 'veh-3',
      vehicleName: 'Mercedes-Benz G63 AMG',
      customerId: 'cust-sarah',
      customerName: 'Sarah Jenkins',
      vendorId: 'vendor-1',
      startDate: '2026-06-15',
      endDate: '2026-06-20',
      status: 'Active',
      createdAt: '2026-06-10T14:30:00Z',
    },
    {
      id: 'bk-302',
      vehicleId: 'veh-5',
      vehicleName: 'BMW M4 Competition',
      customerId: 'cust-alex',
      customerName: 'Alex Rivera',
      vendorId: 'vendor-3',
      startDate: '2026-06-17',
      endDate: '2026-06-19',
      status: 'Active',
      createdAt: '2026-06-15T10:00:00Z',
    },
    // Completed — spread across Jan–Jun for revenue charts
    {
      id: 'bk-401',
      vehicleId: 'veh-7',
      vehicleName: 'Rivian R1T Launch Edition',
      customerId: 'user-customer',
      customerName: 'John Customer',
      vendorId: 'vendor-2',
      startDate: '2026-01-20',
      endDate: '2026-01-23',
      status: 'Completed',
      createdAt: '2026-01-15T09:00:00Z',
    },
    {
      id: 'bk-402',
      vehicleId: 'veh-3',
      vehicleName: 'Mercedes-Benz G63 AMG',
      customerId: 'cust-david',
      customerName: 'David Chen',
      vendorId: 'vendor-1',
      startDate: '2026-02-08',
      endDate: '2026-02-11',
      status: 'Completed',
      createdAt: '2026-02-01T12:00:00Z',
    },
    {
      id: 'bk-403',
      vehicleId: 'veh-4',
      vehicleName: 'Audi R8 V10 Performance',
      customerId: 'cust-alex',
      customerName: 'Alex Rivera',
      vendorId: 'vendor-1',
      startDate: '2026-03-14',
      endDate: '2026-03-16',
      status: 'Completed',
      createdAt: '2026-03-08T15:20:00Z',
    },
    {
      id: 'bk-404',
      vehicleId: 'veh-1',
      vehicleName: 'Porsche 911 GT3 RS',
      customerId: 'cust-maria',
      customerName: 'Maria Lopez',
      vendorId: 'vendor-1',
      startDate: '2026-04-03',
      endDate: '2026-04-06',
      status: 'Completed',
      createdAt: '2026-03-28T10:45:00Z',
    },
    {
      id: 'bk-405',
      vehicleId: 'veh-2',
      vehicleName: 'Tesla Model S Plaid',
      customerId: 'user-customer',
      customerName: 'John Customer',
      vendorId: 'vendor-2',
      startDate: '2026-05-10',
      endDate: '2026-05-12',
      status: 'Completed',
      createdAt: '2026-05-05T08:30:00Z',
    },
    {
      id: 'bk-406',
      vehicleId: 'veh-5',
      vehicleName: 'BMW M4 Competition',
      customerId: 'cust-david',
      customerName: 'David Chen',
      vendorId: 'vendor-3',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      status: 'Completed',
      createdAt: '2026-05-25T11:00:00Z',
    },
    // Cancelled
    {
      id: 'bk-501',
      vehicleId: 'veh-8',
      vehicleName: 'Mercedes-Benz V-Class Luxury',
      customerId: 'cust-maria',
      customerName: 'Maria Lopez',
      vendorId: 'vendor-3',
      startDate: '2026-06-10',
      endDate: '2026-06-12',
      status: 'Cancelled',
      createdAt: '2026-06-04T17:00:00Z',
    },
  ];

  return seeds
    .map((seed) => {
      const vehicle = byId[seed.vehicleId];
      if (!vehicle) return null;
      return finalizeBooking(seed, vehicle);
    })
    .filter((booking): booking is Booking => booking !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
