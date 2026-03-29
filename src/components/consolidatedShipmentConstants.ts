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

/** Merukazim: destination country is GB or UK only (distinct selectable values). */
export const MERUKAZIM_DESTINATIONS = [
  { value: 'gb', label: 'GB', country: 'GB' },
  { value: 'uk', label: 'UK', country: 'UK' },
] as const;

/** Resolve stored destination string to Merukazim select value (handles legacy `United Kingdom`). */
export function merukazimDestinationKeyFromDestination(destination: string): string {
  const match = MERUKAZIM_DESTINATIONS.find((d) => d.country === destination);
  if (match) return match.value;
  if (destination === 'United Kingdom') return 'gb';
  return '';
}

export const SHIPPING_ROUTES: Record<string, { value: string; label: string }[]> = {
  gb: [
    { value: 'gb-std', label: 'UK Standard — hub sort' },
    { value: 'gb-exp', label: 'UK Express — 48h' },
  ],
  uk: [
    { value: 'uk-std', label: 'UK Standard — hub sort' },
    { value: 'uk-exp', label: 'UK Express — 48h' },
  ],
};

/** Shown for new Bulk packs — never blank in the consolidated table. */
export const BULK_DESTINATION_PLACEHOLDER = 'United States';

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
