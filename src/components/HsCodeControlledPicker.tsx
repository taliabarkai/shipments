import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { HS_CODE_OPTIONS } from './shippingCatalogModel';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';
export type HsCodePickerVariant = 'catalogTable' | 'form';

const CATALOG_TABLE_TRIGGER_CLASS = cn(
  'flex w-full min-w-0 items-center justify-between gap-2 rounded-[6px] border border-gray-200 bg-white px-2.5 py-1.5 text-left text-xs text-[#101828] transition-colors',
  'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-1',
);

const FORM_TRIGGER_CLASS = cn(
  'flex h-10 min-h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-[#101828] transition-colors',
  'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-1',
);

export function HsCodeControlledPicker({
  value,
  onChange,
  variant = 'catalogTable',
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (code: string) => void;
  variant?: HsCodePickerVariant;
  'aria-label': string;
}) {
  const [open, setOpen] = useState(false);
  const [listQuery, setListQuery] = useState('');

  const selectedOption = useMemo(() => [...HS_CODE_OPTIONS].find((o) => o.code === value), [value]);

  const filteredOptions = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    if (!q) return [...HS_CODE_OPTIONS];
    return HS_CODE_OPTIONS.filter(
      (o) => o.code.toLowerCase().includes(q) || o.description.toLowerCase().includes(q),
    );
  }, [listQuery]);

  useEffect(() => {
    if (!open) setListQuery('');
  }, [open]);

  const triggerTitle = selectedOption ? `${selectedOption.code} \u2014 ${selectedOption.description}` : value;

  const triggerBase = variant === 'form' ? FORM_TRIGGER_CLASS : CATALOG_TABLE_TRIGGER_CLASS;
  const triggerMono = variant === 'form' ? 'font-mono text-sm' : 'font-mono text-xs';
  const triggerSans = variant === 'form' ? 'font-sans text-sm' : 'font-sans text-xs';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={triggerTitle}
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(triggerBase, open && 'bg-gray-50 ring-1 ring-gray-200')}
        >
          <span className="min-w-0 flex-1 overflow-hidden text-left">
            {selectedOption ? (
              <span className="block min-w-0 truncate font-normal leading-snug text-[#101828]">
                <span className={triggerMono}>{selectedOption.code}</span>
                <span className={triggerSans}>{` \u2014 ${selectedOption.description}`}</span>
              </span>
            ) : value ? (
              <span className={cn('block min-w-0 truncate font-normal leading-snug text-[#101828]', triggerMono)}>
                {value}
              </span>
            ) : (
              <span className={cn('block min-w-0 truncate font-normal leading-snug text-muted-foreground', triggerSans)}>
                Select HS code
              </span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-600" strokeWidth={2} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="flex w-max max-w-[min(440px,calc(100vw-1.5rem))] min-w-[220px] flex-col overflow-hidden rounded-[8px] border border-gray-200 bg-white p-0 text-left shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full self-stretch border-b border-gray-100 p-2">
          <div className="relative w-full min-w-0">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <Input
              placeholder="Search HS codes by code or description"
              value={listQuery}
              onChange={(e) => setListQuery(e.target.value)}
              className="h-9 w-full min-w-0 border-gray-200 pl-9 text-sm"
              aria-label="Search HS codes by code or description"
            />
          </div>
        </div>
        <div
          className="max-h-[min(18rem,50vh)] min-w-0 w-full overflow-x-auto overflow-y-auto p-1"
          role="listbox"
          aria-label="HS codes"
        >
          {filteredOptions.map((opt) => {
            const selected = value === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={selected}
                title={`${opt.code} ${opt.description}`}
                className={cn(
                  'flex w-full min-w-0 flex-row flex-nowrap items-center justify-between gap-2 rounded-[6px] px-2 py-2 text-left transition-colors',
                  selected ? 'bg-blue-50' : 'hover:bg-gray-50',
                )}
                onClick={() => {
                  onChange(opt.code);
                  setOpen(false);
                }}
              >
                <span className="flex min-w-0 flex-1 items-baseline gap-1 overflow-hidden">
                  <span className="shrink-0 whitespace-nowrap font-mono text-[12px] font-normal leading-snug text-[#1976d2]">
                    {opt.code}
                  </span>
                  <span className="min-w-0 truncate text-left text-[12px] font-normal leading-snug text-gray-700">
                    {opt.description}
                  </span>
                </span>
                {selected ? (
                  <Check className="h-4 w-4 shrink-0 text-[#1976d2]" aria-hidden />
                ) : (
                  <span className="inline-flex h-4 w-4 shrink-0" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex w-full flex-row items-center justify-between gap-2 border-t border-gray-100 px-3 py-2 text-left text-xs font-normal text-gray-500">
          <span className="min-w-0 shrink">
            {filteredOptions.length} of {HS_CODE_OPTIONS.length} codes
          </span>
          <span className="shrink-0 text-right">Managed in Shipping</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
