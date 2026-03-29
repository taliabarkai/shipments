import type { ConsolidatedCarrierType, ConsolidatedShipment } from './ConsolidatedShipmentsApp';

/** Bulk carriers — facility-configured list */
export const BULK_CARRIERS = [
  { id: 'mailog-express', name: 'Mailog Express' },
  { id: 'mailog-hu', name: 'Mailog HU' },
  { id: 'landmarkuk', name: 'LandmarkUK' },
  { id: 'landmarkau', name: 'LandmarkAU' },
  { id: 'mailog-hu-us', name: 'Mailog HU US' },
  { id: 'landmark', name: 'Landmark' },
  { id: 'mailog', name: 'Mailog' },
] as const;

/** Merukazim carriers */
export const MERUKAZIM_CARRIERS = [
  { id: 'dhl', name: 'DHL' },
  { id: 'dhl-royal', name: 'DHL Royal' },
  { id: 'dhl-royal-hu', name: 'DHL Royal HU' },
] as const;

export const MERUKAZIM_DESTINATIONS = [
  { value: 'gb', label: 'GB / United Kingdom', country: 'United Kingdom' },
  { value: 'us', label: 'US / United States', country: 'United States' },
  { value: 'de', label: 'DE / Germany', country: 'Germany' },
  { value: 'fr', label: 'FR / France', country: 'France' },
  { value: 'ca', label: 'CA / Canada', country: 'Canada' },
  { value: 'au', label: 'AU / Australia', country: 'Australia' },
] as const;

export const SHIPPING_ROUTES: Record<string, { value: string; label: string }[]> = {
  gb: [
    { value: 'gb-std', label: 'UK Standard — hub sort' },
    { value: 'gb-exp', label: 'UK Express — 48h' },
  ],
  us: [
    { value: 'us-east', label: 'US East Coast linehaul' },
    { value: 'us-west', label: 'US West Coast linehaul' },
    { value: 'us-central', label: 'US Central hub' },
  ],
  de: [
    { value: 'de-de', label: 'DE Domestic' },
    { value: 'de-eu', label: 'DE → EU consolidation' },
  ],
  fr: [
    { value: 'fr-dom', label: 'France Domestic' },
    { value: 'fr-eu', label: 'France → EU' },
  ],
  ca: [{ value: 'ca-std', label: 'Canada Standard' }],
  au: [{ value: 'au-std', label: 'Australia Standard' }],
};

export const BULK_DESTINATION_PLACEHOLDER = '—';

export function parseCarrierOption(
  id: string
): { type: ConsolidatedCarrierType; carrierName: string } | null {
  if (!id || !id.includes('::')) return null;
  const [kind, cid] = id.split('::');
  if (kind === 'bulk') {
    const c = BULK_CARRIERS.find((b) => b.id === cid);
    return c ? { type: 'Bulk', carrierName: c.name } : null;
  }
  if (kind === 'merukazim') {
    const c = MERUKAZIM_CARRIERS.find((m) => m.id === cid);
    return c ? { type: 'Merukazim', carrierName: c.name } : null;
  }
  return null;
}

export function findCarrierOptionId(s: ConsolidatedShipment): string {
  const name = s.carrier;
  if (s.carrierType === 'Bulk') {
    const c = BULK_CARRIERS.find((b) => b.name === name);
    return c ? `bulk::${c.id}` : '';
  }
  if (s.carrierType === 'Merukazim') {
    const c =
      MERUKAZIM_CARRIERS.find((m) => m.name === name) ??
      (name === 'Dhl' ? MERUKAZIM_CARRIERS.find((m) => m.id === 'dhl') : undefined);
    return c ? `merukazim::${c.id}` : '';
  }
  const bulk = BULK_CARRIERS.find((b) => b.name === name);
  if (bulk) return `bulk::${bulk.id}`;
  const mer =
    MERUKAZIM_CARRIERS.find((m) => m.name === name) ??
    (name === 'Dhl' ? MERUKAZIM_CARRIERS.find((m) => m.id === 'dhl') : undefined);
  if (mer) return `merukazim::${mer.id}`;
  return '';
}
