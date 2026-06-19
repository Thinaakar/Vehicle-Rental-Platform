'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Booking } from '@/context/PlatformContext';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<Booking['status'], string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-100',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Active: 'bg-sky-50 text-sky-700 border-sky-100',
  Completed: 'bg-slate-50 text-slate-500 border-slate-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
};

export function BookingStatusBadge({ status }: { status: Booking['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase',
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

type BookingPipelineActionsProps = {
  booking: Booking;
  onUpdateStatus: (bookingId: string, status: Booking['status']) => void;
  compact?: boolean;
};

export function BookingPipelineActions({ booking, onUpdateStatus, compact }: BookingPipelineActionsProps) {
  const { canManageBooking } = usePermissions();

  if (!canManageBooking(booking)) {
    return <span className="text-[10px] font-bold uppercase text-slate-300">—</span>;
  }

  if (booking.status === 'Pending' && canManageBooking(booking, 'Approved')) {
    return (
      <div className="flex justify-end gap-1">
        <button
          type="button"
          onClick={() => onUpdateStatus(booking.id, 'Approved')}
          className={cn(
            'rounded-lg bg-emerald-600 text-white hover:bg-emerald-700',
            compact ? 'p-1.5' : 'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
          )}
          title="Approve booking"
        >
          {compact ? <CheckCircle2 className="h-4 w-4" /> : 'Approve'}
        </button>
        {canManageBooking(booking, 'Cancelled') && (
          <button
            type="button"
            onClick={() => onUpdateStatus(booking.id, 'Cancelled')}
            className={cn(
              'rounded-lg bg-rose-600 text-white hover:bg-rose-700',
              compact ? 'p-1.5' : 'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
            )}
            title="Cancel booking"
          >
            {compact ? <XCircle className="h-4 w-4" /> : 'Decline'}
          </button>
        )}
      </div>
    );
  }

  if (booking.status === 'Approved' && canManageBooking(booking, 'Active')) {
    return (
      <button
        type="button"
        onClick={() => onUpdateStatus(booking.id, 'Active')}
        className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-primary-dark"
      >
        Dispatch
      </button>
    );
  }

  if (booking.status === 'Active' && canManageBooking(booking, 'Completed')) {
    return (
      <button
        type="button"
        onClick={() => onUpdateStatus(booking.id, 'Completed')}
        className="rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-slate-800"
      >
        Complete
      </button>
    );
  }

  return <span className="text-[10px] font-bold uppercase text-slate-400">Archived</span>;
}
