export type TripType = 'one-way' | 'round-trip';

export interface BookingDraft {
  vehicleId: string;
  pickupLocation: string;
  returnLocation: string;
  sameReturnLocation: boolean;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  tripType: TripType;
  fullName: string;
  mobile: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  licenseNumber: string;
  licenseFileName: string;
  emergencyContact: string;
  acceptedTerms: boolean;
}

export interface CompletedBookingDetails {
  bookingRef: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  vehicleCategory: string;
  pickupLocation: string;
  returnLocation: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  tripType: TripType;
  rentalDays: number;
  fullName: string;
  mobile: string;
  email: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  licenseNumber: string;
  emergencyContact: string;
  rentalCharges: number;
  taxes: number;
  securityDeposit: number;
  grandTotal: number;
  createdAt: string;
}

export const BOOKING_DRAFT_KEY = 'vr_booking_draft';

export const EMPTY_BOOKING_DRAFT: BookingDraft = {
  vehicleId: '',
  pickupLocation: '',
  returnLocation: '',
  sameReturnLocation: true,
  destination: '',
  pickupDate: '',
  pickupTime: '10:00',
  returnDate: '',
  returnTime: '10:00',
  tripType: 'round-trip',
  fullName: '',
  mobile: '',
  email: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  licenseNumber: '',
  licenseFileName: '',
  emergencyContact: '',
  acceptedTerms: false,
};
