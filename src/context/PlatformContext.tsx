'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredAuthUser, useAuth } from '@/context/AuthContext';
import {
  BOOKING_DRAFT_KEY,
  BookingDraft,
  CompletedBookingDetails,
  EMPTY_BOOKING_DRAFT,
} from '@/data/booking-types';
import {
  MOCK_DATA_VERSION,
  MOCK_DATA_VERSION_KEY,
  applyVehicleStatusesFromBookings,
  calcBookingTotal,
} from '@/data/mock-rental-pipeline';
import type { Booking, Review, Vehicle } from '@/data/platform-types';
import {
  canAddVehicle,
  canCreateBooking,
  canDeleteVehicle,
  canManageBookingStatus,
  canSubmitReview,
  canUpdateVehicleStatus,
  hasPermission,
} from '@/data/roles-permissions';
import { FIREBASE_VEHICLE_IMAGES } from '@/data/firebase-assets';
import {
  getSeedBookings,
  SEED_FAVORITES,
  SEED_REVIEWS,
  SEED_VEHICLES,
} from '@/data/seed-defaults';
import { apiClient, isApiAvailable } from '@/lib/api/client';
import type { PlatformSnapshot } from '@/lib/types/records';

// Re-export platform types for existing imports
export type { Vehicle, Booking, Review } from '@/data/platform-types';

export type ViewRole = 'public' | 'marketplace' | 'admin' | 'vendor' | 'customer';
export type AppScreen = 'marketing' | 'login' | 'booking' | 'dashboard';

interface PlatformContextType {
  vehicles: Vehicle[];
  bookings: Booking[];
  reviews: Review[];
  favoriteVehicleIds: string[];
  currentRole: ViewRole;
  currentScreen: AppScreen;
  isHydrated: boolean;
  setCurrentRole: (role: ViewRole) => void;
  setCurrentScreen: (screen: AppScreen) => void;
  openLogin: () => void;
  openMarketing: () => void;
  openBooking: () => void;
  openDashboard: () => void;
  bookingDraft: BookingDraft;
  updateBookingDraft: (patch: Partial<BookingDraft>) => void;
  resetBookingDraft: () => void;
  lastCompletedBooking: CompletedBookingDetails | null;
  completeBookingFromDraft: () => CompletedBookingDetails | null;
  addBooking: (vehicleId: string, startDate: string, endDate: string) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'rating' | 'vendorId' | 'vendorName' | 'status'>) => void;
  updateVehicleStatus: (vehicleId: string, status: Vehicle['status']) => void;
  deleteVehicle: (vehicleId: string) => void;
  addReview: (vehicleId: string, rating: number, comment: string) => void;
  toggleFavoriteVehicle: (vehicleId: string) => void;
  resetData: () => void;
}

const DEFAULT_VEHICLES: Vehicle[] = SEED_VEHICLES;
const DEFAULT_REVIEWS: Review[] = SEED_REVIEWS;
const DEFAULT_FAVORITES: string[] = SEED_FAVORITES.map((f) => f.vehicleId);

function applyFirebaseVehicleImages(vehicle: Vehicle): Vehicle {
  const image = FIREBASE_VEHICLE_IMAGES[vehicle.id];
  return image ? { ...vehicle, image } : vehicle;
}

function applyFirebaseBookingImages(booking: Booking): Booking {
  const image = FIREBASE_VEHICLE_IMAGES[booking.vehicleId];
  return image ? { ...booking, vehicleImage: image } : booking;
}

function readLocalStorageValue(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseJsonArray<T>(value: string | null): T[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalStorageValue(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors so the app keeps working.
  }
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

function readInitialScreen(): AppScreen {
  if (typeof window === 'undefined') return 'marketing';
  const savedScreen = readLocalStorageValue('vr_current_screen') as AppScreen | null;
  const authUser = getStoredAuthUser();
  if (authUser) {
    return savedScreen === 'booking' || savedScreen === 'login' ? savedScreen : 'dashboard';
  }
  return savedScreen === 'login' || savedScreen === 'booking' ? savedScreen : 'marketing';
}

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const { user, usesApi: authUsesApi } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favoriteVehicleIds, setFavoriteVehicleIds] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<ViewRole>('public');
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(readInitialScreen);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(EMPTY_BOOKING_DRAFT);
  const [lastCompletedBooking, setLastCompletedBooking] = useState<CompletedBookingDetails | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [usesApi, setUsesApi] = useState(false);

  const applySnapshot = useCallback((snapshot: PlatformSnapshot) => {
    setVehicles(snapshot.vehicles.map(applyFirebaseVehicleImages));
    setBookings(snapshot.bookings.map(applyFirebaseBookingImages));
    setReviews(snapshot.reviews);
    setFavoriteVehicleIds(snapshot.favoriteVehicleIds);
  }, []);

  const refreshFromApi = useCallback(async () => {
    const [platformRes, vehiclesRes, reviewsRes] = await Promise.all([
      apiClient.get<PlatformSnapshot>('/api/platform'),
      apiClient.get<Vehicle[]>('/api/vehicles'),
      apiClient.get<Review[]>('/api/reviews'),
    ]);

    if (vehiclesRes.ok && reviewsRes.ok) {
      applySnapshot({
        vehicles: vehiclesRes.data,
        bookings: platformRes.ok ? platformRes.data.bookings : [],
        reviews: reviewsRes.data,
        favoriteVehicleIds: platformRes.ok ? platformRes.data.favoriteVehicleIds : [],
      });
    }
  }, [applySnapshot]);

  const persistDraft = (draft: BookingDraft) => {
    writeLocalStorageValue(BOOKING_DRAFT_KEY, JSON.stringify(draft));
  };

  const updateBookingDraft = useCallback((patch: Partial<BookingDraft>) => {
    setBookingDraft((prev) => {
      const next = { ...prev, ...patch };
      persistDraft(next);
      return next;
    });
  }, []);

  const resetBookingDraft = () => {
    setBookingDraft(EMPTY_BOOKING_DRAFT);
    writeLocalStorageValue(BOOKING_DRAFT_KEY, JSON.stringify(EMPTY_BOOKING_DRAFT));
  };

  const handleSetScreen = useCallback((screen: AppScreen) => {
    setCurrentScreen(screen);
    writeLocalStorageValue('vr_current_screen', screen);
  }, []);

  const openLogin = useCallback(() => handleSetScreen('login'), [handleSetScreen]);
  const openMarketing = useCallback(() => handleSetScreen('marketing'), [handleSetScreen]);
  const openBooking = useCallback(() => handleSetScreen('booking'), [handleSetScreen]);
  const openDashboard = useCallback(() => handleSetScreen('dashboard'), [handleSetScreen]);

  // Load data on mount (API or localStorage fallback)
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const apiUp = authUsesApi || (await isApiAvailable());
      if (cancelled) return;
      setUsesApi(apiUp);

      if (apiUp) {
        await refreshFromApi();
        if (cancelled) return;
      } else {
        const savedVehicles = parseJsonArray<Vehicle>(readLocalStorageValue('vr_vehicles'));
        const savedBookings = parseJsonArray<Booking>(readLocalStorageValue('vr_bookings'));
        const savedReviews = parseJsonArray<Review>(readLocalStorageValue('vr_reviews'));
        const savedFavorites = parseJsonArray<string>(readLocalStorageValue('vr_favorites'));
        const savedVersion = readLocalStorageValue(MOCK_DATA_VERSION_KEY);
        const shouldRefreshMockData = savedVersion !== MOCK_DATA_VERSION;

        const baseVehicles = (shouldRefreshMockData || !savedVehicles ? DEFAULT_VEHICLES : savedVehicles).map(
          applyFirebaseVehicleImages,
        );
        const nextBookings = (
          shouldRefreshMockData || !savedBookings
            ? getSeedBookings()
            : savedBookings ?? getSeedBookings()
        ).map(applyFirebaseBookingImages);
        const nextVehicles = applyVehicleStatusesFromBookings(baseVehicles, nextBookings);
        const nextReviews = shouldRefreshMockData || !savedReviews ? DEFAULT_REVIEWS : savedReviews;
        const nextFavorites = savedFavorites ?? DEFAULT_FAVORITES;

        setVehicles(nextVehicles);
        setBookings(nextBookings);
        setReviews(nextReviews);
        setFavoriteVehicleIds(nextFavorites);

        if (shouldRefreshMockData || !savedVehicles) writeLocalStorageValue('vr_vehicles', JSON.stringify(nextVehicles));
        if (shouldRefreshMockData || !savedBookings) writeLocalStorageValue('vr_bookings', JSON.stringify(nextBookings));
        if (shouldRefreshMockData || !savedReviews) writeLocalStorageValue('vr_reviews', JSON.stringify(nextReviews));
        if (shouldRefreshMockData || !savedFavorites) writeLocalStorageValue('vr_favorites', JSON.stringify(nextFavorites));
        if (shouldRefreshMockData) writeLocalStorageValue(MOCK_DATA_VERSION_KEY, MOCK_DATA_VERSION);
      }

      const savedDraft = readLocalStorageValue(BOOKING_DRAFT_KEY);
      if (savedDraft) {
        try {
          setBookingDraft({ ...EMPTY_BOOKING_DRAFT, ...JSON.parse(savedDraft) });
        } catch {
          setBookingDraft(EMPTY_BOOKING_DRAFT);
        }
      }

      const authUser = user ?? getStoredAuthUser();
      const savedScreen = readLocalStorageValue('vr_current_screen') as AppScreen | null;
      if (authUser) {
        setCurrentRole(authUser.role as ViewRole);
        setCurrentScreen(savedScreen === 'booking' || savedScreen === 'login' ? savedScreen : 'dashboard');
      } else {
        setCurrentScreen(savedScreen === 'login' || savedScreen === 'booking' ? savedScreen : 'marketing');
        setCurrentRole('public');
      }

      if (!cancelled) setIsHydrated(true);
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [authUsesApi, refreshFromApi, user]);

  useEffect(() => {
    if (!usesApi || !isHydrated) return;
    refreshFromApi();
  }, [user, usesApi, isHydrated, refreshFromApi]);

  // Save states to local storage on changes
  const saveVehicles = (data: Vehicle[]) => {
    setVehicles(data);
    if (!usesApi) writeLocalStorageValue('vr_vehicles', JSON.stringify(data));
  };

  const saveBookings = (data: Booking[]) => {
    setBookings(data);
    if (!usesApi) writeLocalStorageValue('vr_bookings', JSON.stringify(data));
  };

  const saveReviews = (data: Review[]) => {
    setReviews(data);
    if (!usesApi) writeLocalStorageValue('vr_reviews', JSON.stringify(data));
  };

  const saveFavorites = (data: string[]) => {
    setFavoriteVehicleIds(data);
    if (!usesApi) writeLocalStorageValue('vr_favorites', JSON.stringify(data));
  };

  const handleSetRole = (role: ViewRole) => {
    const authUser = getStoredAuthUser();
    if (authUser && role !== 'public' && role !== 'marketplace' && role !== authUser.role) {
      setCurrentRole(authUser.role as ViewRole);
      writeLocalStorageValue('vr_current_role', authUser.role);
      return;
    }
    setCurrentRole(role);
    writeLocalStorageValue('vr_current_role', role);
  };

  const completeBookingFromDraft = (): CompletedBookingDetails | null => {
    const authUser = getStoredAuthUser();
    if (!canCreateBooking(authUser)) return null;

    const vehicle = vehicles.find((v) => v.id === bookingDraft.vehicleId);
    if (!vehicle || !bookingDraft.pickupDate || !bookingDraft.returnDate) return null;

    const start = new Date(`${bookingDraft.pickupDate}T${bookingDraft.pickupTime}`);
    const end = new Date(`${bookingDraft.returnDate}T${bookingDraft.returnTime}`);
    const rentalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const rentalCharges = vehicle.price * rentalDays;
    const taxes = Math.round(rentalCharges * 0.12);
    const securityDeposit = Math.round(vehicle.price * 0.5);
    const grandTotal = rentalCharges + taxes + securityDeposit;
    const bookingRef = `DX-${Date.now().toString().slice(-8)}`;

    const newBooking: Booking = {
      id: bookingRef,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleImage: vehicle.image,
      customerId: authUser?.id ?? 'user-guest',
      customerName: bookingDraft.fullName || authUser?.name || 'Guest',
      vendorId: vehicle.vendorId,
      startDate: bookingDraft.pickupDate,
      endDate: bookingDraft.returnDate,
      totalAmount: grandTotal,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    saveBookings([newBooking, ...bookings]);

    if (usesApi) {
      void apiClient
        .post('/api/bookings', {
          vehicleId: vehicle.id,
          startDate: bookingDraft.pickupDate,
          endDate: bookingDraft.returnDate,
          customerName: bookingDraft.fullName || authUser?.name,
        })
        .then(() => refreshFromApi());
    }

    const completed: CompletedBookingDetails = {
      bookingRef,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleImage: vehicle.image,
      vehicleCategory: vehicle.category,
      pickupLocation: bookingDraft.pickupLocation,
      returnLocation: bookingDraft.sameReturnLocation ? bookingDraft.pickupLocation : bookingDraft.returnLocation,
      destination: bookingDraft.destination,
      pickupDate: bookingDraft.pickupDate,
      pickupTime: bookingDraft.pickupTime,
      returnDate: bookingDraft.returnDate,
      returnTime: bookingDraft.returnTime,
      tripType: bookingDraft.tripType,
      rentalDays,
      fullName: bookingDraft.fullName,
      mobile: bookingDraft.mobile,
      email: bookingDraft.email,
      address1: bookingDraft.address1,
      city: bookingDraft.city,
      state: bookingDraft.state,
      postalCode: bookingDraft.postalCode,
      licenseNumber: bookingDraft.licenseNumber,
      emergencyContact: bookingDraft.emergencyContact,
      rentalCharges,
      taxes,
      securityDeposit,
      grandTotal,
      createdAt: new Date().toISOString(),
    };

    setLastCompletedBooking(completed);
    resetBookingDraft();
    return completed;
  };

  // Add a booking
  const addBooking = (vehicleId: string, startDate: string, endDate: string) => {
    const authUser = getStoredAuthUser();
    if (!canCreateBooking(authUser)) return;

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const totalAmount = calcBookingTotal(vehicle.price, startDate, endDate);

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      vehicleId,
      vehicleName: vehicle.name,
      vehicleImage: vehicle.image,
      customerId: authUser?.id ?? 'user-guest',
      customerName: authUser?.name ?? 'Guest',
      vendorId: vehicle.vendorId,
      startDate,
      endDate,
      totalAmount,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const updatedBookings = [newBooking, ...bookings];
    saveBookings(updatedBookings);

    if (usesApi) {
      void apiClient.post('/api/bookings', { vehicleId, startDate, endDate }).then(() => refreshFromApi());
    }

    if (!authUser || authUser.role === 'customer') {
      handleSetRole('customer');
    }
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    const authUser = getStoredAuthUser();
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!authUser || !targetBooking || !canManageBookingStatus(authUser, targetBooking, status)) {
      return;
    }

    const updatedBookings = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
    saveBookings(updatedBookings);
    saveVehicles(applyVehicleStatusesFromBookings(vehicles, updatedBookings));

    if (usesApi) {
      void apiClient.patch(`/api/bookings/${bookingId}/status`, { status }).then(() => refreshFromApi());
    }
  };

  // Add vehicle (vendor feature)
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'rating' | 'vendorId' | 'vendorName' | 'status'>) => {
    const authUser = getStoredAuthUser();
    if (!canAddVehicle(authUser)) return;

    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      rating: 5.0,
      vendorId: authUser?.vendorId ?? 'vendor-current',
      vendorName: authUser?.vendorName ?? 'Prestige Automotive Club',
      status: 'Available',
    };

    const updatedVehicles = [newVehicle, ...vehicles];
    saveVehicles(updatedVehicles);

    if (usesApi) {
      void apiClient.post('/api/vehicles', vehicleData).then(() => refreshFromApi());
    }
  };

  // Update vehicle status
  const updateVehicleStatus = (vehicleId: string, status: Vehicle['status']) => {
    const authUser = getStoredAuthUser();
    const targetVehicle = vehicles.find((v) => v.id === vehicleId);
    if (!authUser || !targetVehicle || !canUpdateVehicleStatus(authUser, targetVehicle)) return;

    const updatedVehicles = vehicles.map((v) => {
      if (v.id === vehicleId) {
        return { ...v, status };
      }
      return v;
    });
    saveVehicles(updatedVehicles);

    if (usesApi) {
      void apiClient.patch(`/api/vehicles/${vehicleId}/status`, { status }).then(() => refreshFromApi());
    }
  };

  // Delete vehicle
  const deleteVehicle = (vehicleId: string) => {
    const authUser = getStoredAuthUser();
    const targetVehicle = vehicles.find((v) => v.id === vehicleId);
    if (!authUser || !targetVehicle || !canDeleteVehicle(authUser, targetVehicle)) return;

    const updatedVehicles = vehicles.filter((v) => v.id !== vehicleId);
    saveVehicles(updatedVehicles);

    if (usesApi) {
      void apiClient.delete(`/api/vehicles/${vehicleId}`).then(() => refreshFromApi());
    }
  };

  // Add customer review
  const addReview = (vehicleId: string, rating: number, comment: string) => {
    const authUser = getStoredAuthUser();
    if (!canSubmitReview(authUser)) return;

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      vehicleId,
      vehicleName: vehicle.name,
      customerId: authUser?.id ?? 'user-guest',
      customerName: authUser?.name ?? 'Guest',
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedReviews = [newReview, ...reviews];
    saveReviews(updatedReviews);

    // Re-calculate vehicle rating average
    const vehReviews = updatedReviews.filter((r) => r.vehicleId === vehicleId);
    const avgRating = Number(
      (vehReviews.reduce((sum, r) => sum + r.rating, 0) / vehReviews.length).toFixed(1)
    );

    const updatedVehicles = vehicles.map((v) => {
      if (v.id === vehicleId) {
        return { ...v, rating: avgRating };
      }
      return v;
    });
    saveVehicles(updatedVehicles);

    if (usesApi) {
      void apiClient.post('/api/reviews', { vehicleId, rating, comment }).then(() => refreshFromApi());
    }
  };

  const toggleFavoriteVehicle = (vehicleId: string) => {
    const authUser = getStoredAuthUser();
    if (!authUser || authUser.role !== 'customer') return;

    const updatedFavorites = favoriteVehicleIds.includes(vehicleId)
      ? favoriteVehicleIds.filter((id) => id !== vehicleId)
      : [vehicleId, ...favoriteVehicleIds];
    saveFavorites(updatedFavorites);

    if (usesApi) {
      void apiClient.post('/api/favorites', { vehicleId }).then((res) => {
        if (res.ok) setFavoriteVehicleIds(res.data as string[]);
      });
    }
  };

  // Reset to default
  const resetData = () => {
    const authUser = getStoredAuthUser();
    if (!hasPermission(authUser, 'platform:reset')) return;

    if (usesApi) {
      void apiClient.post('/api/platform/reset').then(() => refreshFromApi());
      setCurrentRole('public');
      handleSetScreen('marketing');
      return;
    }

    const normalizedVehicles = DEFAULT_VEHICLES.map(applyFirebaseVehicleImages);
    const normalizedBookings = getSeedBookings();
    const syncedVehicles = applyVehicleStatusesFromBookings(normalizedVehicles, normalizedBookings);
    setVehicles(syncedVehicles);
    setBookings(normalizedBookings);
    setReviews(DEFAULT_REVIEWS);
    setFavoriteVehicleIds(DEFAULT_FAVORITES);
    setCurrentRole('public');
    handleSetScreen('marketing');
    writeLocalStorageValue('vr_vehicles', JSON.stringify(syncedVehicles));
    writeLocalStorageValue('vr_bookings', JSON.stringify(normalizedBookings));
    writeLocalStorageValue('vr_reviews', JSON.stringify(DEFAULT_REVIEWS));
    writeLocalStorageValue('vr_favorites', JSON.stringify(DEFAULT_FAVORITES));
    writeLocalStorageValue('vr_current_screen', 'marketing');
    writeLocalStorageValue(MOCK_DATA_VERSION_KEY, MOCK_DATA_VERSION);
  };

  return (
    <PlatformContext.Provider
      value={{
        vehicles,
        bookings,
        reviews,
        favoriteVehicleIds,
        currentRole,
        currentScreen,
        isHydrated,
        setCurrentRole: handleSetRole,
        setCurrentScreen: handleSetScreen,
        openLogin,
        openMarketing,
        openBooking,
        openDashboard,
        bookingDraft,
        updateBookingDraft,
        resetBookingDraft,
        lastCompletedBooking,
        completeBookingFromDraft,
        addBooking,
        updateBookingStatus,
        addVehicle,
        updateVehicleStatus,
        deleteVehicle,
        addReview,
        toggleFavoriteVehicle,
        resetData,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
}
