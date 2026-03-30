import type { ConsolidatedCarrierType } from './ConsolidatedShipmentsApp';

/** Demo operator scanning at the workstation (packing facility must match unless using WRONGFAC- demo IDs). */
export const SCAN_OPERATOR = {
  name: 'John Doe',
  facility: 'Kiryat Gat',
} as const;

export type ScanFeedback =
  | { variant: 'success'; message: string }
  | { variant: 'error'; title: string; message: string; style: 'status' | 'not-found' | 'destination' | 'consolidated' }
  | { variant: 'warning'; title: string; message: string; style: 'duplicate' | 'facility' };

export interface ConsolidatedScanContext {
  carrierType: ConsolidatedCarrierType;
  /** Merukazim lane destination (US, GB). Ignored for Bulk. */
  consolidationDestination: string;
  /** Already scanned order IDs in this consolidation (all packs). */
  alreadyScannedIds: Set<string>;
}

type MockFound = {
  kind: 'found';
  status: string;
  destinationCountry: string;
  consolidatedShippingId: string | null;
  packingFacility: string;
};

type MockRecord = { kind: 'not_found' } | MockFound;

function normalizeDestinationKey(country: string): string {
  const c = country.trim().toUpperCase();
  if (c === 'USA' || c === 'UNITED STATES') return 'US';
  if (c === 'UNITED KINGDOM' || c === 'UK') return 'GB';
  return c;
}

/**
 * Mock individual shipment lookup.
 *
 * Quick demo IDs (exact string after trim):
 * - `1` → valid shipment (success path)
 * - `2` → wrong destination (France vs lane); `Destination Mismatch` on **Merukazim** only
 * - `3` → already in consolidation **CS-DEMO**
 * - `4` → valid shipment; validation always shows duplicate warning (one-shot demo)
 * - `5` → wrong packing facility vs operator
 *
 * Other demo triggers:
 * - `999` or `NOTFOUND-` → not in database
 * - `BADSTATUS:` + status (e.g. `BADSTATUS:PROCESSING`) → wrong status
 * - `INCONS:` + id (e.g. `INCONS:CS-999`) → already consolidated
 * - `WRONGDEST:` + country (`WRONGDEST:France`) → Merukazim destination mismatch
 * - `WRONGFAC:` + facility (`WRONGFAC:Thailand`) → facility mismatch
 * - Otherwise → PACKED; destination matches `laneDestination` (US vs GB for Merukazim lanes).
 */
export function lookupMockShipmentForScan(orderId: string, laneDestination: string): MockRecord {
  const id = orderId.trim();
  if (!id) return { kind: 'not_found' };

  const laneNorm = normalizeDestinationKey(laneDestination);
  const laneDefaultCountry = laneNorm === 'GB' ? 'GB' : 'US';

  if (id === '1' || id === '4') {
    return {
      kind: 'found',
      status: 'PACKED',
      destinationCountry: laneDefaultCountry,
      consolidatedShippingId: null,
      packingFacility: SCAN_OPERATOR.facility,
    };
  }

  if (id === '2') {
    return {
      kind: 'found',
      status: 'PACKED',
      destinationCountry: 'France',
      consolidatedShippingId: null,
      packingFacility: SCAN_OPERATOR.facility,
    };
  }

  if (id === '3') {
    return {
      kind: 'found',
      status: 'PACKED',
      destinationCountry: laneDefaultCountry,
      consolidatedShippingId: 'CS-DEMO',
      packingFacility: SCAN_OPERATOR.facility,
    };
  }

  if (id === '5') {
    return {
      kind: 'found',
      status: 'PACKED',
      destinationCountry: laneDefaultCountry,
      consolidatedShippingId: null,
      packingFacility: 'Thailand',
    };
  }

  if (id === '999' || id.toUpperCase().startsWith('NOTFOUND')) {
    return { kind: 'not_found' };
  }

  if (id.toUpperCase().startsWith('BADSTATUS:')) {
    const status = id.slice(id.indexOf(':') + 1).trim() || 'PROCESSING';
    return {
      kind: 'found',
      status: status.toUpperCase(),
      destinationCountry: laneDefaultCountry,
      consolidatedShippingId: null,
      packingFacility: SCAN_OPERATOR.facility,
    };
  }

  if (id.toUpperCase().startsWith('INCONS:')) {
    const consId = id.slice(id.indexOf(':') + 1).trim() || 'CS-999';
    return {
      kind: 'found',
      status: 'PACKED',
      destinationCountry: laneDefaultCountry,
      consolidatedShippingId: consId,
      packingFacility: SCAN_OPERATOR.facility,
    };
  }

  if (id.toUpperCase().startsWith('WRONGDEST:')) {
    const country = id.slice(id.indexOf(':') + 1).trim() || 'France';
    return {
      kind: 'found',
      status: 'PACKED',
      destinationCountry: country,
      consolidatedShippingId: null,
      packingFacility: SCAN_OPERATOR.facility,
    };
  }

  if (id.toUpperCase().startsWith('WRONGFAC:')) {
    const fac = id.slice(id.indexOf(':') + 1).trim() || 'Thailand';
    return {
      kind: 'found',
      status: 'PACKED',
      destinationCountry: laneDefaultCountry,
      consolidatedShippingId: null,
      packingFacility: fac,
    };
  }

  return {
    kind: 'found',
    status: 'PACKED',
    destinationCountry: laneDefaultCountry,
    consolidatedShippingId: null,
    packingFacility: SCAN_OPERATOR.facility,
  };
}

/** Display label for consolidation destination in errors. */
export function consolidationDestinationLabel(code: string): string {
  const u = code.toUpperCase();
  if (u === 'US' || u === 'USA') return 'US';
  if (u === 'GB' || u === 'UK') return 'GB';
  if (u === 'EU') return 'EU';
  return code;
}

export function validateOrderScan(orderId: string, ctx: ConsolidatedScanContext): ScanFeedback | null {
  const id = orderId.trim();
  if (!id) return null;

  const rec = lookupMockShipmentForScan(id, ctx.consolidationDestination);
  if (rec.kind === 'not_found') {
    return {
      variant: 'error',
      title: 'Shipment Not Found',
      message: `Shipment ID ${id} does not exist in the database. Hand over to your supervisor.`,
      style: 'not-found',
    };
  }

  if (rec.status.toUpperCase() !== 'PACKED') {
    return {
      variant: 'error',
      title: 'Invalid Shipment Status',
      message: `This shipment cannot be consolidated. Status: ${rec.status}. Hand over to your supervisor.`,
      style: 'status',
    };
  }

  if (ctx.carrierType === 'Merukazim') {
    const required = normalizeDestinationKey(ctx.consolidationDestination);
    const shipDest = normalizeDestinationKey(rec.destinationCountry);
    if (required !== shipDest) {
      return {
        variant: 'error',
        title: 'Destination Mismatch',
        message: `Individual shipment destination is ${rec.destinationCountry}. Required: ${consolidationDestinationLabel(ctx.consolidationDestination)}. Hand over to your supervisor.`,
        style: 'destination',
      };
    }
  }

  if (rec.consolidatedShippingId) {
    return {
      variant: 'error',
      title: 'Already Consolidated',
      message: `This shipment is already in consolidation ${rec.consolidatedShippingId}.`,
      style: 'consolidated',
    };
  }

  if (id === '4') {
    return {
      variant: 'warning',
      title: 'Already scanned',
      message: 'This shipment was already scanned.',
      style: 'duplicate',
    };
  }

  if (ctx.alreadyScannedIds.has(id)) {
    return {
      variant: 'warning',
      title: 'Already scanned',
      message: 'This shipment was already scanned.',
      style: 'duplicate',
    };
  }

  if (rec.packingFacility !== SCAN_OPERATOR.facility) {
    return {
      variant: 'warning',
      title: 'Facility Mismatch',
      message: `${SCAN_OPERATOR.name} and this shipment don't belong to the same packing facility.`,
      style: 'facility',
    };
  }

  return null;
}
