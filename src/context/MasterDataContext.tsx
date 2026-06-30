'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { SelectOption } from '@/components/ui/PremiumSelect';
import { mergeMasterData, type MasterDataBundle } from '@/data/master-data';
import { apiClient } from '@/lib/api/client';
import { readStoredMasterData, writeStoredMasterData } from '@/lib/demo-storage';
import type { VendorRecord } from '@/lib/types/records';

type MasterDataContextType = {
  isLoaded: boolean;
  locations: string[];
  categories: string[];
  vendors: VendorRecord[];
  locationOptions: SelectOption[];
  locationOptionsRequired: SelectOption[];
  categoryOptions: SelectOption[];
  refresh: () => Promise<void>;
  addLocation: (value: string) => Promise<boolean>;
  addCategory: (value: string) => Promise<boolean>;
  removeLocation: (value: string) => Promise<boolean>;
  removeCategory: (value: string) => Promise<boolean>;
  addVendor: (input: { name: string; location?: string }) => Promise<boolean>;
};

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

function toLocationOptions(locations: string[], includeEmpty = true): SelectOption[] {
  const items = locations.map((location) => ({ value: location, label: location }));
  return includeEmpty ? [{ value: '', label: 'Select Location' }, ...items] : items;
}

function toCategoryOptions(categories: string[]): SelectOption[] {
  return categories.map((category) => ({ value: category, label: category }));
}

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
  const [bundle, setBundle] = useState<MasterDataBundle>(() => mergeMasterData(readStoredMasterData()));
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [masterResult, vendorResult] = await Promise.all([
      apiClient.get<MasterDataBundle>('/api/master-data'),
      apiClient.get<VendorRecord[]>('/api/vendors'),
    ]);

    const mergedMaster = mergeMasterData(
      masterResult.ok ? masterResult.data : readStoredMasterData(),
    );
    setBundle(mergedMaster);
    writeStoredMasterData(mergedMaster);

    if (vendorResult.ok) {
      setVendors(vendorResult.data);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateMaster = useCallback(async (action: 'add' | 'remove', type: 'locations' | 'categories', value: string) => {
    const result = await apiClient.post<MasterDataBundle>('/api/master-data', { action, type, value });
    if (!result.ok) return false;

    const merged = mergeMasterData(result.data);
    setBundle(merged);
    writeStoredMasterData(merged);
    return true;
  }, []);

  const addLocation = useCallback((value: string) => updateMaster('add', 'locations', value), [updateMaster]);
  const addCategory = useCallback((value: string) => updateMaster('add', 'categories', value), [updateMaster]);
  const removeLocation = useCallback((value: string) => updateMaster('remove', 'locations', value), [updateMaster]);
  const removeCategory = useCallback((value: string) => updateMaster('remove', 'categories', value), [updateMaster]);

  const addVendor = useCallback(async (input: { name: string; location?: string }) => {
    const result = await apiClient.post<VendorRecord>('/api/vendors', input);
    if (!result.ok) return false;
    setVendors((current) => [...current, result.data].sort((a, b) => a.name.localeCompare(b.name)));
    return true;
  }, []);

  const value = useMemo(
    () => ({
      isLoaded,
      locations: bundle.locations,
      categories: bundle.categories,
      vendors,
      locationOptions: toLocationOptions(bundle.locations, true),
      locationOptionsRequired: toLocationOptions(bundle.locations, false),
      categoryOptions: toCategoryOptions(bundle.categories),
      refresh,
      addLocation,
      addCategory,
      removeLocation,
      removeCategory,
      addVendor,
    }),
    [
      isLoaded,
      bundle,
      vendors,
      refresh,
      addLocation,
      addCategory,
      removeLocation,
      removeCategory,
      addVendor,
    ],
  );

  return <MasterDataContext.Provider value={value}>{children}</MasterDataContext.Provider>;
}

export function useMasterData() {
  const ctx = useContext(MasterDataContext);
  if (!ctx) throw new Error('useMasterData must be used within MasterDataProvider');
  return ctx;
}
