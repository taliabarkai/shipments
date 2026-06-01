import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Download, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import CreateUpgradeDowngradeRuleDrawer from './CreateUpgradeDowngradeRuleDrawer';
import {
  deriveRuleStatus,
  MOCK_RULES,
  STATUS_LABEL,
  statusBadgeClass,
  type RuleStatus,
  type UpgradeDowngradeRule,
  type UpgradeDowngradeScopeTab,
} from './upgradeDowngradeTypes';

function formatDisplayDate(iso: string): string {
  if (!iso || !iso.trim()) return '';
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMoney(amount: number, decimals = 0): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function emptyCell() {
  return <span className="text-gray-400">—</span>;
}

const SCOPE_TABS: { id: UpgradeDowngradeScopeTab; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'expired', label: 'Expired' },
  { id: 'done', label: 'Done' },
  { id: 'cancelled', label: 'Cancelled' },
];

const CSV_COLUMNS = [
  { id: 'name', label: 'Rule Name' },
  { id: 'action', label: 'Action' },
  { id: 'budget', label: 'Budget' },
  { id: 'spendSavings', label: 'Spend / Savings' },
  { id: 'timesApplied', label: 'Times Applied' },
  { id: 'startDate', label: 'Start Date' },
  { id: 'endDate', label: 'End Date' },
  { id: 'status', label: 'Status' },
] as const;

function ActionChip({ action }: { action: UpgradeDowngradeRule['action'] }) {
  if (action === 'upgrade') {
    return (
      <span className="inline-flex items-center gap-1 rounded-[8px] bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
        <ArrowUp className="size-3" />
        Upgrade
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-[8px] bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800">
      <ArrowDown className="size-3" />
      Downgrade
    </span>
  );
}

function BudgetCell({ rule }: { rule: UpgradeDowngradeRule }) {
  if (rule.action === 'downgrade' || !rule.costControl) return emptyCell();
  if (rule.costControl.mode === 'per_rule') {
    return (
      <div className="flex flex-col">
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Per rule</span>
        <span className="text-sm text-gray-700">{formatMoney(rule.costControl.budgetCap)}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Per shipment</span>
      <span className="text-sm text-gray-700">{formatMoney(rule.costControl.maxPerShipment, 2)}</span>
    </div>
  );
}

function SpendSavingsCell({ rule }: { rule: UpgradeDowngradeRule }) {
  if (rule.action === 'downgrade') {
    return <span className="text-sm font-medium text-green-600">{formatMoney(rule.savings ?? 0)}</span>;
  }
  const spent = rule.spent ?? 0;
  if (rule.costControl?.mode === 'per_rule') {
    const cap = rule.costControl.budgetCap;
    const pct = cap > 0 ? Math.min(100, Math.round((spent / cap) * 100)) : 0;
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 text-xs tabular-nums text-gray-600">
          <span>
            {formatMoney(spent)} / {formatMoney(cap)}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-[#1976d2] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }
  // per-shipment: just the accumulated spend
  return <span className="text-sm text-gray-700">{formatMoney(spent)}</span>;
}

export default function UpgradeDowngradeRulesApp() {
  const [rules, setRules] = useState<UpgradeDowngradeRule[]>(() =>
    MOCK_RULES.map((r) => ({ ...r })),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeTab, setScopeTab] = useState<UpgradeDowngradeScopeTab>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<UpgradeDowngradeRule | null>(null);
  const [drawerNonce, setDrawerNonce] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [lastUpdated] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  );

  const statusById = useMemo(() => {
    const map = new Map<string, RuleStatus>();
    rules.forEach((r) => map.set(r.id, deriveRuleStatus(r)));
    return map;
  }, [rules]);

  const countForScope = (scope: UpgradeDowngradeScopeTab): number => {
    if (scope === 'All') return rules.length;
    return rules.filter((r) => statusById.get(r.id) === scope).length;
  };

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      if (searchQuery.trim()) {
        if (!rule.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      }
      if (scopeTab === 'All') return true;
      return statusById.get(rule.id) === scopeTab;
    });
  }, [rules, searchQuery, scopeTab, statusById]);

  const totalPages = Math.max(1, Math.ceil(filteredRules.length / rowsPerPage));
  const paginatedRules = filteredRules.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const openCreate = () => {
    setEditingRule(null);
    setDrawerNonce((n) => n + 1);
    setDrawerOpen(true);
  };

  const openEdit = (rule: UpgradeDowngradeRule) => {
    setEditingRule(rule);
    setDrawerNonce((n) => n + 1);
    setDrawerOpen(true);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) setEditingRule(null);
    setDrawerOpen(open);
  };

  const pulse = (id: string) => {
    setHighlightId(id);
    window.setTimeout(() => setHighlightId((cur) => (cur === id ? null : cur)), 1500);
  };

  const handleSave = (rule: UpgradeDowngradeRule) => {
    setRules((prev) => {
      const i = prev.findIndex((r) => r.id === rule.id);
      if (i === -1) return [...prev, rule];
      const next = [...prev];
      next[i] = rule;
      return next;
    });
    pulse(rule.id);
  };

  const handleCancelRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, manuallyCancelled: true } : r)));
    pulse(id);
  };

  const handleReset = () => {
    setRules(MOCK_RULES.map((r) => ({ ...r })));
    setSearchQuery('');
    setScopeTab('All');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = CSV_COLUMNS.map((c) => c.label).join(',');
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const cellValue = (rule: UpgradeDowngradeRule, id: (typeof CSV_COLUMNS)[number]['id']): string => {
      switch (id) {
        case 'name':
          return rule.name;
        case 'action':
          return rule.action === 'upgrade' ? 'Upgrade' : 'Downgrade';
        case 'budget':
          if (rule.action === 'downgrade' || !rule.costControl) return '';
          return rule.costControl.mode === 'per_rule'
            ? `Per rule: ${formatMoney(rule.costControl.budgetCap)}`
            : `Per shipment: ${formatMoney(rule.costControl.maxPerShipment, 2)}`;
        case 'spendSavings':
          if (rule.action === 'downgrade') return formatMoney(rule.savings ?? 0);
          return formatMoney(rule.spent ?? 0);
        case 'timesApplied':
          return String(rule.timesApplied);
        case 'startDate':
          return formatDisplayDate(rule.startDate);
        case 'endDate':
          return formatDisplayDate(rule.endDate);
        case 'status':
          return STATUS_LABEL[statusById.get(rule.id) ?? 'active'];
        default:
          return '';
      }
    };
    const body = filteredRules
      .map((rule) => CSV_COLUMNS.map((c) => escape(cellValue(rule, c.id))).join(','))
      .join('\n');
    const csv = `${headers}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'upgrade-downgrade-rules.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[rgb(249,250,251)]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6">
        <div className="shrink-0 rounded-xl bg-white p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="mb-2 text-3xl font-medium tracking-tight text-[#101828]">
                Upgrade and Downgrade Rules
              </h1>
              <p className="text-gray-500">
                Configure upgrade and downgrade rules applied during route assignment
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
                New Rule
              </Button>
            </div>
          </div>
          <div className="relative w-full max-w-[360px] shrink-0">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by rule name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full max-w-[360px] border-gray-300 bg-white pl-10"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between p-[0px]">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter rules by status">
            {SCOPE_TABS.map((tab) => {
              const count = countForScope(tab.id);
              const active = scopeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setScopeTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    active ? 'bg-[#1976d2] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  <col className="w-[22%]" />
                  <col className="w-[11%]" />
                  <col className="w-[12%]" />
                  <col className="w-[16%]" />
                  <col className="w-[10%]" />
                  <col className="w-[11%]" />
                  <col className="w-[11%]" />
                  <col className="w-[9%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 border-b bg-white">
                  <tr>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">Rule Name</th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">Action</th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">Budget</th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">Spend / Savings</th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">Times Applied</th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">Start Date</th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">End Date</th>
                    <th className="min-w-0 px-4 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRules.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        No rules match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedRules.map((rule) => {
                      const status = statusById.get(rule.id) ?? 'active';
                      return (
                        <tr
                          key={rule.id}
                          className={cn(
                            'cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50',
                            highlightId === rule.id && 'bg-blue-50',
                          )}
                          onClick={() => openEdit(rule)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openEdit(rule);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Edit rule: ${rule.name}`}
                        >
                          <td className="min-w-0 px-4 py-3 text-sm text-gray-700">
                            <span className="block truncate" title={rule.name}>
                              {rule.name}
                            </span>
                          </td>
                          <td className="min-w-0 px-4 py-3">
                            <ActionChip action={rule.action} />
                          </td>
                          <td className="min-w-0 px-4 py-3">
                            <BudgetCell rule={rule} />
                          </td>
                          <td className="min-w-0 px-4 py-3">
                            <SpendSavingsCell rule={rule} />
                          </td>
                          <td className="min-w-0 px-4 py-3 text-sm tabular-nums text-gray-700">
                            {rule.timesApplied.toLocaleString('en-US')}
                          </td>
                          <td
                            className={cn(
                              'min-w-0 whitespace-nowrap px-4 py-3 text-left text-sm',
                              rule.startDate.trim() ? 'text-gray-700' : 'text-gray-400',
                            )}
                          >
                            {rule.startDate.trim() ? formatDisplayDate(rule.startDate) : emptyCell()}
                          </td>
                          <td
                            className={cn(
                              'min-w-0 whitespace-nowrap px-4 py-3 text-left text-sm',
                              rule.endDate.trim() ? 'text-gray-700' : 'text-gray-400',
                            )}
                          >
                            {rule.endDate.trim() ? formatDisplayDate(rule.endDate) : emptyCell()}
                          </td>
                          <td className="min-w-0 whitespace-nowrap px-4 py-3 text-left">
                            <span
                              className={`inline-flex rounded-[8px] px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(status)}`}
                            >
                              {STATUS_LABEL[status]}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-6 border-t bg-white px-4 py-2">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Last Updated at {lastUpdated}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="font-medium text-[#1976d2] hover:text-[#1565c0] hover:underline"
                >
                  Reset to defaults
                </button>
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
                  {filteredRules.length === 0
                    ? '0 of 0'
                    : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredRules.length)} of ${filteredRules.length}`}
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
                    disabled={currentPage >= totalPages || filteredRules.length === 0}
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

      <CreateUpgradeDowngradeRuleDrawer
        key={`${editingRule?.id ?? 'new'}-${drawerNonce}`}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        editingRule={editingRule}
        allRules={rules}
        onSave={handleSave}
        onCancelRule={handleCancelRule}
      />
    </div>
  );
}
