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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Switch } from './ui/switch';
import { cn } from './ui/utils';
import {
  CARRIER_SERVICE_TYPE_TABLE,
  SHIPPING_ROUTE_COUNTRY_CODES,
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
  fromCountryCode: string;
  toCountryCode: string;
  maxShippingValue: string;
  packingTimeFrame: string;
  shippingTimeFrame: string;
  shippingCost: string;
  packingFacility: string;
  shippingWorkingDays: number[];
}

interface CreateShippingRouteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (routeData: RouteFormData) => void;
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

function validateMaxShippingValue(v: string): string | null {
  if (!v.trim()) return 'Required.';
  if (!isDecimalUpTo(v, 2)) return 'Up to 2 decimals.';
  const n = Number(v);
  if (Number.isNaN(n) || n < MAX_SHIPPING_VALUE_MIN || n > MAX_SHIPPING_VALUE_MAX)
    return `Must be between ${MAX_SHIPPING_VALUE_MIN} and ${MAX_SHIPPING_VALUE_MAX}.`;
  return null;
}

function validateShippingCost(v: string): string | null {
  if (!v.trim()) return 'Required.';
  if (!isDecimalUpTo(v, 2)) return 'Up to 2 decimals.';
  const n = Number(v);
  if (Number.isNaN(n) || n < SHIPPING_COST_MIN || n > SHIPPING_COST_MAX)
    return `Must be between ${SHIPPING_COST_MIN} and ${SHIPPING_COST_MAX}.`;
  return null;
}

function validateTimeFrame(v: string, label: string): string | null {
  if (!v.trim()) return 'Required.';
  if (!isInteger(v)) return 'Whole number only.';
  const n = Number(v);
  if (n < TIME_FRAME_MIN || n > TIME_FRAME_MAX)
    return `${label} must be between ${TIME_FRAME_MIN} and ${TIME_FRAME_MAX}.`;
  return null;
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

  const sorted = [...value].sort((a, b) => a - b);
  const display = sorted.map((d) => renderOption(d)).join(', ');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-9 w-full items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none',
            'hover:border-black focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          )}
        >
          <span className={cn('min-w-0 flex-1 truncate', value.length === 0 && 'text-gray-500')}>
            {value.length === 0 ? placeholder || 'Select' : display}
          </span>
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
  // Draft shipping route ID surfaced to the user when creating a new route.
  // Server typically owns final assignment; this is just a placeholder.
  const [draftId, setDraftId] = useState('');

  useEffect(() => {
    if (!open) return;
    const next = buildInitialForm(route);
    setFormData(next);
    setOriginalData(next);
    setShowErrors(false);
    if (!route) {
      setDraftId(`SR-${Date.now().toString().slice(-6)}`);
    }
  }, [open, route]);

  const displayId = isEditMode ? (route?.id ?? '') : draftId;

  const title = isEditMode ? `Update ${route?.id ?? 'Route'}` : 'Create Shipping Route';

  // Auto-assign service level from selected carrier service type.
  useEffect(() => {
    if (!formData.carrierServiceType) return;
    const entry = CARRIER_SERVICE_TYPE_TABLE.find((c) => c.name === formData.carrierServiceType);
    if (entry && entry.serviceLevel !== formData.serviceLevel) {
      setFormData((prev) => ({ ...prev, serviceLevel: entry.serviceLevel }));
    }
  }, [formData.carrierServiceType, formData.serviceLevel]);

  const errors = useMemo(() => {
    return {
      carrierServiceType: formData.carrierServiceType ? null : 'Required.',
      fromCountryCode: formData.fromCountryCode ? null : 'Required.',
      toCountryCode: formData.toCountryCode ? null : 'Required.',
      packingFacility: formData.packingFacility ? null : 'Required.',
      maxShippingValue: validateMaxShippingValue(formData.maxShippingValue),
      shippingCost: validateShippingCost(formData.shippingCost),
      packingTimeFrame: validateTimeFrame(formData.packingTimeFrame, 'Packing time frame'),
      shippingTimeFrame: validateTimeFrame(formData.shippingTimeFrame, 'Shipping time frame'),
      shippingWorkingDays:
        formData.shippingWorkingDays.length > 0 ? null : 'Select at least one day.',
    };
  }, [formData]);

  const isValid = Object.values(errors).every((e) => !e);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  const canSave = isEditMode ? isValid && isDirty : isValid;

  const handleSubmit = () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    onSubmit(formData);
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

                <Field
                  label="Carrier Service Type Name"
                  required
                  error={showErrors ? errors.carrierServiceType : null}
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
                      <SelectValue placeholder="Assigned from carrier service type" />
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

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-600">
                    Priority<span className="text-gray-900">*</span>
                  </Label>
                  <Switch
                    checked={formData.priority}
                    onCheckedChange={(v) => setFormData({ ...formData, priority: v })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="From Country Code"
                    required
                    error={showErrors ? errors.fromCountryCode : null}
                  >
                    <Select
                      value={formData.fromCountryCode || undefined}
                      onValueChange={(v) => setFormData({ ...formData, fromCountryCode: v })}
                    >
                      <SelectTrigger className="border-gray-300 bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIPPING_ROUTE_COUNTRY_CODES.map((opt) => (
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
                    error={showErrors ? errors.toCountryCode : null}
                  >
                    <Select
                      value={formData.toCountryCode || undefined}
                      onValueChange={(v) => setFormData({ ...formData, toCountryCode: v })}
                    >
                      <SelectTrigger className="border-gray-300 bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
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
                  error={showErrors ? errors.packingFacility : null}
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
                    error={showErrors ? errors.packingTimeFrame : null}
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
                    error={showErrors ? errors.shippingTimeFrame : null}
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
                    error={showErrors ? errors.maxShippingValue : null}
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
                    />
                  </Field>
                  <Field label="Currency Code">
                    <Input value="USD" readOnly className="border-gray-300 bg-gray-100 text-gray-700" />
                  </Field>
                </div>

                <Field
                  label="Shipping Cost"
                  required
                  error={showErrors ? errors.shippingCost : null}
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
                    />
                  </div>
                </Field>

                <Field
                  label="Shipping Working Days"
                  required
                  error={showErrors ? errors.shippingWorkingDays : null}
                >
                  <MultiSelectField
                    value={formData.shippingWorkingDays}
                    onChange={(v) => setFormData({ ...formData, shippingWorkingDays: v })}
                    options={[1, 2, 3, 4, 5, 6, 7]}
                    placeholder="Select days"
                    renderOption={(d) => `${d} (${SHIPPING_ROUTE_WORKING_DAY_LABELS[d]})`}
                  />
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
