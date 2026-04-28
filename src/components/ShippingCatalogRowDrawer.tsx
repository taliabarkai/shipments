import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { cn } from './ui/utils';
import {
  formatCatalogCategoryLabel,
  formatCatalogMaterialLabel,
  HS_CODE_OPTIONS,
  isManualPackingCatalogRow,
  type ShippingCatalogRow,
} from './shippingCatalogModel';
import {
  ManualPackingCreateFormFields,
  emptyManualPackingCreateForm,
  isManualPackingCreateFormComplete,
  manualPackingSlimFormToRow,
  rowToManualPackingSlimForm,
  type ManualPackingCreateFormState,
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

  const masterStatus = row.isManualPackingItem === true ? '-' : row.status;

  return (
    <div className="space-y-4">
      <DetailBlock label="SKU" value={row.sku} />
      <DetailBlock label="Site SKU" value={row.siteSku} />
      <DetailBlock label="Supplier Item ID" value={row.supplierItemId || '—'} />
      <DetailBlock label="Product Name" value={row.productName} />
      <DetailBlock label="HS Code" value={hsLine} />
      <DetailBlock label="Category" value={formatCatalogCategoryLabel(row.category)} />
      <DetailBlock label="Country of Origin" value={row.country} />
      <DetailBlock label="Material Type" value={formatCatalogMaterialLabel(row.material)} />
      <DetailBlock label="Weight" value={row.weight} />
      <DetailBlock label="Diamond Product" value={row.diamond ? 'Yes' : 'No'} />
      <DetailBlock label="Non Producible Product" value={row.nonProd ? 'Yes' : 'No'} />
      <DetailBlock label="Master Catalog Status" value={masterStatus} />
    </div>
  );
}

interface ShippingCatalogRowDrawerProps {
  isOpen: boolean;
  row: ShippingCatalogRow | null;
  onClose: () => void;
  onSave: (row: ShippingCatalogRow) => void;
}

export default function ShippingCatalogRowDrawer({
  isOpen,
  row,
  onClose,
  onSave,
}: ShippingCatalogRowDrawerProps) {
  const editable = row ? isManualPackingCatalogRow(row) : false;
  const [form, setForm] = useState(() => emptyManualPackingCreateForm());

  useEffect(() => {
    if (isOpen && row && isManualPackingCatalogRow(row)) {
      setForm(rowToManualPackingSlimForm(row));
    }
  }, [isOpen, row]);

  const canSave = Boolean(row) && isManualPackingCreateFormComplete(form);

  const setField = <K extends keyof ManualPackingCreateFormState>(key: K, value: ManualPackingCreateFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!row || !canSave) return;
    const updated = manualPackingSlimFormToRow(row.id, form, {
      sku: row.sku,
      siteSku: row.siteSku,
      isManualPackingItem: true,
    });
    onSave(updated);
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
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium text-gray-800">SKU</div>
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                    {row.sku}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">SKU cannot be changed.</p>
                </div>
                <ManualPackingCreateFormFields form={form} setField={setField} idPrefix="catalog-row" />
              </div>
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
