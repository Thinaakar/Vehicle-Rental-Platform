'use client';

import React, { useState } from 'react';
import { Building2, Car, MapPin, Plus, Trash2 } from 'lucide-react';
import { useMasterData } from '@/context/MasterDataContext';
import { usePermissions } from '@/hooks/usePermissions';
import SettingsFormPanel, { SettingsField, SettingsInput } from '@/components/admin/settings/SettingsFormPanel';

type MasterFormType = 'location' | 'category' | 'vendor' | null;

export default function MasterDataSection() {
  const { can } = usePermissions();
  const {
    locations,
    categories,
    vendors,
    addLocation,
    addCategory,
    removeLocation,
    removeCategory,
    addVendor,
  } = useMasterData();

  const [formType, setFormType] = useState<MasterFormType>(null);
  const [value, setValue] = useState('');
  const [vendorLocation, setVendorLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openForm = (type: MasterFormType) => {
    setFormType(type);
    setValue('');
    setVendorLocation('');
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!formType) return;

    setSaving(true);
    let ok = false;

    if (formType === 'location') {
      if (!value.trim()) {
        setError('Location is required');
        setSaving(false);
        return;
      }
      ok = await addLocation(value);
    } else if (formType === 'category') {
      if (!value.trim()) {
        setError('Category is required');
        setSaving(false);
        return;
      }
      ok = await addCategory(value);
    } else if (formType === 'vendor') {
      if (!value.trim()) {
        setError('Vendor name is required');
        setSaving(false);
        return;
      }
      ok = await addVendor({ name: value, location: vendorLocation || undefined });
    }

    if (!ok) {
      setError('Could not save entry. It may already exist.');
      setSaving(false);
      return;
    }

    setFormType(null);
    setSaving(false);
  };

  if (!can('platform:settings')) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        You do not have permission to view master data.
      </div>
    );
  }

  const formTitle =
    formType === 'location' ? 'Add Location' : formType === 'category' ? 'Add Category' : 'Add Vendor';

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Manage reference data used in booking flows, fleet forms, and marketplace filters.
      </p>

      <SettingsFormPanel
        open={formType !== null}
        title={formTitle}
        subtitle="New entries appear across the platform immediately"
        submitLabel="Add Entry"
        error={error}
        saving={saving}
        onClose={() => setFormType(null)}
        onSubmit={() => void handleSubmit()}
      >
        <SettingsField
          label={formType === 'vendor' ? 'Vendor Name' : formType === 'category' ? 'Category' : 'Location'}
          required
        >
          <SettingsInput
            value={value}
            onChange={setValue}
            placeholder={
              formType === 'vendor'
                ? 'Coastal Luxury Rentals'
                : formType === 'category'
                  ? 'Convertibles'
                  : 'Austin, TX'
            }
          />
        </SettingsField>
        {formType === 'vendor' && (
          <SettingsField label="Location">
            <SettingsInput value={vendorLocation} onChange={setVendorLocation} placeholder="City, State" />
          </SettingsField>
        )}
      </SettingsFormPanel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MasterDataCard
          icon={MapPin}
          title="Rental Locations"
          onAdd={() => openForm('location')}
          items={locations}
          onRemove={(item) => void removeLocation(item)}
        />
        <MasterDataCard
          icon={Car}
          title="Vehicle Categories"
          onAdd={() => openForm('category')}
          items={categories}
          onRemove={(item) => void removeCategory(item)}
        />
        <MasterDataVendorCard vendors={vendors} onAdd={() => openForm('vendor')} />
      </div>
    </div>
  );
}

function MasterDataCard({
  icon: Icon,
  title,
  items,
  onAdd,
  onRemove,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  onAdd: () => void;
  onRemove: (item: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-premium">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-rose-600"
              aria-label={`Remove ${item}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MasterDataVendorCard({
  vendors,
  onAdd,
}: {
  vendors: Array<{ id: string; name: string; location?: string }>;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-premium">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">Vendors</h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {vendors.map((vendor) => (
          <li key={vendor.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-sm font-semibold text-slate-800">{vendor.name}</p>
            <p className="text-xs text-slate-500">{vendor.location || '—'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
