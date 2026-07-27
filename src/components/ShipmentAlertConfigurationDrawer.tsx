import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
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
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';
import type {
  ShipmentAlertDurationUnit,
  ShipmentAlertReleaseLogic,
  ShipmentAlertRow,
  ShipmentAlertStatus,
} from './shipmentAlertsTypes';
import { optionsForAlertRuleField, type AlertActivationFieldId } from './alertRuleLookups';

export interface CreatedAlertConfiguration {
  alertName: string;
  activationLogic: string;
  releaseLogic: ShipmentAlertReleaseLogic;
  status: ShipmentAlertStatus;
  startDay?: string;
  endDay?: string;
}

/** Stored without space so Radix Select values stay stable. */
type RuleJoiner = 'AND' | 'OR' | 'BUT_NOT';

function joinerDisplay(j: RuleJoiner): string {
  return j === 'BUT_NOT' ? 'BUT NOT' : j;
}

type ActivationFieldId = AlertActivationFieldId;

const ACTIVATION_FIELDS: {
  id: ActivationFieldId;
  label: string;
  operators: string[];
}[] = [
  { id: 'order_brand', label: 'Brand', operators: ['in', 'not_in'] },
  { id: 'order_item_sku', label: 'SKU', operators: ['in', 'not_in'] },
  { id: 'product_category', label: 'Product Category', operators: ['in', 'not_in'] },
  { id: 'destination_country', label: 'Destination', operators: ['in', 'not_in'] },
  { id: 'packing_facility', label: 'Packing Facility', operators: ['in', 'not_in'] },
  { id: 'event_level', label: 'Event Level', operators: ['in', 'not_in'] },
  { id: 'shipment_service_level', label: 'Shipment Service Level', operators: ['in', 'not_in'] },
  { id: 'shipment_total_item_value', label: 'Shipment Total Item Value', operators: ['>', '<', '>=', '<='] },
];

const FIELD_BY_ID = Object.fromEntries(ACTIVATION_FIELDS.map((f) => [f.id, f])) as Record<
  ActivationFieldId,
  (typeof ACTIVATION_FIELDS)[number]
>;

const RELEASE_STATUSES = ['Draft', 'Ready to Pack', 'Packed', 'Shipped', 'Delivered', 'Label issued'] as const;

/** Matches the persisted `releaseLogic.kind` values that represent a real release condition. */
type ReleaseTrigger = 'status' | 'stuck';

const DURATION_UNITS: { value: ShipmentAlertDurationUnit; label: string }[] = [
  { value: 'hours', label: 'hours' },
  { value: 'days', label: 'days' },
];

type ConditionRow = {
  joiner?: RuleJoiner;
  field: ActivationFieldId;
  operator: string;
  values: string[];
};

function operatorDisplay(op: string): string {
  switch (op) {
    case 'not_in':
      return 'NOT IN';
    case 'in':
      return 'IN';
    case '>':
      return 'GREATER THAN';
    case '<':
      return 'LESS THAN';
    case '>=':
      return 'GREATER OR EQUAL';
    case '<=':
      return 'LESS OR EQUAL';
    default:
      return op.toUpperCase();
  }
}

/** Labels shown in the operator dropdown (values stay as `>`, `<`, etc.). */
function operatorFormLabel(op: string): string {
  switch (op) {
    case '>':
      return 'Greater Than';
    case '<':
      return 'Less Than';
    case '>=':
      return 'Greater than or Equal to';
    case '<=':
      return 'Less Than or Equal to';
    case 'not_in':
      return 'Not In';
    case 'in':
      return 'In';
    default:
      return op;
  }
}

function formatTotalItemValueFromDigits(d: string): string {
  if (!d) return '';
  const left = d.slice(0, 3).padStart(3, '0');
  const right = (d.slice(3) + '00').slice(0, 2);
  return `${left}.${right}`;
}

function TotalItemValueInput({
  value,
  onValuesChange,
}: {
  value: string;
  onValuesChange: (next: string[]) => void;
}) {
  const handleRaw = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 5);
    if (!d) {
      onValuesChange([]);
      return;
    }
    onValuesChange([formatTotalItemValueFromDigits(d)]);
  };
  return (
    <Input
      className="border-gray-300 font-mono text-sm tabular-nums"
      inputMode="numeric"
      placeholder="000.00"
      value={value}
      onChange={(e) => handleRaw(e.target.value)}
      aria-label="Shipment total item value (XXX.00)"
    />
  );
}

function mergedAlertOptions(field: ActivationFieldId, current: string[]): string[] {
  const base = optionsForAlertRuleField(field);
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

function AlertRuleMultiSelect({
  field,
  values,
  onChange,
}: {
  field: ActivationFieldId;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const options = useMemo(() => mergedAlertOptions(field, values), [field, values]);
  const [open, setOpen] = useState(false);

  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
    else onChange([...values, opt]);
  };

  const remove = (opt: string) => {
    onChange(values.filter((v) => v !== opt));
  };

  const overflowMoreCount = values.length > 2 ? values.length - 1 : 0;
  const visibleChipValues = overflowMoreCount > 0 ? values.slice(0, 1) : values;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-8 min-h-8 max-h-8 w-full items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none',
            'hover:bg-gray-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          )}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
            {values.length === 0 ? (
              <span className="truncate text-gray-500">Select</span>
            ) : (
              <>
                {visibleChipValues.map((v) => (
                  <span
                    key={v}
                    className="inline-flex max-w-[min(100%,8rem)] shrink-0 items-center gap-0.5 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
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
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[min(100vw-2rem,20rem)] p-2" align="start">
        <div className="max-h-60 space-y-0.5 overflow-y-auto pr-1" role="listbox" aria-multiselectable="true">
          {options.map((opt, optIndex) => {
            const checked = values.includes(opt);
            const optId = `alert-rule-val-${field}-${optIndex}`;
            return (
              <Label
                key={`${field}-${opt}`}
                htmlFor={optId}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100',
                  checked && 'bg-gray-50',
                )}
              >
                <Checkbox
                  id={optId}
                  checked={checked}
                  onCheckedChange={() => toggle(opt)}
                  className="shrink-0"
                />
                <span className="min-w-0 flex-1 truncate">{opt}</span>
              </Label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AlertRuleValuesControl({
  field,
  values,
  onChange,
}: {
  field: ActivationFieldId;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  if (field === 'shipment_total_item_value') {
    return <TotalItemValueInput value={values[0] ?? ''} onValuesChange={onChange} />;
  }
  if (field === 'event_level') {
    return (
      <Input
        className="border-gray-300"
        placeholder="e.g. standard, premium, vip"
        value={values.join(', ')}
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw.trim()) {
            onChange([]);
            return;
          }
          if (raw.includes(',')) {
            onChange(raw.split(',').map((s) => s.trim()).filter(Boolean));
          } else {
            onChange([raw]);
          }
        }}
        aria-label="Event level values"
      />
    );
  }
  return <AlertRuleMultiSelect field={field} values={values} onChange={onChange} />;
}

/** Hides the native calendar glyph; full-field invisible indicator still opens the picker in Chromium. */
const DATE_INPUT_CALENDAR_HIDING =
  'relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:box-border [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0';

function openDatePicker(input: HTMLInputElement | null) {
  if (!input) return;
  if (typeof input.showPicker === 'function') {
    void input.showPicker().catch(() => {
      /* ignore: strict environments without user activation */
    });
  } else {
    input.focus();
  }
}

function AlertDateField({
  id,
  label,
  value,
  onChange,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-gray-600">
        {label}
      </Label>
      <div
        className={cn(
          'relative flex w-full cursor-pointer rounded-md border bg-white transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
          invalid ? 'border-red-500' : 'border-gray-300',
        )}
        onClick={() => openDatePicker(inputRef.current)}
      >
        <Input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
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

function buildPartsForClause(field: ActivationFieldId, values: string[]): string[] {
  if (field === 'event_level') {
    return values.flatMap((v) => v.split(',')).map((s) => s.trim()).filter(Boolean);
  }
  return values.map((x) => x.trim()).filter(Boolean);
}

function buildActivationLogic(rows: ConditionRow[]): string {
  return rows
    .map((r, i) => {
      const parts = buildPartsForClause(r.field, r.values);
      if (parts.length === 0) return '';
      let inner: string;
      if (r.field === 'shipment_total_item_value') {
        inner = `[${r.field} ${operatorDisplay(r.operator)} ${parts[0]}]`;
      } else if (r.operator === 'not_in') {
        inner = `[${r.field} NOT IN ${parts.join(', ')}]`;
      } else {
        inner = `[${r.field} IN ${parts.join(', ')}]`;
      }
      if (i === 0) return inner;
      const j = r.joiner ?? 'AND';
      return `${joinerDisplay(j)} ${inner}`;
    })
    .filter(Boolean)
    .join(' ');
}

function newEmptyRow(joiner: RuleJoiner = 'AND'): ConditionRow {
  const first = ACTIVATION_FIELDS[0];
  return { joiner, field: first.id, operator: first.operators[0], values: [] };
}

function newFirstRow(): ConditionRow {
  const first = ACTIVATION_FIELDS[0];
  return { field: first.id, operator: first.operators[0], values: [] };
}

function splitActivationSegments(s: string): { segments: string[]; joiners: string[] } {
  const t = s.trim();
  const re = /\s+(BUT NOT|AND|OR)\s+/gi;
  const segments: string[] = [];
  const joiners: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t)) !== null) {
    const chunk = t.slice(last, m.index).trim();
    if (chunk) segments.push(chunk);
    const j = m[1].toUpperCase();
    joiners.push(j === 'BUT NOT' ? 'BUT NOT' : j);
    last = m.index + m[0].length;
  }
  const tail = t.slice(last).trim();
  if (tail) segments.push(tail);
  return { segments, joiners };
}

const DISPLAY_TO_OPERATOR: Record<string, string> = {
  'NOT IN': 'not_in',
  IN: 'in',
  'GREATER THAN': '>',
  'LESS THAN': '<',
  'GREATER OR EQUAL': '>=',
  'LESS OR EQUAL': '<=',
  IS: 'in',
};

function parseStoredClause(seg: string): Omit<ConditionRow, 'joiner'> | null {
  let inner = seg.trim();
  if (inner.startsWith('[')) inner = inner.slice(1);
  if (inner.endsWith(']')) inner = inner.slice(0, -1);
  inner = inner.trim();
  const OPS = ['NOT IN', 'GREATER OR EQUAL', 'LESS OR EQUAL', 'GREATER THAN', 'LESS THAN', 'IS', 'IN'] as const;
  const hi = inner.toUpperCase();
  for (const op of OPS) {
    const needle = ` ${op} `;
    const idx = hi.indexOf(needle);
    if (idx === -1) continue;
    const fieldRaw = inner.slice(0, idx).trim();
    const opStart = idx + 1;
    const opEnd = opStart + op.length;
    const opDisplayed = inner.slice(opStart, opEnd).trim();
    const valueStr = inner.slice(opEnd + 1).trim();
    const u = opDisplayed.toUpperCase();
    const storedOp = DISPLAY_TO_OPERATOR[u];
    if (!storedOp) return null;
    const field = (ACTIVATION_FIELDS.some((f) => f.id === fieldRaw) ? fieldRaw : 'order_brand') as ActivationFieldId;
    const validOps = FIELD_BY_ID[field].operators;
    const operator = validOps.includes(storedOp) ? storedOp : validOps[0];
    let values: string[];
    if (storedOp === 'in' || storedOp === 'not_in') {
      values = valueStr.split(',').map((x) => x.trim()).filter(Boolean);
    } else {
      values = valueStr ? [valueStr] : [];
    }
    if (values.length === 0) return null;
    return { field, operator, values };
  }
  return null;
}

function activationStringToRows(text: string): ConditionRow[] {
  const { segments, joiners } = splitActivationSegments(text.trim());
  const rows: ConditionRow[] = [];
  for (let i = 0; i < segments.length; i++) {
    const base = parseStoredClause(segments[i]);
    if (!base) continue;
    const row: ConditionRow = { ...base };
    if (i > 0) {
      const j = joiners[i - 1];
      row.joiner = (j === 'BUT NOT' ? 'BUT_NOT' : (j as 'AND' | 'OR')) as RuleJoiner;
    }
    rows.push(row);
  }
  if (rows[0]) delete rows[0].joiner;
  return rows.length > 0 ? rows : [newFirstRow()];
}

function buildInitialStateFromAlert(alert: ShipmentAlertRow | null) {
  if (!alert) {
    return {
      alertName: '',
      rows: [newFirstRow()] as ConditionRow[],
      releaseConditionEnabled: false,
      releaseTrigger: undefined as ReleaseTrigger | undefined,
      releaseStatus: undefined as string | undefined,
      stuckDurationValue: '',
      stuckDurationUnit: 'hours' as ShipmentAlertDurationUnit,
      configStatus: 'Draft' as ShipmentAlertStatus,
      startDay: '',
      addEndDate: false,
      endDay: '',
    };
  }
  const parsedRows = activationStringToRows(alert.activationLogic);
  const logic = alert.releaseLogic;
  // `manual` is how "no release condition" is persisted, so it seeds the checkbox off.
  const releaseConditionEnabled = logic.kind !== 'manual';
  const releaseTrigger = logic.kind === 'manual' ? undefined : logic.kind;
  const releaseStatus = logic.kind === 'manual' ? undefined : logic.value;
  const stuckDurationValue = logic.kind === 'stuck' ? String(logic.durationValue) : '';
  const stuckDurationUnit: ShipmentAlertDurationUnit =
    logic.kind === 'stuck' ? logic.durationUnit : 'hours';
  const configStatus = alert.status;
  const startDay = alert.startDay ?? '';
  const endDay = alert.endDay ?? '';
  const addEndDate = configStatus === 'Draft' && !!endDay.trim();
  return {
    alertName: alert.alertName,
    rows: parsedRows,
    releaseConditionEnabled,
    releaseTrigger,
    releaseStatus,
    stuckDurationValue,
    stuckDurationUnit,
    configStatus,
    startDay,
    addEndDate,
    endDay,
  };
}

export interface ShipmentAlertConfigurationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (config: CreatedAlertConfiguration) => void;
  onUpdate?: (id: string, config: CreatedAlertConfiguration) => void;
  /** When set, drawer opens in edit mode with this alert. Pass `null` for create. */
  editingAlert?: ShipmentAlertRow | null;
}

export default function ShipmentAlertConfigurationDrawer({
  open,
  onOpenChange,
  onCreate,
  onUpdate,
  editingAlert = null,
}: ShipmentAlertConfigurationDrawerProps) {
  const isEdit = !!editingAlert;

  const [initSeed] = useState(() => buildInitialStateFromAlert(editingAlert ?? null));

  const [alertName, setAlertName] = useState(initSeed.alertName);
  const [rows, setRows] = useState(initSeed.rows);
  const [releaseConditionEnabled, setReleaseConditionEnabled] = useState(
    initSeed.releaseConditionEnabled,
  );
  /** Undefined until the user makes an explicit choice, so the Select shows its placeholder. */
  const [releaseTrigger, setReleaseTrigger] = useState<ReleaseTrigger | undefined>(
    initSeed.releaseTrigger,
  );
  /** Set only after the user picks a status; used by both trigger types. */
  const [releaseStatus, setReleaseStatus] = useState<string | undefined>(initSeed.releaseStatus);
  const [stuckDurationValue, setStuckDurationValue] = useState(initSeed.stuckDurationValue);
  const [stuckDurationUnit, setStuckDurationUnit] = useState<ShipmentAlertDurationUnit>(
    initSeed.stuckDurationUnit,
  );
  const [configStatus, setConfigStatus] = useState<ShipmentAlertStatus>(initSeed.configStatus);
  const [startDay, setStartDay] = useState(initSeed.startDay);
  const [addEndDate, setAddEndDate] = useState(initSeed.addEndDate);
  const [endDay, setEndDay] = useState(initSeed.endDay);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const baselineRef = useRef('');

  useEffect(() => {
    if (configStatus === 'Live') {
      setStartDay('');
      setAddEndDate(false);
    }
  }, [configStatus]);

  const endDateInvalid = useMemo(() => {
    const hasEnd =
      configStatus === 'Live'
        ? endDay.trim().length > 0
        : addEndDate && endDay.trim().length > 0;
    if (!hasEnd) return false;
    const d = new Date(`${endDay}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }, [configStatus, addEndDate, endDay]);

  const conditionsComplete = rows.every((r) => {
    if (!r.field || !r.operator) return false;
    const parts = buildPartsForClause(r.field, r.values);
    if (r.field === 'shipment_total_item_value') {
      return parts.length === 1 && /^\d{3}\.\d{2}$/.test(parts[0]);
    }
    return parts.length > 0;
  });
  const stuckDurationNumber = Number(stuckDurationValue);
  const stuckDurationValid =
    stuckDurationValue.trim() !== '' &&
    Number.isFinite(stuckDurationNumber) &&
    stuckDurationNumber > 0;
  /** Only surfaced once the user has typed something, so an untouched field isn't red. */
  const stuckDurationInvalid =
    releaseConditionEnabled &&
    releaseTrigger === 'stuck' &&
    stuckDurationValue.trim() !== '' &&
    !stuckDurationValid;
  const hasReleaseStatus = !!releaseStatus && releaseStatus.trim() !== '';
  const releaseComplete = !releaseConditionEnabled
    ? true
    : releaseTrigger === 'status'
      ? hasReleaseStatus
      : releaseTrigger === 'stuck'
        ? hasReleaseStatus && stuckDurationValid
        : false; // no trigger picked yet
  const canSubmit =
    alertName.trim().length > 0 &&
    rows.length > 0 &&
    conditionsComplete &&
    releaseComplete &&
    !endDateInvalid;

  const snapshotForm = () =>
    JSON.stringify({
      alertName: alertName.trim(),
      rows,
      releaseConditionEnabled,
      releaseTrigger: releaseTrigger ?? '',
      releaseStatus: releaseStatus ?? '',
      stuckDurationValue: stuckDurationValue.trim(),
      stuckDurationUnit,
      configStatus,
      startDay,
      addEndDate,
      endDay: endDay.trim(),
    });

  useLayoutEffect(() => {
    baselineRef.current = snapshotForm();
    // Snapshot pristine form for this drawer instance only (parent remounts via key).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = isEdit && snapshotForm() !== baselineRef.current;
  const submitEnabled = canSubmit && (!isEdit || dirty);

  const updateRow = (index: number, patch: Partial<ConditionRow>) => {
    setRows((prev) => {
      const next = [...prev];
      const cur = { ...next[index], ...patch };
      if (patch.field !== undefined) {
        const def = FIELD_BY_ID[patch.field];
        cur.operator = def.operators.includes(cur.operator) ? cur.operator : def.operators[0];
        if (patch.values === undefined) cur.values = [];
      }
      next[index] = cur;
      return next;
    });
  };

  const addCondition = () => {
    setRows((prev) => [...prev, newEmptyRow('AND')]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index);
      if (next[0]) delete next[0].joiner;
      return next;
    });
  };

  /** Wipe everything under the checkbox so no stale hidden value can be submitted. */
  const resetReleaseFields = () => {
    setReleaseTrigger(undefined);
    setReleaseStatus(undefined);
    setStuckDurationValue('');
    setStuckDurationUnit('hours');
  };

  const handleReleaseConditionToggle = (checked: boolean) => {
    setReleaseConditionEnabled(checked);
    resetReleaseFields();
    // Checking the box lands on the common case; the user can switch to "stuck" from there.
    if (checked) setReleaseTrigger('status');
  };

  const handleReleaseTriggerChange = (next: ReleaseTrigger) => {
    setReleaseTrigger(next);
    // Both triggers use Shipment Status, but the status is re-chosen per trigger, and the
    // duration only belongs to "stuck".
    setReleaseStatus(undefined);
    setStuckDurationValue('');
    setStuckDurationUnit('hours');
  };

  const handleSubmit = () => {
    setSubmitError(null);
    if (!alertName.trim()) {
      setSubmitError('Alert name is required.');
      return;
    }
    if (rows.length === 0 || !conditionsComplete) {
      setSubmitError('Add at least one complete rule condition (field, operator, and value).');
      return;
    }
    if (endDateInvalid) {
      setSubmitError('End day cannot be in the past.');
      return;
    }
    if (releaseConditionEnabled && !releaseTrigger) {
      setSubmitError('Select a release trigger.');
      return;
    }
    if (releaseConditionEnabled && !hasReleaseStatus) {
      setSubmitError('Select a shipment status for release.');
      return;
    }
    if (releaseConditionEnabled && releaseTrigger === 'stuck' && !stuckDurationValid) {
      setSubmitError('Enter how long the shipment must stay in the status (a positive number).');
      return;
    }
    let releaseLogic: ShipmentAlertReleaseLogic;
    if (!releaseConditionEnabled) {
      releaseLogic = { kind: 'manual' };
    } else if (releaseTrigger === 'stuck') {
      releaseLogic = {
        kind: 'stuck',
        value: releaseStatus!.trim(),
        durationValue: stuckDurationNumber,
        durationUnit: stuckDurationUnit,
      };
    } else {
      releaseLogic = { kind: 'status', value: releaseStatus!.trim() };
    }
    const payload: CreatedAlertConfiguration = {
      alertName: alertName.trim(),
      activationLogic: buildActivationLogic(rows),
      releaseLogic,
      status: configStatus,
      startDay: configStatus === 'Draft' && startDay.trim() ? startDay.trim() : undefined,
      endDay:
        configStatus === 'Live'
          ? endDay.trim() || undefined
          : addEndDate && endDay.trim()
            ? endDay.trim()
            : undefined,
    };
    if (isEdit && editingAlert && onUpdate) {
      onUpdate(editingAlert.id, payload);
    } else {
      onCreate(payload);
    }
    onOpenChange(false);
  };

  const sectionTitleClass = 'text-sm font-semibold text-[#101828]';
  const cardClass = 'rounded-md bg-[#FAFAFA] p-4';

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
              {isEdit ? 'Edit Alert' : 'Create New Alert'}
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
            <div>
              <Label htmlFor="alert-name" className={sectionTitleClass}>
                Alert Name
              </Label>
              <Input
                id="alert-name"
                className="mt-2 border-gray-300"
                placeholder="e.g. Draft - Over 24 hours"
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
              />
            </div>

            <div>
              <p className={cn(sectionTitleClass, 'mb-3')}>Rule Builder</p>
              <div className={cardClass}>
                <div className="mb-3">
                  <Label className="text-xs text-gray-600">Activation Logic</Label>
                </div>
                <div className="flex flex-col gap-3">
                  {rows.map((row, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      {index > 0 ? (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)_2.25rem] sm:items-center">
                          <span className="hidden sm:block" aria-hidden />
                          <div className="flex justify-center sm:block sm:w-full">
                            <Select
                              value={row.joiner ?? 'AND'}
                              onValueChange={(v) => updateRow(index, { joiner: v as RuleJoiner })}
                            >
                              <SelectTrigger
                                className="h-8 w-full max-w-[200px] border-gray-300 text-xs sm:max-w-none"
                                size="sm"
                                aria-label="Logical operator between conditions"
                              >
                                <SelectValue placeholder="Joiner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                                <SelectItem value="BUT_NOT">BUT NOT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <span className="hidden sm:block" aria-hidden />
                          <span className="hidden w-9 sm:block" aria-hidden />
                        </div>
                      ) : null}
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)_2.25rem] sm:items-center">
                        <div className="min-w-0">
                          <Select
                            value={row.field}
                            onValueChange={(v) => updateRow(index, { field: v as ActivationFieldId })}
                          >
                            <SelectTrigger
                              className="border-gray-300"
                              size="sm"
                              aria-label="Condition field"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTIVATION_FIELDS.map((f) => (
                                <SelectItem key={f.id} value={f.id}>
                                  {f.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-0 sm:w-28">
                          <Select
                            value={row.operator}
                            onValueChange={(v) => updateRow(index, { operator: v })}
                          >
                            <SelectTrigger
                              className="border-gray-300"
                              size="sm"
                              aria-label="Condition operator"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_BY_ID[row.field].operators.map((op) => (
                                <SelectItem key={op} value={op}>
                                  {operatorFormLabel(op)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-0 flex-1">
                          <AlertRuleValuesControl
                            field={row.field}
                            values={row.values}
                            onChange={(next) => updateRow(index, { values: next })}
                          />
                        </div>
                        <div className="flex justify-end sm:justify-self-end">
                          {rows.length > 1 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-9 shrink-0 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                  onClick={() => removeRow(index)}
                                  aria-label="Remove condition"
                                >
                                  <X className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" sideOffset={6}>
                                Remove
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="hidden w-9 sm:block" aria-hidden />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCondition}
                    className="self-start text-sm font-medium text-[#1976d2] hover:text-[#1565c0]"
                  >
                    + Add Condition
                  </button>
                </div>
              </div>
            </div>

            <div>
              {/* Checkbox stands in for the section title; unchecked hides the card entirely. */}
              <div
                className={cn(
                  'flex items-center space-x-2',
                  releaseConditionEnabled && 'mb-3',
                )}
              >
                <Checkbox
                  id="add-release-condition"
                  checked={releaseConditionEnabled}
                  onCheckedChange={(c) => handleReleaseConditionToggle(c === true)}
                />
                <Label
                  htmlFor="add-release-condition"
                  className={cn(sectionTitleClass, 'cursor-pointer')}
                >
                  Add Release condition
                </Label>
              </div>
              {releaseConditionEnabled ? (
                <div className={cn(cardClass, 'flex flex-col gap-4')}>
                  <div className="flex flex-row flex-wrap items-end gap-4">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Label className="text-xs text-gray-600">Release trigger</Label>
                      {/* '' (not undefined) keeps Radix controlled while showing the placeholder. */}
                      <Select
                        value={releaseTrigger ?? ''}
                        onValueChange={(v) => handleReleaseTriggerChange(v as ReleaseTrigger)}
                      >
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select release trigger..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="status">By reaching status</SelectItem>
                          <SelectItem value="stuck">Stuck in status</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Label className="text-xs text-gray-600">Shipment Status</Label>
                      <Select value={releaseStatus ?? ''} onValueChange={(v) => setReleaseStatus(v)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select shipment status..." />
                        </SelectTrigger>
                        <SelectContent>
                          {RELEASE_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {releaseTrigger === 'stuck' ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-600" htmlFor="stuck-duration">
                        For more than
                      </Label>
                      <div className="flex items-end gap-2">
                        <Input
                          id="stuck-duration"
                          className={cn(
                            'w-20 tabular-nums',
                            stuckDurationInvalid ? 'border-red-500' : 'border-gray-300',
                          )}
                          inputMode="numeric"
                          placeholder="0"
                          value={stuckDurationValue}
                          onChange={(e) =>
                            setStuckDurationValue(e.target.value.replace(/\D/g, '').slice(0, 4))
                          }
                          aria-label="Duration in status"
                          aria-invalid={stuckDurationInvalid || undefined}
                        />
                        <Select
                          value={stuckDurationUnit}
                          onValueChange={(v) => setStuckDurationUnit(v as ShipmentAlertDurationUnit)}
                        >
                          <SelectTrigger className="w-32 border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DURATION_UNITS.map((u) => (
                              <SelectItem key={u.value} value={u.value}>
                                {u.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {stuckDurationInvalid ? (
                        <p className="text-xs text-red-600">Enter a number greater than 0.</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div>
              <p className={cn(sectionTitleClass, 'mb-3')}>Status &amp; Effective Dates</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600">Status</Label>
                  <Select
                    value={configStatus}
                    onValueChange={(v) => setConfigStatus(v as ShipmentAlertStatus)}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {configStatus === 'Draft' ? (
                  <>
                    <AlertDateField
                      id="start-day"
                      label="Start Date"
                      value={startDay}
                      onChange={setStartDay}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="add-end"
                        checked={addEndDate}
                        onCheckedChange={(c) => setAddEndDate(c === true)}
                      />
                      <Label htmlFor="add-end" className="cursor-pointer text-sm font-normal text-[#101828]">
                        Add End date
                      </Label>
                    </div>
                    {addEndDate ? (
                      <div className="space-y-1.5">
                        <AlertDateField
                          id="end-day"
                          label="End Date"
                          value={endDay}
                          onChange={setEndDay}
                          invalid={endDateInvalid}
                        />
                        {endDateInvalid ? (
                          <p className="text-xs text-red-600">End day cannot be in the past.</p>
                        ) : null}
                        <p className="text-xs leading-snug text-gray-600">
                          The status cannot be changed with a scheduled end date.
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <AlertDateField
                      id="end-day-live"
                      label="End Date (Optional)"
                      value={endDay}
                      onChange={setEndDay}
                      invalid={endDateInvalid}
                    />
                    {endDateInvalid ? (
                      <p className="text-xs text-red-600">End day cannot be in the past.</p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-4">
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
            disabled={!submitEnabled}
            className="min-w-[140px] bg-[#1976d2] text-[15px] font-medium text-white hover:bg-[#1565c0] disabled:bg-[#1976d2] disabled:text-white disabled:opacity-50"
          >
            {isEdit ? 'Update Alert' : 'Create Alert'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
