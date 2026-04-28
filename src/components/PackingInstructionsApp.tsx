import { useMemo, useState } from 'react';
import { Download, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import CreatePackingInstructionDrawer from './CreatePackingInstructionDrawer';
import type {
  PackingInstructionRow,
  PackingInstructionScopeTab,
  PackingInstructionStatus,
} from './packingInstructionsTypes';

function formatDisplayDate(iso: string): string {
  if (!iso.trim()) return '';
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusChipClass(status: PackingInstructionStatus): string {
  if (status === 'Live') return 'bg-green-100 text-green-800';
  return 'bg-gray-200 text-gray-800';
}

function emptyDateCell() {
  return <span className="text-gray-400">—</span>;
}

const MOCK_ROWS: PackingInstructionRow[] = [
  {
    id: 'pi-1',
    instructionName: 'Rings - over $200',
    displayLevel: 'Item',
    startDate: '2026-01-01',
    endDate: '',
    status: 'Live',
    activationLogic: '[total_item_value GREATER THAN 200]',
    contentEn: 'Handle with care.',
    contentHe: '',
    contentAr: '',
    contentHu: '',
    contentTh: '',
  },
  {
    id: 'pi-2',
    instructionName: 'Orders over $500',
    displayLevel: 'Shipment',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    status: 'Live',
    activationLogic: '[total_item_value GREATER THAN 500]',
    contentEn: 'Verify insurance.',
    contentHe: '',
    contentAr: '',
    contentHu: '',
    contentTh: '',
  },
  {
    id: 'pi-3',
    instructionName: 'Bracelets',
    displayLevel: 'Item',
    startDate: '',
    endDate: '',
    status: 'Draft',
    activationLogic: '[product_category IN Bracelets]',
    contentEn: 'Use small pouch.',
    contentHe: '',
    contentAr: '',
    contentHu: '',
    contentTh: '',
  },
  {
    id: 'pi-4',
    instructionName: 'High-value shipment',
    displayLevel: 'Shipment',
    startDate: '2026-02-01',
    endDate: '',
    status: 'Draft',
    activationLogic: '[total_item_value GREATER THAN 1000]',
    contentEn: 'Manager sign-off required.',
    contentHe: '',
    contentAr: '',
    contentHu: '',
    contentTh: '',
  },
];

const SCOPE_TABS: { id: PackingInstructionScopeTab; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'Live', label: 'Live' },
  { id: 'Draft', label: 'Draft' },
  { id: 'Item', label: 'Item Level' },
  { id: 'Shipment', label: 'Shipment Level' },
];

function rowMatchesScope(row: PackingInstructionRow, scope: PackingInstructionScopeTab): boolean {
  if (scope === 'All') return true;
  if (scope === 'Live' || scope === 'Draft') return row.status === scope;
  if (scope === 'Item') return row.displayLevel === 'Item';
  return row.displayLevel === 'Shipment';
}

function countForScope(rows: PackingInstructionRow[], scope: PackingInstructionScopeTab): number {
  return rows.filter((r) => rowMatchesScope(r, scope)).length;
}

const CSV_COLUMNS = [
  { id: 'instructionName' as const, label: 'Instruction Name' },
  { id: 'displayLevel' as const, label: 'Display Level' },
  { id: 'startDate' as const, label: 'Start Date' },
  { id: 'endDate' as const, label: 'End Date' },
  { id: 'status' as const, label: 'Status' },
] as const;

export default function PackingInstructionsApp() {
  const [rows, setRows] = useState<PackingInstructionRow[]>(() => [...MOCK_ROWS]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeTab, setScopeTab] = useState<PackingInstructionScopeTab>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<PackingInstructionRow | null>(null);
  const [drawerNonce, setDrawerNonce] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lastUpdated] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!row.instructionName.toLowerCase().includes(q)) return false;
      }
      return rowMatchesScope(row, scopeTab);
    });
  }, [rows, searchQuery, scopeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const openCreate = () => {
    setEditingRow(null);
    setDrawerNonce((n) => n + 1);
    setDrawerOpen(true);
  };

  const openEdit = (row: PackingInstructionRow) => {
    setEditingRow(row);
    setDrawerNonce((n) => n + 1);
    setDrawerOpen(true);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) setEditingRow(null);
    setDrawerOpen(open);
  };

  const handleSave = (row: PackingInstructionRow) => {
    setRows((prev) => {
      const i = prev.findIndex((r) => r.id === row.id);
      if (i === -1) return [...prev, row];
      const next = [...prev];
      next[i] = row;
      return next;
    });
  };

  const handleExportCSV = () => {
    const headers = CSV_COLUMNS.map((c) => c.label).join(',');
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const body = filteredRows
      .map((row) =>
        CSV_COLUMNS.map((c) => {
          let v = String(row[c.id]);
          if (c.id === 'startDate' || c.id === 'endDate') v = v ? formatDisplayDate(v) : '';
          return escape(v);
        }).join(','),
      )
      .join('\n');
    const csv = `${headers}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'packing-instructions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[rgb(249,250,251)]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6">
        <div className="shrink-0 rounded-xl bg-white p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="mb-2 text-3xl font-medium tracking-tight text-[#101828]">Packing Instructions</h1>
              <p className="text-gray-500">
                Create and manage packing instructions displayed on the packing screen
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleExportCSV}
                className="border-[#1976d2] text-[#1976d2] hover:bg-blue-50 hover:text-[#1976d2]"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button type="button" onClick={openCreate} className="bg-[#1976d2] text-white hover:bg-[#1565c0]">
                <Plus className="mr-2 h-4 w-4" />
                New Instruction
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by instruction name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full max-w-[600px] border-gray-300 bg-white pl-10 md:w-[600px]"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between p-[0px]">
          <div className="flex flex-wrap items-center gap-2">
            {SCOPE_TABS.map((tab) => {
              const count = countForScope(rows, tab.id);
              const active = scopeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setScopeTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    active
                      ? 'bg-[#1976d2] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="relative w-full table-fixed">
                <colgroup>
                  <col className="w-[40%]" />
                  <col className="w-[14%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 border-b bg-white">
                  <tr>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">
                      Instruction Name
                    </th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">
                      Display Level
                    </th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">Start Date</th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">End Date</th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        No packing instructions match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row) => (
                      <tr
                        key={row.id}
                        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => openEdit(row)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openEdit(row);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Edit instruction: ${row.instructionName}`}
                      >
                        <td className="min-w-0 px-4 py-3 text-sm text-gray-700">
                          <span className="block truncate" title={row.instructionName}>
                            {row.instructionName}
                          </span>
                        </td>
                        <td className="min-w-0 px-4 py-3 text-sm text-gray-700">{row.displayLevel}</td>
                        <td
                          className={cn(
                            'min-w-0 px-4 py-3 text-sm text-left whitespace-nowrap',
                            row.startDate.trim() ? 'text-gray-700' : 'text-gray-400',
                          )}
                        >
                          {row.startDate.trim() ? formatDisplayDate(row.startDate) : emptyDateCell()}
                        </td>
                        <td
                          className={cn(
                            'min-w-0 px-4 py-3 text-sm text-left whitespace-nowrap',
                            row.endDate.trim() ? 'text-gray-700' : 'text-gray-400',
                          )}
                        >
                          {row.endDate.trim() ? formatDisplayDate(row.endDate) : emptyDateCell()}
                        </td>
                        <td className="min-w-0 px-4 py-3 text-left whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-[8px] px-2.5 py-0.5 text-xs font-medium ${statusChipClass(row.status)}`}
                          >
                            {row.status}
                          </span>
                        </td>
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
                  {filteredRows.length === 0
                    ? '0 of 0'
                    : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredRows.length)} of ${filteredRows.length}`}
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
                    disabled={currentPage >= totalPages || filteredRows.length === 0}
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

      <CreatePackingInstructionDrawer
        key={`${editingRow?.id ?? 'new'}-${drawerNonce}`}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        editingRow={editingRow}
        onSave={handleSave}
      />
    </div>
  );
}
