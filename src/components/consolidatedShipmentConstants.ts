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

/**
 * Merukazim: carrier defines origin → destination lane (US / GB) for validation and display.
 * Order matches consolidated-shipment carrier dropdown.
 */
export const MERUKAZIM_CARRIERS = [
  { id: 'usps', name: 'USPS', origin: 'IL', destination: 'US' },
  { id: 'dhl', name: 'DHL', origin: 'IL', destination: 'US' },
  { id: 'usps-hu', name: 'USPS HU', origin: 'HU', destination: 'GB' },
  { id: 'usps-th', name: 'USPS TH', origin: 'TH', destination: 'US' },
  { id: 'dhl-royal', name: 'DHL Royal', origin: 'GB', destination: 'GB' },
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

/** Shipment and box counts for cancel-consolidation confirmation copy (aligned with list enrichment). */
export function consolidatedCancelDialogCounts(s: ConsolidatedShipment): {
  shipmentCount: number;
  boxCount: number;
} {
  const shipmentCount = s.totalShipments ?? Math.max(1, s.orders.length);
  const boxCount = normalizedConsolidatedPacks(s).length;
  return { shipmentCount, boxCount };
}

/** Shown when a consolidated shipment enters Draft after label API failure (simulation or real). */
export const CONSOLIDATED_LABEL_API_FAILED_MESSAGE =
  'Shipping label creation failed. Please create a shipping label manually and enter the tracking ID.';

const FEDEX_CARRIER_PATTERN = /fedex/i;
const DHL_CARRIER_PATTERN = /dhl/i;

export function isCarrierFedExForManualTracking(carrier: string): boolean {
  return FEDEX_CARRIER_PATTERN.test(carrier?.trim() ?? '');
}

export function isCarrierDHLForManualTracking(carrier: string): boolean {
  return DHL_CARRIER_PATTERN.test(carrier?.trim() ?? '');
}

/** Manual tracking validation after Draft (API error): FedEx 12 digits, DHL 10 digits; others min length 4. */
export function isValidManualConsolidatedTrackingId(carrier: string, trackingId: string): boolean {
  const t = trackingId.trim();
  if (!t) return false;
  if (isCarrierFedExForManualTracking(carrier)) return /^\d{12}$/.test(t);
  if (isCarrierDHLForManualTracking(carrier)) return /^\d{10}$/.test(t);
  return t.length >= 4;
}

export type ManualDraftTrackingCounterMode = 'digits' | 'trimmedChars';

/** Draft manual tracking counter: FedEx 12 (digit count); all other carriers 10 (trimmed length). */
export function manualConsolidatedDraftTrackingCounter(carrier: string): {
  max: number;
  mode: ManualDraftTrackingCounterMode;
} {
  if (isCarrierFedExForManualTracking(carrier)) return { max: 12, mode: 'digits' };
  return { max: 10, mode: 'trimmedChars' };
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
