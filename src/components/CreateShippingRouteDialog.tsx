import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import ProgressMeter from './ProgressMeter';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Switch } from './ui/switch';
import { cn } from './ui/utils';
import {
  USAGE_LIMIT_MIN,
  formatUsageLimit,
  isUsageWarning,
  parseUsageLimit,
  resolvePreferred,
  usageLimitWarning,
  usagePercent,
} from './shippingRouteUsage';
import {
  CARRIER_SERVICE_TYPE_TABLE,
  SHIPPING_ROUTE_COUNTRY_CODES,
  SHIPPING_ROUTE_FROM_COUNTRY_CODES,
  SHIPPING_ROUTE_PACKING_FACILITIES,
  SHIPPING_ROUTE_WORKING_DAY_LABELS,
  ServiceLevel,
  ShippingRoute,
} from './ShippingRoutesTable';

const SERVICE_LEVELS: ServiceLevel[] = ['Basic', 'Expedited', 'Express'];

interface RouteFormData {
  status: 'Active' | 'Inactive';
  carrierServiceType: string;
  serviceLevel: ServiceLevel | '';
  priority: boolean;
  /** Raw field text; blank means unlimited. Parsed on submit. */
  usageLimit: string;
  fromCountryCode: string;
  toCountryCode: string;
  maxShippingValue: string;
  packingTimeFrame: string;
  shippingTimeFrame: string;
  shippingCost: string;
  packingFacility: string;
  shippingWorkingDays: number[];
}

/**
 * What the panel hands back: the usage limit parsed to a number (or null for
 * unlimited) and `priority` already resolved against the current usage count,
 * so a limit at or below the count arrives with preferred stripped.
 */
export interface RouteFormSubmitData extends Omit<RouteFormData, 'usageLimit'> {
  usageLimit: number | null;
  /** Set when this save is what dropped preferred status. See resolvePreferred. */
  preferredClearedByLimit: boolean;
}

interface CreateShippingRouteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (routeData: RouteFormSubmitData) => void;
  route?: ShippingRoute | null;
}

const MAX_SHIPPING_VALUE_MIN = 0;
const MAX_SHIPPING_VALUE_MAX = 10000;
const SHIPPING_COST_MIN = 0;
const SHIPPING_COST_MAX = 1000;
const TIME_FRAME_MIN = 0;
const TIME_FRAME_MAX = 30;

function buildInitialForm(route?: ShippingRoute | null): RouteFormData {
  return {
    status: route?.status || 'Inactive',
    carrierServiceType: route?.carrierServiceType || '',
    serviceLevel: route?.serviceLevel || '',
    priority: route?.priority ?? false,
    usageLimit: formatUsageLimit(route?.usageLimit),
    fromCountryCode: route?.fromCountryCode || '',
    toCountryCode: route?.toCountryCode || '',
    maxShippingValue: route?.maxShippingValue || '',
    packingTimeFrame: route?.packingTimeFrame || '',
    shippingTimeFrame: route?.shippingTimeFrame || '',
    shippingCost: route?.shippingCost || '',
    packingFacility: route?.packingFacility || '',
    shippingWorkingDays: route?.shippingWorkingDays ? [...route.shippingWorkingDays] : [],
  };
}

function isInteger(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

function isDecimalUpTo(value: string, decimals: number): boolean {
  const re = new RegExp(`^\\d+(?:\\.\\d{1,${decimals}})?$`);
  return re.test(value.trim());
}

type FieldError = { required?: string; format?: string };

function validateMaxShippingValue(v: string): FieldError {
  if (!v.trim()) return { required: 'Required.' };
  if (!isDecimalUpTo(v, 2)) return { format: 'Up to 2 decimals.' };
  const n = Number(v);
  if (Number.isNaN(n) || n < MAX_SHIPPING_VALUE_MIN || n > MAX_SHIPPING_VALUE_MAX)
    return { format: `Must be between ${MAX_SHIPPING_VALUE_MIN} and ${MAX_SHIPPING_VALUE_MAX}.` };
  return {};
}

function validateShippingCost(v: string): FieldError {
  if (!v.trim()) return { required: 'Required.' };
  if (!isDecimalUpTo(v, 2)) return { format: 'Up to 2 decimals.' };
  const n = Number(v);
  if (Number.isNaN(n) || n < SHIPPING_COST_MIN || n > SHIPPING_COST_MAX)
    return { format: `Must be between ${SHIPPING_COST_MIN} and ${SHIPPING_COST_MAX}.` };
  return {};
}

function validateTimeFrame(v: string): FieldError {
  if (!v.trim()) return { required: 'Required.' };
  if (!isInteger(v)) return { format: 'Whole number only.' };
  const n = Number(v);
  if (n < TIME_FRAME_MIN || n > TIME_FRAME_MAX)
    return { format: `Must be between ${TIME_FRAME_MIN} and ${TIME_FRAME_MAX}.` };
  return {};
}

function hasError(e: FieldError | null | undefined): boolean {
  return !!e && (!!e.required || !!e.format);
}

function liveError(e: FieldError | null | undefined, showRequired: boolean): string | null {
  if (!e) return null;
  if (e.format) return e.format;
  if (showRequired && e.required) return e.required;
  return null;
}

function formatCurrency(v: string): string {
  const n = Number(v);
  if (!v.trim() || Number.isNaN(n)) return v;
  return n.toFixed(2);
}

function MultiSelectField({
  value,
  onChange,
  options,
  placeholder,
  renderOption,
}: {
  value: number[];
  onChange: (next: number[]) => void;
  options: number[];
  placeholder?: string;
  renderOption: (opt: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: number) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  const remove = (opt: number) => onChange(value.filter((v) => v !== opt));

  const sorted = [...value].sort((a, b) => a - b);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex min-h-9 w-full items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 py-1 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none',
            'hover:border-black focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {value.length === 0 ? (
              <span className="px-1 text-gray-500">{placeholder || 'Select'}</span>
            ) : (
              sorted.map((v) => (
                <span
                  key={v}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                >
                  <span className="min-w-0 truncate">{renderOption(v)}</span>
                  <button
                    type="button"
                    className="shrink-0 rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                    aria-label={`Remove ${renderOption(v)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove(v);
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          {value.length > 0 ? (
            <button
              type="button"
              className="mr-1 shrink-0 rounded-full p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Clear all"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange([]);
              }}
            >
              <X className="size-4" />
            </button>
          ) : null}
          <ChevronDown className="size-4 shrink-0 text-gray-500" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
        <div className="space-y-0.5" role="listbox" aria-multiselectable="true">
          {options.map((opt) => {
            const checked = value.includes(opt);
            return (
              <Label
                key={opt}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100',
                  checked && 'bg-gray-50',
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(opt)} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{renderOption(opt)}</span>
              </Label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Current usage on an existing route. With a limit set we show "742 / 1000"
 * plus a bar; unlimited routes show the count alone, with no limit and no bar.
 * Tracks the *entered* limit so the reading updates as the admin types.
 */
function UsageProgress({ usageCount, usageLimit }: { usageCount: number; usageLimit: number | null }) {
  // Unlimited: the count alone, no meter — there's no ratio to show.
  if (usageLimit === null) {
    return (
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-gray-600">Usage</span>
        <span className="text-xs font-medium text-[#101828]">
          {usageCount.toLocaleString()} <span className="font-normal text-gray-500">packed · unlimited</span>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <span className="block text-xs text-gray-600">Usage</span>
      <ProgressMeter
        label={`${usageCount.toLocaleString()} / ${usageLimit.toLocaleString()}`}
        percent={usagePercent({ usageCount, usageLimit }) ?? 0}
        warning={isUsageWarning({ usageCount, usageLimit })}
      />
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-600">
        {label}
        {required ? <span className="text-gray-900">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default function CreateShippingRouteDialog({
  open,
  onClose,
  onSubmit,
  route,
}: CreateShippingRouteDialogProps) {
  const isEditMode = !!route;
  const [formData, setFormData] = useState<RouteFormData>(() => buildInitialForm(route));
  const [originalData, setOriginalData] = useState<RouteFormData>(() => buildInitialForm(route));
  const [showErrors, setShowErrors] = useState(false);
  // Draft auto-assigned IDs surfaced to the user when creating a new route.
  // Server typically owns final assignment; these are just placeholders.
  const [draftIds, setDraftIds] = useState<{ id: string; externalId: string }>({ id: '', externalId: '' });

  useEffect(() => {
    if (!open) return;
    const next = buildInitialForm(route);
    setFormData(next);
    setOriginalData(next);
    setShowErrors(false);
    if (!route) {
      const suffix = Date.now().toString().slice(-6);
      setDraftIds({ id: `SR-${suffix}`, externalId: `EXT-${suffix}` });
    }
  }, [open, route]);

  const displayId = isEditMode ? (route?.id ?? '') : draftIds.id;
  const displayExternalId = isEditMode ? (route?.externalId ?? '') : draftIds.externalId;

  const title = isEditMode ? `Update ${route?.id ?? 'Route'}` : 'Create Shipping Route';

  // Auto-assign service level from selected carrier service type.
  useEffect(() => {
    if (!formData.carrierServiceType) return;
    const entry = CARRIER_SERVICE_TYPE_TABLE.find((c) => c.name === formData.carrierServiceType);
    if (entry && entry.serviceLevel !== formData.serviceLevel) {
      setFormData((prev) => ({ ...prev, serviceLevel: entry.serviceLevel }));
    }
  }, [formData.carrierServiceType, formData.serviceLevel]);

  const usageCount = route?.usageCount ?? 0;
  const parsedUsageLimit = useMemo(() => parseUsageLimit(formData.usageLimit), [formData.usageLimit]);

  // Only surfaced while Priority is on — the input is hidden otherwise, and a
  // hidden field must never be able to block saving.
  const usageLimitWarningText = formData.priority
    ? usageLimitWarning(formData.priority, parsedUsageLimit.value, usageCount)
    : null;

  const errors = useMemo(() => {
    return {
      usageLimit:
        formData.priority && parsedUsageLimit.error ? { format: parsedUsageLimit.error } : {},
      carrierServiceType: formData.carrierServiceType ? {} : { required: 'Required.' },
      fromCountryCode: formData.fromCountryCode ? {} : { required: 'Required.' },
      toCountryCode: formData.toCountryCode ? {} : { required: 'Required.' },
      packingFacility: formData.packingFacility ? {} : { required: 'Required.' },
      maxShippingValue: validateMaxShippingValue(formData.maxShippingValue),
      shippingCost: validateShippingCost(formData.shippingCost),
      packingTimeFrame: validateTimeFrame(formData.packingTimeFrame),
      shippingTimeFrame: validateTimeFrame(formData.shippingTimeFrame),
      shippingWorkingDays:
        formData.shippingWorkingDays.length > 0 ? {} : { required: 'Select at least one day.' },
    } as Record<string, FieldError>;
  }, [formData, parsedUsageLimit]);

  const isValid = !Object.values(errors).some(hasError);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  const canSave = isEditMode ? isValid && isDirty : isValid;

  const handleSubmit = () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    // Blank the limit when Priority is off — an unused cap shouldn't linger on
    // the record. Preferred is resolved here so a limit at or below the current
    // count strips it on save, matching the automatic packing-event behaviour.
    const usageLimit = formData.priority ? parsedUsageLimit.value : null;
    const { usageLimit: _rawUsageLimit, ...rest } = formData;
    const preferred = resolvePreferred(formData.priority, { usageLimit, usageCount });
    onSubmit({ ...rest, usageLimit, ...preferred });
    onClose();
  };

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
            {/* Route Properties */}
            <div>
              <p className={cn(sectionTitleClass, 'mb-3')}>Route Properties</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <Field label="Shipping Route ID">
                  <Input value={displayId} readOnly className="border-gray-300 bg-gray-100 text-gray-700" />
                </Field>

                <Field label="Status" required>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as 'Active' | 'Inactive' })}
                  >
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Carrier Service Type Name"
                    required
                    error={liveError(errors.carrierServiceType, showErrors)}
                  >
                    <Select
                      value={formData.carrierServiceType || undefined}
                      onValueChange={(v) => setFormData({ ...formData, carrierServiceType: v })}
                    >
                      <SelectTrigger className="border-gray-300 bg-white">
                        <SelectValue placeholder="Select carrier service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARRIER_SERVICE_TYPE_TABLE.map((opt) => (
                          <SelectItem key={opt.name} value={opt.name}>
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Service Level">
                    <Select
                      value={formData.serviceLevel || undefined}
                      onValueChange={(v) => setFormData({ ...formData, serviceLevel: v as ServiceLevel })}
                      disabled
                    >
                      <SelectTrigger className="border-gray-300 bg-gray-100 text-gray-700">
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_LEVELS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="flex flex-col gap-3 rounded-md border border-gray-300 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Label className="text-sm font-medium text-[#101828]">
                        Priority<span className="text-gray-900">*</span>
                      </Label>
                      <p className="mt-1 text-xs leading-snug text-gray-600">
                        This route is selected over other matching routes when assigning a shipment.
                      </p>
                    </div>
                    <Switch
                      className="mt-0.5 shrink-0"
                      checked={formData.priority}
                      onCheckedChange={(v) => setFormData({ ...formData, priority: v })}
                    />
                  </div>

                  {/* Usage limit only applies to preferred routes. */}
                  {formData.priority ? (
                    <div className="flex flex-col gap-2">
                      <Field label="Usage limit" error={liveError(errors.usageLimit, showErrors)}>
                        <div className="flex items-center gap-2">
                          <Input
                            className="border-gray-300 bg-white"
                            type="number"
                            min={USAGE_LIMIT_MIN}
                            step="1"
                            placeholder="Leave blank for unlimited"
                            value={formData.usageLimit}
                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                          />
                          {formData.usageLimit.trim() ? (
                            <Button
                              type="button"
                              variant="ghost"
                              className="shrink-0 px-2 text-xs font-medium text-[#1976d2] hover:bg-blue-50 hover:text-[#1565c0]"
                              onClick={() => setFormData({ ...formData, usageLimit: '' })}
                            >
                              Clear limit
                            </Button>
                          ) : null}
                        </div>
                      </Field>

                      {usageLimitWarningText ? (
                        <p className="rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
                          {usageLimitWarningText}
                        </p>
                      ) : null}

                      {isEditMode ? <UsageProgress usageCount={usageCount} usageLimit={parsedUsageLimit.value} /> : null}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="From Country Code"
                    required
                    error={liveError(errors.fromCountryCode, showErrors)}
                  >
                    <Select
                      value={formData.fromCountryCode || undefined}
                      onValueChange={(v) => setFormData({ ...formData, fromCountryCode: v })}
                    >
                      <SelectTrigger className="border-gray-300 bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {SHIPPING_ROUTE_FROM_COUNTRY_CODES.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field
                    label="To Country Code"
                    required
                    error={liveError(errors.toCountryCode, showErrors)}
                  >
                    <Select
                      value={formData.toCountryCode || undefined}
                      onValueChange={(v) => setFormData({ ...formData, toCountryCode: v })}
                    >
                      <SelectTrigger className="border-gray-300 bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {SHIPPING_ROUTE_COUNTRY_CODES.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field
                  label="Packing Facility"
                  required
                  error={liveError(errors.packingFacility, showErrors)}
                >
                  <Select
                    value={formData.packingFacility || undefined}
                    onValueChange={(v) => setFormData({ ...formData, packingFacility: v })}
                  >
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="Select packing facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIPPING_ROUTE_PACKING_FACILITIES.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Shipping Values */}
            <div>
              <p className={cn(sectionTitleClass, 'mb-3')}>Shipping Values</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Packing Time Frame (days)"
                    required
                    error={liveError(errors.packingTimeFrame, showErrors)}
                  >
                    <Input
                      className="border-gray-300 bg-white"
                      type="number"
                      min={TIME_FRAME_MIN}
                      max={TIME_FRAME_MAX}
                      step="1"
                      placeholder="0"
                      value={formData.packingTimeFrame}
                      onChange={(e) => setFormData({ ...formData, packingTimeFrame: e.target.value })}
                    />
                  </Field>
                  <Field
                    label="Shipping Time Frame (days)"
                    required
                    error={liveError(errors.shippingTimeFrame, showErrors)}
                  >
                    <Input
                      className="border-gray-300 bg-white"
                      type="number"
                      min={TIME_FRAME_MIN}
                      max={TIME_FRAME_MAX}
                      step="1"
                      placeholder="0"
                      value={formData.shippingTimeFrame}
                      onChange={(e) => setFormData({ ...formData, shippingTimeFrame: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Max Shipping Value"
                    required
                    error={liveError(errors.maxShippingValue, showErrors)}
                  >
                    <Input
                      className="border-gray-300 bg-white"
                      type="number"
                      min={MAX_SHIPPING_VALUE_MIN}
                      max={MAX_SHIPPING_VALUE_MAX}
                      step="0.01"
                      placeholder="0.00"
                      value={formData.maxShippingValue}
                      onChange={(e) => setFormData({ ...formData, maxShippingValue: e.target.value })}
                      onBlur={() => setFormData((prev) => ({ ...prev, maxShippingValue: formatCurrency(prev.maxShippingValue) }))}
                    />
                  </Field>
                  <Field label="Currency Code">
                    <Input value="USD" readOnly className="border-gray-300 bg-gray-100 text-gray-700" />
                  </Field>
                </div>

                <Field
                  label="Shipping Cost"
                  required
                  error={liveError(errors.shippingCost, showErrors)}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                    <Input
                      className="border-gray-300 bg-white pl-7"
                      type="number"
                      min={SHIPPING_COST_MIN}
                      max={SHIPPING_COST_MAX}
                      step="0.01"
                      placeholder="0.00"
                      value={formData.shippingCost}
                      onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                      onBlur={() => setFormData((prev) => ({ ...prev, shippingCost: formatCurrency(prev.shippingCost) }))}
                    />
                  </div>
                </Field>

                <Field
                  label="Shipping Working Days"
                  required
                  error={liveError(errors.shippingWorkingDays, showErrors)}
                >
                  <MultiSelectField
                    value={formData.shippingWorkingDays}
                    onChange={(v) => setFormData({ ...formData, shippingWorkingDays: v })}
                    options={[1, 2, 3, 4, 5, 6, 7]}
                    placeholder="Select days"
                    renderOption={(d) => (d === 1 ? '1 day' : `${d} days`)}
                  />
                </Field>

                <Field label="External ID">
                  <Input value={displayExternalId} readOnly className="border-gray-300 bg-gray-100 text-gray-700" />
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
            disabled={!canSave}
            className="min-w-[140px] bg-[#1976d2] text-[15px] font-medium text-white hover:bg-[#1565c0] disabled:bg-[#1976d2] disabled:text-white disabled:opacity-50"
          >
            {isEditMode ? 'Save changes' : 'Create Route'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
