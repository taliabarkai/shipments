/**
 * Deterministic mock Order ETA / Shipment EDD for a shipment, shared by the
 * details drawer and the table filters so both agree on the same dates.
 *
 * The EDD is offset from the ETA so that across shipments some match, some land
 * later (isLate), and some earlier.
 */
export interface ShipmentDeliveryDates {
  orderEtaDate: Date;
  shipmentEddDate: Date;
  /** yyyy-mm-dd, for range comparisons against <input type="date"> values. */
  orderEtaIso: string;
  shipmentEddIso: string;
  /** MM/DD/YYYY, for display. */
  orderEta: string;
  shipmentEdd: string;
  /** EDD is later than the ETA. */
  isLate: boolean;
}

function formatMmDdYyyy(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${date.getFullYear()}`;
}

function formatIso(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function getShipmentDeliveryDates(orderId: string): ShipmentDeliveryDates {
  let hash = 0;
  for (let i = 0; i < orderId.length; i += 1) hash = (hash * 31 + orderId.charCodeAt(i)) >>> 0;
  const eta = new Date(2026, 6, 15); // Jul 15, 2026 baseline (month is 0-indexed)
  eta.setDate(eta.getDate() + (hash % 21)); // spread ETAs across ~3 weeks
  const edd = new Date(eta);
  edd.setDate(eta.getDate() + [0, 4, -3][hash % 3]); // same day / 4 later / 3 earlier
  return {
    orderEtaDate: eta,
    shipmentEddDate: edd,
    orderEtaIso: formatIso(eta),
    shipmentEddIso: formatIso(edd),
    orderEta: formatMmDdYyyy(eta),
    shipmentEdd: formatMmDdYyyy(edd),
    isLate: edd.getTime() > eta.getTime(),
  };
}
