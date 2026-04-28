import { useEffect, useMemo, useRef, useState } from 'react';
import UploadFile from '@mui/icons-material/UploadFile';
import { Calendar, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
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

type RuleJoiner = 'AND' | 'OR';

type ConditionRow = {
  joiner?: RuleJoiner;
  field: RuleFieldId;
  operator: string;
  value: string;
};

function joinerDisplay(j: RuleJoiner): string {
  return j;
}

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
      const v = r.value.trim();
      const inner = `[${r.field} ${operatorDisplay(r.operator)} ${v}]`;
      if (i === 0) return inner;
      const j = r.joiner ?? 'AND';
      return `${joinerDisplay(j)} ${inner}`;
    })
    .join(' ');
}

function newEmptyRow(joiner: RuleJoiner = 'AND'): ConditionRow {
  const first = RULE_FIELDS[0];
  return { joiner, field: first.id, operator: first.operators[0], value: '' };
}

function newFirstRow(): ConditionRow {
  const first = RULE_FIELDS[0];
  return { field: first.id, operator: first.operators[0], value: '' };
}

function normalizeRuleFieldId(raw: string): RuleFieldId {
  if (raw === 'order_total' || raw === 'shipment_value') return 'total_item_value';
  if (RULE_FIELDS.some((f) => f.id === raw)) return raw as RuleFieldId;
  return 'product_category';
}

const LANG_KEYS = ['EN', 'HE', 'AR', 'HU', 'TH'] as const;
type LangKey = (typeof LANG_KEYS)[number];

function splitActivationSegments(text: string): { segments: string[]; joiners: string[] } {
  const s = text.trim();
  const re = /\s+(AND|OR)\s+/gi;
  const segments: string[] = [];
  const joiners: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const chunk = s.slice(last, m.index).trim();
    if (chunk) segments.push(chunk);
    joiners.push(m[1].toUpperCase() === 'OR' ? 'OR' : 'AND');
    last = m.index + m[0].length;
  }
  const tail = s.slice(last).trim();
  if (tail) segments.push(tail);
  return { segments, joiners };
}

function parseClause(seg: string): Omit<ConditionRow, 'joiner'> | null {
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
    const value = inner.slice(idx + needle.length).trim();
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
    return { field, operator, value };
  }
  return null;
}

function parseActivationToRows(logic: string): ConditionRow[] {
  if (!logic.trim()) return [newFirstRow()];
  const { segments, joiners } = splitActivationSegments(logic);
  const out: ConditionRow[] = [];
  for (let i = 0; i < segments.length; i++) {
    const base = parseClause(segments[i]);
    if (!base) continue;
    const row: ConditionRow = { ...base };
    if (i > 0) row.joiner = joiners[i - 1] === 'OR' ? 'OR' : 'AND';
    out.push(row);
  }
  return out.length ? out : [newFirstRow()];
}

function mergedValueOptions(
  lookups: PackingRuleLookups | null,
  field: RuleFieldId,
  currentValue: string,
): string[] {
  const base = optionsForPackingRuleField(lookups, field);
  const v = currentValue.trim();
  if (v && !base.includes(v)) return [...base, v];
  return base;
}

function RuleValueSelect({
  field,
  value,
  lookups,
  loading,
  onChange,
}: {
  field: RuleFieldId;
  value: string;
  lookups: PackingRuleLookups | null;
  loading: boolean;
  onChange: (v: string) => void;
}) {
  const options = useMemo(() => mergedValueOptions(lookups, field, value), [lookups, field, value]);

  if (loading || !lookups) {
    return (
      <Select disabled value={undefined}>
        <SelectTrigger className="border-gray-300" size="sm">
          <SelectValue placeholder={loading ? 'Loading values…' : 'Options unavailable'} />
        </SelectTrigger>
      </Select>
    );
  }

  if (options.length === 0) {
    return (
      <Select disabled value={undefined}>
        <SelectTrigger className="border-gray-300" size="sm">
          <SelectValue placeholder="No values for this field" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value.trim() ? value : undefined} onValueChange={onChange}>
      <SelectTrigger className="border-gray-300" size="sm">
        <SelectValue placeholder="Select value" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={`${field}-${opt}`} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
    (a.imageDataUrl ?? '') === (b.imageDataUrl ?? '')
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
      setImagePreview(editingRow.imageDataUrl);
      setImageAttachmentName(editingRow.imageDataUrl ? 'Attached image' : '');
      setImageAttachmentSize('');
      setConfigStatus(editingRow.status);
      setStartDay(editingRow.startDate || '');
      const hasEnd = !!editingRow.endDate?.trim();
      setAddEndDate(editingRow.status === 'Draft' ? hasEnd : false);
      setEndDay(editingRow.endDate || '');
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
      setImagePreview(undefined);
      setImageAttachmentName('');
      setImageAttachmentSize('');
      setImageAttachmentDimensions('');
      setConfigStatus('Draft');
      setStartDay('');
      setAddEndDate(false);
      setEndDay('');
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

  const conditionsComplete = rows.every((r) => r.field && r.operator && r.value.trim().length > 0);
  const canSubmit =
    instructionName.trim().length > 0 &&
    rows.length > 0 &&
    conditionsComplete &&
    contentEn.trim().length > 0 &&
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
        if (patch.value === undefined) cur.value = '';
      }
      next[index] = cur;
      return next;
    });
  };

  const addCondition = () => setRows((prev) => [...prev, newEmptyRow('AND')]);
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
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_7rem_1fr] sm:items-center">
                          <span className="hidden sm:block" />
                          <Select
                            value={row.joiner ?? 'AND'}
                            onValueChange={(v) => updateRow(index, { joiner: v as RuleJoiner })}
                          >
                            <SelectTrigger className="h-8 border-gray-300 text-xs" size="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="hidden sm:block" />
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
                        <RuleValueSelect
                          field={row.field}
                          value={row.value}
                          lookups={lookups}
                          loading={lookupsLoading}
                          onChange={(v) => updateRow(index, { value: v })}
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
                      <span className="text-sm font-medium text-[#1976d2]">Drag and drop or click to upload</span>
                      <span className="mt-1 text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 4000 x 4000px)</span>
                    </label>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Text</Label>
                  <Tabs
                    value={contentLang}
                    onValueChange={(v) => setContentLang(v as LangKey)}
                    className="mt-2 flex flex-col gap-0"
                  >
                    <TabsList className="relative flex h-auto w-full flex-wrap items-end justify-start gap-x-6 gap-y-0 rounded-none border-0 border-b border-gray-200 bg-transparent p-0">
                      {LANG_KEYS.map((lang) => (
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
                          {lang === 'EN' ? <span>*</span> : null}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value="EN" className="mt-3">
                      <Textarea
                        className="min-h-[120px] border-gray-300"
                        placeholder="Instruction text (English, required)"
                        value={contentEn}
                        onChange={(e) => setContentEn(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="HE" className="mt-3">
                      <Textarea
                        className="min-h-[120px] border-gray-300"
                        placeholder="Hebrew"
                        value={contentHe}
                        onChange={(e) => setContentHe(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="AR" className="mt-3">
                      <Textarea
                        className="min-h-[120px] border-gray-300"
                        placeholder="Arabic"
                        value={contentAr}
                        onChange={(e) => setContentAr(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="HU" className="mt-3">
                      <Textarea
                        className="min-h-[120px] border-gray-300"
                        placeholder="Hungarian"
                        value={contentHu}
                        onChange={(e) => setContentHu(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="TH" className="mt-3">
                      <Textarea
                        className="min-h-[120px] border-gray-300"
                        placeholder="Thai"
                        value={contentTh}
                        onChange={(e) => setContentTh(e.target.value)}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
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

        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            className="px-0 text-[15px] font-medium text-[#1976d2] hover:bg-transparent hover:text-[#1565c0]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!saveButtonEnabled}
            className="min-w-[140px] bg-[#1976d2] text-[15px] font-medium text-white hover:bg-[#1565c0] disabled:opacity-50"
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
