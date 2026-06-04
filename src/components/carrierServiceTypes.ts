/**
 * Shared types and enum mappings for Carrier Service Types.
 *
 * DB stores enum values in snake_case (e.g. "order_id", "api_merukazim").
 * UI displays human-readable labels. Use the maps below when persisting
 * to or hydrating from the API.
 */

export type ServiceLevelMethod = 'basic' | 'expedited' | 'express';
export type ShippingLabelMethod = 'api' | 'pool' | 'order_id' | 'label_template';
export type ShippedReportMethod = 'api' | 'api_merukazim' | 'pick_up_schedule';

export const SERVICE_LEVEL_METHOD_LABELS: Record<ServiceLevelMethod, string> = {
  basic: 'Basic',
  expedited: 'Expedited',
  express: 'Express',
};

export const SHIPPING_LABEL_METHOD_LABELS: Record<ShippingLabelMethod, string> = {
  api: 'API',
  pool: 'Pool',
  order_id: 'Order ID',
  label_template: 'Label Template',
};

export const SHIPPED_REPORT_METHOD_LABELS: Record<ShippedReportMethod, string> = {
  api: 'API',
  api_merukazim: 'API Merukazim',
  pick_up_schedule: 'Pick Up Schedule',
};

export const SERVICE_LEVEL_METHOD_OPTIONS = Object.keys(
  SERVICE_LEVEL_METHOD_LABELS,
) as ServiceLevelMethod[];

export const SHIPPING_LABEL_METHOD_OPTIONS = Object.keys(
  SHIPPING_LABEL_METHOD_LABELS,
) as ShippingLabelMethod[];

export const SHIPPED_REPORT_METHOD_OPTIONS = Object.keys(
  SHIPPED_REPORT_METHOD_LABELS,
) as ShippedReportMethod[];

export interface CarrierServiceType {
  /** Auto-assigned, server-owned. Read-only in the UI. */
  carrier_service_type_id: number;
  carrier_company_number: number;
  car_company_name: string;
  blocked_downgrade: boolean;
  service_level_method: ServiceLevelMethod | null;
  shipping_label_method: ShippingLabelMethod | null;
  /** Free-text, max 12 chars. */
  slug: string;
  shipped_report_method: ShippedReportMethod | null;
}

export const SLUG_MAX_LENGTH = 12;

/**
 * Persists column visibility for Carrier Service Types. The spec calls for
 * this exact key — keep it stable so user preferences survive deploys.
 */
export const CST_COLUMN_VISIBILITY_KEY = 'cst_column_visibility';
