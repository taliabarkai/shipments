import { useEffect, useState } from 'react';
import { ArrowUpDown, ChevronDown, X } from 'lucide-react';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ALERT_FILTER_OPTIONS, alertLabelForId, type AlertFilterId } from './alertFilterRules';
import { cn } from './ui/utils';

export interface AlertFilterSharedProps {
  appliedIds: AlertFilterId[];
  onAppliedIdsChange: (ids: AlertFilterId[]) => void;
  alertCounts: Record<AlertFilterId, number>;
}

/** “Add Alerts” control + selection popover (row with search). */
export function AlertFilterAddControl({
  appliedIds,
  onAppliedIdsChange,
  className,
}: Pick<AlertFilterSharedProps, 'appliedIds' | 'onAppliedIdsChange'> & { className?: string }) {
  const [open, setOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<AlertFilterId[]>(appliedIds);

  useEffect(() => {
    if (open) {
      setDraftIds([...appliedIds]);
    }
  }, [open, appliedIds]);

  const toggleDraft = (id: AlertFilterId) => {
    setDraftIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleApply = () => {
    onAppliedIdsChange(draftIds);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 rounded-[4px] border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50',
            className
          )}
        >
          <CampaignOutlined sx={{ fontSize: 18 }} className="text-gray-600 shrink-0" aria-hidden />
          <span>Add Alerts</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-3">
          <div className="space-y-2.5">
            {ALERT_FILTER_OPTIONS.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`alert-${opt.id}`}
                  checked={draftIds.includes(opt.id)}
                  onCheckedChange={() => toggleDraft(opt.id)}
                />
                <Label htmlFor={`alert-${opt.id}`} className="cursor-pointer text-sm font-normal">
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
            <Button
              type="button"
              variant="ghost"
              className="h-auto px-2 py-1.5 text-sm font-semibold uppercase tracking-wide text-gray-600 hover:bg-transparent hover:text-gray-900"
              onClick={() => setDraftIds([])}
            >
              CLEAR
            </Button>
            <Button
              type="button"
              className="h-auto rounded-[4px] bg-[#1976d2] px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#1565c0]"
              onClick={handleApply}
            >
              APPLY
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Full-width row below search: “Active Alerts:” + chips (hidden when none). */
export function AlertFilterActiveChips({
  appliedIds,
  onAppliedIdsChange,
  alertCounts,
  className,
}: AlertFilterSharedProps & { className?: string }) {
  if (appliedIds.length === 0) return null;

  const removeApplied = (id: AlertFilterId) => {
    onAppliedIdsChange(appliedIds.filter((x) => x !== id));
  };

  return (
    <div className={cn('flex w-full flex-wrap items-center gap-2', className)}>
      <span className="shrink-0 text-sm text-gray-700">Active Alerts:</span>
      {appliedIds.map((id) => (
        <div
          key={id}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-sm text-gray-800"
        >
          <span className="min-w-0 truncate">
            {alertLabelForId(id)} ({alertCounts[id] ?? 0})
          </span>
          <button
            type="button"
            className="shrink-0 rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            aria-label={`Remove ${alertLabelForId(id)} filter`}
            onClick={() => removeApplied(id)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="shrink-0 text-sm font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-900"
        onClick={() => onAppliedIdsChange([])}
      >
        CLEAR ALL
      </button>
    </div>
  );
}

// ─── Rule filter components ──────────────────────────────────────────────────

export interface RuleFilterOption {
  id: string;
  name: string;
}

export function RuleFilterAddControl({
  appliedIds,
  onAppliedIdsChange,
  rules,
  className,
}: {
  appliedIds: string[];
  onAppliedIdsChange: (ids: string[]) => void;
  rules: RuleFilterOption[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>(appliedIds);

  useEffect(() => {
    if (open) setDraftIds([...appliedIds]);
  }, [open, appliedIds]);

  const toggleDraft = (id: string) => {
    setDraftIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleApply = () => {
    onAppliedIdsChange(draftIds);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 rounded-[4px] border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50',
            className
          )}
        >
          <ArrowUpDown className="h-[18px] w-[18px] text-gray-600 shrink-0" aria-hidden />
          <span>Add Rules</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4"
        align="start"
        style={{ maxHeight: 'var(--radix-popover-content-available-height)' }}
      >
        <div className="space-y-3">
          {rules.length === 0 ? (
            <p className="text-sm text-gray-500">No active rules</p>
          ) : (
            <div className="max-h-60 space-y-2.5 overflow-y-auto pr-1">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rule-${rule.id}`}
                    checked={draftIds.includes(rule.id)}
                    onCheckedChange={() => toggleDraft(rule.id)}
                  />
                  <Label htmlFor={`rule-${rule.id}`} className="cursor-pointer text-sm font-normal leading-tight">
                    {rule.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
            <Button
              type="button"
              variant="ghost"
              className="h-auto px-2 py-1.5 text-sm font-semibold uppercase tracking-wide text-gray-600 hover:bg-transparent hover:text-gray-900"
              onClick={() => setDraftIds([])}
            >
              CLEAR
            </Button>
            <Button
              type="button"
              className="h-auto rounded-[4px] bg-[#1976d2] px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#1565c0]"
              onClick={handleApply}
            >
              APPLY
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function RuleFilterActiveChips({
  appliedIds,
  onAppliedIdsChange,
  ruleCounts,
  rules,
  className,
}: {
  appliedIds: string[];
  onAppliedIdsChange: (ids: string[]) => void;
  ruleCounts: Record<string, number>;
  rules: RuleFilterOption[];
  className?: string;
}) {
  if (appliedIds.length === 0) return null;

  const nameForId = (id: string) => rules.find((r) => r.id === id)?.name ?? id;

  return (
    <div className={cn('flex w-full flex-wrap items-center gap-2', className)}>
      <span className="shrink-0 text-sm text-gray-700">Active Rules:</span>
      {appliedIds.map((id) => (
        <div
          key={id}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-sm text-gray-800"
        >
          <span className="min-w-0 truncate">
            {nameForId(id)} ({ruleCounts[id] ?? 0})
          </span>
          <button
            type="button"
            className="shrink-0 rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            aria-label={`Remove ${nameForId(id)} filter`}
            onClick={() => onAppliedIdsChange(appliedIds.filter((x) => x !== id))}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="shrink-0 text-sm font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-900"
        onClick={() => onAppliedIdsChange([])}
      >
        CLEAR ALL
      </button>
    </div>
  );
}

/** Composes add control + active chips in a column (same layout as Shipments / Consolidated). */
export default function AlertFilterTags(props: AlertFilterSharedProps & { className?: string }) {
  const { appliedIds, onAppliedIdsChange, alertCounts, className } = props;
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <AlertFilterAddControl appliedIds={appliedIds} onAppliedIdsChange={onAppliedIdsChange} />
      <AlertFilterActiveChips
        appliedIds={appliedIds}
        onAppliedIdsChange={onAppliedIdsChange}
        alertCounts={alertCounts}
      />
    </div>
  );
}
