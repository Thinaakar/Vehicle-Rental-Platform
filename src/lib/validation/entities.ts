import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  selectedRole: z.enum(['customer', 'vendor']).nullable().optional(),
});

export const bookingCreateSchema = z.object({
  vehicleId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  customerName: z.string().optional(),
});

export const bookingStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Active', 'Completed', 'Cancelled']),
});

export const vehicleCreateSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['Cars', 'Bikes', 'Luxury Cars', 'SUVs', 'Vans', 'Trucks', 'Electric Vehicles']),
  price: z.number().positive(),
  image: z.string().min(1),
  location: z.string().min(1),
  transmission: z.enum(['Automatic', 'Manual']),
  fuel: z.enum(['Electric', 'Hybrid', 'Petrol', 'Diesel']),
  seats: z.number().int().positive(),
});

export const vehicleStatusSchema = z.object({
  status: z.enum(['Available', 'Active', 'Maintenance']),
});

export const reviewCreateSchema = z.object({
  vehicleId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

export const favoriteToggleSchema = z.object({
  vehicleId: z.string().min(1),
});
