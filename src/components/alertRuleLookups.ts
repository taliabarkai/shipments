import { CATALOG_CATEGORIES } from './shippingCatalogModel';
import { SHIPPING_CATALOG_MOCK_ROWS } from './shippingCatalogMockData';

/** Activation fields supported by Create / Edit Alert rule builder. */
export type AlertActivationFieldId =
  | 'order_brand'
  | 'order_item_sku'
  | 'product_category'
  | 'destination_country'
  | 'packing_facility'
  | 'event_level'
  | 'shipment_service_level'
  | 'shipment_total_item_value';

/** Options for multiselect fields (shipping routes / catalog–aligned demo data). */
export function optionsForAlertRuleField(field: AlertActivationFieldId): string[] {
  switch (field) {
    case 'order_brand':
      return ['Myka', 'BrandB', 'OAL', 'TGR', 'MNN', 'LAL'];
    case 'order_item_sku':
      return SHIPPING_CATALOG_MOCK_ROWS.map((r) => r.sku);
    case 'product_category':
      return CATALOG_CATEGORIES.filter((c) => c !== 'packing_item');
    case 'destination_country':
      return ['US', 'IL', 'HU', 'TH', 'CA', 'DE', 'United Kingdom', 'Israel'];
    case 'packing_facility':
      return ['NZ', 'KG', 'TH', 'HU'];
    case 'event_level':
      return [];
    case 'shipment_service_level':
      return ['express', 'expedited', 'free', 'standard', 'economy', 'overnight', 'international priority'];
    case 'shipment_total_item_value':
      return [];
    default:
      return [];
  }
}
