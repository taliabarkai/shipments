import { HsCodeControlledPicker } from './HsCodeControlledPicker';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from './ui/utils';
import {
  CATALOG_MATERIAL_TYPES,
  formatCatalogMaterialLabel,
  type CatalogCategory,
  type CatalogMaterialType,
  type CatalogItemStatus,
  type ShippingCatalogRow,
} from './shippingCatalogModel';

export const PACKING_FORM_CATEGORIES: CatalogCategory[] = [
  'necklace',
  'ring',
  'bracelet',
  'earring',
  'gift_box',
  'charms',
  'gift_note',
];

export type PackingItemFormState = {
  sku: string;
  siteSku: string;
  supplierItemId: string;
  productName: string;
  hsCode: string;
  weight: string;
  category: '' | CatalogCategory;
  country: string;
  material: '' | CatalogMaterialType;
  diamond: '' | 'yes' | 'no';
  nonProd: '' | 'yes' | 'no';
  status: '' | 'online' | 'archived';
};

export const PACKING_ITEM_SELECT_TRIGGER_CLASS =
  'w-full border-gray-300 bg-white data-[placeholder]:text-muted-foreground';

export function emptyPackingItemForm(): PackingItemFormState {
  return {
    sku: '',
    siteSku: '',
    supplierItemId: '',
    productName: '',
    hsCode: '',
    weight: '',
    category: '',
    country: '',
    material: '',
    diamond: '',
    nonProd: '',
    status: '',
  };
}

/** Form weight field is up to 3 digits; row stores e.g. "200 g". */
export function normalizeWeight(raw: string): string {
  const digits = raw.trim().replace(/\D/g, '').slice(0, 3);
  if (!digits) return '';
  return `${digits} g`;
}

function weightStoredToFormDigits(stored: string): string {
  return stored.replace(/\s*g\s*$/i, '').replace(/\D/g, '').slice(0, 3);
}

export function rowToPackingItemForm(row: ShippingCatalogRow): PackingItemFormState {
  return {
    sku: row.sku,
    siteSku: row.siteSku,
    supplierItemId: row.supplierItemId,
    productName: row.productName,
    hsCode: row.hsCode,
    weight: weightStoredToFormDigits(row.weight),
    category: row.category,
    country: row.country,
    material: row.material,
    diamond: row.diamond ? 'yes' : 'no',
    nonProd: row.nonProd ? 'yes' : 'no',
    status: row.status === 'Online' ? 'online' : 'archived',
  };
}

export function packingItemFormToRow(
  id: string,
  form: PackingItemFormState,
  options?: { forceMaterialPackingItem?: boolean },
): ShippingCatalogRow {
  const status: CatalogItemStatus = form.status === 'online' ? 'Online' : 'Archived';
  const material: CatalogMaterialType = options?.forceMaterialPackingItem
    ? 'packing_item'
    : (form.material as CatalogMaterialType);
  return {
    id,
    sku: form.sku.trim(),
    siteSku: form.siteSku.trim(),
    supplierItemId: form.supplierItemId.trim(),
    productName: form.productName.trim(),
    category: form.category as CatalogCategory,
    hsCode: form.hsCode,
    country: form.country.trim(),
    material,
    weight: normalizeWeight(form.weight),
    diamond: form.diamond === 'yes',
    nonProd: form.nonProd === 'yes',
    status,
  };
}

export function isPackingItemFormComplete(
  form: PackingItemFormState,
  options?: { packingMaterialFixed?: boolean },
): boolean {
  const materialOk = options?.packingMaterialFixed ? true : form.material !== '';
  return (
    form.sku.trim() !== '' &&
    form.siteSku.trim() !== '' &&
    form.productName.trim() !== '' &&
    form.hsCode !== '' &&
    form.weight.trim() !== '' &&
    form.category !== '' &&
    form.country.trim() !== '' &&
    materialOk &&
    form.diamond !== '' &&
    form.nonProd !== '' &&
    form.status !== ''
  );
}

export function PackingItemFormFields({
  form,
  setField,
  idPrefix,
  materialMode = 'select',
  skuError,
  siteSkuError,
  onSkuBlur,
  onSiteSkuBlur,
}: {
  form: PackingItemFormState;
  setField: <K extends keyof PackingItemFormState>(key: K, value: PackingItemFormState[K]) => void;
  idPrefix: string;
  materialMode?: 'select' | 'packingItemFixed';
  skuError?: string;
  siteSkuError?: string;
  onSkuBlur?: () => void;
  onSiteSkuBlur?: () => void;
}) {
  const jewelryMaterialOptions = CATALOG_MATERIAL_TYPES.filter((m) => m !== 'packing_item');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${idPrefix}-sku`} className="mb-2 block text-sm font-medium text-gray-800">
            SKU
          </Label>
          <Input
            id={`${idPrefix}-sku`}
            placeholder="e.g PKG-TAPE-01"
            value={form.sku}
            onChange={(e) => setField('sku', e.target.value)}
            onBlur={() => onSkuBlur?.()}
            className={cn('border-gray-300 bg-white', skuError && 'border-red-500')}
            aria-invalid={Boolean(skuError)}
          />
          {skuError ? <p className="mt-1 text-xs text-red-600">{skuError}</p> : null}
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-site-sku`} className="mb-2 block text-sm font-medium text-gray-800">
            Site SKU
          </Label>
          <Input
            id={`${idPrefix}-site-sku`}
            placeholder="e.g 2390-02-1102"
            value={form.siteSku}
            onChange={(e) => setField('siteSku', e.target.value)}
            onBlur={() => onSiteSkuBlur?.()}
            className={cn('border-gray-300 bg-white', siteSkuError && 'border-red-500')}
            aria-invalid={Boolean(siteSkuError)}
          />
          {siteSkuError ? <p className="mt-1 text-xs text-red-600">{siteSkuError}</p> : null}
        </div>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-supplier-id`} className="mb-2 block text-sm font-medium text-gray-800">
          Supplier Item ID (Optional)
        </Label>
        <Input
          id={`${idPrefix}-supplier-id`}
          placeholder="e.g Prod-001"
          value={form.supplierItemId}
          onChange={(e) => setField('supplierItemId', e.target.value)}
          className="border-gray-300 bg-white"
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-product-name`} className="mb-2 block text-sm font-medium text-gray-800">
          Product Name
        </Label>
        <Input
          id={`${idPrefix}-product-name`}
          placeholder="e.g Lock and Luna Necklace in Gold Plating"
          value={form.productName}
          onChange={(e) => setField('productName', e.target.value)}
          className="border-gray-300 bg-white"
        />
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium text-gray-800">HS Code</Label>
        <HsCodeControlledPicker
          value={form.hsCode}
          onChange={(v) => setField('hsCode', v)}
          variant="form"
          aria-label={`${idPrefix} HS code`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${idPrefix}-weight`} className="mb-2 block text-sm font-medium text-gray-800">
            Weight (g)
          </Label>
          <Input
            id={`${idPrefix}-weight`}
            placeholder="e.g 200"
            inputMode="numeric"
            maxLength={3}
            autoComplete="off"
            value={form.weight}
            onChange={(e) => setField('weight', e.target.value.replace(/\D/g, '').slice(0, 3))}
            className="border-gray-300 bg-white"
          />
        </div>
        <div>
          <Label className="mb-2 block text-sm font-medium text-gray-800">Category</Label>
          <Select
            value={form.category || undefined}
            onValueChange={(v) => setField('category', v as CatalogCategory)}
          >
            <SelectTrigger className={PACKING_ITEM_SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {PACKING_FORM_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-country`} className="mb-2 block text-sm font-medium text-gray-800">
          Country of Origin
        </Label>
        <Input
          id={`${idPrefix}-country`}
          placeholder="e.g Israel"
          value={form.country}
          onChange={(e) => setField('country', e.target.value)}
          className="border-gray-300 bg-white"
        />
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium text-gray-800">Material Type</Label>
        {materialMode === 'packingItemFixed' ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
            Packing Item
          </div>
        ) : (
          <Select
            value={form.material || undefined}
            onValueChange={(v) => setField('material', v as CatalogMaterialType)}
          >
            <SelectTrigger className={PACKING_ITEM_SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(18rem,50vh)]">
              {jewelryMaterialOptions.map((m) => (
                <SelectItem key={m} value={m}>
                  {formatCatalogMaterialLabel(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-2 block text-sm font-medium text-gray-800">Diamond Product</Label>
          <Select
            value={form.diamond || undefined}
            onValueChange={(v) => setField('diamond', v as 'yes' | 'no')}
          >
            <SelectTrigger className={PACKING_ITEM_SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block text-sm font-medium text-gray-800">Non Producible Product</Label>
          <Select
            value={form.nonProd || undefined}
            onValueChange={(v) => setField('nonProd', v as 'yes' | 'no')}
          >
            <SelectTrigger className={PACKING_ITEM_SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium text-gray-800">Status</Label>
        <Select
          value={form.status || undefined}
          onValueChange={(v) => setField('status', v as 'online' | 'archived')}
        >
          <SelectTrigger className={PACKING_ITEM_SELECT_TRIGGER_CLASS}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/** Minimal fields for creating / editing a manual packing item (SKU generated or read-only elsewhere). */
export type ManualPackingCreateFormState = {
  productName: string;
  hsCode: string;
  weight: string;
  material: '' | CatalogMaterialType;
  country: string;
};

export function emptyManualPackingCreateForm(): ManualPackingCreateFormState {
  return {
    productName: '',
    hsCode: '',
    weight: '',
    material: '',
    country: '',
  };
}

export function isManualPackingCreateFormComplete(form: ManualPackingCreateFormState): boolean {
  return (
    form.productName.trim() !== '' &&
    form.hsCode !== '' &&
    form.weight.trim() !== '' &&
    form.material !== '' &&
    form.country.trim() !== ''
  );
}

export function rowToManualPackingSlimForm(row: ShippingCatalogRow): ManualPackingCreateFormState {
  return {
    productName: row.productName,
    hsCode: row.hsCode,
    weight: weightStoredToFormDigits(row.weight),
    material: row.material,
    country: row.country,
  };
}

export function manualPackingSlimFormToRow(
  id: string,
  form: ManualPackingCreateFormState,
  options: { sku: string; siteSku?: string; isManualPackingItem?: boolean },
): ShippingCatalogRow {
  const sku = options.sku.trim();
  return {
    id,
    sku,
    siteSku: (options.siteSku ?? sku).trim(),
    supplierItemId: '',
    productName: form.productName.trim(),
    category: 'packing_item',
    hsCode: form.hsCode,
    country: form.country.trim(),
    material: form.material as CatalogMaterialType,
    weight: normalizeWeight(form.weight),
    diamond: false,
    nonProd: true,
    status: 'Online',
    isManualPackingItem: options.isManualPackingItem !== false,
  };
}

const MATERIAL_SELECT_PLACEHOLDER = 'Select material';

export function ManualPackingCreateFormFields({
  form,
  setField,
  idPrefix,
}: {
  form: ManualPackingCreateFormState;
  setField: <K extends keyof ManualPackingCreateFormState>(key: K, value: ManualPackingCreateFormState[K]) => void;
  idPrefix: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${idPrefix}-product-name`} className="mb-2 block text-sm font-medium text-gray-800">
          Product Name
        </Label>
        <Input
          id={`${idPrefix}-product-name`}
          placeholder="e.g. Custom tissue paper"
          value={form.productName}
          onChange={(e) => setField('productName', e.target.value)}
          className="border-gray-300 bg-white"
        />
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium text-gray-800">HS Code</Label>
        <HsCodeControlledPicker
          value={form.hsCode}
          onChange={(v) => setField('hsCode', v)}
          variant="form"
          aria-label={`${idPrefix} HS code`}
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-weight`} className="mb-2 block text-sm font-medium text-gray-800">
          Weight (g)
        </Label>
        <Input
          id={`${idPrefix}-weight`}
          placeholder="e.g. 200"
          inputMode="numeric"
          maxLength={3}
          autoComplete="off"
          value={form.weight}
          onChange={(e) => setField('weight', e.target.value.replace(/\D/g, '').slice(0, 3))}
          className="border-gray-300 bg-white"
        />
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium text-gray-800">Material</Label>
        <Select
          value={form.material || undefined}
          onValueChange={(v) => setField('material', v as CatalogMaterialType)}
        >
          <SelectTrigger className={PACKING_ITEM_SELECT_TRIGGER_CLASS}>
            <SelectValue placeholder={MATERIAL_SELECT_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent className="max-h-[min(18rem,50vh)]">
            {CATALOG_MATERIAL_TYPES.map((m) => (
              <SelectItem key={m} value={m}>
                {formatCatalogMaterialLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-country`} className="mb-2 block text-sm font-medium text-gray-800">
          Country of Origin
        </Label>
        <Input
          id={`${idPrefix}-country`}
          placeholder="e.g. Israel"
          value={form.country}
          onChange={(e) => setField('country', e.target.value)}
          className="border-gray-300 bg-white"
        />
      </div>
    </div>
  );
}
