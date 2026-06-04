import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import MuiPopover from '@mui/material/Popover';
import MuiBox from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import MuiCheckbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import svgPaths from '../imports/svg-8i0hxkhc97';
import CreateCarrierServiceTypeDrawer from './CreateCarrierServiceTypeDrawer';
import {
  CarrierServiceType,
  CST_COLUMN_VISIBILITY_KEY,
  SERVICE_LEVEL_METHOD_LABELS,
  SERVICE_LEVEL_METHOD_OPTIONS,
  SHIPPED_REPORT_METHOD_LABELS,
  SHIPPED_REPORT_METHOD_OPTIONS,
  SHIPPING_LABEL_METHOD_LABELS,
  SHIPPING_LABEL_METHOD_OPTIONS,
  ServiceLevelMethod,
  ShippedReportMethod,
  ShippingLabelMethod,
} from './carrierServiceTypes';
import { CARRIER_COMPANIES } from './carriers';

interface CarrierServiceTypesAppProps {
  records: CarrierServiceType[];
  onSave: (next: CarrierServiceType) => void;
}

interface ColumnDef {
  id: string;
  label: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'carrier_service_type_id', label: 'Carrier Service Type ID', visible: true },
  { id: 'carrier_company_number', label: 'Carrier Company #', visible: true },
  { id: 'car_company_name', label: 'Carrier Company Name', visible: true },
  { id: 'blocked_downgrade', label: 'Blocked Downgrade', visible: true },
  { id: 'service_level_method', label: 'Service Level Method', visible: true },
  { id: 'shipping_label_method', label: 'Shipping Label Method', visible: true },
  { id: 'slug', label: 'Slug', visible: true },
  { id: 'shipped_report_method', label: 'Shipped Report Method', visible: true },
];

type SortDir = 'asc' | 'desc';

interface Filters {
  carrier_company_number: number[];
  car_company_name: string[];
  blocked_downgrade: ('yes' | 'no')[];
  service_level_method: ServiceLevelMethod[];
  shipping_label_method: ShippingLabelMethod[];
  shipped_report_method: ShippedReportMethod[];
}

function loadColumnVisibility(): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(CST_COLUMN_VISIBILITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

function saveColumnVisibility(columns: ColumnDef[]) {
  try {
    const map: Record<string, boolean> = {};
    columns.forEach((c) => (map[c.id] = c.visible));
    localStorage.setItem(CST_COLUMN_VISIBILITY_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors */
  }
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  const sa = String(a ?? '');
  const sb = String(b ?? '');
  return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: 'base' });
}

const FILTERABLE_COLUMNS = new Set([
  'carrier_company_number',
  'car_company_name',
  'blocked_downgrade',
  'service_level_method',
  'shipping_label_method',
  'shipped_report_method',
]);

export default function CarrierServiceTypesApp({ records, onSave }: CarrierServiceTypesAppProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [columns, setColumns] = useState<ColumnDef[]>(() => {
    const saved = loadColumnVisibility();
    if (!saved) return DEFAULT_COLUMNS.map((c) => ({ ...c }));
    return DEFAULT_COLUMNS.map((c) => ({ ...c, visible: saved[c.id] ?? c.visible }));
  });
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const columnMenuOpen = Boolean(columnMenuAnchor);
  const [filters, setFilters] = useState<Filters>({
    carrier_company_number: [],
    car_company_name: [],
    blocked_downgrade: [],
    service_level_method: [],
    shipping_label_method: [],
    shipped_report_method: [],
  });
  const [sortBy, setSortBy] = useState<string | null>('carrier_service_type_id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [lastUpdated] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CarrierServiceType | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Debounce search ~300ms.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  useEffect(() => {
    saveColumnVisibility(columns);
  }, [columns]);

  useEffect(() => {
    if (!toast) return;
    const handle = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(handle);
  }, [toast]);

  const setColumnVisible = (id: string, visible: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };
  const resetColumnsToDefault = () => setColumns(DEFAULT_COLUMNS.map((c) => ({ ...c })));

  const visibleColumns = columns.filter((c) => c.visible);

  const handleSort = (id: string) => {
    if (sortBy !== id) {
      setSortBy(id);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortBy(null);
      setSortDir('asc');
    }
  };

  const clearAllFilters = () => {
    setFilters({
      carrier_company_number: [],
      car_company_name: [],
      blocked_downgrade: [],
      service_level_method: [],
      shipping_label_method: [],
      shipped_report_method: [],
    });
    setSearchQuery('');
  };

  // ---- filter + search ----
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (debouncedQuery) {
        const hay = [
          r.car_company_name,
          r.slug,
          r.service_level_method ? SERVICE_LEVEL_METHOD_LABELS[r.service_level_method] : '',
          r.shipping_label_method ? SHIPPING_LABEL_METHOD_LABELS[r.shipping_label_method] : '',
          r.shipped_report_method ? SHIPPED_REPORT_METHOD_LABELS[r.shipped_report_method] : '',
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(debouncedQuery)) return false;
      }
      if (filters.carrier_company_number.length > 0 && !filters.carrier_company_number.includes(r.carrier_company_number)) {
        return false;
      }
      if (filters.car_company_name.length > 0 && !filters.car_company_name.includes(r.car_company_name)) {
        return false;
      }
      if (filters.blocked_downgrade.length > 0) {
        const ok = filters.blocked_downgrade.includes(r.blocked_downgrade ? 'yes' : 'no');
        if (!ok) return false;
      }
      if (filters.service_level_method.length > 0) {
        if (!r.service_level_method || !filters.service_level_method.includes(r.service_level_method)) return false;
      }
      if (filters.shipping_label_method.length > 0) {
        if (!r.shipping_label_method || !filters.shipping_label_method.includes(r.shipping_label_method)) return false;
      }
      if (filters.shipped_report_method.length > 0) {
        if (!r.shipped_report_method || !filters.shipped_report_method.includes(r.shipped_report_method)) return false;
      }
      return true;
    });
  }, [records, debouncedQuery, filters]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortBy];
      const bv = (b as Record<string, unknown>)[sortBy];
      return dir * compareValues(av, bv);
    });
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const pageRecords = sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const hasAnyFilterActive =
    debouncedQuery.length > 0 ||
    Object.values(filters).some((arr) => (arr as unknown[]).length > 0);

  // ---- export ----
  const handleExportCSV = () => {
    const headers = [
      'carrier_service_type_id',
      'carrier_company_number',
      'car_company_name',
      'blocked_downgrade',
      'service_level_method',
      'shipping_label_method',
      'slug',
      'shipped_report_method',
    ];
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(',')];
    sorted.forEach((r) => {
      lines.push(
        [
          r.carrier_service_type_id,
          r.carrier_company_number,
          r.car_company_name,
          r.blocked_downgrade,
          r.service_level_method ?? '',
          r.shipping_label_method ?? '',
          r.slug,
          r.shipped_report_method ?? '',
        ]
          .map(escape)
          .join(','),
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carrier-service-types.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRowClick = (r: CarrierServiceType) => {
    setEditingRecord(r);
    setDrawerOpen(true);
  };

  const handleNew = () => {
    setEditingRecord(null);
    setDrawerOpen(true);
  };

  const handleSave = (next: CarrierServiceType) => {
    onSave(next);
    setToast('Carrier service type saved.');
  };

  // ---- per-column filter dropdown ----
  const renderColumnFilter = (columnId: string, label: string): React.ReactNode => {
    type Opt<V> = { value: V; label: string };
    let options: Opt<string | number>[] = [];
    let selected: (string | number)[] = [];
    let onToggle: (v: string | number) => void = () => {};
    let onClear: () => void = () => {};

    switch (columnId) {
      case 'carrier_company_number': {
        options = CARRIER_COMPANIES.map((c) => ({ value: c.number, label: `${c.number} – ${c.name}` }));
        selected = filters.carrier_company_number;
        onToggle = (v) => {
          const num = v as number;
          setFilters((prev) => ({
            ...prev,
            carrier_company_number: prev.carrier_company_number.includes(num)
              ? prev.carrier_company_number.filter((x) => x !== num)
              : [...prev.carrier_company_number, num],
          }));
          setCurrentPage(1);
        };
        onClear = () => setFilters((prev) => ({ ...prev, carrier_company_number: [] }));
        break;
      }
      case 'car_company_name': {
        options = CARRIER_COMPANIES.map((c) => ({ value: c.name, label: c.name }));
        selected = filters.car_company_name;
        onToggle = (v) => {
          const name = v as string;
          setFilters((prev) => ({
            ...prev,
            car_company_name: prev.car_company_name.includes(name)
              ? prev.car_company_name.filter((x) => x !== name)
              : [...prev.car_company_name, name],
          }));
          setCurrentPage(1);
        };
        onClear = () => setFilters((prev) => ({ ...prev, car_company_name: [] }));
        break;
      }
      case 'blocked_downgrade': {
        options = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];
        selected = filters.blocked_downgrade;
        onToggle = (v) => {
          const val = v as 'yes' | 'no';
          setFilters((prev) => ({
            ...prev,
            blocked_downgrade: prev.blocked_downgrade.includes(val)
              ? prev.blocked_downgrade.filter((x) => x !== val)
              : [...prev.blocked_downgrade, val],
          }));
          setCurrentPage(1);
        };
        onClear = () => setFilters((prev) => ({ ...prev, blocked_downgrade: [] }));
        break;
      }
      case 'service_level_method': {
        options = SERVICE_LEVEL_METHOD_OPTIONS.map((o) => ({ value: o, label: SERVICE_LEVEL_METHOD_LABELS[o] }));
        selected = filters.service_level_method;
        onToggle = (v) => {
          const val = v as ServiceLevelMethod;
          setFilters((prev) => ({
            ...prev,
            service_level_method: prev.service_level_method.includes(val)
              ? prev.service_level_method.filter((x) => x !== val)
              : [...prev.service_level_method, val],
          }));
          setCurrentPage(1);
        };
        onClear = () => setFilters((prev) => ({ ...prev, service_level_method: [] }));
        break;
      }
      case 'shipping_label_method': {
        options = SHIPPING_LABEL_METHOD_OPTIONS.map((o) => ({ value: o, label: SHIPPING_LABEL_METHOD_LABELS[o] }));
        selected = filters.shipping_label_method;
        onToggle = (v) => {
          const val = v as ShippingLabelMethod;
          setFilters((prev) => ({
            ...prev,
            shipping_label_method: prev.shipping_label_method.includes(val)
              ? prev.shipping_label_method.filter((x) => x !== val)
              : [...prev.shipping_label_method, val],
          }));
          setCurrentPage(1);
        };
        onClear = () => setFilters((prev) => ({ ...prev, shipping_label_method: [] }));
        break;
      }
      case 'shipped_report_method': {
        options = SHIPPED_REPORT_METHOD_OPTIONS.map((o) => ({ value: o, label: SHIPPED_REPORT_METHOD_LABELS[o] }));
        selected = filters.shipped_report_method;
        onToggle = (v) => {
          const val = v as ShippedReportMethod;
          setFilters((prev) => ({
            ...prev,
            shipped_report_method: prev.shipped_report_method.includes(val)
              ? prev.shipped_report_method.filter((x) => x !== val)
              : [...prev.shipped_report_method, val],
          }));
          setCurrentPage(1);
        };
        onClear = () => setFilters((prev) => ({ ...prev, shipped_report_method: [] }));
        break;
      }
      default:
        return null;
    }

    const hasFilter = selected.length > 0;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-500">
            <svg className="w-4 h-4 opacity-70" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p1ef8e700} fill="currentColor" />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 max-h-[320px] overflow-y-auto" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-normal">Filter by {label}</h4>
              {hasFilter && (
                <button onClick={onClear} className="text-xs text-blue-600 hover:text-blue-800">
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {options.map((opt) => (
                <div key={String(opt.value)} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cst-${columnId}-${opt.value}`}
                    checked={(selected as (string | number)[]).includes(opt.value)}
                    onCheckedChange={() => onToggle(opt.value)}
                  />
                  <Label htmlFor={`cst-${columnId}-${opt.value}`} className="text-sm cursor-pointer flex-1">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // ---- cell rendering ----
  const renderCell = (r: CarrierServiceType, columnId: string): React.ReactNode => {
    switch (columnId) {
      case 'carrier_service_type_id':
        return r.carrier_service_type_id;
      case 'carrier_company_number':
        return r.carrier_company_number;
      case 'car_company_name':
        return r.car_company_name;
      case 'blocked_downgrade':
        return (
          <Badge
            className={
              r.blocked_downgrade
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
            }
          >
            {r.blocked_downgrade ? 'Yes' : 'No'}
          </Badge>
        );
      case 'service_level_method':
        return r.service_level_method ? SERVICE_LEVEL_METHOD_LABELS[r.service_level_method] : '—';
      case 'shipping_label_method':
        return r.shipping_label_method ? SHIPPING_LABEL_METHOD_LABELS[r.shipping_label_method] : '—';
      case 'slug':
        return r.slug || '—';
      case 'shipped_report_method':
        return r.shipped_report_method ? SHIPPED_REPORT_METHOD_LABELS[r.shipped_report_method] : '—';
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[rgb(249,250,251)]">
      <CreateCarrierServiceTypeDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingRecord(null); }}
        onSave={handleSave}
        record={editingRecord}
        nextId={records.reduce((max, r) => Math.max(max, r.carrier_service_type_id), 0) + 1}
      />

      <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
        {/* Page Header */}
        <div className="bg-white rounded-xl p-6 shrink-0">
          <div className="flex items-start justify-between mb-[16px]">
            <div>
              <h1 className="text-3xl mb-2">Carrier Service Types</h1>
              <p className="text-gray-500">Manage carrier service type records</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleNew}
                className="bg-[#1976d2] hover:bg-[#1565c0] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Carrier Service Type
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-[360px] shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search carrier service types..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full max-w-[360px] pl-10 bg-white border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="relative flex flex-col flex-1 min-h-0">
            <div className="overflow-auto flex-1 min-h-0">
              <table className="w-full relative">
                <thead className="bg-white sticky top-0 border-b z-10">
                  <tr className="relative">
                    {visibleColumns.map((column) => {
                      const isFilterable = FILTERABLE_COLUMNS.has(column.id);
                      const isSorted = sortBy === column.id;
                      return (
                        <th
                          key={column.id}
                          className="px-4 py-4 text-left text-sm font-medium text-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSort(column.id)}
                              className="flex items-center gap-1 hover:text-gray-900"
                              aria-label={`Sort by ${column.label}`}
                            >
                              {column.label}
                              {isSorted ? (
                                sortDir === 'asc' ? (
                                  <ArrowUp className="w-5 h-5 text-[#1976d2]" />
                                ) : (
                                  <ArrowDown className="w-5 h-5 text-[#1976d2]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            {isFilterable ? renderColumnFilter(column.id, column.label) : null}
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-2 py-4 text-right w-12 align-middle">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        aria-label="Column options"
                        aria-controls={columnMenuOpen ? 'cst-columns-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={columnMenuOpen}
                        onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
                      >
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </Button>
                      <MuiPopover
                        id="cst-columns-menu"
                        anchorEl={columnMenuAnchor}
                        open={columnMenuOpen}
                        onClose={(_, reason) => {
                          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                            setColumnMenuAnchor(null);
                          }
                        }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        slotProps={{
                          paper: {
                            elevation: 8,
                            sx: { mt: 0.5, minWidth: 256, maxHeight: 400, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 1 },
                          },
                        }}
                      >
                        <MuiBox sx={{ flex: 1, minHeight: 0, overflowY: 'auto', py: 0.5 }}>
                          {columns.map((col) => (
                            <MenuItem
                              key={col.id}
                              dense
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setColumnVisible(col.id, !col.visible);
                              }}
                              sx={{ py: '2px' }}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <MuiCheckbox
                                  size="small"
                                  checked={col.visible}
                                  tabIndex={-1}
                                  disableRipple
                                  sx={{ color: 'rgba(0,0,0,0.54)', '&.Mui-checked': { color: '#1976d2' } }}
                                />
                              </ListItemIcon>
                              <ListItemText primary={col.label} primaryTypographyProps={{ variant: 'body2' }} />
                            </MenuItem>
                          ))}
                        </MuiBox>
                        <Divider sx={{ flexShrink: 0 }} />
                        <MenuItem
                          onClick={() => {
                            resetColumnsToDefault();
                            setColumnMenuAnchor(null);
                          }}
                          sx={{ py: 1, flexShrink: 0 }}
                        >
                          <ListItemText
                            primary="Reset to default"
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: 'primary' }}
                          />
                        </MenuItem>
                      </MuiPopover>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRecords.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColumns.length + 1} className="text-center p-12">
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <p className="text-base font-medium text-gray-700">No carrier service types found</p>
                          {hasAnyFilterActive ? (
                            <button
                              type="button"
                              onClick={clearAllFilters}
                              className="text-sm font-medium text-[#1976d2] hover:text-[#1565c0]"
                            >
                              Clear filters
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageRecords.map((r) => (
                      <tr
                        key={r.carrier_service_type_id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(r)}
                      >
                        {visibleColumns.map((column) => (
                          <td key={column.id} className="p-4 text-sm">
                            {renderCell(r, column.id)}
                          </td>
                        ))}
                        <td className="p-4 text-right w-12" />
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-6 px-4 py-2 border-t bg-white shrink-0">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <RefreshCw className="w-4 h-4" />
                Last Updated {lastUpdated}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Rows per page:</span>
                  <select
                    className="border rounded px-2 py-1"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <span className="text-sm text-gray-700">
                  {sorted.length === 0
                    ? '0 of 0'
                    : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, sorted.length)} of ${sorted.length}`}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage >= totalPages || sorted.length === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {toast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="pointer-events-auto flex items-center gap-2 rounded-md bg-[#101828] px-4 py-2 text-sm text-white shadow-lg">
            <CheckCircle2 className="size-4 text-green-400" />
            <span>{toast}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
