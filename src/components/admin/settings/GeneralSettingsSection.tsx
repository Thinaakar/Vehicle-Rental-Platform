'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

type GeneralSettingsSectionProps = {
  onResetDemo: () => void;
};

export default function GeneralSettingsSection({ onResetDemo }: GeneralSettingsSectionProps) {
  const { can } = usePermissions();

  if (!can('platform:settings')) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        You do not have permission to manage platform settings.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-premium">
        <h3 className="mb-6 text-sm font-extrabold uppercase tracking-wider text-slate-900">
          Platform Options
        </h3>
        <div className="space-y-4">
          {[
            'Auto-approve bookings under $500',
            'Email notifications for new reviews',
            'Maintenance alerts for inactive vehicles',
          ].map((setting) => (
            <label
              key={setting}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <span className="text-sm font-semibold text-slate-700">{setting}</span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-premium">
        <h3 className="mb-6 text-sm font-extrabold uppercase tracking-wider text-slate-900">
          Demo Data
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-500">
          Restore the full rental pipeline with sample bookings across all stages — pending, approved,
          active, completed, and cancelled.
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all demo vehicles, bookings, and reviews to defaults?')) {
              onResetDemo();
            }
          }}
          disabled={!can('platform:reset')}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset Demo Data
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-premium lg:col-span-2">
        <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-slate-900">
          Operational Notes
        </h3>
        <p className="text-sm leading-relaxed text-slate-500">
          This section can hold environment toggles, SLA thresholds, payout rules, and maintenance
          workflows for production use.
        </p>
      </div>
    </div>
  );
}
