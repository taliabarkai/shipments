import React, { useEffect, useMemo, useRef, useState } from 'react';
import UploadFile from '@mui/icons-material/UploadFile';
import { Calendar, ChevronDown, Plus, X } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';
import type {
  PackingInstructionDisplayLevel,
  PackingInstructionRow,
  PackingInstructionStatus,
} from './packingInstructionsTypes';
import {
  fetchPackingInstructionRuleLookups,
  optionsForPackingRuleField,
  type PackingRuleFieldId,
  type PackingRuleLookups,
} from './packingInstructionRuleLookups';
import { SHIPPING_CATALOG_PRODUCT_NAMES } from './shippingCatalogMockData';
import PlacementGuideDialog from './PlacementGuideDialog';

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

function PackingDateField({
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
        <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
      </div>
    </div>
  );
}

type RuleFieldId = PackingRuleFieldId;

const RULE_FIELDS: {
  id: RuleFieldId;
  label: string;
  operators: string[];
}[] = [
  { id: 'product_category', label: 'Product category', operators: ['=', '!=', 'in', 'not_in'] },
  { id: 'order_item_sku', label: 'Order item SKU', operators: ['=', '!=', 'in', 'not_in'] },
  { id: 'brand', label: 'Brand', operators: ['=', '!=', 'in', 'not_in'] },
  { id: 'destination_country', label: 'Destination country', operators: ['=', '!=', 'in', 'not_in'] },
  { id: 'shipping_service_level', label: 'Shipping service level', operators: ['=', '!=', 'in', 'not_in'] },
  { id: 'event_level', label: 'Event level', operators: ['=', '!=', 'in', 'not_in'] },
  { id: 'total_item_value', label: 'Total item value', operators: ['>', '<', '>=', '<=', '='] },
];

const FIELD_BY_ID = Object.fromEntries(RULE_FIELDS.map((f) => [f.id, f])) as Record<
  RuleFieldId,
  (typeof RULE_FIELDS)[number]
>;

type ConditionRow = {
  field: RuleFieldId;
  operator: string;
  /** One or more selected lookup values for this condition. */
  values: string[];
};

function operatorDisplay(op: string): string {
  switch (op) {
    case 'not_in':
      return 'NOT IN';
    case 'in':
      return 'IN';
    case '!=':
      return 'NOT EQUALS';
    case '>':
      return 'GREATER THAN';
    case '<':
      return 'LESS THAN';
    case '>=':
      return 'GREATER OR EQUAL';
    case '<=':
      return 'LESS OR EQUAL';
    case '=':
      return 'EQUALS';
    default:
      return op.toUpperCase();
  }
}

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
    case '=':
      return 'Is';
    case '!=':
      return 'Is not';
    case 'not_in':
      return 'not in';
    case 'in':
      return 'in';
    default:
      return op;
  }
}

function buildActivationLogic(rows: ConditionRow[]): string {
  return rows
    .map((r, i) => {
      const vals = r.values.map((x) => x.trim()).filter(Boolean);
      if (vals.length === 0) return '';
      let inner: string;
      if (vals.length === 1) {
        inner = `[${r.field} ${operatorDisplay(r.operator)} ${vals[0]}]`;
      } else if (r.operator === '!=' || r.operator === 'not_in') {
        inner = `[${r.field} ${operatorDisplay('not_in')} ${vals.join(', ')}]`;
      } else {
        inner = `[${r.field} ${operatorDisplay('in')} ${vals.join(', ')}]`;
      }
      if (i === 0) return inner;
      return `AND ${inner}`;
    })
    .filter(Boolean)
    .join(' ');
}

function newEmptyRow(): ConditionRow {
  const first = RULE_FIELDS[0];
  return { field: first.id, operator: first.operators[0], values: [] };
}

function newFirstRow(): ConditionRow {
  const first = RULE_FIELDS[0];
  return { field: first.id, operator: first.operators[0], values: [] };
}

function normalizeRuleFieldId(raw: string): RuleFieldId {
  if (raw === 'order_total' || raw === 'shipment_value') return 'total_item_value';
  if (RULE_FIELDS.some((f) => f.id === raw)) return raw as RuleFieldId;
  return 'product_category';
}

const LANG_KEYS = ['EN', 'HE', 'AR', 'HU', 'TH'] as const;
type LangKey = (typeof LANG_KEYS)[number];

function splitActivationSegments(text: string): string[] {
  const s = text.trim();
  const re = /\s+(?:AND|OR)\s+/gi;
  const segments: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const chunk = s.slice(last, m.index).trim();
    if (chunk) segments.push(chunk);
    last = m.index + m[0].length;
  }
  const tail = s.slice(last).trim();
  if (tail) segments.push(tail);
  return segments;
}

function parseClause(seg: string): ConditionRow | null {
  let inner = seg.trim();
  if (inner.startsWith('[')) inner = inner.slice(1);
  if (inner.endsWith(']')) inner = inner.slice(0, -1);
  inner = inner.trim();
  const OPS = [
    'NOT EQUALS',
    'NOT IN',
    'GREATER OR EQUAL',
    'LESS OR EQUAL',
    'GREATER THAN',
    'LESS THAN',
    'EQUALS',
    'IN',
  ] as const;
  const hi = inner.toUpperCase();
  for (const op of OPS) {
    const needle = ` ${op} `;
    const idx = hi.indexOf(needle);
    if (idx === -1) continue;
    const fieldRaw = inner.slice(0, idx).trim();
    const valueStr = inner.slice(idx + needle.length).trim();
    const opMap: Record<string, string> = {
      'NOT EQUALS': '!=',
      'NOT IN': 'not_in',
      IN: 'in',
      'GREATER THAN': '>',
      'LESS THAN': '<',
      'GREATER OR EQUAL': '>=',
      'LESS OR EQUAL': '<=',
      EQUALS: '=',
    };
    const storedOp = opMap[op];
    if (!storedOp) continue;
    const field = normalizeRuleFieldId(fieldRaw);
    const validOps = FIELD_BY_ID[field].operators;
    const operator = validOps.includes(storedOp) ? storedOp : validOps[0];
    let values: string[];
    if (storedOp === 'in' || storedOp === 'not_in') {
      values = valueStr
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
    } else {
      values = valueStr ? [valueStr] : [];
    }
    if (values.length === 0) return null;
    return { field, operator, values };
  }
  return null;
}

function parseActivationToRows(logic: string): ConditionRow[] {
  if (!logic.trim()) return [newFirstRow()];
  const segments = splitActivationSegments(logic);
  const out: ConditionRow[] = [];
  for (let i = 0; i < segments.length; i++) {
    const base = parseClause(segments[i]);
    if (!base) continue;
    out.push(base);
  }
  return out.length ? out : [newFirstRow()];
}

function mergedValueOptionsMany(
  lookups: PackingRuleLookups | null,
  field: RuleFieldId,
  currentValues: string[],
): string[] {
  const base = optionsForPackingRuleField(lookups, field);
  const seen = new Set(base);
  const out = [...base];
  for (const v of currentValues) {
    const t = v.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

function RuleValuesMultiSelect({
  field,
  values,
  lookups,
  loading,
  onChange,
}: {
  field: RuleFieldId;
  values: string[];
  lookups: PackingRuleLookups | null;
  loading: boolean;
  onChange: (next: string[]) => void;
}) {
  const options = useMemo(
    () => mergedValueOptionsMany(lookups, field, values),
    [lookups, field, values],
  );
  const [open, setOpen] = useState(false);

  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
    else onChange([...values, opt]);
  };

  const remove = (opt: string) => {
    onChange(values.filter((v) => v !== opt));
  };

  if (loading || !lookups) {
    return (
      <button
        type="button"
        disabled
        className="flex min-h-8 w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-left text-sm text-gray-500"
      >
        {loading ? 'Loading values…' : 'Options unavailable'}
        <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
      </button>
    );
  }

  if (options.length === 0) {
    return (
      <button
        type="button"
        disabled
        className="flex min-h-8 w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-left text-sm text-gray-500"
      >
        No values for this field
      </button>
    );
  }

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
              <span className="truncate text-gray-500">Select value</span>
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
            const optId = `packing-rule-value-${field}-${optIndex}`;
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function packingInstructionRowsEqual(a: PackingInstructionRow, b: PackingInstructionRow): boolean {
  return (
    a.id === b.id &&
    a.instructionName === b.instructionName &&
    a.displayLevel === b.displayLevel &&
    a.startDate === b.startDate &&
    a.endDate === b.endDate &&
    a.status === b.status &&
    a.activationLogic === b.activationLogic &&
    a.contentEn === b.contentEn &&
    a.contentHe === b.contentHe &&
    a.contentAr === b.contentAr &&
    a.contentHu === b.contentHu &&
    a.contentTh === b.contentTh &&
    (a.imageDataUrl ?? '') === (b.imageDataUrl ?? '') &&
    (a.linkedShippingProductName ?? '') === (b.linkedShippingProductName ?? '')
  );
}

function buildPackingInstructionRowForSave(args: {
  editingRow: PackingInstructionRow | null;
  instructionName: string;
  displayLevel: PackingInstructionDisplayLevel;
  rows: ConditionRow[];
  contentEn: string;
  contentHe: string;
  contentAr: string;
  contentHu: string;
  contentTh: string;
  imagePreview: string | undefined;
  configStatus: PackingInstructionStatus;
  startDay: string;
  endDay: string;
  addEndDate: boolean;
  addShippingProduct: boolean;
  linkedShippingProductName: string;
}): PackingInstructionRow {
  const id =
    args.editingRow?.id ??
    (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pi-${Date.now()}`);
  const startDate = args.configStatus === 'Draft' && args.startDay.trim() ? args.startDay.trim() : '';
  const endDateResolved =
    args.configStatus === 'Live'
      ? args.endDay.trim()
      : args.addEndDate && args.endDay.trim()
        ? args.endDay.trim()
        : '';
  return {
    id,
    instructionName: args.instructionName.trim(),
    displayLevel: args.displayLevel,
    startDate: args.configStatus === 'Draft' ? startDate : args.editingRow?.startDate ?? '',
    endDate: endDateResolved,
    status: args.configStatus,
    activationLogic: buildActivationLogic(args.rows),
    contentEn: args.contentEn.trim(),
    contentHe: args.contentHe.trim(),
    contentAr: args.contentAr.trim(),
    contentHu: args.contentHu.trim(),
    contentTh: args.contentTh.trim(),
    imageDataUrl: args.imagePreview,
    linkedShippingProductName:
      args.addShippingProduct && args.linkedShippingProductName.trim()
        ? args.linkedShippingProductName.trim()
        : undefined,
  };
}

export interface CreatePackingInstructionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRow: PackingInstructionRow | null;
  onSave: (row: PackingInstructionRow) => void;
}

export default function CreatePackingInstructionDrawer({
  open,
  onOpenChange,
  editingRow,
  onSave,
}: CreatePackingInstructionDrawerProps) {
  const isEdit = !!editingRow;

  const [instructionName, setInstructionName] = useState('');
  const [displayLevel, setDisplayLevel] = useState<PackingInstructionDisplayLevel>('Item');
  const [rows, setRows] = useState<ConditionRow[]>([newFirstRow()]);
  const [contentLang, setContentLang] = useState<LangKey>('EN');
  const [contentEn, setContentEn] = useState('');
  const [contentHe, setContentHe] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [contentHu, setContentHu] = useState('');
  const [contentTh, setContentTh] = useState('');
  const [translationUpToDate, setTranslationUpToDate] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [imageAttachmentName, setImageAttachmentName] = useState('');
  const [imageAttachmentSize, setImageAttachmentSize] = useState('');
  const [imageAttachmentDimensions, setImageAttachmentDimensions] = useState('');
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [configStatus, setConfigStatus] = useState<PackingInstructionStatus>('Draft');
  const [startDay, setStartDay] = useState('');
  const [addEndDate, setAddEndDate] = useState(false);
  const [endDay, setEndDay] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lookups, setLookups] = useState<PackingRuleLookups | null>(null);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [lookupsError, setLookupsError] = useState<string | null>(null);
  const [placementGuideOpen, setPlacementGuideOpen] = useState(false);
  const [addShippingProduct, setAddShippingProduct] = useState(false);
  const [linkedShippingProductName, setLinkedShippingProductName] = useState('');

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
    fetchPackingInstructionRuleLookups()
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
    if (!imagePreview) {
      setImageAttachmentDimensions('');
      return;
    }
    const img = new Image();
    img.onload = () => {
      setImageAttachmentDimensions(`${img.naturalWidth} x ${img.naturalHeight}px`);
    };
    img.onerror = () => setImageAttachmentDimensions('');
    img.src = imagePreview;
  }, [imagePreview]);

  useEffect(() => {
    if (!open) return;
    if (editingRow) {
      setInstructionName(editingRow.instructionName);
      setDisplayLevel(editingRow.displayLevel);
      setRows(parseActivationToRows(editingRow.activationLogic));
      setContentEn(editingRow.contentEn);
      setContentHe(editingRow.contentHe);
      setContentAr(editingRow.contentAr);
      setContentHu(editingRow.contentHu);
      setContentTh(editingRow.contentTh);
      setTranslationUpToDate(
        !!(editingRow.contentHe || editingRow.contentAr || editingRow.contentHu || editingRow.contentTh),
      );
      setImagePreview(editingRow.imageDataUrl);
      setImageAttachmentName(editingRow.imageDataUrl ? 'Attached image' : '');
      setImageAttachmentSize('');
      setConfigStatus(editingRow.status);
      setStartDay(editingRow.startDate || '');
      const hasEnd = !!editingRow.endDate?.trim();
      setAddEndDate(editingRow.status === 'Draft' ? hasEnd : false);
      setEndDay(editingRow.endDate || '');
      const linked = editingRow.linkedShippingProductName?.trim() ?? '';
      setAddShippingProduct(linked.length > 0);
      setLinkedShippingProductName(linked);
    } else {
      setInstructionName('');
      setDisplayLevel('Item');
      setRows([newFirstRow()]);
      setContentLang('EN');
      setContentEn('');
      setContentHe('');
      setContentAr('');
      setContentHu('');
      setContentTh('');
      setTranslationUpToDate({ HE: false, AR: false, HU: false, TH: false });
      setImagePreview(undefined);
      setImageAttachmentName('');
      setImageAttachmentSize('');
      setImageAttachmentDimensions('');
      setConfigStatus('Draft');
      setStartDay('');
      setAddEndDate(false);
      setEndDay('');
      setAddShippingProduct(false);
      setLinkedShippingProductName('');
    }
    setSubmitError(null);
  }, [open, editingRow]);

  useEffect(() => {
    if (configStatus === 'Live') {
      setStartDay('');
      setAddEndDate(false);
    }
  }, [configStatus]);

  const endDateInvalid = useMemo(() => {
    const hasEnd =
      configStatus === 'Live' ? endDay.trim().length > 0 : addEndDate && endDay.trim().length > 0;
    if (!hasEnd) return false;
    const d = new Date(`${endDay}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }, [configStatus, addEndDate, endDay]);

  const shippingProductSelectOptions = useMemo(() => {
    const t = linkedShippingProductName.trim();
    const base = [...SHIPPING_CATALOG_PRODUCT_NAMES];
    if (t && !base.includes(t)) base.unshift(t);
    return base;
  }, [linkedShippingProductName]);

  const conditionsComplete = rows.every((r) => r.field && r.operator && r.values.length > 0);
  const hasAnyTranslation = !!(contentHe.trim() || contentAr.trim() || contentHu.trim() || contentTh.trim());
  const allTranslationsConfirmed = !isEdit || !hasAnyTranslation || translationUpToDate;

  const canSubmit =
    instructionName.trim().length > 0 &&
    rows.length > 0 &&
    conditionsComplete &&
    contentEn.trim().length > 0 &&
    allTranslationsConfirmed &&
    !endDateInvalid &&
    !lookupsLoading &&
    lookups !== null &&
    !lookupsError;

  const rowForDirtyCompare = useMemo(() => {
    if (!isEdit || !editingRow) return null;
    return buildPackingInstructionRowForSave({
      editingRow,
      instructionName,
      displayLevel,
      rows,
      contentEn,
      contentHe,
      contentAr,
      contentHu,
      contentTh,
      imagePreview,
      configStatus,
      startDay,
      endDay,
      addEndDate,
      addShippingProduct,
      linkedShippingProductName,
    });
  }, [
    isEdit,
    editingRow,
    instructionName,
    displayLevel,
    rows,
    contentEn,
    contentHe,
    contentAr,
    contentHu,
    contentTh,
    imagePreview,
    configStatus,
    startDay,
    endDay,
    addEndDate,
    addShippingProduct,
    linkedShippingProductName,
  ]);

  const saveButtonEnabled = useMemo(() => {
    if (!canSubmit) return false;
    if (!isEdit || !editingRow) return true;
    if (!rowForDirtyCompare) return false;
    return !packingInstructionRowsEqual(rowForDirtyCompare, editingRow);
  }, [canSubmit, isEdit, editingRow, rowForDirtyCompare]);

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

  const addCondition = () => setRows((prev) => [...prev, newEmptyRow()]);
  const removeRow = (index: number) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleImage = (file: File | null) => {
    if (!file) return;
    setImageAttachmentName(file.name);
    setImageAttachmentSize(formatFileSize(file.size));
    setImageAttachmentDimensions('');
    const r = new FileReader();
    r.onload = () => setImagePreview(typeof r.result === 'string' ? r.result : undefined);
    r.readAsDataURL(file);
  };

  const clearInstructionImage = () => {
    setImagePreview(undefined);
    setImageAttachmentName('');
    setImageAttachmentSize('');
    setImageAttachmentDimensions('');
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    setSubmitError(null);
    if (!instructionName.trim()) {
      setSubmitError('Instruction name is required.');
      return;
    }
    if (!contentEn.trim()) {
      setSubmitError('English content is required.');
      return;
    }
    if (endDateInvalid) {
      setSubmitError('End date cannot be in the past.');
      return;
    }
    const row = buildPackingInstructionRowForSave({
      editingRow,
      instructionName,
      displayLevel,
      rows,
      contentEn,
      contentHe,
      contentAr,
      contentHu,
      contentTh,
      imagePreview,
      configStatus,
      startDay,
      endDay,
      addEndDate,
      addShippingProduct,
      linkedShippingProductName,
    });
    onSave(row);
    onOpenChange(false);
  };

  const sectionTitleClass = 'text-sm font-semibold text-[#101828]';
  const cardClass = 'rounded-md bg-[#FAFAFA] p-4';

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        hideClose
        side="right"
        className="flex h-full min-h-0 w-full flex-col gap-0 overflow-hidden border-l border-gray-200 bg-white p-0 sm:max-w-[600px]"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-200 px-6 py-4 text-left">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle className="text-base font-semibold leading-normal text-[#101828]">
              {isEdit ? 'Edit Packing Instruction' : 'Create New Packing Instruction'}
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
              <p className={cn(sectionTitleClass, 'mb-3')}>General</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <div className="space-y-1.5">
                  <Label htmlFor="pi-name" className="text-xs text-gray-600">
                    Instruction Name
                  </Label>
                  <Input
                    id="pi-name"
                    className="border-gray-300"
                    placeholder="e.g Rings"
                    value={instructionName}
                    onChange={(e) => setInstructionName(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="pi-display-level" className="text-xs text-gray-600">
                      Display level
                    </Label>
                    <button
                      type="button"
                      className="shrink-0 text-sm font-medium text-[#1976d2] underline decoration-[#1976d2] underline-offset-2 hover:text-[#1565c0]"
                      onClick={() => setPlacementGuideOpen(true)}
                    >
                      Placement Guide
                    </button>
                  </div>
                  <Select
                    value={displayLevel}
                    onValueChange={(v) => setDisplayLevel(v as PackingInstructionDisplayLevel)}
                  >
                    <SelectTrigger
                      id="pi-display-level"
                      aria-label="Display level"
                      className="h-9 w-full border-gray-300 bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Item">Item</SelectItem>
                      <SelectItem value="Shipment">Shipment</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs leading-normal text-gray-600">
                    {displayLevel === 'Shipment' ? (
                      <>
                        Instruction is linked to the{' '}
                        <strong className="font-semibold text-[#101828]">entire shipment</strong>.
                      </>
                    ) : (
                      <>
                        Instruction is linked to the{' '}
                        <strong className="font-semibold text-[#101828]">specific item</strong>.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className={cn(sectionTitleClass, 'mb-3')}>Rule Builder</p>
              <div className={cardClass}>
                <div className="mb-3">
                  <Label className="text-xs text-gray-600">Activation Logic</Label>
                </div>
                {lookupsError ? <p className="mb-2 text-sm text-red-600">{lookupsError}</p> : null}
                <div className="flex flex-col gap-3">
                  {rows.map((row, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      {index > 0 ? (
                        <div className="flex justify-center py-0.5">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">AND</span>
                        </div>
                      ) : null}
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)_2.25rem] sm:items-center">
                        <Select
                          value={row.field}
                          onValueChange={(v) => updateRow(index, { field: v as RuleFieldId })}
                        >
                          <SelectTrigger className="border-gray-300" size="sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {RULE_FIELDS.map((f) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={row.operator} onValueChange={(v) => updateRow(index, { operator: v })}>
                          <SelectTrigger className="border-gray-300" size="sm">
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
                        <RuleValuesMultiSelect
                          field={row.field}
                          values={row.values}
                          lookups={lookups}
                          loading={lookupsLoading}
                          onChange={(next) => updateRow(index, { values: next })}
                        />
                        <div className="flex justify-end">
                          {rows.length > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 text-gray-500"
                              onClick={() => removeRow(index)}
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
                  ))}
                  <button
                    type="button"
                    onClick={addCondition}
                    className="inline-flex items-center gap-1 self-start text-sm font-medium text-[#1976d2] hover:text-[#1565c0]"
                  >
                    <Plus className="size-4" />
                    Add Condition
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className={cn(sectionTitleClass, 'mb-3')}>Content</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <div>
                  <Label className="text-xs text-gray-600">Text</Label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0">
                      <div className="flex h-auto items-end border-b border-gray-200">
                        <span className="-mb-px inline-flex h-auto flex-none border-b-2 border-[#1976d2] px-0 py-2 text-sm font-medium text-[#1976d2]">
                          EN
                        </span>
                      </div>
                      <div className="mt-3">
                        <Textarea
                          className="min-h-[120px] border-gray-300"
                          placeholder="Instruction text (English, required)"
                          value={contentEn}
                          onChange={(e) => {
                            setContentEn(e.target.value);
                            setTranslationUpToDate(false);
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-0">
                      <Tabs
                        value={contentLang === 'EN' ? 'HE' : contentLang}
                        onValueChange={(v) => setContentLang(v as LangKey)}
                        className="flex flex-col gap-0"
                      >
                        <TabsList className="relative flex h-auto w-full flex-wrap items-end justify-start gap-x-6 gap-y-0 rounded-none border-0 border-b border-gray-200 bg-transparent p-0">
                          {LANG_KEYS.filter((l) => l !== 'EN').map((lang) => (
                            <TabsTrigger
                              key={lang}
                              value={lang}
                              className={cn(
                                '-mb-px inline-flex h-auto flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-2 text-sm font-normal shadow-none',
                                'text-gray-500 hover:text-gray-600',
                                'data-[state=active]:border-[#1976d2] data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-[#1976d2]',
                                'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
                              )}
                            >
                              {lang}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        <TabsContent value="HE" className="mt-3">
                          <Textarea
                            className="min-h-[120px] border-gray-300"
                            placeholder="Hebrew"
                            value={contentHe}
                            onChange={(e) => {
                              setContentHe(e.target.value);
                              setTranslationUpToDate(false);
                            }}
                          />
                        </TabsContent>
                        <TabsContent value="AR" className="mt-3">
                          <Textarea
                            className="min-h-[120px] border-gray-300"
                            placeholder="Arabic"
                            value={contentAr}
                            onChange={(e) => {
                              setContentAr(e.target.value);
                              setTranslationUpToDate(false);
                            }}
                          />
                        </TabsContent>
                        <TabsContent value="HU" className="mt-3">
                          <Textarea
                            className="min-h-[120px] border-gray-300"
                            placeholder="Hungarian"
                            value={contentHu}
                            onChange={(e) => {
                              setContentHu(e.target.value);
                              setTranslationUpToDate(false);
                            }}
                          />
                        </TabsContent>
                        <TabsContent value="TH" className="mt-3">
                          <Textarea
                            className="min-h-[120px] border-gray-300"
                            placeholder="Thai"
                            value={contentTh}
                            onChange={(e) => {
                              setContentTh(e.target.value);
                              setTranslationUpToDate(false);
                            }}
                          />
                        </TabsContent>
                      </Tabs>
                      {isEdit && hasAnyTranslation && (
                        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={translationUpToDate}
                            onChange={(e) => setTranslationUpToDate(e.target.checked)}
                            className="h-3.5 w-3.5 accent-[#1976d2]"
                          />
                          Translation is up to date
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Image</Label>
                  <input
                    ref={imageFileInputRef}
                    id="pi-image-file"
                    type="file"
                    accept="image/*,.svg"
                    className="sr-only"
                    onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
                  />
                  {imagePreview ? (
                    <div className="mt-2">
                      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                        <img
                          src={imagePreview}
                          alt=""
                          className="size-12 shrink-0 rounded border border-gray-200 bg-white object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#101828]">
                            {imageAttachmentName || 'Image'}
                          </p>
                          {(imageAttachmentSize || imageAttachmentDimensions) && (
                            <p className="truncate text-xs text-gray-500">
                              {[imageAttachmentSize, imageAttachmentDimensions].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0 p-0 text-gray-500 hover:text-gray-800"
                          onClick={clearInstructionImage}
                          aria-label="Remove image"
                        >
                          <X className="size-6" aria-hidden />
                        </Button>
                      </div>
                      <button
                        type="button"
                        className="mt-2 text-xs font-medium text-[#1976d2] hover:text-[#1565c0]"
                        onClick={() => imageFileInputRef.current?.click()}
                      >
                        Replace image
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="pi-image-file"
                      className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-8 transition-colors hover:border-gray-400 hover:bg-gray-50"
                    >
                      <UploadFile className="mb-2" sx={{ fontSize: 32, color: '#1976d2' }} aria-hidden />
                      <span className="text-sm font-normal text-black">Drag and drop or click to upload</span>
                      <span className="mt-1 text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 4000 x 4000px)</span>
                    </label>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pi-add-shipping-product"
                    checked={addShippingProduct}
                    onCheckedChange={(c) => {
                      const on = c === true;
                      setAddShippingProduct(on);
                      if (!on) setLinkedShippingProductName('');
                    }}
                  />
                  <Label htmlFor="pi-add-shipping-product" className="cursor-pointer text-sm font-normal text-[#101828]">
                    Add Shipping Product
                  </Label>
                </div>
                {addShippingProduct ? (
                  <div>
                    <Select
                      value={linkedShippingProductName.trim() ? linkedShippingProductName : undefined}
                      onValueChange={setLinkedShippingProductName}
                    >
                      <SelectTrigger
                        id="pi-linked-product"
                        className="border-gray-300"
                        size="sm"
                        aria-label="Shipping product catalog item"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingProductSelectOptions.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <p className={cn(sectionTitleClass, 'mb-3')}>Status &amp; Effective Dates</p>
              <div className={cn(cardClass, 'flex flex-col gap-4')}>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600">Status</Label>
                  <Select value={configStatus} onValueChange={(v) => setConfigStatus(v as PackingInstructionStatus)}>
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
                    <PackingDateField id="pi-start" label="Start Date" value={startDay} onChange={setStartDay} />
                    <div className="flex items-center space-x-2">
                      <Checkbox id="pi-add-end" checked={addEndDate} onCheckedChange={(c) => setAddEndDate(c === true)} />
                      <Label htmlFor="pi-add-end" className="cursor-pointer text-sm font-normal text-[#101828]">
                        Add End date
                      </Label>
                    </div>
                    {addEndDate ? (
                      <div className="space-y-1.5">
                        <PackingDateField
                          id="pi-end"
                          label="End Date"
                          value={endDay}
                          onChange={setEndDay}
                          invalid={endDateInvalid}
                        />
                        {endDateInvalid ? (
                          <p className="text-xs text-red-600">End date cannot be in the past.</p>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <PackingDateField
                    id="pi-end-live"
                    label="End Date (optional)"
                    value={endDay}
                    onChange={setEndDay}
                    invalid={endDateInvalid}
                  />
                )}
                {configStatus === 'Live' && endDateInvalid ? (
                  <p className="text-xs text-red-600">End date cannot be in the past.</p>
                ) : null}
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
            disabled={!saveButtonEnabled}
            className="min-w-[140px] bg-[#1976d2] text-[15px] font-medium text-white hover:bg-[#1565c0] disabled:bg-[#1976d2] disabled:text-white disabled:opacity-50"
          >
            {isEdit ? 'Save changes' : 'Create Instruction'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
    <PlacementGuideDialog open={placementGuideOpen} onOpenChange={setPlacementGuideOpen} />
    </>
  );
}
