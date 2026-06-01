import type { ActivationFieldId } from './upgradeDowngradeTypes';

/** Lookup catalogs for upgrade/downgrade activation rules. Replace with real APIs when available. */
export interface UpgradeRuleLookups {
  brands: string[];
  destinationCountries: string[];
  packingFacilities: string[];
}

export function optionsForActivationField(
  lookups: UpgradeRuleLookups | null,
  field: ActivationFieldId,
): string[] {
  if (!lookups) return [];
  switch (field) {
    case 'brand':
      return lookups.brands;
    case 'destination_country':
      return lookups.destinationCountries;
    case 'packing_facility':
      return lookups.packingFacilities;
    default:
      return [];
  }
}

/** Simulates loading catalogs from their respective services when the drawer opens. */
export async function fetchUpgradeRuleLookups(): Promise<UpgradeRuleLookups> {
  await new Promise((r) => setTimeout(r, 120));
  return {
    brands: ['MYKA', 'Brand B', 'OAL', 'TGR', 'LAL', 'IB', 'MNN'],
    destinationCountries: ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'IL', 'JP'],
    packingFacilities: ['Kiryat Gat', 'NZ', 'TH', 'HU', 'FL'],
  };
}
