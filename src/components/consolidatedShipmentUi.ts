import type {
  ConsolidatedCarrierType,
  ConsolidatedShipment,
  ShipmentStatus,
} from './ConsolidatedShipmentsApp';

/** Matches ShipmentsList enrichment: explicit carrierType, else Bulk when destination is em dash. */
export function displayCarrierType(s: ConsolidatedShipment): ConsolidatedCarrierType | string {
  return s.carrierType ?? (s.destination === '—' ? 'Bulk' : 'Merukazim');
}

/** Badge classes for status chips — keep in sync with ShipmentsList table cells. */
export function consolidatedStatusBadgeClass(status: ShipmentStatus): string {
  switch (status) {
    case 'Shipped':
      return 'bg-green-100 text-green-700';
    case 'Draft':
      return 'bg-gray-100 text-gray-800';
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
    case 'Draft':
      return 'bg-gray-100 text-gray-800';
    case 'Packed':
      return 'bg-[#ede7f6] text-[#311b92]';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
