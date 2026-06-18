import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Ban, Calendar, ChevronDown, Plus, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from './ui/utils';
import type {
  ActivationCondition,
  ActivationFieldId,
  ActivationOperator,
  CostControl,
  DeliveryCondition,
  PerShipmentFormula,
  RuleAction,
  RuleStatus,
  UpgradeDowngradeRule,
} from './upgradeDowngradeTypes';
import { deriveRuleStatus, REFERENCE_NOW, STATUS_LABEL, statusBadgeClass } from './upgradeDowngradeTypes';
import {
  fetchUpgradeRuleLookups,
  optionsForActivationField,
  type UpgradeRuleLookups,
} from './upgradeDowngradeRuleLookups';

const DATE_INPUT_CALENDAR_HIDING =
  'relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:box-border [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0';

function openDatePicker(input: HTMLInputElement | null) {
  if (!input) return;
  if (typeof input.showPicker === 'function') {
    void input.showPicker().catch(() => {});
  } else {
    input.focus();
  }
}

function RuleDateField({
  id,
  label,
  value,
  onChange,
  invalid,
  disabled,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      {label ? (
        <Label htmlFor={id} className="text-xs text-gray-600">
          {label}
        </Label>
      ) : null}
      <div
        className={cn(
          'relative flex w-full rounded-md border bg-white transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          invalid ? 'border-red-500' : 'border-gray-300',
        )}
        onClick={() => !disabled && openDatePicker(inputRef.current)}
      >
        <Input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full min-w-0 flex-1 cursor-pointer border-0 bg-transparent pr-10 shadow-none focus-visible:ring-0 md:text-sm',
            'hover:border-transparent focus-visible:border-transparent',
            DATE_INPUT_CALENDAR_HIDING,
          )}
        />
        <Calendar
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
      </div>
    </div>
  );
}

type FieldControl = 'multiselect' | 'text' | 'text_numbers' | 'number_usd';

interface ActivationFieldDef {
  id: ActivationFieldId;
  label: string;
  operators: ActivationOperator[];
  control: FieldControl;
  placeholder?: string;
}

const ACTIVATION_FIELDS: ActivationFieldDef[] = [
  { id: 'brand', label: 'Brand', operators: ['in'], control: 'multiselect' },
  { id: 'destination_country', label: 'Destination Country', operators: ['in'], control: 'multiselect' },
  {
    id: 'event_level',
    label: 'Event Level',
    operators: ['in'],
    control: 'text_numbers',
    placeholder: 'e.g. 1, 2, 3',
  },
  { id: 'packing_facility', label: 'Packing Facility', operators: ['in'], control: 'multiselect' },
  {
    id: 'skus',
    label: 'SKUs',
    operators: ['in', 'not_in'],
    control: 'text',
    placeholder: 'e.g. SKU-001, SKU-002',
  },
  { id: 'total_order_value', label: 'Total Order Value', operators: ['gt', 'lt', 'eq'], control: 'number_usd' },
  {
    id: 'eligible_carrier_service_types',
    label: 'Eligible Shipping Carrier Service Types',
    operators: ['in'],
    control: 'multiselect',
  },
];

const FIELD_BY_ID = Object.fromEntries(ACTIVATION_FIELDS.map((f) => [f.id, f])) as Record<
  ActivationFieldId,
  ActivationFieldDef
>;

function operatorLabel(op: ActivationOperator): string {
  switch (op) {
    case 'in':
      return 'In';
    case 'not_in':
      return 'Not In';
    case 'gt':
      return 'Greater than';
    case 'lt':
      return 'Less than';
    case 'eq':
      return 'Equals';
    default:
      return op;
  }
}

function newConditionRow(field: ActivationFieldId = 'brand'): ActivationCondition {
  const def = FIELD_BY_ID[field];
  return { field, operator: def.operators[0], values: [] };
}

function mergedOptions(
  lookups: UpgradeRuleLookups | null,
  field: ActivationFieldId,
  current: string[],
): string[] {
  const base = optionsForActivationField(lookups, field);
  const seen = new Set(base);
  const out = [...base];
  for (const v of current) {
    const t = v.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

function ActivationValueMultiSelect({
  field,
  values,
  lookups,
  loading,
  disabled,
  onChange,
}: {
  field: ActivationFieldId;
  values: string[];
  lookups: UpgradeRuleLookups | null;
  loading: boolean;
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  const options = useMemo(() => mergedOptions(lookups, field, values), [lookups, field, values]);
  const [open, setOpen] = useState(false);

  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
    else onChange([...values, opt]);
  };
  const remove = (opt: string) => onChange(values.filter((v) => v !== opt));

  if (loading || !lookups) {
    return (
      <button
        type="button"
        disabled
        className="flex h-8 min-h-8 w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-2 text-left text-sm text-gray-500"
      >
        {loading ? 'Loading values…' : 'Options unavailable'}
        <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
      </button>
    );
  }

  const overflowMoreCount = values.length > 2 ? values.length - 1 : 0;
  const visibleChipValues = overflowMoreCount > 0 ? values.slice(0, 1) : values;

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-8 min-h-8 max-h-8 w-full items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none',
            'hover:bg-gray-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
            {values.length === 0 ? (
              <span className="truncate text-gray-500">Select value</span>
            ) : (
              <>
                {visibleChipValues.map((v) => (
                  <span
                    key={v}
                    className="inline-flex max-w-[min(100%,8rem)] shrink-0 items-center gap-0.5 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                  >
                    <span className="min-w-0 truncate">{v}</span>
                    {!disabled ? (
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
                    ) : null}
                  </span>
                ))}
                {overflowMoreCount > 0 ? (
                  <span
                    className="shrink-0 truncate text-xs font-medium tabular-nums text-gray-600"
                    title={values.slice(1).join(', ')}
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
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-w-[min(100vw-2rem,20rem)] p-2"
        align="start"
      >
        <div className="max-h-60 space-y-0.5 overflow-y-auto pr-1" role="listbox" aria-multiselectable="true">
          {options.map((opt, optIndex) => {
            const checked = values.includes(opt);
            const optId = `udr-value-${field}-${optIndex}`;
            return (
              <Label
                key={`${field}-${opt}`}
                htmlFor={optId}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100',
                  checked && 'bg-gray-50',
                )}
              >
                <Checkbox id={optId} checked={checked} onCheckedChange={() => toggle(opt)} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{opt}</span>
              </Label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function parseCsv(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

interface RuleFormState {
  action: RuleAction;
  name: string;
  deliveryMode: 'eta' | 'specific_day';
  etaDays: string;
  specificDay: string;
  conditions: ActivationCondition[];
  costMode: 'per_shipment' | 'per_rule';
  maxPerShipment: string;
  perShipmentFormula: PerShipmentFormula;
  budgetCap: string;
  startDate: string;
  endDate: string;
}

function todayIso(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function emptyFormState(): RuleFormState {
  return {
    action: 'upgrade',
    name: '',
    deliveryMode: 'eta',
    etaDays: '',
    specificDay: '',
    conditions: [newConditionRow('brand')],
    costMode: 'per_shipment',
    maxPerShipment: '3',
    perShipmentFormula: 'vs_original',
    budgetCap: '',
    startDate: todayIso(),
    endDate: '',
  };
}

function formFromRule(rule: UpgradeDowngradeRule): RuleFormState {
  const cc = rule.costControl;
  return {
    action: rule.action,
    name: rule.name,
    deliveryMode: rule.deliveryCondition.mode,
    etaDays: rule.deliveryCondition.mode === 'eta' ? String(rule.deliveryCondition.etaDays) : '',
    specificDay: rule.deliveryCondition.mode === 'specific_day' ? rule.deliveryCondition.date : '',
    conditions: rule.conditions.length
      ? rule.conditions.map((c) => ({ ...c, values: [...c.values] }))
      : [newConditionRow('brand')],
    costMode: cc?.mode === 'per_rule' ? 'per_rule' : 'per_shipment',
    maxPerShipment: cc?.mode === 'per_shipment' ? String(cc.maxPerShipment) : '3',
    perShipmentFormula: cc?.mode === 'per_shipment' ? cc.formula ?? 'vs_original' : 'vs_original',
    budgetCap: cc?.mode === 'per_rule' ? String(cc.budgetCap) : '',
    startDate: rule.startDate || '',
    endDate: rule.endDate || '',
  };
}

/** Build a clone seed (everything except name + identity / accumulated metrics). */
function formFromClone(rule: UpgradeDowngradeRule): RuleFormState {
  return { ...formFromRule(rule), name: '' };
}

export interface CreateUpgradeDowngradeRuleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule: UpgradeDowngradeRule | null;
  allRules: UpgradeDowngradeRule[];
  onSave: (rule: UpgradeDowngradeRule) => void;
  onCancelRule: (id: string) => void;
}

export default function CreateUpgradeDowngradeRuleDrawer({
  open,
  onOpenChange,
  editingRule,
  allRules,
  onSave,
  onCancelRule,
}: CreateUpgradeDowngradeRuleDrawerProps) {
  const isEdit = !!editingRule;
  const editingStatus: RuleStatus | null = editingRule ? deriveRuleStatus(editingRule) : null;
  const readOnly = editingStatus === 'done' || editingStatus === 'cancelled';
  // Don't surface validation noise on rules that are no longer actionable.
  const suppressErrors = readOnly || editingStatus === 'expired';
  const canCancelRule = editingStatus === 'active' || editingStatus === 'scheduled';

  const [form, setForm] = useState<RuleFormState>(() => emptyFormState());
  const [cloneFromId, setCloneFromId] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showNameError, setShowNameError] = useState(false);
  const [showEndDateError, setShowEndDateError] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [lookups, setLookups] = useState<UpgradeRuleLookups | null>(null);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [lookupsError, setLookupsError] = useState<string | null>(null);

  const patch = (p: Partial<RuleFormState>) => setForm((prev) => ({ ...prev, ...p }));

  useEffect(() => {
    if (!open) {
      setLookups(null);
      setLookupsError(null);
      setLookupsLoading(false);
      return;
    }
    let cancelled = false;
    setLookupsLoading(true);
    setLookupsError(null);
    fetchUpgradeRuleLookups()
      .then((data) => {
        if (!cancelled) setLookups(data);
      })
      .catch(() => {
        if (!cancelled) setLookupsError('Could not load rule value lists. Try closing and reopening.');
      })
      .finally(() => {
        if (!cancelled) setLookupsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setForm(editingRule ? formFromRule(editingRule) : emptyFormState());
    setCloneFromId('');
    setSubmitError(null);
    setShowNameError(false);
    setShowEndDateError(false);
    setCancelDialogOpen(false);
  }, [open, editingRule]);

  const handleClone = (id: string) => {
    setCloneFromId(id);
    const src = allRules.find((r) => r.id === id);
    // Clone every field from the source rule, but never override the name the user typed.
    if (src) setForm((prev) => ({ ...formFromClone(src), name: prev.name }));
  };

  const handleClearClone = () => {
    setCloneFromId('');
    // Revert prefilled fields to defaults, keeping the name the user typed.
    setForm((prev) => ({ ...emptyFormState(), name: prev.name }));
  };

  // ----- validation -----
  const trimmedName = form.name.trim();
  const nameDuplicate = useMemo(() => {
    if (!trimmedName) return false;
    const lower = trimmedName.toLowerCase();
    return allRules.some((r) => r.id !== editingRule?.id && r.name.trim().toLowerCase() === lower);
  }, [trimmedName, allRules, editingRule]);

  const today = useMemo(() => {
    const t = new Date(REFERENCE_NOW);
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const etaValue = Number(form.etaDays);
  const etaValid = form.deliveryMode === 'eta' && Number.isInteger(etaValue) && etaValue >= 1 && etaValue <= 30;
  const specificDayValid = useMemo(() => {
    if (form.deliveryMode !== 'specific_day') return false;
    if (!form.specificDay.trim()) return false;
    const d = new Date(`${form.specificDay}T12:00:00`);
    d.setHours(0, 0, 0, 0);
    return d > today;
  }, [form.deliveryMode, form.specificDay, today]);
  const deliveryValid = form.deliveryMode === 'eta' ? etaValid : specificDayValid;

  const costValid = useMemo(() => {
    if (form.action === 'downgrade') return true;
    if (form.costMode === 'per_shipment') return Number(form.maxPerShipment) > 0;
    return Number(form.budgetCap) > 0;
  }, [form.action, form.costMode, form.maxPerShipment, form.budgetCap]);

  const endDateInvalid = useMemo(() => {
    if (!form.startDate.trim()) return false;
    if (!form.endDate.trim()) return true; // required when start present
    const s = new Date(`${form.startDate}T12:00:00`);
    const e = new Date(`${form.endDate}T12:00:00`);
    return !(e > s);
  }, [form.startDate, form.endDate]);

  // Activation conditions are optional (joined by AND); empty rows are ignored on save.

  const canSubmit =
    !readOnly &&
    trimmedName.length > 0 &&
    trimmedName.length <= 50 &&
    !nameDuplicate &&
    deliveryValid &&
    costValid &&
    !lookupsLoading &&
    lookups !== null &&
    !lookupsError;

  // In edit mode, keep Update disabled until the user actually changes something.
  const isDirty = useMemo(() => {
    if (!isEdit || !editingRule) return true;
    return JSON.stringify(form) !== JSON.stringify(formFromRule(editingRule));
  }, [isEdit, editingRule, form]);

  // ----- preview status (auto-derived display in the drawer) -----
  const previewStatus: RuleStatus = useMemo(() => {
    const probe: UpgradeDowngradeRule = {
      id: editingRule?.id ?? 'preview',
      name: trimmedName || 'preview',
      action: form.action,
      timesApplied: editingRule?.timesApplied ?? 0,
      spent: editingRule?.spent,
      savings: editingRule?.savings,
      manuallyCancelled: editingRule?.manuallyCancelled,
      costControl: buildCostControl(form),
      deliveryCondition: buildDeliveryCondition(form),
      conditions: [],
      startDate: form.startDate,
      endDate: form.endDate,
    };
    return deriveRuleStatus(probe);
  }, [form, editingRule, trimmedName]);

  // ----- condition row helpers -----
  const updateCondition = (index: number, p: Partial<ActivationCondition>) => {
    setForm((prev) => {
      const next = [...prev.conditions];
      const cur = { ...next[index], ...p };
      if (p.field !== undefined) {
        const def = FIELD_BY_ID[p.field];
        cur.operator = def.operators.includes(cur.operator) ? cur.operator : def.operators[0];
        if (p.values === undefined) cur.values = [];
      }
      next[index] = cur;
      return { ...prev, conditions: next };
    });
  };
  const addCondition = () =>
    setForm((prev) => ({ ...prev, conditions: [...prev.conditions, newConditionRow('brand')] }));
  const removeCondition = (index: number) =>
    setForm((prev) => ({ ...prev, conditions: prev.conditions.filter((_, i) => i !== index) }));

  const handleSubmit = () => {
    setSubmitError(null);
    if (!trimmedName) {
      setShowNameError(true);
      setSubmitError('Rule name is required.');
      return;
    }
    if (nameDuplicate) {
      setShowNameError(true);
      setSubmitError('A rule with this name already exists.');
      return;
    }
    if (!deliveryValid) {
      setSubmitError('Set a valid delivery day condition.');
      return;
    }
    if (!costValid) {
      setSubmitError('Cost control requires a positive value.');
      return;
    }
    if (endDateInvalid) {
      setShowEndDateError(true);
      setSubmitError(
        form.endDate.trim()
          ? 'Expiration date must be after the start date.'
          : 'Expiration date is required when a start date is set.',
      );
      return;
    }
    onSave(buildRuleForSave(form, editingRule));
    onOpenChange(false);
  };

  const handleCancelRule = () => {
    if (editingRule) onCancelRule(editingRule.id);
    onOpenChange(false);
  };

  const sectionTitleClass = 'text-sm font-semibold text-[#101828]';
  const fieldLabelClass = 'text-sm font-normal text-gray-600';
  const cardClass = 'rounded-md bg-[#FAFAFA] p-4';
  const tabsListClass = 'inline-flex h-auto items-center gap-1 rounded-lg bg-gray-100 p-1';
  const tabTriggerClass =
    'rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-[#1976d2] data-[state=active]:shadow-sm';
  const fieldsDisabled = readOnly;

  const cloneOptions = useMemo(() => allRules.filter((r) => r.id !== editingRule?.id), [allRules, editingRule]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        hideClose
        side="right"
        className="flex h-full min-h-0 w-full flex-col gap-0 overflow-hidden border-l border-gray-200 bg-white p-0 sm:max-w-[600px]"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-200 px-6 py-4 text-left">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle className="text-base font-semibold leading-normal text-[#101828]">
              {isEdit ? 'Edit Rule' : 'Create New Rule'}
            </SheetTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-full text-gray-600 hover:bg-gray-100"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="size-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-6">
            {/* Action */}
            <div>
              <p className={cn(sectionTitleClass, 'mb-2')}>Action</p>
              <RadioGroup
                value={form.action}
                onValueChange={(v) => patch({ action: v as RuleAction })}
                className="grid grid-cols-2 gap-3"
                aria-label="Rule action"
                disabled={fieldsDisabled}
              >
                {(
                  [
                    {
                      v: 'upgrade',
                      title: 'Upgrade',
                      sub: 'Find a faster route closer to the ETA',
                      Icon: ArrowUp,
                    },
                    {
                      v: 'downgrade',
                      title: 'Downgrade',
                      sub: 'Find a slower, cost saving route',
                      Icon: ArrowDown,
                    },
                  ] as const
                ).map(({ v, title, sub, Icon }) => {
                  const selected = form.action === v;
                  const boxClass = selected ? 'bg-blue-100 text-[#1976d2]' : 'bg-gray-100 text-gray-600';
                  return (
                    <Label
                      key={v}
                      htmlFor={`udr-action-${v}`}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                        selected ? 'border-[#1976d2] bg-blue-50/60' : 'border-gray-300 bg-white hover:bg-gray-50',
                        fieldsDisabled && 'cursor-not-allowed opacity-70',
                      )}
                    >
                      <RadioGroupItem id={`udr-action-${v}`} value={v} className="sr-only" />
                      <span
                        className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', boxClass)}
                      >
                        <Icon className="size-6" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold text-[#101828]">{title}</span>
                        <span className="block text-xs leading-normal text-gray-600">{sub}</span>
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* General */}
            <div>
              <p className={cn(sectionTitleClass, 'mb-2')}>General</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="udr-name" className={fieldLabelClass}>
                      <span>
                        Rule Name<span className="text-gray-900">*</span>
                      </span>
                    </Label>
                    <span className="text-xs tabular-nums text-gray-400">{form.name.length} / 50</span>
                  </div>
                  <Input
                    id="udr-name"
                    className={cn('border-gray-300 bg-white', (showNameError && (!trimmedName || nameDuplicate)) && 'border-red-500')}
                    placeholder="e.g Standard upgrade - US Rings"
                    maxLength={50}
                    value={form.name}
                    disabled={fieldsDisabled}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                  {nameDuplicate ? (
                    <p className="text-xs text-red-600">A rule with this name already exists.</p>
                  ) : null}
                </div>
                {!isEdit ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="udr-clone" className={fieldLabelClass}>
                      Clone from existing rule (optional)
                    </Label>
                    <div className="relative">
                      <Select value={cloneFromId || undefined} onValueChange={handleClone} disabled={fieldsDisabled}>
                        <SelectTrigger id="udr-clone" className={cn('h-9 w-full border-gray-300 bg-white', cloneFromId && '[&>span]:pr-7')}>
                          <SelectValue placeholder="-- Select a rule to prefill from --" />
                        </SelectTrigger>
                        <SelectContent>
                          {cloneOptions.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {cloneFromId && !fieldsDisabled ? (
                        <button
                          type="button"
                          onClick={handleClearClone}
                          className="absolute right-8 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                          aria-label="Clear cloned rule"
                        >
                          <X className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Rule Builder */}
            <div>
              <p className={cn(sectionTitleClass, 'mb-2')}>Rule Builder</p>
              <div className={cn(cardClass, 'flex flex-col gap-5')}>
                {/* Delivery days conditions */}
                <div className="flex flex-col gap-3">
                  <Label className={fieldLabelClass}>
                    <span>
                      Delivery days conditions<span className="text-gray-900">*</span>
                    </span>
                  </Label>
                  <Tabs
                    value={form.deliveryMode}
                    onValueChange={(v) => patch({ deliveryMode: v as 'eta' | 'specific_day' })}
                  >
                    <TabsList className={tabsListClass}>
                      <TabsTrigger value="eta" disabled={fieldsDisabled} className={tabTriggerClass}>
                        ETA Threshold (Days)
                      </TabsTrigger>
                      <TabsTrigger value="specific_day" disabled={fieldsDisabled} className={tabTriggerClass}>
                        Specific delivery date
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="eta" className="mt-3 flex flex-col gap-1.5">
                      <Label htmlFor="udr-eta" className="text-xs text-gray-600">
                        Select days
                      </Label>
                      <Input
                        id="udr-eta"
                        type="number"
                        min={1}
                        max={30}
                        className="border-gray-300 bg-white"
                        placeholder="1 - 30 days"
                        value={form.etaDays}
                        disabled={fieldsDisabled}
                        onChange={(e) => patch({ etaDays: e.target.value })}
                      />
                      {!suppressErrors && form.etaDays.trim() && !etaValid ? (
                        <p className="text-xs text-red-600">Enter a whole number between 1 and 30.</p>
                      ) : null}
                    </TabsContent>
                    <TabsContent value="specific_day" className="mt-3 flex flex-col gap-1.5">
                      <Label htmlFor="udr-specific-day" className="text-xs text-gray-600">
                        Target delivery date
                      </Label>
                      <RuleDateField
                        id="udr-specific-day"
                        value={form.specificDay}
                        onChange={(v) => patch({ specificDay: v })}
                        invalid={!suppressErrors && !!form.specificDay.trim() && !specificDayValid}
                        disabled={fieldsDisabled}
                      />
                      {!suppressErrors && !!form.specificDay.trim() && !specificDayValid ? (
                        <p className="text-xs text-red-600">Pick a future date.</p>
                      ) : null}
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="border-t border-gray-200" />

                {/* Activation Logic */}
                <div className="flex flex-col gap-3">
                  <Label className={fieldLabelClass}>Activation Logic</Label>
                  {lookupsError ? <p className="text-sm text-red-600">{lookupsError}</p> : null}
                  <div className="flex flex-col gap-3">
                    {form.conditions.map((row, index) => {
                      const def = FIELD_BY_ID[row.field];
                      return (
                        <div key={index} className="flex flex-col gap-2">
                          {index > 0 ? (
                            <div className="flex justify-center py-0.5">
                              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-gray-700">
                                AND
                              </span>
                            </div>
                          ) : null}
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)_2.25rem] sm:items-center">
                            <Select
                              value={row.field}
                              onValueChange={(v) => updateCondition(index, { field: v as ActivationFieldId })}
                              disabled={fieldsDisabled}
                            >
                              <SelectTrigger className="border-gray-300" size="sm">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {ACTIVATION_FIELDS.filter(
                                  (f) => f.id !== 'eligible_carrier_service_types' || form.action === 'downgrade'
                                ).map((f) => (
                                  <SelectItem key={f.id} value={f.id}>
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={row.operator}
                              onValueChange={(v) => updateCondition(index, { operator: v as ActivationOperator })}
                              disabled={fieldsDisabled || def.operators.length === 1}
                            >
                              <SelectTrigger className="border-gray-300" size="sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {def.operators.map((op) => (
                                  <SelectItem key={op} value={op}>
                                    {operatorLabel(op)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {def.control === 'multiselect' ? (
                              <ActivationValueMultiSelect
                                field={row.field}
                                values={row.values}
                                lookups={lookups}
                                loading={lookupsLoading}
                                disabled={fieldsDisabled}
                                onChange={(next) => updateCondition(index, { values: next })}
                              />
                            ) : def.control === 'number_usd' ? (
                              <div className="relative">
                                <Input
                                  type="number"
                                  className="border-gray-300 bg-white pr-12"
                                  placeholder="0"
                                  value={row.values[0] ?? ''}
                                  disabled={fieldsDisabled}
                                  onChange={(e) => updateCondition(index, { values: e.target.value ? [e.target.value] : [] })}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                  USD
                                </span>
                              </div>
                            ) : (
                              <Input
                                className="border-gray-300 bg-white"
                                placeholder={def.placeholder}
                                value={row.values.join(', ')}
                                disabled={fieldsDisabled}
                                onChange={(e) => updateCondition(index, { values: parseCsv(e.target.value) })}
                              />
                            )}
                            <div className="flex justify-end">
                              {form.conditions.length > 1 && !fieldsDisabled ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-9 text-gray-500"
                                  onClick={() => removeCondition(index)}
                                  aria-label="Remove condition"
                                >
                                  <X className="size-4" />
                                </Button>
                              ) : (
                                <span className="w-9" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {!fieldsDisabled ? (
                      <button
                        type="button"
                        onClick={addCondition}
                        className="inline-flex items-center gap-1 self-start text-sm font-medium text-[#1976d2] hover:text-[#1565c0]"
                      >
                        <Plus className="size-4" />
                        Add Condition
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Control — upgrade only */}
            {form.action === 'upgrade' ? (
              <div>
                <p className={cn(sectionTitleClass, 'mb-2')}>Budget</p>
                <div className={cardClass}>
                  <Tabs
                    value={form.costMode}
                    onValueChange={(v) => patch({ costMode: v as 'per_shipment' | 'per_rule' })}
                  >
                    <TabsList className={tabsListClass}>
                      <TabsTrigger value="per_shipment" disabled={fieldsDisabled} className={tabTriggerClass}>
                        Per Shipment
                      </TabsTrigger>
                      <TabsTrigger value="per_rule" disabled={fieldsDisabled} className={tabTriggerClass}>
                        Per Rule
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="per_shipment" className="mt-3 flex flex-col gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="udr-max-per-shipment" className="text-xs text-gray-600">
                          Max upgrade cost
                        </Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            USD
                          </span>
                          <Input
                            id="udr-max-per-shipment"
                            type="number"
                            min={0}
                            step="0.01"
                            className="border-gray-300 bg-white pl-12"
                            value={form.maxPerShipment}
                            disabled={fieldsDisabled}
                            onChange={(e) => patch({ maxPerShipment: e.target.value })}
                          />
                        </div>
                      </div>
                      <p className="text-xs leading-normal text-gray-500">
                        Per-shipment cap: upgraded cost - original cost ≤ max. Evaluated independently for each
                        shipment.
                      </p>
                    </TabsContent>
                    <TabsContent value="per_rule" className="mt-3 flex flex-col gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="udr-budget-cap" className="text-xs text-gray-600">
                          Total budget cap
                        </Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            USD
                          </span>
                          <Input
                            id="udr-budget-cap"
                            type="number"
                            min={0}
                            className="border-gray-300 bg-white pl-12"
                            placeholder="0"
                            value={form.budgetCap}
                            disabled={fieldsDisabled}
                            onChange={(e) => patch({ budgetCap: e.target.value })}
                          />
                        </div>
                      </div>
                      <p className="text-xs leading-normal text-gray-500">
                        Rule is suspended (moves to “Done”) when the total upgrade cost reaches this cap.
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            ) : null}

            {/* Status & Effective Dates */}
            <div>
              <p className={cn(sectionTitleClass, 'mb-2')}>Status &amp; Effective Dates</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <RuleDateField
                      id="udr-start"
                      label="Start Date*"
                      value={form.startDate}
                      onChange={(v) => patch({ startDate: v })}
                      disabled={fieldsDisabled}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <RuleDateField
                      id="udr-end"
                      label="End Date*"
                      value={form.endDate}
                      onChange={(v) => patch({ endDate: v })}
                      invalid={!suppressErrors && endDateInvalid && showEndDateError}
                      disabled={fieldsDisabled}
                    />
                    {!suppressErrors && endDateInvalid && showEndDateError ? (
                      <p className="text-xs text-red-600">
                        {form.endDate.trim()
                          ? 'Expiration date must be after the start date.'
                          : 'Expiration date is required when a start date is set.'}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-[#101828]">Status</p>
                    <span
                      className={cn(
                        'inline-flex shrink-0 rounded-[8px] px-2.5 py-0.5 text-xs font-medium',
                        statusBadgeClass(previewStatus),
                      )}
                    >
                      {STATUS_LABEL[previewStatus]}
                    </span>
                  </div>
                </div>
                <p className="-mt-2 text-xs leading-normal text-gray-500">
                  New rules default to Active. If start date is in the future, the rule will be Scheduled.
                </p>
              </div>
            </div>

            {canCancelRule && !readOnly ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelDialogOpen(true)}
                className="w-full gap-2 border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Ban className="size-4" />
                Cancel Rule
              </Button>
            ) : null}

            {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-4">
          {readOnly ? (
            <div className="flex w-full justify-end">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="min-w-[120px] bg-[#1976d2] text-[15px] font-medium text-white hover:bg-[#1565c0]"
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-[15px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || !isDirty}
                className="min-w-[140px] bg-[#1976d2] text-[15px] font-medium text-white hover:bg-[#1565c0] disabled:bg-[#1976d2] disabled:text-white disabled:opacity-50"
              >
                {isEdit ? 'Update Rule' : 'Create Rule'}
              </Button>
            </>
          )}
        </div>
      </SheetContent>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this rule?</AlertDialogTitle>
            <AlertDialogDescription>
              Cancelling moves the rule to “Cancelled”. It stays in the list for audit but will no longer be applied
              during route assignment. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep rule</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRule}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              Cancel rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

// ----- pure builders (module scope so previewStatus can reuse them) -----

function buildCostControl(form: RuleFormState): CostControl | undefined {
  if (form.action !== 'upgrade') return undefined;
  if (form.costMode === 'per_rule') {
    return { mode: 'per_rule', budgetCap: Number(form.budgetCap) || 0 };
  }
  return {
    mode: 'per_shipment',
    maxPerShipment: Number(form.maxPerShipment) || 0,
    formula: form.perShipmentFormula,
  };
}

function buildDeliveryCondition(form: RuleFormState): DeliveryCondition {
  if (form.deliveryMode === 'specific_day') {
    return { mode: 'specific_day', date: form.specificDay.trim() };
  }
  return { mode: 'eta', etaDays: Number(form.etaDays) || 0 };
}

function buildRuleForSave(
  form: RuleFormState,
  editingRule: UpgradeDowngradeRule | null,
): UpgradeDowngradeRule {
  const id =
    editingRule?.id ??
    (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rule_${Date.now()}`);
  const isUpgrade = form.action === 'upgrade';
  return {
    id,
    name: form.name.trim(),
    action: form.action,
    costControl: buildCostControl(form),
    spent: isUpgrade ? editingRule?.spent ?? 0 : undefined,
    savings: !isUpgrade ? editingRule?.savings ?? 0 : undefined,
    timesApplied: editingRule?.timesApplied ?? 0,
    deliveryCondition: buildDeliveryCondition(form),
    conditions: form.conditions
      .filter((c) => c.values.length > 0)
      .map((c) => ({ ...c, values: [...c.values] })),
    startDate: form.startDate.trim(),
    endDate: form.endDate.trim(),
    manuallyCancelled: editingRule?.manuallyCancelled,
  };
}
