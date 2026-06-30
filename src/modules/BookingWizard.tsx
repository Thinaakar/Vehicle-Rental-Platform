'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  CheckCircle2,
  Download,
  Fuel,
  Gauge,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import SafeImage from '@/components/SafeImage';
import PremiumSelect from '@/components/ui/PremiumSelect';
import { usePlatform } from '@/context/PlatformContext';
import { useAuth } from '@/context/AuthContext';
import { useMasterData } from '@/context/MasterDataContext';
import { toSelectOptions } from '@/data/select-options';
import { cn } from '@/lib/utils';

const STEPS = [
  'Select Vehicle',
  'Trip Details',
  'Customer Info',
  'Summary',
  'Confirmation',
] as const;

function calcRentalDays(pickupDate: string, returnDate: string) {
  if (!pickupDate || !returnDate) return 0;
  const start = new Date(pickupDate);
  const end = new Date(returnDate);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
}

export default function BookingWizard() {
  const {
    vehicles,
    bookingDraft,
    updateBookingDraft,
    completeBookingFromDraft,
    lastCompletedBooking,
    openMarketing,
    openDashboard,
    openLogin,
  } = usePlatform();
  const { isAuthenticated } = useAuth();
  const { locations } = useMasterData();
  const locationOptions = useMemo(() => toSelectOptions(locations), [locations]);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'cards' | 'dropdown'>('cards');

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === bookingDraft.vehicleId) ?? null,
    [vehicles, bookingDraft.vehicleId],
  );

  const rentalDays = calcRentalDays(bookingDraft.pickupDate, bookingDraft.returnDate);
  const rentalCharges = selectedVehicle ? selectedVehicle.price * Math.max(rentalDays, 1) : 0;
  const taxes = Math.round(rentalCharges * 0.12);
  const securityDeposit = selectedVehicle ? Math.round(selectedVehicle.price * 0.5) : 0;
  const grandTotal = rentalCharges + taxes + securityDeposit;

  useEffect(() => {
    if (!bookingDraft.pickupDate && locations.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const end = new Date();
      end.setDate(end.getDate() + 3);
      const defaultLocation = locations[0];
      updateBookingDraft({
        pickupDate: today,
        returnDate: end.toISOString().split('T')[0],
        pickupLocation: defaultLocation,
        returnLocation: defaultLocation,
        destination: bookingDraft.destination || defaultLocation,
      });
    }
  }, [bookingDraft.pickupDate, bookingDraft.destination, locations, updateBookingDraft]);

  const validateStep = (current: number) => {
    const nextErrors: Record<string, string> = {};
    if (current === 1 && !bookingDraft.vehicleId) nextErrors.vehicleId = 'Please select a vehicle.';
    if (current === 2) {
      if (!bookingDraft.pickupLocation) nextErrors.pickupLocation = 'Pickup location is required.';
      if (!bookingDraft.destination) nextErrors.destination = 'Destination is required.';
      if (!bookingDraft.pickupDate) nextErrors.pickupDate = 'Pickup date is required.';
      if (!bookingDraft.returnDate) nextErrors.returnDate = 'Return date is required.';
      if (bookingDraft.pickupDate && bookingDraft.returnDate && rentalDays < 1) {
        nextErrors.returnDate = 'Return must be after pickup.';
      }
    }
    if (current === 3) {
      if (!bookingDraft.fullName.trim()) nextErrors.fullName = 'Full name is required.';
      if (!bookingDraft.mobile.trim()) nextErrors.mobile = 'Mobile number is required.';
      if (!bookingDraft.email.trim()) nextErrors.email = 'Email is required.';
      if (!bookingDraft.address1.trim()) nextErrors.address1 = 'Address is required.';
      if (!bookingDraft.city.trim()) nextErrors.city = 'City is required.';
      if (!bookingDraft.licenseNumber.trim()) nextErrors.licenseNumber = 'License number is required.';
    }
    if (current === 4 && !bookingDraft.acceptedTerms) {
      nextErrors.acceptedTerms = 'You must accept the terms and conditions.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step === 4) {
      const result = completeBookingFromDraft();
      if (result) setStep(5);
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  };

  const handleBack = () => {
    if (step === 1) {
      openMarketing();
      return;
    }
    setStep((s) => Math.max(1, s - 1));
    setErrors({});
  };

  const handleDashboard = () => {
    if (isAuthenticated) openDashboard();
    else openLogin();
  };

  if (step === 5 && lastCompletedBooking) {
    const b = lastCompletedBooking;
    return (
      <div className="min-h-screen bg-slate-50">
        <MarketingNav />
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="overflow-hidden rounded-[28px] border border-emerald-200/60 bg-white shadow-2xl shadow-emerald-500/10">
            <div className="bg-gradient-to-r from-primary to-secondary px-8 py-10 text-white">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-10 w-10" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-50">Booking Confirmed</p>
                  <h1 className="text-3xl font-black tracking-tight">Your reservation is secured</h1>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking ID</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{b.bookingRef}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard title="Vehicle" value={b.vehicleName} />
                  <InfoCard title="Duration" value={`${b.rentalDays} day(s)`} />
                  <InfoCard title="Pickup" value={`${b.pickupLocation} · ${b.pickupDate}`} />
                  <InfoCard title="Destination" value={b.destination} />
                  <InfoCard title="Customer" value={b.fullName} />
                  <InfoCard title="Contact" value={b.mobile} />
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Rental charges</span>
                    <span className="font-bold">${b.rentalCharges}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Taxes</span>
                    <span className="font-bold">${b.taxes}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Security deposit</span>
                    <span className="font-bold">${b.securityDeposit}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="font-bold text-slate-900">Grand Total</span>
                    <span className="text-2xl font-black text-slate-900">${b.grandTotal}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <SafeImage
                  src={b.vehicleImage}
                  alt={b.vehicleName}
                  fallbackLabel={b.vehicleName}
                  className="h-48 w-full rounded-2xl object-cover"
                />
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </button>
                <button
                  type="button"
                  onClick={handleDashboard}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go To Dashboard
                </button>
                <button
                  type="button"
                  onClick={openMarketing}
                  className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  Back to website
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <MarketingNav />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <button
          type="button"
          onClick={openMarketing}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to website
        </button>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Premium Booking</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Reserve your vehicle</h1>
          <p className="mt-2 text-sm text-slate-500">Complete the guided rental journey in five simple steps.</p>
        </div>

        <Stepper current={step} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">Select your vehicle</h2>
                  <div className="flex rounded-xl border border-slate-200 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      className={cn('rounded-lg px-3 py-1.5', viewMode === 'cards' && 'bg-slate-900 text-white')}
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('dropdown')}
                      className={cn('rounded-lg px-3 py-1.5', viewMode === 'dropdown' && 'bg-slate-900 text-white')}
                    >
                      Dropdown
                    </button>
                  </div>
                </div>

                {viewMode === 'dropdown' ? (
                  <PremiumSelect
                    value={bookingDraft.vehicleId}
                    onChange={(vehicleId) => updateBookingDraft({ vehicleId })}
                    placeholder="Choose a vehicle"
                    size="lg"
                    options={[
                      { value: '', label: 'Choose a vehicle' },
                      ...vehicles
                        .filter((vehicle) => vehicle.status === 'Available')
                        .map((vehicle) => ({
                          value: vehicle.id,
                          label: `${vehicle.name} · $${vehicle.price}/day`,
                        })),
                    ]}
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {vehicles.filter((v) => v.status === 'Available').map((vehicle) => {
                      const selected = bookingDraft.vehicleId === vehicle.id;
                      return (
                        <button
                          key={vehicle.id}
                          type="button"
                          onClick={() => updateBookingDraft({ vehicleId: vehicle.id })}
                          className={cn(
                            'overflow-hidden rounded-2xl border text-left transition-all',
                            selected
                              ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-md',
                          )}
                        >
                          <SafeImage
                            src={vehicle.image}
                            alt={vehicle.name}
                            fallbackLabel={vehicle.name}
                            className="h-36 w-full object-cover"
                          />
                          <div className="p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{vehicle.category}</p>
                            <h3 className="mt-1 font-bold text-slate-900">{vehicle.name}</h3>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                              <span>{vehicle.fuel}</span>
                              <span>{vehicle.transmission}</span>
                              <span>{vehicle.seats} seats</span>
                              <span className="font-bold text-slate-900">${vehicle.price}/day</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.vehicleId && <p className="text-sm font-medium text-red-500">{errors.vehicleId}</p>}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-black text-slate-900">Trip details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Pickup Location" error={errors.pickupLocation}>
                    <PremiumSelect
                      value={bookingDraft.pickupLocation}
                      onChange={(pickupLocation) =>
                        updateBookingDraft({
                          pickupLocation,
                          returnLocation: bookingDraft.sameReturnLocation
                            ? pickupLocation
                            : bookingDraft.returnLocation,
                        })
                      }
                      options={locationOptions}
                      size="lg"
                    />
                  </Field>
                  <Field label="Return Location" error={errors.returnLocation}>
                    <PremiumSelect
                      value={
                        bookingDraft.sameReturnLocation
                          ? bookingDraft.pickupLocation
                          : bookingDraft.returnLocation
                      }
                      disabled={bookingDraft.sameReturnLocation}
                      onChange={(returnLocation) => updateBookingDraft({ returnLocation })}
                      options={locationOptions}
                      size="lg"
                    />
                  </Field>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={bookingDraft.sameReturnLocation}
                    onChange={(e) =>
                      updateBookingDraft({
                        sameReturnLocation: e.target.checked,
                        returnLocation: e.target.checked ? bookingDraft.pickupLocation : bookingDraft.returnLocation,
                      })
                    }
                    className="rounded border-slate-300"
                  />
                  Return to same location
                </label>

                <Field label="Destination / Drop Location" error={errors.destination}>
                  <PremiumSelect
                    value={bookingDraft.destination}
                    onChange={(destination) => updateBookingDraft({ destination })}
                    options={locationOptions}
                    size="lg"
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Pickup Date" error={errors.pickupDate}>
                    <input type="date" value={bookingDraft.pickupDate} onChange={(e) => updateBookingDraft({ pickupDate: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Pickup Time">
                    <input type="time" value={bookingDraft.pickupTime} onChange={(e) => updateBookingDraft({ pickupTime: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Return Date" error={errors.returnDate}>
                    <input type="date" value={bookingDraft.returnDate} onChange={(e) => updateBookingDraft({ returnDate: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Return Time">
                    <input type="time" value={bookingDraft.returnTime} onChange={(e) => updateBookingDraft({ returnTime: e.target.value })} className="field-input" />
                  </Field>
                </div>

                <div className="flex gap-3">
                  {(['round-trip', 'one-way'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateBookingDraft({ tripType: type })}
                      className={cn(
                        'rounded-2xl border px-4 py-3 text-sm font-bold capitalize transition',
                        bookingDraft.tripType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300',
                      )}
                    >
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-black text-slate-900">Customer information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full Name" error={errors.fullName}>
                    <input value={bookingDraft.fullName} onChange={(e) => updateBookingDraft({ fullName: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Mobile Number" error={errors.mobile}>
                    <input value={bookingDraft.mobile} onChange={(e) => updateBookingDraft({ mobile: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Email Address" error={errors.email}>
                    <input type="email" value={bookingDraft.email} onChange={(e) => updateBookingDraft({ email: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Emergency Contact">
                    <input value={bookingDraft.emergencyContact} onChange={(e) => updateBookingDraft({ emergencyContact: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Address Line 1" error={errors.address1} className="md:col-span-2">
                    <input value={bookingDraft.address1} onChange={(e) => updateBookingDraft({ address1: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Address Line 2" className="md:col-span-2">
                    <input value={bookingDraft.address2} onChange={(e) => updateBookingDraft({ address2: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="City" error={errors.city}>
                    <input value={bookingDraft.city} onChange={(e) => updateBookingDraft({ city: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="State">
                    <input value={bookingDraft.state} onChange={(e) => updateBookingDraft({ state: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Postal Code">
                    <input value={bookingDraft.postalCode} onChange={(e) => updateBookingDraft({ postalCode: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Driving License Number" error={errors.licenseNumber}>
                    <input value={bookingDraft.licenseNumber} onChange={(e) => updateBookingDraft({ licenseNumber: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Driving License Upload" className="md:col-span-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm font-semibold text-slate-500 transition hover:border-primary hover:text-primary">
                      <Upload className="h-4 w-4" />
                      {bookingDraft.licenseFileName || 'Upload license image or PDF'}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          updateBookingDraft({ licenseFileName: e.target.files?.[0]?.name ?? '' })
                        }
                      />
                    </label>
                  </Field>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-900">Booking summary</h2>
                <SummaryBlock title="Selected Vehicle" value={selectedVehicle?.name ?? '—'} />
                <SummaryBlock title="Pickup" value={`${bookingDraft.pickupLocation} · ${bookingDraft.pickupDate} ${bookingDraft.pickupTime}`} />
                <SummaryBlock title="Destination" value={bookingDraft.destination} />
                <SummaryBlock title="Customer" value={`${bookingDraft.fullName} · ${bookingDraft.email}`} />
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2 text-sm">
                  <Row label="Rental charges" value={`$${rentalCharges}`} />
                  <Row label="Taxes (12%)" value={`$${taxes}`} />
                  <Row label="Security deposit" value={`$${securityDeposit}`} />
                  <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-slate-900">
                    <span>Grand Total</span>
                    <span>${grandTotal}</span>
                  </div>
                </div>
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={bookingDraft.acceptedTerms}
                    onChange={(e) => updateBookingDraft({ acceptedTerms: e.target.checked })}
                    className="mt-1"
                  />
                  <span>I agree to the rental terms, insurance policy, and vehicle usage conditions.</span>
                </label>
                {errors.acceptedTerms && <p className="text-sm font-medium text-red-500">{errors.acceptedTerms}</p>}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                {step === 4 ? 'Confirm Booking' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="sticky top-28 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Trip Summary</p>
              {selectedVehicle ? (
                <>
                  <SafeImage
                    src={selectedVehicle.image}
                    alt={selectedVehicle.name}
                    fallbackLabel={selectedVehicle.name}
                    className="mt-4 h-40 w-full rounded-2xl object-cover"
                  />
                  <h3 className="mt-4 text-lg font-black text-slate-900">{selectedVehicle.name}</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <SummaryLine icon={Car} label={selectedVehicle.category} />
                    <SummaryLine icon={Fuel} label={selectedVehicle.fuel} />
                    <SummaryLine icon={Gauge} label={selectedVehicle.transmission} />
                    <SummaryLine icon={Users} label={`${selectedVehicle.seats} seats`} />
                    <SummaryLine icon={MapPin} label={bookingDraft.pickupLocation || 'Pickup TBD'} />
                    <SummaryLine icon={Calendar} label={rentalDays ? `${rentalDays} day rental` : 'Dates TBD'} />
                  </div>
                  <div className="mt-5 rounded-2xl bg-slate-900 px-4 py-3 text-white">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Estimated total</p>
                    <p className="text-2xl font-black">${grandTotal || selectedVehicle.price}</p>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Select a vehicle to preview your trip summary.</p>
              )}
            </div>

            <div className="rounded-[28px] border border-cyan-200/60 bg-cyan-50 p-5 text-sm text-cyan-900">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="h-4 w-4" />
                Fully insured premium fleet
              </div>
              <p className="mt-2 text-cyan-800/80">Your progress is auto-saved as you complete each step.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[720px] items-center gap-3">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const active = current === stepNumber;
          const done = current > stepNumber;
          return (
            <React.Fragment key={label}>
              <div className="flex min-w-[120px] flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black transition',
                    done && 'border-emerald-500 bg-emerald-500 text-white',
                    active && !done && 'border-primary bg-primary text-white',
                    !active && !done && 'border-slate-200 bg-white text-slate-400',
                  )}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
                </div>
                <span className={cn('text-center text-xs font-bold', active ? 'text-slate-900' : 'text-slate-400')}>
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn('mb-6 h-0.5 flex-1 rounded-full', done ? 'bg-emerald-400' : 'bg-slate-200')} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}

function SummaryBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}

function SummaryLine({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <span>{label}</span>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
