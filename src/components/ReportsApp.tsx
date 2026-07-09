import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import Insights from '@mui/icons-material/Insights';
import SummarizeOutlined from '@mui/icons-material/SummarizeOutlined';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import svgPaths from '../imports/svg-8i0hxkhc97';
import {
  REPORTS,
  SITE_OPTIONS,
  getReportById,
  getReportColumns,
} from './reportsConfig';
import type { ColumnDef, ReportConfig } from './reportsConfig';

interface GeneratedExport {
  id: string;
  report: ReportConfig;
  columns: ColumnDef[];
  rows: Record<string, string>[];
  dateRange: string;
  sites: string;
  generatedAt: string;
  rowCount: number;
  /** Snapshot of the parameters used, to detect when a regenerate is needed. */
  paramsKey: string;
}

/** Selectable site options (excludes the "All sites" summary pseudo-option). */
const NAMED_SITES = SITE_OPTIONS.filter((s) => s.value !== 'all');
/** Sentinel value for the select-all row inside the Site IDs dropdown. */
const ALL_SITES_VALUE = '__all__';

/** Toggle the Current Export / Recent Exports pill tabs (hidden for now). */
const SHOW_RESULT_TABS = false;

const SECTION_LABEL_SX = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: 'text.secondary',
} as const;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.75, color: 'rgba(0,0,0,0.87)' }}>
      {children}
    </Typography>
  );
}

/** Free-text identity columns (customer name, address, zip) aren't worth filtering. */
function isColumnFilterable(col: ColumnDef): boolean {
  const k = col.key.toLowerCase();
  const label = col.label.toLowerCase();
  if (k === 'name' || k === 'customername') return false;
  if (k.includes('address')) return false;
  if (k.includes('zip') || label.includes('post code')) return false;
  return true;
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Synthesize a mock cell value for a column. STATIC "always X" notes become the
 * constant; STATIC/UNKNOWN "leave empty" or TBD sources render blank (per spec,
 * UNKNOWN columns are blocked on source confirmation and left empty).
 */
function mockCellValue(col: ColumnDef, i: number): string {
  if (col.source === 'UNKNOWN') return '';
  if (col.source === 'STATIC') {
    const m = col.notes?.match(/always\s+"?([^"]+?)"?\.?$/i);
    return m ? m[1].trim() : '';
  }
  if (col.source === 'OCS') return i % 4 === 0 ? 'Yes' : '';

  const k = col.key.toLowerCase();
  const label = col.label.toLowerCase();
  if (label === 'web site' || k === 'website') return ['OAL', 'TGR', 'LAL', 'IB'][i % 4];
  if (k.includes('email')) return `customer${i + 1}@example.com`;
  if (k.includes('phone')) return `+1-555-${String(1000 + ((i * 37) % 9000)).padStart(4, '0')}`;
  if (k.includes('zip') || label.includes('zip') || label.includes('post code'))
    return String(10000 + ((i * 53) % 89999));
  if (k.includes('tracking') || k.includes('shippingnumber') || k.includes('barcode'))
    return `TRK${100000000 + i * 7}`;
  if (k.includes('orderid') || k === 'id' || k === 'orderno' || k.includes('ordernumber') || label.includes('order id') || label.includes('order number'))
    return `2731${34000 + i}`;
  if (k.includes('containerid')) return `CON-${5000 + i}`;
  if (k.includes('transaction') || k.includes('invoice')) return `INV-${900000 + i}`;
  if (k.includes('date')) return dayjs('2026-07-01').add(i % 20, 'day').format('YYYY-MM-DD');
  if (k === 'time') return '14:30';
  if (k.includes('country')) return ['US', 'GB', 'DE', 'IL', 'CA'][i % 5];
  if (k.includes('state')) return ['NY', 'CA', 'TX', 'FL'][i % 4];
  if (k.includes('city')) return ['New York', 'London', 'Berlin', 'Tel Aviv'][i % 4];
  if (k.includes('address') || k === 'shippingaddress') return `${100 + i} Main St`;
  if (k.includes('currency')) return ['$', '£', '€'][i % 3];
  if (k.includes('rate')) return (3.6 + (i % 10) / 100).toFixed(2);
  if (k.includes('quantity') || k.includes('volume') || k.includes('parcelcount')) return String(1 + (i % 5));
  if (k.includes('weight')) return '0.05';
  if (k.includes('sku') || k.includes('productcode')) return `SKU-${1000 + (i % 200)}`;
  if (k.includes('hscode') || k.includes('htscode')) return '7117.19';
  if (k.includes('material')) return ['Brass', 'Silver', 'Gold-plated', ''][i % 4];
  if (
    k.includes('price') || k.includes('cost') || k.includes('amount') || k.includes('value') ||
    k.includes('vat') || k.includes('tax') || k.includes('discount') || k.includes('total') ||
    k.includes('compensation') || k.includes('refund')
  )
    return (10 + ((i * 13) % 490) + 0.99).toFixed(2);
  if (k.includes('carrier') || k.includes('courier') || k.includes('shippingname') || k.includes('shippingmethod'))
    return ['FedEx', 'USPS', 'DHL', 'Mailog'][i % 4];
  if (k.includes('name')) return ['Avery Kim', 'Jordan Lee', 'Morgan Blake', 'Sam Doe'][i % 4];
  if (k.includes('eta')) return dayjs('2026-07-10').add(i % 10, 'day').format('YYYY-MM-DD');
  if (k === 'ismerukz') return i % 3 === 0 ? 'Merukzaim' : 'Bulk';
  if (k.includes('event')) return `EVT-${200 + (i % 50)}`;
  return `${col.label} ${i + 1}`;
}

function generateRows(columns: ColumnDef[], rowCount: number): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  for (let i = 0; i < rowCount; i += 1) {
    const row: Record<string, string> = {};
    for (const col of columns) row[col.key] = mockCellValue(col, i);
    rows.push(row);
  }
  return rows;
}

function buildCsv(exp: GeneratedExport): string {
  const header = exp.columns.map((c) => csvEscape(c.label)).join(',');
  const body = exp.rows
    .map((row) => exp.columns.map((c) => csvEscape(row[c.key] ?? '')).join(','))
    .join('\n');
  return `${header}\n${body}`;
}

function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Seed the Recent Exports list so it always shows a realistic history. */
function buildSeedExports(): GeneratedExport[] {
  const seeds = [
    { id: 'aftership', dateRange: '07/01/2026 – 07/08/2026', sites: 'All sites (8)', generatedAt: 'Jul 8, 4:02 PM', rowCount: 128 },
    { id: 'cs-eta', dateRange: '07/01/2026 – 07/08/2026', sites: 'OAL, TGR', generatedAt: 'Jul 8, 1:47 PM', rowCount: 96 },
    { id: 'fedex-hu-customs', dateRange: '06/24/2026 – 07/01/2026', sites: 'All sites (8)', generatedAt: 'Jul 7, 6:30 PM', rowCount: 64 },
    { id: 'hungary-non-eu', dateRange: '06/24/2026 – 07/01/2026', sites: 'IB', generatedAt: 'Jul 7, 11:05 AM', rowCount: 150 },
    { id: 'mailog-il-us', dateRange: '06/17/2026 – 06/24/2026', sites: 'All sites (8)', generatedAt: 'Jul 6, 3:22 PM', rowCount: 112 },
    { id: 'multiple-shipment-items', dateRange: '06/17/2026 – 06/24/2026', sites: 'LAL, MNN', generatedAt: 'Jul 6, 9:10 AM', rowCount: 80 },
    { id: 'usps-item-detail', dateRange: '06/10/2026 – 06/17/2026', sites: 'All sites (8)', generatedAt: 'Jul 5, 5:48 PM', rowCount: 137 },
    { id: 'vat-eu-order', dateRange: '06/10/2026 – 06/17/2026', sites: 'All sites (8)', generatedAt: 'Jul 4, 2:33 PM', rowCount: 54 },
  ];
  return seeds.map((s, idx) => {
    const report = getReportById(s.id)!;
    const columns = getReportColumns(s.id);
    return {
      id: `seed-${idx}`,
      report,
      columns,
      rows: generateRows(columns, s.rowCount),
      dateRange: s.dateRange,
      sites: s.sites,
      generatedAt: s.generatedAt,
      rowCount: s.rowCount,
      paramsKey: `seed-${idx}`,
    };
  });
}

/** Prototype: no backend, so simulate POST /api/reports/generate and return a row count. */
function mockGenerate(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(50 + Math.floor(Math.random() * 450)), 900);
  });
}

export default function ReportsApp() {
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(() => dayjs().subtract(7, 'day'));
  const [dateTo, setDateTo] = useState<Dayjs | null>(() => dayjs().add(1, 'day'));
  const [selectedSites, setSelectedSites] = useState<string[]>(() => NAMED_SITES.map((s) => s.value));
  const [extraFilterValue, setExtraFilterValue] = useState('');

  const [errors, setErrors] = useState({ report: false, from: false, to: false });
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentExport, setCurrentExport] = useState<GeneratedExport | null>(null);
  const [recentExports, setRecentExports] = useState<GeneratedExport[]>(() => buildSeedExports());
  const [activeTab, setActiveTab] = useState<'current' | 'recent'>('current');
  const [lastUpdated] = useState(() => dayjs().format('h:mm A'));

  // Generated-table state (sort / column filters / pagination).
  const [tableFilters, setTableFilters] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [tablePage, setTablePage] = useState(1);
  const [tableRowsPerPage, setTableRowsPerPage] = useState(25);

  const report = getReportById(reportType);
  const allSitesSelected = selectedSites.length === NAMED_SITES.length;
  const siteLabel = allSitesSelected
    ? 'All sites (8)'
    : selectedSites.length === 0
      ? 'None'
      : selectedSites.join(', ');

  const currentParamsKey = JSON.stringify({
    reportType,
    from: dateFrom ? dateFrom.format('YYYY-MM-DD') : '',
    to: dateTo ? dateTo.format('YYYY-MM-DD') : '',
    sites: [...selectedSites].sort(),
    extra: extraFilterValue,
  });
  const isDirty = currentExport ? currentExport.paramsKey !== currentParamsKey : false;

  // Clear the shown table as soon as any report field changes — the displayed
  // data no longer matches the selected parameters until the user regenerates.
  useEffect(() => {
    setCurrentExport((prev) => (prev && prev.paramsKey !== currentParamsKey ? null : prev));
  }, [currentParamsKey]);

  const handleReportChange = (value: string) => {
    setReportType(value);
    setErrors((prev) => ({ ...prev, report: false }));
    const next = getReportById(value);
    setExtraFilterValue(next?.extraFilter?.options[0] ?? '');
  };

  const handleSiteChange = (value: string[]) => {
    if (value.includes(ALL_SITES_VALUE)) {
      setSelectedSites((prev) => (prev.length === NAMED_SITES.length ? [] : NAMED_SITES.map((s) => s.value)));
      return;
    }
    setSelectedSites(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (generating || !reportType || (currentExport && !isDirty)) return;
    void handleGenerate();
  };

  const handleClearAll = () => {
    setReportType('');
    setDateFrom(dayjs().subtract(7, 'day'));
    setDateTo(dayjs().add(1, 'day'));
    setSelectedSites(NAMED_SITES.map((s) => s.value));
    setExtraFilterValue('');
    setErrors({ report: false, from: false, to: false });
    setErrorMsg('');
    setCurrentExport(null);
  };

  const openExport = (exp: GeneratedExport) => {
    setCurrentExport(exp);
    setTableFilters({});
    setSort(null);
    setTablePage(1);
    setActiveTab('current');
  };

  const handleGenerate = async () => {
    const nextErrors = { report: !reportType, from: !dateFrom, to: !dateTo };
    setErrors(nextErrors);
    if (nextErrors.report || nextErrors.from || nextErrors.to || !report) return;

    setGenerating(true);
    setErrorMsg('');
    const from = dateFrom!.format('YYYY-MM-DD');
    try {
      // Prototype: POST /api/reports/generate is mocked (no backend in this app).
      const rowCount = await mockGenerate();
      const columns = getReportColumns(report.id);
      const exp: GeneratedExport = {
        id: `${Date.now()}-${rowCount}`,
        report,
        columns,
        rows: generateRows(columns, rowCount),
        dateRange: `${dateFrom!.format('MM/DD/YYYY')} – ${dateTo!.format('MM/DD/YYYY')}`,
        sites: siteLabel,
        generatedAt: dayjs().format('MMM D, h:mm A'),
        rowCount,
        paramsKey: currentParamsKey,
      };
      setRecentExports((prev) => [exp, ...prev]);
      openExport(exp);
    } catch {
      setErrorMsg('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
    setTablePage(1);
  };

  const toggleFilterValue = (key: string, value: string) => {
    setTableFilters((prev) => {
      const cur = prev[key] ?? [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, [key]: next };
    });
    setTablePage(1);
  };

  const clearFilter = (key: string) => setTableFilters((prev) => ({ ...prev, [key]: [] }));

  // --- Derived table data (safe when no export: empty arrays) ---
  const columns = currentExport?.columns ?? [];
  const allRows = currentExport?.rows ?? [];
  const filteredRows = allRows.filter((row) =>
    columns.every((c) => {
      const f = tableFilters[c.key];
      return !f || f.length === 0 || f.includes(row[c.key] ?? '');
    }),
  );
  const sortedRows = sort
    ? [...filteredRows].sort((a, b) => {
        const cmp = (a[sort.key] ?? '').localeCompare(b[sort.key] ?? '', undefined, { numeric: true });
        return sort.dir === 'asc' ? cmp : -cmp;
      })
    : filteredRows;
  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / tableRowsPerPage));
  const pageRows = sortedRows.slice((tablePage - 1) * tableRowsPerPage, tablePage * tableRowsPerPage);

  const uniqueValues = (key: string) =>
    Array.from(new Set(allRows.map((r) => r[key] ?? ''))).filter((v) => v !== '').sort();

  const showTablePagination = activeTab === 'current' && !!currentExport;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex-1 flex flex-col overflow-hidden bg-[rgb(249,250,251)]">
        <div className="flex-1 flex flex-col gap-4 overflow-hidden p-6">
          {/* Header + report parameters */}
          <div className="bg-white rounded-xl p-6 shrink-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl mb-2">Reports</h1>
                <p className="text-gray-500">Generate and export operational reports across brands</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {currentExport && (
                  <Button
                    variant="outlined"
                    onClick={() => downloadCsv(buildCsv(currentExport), `${currentExport.report.id}.csv`)}
                    startIcon={<FileDownloadOutlined fontSize="small" />}
                  >
                    Export CSV
                  </Button>
                )}
              </div>
            </div>

            {/* Single-row parameters — Enter submits (generates). */}
            <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-3">
              <Box sx={{ width: 300 }}>
                <FieldLabel>Report</FieldLabel>
                <FormControl fullWidth size="small" error={errors.report} required>
                  <Select
                    value={reportType}
                    displayEmpty
                    onChange={(e) => handleReportChange(e.target.value as string)}
                    renderValue={(val) =>
                      val ? (
                        getReportById(val as string)?.name
                      ) : (
                        <span style={{ color: 'rgba(0,0,0,0.4)' }}>Select report</span>
                      )
                    }
                  >
                    {REPORTS.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ width: 180 }}>
                <FieldLabel>From</FieldLabel>
                <DatePicker
                  value={dateFrom}
                  onChange={(v) => {
                    setDateFrom(v);
                    setErrors((prev) => ({ ...prev, from: false }));
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: errors.from,
                      helperText: errors.from ? 'Required' : '',
                    },
                  }}
                />
              </Box>

              <Box sx={{ width: 180 }}>
                <FieldLabel>To</FieldLabel>
                <DatePicker
                  value={dateTo}
                  onChange={(v) => {
                    setDateTo(v);
                    setErrors((prev) => ({ ...prev, to: false }));
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: errors.to,
                      helperText: errors.to ? 'Required' : '',
                    },
                  }}
                />
              </Box>

              <Box sx={{ width: 220 }}>
                <FieldLabel>Site IDs</FieldLabel>
                <FormControl fullWidth size="small">
                  <Select
                    multiple
                    value={selectedSites}
                    onChange={(e) => handleSiteChange(e.target.value as string[])}
                    renderValue={(selected) => {
                      const arr = selected as string[];
                      if (arr.length === NAMED_SITES.length) return 'All sites (8)';
                      if (arr.length === 0) return <span style={{ color: 'rgba(0,0,0,0.4)' }}>No sites</span>;
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {arr.map((v) => (
                            <Chip
                              key={v}
                              size="small"
                              label={v}
                              onMouseDown={(e) => e.stopPropagation()}
                              onDelete={() => setSelectedSites((prev) => prev.filter((x) => x !== v))}
                            />
                          ))}
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value={ALL_SITES_VALUE}>
                      <span style={{ pointerEvents: 'none', display: 'inline-flex', marginRight: 12 }}>
                        <Checkbox checked={allSitesSelected} tabIndex={-1} />
                      </span>
                      All sites (8)
                    </MenuItem>
                    {NAMED_SITES.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        <span style={{ pointerEvents: 'none', display: 'inline-flex', marginRight: 12 }}>
                          <Checkbox checked={selectedSites.includes(s.value)} tabIndex={-1} />
                        </span>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Dynamic extra filter — only when the selected report defines one. */}
              {report?.extraFilter && (
                <Box sx={{ width: 200 }}>
                  <FieldLabel>{report.extraFilter.label}</FieldLabel>
                  <FormControl fullWidth size="small">
                    <Select
                      value={extraFilterValue}
                      onChange={(e) => setExtraFilterValue(e.target.value as string)}
                    >
                      {report.extraFilter.options.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* Generate / Regenerate + Clear All — sit at the end of the filter row. */}
              <Box sx={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleGenerate}
                  disabled={generating || !reportType || (!!currentExport && !isDirty)}
                  sx={{ height: 40 }}
                  startIcon={
                    generating ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Insights fontSize="small" />
                    )
                  }
                >
                  {generating ? 'Generating…' : currentExport ? 'Regenerate' : 'GENERATE'}
                </Button>
                {currentExport && (
                  <Button variant="text" onClick={handleClearAll} sx={{ height: 40 }}>
                    Clear All
                  </Button>
                )}
              </Box>
            </form>

            {errorMsg && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMsg}
              </Alert>
            )}
          </div>

          {/* Pill tabs between the parameters and results sections. Hidden for now — may return. */}
          {SHOW_RESULT_TABS && (
            <div className="flex items-center gap-2 shrink-0">
              {([
                { value: 'current', label: 'Current Export' },
                { value: 'recent', label: 'Recent Exports' },
              ] as const).map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    activeTab === tab.value
                      ? 'bg-[#1976d2] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Results section */}
          <div className="bg-white rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 overflow-auto">
              {activeTab === 'current' ? (
                currentExport ? (
                  <table className="w-full relative">
                    <thead className="bg-white sticky top-0 border-b z-10">
                      <tr>
                        {columns.map((col) => {
                          const active = tableFilters[col.key]?.length > 0;
                          const filterable = isColumnFilterable(col) && uniqueValues(col.key).length > 0;
                          return (
                            <th
                              key={col.key}
                              className="px-4 py-4 text-left text-sm font-medium text-gray-700 bg-white"
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleSort(col.key)}
                                  className="flex items-center gap-1 hover:text-gray-900"
                                >
                                  <span className="whitespace-nowrap">{col.label}</span>
                                </button>
                                {filterable && active && (
                                  <span className="flex items-center gap-1">
                                    <span className="text-[#1976d2]">({tableFilters[col.key].length})</span>
                                    <X
                                      className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearFilter(col.key);
                                      }}
                                    />
                                  </span>
                                )}
                                {filterable && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-500">
                                      <svg className="w-4 h-4 opacity-70" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                                        <path d={svgPaths.p1ef8e700} fill="currentColor" />
                                      </svg>
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-56" align="start">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-normal">Filter by {col.label}</h4>
                                        {active && (
                                          <button
                                            onClick={() => clearFilter(col.key)}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                          >
                                            Clear
                                          </button>
                                        )}
                                      </div>
                                      <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {uniqueValues(col.key).length === 0 ? (
                                          <p className="text-xs text-gray-400">No values</p>
                                        ) : (
                                          uniqueValues(col.key).map((value) => (
                                            <div key={value} className="flex items-center space-x-2">
                                              <Checkbox
                                                id={`${col.key}-${value}`}
                                                checked={tableFilters[col.key]?.includes(value) ?? false}
                                                onCheckedChange={() => toggleFilterValue(col.key, value)}
                                              />
                                              <Label
                                                htmlFor={`${col.key}-${value}`}
                                                className="text-sm cursor-pointer flex-1"
                                              >
                                                {value}
                                              </Label>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                          {columns.map((col) => (
                            <td key={col.key} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {row[col.key] || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                    <SummarizeOutlined sx={{ fontSize: 72, color: 'rgba(0,0,0,0.18)' }} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Select a report and click Generate to see results here
                    </Typography>
                  </div>
                )
              ) : recentExports.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">No reports generated yet</Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Report</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date range</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Sites</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Generated</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Rows
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentExports.map((exp) => (
                      <TableRow key={exp.id} hover sx={{ cursor: 'pointer' }} onClick={() => openExport(exp)}>
                        <TableCell>{exp.report.name}</TableCell>
                        <TableCell>{exp.dateRange}</TableCell>
                        <TableCell>{exp.sites}</TableCell>
                        <TableCell>{exp.generatedAt}</TableCell>
                        <TableCell align="right">{exp.rowCount.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            aria-label={`Download ${exp.report.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadCsv(buildCsv(exp), `${exp.report.id}.csv`);
                            }}
                          >
                            <FileDownloadOutlined fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Footer — Last updated + (when viewing a generated table) pagination. */}
            <div className="flex items-center justify-between gap-6 px-4 py-2 border-t bg-white shrink-0">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <RefreshCw className="w-4 h-4" />
                Last updated at {lastUpdated}
              </div>
              {showTablePagination && (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Rows per page:</span>
                    <select
                      className="border rounded px-2 py-1"
                      value={tableRowsPerPage}
                      onChange={(e) => {
                        setTableRowsPerPage(Number(e.target.value));
                        setTablePage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <span className="text-sm text-gray-700">
                    {totalRows === 0 ? 0 : (tablePage - 1) * tableRowsPerPage + 1}-
                    {Math.min(tablePage * tableRowsPerPage, totalRows)} of {totalRows}
                  </span>
                  <div className="flex gap-1">
                    <button
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
                      disabled={tablePage === 1}
                      onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
                      disabled={tablePage >= totalPages}
                      onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
}
