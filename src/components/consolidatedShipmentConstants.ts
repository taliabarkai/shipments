import type {
  ConsolidatedCarrierType,
  ConsolidatedPack,
  ConsolidatedShipment,
} from './ConsolidatedShipmentsApp';

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

/** Merukazim: carrier defines origin → destination; no separate route in the product model. */
export const MERUKAZIM_CARRIERS = [
  { id: 'dhl', name: 'DHL', origin: 'IL', destination: 'US' },
  { id: 'dhl-royal-hu', name: 'DHL Royal HU', origin: 'HU', destination: 'GB' },
] as const;

export type MerukazimCarrierConfig = (typeof MERUKAZIM_CARRIERS)[number];

/** Stored destination for bulk consolidated rows (multiple EU destinations — single label in UI). */
export const BULK_DESTINATION_STORED = 'EU';

/** @deprecated Use BULK_DESTINATION_STORED */
export const BULK_DESTINATION_PLACEHOLDER = BULK_DESTINATION_STORED;

export function merukazimLogisticsByCarrierName(
  carrierName: string
): { origin: string; destination: string } | null {
  const name = carrierName?.trim() ?? '';
  const row =
    MERUKAZIM_CARRIERS.find((m) => m.name === name) ??
    (name === 'Dhl' ? MERUKAZIM_CARRIERS.find((m) => m.id === 'dhl') : undefined);
  return row ? { origin: row.origin, destination: row.destination } : null;
}

export function merukazimConfigByCarrierId(carrierId: string): MerukazimCarrierConfig | undefined {
  return MERUKAZIM_CARRIERS.find((m) => m.id === carrierId);
}

/** Carrier name matches a Merukazim option in the create/edit dropdown (exact label). */
export function carrierNameIsMerukazim(carrier: string): boolean {
  const name = carrier?.trim() ?? '';
  if (!name) return false;
  if (MERUKAZIM_CARRIERS.some((m) => m.name === name)) return true;
  if (name === 'Dhl') return true;
  return false;
}

/**
 * Bulk vs Merukazim for UI: explicit `carrierType` wins; otherwise infer from `carrier` name
 * so only Merukazim-listed carriers get lane-specific destination (all others behave as Bulk / EU).
 */
export function inferredConsolidatedCarrierType(s: ConsolidatedShipment): ConsolidatedCarrierType {
  if (s.carrierType === 'Bulk' || s.carrierType === 'Merukazim') {
    return s.carrierType;
  }
  return carrierNameIsMerukazim(s.carrier) ? 'Merukazim' : 'Bulk';
}

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

/** Packs for read-only / table; falls back to one pack containing all `orders`. */
export function normalizedConsolidatedPacks(s: ConsolidatedShipment): ConsolidatedPack[] {
  if (s.packs && s.packs.length > 0) {
    return s.packs.map((p) => ({ id: p.id, orders: [...p.orders] }));
  }
  return [{ id: 1, orders: [...s.orders] }];
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
