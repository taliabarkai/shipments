export type CatalogItemStatus = 'Online' | 'Archived';

export const CATALOG_CATEGORIES = [
  'bracelet',
  'earring',
  'charms',
  'necklace',
  'ring',
  'gift_box',
  'gift_note',
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

export const CATALOG_MATERIAL_TYPES = [
  'packing_item',
  'jewelry_gold_plating',
  'jewelry_silver',
  'jewelry_white_gold',
  'jewelry_rose_gold_plating',
  'jewelry_brass',
  'jewelry_stainless_steel',
  'jewelry_solid_gold',
  'jewelry_gold_vermeil',
] as const;

export type CatalogMaterialType = (typeof CATALOG_MATERIAL_TYPES)[number];

export interface ShippingCatalogRow {
  id: string;
  sku: string;
  siteSku: string;
  supplierItemId: string;
  productName: string;
  category: CatalogCategory;
  hsCode: string;
  country: string;
  material: CatalogMaterialType;
  weight: string;
  diamond: boolean;
  nonProd: boolean;
  status: CatalogItemStatus;
}

/** Manual packing rows use `material: 'packing_item'` (shown as "Packing Item"). */
export function isManualPackingCatalogRow(row: Pick<ShippingCatalogRow, 'material'>): boolean {
  return row.material === 'packing_item';
}

export function formatCatalogMaterialLabel(m: CatalogMaterialType): string {
  if (m === 'packing_item') return 'Packing Item';
  return m;
}

/** More than 8 and fewer than 24 characters (length 9–23). */
export function isCatalogSkuOrSiteSkuLengthValid(value: string): boolean {
  const len = value.trim().length;
  return len > 8 && len < 24;
}

export type ManualPackingSkuFieldErrors = { sku?: string; siteSku?: string };

export const MANUAL_PACKING_SKU_LENGTH_MESSAGE = 'SKU should be between 8 to 24 characters';
export const MANUAL_PACKING_SITE_SKU_LENGTH_MESSAGE = 'Site SKU should be between 8 to 24 characters';

/** Length messages are blur-gated in the UI; duplicate messages show as soon as they apply. */
export function manualPackingSkuErrorForDisplay(
  raw: string | undefined,
  fieldBlurred: boolean,
  lengthMessage: string,
): string | undefined {
  if (!raw) return undefined;
  if (raw === lengthMessage) return fieldBlurred ? raw : undefined;
  return raw;
}

/** Length rules first; then uniqueness against other rows (same `sku` / `siteSku` columns). */
export function validateManualPackingSkuFields(
  sku: string,
  siteSku: string,
  existingRows: ShippingCatalogRow[],
  excludeRowId?: string,
): ManualPackingSkuFieldErrors {
  const errors: ManualPackingSkuFieldErrors = {};
  const sTrim = sku.trim();
  const stTrim = siteSku.trim();
  const others = existingRows.filter((r) => r.id !== excludeRowId);

  if (!isCatalogSkuOrSiteSkuLengthValid(sTrim)) {
    errors.sku = MANUAL_PACKING_SKU_LENGTH_MESSAGE;
  } else if (others.some((r) => r.sku.trim() === sTrim)) {
    errors.sku = 'SKU item already exist';
  }

  if (!isCatalogSkuOrSiteSkuLengthValid(stTrim)) {
    errors.siteSku = MANUAL_PACKING_SITE_SKU_LENGTH_MESSAGE;
  } else if (others.some((r) => r.siteSku.trim() === stTrim)) {
    errors.siteSku = 'Site SKU item already exist';
  }

  return errors;
}

/** HS codes available in catalog table and packing-item form. */
export const HS_CODE_OPTIONS = [
  { code: '7113195000', description: 'Jewellery of precious metal other than silver' },
  { code: '7113115000', description: 'Jewellery of silver, whether or not plated' },
  { code: '7113200000', description: 'Jewellery of base metal clad with precious metal' },
  { code: '7117190000', description: 'Imitation jewellery, other, of base metal' },
  { code: '7117900000', description: 'Imitation jewellery of other materials' },
  { code: '4202920000', description: 'Cases and containers of textile/other material' },
  { code: '4819200000', description: 'Folding cartons, boxes and cases' },
  { code: '4817100000', description: 'Envelopes and letter cards of paper' },
] as const;
