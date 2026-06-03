import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus, X } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';
import ScheduleFuturePricingDialog, { FuturePricingData } from './ScheduleFuturePricingDialog';
import { ShippingRoute } from './ShippingRoutesTable';

interface RouteFormData {
  packingFacility: string;
  destinationCountries: string[];
  carrierServiceType: string;
  carrierName: string;
  originalCarrierServiceType: string;
  slug: string;
  method: string;
  shippingCost: string;
  packingTimeFrame: string;
  shippingTimeFrame: string;
  maxShippingValue: string;
  currencyCode: string;
  shippingWorkingDays: string[];
}

interface PricingData {
  shippingCost: string;
  fuelTax: string;
  vat: string;
  discount: string;
  agentCommission: string;
  agentCommissionType: 'percentage' | 'flat';
  surcharge: string;
  surchargeType: 'flat' | 'percentage';
}

interface ScheduledPricing extends PricingData {
  id: string;
  startDate: string;
}

interface HistoricalPricing {
  dateTimeFrame: string;
  agreementCost: string;
  fuelTax: string;
  vat: string;
  discount: string;
  agentCommission: string;
  surcharge: string;
}

interface CreateShippingRouteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (routeData: RouteFormData) => void;
  route?: ShippingRoute | null;
}

const PACKING_FACILITIES = ['Berlin', 'Cairo', 'Kiryat Gat', 'Nazareth', 'Moscow', 'Mumbai', 'Seoul', 'São Paulo', 'Thailand', 'Tokyo'];
const DESTINATION_COUNTRIES = ['Africa', 'Asia', 'Australia', 'NZ', 'Canada', 'Europe', 'South America', 'USA'];
const CARRIER_SERVICE_TYPES = ['DHL', 'FedEx', 'Global Post TH', 'GlobalPost', 'Korea Post', 'UPS', 'USPS', 'DHL TH'];
const METHODS = ['Expedited', 'Express', 'Standard'];
const CURRENCY_CODES = ['BRL', 'EGP', 'EUR', 'INR', 'KRW', 'RUB', 'USD'];
const WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CARRIERS = [
  { name: 'DHL', originalServiceType: 'Express' },
  { name: 'FedEx', originalServiceType: 'Ground' },
  { name: 'UPS', originalServiceType: 'Next Day Air' },
  { name: 'MailLog', originalServiceType: 'Standard' },
  { name: 'USPS', originalServiceType: 'Priority Mail' },
  { name: 'ShineOn', originalServiceType: 'Express' },
  { name: 'Tapuz', originalServiceType: 'LTL' },
  { name: 'RoyalMail', originalServiceType: 'First Class' },
  { name: 'Hermes', originalServiceType: 'Standard' },
  { name: 'IsraelPost', originalServiceType: 'Express' },
  { name: 'Landmark', originalServiceType: 'Ground' },
];

const HISTORICAL_DATA: HistoricalPricing[] = [
  {
    dateTimeFrame: '04/12/25 - 05/12/25',
    agreementCost: '15.5',
    fuelTax: '1.05%',
    vat: '1.05%',
    discount: '5%',
    agentCommission: '2%',
    surcharge: '1.5%',
  },
  {
    dateTimeFrame: '05/12/25 - 07/12/25',
    agreementCost: '13.5',
    fuelTax: '1.15%',
    vat: '1.15%',
    discount: '2%',
    agentCommission: '1.5%',
    surcharge: '1.0%',
  },
  {
    dateTimeFrame: '07/12/25 - 09/12/25',
    agreementCost: '16.2',
    fuelTax: '1.10%',
    vat: '1.10%',
    discount: '4%',
    agentCommission: '2.5%',
    surcharge: '2.0%',
  },
];

function buildInitialForm(route?: ShippingRoute | null): RouteFormData {
  return {
    packingFacility: route?.packingFacility || '',
    destinationCountries: route?.destinationCountries || [],
    carrierServiceType: route?.carrierServiceType || '',
    carrierName: route?.carrierName || '',
    originalCarrierServiceType: route?.originalCarrierServiceType || '',
    slug: route?.slug || '',
    method: route?.method || '',
    shippingCost: route?.shippingCost || '',
    packingTimeFrame: route?.packingTimeFrame || '',
    shippingTimeFrame: route?.shippingTimeFrame || '',
    maxShippingValue: route?.maxShippingValue || '',
    currencyCode: route?.currencyCode || '',
    shippingWorkingDays: route?.shippingWorkingDays ? route.shippingWorkingDays.split(', ') : [],
  };
}

function buildInitialPricing(route?: ShippingRoute | null): PricingData {
  return {
    shippingCost: route?.shippingCost || '',
    fuelTax: route?.fuelTax || '',
    vat: route?.vat || '',
    discount: route?.discount || '',
    agentCommission: '',
    agentCommissionType: (route?.agentCommissionType as 'percentage' | 'flat') || 'flat',
    surcharge: '',
    surchargeType: 'flat',
  };
}

function MultiSelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  const remove = (opt: string) => onChange(value.filter((v) => v !== opt));

  const overflowMoreCount = value.length > 3 ? value.length - 2 : 0;
  const visible = overflowMoreCount > 0 ? value.slice(0, 2) : value;

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
          <div className="flex min-h-0 min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
            {value.length === 0 ? (
              <span className="truncate text-gray-500">{placeholder || 'Select'}</span>
            ) : (
              <>
                {visible.map((v) => (
                  <span
                    key={v}
                    className="inline-flex max-w-[10rem] shrink-0 items-center gap-0.5 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                  >
                    <span className="min-w-0 truncate">{v}</span>
                    <button
                      type="button"
                      className="shrink-0 rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                      aria-label={`Remove ${v}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        remove(v);
                      }}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                {overflowMoreCount > 0 ? (
                  <span
                    className="shrink-0 truncate text-xs font-medium tabular-nums text-gray-600"
                    title={value.slice(2).join(', ')}
                  >
                    +{overflowMoreCount} more
                  </span>
                ) : null}
              </>
            )}
          </div>
          <ChevronDown className="size-4 shrink-0 text-gray-500" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[min(100vw-2rem,24rem)] p-2" align="start">
        <div className="max-h-60 space-y-0.5 overflow-y-auto pr-1" role="listbox" aria-multiselectable="true">
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
                <span className="min-w-0 flex-1 truncate">{opt}</span>
              </Label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-600">{label}</Label>
      {children}
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
  const [status, setStatus] = useState<'Inactive' | 'Active'>(route?.status || 'Inactive');
  const [formData, setFormData] = useState<RouteFormData>(() => buildInitialForm(route));
  const [pricing, setPricing] = useState<PricingData>(() => buildInitialPricing(route));
  const [isHistoricalExpanded, setIsHistoricalExpanded] = useState(false);
  const [isFuturePricingDialogOpen, setIsFuturePricingDialogOpen] = useState(false);
  const [scheduledPricings, setScheduledPricings] = useState<ScheduledPricing[]>([]);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);

  const [originalData, setOriginalData] = useState(() => ({
    status: route?.status || 'Inactive',
    ...buildInitialForm(route),
  }));
  const [hasChanges, setHasChanges] = useState(!isEditMode);

  useEffect(() => {
    if (!open) return;
    const next = buildInitialForm(route);
    setStatus(route?.status || 'Inactive');
    setFormData(next);
    setPricing(buildInitialPricing(route));
    setOriginalData({ status: route?.status || 'Inactive', ...next });
    setScheduledPricings([]);
    setEditingPricingId(null);
    setIsHistoricalExpanded(false);
  }, [open, route]);

  useEffect(() => {
    if (isEditMode) {
      const formChanged =
        status !== originalData.status ||
        formData.packingFacility !== originalData.packingFacility ||
        JSON.stringify(formData.destinationCountries) !== JSON.stringify(originalData.destinationCountries) ||
        formData.carrierServiceType !== originalData.carrierServiceType ||
        formData.carrierName !== originalData.carrierName ||
        formData.originalCarrierServiceType !== originalData.originalCarrierServiceType ||
        formData.slug !== originalData.slug ||
        formData.method !== originalData.method ||
        formData.shippingCost !== originalData.shippingCost ||
        formData.packingTimeFrame !== originalData.packingTimeFrame ||
        formData.shippingTimeFrame !== originalData.shippingTimeFrame ||
        formData.maxShippingValue !== originalData.maxShippingValue ||
        formData.currencyCode !== originalData.currencyCode ||
        JSON.stringify(formData.shippingWorkingDays) !== JSON.stringify(originalData.shippingWorkingDays);
      setHasChanges(formChanged);
    } else {
      setHasChanges(true);
    }
  }, [formData, status, isEditMode, originalData]);

  const title = isEditMode ? `Update ${route?.toCountryCodes ?? 'Route'}` : 'Create Shipping Route';

  const selectedCarrier = CARRIERS.find((c) => c.name === formData.carrierName);
  const originalCarrierOptions = useMemo(() => {
    if (selectedCarrier) return [selectedCarrier.originalServiceType];
    if (formData.originalCarrierServiceType) return [formData.originalCarrierServiceType];
    return [];
  }, [selectedCarrier, formData.originalCarrierServiceType]);

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const handleOpenFuturePricingDialog = () => {
    setEditingPricingId(null);
    setIsFuturePricingDialogOpen(true);
  };

  const handleFuturePricingSubmit = (data: FuturePricingData) => {
    if (editingPricingId) {
      setScheduledPricings((prev) =>
        prev.map((p) =>
          p.id === editingPricingId
            ? {
                id: p.id,
                shippingCost: data.cost,
                fuelTax: data.fuel_tax_percent,
                vat: data.vat_percent,
                discount: data.discount_percent,
                agentCommission: data.agent_commission,
                agentCommissionType: data.agent_commission_type as 'percentage' | 'flat',
                surcharge: data.surcharge_fee,
                surchargeType: data.surcharge_type as 'flat' | 'percentage',
                startDate: data.starting_day,
              }
            : p,
        ),
      );
    } else {
      setScheduledPricings((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          shippingCost: data.cost,
          fuelTax: data.fuel_tax_percent,
          vat: data.vat_percent,
          discount: data.discount_percent,
          agentCommission: data.agent_commission,
          agentCommissionType: data.agent_commission_type as 'percentage' | 'flat',
          surcharge: data.surcharge_fee,
          surchargeType: data.surcharge_type as 'flat' | 'percentage',
          startDate: data.starting_day,
        },
      ]);
    }
  };

  const handleEditPricing = (id: string) => {
    setEditingPricingId(id);
    setIsFuturePricingDialogOpen(true);
  };

  const handleDeletePricing = (id: string) => {
    setScheduledPricings((prev) => prev.filter((p) => p.id !== id));
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
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'gap-1 px-3 py-1.5 text-xs h-auto',
                      status === 'Inactive'
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        : 'bg-green-100 text-green-800 hover:bg-green-100',
                    )}
                  >
                    {status}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatus('Inactive')}>Inactive</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus('Active')}>Active</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-6">
            {/* Route Properties */}
            <div>
              <p className={cn(sectionTitleClass, 'mb-3')}>Route Properties</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <Field label="Packing Facility">
                  <Select
                    value={formData.packingFacility || undefined}
                    onValueChange={(v) => setFormData({ ...formData, packingFacility: v })}
                  >
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="Select packing facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {PACKING_FACILITIES.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Destination Countries">
                  <MultiSelectField
                    value={formData.destinationCountries}
                    onChange={(v) => setFormData({ ...formData, destinationCountries: v })}
                    options={DESTINATION_COUNTRIES}
                    placeholder="Select destination countries"
                  />
                </Field>

                <Field label="Carrier Service Type">
                  <Select
                    value={formData.carrierServiceType || undefined}
                    onValueChange={(v) => setFormData({ ...formData, carrierServiceType: v })}
                  >
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="Select carrier service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARRIER_SERVICE_TYPES.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Carrier Name">
                  <Select
                    value={formData.carrierName || undefined}
                    onValueChange={(value) => {
                      const carrier = CARRIERS.find((c) => c.name === value);
                      setFormData({
                        ...formData,
                        carrierName: value,
                        originalCarrierServiceType: carrier?.originalServiceType || '',
                      });
                    }}
                  >
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARRIERS.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Original Carrier Service Type">
                  <Select
                    value={formData.originalCarrierServiceType || undefined}
                    onValueChange={(v) => setFormData({ ...formData, originalCarrierServiceType: v })}
                    disabled={originalCarrierOptions.length === 0}
                  >
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="Select carrier first" />
                    </SelectTrigger>
                    <SelectContent>
                      {originalCarrierOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Slug">
                  <Input
                    className="border-gray-300 bg-white"
                    placeholder="e.g., dhl-express-usa"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </Field>

                <Field label="Shipping Method">
                  <Select
                    value={formData.method || undefined}
                    onValueChange={(v) => setFormData({ ...formData, method: v })}
                  >
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {METHODS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Packing Time Frame">
                  <Input
                    className="border-gray-300 bg-white"
                    placeholder="e.g., 1-2 business days"
                    value={formData.packingTimeFrame}
                    onChange={(e) => setFormData({ ...formData, packingTimeFrame: e.target.value })}
                  />
                </Field>

                <Field label="Shipping Time Frame">
                  <Input
                    className="border-gray-300 bg-white"
                    placeholder="e.g., 3-5 business days"
                    value={formData.shippingTimeFrame}
                    onChange={(e) => setFormData({ ...formData, shippingTimeFrame: e.target.value })}
                  />
                </Field>

                <Field label="Max Shipping Value">
                  <Input
                    className="border-gray-300 bg-white"
                    placeholder="e.g., 1000.00"
                    value={formData.maxShippingValue}
                    onChange={(e) => setFormData({ ...formData, maxShippingValue: e.target.value })}
                  />
                </Field>

                <Field label="Currency Code">
                  <Select
                    value={formData.currencyCode || undefined}
                    onValueChange={(v) => setFormData({ ...formData, currencyCode: v })}
                  >
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_CODES.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Shipping Working Days">
                  <MultiSelectField
                    value={formData.shippingWorkingDays}
                    onChange={(v) => setFormData({ ...formData, shippingWorkingDays: v })}
                    options={WORKING_DAYS}
                    placeholder="Select working days"
                  />
                </Field>
              </div>
            </div>

            {/* Pricing and Fees */}
            <div>
              <p className={cn(sectionTitleClass, 'mb-3')}>Pricing and Fees</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <Field label="Agreement Cost">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                    <Input
                      className="border-gray-300 bg-white pl-7"
                      value={pricing.shippingCost}
                      onChange={(e) => setPricing({ ...pricing, shippingCost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </Field>

                <Field label="Fuel Tax">
                  <div className="relative">
                    <Input
                      className="border-gray-300 bg-white pr-8"
                      value={pricing.fuelTax}
                      onChange={(e) => setPricing({ ...pricing, fuelTax: e.target.value })}
                      placeholder="0"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                  </div>
                </Field>

                <Field label="VAT">
                  <div className="relative">
                    <Input
                      className="border-gray-300 bg-white pr-8"
                      value={pricing.vat}
                      onChange={(e) => setPricing({ ...pricing, vat: e.target.value })}
                      placeholder="0"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                  </div>
                </Field>

                <Field label="Discount">
                  <div className="relative">
                    <Input
                      className="border-gray-300 bg-white pr-8"
                      value={pricing.discount}
                      onChange={(e) => setPricing({ ...pricing, discount: e.target.value })}
                      placeholder="0"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                  </div>
                </Field>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-gray-600">Agent Commission</Label>
                    <div className="flex overflow-hidden rounded border border-gray-300">
                      <button
                        type="button"
                        onClick={() => setPricing({ ...pricing, agentCommissionType: 'flat' })}
                        className={cn(
                          'px-3 py-1 text-xs font-medium transition-colors',
                          pricing.agentCommissionType === 'flat' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50',
                        )}
                      >
                        $
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricing({ ...pricing, agentCommissionType: 'percentage' })}
                        className={cn(
                          'border-l border-gray-300 px-3 py-1 text-xs font-medium transition-colors',
                          pricing.agentCommissionType === 'percentage' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50',
                        )}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    {pricing.agentCommissionType === 'flat' ? (
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                    ) : null}
                    <Input
                      className={cn('border-gray-300 bg-white', pricing.agentCommissionType === 'flat' ? 'pl-7' : 'pr-8')}
                      value={pricing.agentCommission}
                      onChange={(e) => setPricing({ ...pricing, agentCommission: e.target.value })}
                      placeholder="0"
                    />
                    {pricing.agentCommissionType === 'percentage' ? (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-gray-600">Surcharge</Label>
                    <div className="flex overflow-hidden rounded border border-gray-300">
                      <button
                        type="button"
                        onClick={() => setPricing({ ...pricing, surchargeType: 'flat' })}
                        className={cn(
                          'px-3 py-1 text-xs font-medium transition-colors',
                          pricing.surchargeType === 'flat' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50',
                        )}
                      >
                        $
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricing({ ...pricing, surchargeType: 'percentage' })}
                        className={cn(
                          'border-l border-gray-300 px-3 py-1 text-xs font-medium transition-colors',
                          pricing.surchargeType === 'percentage' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50',
                        )}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    {pricing.surchargeType === 'flat' ? (
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                    ) : null}
                    <Input
                      className={cn('border-gray-300 bg-white', pricing.surchargeType === 'flat' ? 'pl-7' : 'pr-8')}
                      value={pricing.surcharge}
                      onChange={(e) => setPricing({ ...pricing, surcharge: e.target.value })}
                      placeholder="0"
                    />
                    {pricing.surchargeType === 'percentage' ? (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                    ) : null}
                  </div>
                </div>

                {/* Future pricing */}
                {scheduledPricings.length > 0 ? (
                  <div className="overflow-hidden rounded border border-gray-200 bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="text-xs font-medium text-gray-700">Scheduled Date</TableHead>
                          <TableHead className="text-xs font-medium text-gray-700">Shipping Cost</TableHead>
                          <TableHead className="w-[80px] text-xs font-medium text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduledPricings.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="text-sm text-gray-800">{row.startDate}</TableCell>
                            <TableCell className="text-sm text-gray-800">{row.shippingCost}</TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleEditPricing(row.id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-blue-50 hover:text-[#1976d2]"
                                    aria-label="Edit pricing"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p>Edit</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}

                <Button
                  variant="outline"
                  onClick={handleOpenFuturePricingDialog}
                  className="h-9 justify-start border-gray-300 bg-white text-sm text-[#1976d2] hover:border-[#1976d2] hover:bg-blue-50 hover:text-[#1976d2]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule future pricing
                </Button>

                <div>
                  <button
                    type="button"
                    onClick={() => setIsHistoricalExpanded(!isHistoricalExpanded)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                  >
                    <ChevronRight className={cn('h-4 w-4 transition-transform', isHistoricalExpanded && 'rotate-90')} />
                    Historical Pricing
                  </button>

                  {isHistoricalExpanded && (
                    <div className="mt-3 overflow-hidden rounded border border-gray-200 bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="text-xs font-medium text-gray-700">Date Time Frame</TableHead>
                            <TableHead className="text-xs font-medium text-gray-700">Agreement Cost</TableHead>
                            <TableHead className="text-xs font-medium text-gray-700">Fuel Tax</TableHead>
                            <TableHead className="text-xs font-medium text-gray-700">VAT</TableHead>
                            <TableHead className="text-xs font-medium text-gray-700">Discount</TableHead>
                            <TableHead className="text-xs font-medium text-gray-700">Agent Commission</TableHead>
                            <TableHead className="text-xs font-medium text-gray-700">Surcharge</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {HISTORICAL_DATA.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-sm text-gray-800">{row.dateTimeFrame}</TableCell>
                              <TableCell className="text-sm text-gray-800">{row.agreementCost}</TableCell>
                              <TableCell className="text-sm text-gray-800">{row.fuelTax}</TableCell>
                              <TableCell className="text-sm text-gray-800">{row.vat}</TableCell>
                              <TableCell className="text-sm text-gray-800">{row.discount}</TableCell>
                              <TableCell className="text-sm text-gray-800">{row.agentCommission}</TableCell>
                              <TableCell className="text-sm text-gray-800">{row.surcharge}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            className="px-0 text-[15px] font-medium text-[#1976d2] hover:bg-transparent hover:text-[#1565c0]"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!hasChanges}
            className="min-w-[140px] bg-[#1976d2] text-[15px] font-medium text-white hover:bg-[#1565c0] disabled:opacity-50"
          >
            Save
          </Button>
        </div>
      </SheetContent>

      <ScheduleFuturePricingDialog
        open={isFuturePricingDialogOpen}
        onClose={() => {
          setIsFuturePricingDialogOpen(false);
          setEditingPricingId(null);
        }}
        onSubmit={handleFuturePricingSubmit}
        onDelete={editingPricingId ? () => handleDeletePricing(editingPricingId) : undefined}
        editingData={
          editingPricingId
            ? {
                starting_day: scheduledPricings.find((p) => p.id === editingPricingId)?.startDate || '',
                cost: scheduledPricings.find((p) => p.id === editingPricingId)?.shippingCost || '',
                fuel_tax_percent: scheduledPricings.find((p) => p.id === editingPricingId)?.fuelTax || '',
                vat_percent: scheduledPricings.find((p) => p.id === editingPricingId)?.vat || '',
                discount_percent: scheduledPricings.find((p) => p.id === editingPricingId)?.discount || '',
                agent_commission: scheduledPricings.find((p) => p.id === editingPricingId)?.agentCommission || '',
                agent_commission_type:
                  scheduledPricings.find((p) => p.id === editingPricingId)?.agentCommissionType || 'percentage',
                surcharge_fee: scheduledPricings.find((p) => p.id === editingPricingId)?.surcharge || '',
                surcharge_type: scheduledPricings.find((p) => p.id === editingPricingId)?.surchargeType || 'flat',
              }
            : null
        }
        currentPricing={{
          agreementCost: pricing.shippingCost,
          fuelTax: pricing.fuelTax,
          vat: pricing.vat,
          discount: pricing.discount,
          agentCommission: pricing.agentCommission,
          agentCommissionType: pricing.agentCommissionType,
          surcharge: pricing.surcharge,
          surchargeType: pricing.surchargeType,
        }}
      />
    </Sheet>
  );
}
