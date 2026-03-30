import type {
  ConsolidatedCarrierType,
  ConsolidatedShipment,
  ShipmentStatus,
} from './ConsolidatedShipmentsApp';
import {
  BULK_DESTINATION_STORED,
  inferredConsolidatedCarrierType,
  merukazimLogisticsByCarrierName,
} from './consolidatedShipmentConstants';

/** Bulk vs Merukazim for table, drawer, and exports — inferred from carrier when `carrierType` is missing. */
export function displayCarrierType(s: ConsolidatedShipment): ConsolidatedCarrierType | string {
  return inferredConsolidatedCarrierType(s);
}

/**
 * Table / exports: bulk → EU; Merukazim → lane destination from carrier config (US / GB).
 */
export function displayDestination(s: ConsolidatedShipment): string {
  if (inferredConsolidatedCarrierType(s) === 'Bulk') {
    return BULK_DESTINATION_STORED;
  }
  const d = s.destination?.trim() ?? '';
  if (d === 'US' || d === 'GB') return d;
  const log = merukazimLogisticsByCarrierName(s.carrier);
  if (log) return log.destination;
  return '—';
}

/** Pill surface for Bulk / Merukazim — same as ConsolidatedShipmentForm carrier trigger. */
export function carrierTypeLabelClass(type: ConsolidatedCarrierType | string): string {
  if (type === 'Bulk') return 'bg-sky-100 text-sky-900';
  if (type === 'Merukazim') return 'bg-pink-100 text-pink-900';
  return 'bg-gray-100 text-gray-800';
}

/** Badge classes for status chips — keep in sync with ShipmentsList table cells. */
export function consolidatedStatusBadgeClass(status: ShipmentStatus): string {
  switch (status) {
    case 'Shipped':
      return 'bg-green-100 text-green-700';
    case 'Packed':
      return 'bg-[#ede7f6] text-[#311b92]';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Status pill in consolidated detail drawer (Figma Packing / Shipment screens).
 * Shipped uses green surface per design node 545:46113.
 */
export function consolidatedDrawerStatusBadgeClass(status: ShipmentStatus): string {
  switch (status) {
    case 'Shipped':
      return 'bg-[#dcfce7] text-[#016630]';
    case 'Packed':
      return 'bg-[#ede7f6] text-[#311b92]';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
