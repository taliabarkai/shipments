import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import type { ShippingCatalogRow } from './shippingCatalogModel';
import { generateUniqueManualPackingSku } from './shippingCatalogModel';
import {
  ManualPackingCreateFormFields,
  emptyManualPackingCreateForm,
  isManualPackingCreateFormComplete,
  manualPackingSlimFormToRow,
  type ManualPackingCreateFormState,
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
  const [form, setForm] = useState(() => emptyManualPackingCreateForm());
  const [draftSku, setDraftSku] = useState('');
  const wasOpenRef = useRef(false);

  // Reset only when the sheet opens, not when `existingRows` changes while it is already open (avoids wiping the form).
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setForm(emptyManualPackingCreateForm());
      setDraftSku(generateUniqueManualPackingSku(existingRows));
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, existingRows]);

  const canSubmit = isManualPackingCreateFormComplete(form);

  const setField = <K extends keyof ManualPackingCreateFormState>(key: K, value: ManualPackingCreateFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const sku = (draftSku.trim() || generateUniqueManualPackingSku(existingRows)).trim();
    if (!sku) return;
    const row = manualPackingSlimFormToRow(`new-${Date.now()}`, form, { sku, siteSku: sku, isManualPackingItem: true });
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
          <div className="mb-4">
            <Label htmlFor="create-packing-sku" className="mb-2 block text-sm font-medium text-gray-800">
              SKU
            </Label>
            <Input
              id="create-packing-sku"
              readOnly
              value={draftSku}
              className="border-gray-300 bg-gray-50 text-gray-800"
              aria-readonly
            />
          </div>
          <ManualPackingCreateFormFields form={form} setField={setField} idPrefix="create-packing" />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-[15px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="min-w-[140px] bg-[#1976d2] text-[15px] font-medium text-white hover:bg-[#1565c0] disabled:bg-[#1976d2] disabled:text-white disabled:opacity-50"
          >
            Create Packing Item
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
