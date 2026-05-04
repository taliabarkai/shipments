import { useMemo, useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover@1.1.6';
import { Download, Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';
import svgPaths from '../imports/svg-8i0hxkhc97';
import ShipmentAlertConfigurationDrawer from './ShipmentAlertConfigurationDrawer';
import type { CreatedAlertConfiguration } from './ShipmentAlertConfigurationDrawer';
import {
  releaseLogicCsvValue,
  releaseLogicFilterValue,
  type ShipmentAlertReleaseLogic,
  type ShipmentAlertRow,
  type ShipmentAlertStatus,
} from './shipmentAlertsTypes';

export type { ShipmentAlertReleaseLogic, ShipmentAlertRow, ShipmentAlertStatus } from './shipmentAlertsTypes';
export { releaseLogicFilterValue } from './shipmentAlertsTypes';

function formatAbbrevDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Stable pseudo-random abbreviated dates for mock rows. */
function mockLastUpdated(seed: number): string {
  const month = (seed * 7) % 12;
  const day = 1 + (seed * 13) % 28;
  const year = 2025 + (seed % 3);
  return formatAbbrevDate(new Date(year, month, day));
}

const MOCK_ALERT_ROWS: Omit<ShipmentAlertRow, 'lastUpdated'>[] = [
  {
    id: '1',
    alertName: 'Not Packed',
    activationLogic: '[product_category IN ring] AND [event_level IN not_packed]',
    releaseLogic: { kind: 'manual' },
    status: 'Live',
  },
  {
    id: '2',
    alertName: 'Not Packed - Over 12 hours',
    activationLogic: '[product_category IN ring, necklace] AND [shipment_total_item_value GREATER THAN 012.00]',
    releaseLogic: { kind: 'manual' },
    status: 'Live',
  },
  {
    id: '3',
    alertName: 'Draft - Over 12 hours',
    activationLogic: '[destination_country IN US, IL] AND [event_level IN draft]',
    releaseLogic: { kind: 'status', value: 'Ready to Pack' },
    status: 'Draft',
  },
  {
    id: '4',
    alertName: 'Ready to Pack - SLA',
    activationLogic: '[shipment_service_level IN express] AND [packing_facility IN NZ]',
    releaseLogic: { kind: 'manual' },
    status: 'Live',
  },
  {
    id: '5',
    alertName: 'Carrier label pending',
    activationLogic: '[order_brand IN Myka, BrandB] AND [shipment_total_item_value GREATER THAN 024.00]',
    releaseLogic: { kind: 'status', value: 'Draft' },
    status: 'Draft',
  },
  {
    id: '6',
    alertName: 'Packed - awaiting pickup',
    activationLogic: '[order_item_sku IN Prod-001, Prod-002] AND [event_level IN packed]',
    releaseLogic: { kind: 'manual' },
    status: 'Live',
  },
  {
    id: '7',
    alertName: 'International customs hold',
    activationLogic: '[destination_country IN United Kingdom, DE] AND [packing_facility IN HU]',
    releaseLogic: { kind: 'status', value: 'Ready to Pack' },
    status: 'Draft',
  },
  {
    id: '8',
    alertName: 'High-value shipment review',
    activationLogic: '[shipment_total_item_value GREATER THAN 500.00] AND [order_brand IN OAL]',
    releaseLogic: { kind: 'status', value: 'Label issued' },
    status: 'Live',
  },
];

function buildMockAlerts(): ShipmentAlertRow[] {
  return MOCK_ALERT_ROWS.map((row, i) => ({
    ...row,
    lastUpdated: mockLastUpdated(i + 1),
  }));
}

function alertStatusChipClass(status: ShipmentAlertStatus): string {
  if (status === 'Live') return 'bg-green-100 text-green-800';
  return 'bg-gray-200 text-gray-800';
}

const COLUMNS = [
  { id: 'alertName' as const, label: 'Alert Name' },
  { id: 'activationLogic' as const, label: 'Activation Logic' },
  { id: 'releaseLogic' as const, label: 'Release logic' },
  { id: 'status' as const, label: 'Status' },
  { id: 'lastUpdated' as const, label: 'Last Updated' },
] as const;

type ColumnId = (typeof COLUMNS)[number]['id'];
type FilterableColumnKey = Exclude<ColumnId, 'lastUpdated' | 'alertName'>;

const FILTERABLE_KEYS: FilterableColumnKey[] = ['activationLogic', 'releaseLogic', 'status'];

type LastUpdatedSort = 'default' | 'earliest' | 'latest';

function cellFilterValue(row: ShipmentAlertRow, colId: FilterableColumnKey): string {
  if (colId === 'releaseLogic') return releaseLogicFilterValue(row.releaseLogic);
  return String(row[colId]);
}

function parseLastUpdatedDate(s: string): number {
  const t = Date.parse(s);
  return Number.isNaN(t) ? 0 : t;
}

export default function ShipmentAlertsApp() {
  const [alerts, setAlerts] = useState<ShipmentAlertRow[]>(() => buildMockAlerts());
  const [searchQuery, setSearchQuery] = useState('');
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<ShipmentAlertRow | null>(null);
  const [drawerNonce, setDrawerNonce] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lastUpdated] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  );

  const [filters, setFilters] = useState<Record<FilterableColumnKey, string[]>>({
    activationLogic: [],
    releaseLogic: [],
    status: [],
  });

  const [lastUpdatedSort, setLastUpdatedSort] = useState<LastUpdatedSort>('default');

  const filterOptions = useMemo(() => {
    return {
      activationLogic: Array.from(new Set(alerts.map((a) => a.activationLogic))).sort(),
      releaseLogic: Array.from(new Set(alerts.map((a) => releaseLogicFilterValue(a.releaseLogic)))).sort(),
      status: Array.from(new Set(alerts.map((a) => a.status))).sort(),
    };
  }, [alerts]);

  const toggleFilter = (key: FilterableColumnKey, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
    setCurrentPage(1);
  };

  const clearColumnFilter = (key: FilterableColumnKey) => {
    setFilters((prev) => ({ ...prev, [key]: [] }));
    setCurrentPage(1);
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((row) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!row.alertName.toLowerCase().includes(q)) return false;
      }
      for (const key of FILTERABLE_KEYS) {
        const selected = filters[key];
        if (selected.length === 0) continue;
        const cell = cellFilterValue(row, key);
        if (!selected.includes(cell)) return false;
      }
      return true;
    });
  }, [alerts, searchQuery, filters]);

  const sortedFilteredAlerts = useMemo(() => {
    const list = [...filteredAlerts];
    if (lastUpdatedSort === 'earliest') {
      list.sort((a, b) => parseLastUpdatedDate(a.lastUpdated) - parseLastUpdatedDate(b.lastUpdated));
    } else if (lastUpdatedSort === 'latest') {
      list.sort((a, b) => parseLastUpdatedDate(b.lastUpdated) - parseLastUpdatedDate(a.lastUpdated));
    }
    return list;
  }, [filteredAlerts, lastUpdatedSort]);

  const totalPages = Math.max(1, Math.ceil(sortedFilteredAlerts.length / rowsPerPage));
  const paginatedAlerts = sortedFilteredAlerts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const openCreateDrawer = () => {
    setEditingAlert(null);
    setDrawerNonce((n) => n + 1);
    setConfigDrawerOpen(true);
  };

  const openEditDrawer = (row: ShipmentAlertRow) => {
    setEditingAlert(row);
    setDrawerNonce((n) => n + 1);
    setConfigDrawerOpen(true);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) setEditingAlert(null);
    setConfigDrawerOpen(open);
  };

  const handleCreateAlert = (config: CreatedAlertConfiguration) => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `alert-${Date.now()}`;
    setAlerts((prev) => [
      ...prev,
      {
        id,
        alertName: config.alertName,
        activationLogic: config.activationLogic,
        releaseLogic: config.releaseLogic,
        status: config.status,
        lastUpdated: formatAbbrevDate(new Date()),
        startDay: config.startDay,
        endDay: config.endDay,
      },
    ]);
  };

  const handleUpdateAlert = (id: string, config: CreatedAlertConfiguration) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              alertName: config.alertName,
              activationLogic: config.activationLogic,
              releaseLogic: config.releaseLogic,
              status: config.status,
              startDay: config.startDay,
              endDay: config.endDay,
              lastUpdated: formatAbbrevDate(new Date()),
            }
          : a,
      ),
    );
  };

  const handleExportCSV = () => {
    const headers = COLUMNS.map((c) => c.label).join(',');
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows = sortedFilteredAlerts
      .map((row) =>
        COLUMNS.map((c) =>
          escape(c.id === 'releaseLogic' ? releaseLogicCsvValue(row.releaseLogic) : String(row[c.id])),
        ).join(','),
      )
      .join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipment-alerts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[rgb(249,250,251)]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6">
        <div className="shrink-0 rounded-xl bg-white p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-medium tracking-tight text-[#101828]">Shipment Alerts</h1>
              <p className="text-gray-500">Manage alert triggers for shipments</p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleExportCSV}
                className="border-[#1976d2] text-[#1976d2] hover:bg-blue-50 hover:text-[#1976d2]"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                type="button"
                onClick={openCreateDrawer}
                className="bg-[#1976d2] text-white hover:bg-[#1565c0]"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Alert
              </Button>
            </div>
          </div>
          <div className="relative w-full max-w-[360px] shrink-0">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by Alert Name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full max-w-[360px] border-gray-300 bg-white pl-10"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="relative w-full">
                <thead className="sticky top-0 z-10 border-b bg-white">
                  <tr>
                    {COLUMNS.map((column) => {
                      if (column.id === 'lastUpdated') {
                        const sortActive = lastUpdatedSort !== 'default';
                        return (
                          <th key={column.id} className="px-4 py-4 text-left text-sm font-medium text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                {column.label}
                                {sortActive && (
                                  <>
                                    <span className="ml-1 text-[#1976d2]">(1)</span>
                                    <button
                                      type="button"
                                      className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                                      onClick={() => {
                                        setLastUpdatedSort('default');
                                        setCurrentPage(1);
                                      }}
                                      aria-label="Clear Last Updated sort"
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                              </span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100"
                                    aria-label={`Sort ${column.label}`}
                                  >
                                    <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24">
                                      <path d={svgPaths.p1ef8e700} fill="currentColor" />
                                    </svg>
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-1" align="start">
                                  <div className="flex flex-col py-1">
                                    <SortMenuItem
                                      label="Sort by Last Updated"
                                      selected={lastUpdatedSort === 'default'}
                                      onSelect={() => {
                                        setLastUpdatedSort('default');
                                        setCurrentPage(1);
                                      }}
                                    />
                                    <SortMenuItem
                                      label="Sort by Earliest Date"
                                      selected={lastUpdatedSort === 'earliest'}
                                      onSelect={() => {
                                        setLastUpdatedSort('earliest');
                                        setCurrentPage(1);
                                      }}
                                    />
                                    <SortMenuItem
                                      label="Sort by Latest Date"
                                      selected={lastUpdatedSort === 'latest'}
                                      onSelect={() => {
                                        setLastUpdatedSort('latest');
                                        setCurrentPage(1);
                                      }}
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </th>
                        );
                      }

                      if (column.id === 'alertName') {
                        return (
                          <th key={column.id} className="px-4 py-4 text-left text-sm font-medium text-gray-700">
                            {column.label}
                          </th>
                        );
                      }

                      const filterKey = column.id as FilterableColumnKey;
                      const hasFilter = filters[filterKey].length > 0;
                      return (
                        <th key={column.id} className="px-4 py-4 text-left text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              {column.label}
                              {hasFilter && (
                                <>
                                  <span className="ml-1 text-[#1976d2]">({filters[filterKey].length})</span>
                                  <button
                                    type="button"
                                    className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                                    onClick={() => clearColumnFilter(filterKey)}
                                    aria-label={`Clear ${column.label} filter`}
                                  >
                                    ×
                                  </button>
                                </>
                              )}
                            </span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100"
                                  aria-label={`Filter ${column.label}`}
                                >
                                  <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24">
                                    <path d={svgPaths.p1ef8e700} fill="currentColor" />
                                  </svg>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56" align="start">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-normal">Filter by {column.label}</h4>
                                    {hasFilter && (
                                      <button
                                        type="button"
                                        onClick={() => clearColumnFilter(filterKey)}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                      >
                                        Clear
                                      </button>
                                    )}
                                  </div>
                                  <div className="max-h-64 space-y-2 overflow-y-auto">
                                    {filterOptions[filterKey].map((value) => (
                                      <div key={value} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${column.id}-${value}`}
                                          checked={filters[filterKey].includes(value)}
                                          onCheckedChange={() => toggleFilter(filterKey, value)}
                                        />
                                        <Label
                                          htmlFor={`${column.id}-${value}`}
                                          className="flex-1 cursor-pointer text-sm leading-snug"
                                        >
                                          {value}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paginatedAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        No alert configurations match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedAlerts.map((row) => (
                      <tr
                        key={row.id}
                        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => openEditDrawer(row)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openEditDrawer(row);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Edit alert: ${row.alertName}`}
                      >
                        <td className="px-4 py-3 text-sm text-[#101828]">{row.alertName}</td>
                        <td className="max-w-md px-4 py-3 text-sm text-gray-700">
                          <LogicExpression text={row.activationLogic} />
                        </td>
                        <td className="max-w-xs px-4 py-3 text-sm text-gray-700">
                          <ReleaseLogicCell logic={row.releaseLogic} />
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-[8px] px-2.5 py-0.5 text-xs font-medium ${alertStatusChipClass(row.status)}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.lastUpdated}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-6 border-t bg-white px-4 py-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <RefreshCw className="h-4 w-4" />
                Last Updated at {lastUpdated}
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Rows per page:</span>
                  <select
                    className="rounded border px-2 py-1"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <span className="text-sm text-gray-700">
                  {sortedFilteredAlerts.length === 0
                    ? '0 of 0'
                    : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, sortedFilteredAlerts.length)} of ${sortedFilteredAlerts.length}`}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={currentPage >= totalPages || sortedFilteredAlerts.length === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShipmentAlertConfigurationDrawer
        key={`${editingAlert?.id ?? 'new'}-${drawerNonce}`}
        open={configDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        editingAlert={editingAlert}
        onCreate={handleCreateAlert}
        onUpdate={handleUpdateAlert}
      />
    </div>
  );
}

function SortMenuItem({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <PopoverPrimitive.Close asChild>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'w-full rounded-sm px-2 py-2 text-left text-sm transition-colors',
          selected ? 'bg-blue-50 font-medium text-[#1976d2]' : 'text-gray-800 hover:bg-gray-100',
        )}
      >
        {label}
      </button>
    </PopoverPrimitive.Close>
  );
}

/** Longest-first so NOT IN wins over IN, etc. */
const ACTIVATION_OPERATORS = [
  'NOT IN',
  'GREATER OR EQUAL',
  'LESS OR EQUAL',
  'GREATER THAN',
  'LESS THAN',
  'IS',
  'IN',
] as const;

function parseActivationClause(raw: string): { field: string; operator: string; value: string } | null {
  let inner = raw.trim();
  if (inner.startsWith('[')) inner = inner.slice(1);
  if (inner.endsWith(']')) inner = inner.slice(0, -1);
  inner = inner.trim();
  if (!inner) return null;

  const hi = inner.toUpperCase();
  for (const op of ACTIVATION_OPERATORS) {
    const needle = ` ${op} `;
    const idx = hi.indexOf(needle);
    if (idx === -1) continue;
    const field = inner.slice(0, idx).trim();
    const opStart = idx + 1;
    const opEnd = opStart + op.length;
    const operator = inner.slice(opStart, opEnd).trim();
    const value = inner.slice(opEnd + 1).trim();
    if (field && operator) return { field, operator, value };
  }
  return null;
}

function ActivationClauseChip({ segment }: { segment: string }) {
  const parsed = parseActivationClause(segment);
  if (!parsed) {
    const fallback = segment.replace(/^\[/, '').replace(/\]$/, '').trim();
    return (
      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-sans text-[11px] font-normal leading-snug text-[#101828]">
        {fallback}
      </span>
    );
  }
  return (
    <span className="inline-flex max-w-full flex-wrap items-baseline gap-x-1 rounded-md bg-slate-100 px-2 py-0.5 font-sans text-[11px] leading-snug">
      <span className="shrink-0 text-gray-500">{parsed.field}</span>
      <span className="min-w-0 text-[#101828]">
        <span className="font-semibold">{parsed.operator}</span>
        {parsed.value ? <span>{` ${parsed.value}`}</span> : null}
      </span>
    </span>
  );
}

function splitActivationSegments(text: string): { segments: string[]; joiners: string[] } {
  const s = text.trim();
  const re = /\s+(BUT NOT|AND|OR)\s+/gi;
  const segments: string[] = [];
  const joiners: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const chunk = s.slice(last, m.index).trim();
    if (chunk) segments.push(chunk);
    const j = m[1].toUpperCase();
    joiners.push(j === 'BUT NOT' ? 'BUT NOT' : j);
    last = m.index + m[0].length;
  }
  const tail = s.slice(last).trim();
  if (tail) segments.push(tail);
  return { segments, joiners };
}

/** Renders activation clauses with AND / OR / BUT NOT joiners; field muted, operator bold, value primary. */
function LogicExpression({ text }: { text: string }) {
  const { segments, joiners } = splitActivationSegments(text);
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 leading-relaxed">
      {segments.map((seg, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 ? (
            <span className="text-xs font-semibold uppercase text-[#1976d2]">{joiners[i - 1]}</span>
          ) : null}
          <ActivationClauseChip segment={seg} />
        </span>
      ))}
    </span>
  );
}

function ReleaseLogicCell({ logic }: { logic: ShipmentAlertReleaseLogic }) {
  if (logic.kind === 'manual') {
    return <span className="text-sm text-[#101828]">Manual</span>;
  }
  return (
    <span className="text-sm text-[#101828]">
      Status — {logic.value}
    </span>
  );
}
