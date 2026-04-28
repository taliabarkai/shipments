import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { cn } from './ui/utils';
import {
  formatCatalogMaterialLabel,
  HS_CODE_OPTIONS,
  isManualPackingCatalogRow,
  MANUAL_PACKING_SITE_SKU_LENGTH_MESSAGE,
  MANUAL_PACKING_SKU_LENGTH_MESSAGE,
  manualPackingSkuErrorForDisplay,
  validateManualPackingSkuFields,
  type ShippingCatalogRow,
} from './shippingCatalogModel';
import {
  PackingItemFormFields,
  emptyPackingItemForm,
  isPackingItemFormComplete,
  packingItemFormToRow,
  rowToPackingItemForm,
  type PackingItemFormState,
} from './packingItemFormShared';

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-800">{label}</div>
      <div className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">{value}</div>
    </div>
  );
}

function CatalogReadOnlyBody({ row }: { row: ShippingCatalogRow }) {
  const hsLine = useMemo(() => {
    const opt = HS_CODE_OPTIONS.find((o) => o.code === row.hsCode);
    return opt ? `${row.hsCode} ${opt.description}` : row.hsCode;
  }, [row.hsCode]);

  return (
    <div className="space-y-4">
      <DetailBlock label="SKU" value={row.sku} />
      <DetailBlock label="Site SKU" value={row.siteSku} />
      <DetailBlock label="Supplier Item ID" value={row.supplierItemId || '—'} />
      <DetailBlock label="Product Name" value={row.productName} />
      <DetailBlock label="HS Code" value={hsLine} />
      <DetailBlock label="Category" value={row.category} />
      <DetailBlock label="Country of Origin" value={row.country} />
      <DetailBlock label="Material Type" value={formatCatalogMaterialLabel(row.material)} />
      <DetailBlock label="Weight" value={row.weight} />
      <DetailBlock label="Diamond Product" value={row.diamond ? 'Yes' : 'No'} />
      <DetailBlock label="Non Producible Product" value={row.nonProd ? 'Yes' : 'No'} />
      <DetailBlock label="Status" value={row.status} />
    </div>
  );
}

interface ShippingCatalogRowDrawerProps {
  isOpen: boolean;
  row: ShippingCatalogRow | null;
  onClose: () => void;
  onSave: (row: ShippingCatalogRow) => void;
  existingRows: ShippingCatalogRow[];
}

export default function ShippingCatalogRowDrawer({
  isOpen,
  row,
  onClose,
  onSave,
  existingRows,
}: ShippingCatalogRowDrawerProps) {
  const editable = row ? isManualPackingCatalogRow(row) : false;
  const [form, setForm] = useState(() => emptyPackingItemForm());
  const [skuBlurred, setSkuBlurred] = useState(false);
  const [siteSkuBlurred, setSiteSkuBlurred] = useState(false);

  useEffect(() => {
    if (isOpen && row && isManualPackingCatalogRow(row)) {
      setForm(rowToPackingItemForm(row));
      setSkuBlurred(false);
      setSiteSkuBlurred(false);
    }
  }, [isOpen, row]);

  const skuFieldErrors = useMemo(() => {
    if (!row || !editable) return {};
    return validateManualPackingSkuFields(form.sku, form.siteSku, existingRows, row.id);
  }, [form.sku, form.siteSku, existingRows, row, editable]);

  const displaySkuError = manualPackingSkuErrorForDisplay(
    skuFieldErrors.sku,
    skuBlurred,
    MANUAL_PACKING_SKU_LENGTH_MESSAGE,
  );
  const displaySiteSkuError = manualPackingSkuErrorForDisplay(
    skuFieldErrors.siteSku,
    siteSkuBlurred,
    MANUAL_PACKING_SITE_SKU_LENGTH_MESSAGE,
  );

  const canSave =
    isPackingItemFormComplete(form, { packingMaterialFixed: true }) &&
    !skuFieldErrors.sku &&
    !skuFieldErrors.siteSku;

  const setField = <K extends keyof PackingItemFormState>(key: K, value: PackingItemFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!row || !canSave) return;
    onSave(packingItemFormToRow(row.id, form, { forceMaterialPackingItem: true }));
    onClose();
  };

  const title = editable ? 'Edit packing item' : 'Catalog item details';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l bg-white p-0 sm:max-w-[560px]"
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="shrink-0 border-b px-6 pb-3 pt-4">
          <SheetTitle className="font-semibold text-[#101828]">{title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {row ? (
            editable ? (
              <PackingItemFormFields
                form={form}
                setField={setField}
                idPrefix="catalog-row"
                materialMode="packingItemFixed"
                skuError={displaySkuError}
                siteSkuError={displaySiteSkuError}
                onSkuBlur={() => setSkuBlurred(true)}
                onSiteSkuBlur={() => setSiteSkuBlurred(true)}
              />
            ) : (
              <CatalogReadOnlyBody row={row} />
            )
          ) : null}
        </div>

        <div
          className={cn(
            'flex shrink-0 items-center gap-3 border-t bg-white px-6 py-4',
            editable ? 'justify-between' : 'justify-end',
          )}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-[#1976d2] hover:bg-blue-50 hover:text-[#1565c0]"
          >
            {editable ? 'Cancel' : 'Close'}
          </Button>
          {editable ? (
            <Button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="bg-[#1976d2] text-white hover:bg-[#1565c0] disabled:opacity-50"
            >
              Save changes
            </Button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
