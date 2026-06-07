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

/**
 * Badge classes for status chips — kept in sync with the Shipments table palette.
 * Brand-approved hex values shared with ShipmentsTable.getStatusVariant.
 */
export function consolidatedStatusBadgeClass(status: ShipmentStatus): string {
  switch (status) {
    case 'Draft':
      return 'bg-[#f5f5f5] text-[#1f2937]';
    case 'Packed':
      return 'bg-[#b9f6ca] text-[#1b5e20]';
    case 'Shipped':
      return 'bg-[#e3f2fd] text-[#0d47a1]';
    case 'Cancelled':
      return 'bg-[#ffebee] text-[#e53935]';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/** Same palette in the consolidated detail drawer pill — uses the same hex values. */
export function consolidatedDrawerStatusBadgeClass(status: ShipmentStatus): string {
  return consolidatedStatusBadgeClass(status);
}
