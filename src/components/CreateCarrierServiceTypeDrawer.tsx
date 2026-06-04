import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Switch } from './ui/switch';
import { cn } from './ui/utils';
import {
  CARRIER_COMPANIES,
  CarrierCompany,
  findCarrierByNumber,
  formatCarrierOption,
} from './carriers';
import {
  CarrierServiceType,
  SERVICE_LEVEL_METHOD_LABELS,
  SERVICE_LEVEL_METHOD_OPTIONS,
  SHIPPED_REPORT_METHOD_LABELS,
  SHIPPED_REPORT_METHOD_OPTIONS,
  SHIPPING_LABEL_METHOD_LABELS,
  SHIPPING_LABEL_METHOD_OPTIONS,
  ServiceLevelMethod,
  ShippedReportMethod,
  ShippingLabelMethod,
  SLUG_MAX_LENGTH,
} from './carrierServiceTypes';

const NONE_OPTION_VALUE = '__none__';

interface FormState {
  carrierCompanyNumber: number | null;
  blockedDowngrade: boolean;
  serviceLevelMethod: ServiceLevelMethod | null;
  shippingLabelMethod: ShippingLabelMethod | null;
  slug: string;
  shippedReportMethod: ShippedReportMethod | null;
}

function buildInitialForm(record?: CarrierServiceType | null): FormState {
  return {
    carrierCompanyNumber: record?.carrier_company_number ?? null,
    blockedDowngrade: record?.blocked_downgrade ?? false,
    serviceLevelMethod: record?.service_level_method ?? null,
    shippingLabelMethod: record?.shipping_label_method ?? null,
    slug: record?.slug ?? '',
    shippedReportMethod: record?.shipped_report_method ?? null,
  };
}

export interface CreateCarrierServiceTypeDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (next: CarrierServiceType) => void;
  record: CarrierServiceType | null;
  /** Next auto-assigned ID, shown in the read-only field when creating. */
  nextId: number;
}

function CarrierCompanySelect({
  value,
  onChange,
  invalid,
}: {
  value: number | null;
  onChange: (next: number) => void;
  invalid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo<CarrierCompany[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CARRIER_COMPANIES;
    return CARRIER_COMPANIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || String(c.number).includes(q),
    );
  }, [query]);

  const selected = value != null ? findCarrierByNumber(value) ?? null : null;

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(''); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border bg-white px-3 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none',
            'hover:border-black focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            invalid ? 'border-red-500' : 'border-gray-300',
          )}
        >
          <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-gray-500')}>
            {selected ? formatCarrierOption(selected) : 'Select carrier'}
          </span>
          <ChevronDown className="size-4 shrink-0 text-gray-500" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="border-b border-gray-200 p-2">
          <Input
            autoFocus
            placeholder="Search carriers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 border-gray-300"
          />
        </div>
        <div className="max-h-[240px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">No carriers found.</p>
          ) : (
            filtered.map((c) => {
              const isSelected = value === c.number;
              return (
                <button
                  key={c.number}
                  type="button"
                  onClick={() => {
                    onChange(c.number);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100',
                    isSelected && 'bg-gray-50',
                  )}
                >
                  <span className="min-w-0 truncate">{formatCarrierOption(c)}</span>
                  {isSelected ? <Check className="size-4 text-[#1976d2]" /> : null}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Field({
  label,
  required,
  error,
  children,
  helper,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  helper?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-gray-600">
          {label}
          {required ? <span className="text-gray-900">*</span> : null}
        </Label>
        {helper}
      </div>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default function CreateCarrierServiceTypeDrawer({
  open,
  onClose,
  onSave,
  record,
  nextId,
}: CreateCarrierServiceTypeDrawerProps) {
  const isEditMode = !!record;
  const [form, setForm] = useState<FormState>(() => buildInitialForm(record));
  const [originalForm, setOriginalForm] = useState<FormState>(() => buildInitialForm(record));
  const [showErrors, setShowErrors] = useState(false);
  const [touchedSlug, setTouchedSlug] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next = buildInitialForm(record);
    setForm(next);
    setOriginalForm(next);
    setShowErrors(false);
    setTouchedSlug(false);
  }, [open, record]);

  const carrierError =
    form.carrierCompanyNumber == null ? 'Select a carrier company.' : null;
  const slugError =
    form.slug.length > SLUG_MAX_LENGTH ? `Slug must be ${SLUG_MAX_LENGTH} characters or fewer.` : null;

  const isValid = !carrierError && !slugError;
  const isDirty = JSON.stringify(form) !== JSON.stringify(originalForm);
  const canSubmit = isValid && (isEditMode ? isDirty : true);

  const handleSubmit = () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    const carrier = findCarrierByNumber(form.carrierCompanyNumber!)!;
    onSave({
      carrier_service_type_id: record?.carrier_service_type_id ?? 0,
      carrier_company_number: carrier.number,
      car_company_name: carrier.name,
      blocked_downgrade: form.blockedDowngrade,
      service_level_method: form.serviceLevelMethod,
      shipping_label_method: form.shippingLabelMethod,
      slug: form.slug.trim(),
      shipped_report_method: form.shippedReportMethod,
    });
    onClose();
  };

  const title = isEditMode ? 'Edit Carrier Service Type' : 'Create Carrier Service Type';
  const submitLabel = isEditMode ? 'Save Changes' : 'Create Carrier Service Type';

  const sectionTitleClass = 'text-sm font-semibold text-[#101828]';
  const cardClass = 'rounded-md bg-[#FAFAFA] p-4';

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        hideClose
        side="right"
        className="flex h-full min-h-0 w-full flex-col gap-0 overflow-hidden border-l border-gray-200 bg-white p-0 sm:max-w-[600px]"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-200 px-6 py-4 text-left">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle className="text-base font-semibold leading-normal text-[#101828]">{title}</SheetTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-full text-gray-600 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-6">
            <div>
              <p className={cn(sectionTitleClass, 'mb-3')}>Properties</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <Field label="Carrier Service Type ID">
                  <Input
                    value={String(isEditMode ? record?.carrier_service_type_id ?? '' : nextId)}
                    readOnly
                    className="border-gray-300 bg-gray-100 text-gray-700"
                  />
                </Field>

                <Field
                  label="Carrier Company"
                  required
                  error={showErrors ? carrierError : null}
                >
                  <CarrierCompanySelect
                    value={form.carrierCompanyNumber}
                    onChange={(num) => setForm((prev) => ({ ...prev, carrierCompanyNumber: num }))}
                    invalid={showErrors && !!carrierError}
                  />
                </Field>

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-600">
                    Blocked Downgrade<span className="text-gray-900">*</span>
                  </Label>
                  <Switch
                    checked={form.blockedDowngrade}
                    onCheckedChange={(v) => setForm((prev) => ({ ...prev, blockedDowngrade: v }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Service Level Method">
                    <Select
                      value={form.serviceLevelMethod ?? NONE_OPTION_VALUE}
                      onValueChange={(v) =>
                        setForm((prev) => ({
                          ...prev,
                          serviceLevelMethod: v === NONE_OPTION_VALUE ? null : (v as ServiceLevelMethod),
                        }))
                      }
                    >
                      <SelectTrigger className="border-gray-300 bg-white">
                        <SelectValue placeholder="— None —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_OPTION_VALUE}>— None —</SelectItem>
                        {SERVICE_LEVEL_METHOD_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {SERVICE_LEVEL_METHOD_LABELS[opt]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Shipping Label Method">
                    <Select
                      value={form.shippingLabelMethod ?? NONE_OPTION_VALUE}
                      onValueChange={(v) =>
                        setForm((prev) => ({
                          ...prev,
                          shippingLabelMethod: v === NONE_OPTION_VALUE ? null : (v as ShippingLabelMethod),
                        }))
                      }
                    >
                      <SelectTrigger className="border-gray-300 bg-white">
                        <SelectValue placeholder="— None —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_OPTION_VALUE}>— None —</SelectItem>
                        {SHIPPING_LABEL_METHOD_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {SHIPPING_LABEL_METHOD_LABELS[opt]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field
                  label="Slug"
                  error={(showErrors || touchedSlug) ? slugError : null}
                  helper={
                    <span className="text-xs tabular-nums text-gray-500">
                      {form.slug.length} / {SLUG_MAX_LENGTH}
                    </span>
                  }
                >
                  <Input
                    className="border-gray-300 bg-white"
                    value={form.slug}
                    maxLength={SLUG_MAX_LENGTH}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    onBlur={() => setTouchedSlug(true)}
                    placeholder="e.g. usps-prio"
                  />
                </Field>

                <Field label="Shipped Report Method">
                  <Select
                    value={form.shippedReportMethod ?? NONE_OPTION_VALUE}
                    onValueChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        shippedReportMethod: v === NONE_OPTION_VALUE ? null : (v as ShippedReportMethod),
                      }))
                    }
                  >
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="— None —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_OPTION_VALUE}>— None —</SelectItem>
                      {SHIPPED_REPORT_METHOD_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {SHIPPED_REPORT_METHOD_LABELS[opt]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          </div>
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
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="min-w-[200px] bg-[#1976d2] text-[15px] font-medium text-white hover:bg-[#1565c0] disabled:bg-[#1976d2] disabled:text-white disabled:opacity-50"
          >
            {submitLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
