import { RENTAL_LOCATIONS } from '@/data/rental-locations';
import { vehicleCategoryOptions } from '@/data/select-options';
import { SEED_VENDORS } from '@/data/seed-defaults';
import type { VendorRecord } from '@/lib/types/records';

export type MasterDataBundle = {
  locations: string[];
  categories: string[];
};

export const MASTER_DATA_STORAGE_KEY = 'vr_master_data';

export function getDefaultMasterData(): MasterDataBundle {
  return {
    locations: [...RENTAL_LOCATIONS],
    categories: vehicleCategoryOptions.map((option) => option.value),
  };
}

export function getDefaultMasterVendors(): VendorRecord[] {
  return SEED_VENDORS.map((vendor) => ({
    ...vendor,
    createdAt: '',
    updatedAt: '',
  }));
}

export function mergeMasterData(partial: Partial<MasterDataBundle> | null | undefined): MasterDataBundle {
  const defaults = getDefaultMasterData();
  if (!partial) return defaults;

  return {
    locations: partial.locations?.length ? [...partial.locations] : defaults.locations,
    categories: partial.categories?.length ? [...partial.categories] : defaults.categories,
  };
}
