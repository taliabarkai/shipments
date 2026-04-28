import { useMemo, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import type { ShippingCatalogRow } from './shippingCatalogModel';
import {
  MANUAL_PACKING_SITE_SKU_LENGTH_MESSAGE,
  MANUAL_PACKING_SKU_LENGTH_MESSAGE,
  manualPackingSkuErrorForDisplay,
  validateManualPackingSkuFields,
} from './shippingCatalogModel';
import {
  PackingItemFormFields,
  emptyPackingItemForm,
  isPackingItemFormComplete,
  packingItemFormToRow,
  type PackingItemFormState,
} from './packingItemFormShared';

interface CreateManualPackingItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (row: ShippingCatalogRow) => void;
  existingRows: ShippingCatalogRow[];
}

export default function CreateManualPackingItemDrawer({
  isOpen,
  onClose,
  onCreate,
  existingRows,
}: CreateManualPackingItemDrawerProps) {
  const [form, setForm] = useState(() => emptyPackingItemForm());
  const [skuBlurred, setSkuBlurred] = useState(false);
  const [siteSkuBlurred, setSiteSkuBlurred] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyPackingItemForm());
      setSkuBlurred(false);
      setSiteSkuBlurred(false);
    }
  }, [isOpen]);

  const skuFieldErrors = useMemo(
    () => validateManualPackingSkuFields(form.sku, form.siteSku, existingRows),
    [form.sku, form.siteSku, existingRows],
  );

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

  const canSubmit =
    isPackingItemFormComplete(form, { packingMaterialFixed: true }) &&
    !skuFieldErrors.sku &&
    !skuFieldErrors.siteSku;

  const setField = <K extends keyof PackingItemFormState>(key: K, value: PackingItemFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const row = packingItemFormToRow(`new-${Date.now()}`, form, { forceMaterialPackingItem: true });
    onCreate(row);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l bg-white p-0 sm:max-w-[560px]"
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="shrink-0 border-b px-6 pb-3 pt-4">
          <SheetTitle className="font-semibold text-[#101828]">Create Manual Packing Item</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <PackingItemFormFields
            form={form}
            setField={setField}
            idPrefix="create-packing"
            materialMode="packingItemFixed"
            skuError={displaySkuError}
            siteSkuError={displaySiteSkuError}
            onSkuBlur={() => setSkuBlurred(true)}
            onSiteSkuBlur={() => setSiteSkuBlurred(true)}
          />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t bg-white px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-[#1976d2] hover:bg-blue-50 hover:text-[#1565c0]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="bg-[#1976d2] text-white hover:bg-[#1565c0] disabled:opacity-50"
          >
            Create Packing Item
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
