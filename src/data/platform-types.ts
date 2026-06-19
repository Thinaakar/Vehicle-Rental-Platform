export interface Vehicle {
  id: string;
  name: string;
  category: 'Cars' | 'Bikes' | 'Luxury Cars' | 'SUVs' | 'Vans' | 'Trucks' | 'Electric Vehicles';
  price: number;
  image: string;
  location: string;
  rating: number;
  transmission: 'Automatic' | 'Manual';
  fuel: 'Electric' | 'Hybrid' | 'Petrol' | 'Diesel';
  seats: number;
  vendorId: string;
  vendorName: string;
  status: 'Available' | 'Active' | 'Maintenance';
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  vehicleId: string;
  vehicleName: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}
