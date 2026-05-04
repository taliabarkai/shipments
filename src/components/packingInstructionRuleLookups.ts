/** Options for packing-instruction activation rules; replace `fetchPackingInstructionRuleLookups` with a real API when available. */
export interface PackingRuleLookups {
  productCategories: string[];
  orderItemSkus: string[];
  brands: string[];
  destinationCountries: string[];
  shippingServiceLevels: string[];
  eventLevels: string[];
  totalItemValues: string[];
}

export type PackingRuleFieldId =
  | 'product_category'
  | 'order_item_sku'
  | 'brand'
  | 'destination_country'
  | 'shipping_service_level'
  | 'event_level'
  | 'total_item_value';

export const PACKING_RULE_FIELD_LOOKUP_KEY: Record<PackingRuleFieldId, keyof PackingRuleLookups> = {
  product_category: 'productCategories',
  order_item_sku: 'orderItemSkus',
  brand: 'brands',
  destination_country: 'destinationCountries',
  shipping_service_level: 'shippingServiceLevels',
  event_level: 'eventLevels',
  total_item_value: 'totalItemValues',
};

export function optionsForPackingRuleField(
  lookups: PackingRuleLookups | null,
  field: PackingRuleFieldId,
): string[] {
  if (!lookups) return [];
  const key = PACKING_RULE_FIELD_LOOKUP_KEY[field];
  return lookups[key] ?? [];
}

/** Simulates loading catalogs from their respective services when the form opens. */
export async function fetchPackingInstructionRuleLookups(): Promise<PackingRuleLookups> {
  await new Promise((r) => setTimeout(r, 120));
  return {
    productCategories: ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Watches', 'Charms'],
    orderItemSkus: ['SKU-RING-001', 'SKU-BRC-042', 'SKU-NECK-88', 'SKU-EAR-12', 'SKU-WCH-900', 'SKU-CHM-301'],
    brands: ['OAL', 'TGR', 'MNN', 'LAL', 'SETT', 'FEM', 'IB'],
    destinationCountries: ['USA', 'Canada', 'United Kingdom', 'Germany', 'Israel', 'Thailand', 'Hungary'],
    shippingServiceLevels: ['Standard', 'Express', 'Overnight', 'Economy', 'International Priority'],
    eventLevels: ['Item created', 'Packed', 'Shipped', 'Delivered', 'Return initiated', 'Exception'],
    totalItemValues: ['25', '50', '100', '200', '500', '1000', '2500', '5000'],
  };
}
