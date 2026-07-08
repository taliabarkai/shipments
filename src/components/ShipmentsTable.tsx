import { useState, useMemo, useEffect, useRef } from 'react';
import { AlertFilterAddControl, AlertFilterActiveChips, RuleFilterAddControl, RuleFilterActiveChips } from './AlertFilterTags';
import {
  matchesAnyAlertRule,
  shipmentAppliesAlert,
  countRowsPerAlertRule,
  getShipmentDisplayAlerts,
  alertLabelForId,
  matchesAnyRuleFilter,
  countRowsPerRule,
  type AlertFilterId,
} from './alertFilterRules';
import { MOCK_RULES, deriveRuleStatus } from './upgradeDowngradeTypes';
import { Download, Search, RefreshCw, X, FileText, Receipt, MoreVertical, Files, Sparkles } from 'lucide-react';
import { getShipmentDeliveryDates } from './shipmentDeliveryDates';
import { DeliveryStatus } from './DeliveryStatus';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './ui/sonner';
import BulkActionBar, { type BulkMenuItem, type BulkMenuSelection } from './BulkActionBar';
import { useRowSelection } from './useRowSelection';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import MuiPopover from '@mui/material/Popover';
import MuiBox from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import MuiCheckbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import ShipmentDetailsDrawer from './ShipmentDetailsDrawer';
import svgPaths from '../imports/svg-8i0hxkhc97';

const DEFAULT_SHIPMENTS_COLUMNS = [
  { id: 'orderId', label: 'Order ID', visible: true },
  { id: 'packingFacility', label: 'Packing Facility', visible: true },
  { id: 'destination', label: 'Destination', visible: true },
  { id: 'carrier', label: 'Carrier', visible: true },
  { id: 'cartsCarrier', label: 'Carts Carrier', visible: false },
  { id: 'trackingId', label: 'Tracking ID', visible: true },
  { id: 'siteId', label: 'Site ID', visible: true },
  { id: 'documents', label: 'Documents', visible: true },
  { id: 'orderCost', label: 'Order Cost', visible: true },
  { id: 'orderEta', label: 'Order ETA', visible: false },
  { id: 'shipmentEdd', label: 'Shipment EDD', visible: false },
  { id: 'alerts', label: 'Alerts', visible: false },
  { id: 'statusReason', label: 'Status Reason', visible: false },
  { id: 'status', label: 'Status', visible: true },
  { id: 'deliveryStatus', label: 'Delivery Status', visible: false },
];

/** Above this many documents, the export is delivered async via an emailed link instead of a direct download. */
const DOCUMENTS_EMAIL_THRESHOLD = 1000;

/** Mocked document/selection count used by the "Simulate 1000+ docs" demo toggle. */
const SIMULATED_DOCUMENT_COUNT = 1240;

const ACTIVE_RULES = MOCK_RULES.filter((r) => deriveRuleStatus(r) === 'active').map((r) => ({
  id: r.id,
  name: r.name,
}));

function getCartsCarrier(carrier: string): string {
  const c = (carrier ?? '').toLowerCase().trim();
  if (c.includes('dhl royal hu')) return 'DHL Royal HU';
  if (c.includes('dhl royal')) return 'DHL Royal';
  if (c.includes('mydhlapi') || c.includes('my dhl api')) return 'MyDhlApi';
  if (c.includes('dhl')) return 'Dhl';
  if (c.includes('usps hu')) return 'USPS HU';
  if (c.includes('usps th')) return 'USPS TH';
  if (c.includes('usps')) return 'USPS HU';
  if (c.includes('usp')) return 'Usp';
  if (c.includes('fedexicp') || c.includes('fedex icp')) return 'FedexIcp HU';
  if (c.includes('fedex hu')) return 'Fedex HU';
  if (c.includes('fedex th')) return 'Fedex TH';
  if (c.includes('fedex')) return 'Fedex HU';
  if (c.includes('mailog express')) return 'Mailog Express';
  if (c.includes('mailog')) return 'Mailog HU';
  return carrier || '—';
}

/**
 * Native checkbox for the selection column. Uses a ref to drive the native
 * `indeterminate` property, which cannot be expressed as a JSX attribute.
 */
function SelectionCheckbox({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      className="size-4 shrink-0 cursor-pointer rounded-sm accent-[#1976d2] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    />
  );
}

/** Escape a single CSV field: quote when it contains a comma, quote or newline; double embedded quotes. */
function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Plain-text value for a shipment column, used when generating the CSV export. */
function csvValueForColumn(shipment: Shipment, columnId: string): string {
  switch (columnId) {
    case 'status':
      return shipment.status;
    case 'statusReason':
      return shipment.status === 'Pending'
        ? shipment.pendingReason ?? '—'
        : shipment.status === 'On Hold'
          ? shipment.holdReason ?? '—'
          : shipment.status === 'Cancelled'
            ? shipment.cancellationReason ?? '—'
            : '—';
    case 'alerts': {
      const alerts = getShipmentDisplayAlerts(shipment);
      return alerts.length === 0 ? '—' : alerts.map((a) => alertLabelForId(a)).join('; ');
    }
    case 'cartsCarrier':
      return getCartsCarrier(shipment.carrier);
    case 'orderEta':
      return getShipmentDeliveryDates(shipment.orderId).orderEta;
    case 'shipmentEdd':
      return getShipmentDeliveryDates(shipment.orderId).shipmentEdd;
    case 'deliveryStatus':
      return shipment.status === 'Shipped'
        ? getShipmentDeliveryDates(shipment.orderId).isLate
          ? 'Late'
          : 'On Time'
        : '—';
    case 'documents':
      return [shipment.label, shipment.invoice].filter(Boolean).join(' / ');
    default: {
      const value = shipment[columnId as keyof Shipment];
      return value == null ? '' : String(value);
    }
  }
}

/** Build and download a CSV from the given rows, named shipments-export-YYYY-MM-DD.csv. */
function downloadShipmentsCsv(
  rows: Shipment[],
  exportColumns: { id: string; label: string }[],
): void {
  const header = exportColumns.map((c) => csvEscape(c.label)).join(',');
  const body = rows
    .map((row) => exportColumns.map((c) => csvEscape(csvValueForColumn(row, c.id))).join(','))
    .join('\n');
  const csv = `${header}\n${body}`;

  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `shipments-export-${stamp}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export type ShipmentStatus =
  | 'Draft'
  | 'Pending'
  | 'On Hold'
  | 'Ready to Pack'
  | 'Packed'
  | 'Shipped'
  | 'Cancelled';

export interface Shipment {
  orderId: string;
  packingFacility: string;
  destination: string;
  carrier: string;
  trackingId: string;
  siteId: string;
  label: string;
  invoice: string;
  orderCost: string;
  status: ShipmentStatus;
  consolidatedId?: string;
  consolidatedPack?: number;
  /** When set, drives alert chips and filter membership for this row. */
  shipmentAlerts?: AlertFilterId[];
  /** Reason text shown in the timeline when status is 'On Hold'. */
  holdReason?: string;
  /** Reason text shown in the timeline when status is 'Pending'. */
  pendingReason?: string;
  /** Reason text shown in the timeline when status is 'Cancelled'. */
  cancellationReason?: string;
  /** IDs of active upgrade/downgrade rules applied to this shipment. */
  appliedRuleIds?: string[];
  /** Carrier service type name (e.g. "DHL Express"). Shown for Shipped status. */
  carrierServiceType?: string;
  /** Estimated delivery date (ISO yyyy-mm-dd). Shown for Shipped status. */
  estimatedDeliveryDate?: string;
  /** Order ETA date (ISO yyyy-mm-dd). Shown for Shipped status. */
  orderEta?: string;
  /** order_shipment_price_amount: the price the customer paid for the shipment. */
  shipmentPrice?: number;
  /** actual_shipment_cost: cost of the assigned route once a route is set. */
  shippingCostAmount?: number;
  /** Declared value after DAP/DDP process completion. */
  declaredValue?: number;
  /** Outcome of DAP/DDP process. */
  financialIncoterm?: 'DAP' | 'DDP' | 'Merukaz';
  /** Carrier service type change event to show in history log. */
  routeChangeEvent?: RouteChangeEvent;
}

export interface RouteChangeEvent {
  type: 'auto-upgrade' | 'auto-downgrade' | 'manual';
  initialCarrierServiceType: string;
  initialEta?: string;
  newCarrierServiceType: string;
  newEta?: string;
  /** Rule name for auto events; user name for manual events. */
  triggeredBy: string;
  occurredAtLabel?: string;
}

interface ShipmentsTableProps {
  shipments: Shipment[];
  onSectionChange?: (section: 'shipments' | 'collections' | 'consolidated') => void;
}

export default function ShipmentsTable({ shipments, onSectionChange }: ShipmentsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const columnMenuOpen = Boolean(columnMenuAnchor);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [lastUpdated] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  const [filters, setFilters] = useState({
    packingFacility: [] as string[],
    destination: [] as string[],
    carrier: [] as string[],
    siteId: [] as string[],
    status: [] as string[],
    deliveryStatus: [] as string[],
  });
  const [appliedAlertFilters, setAppliedAlertFilters] = useState<AlertFilterId[]>([]);
  const [appliedRuleFilters, setAppliedRuleFilters] = useState<string[]>([]);

  const [columns, setColumns] = useState(() => DEFAULT_SHIPMENTS_COLUMNS.map((c) => ({ ...c })));

  const setColumnVisible = (columnId: string, visible: boolean) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, visible } : col)));
  };

  const resetColumnsToDefault = () => {
    setColumns(DEFAULT_SHIPMENTS_COLUMNS.map((c) => ({ ...c })));
  };

  const visibleColumns = columns.filter(c => c.visible);

  // Extract unique filter options
  const filterOptions = {
    packingFacility: Array.from(new Set(shipments.map(s => s.packingFacility))).sort(),
    destination: Array.from(new Set(shipments.map(s => s.destination))).sort(),
    carrier: Array.from(new Set(shipments.map(s => s.carrier))).sort(),
    siteId: Array.from(new Set(shipments.map(s => s.siteId))).sort(),
    status: Array.from(new Set(shipments.map(s => s.status))).sort(),
    deliveryStatus: ['On Time', 'Late'],
  };

  const alertCounts = useMemo(
    () => countRowsPerAlertRule(shipments, shipmentAppliesAlert),
    [shipments]
  );

  const ruleCounts = useMemo(
    () => countRowsPerRule(shipments, ACTIVE_RULES.map((r) => r.id)),
    [shipments]
  );

  const toggleFilter = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
    setCurrentPage(1);
  };

  // Apply filters
  const filteredShipments = shipments.filter(shipment => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesOrder = shipment.orderId.toLowerCase().includes(q);
      const matchesTracking = shipment.trackingId.toLowerCase().includes(q);
      if (!matchesOrder && !matchesTracking) return false;
    }
    if (filters.packingFacility.length > 0 && !filters.packingFacility.includes(shipment.packingFacility)) {
      return false;
    }
    if (filters.destination.length > 0 && !filters.destination.includes(shipment.destination)) {
      return false;
    }
    if (filters.carrier.length > 0 && !filters.carrier.includes(shipment.carrier)) {
      return false;
    }
    if (filters.siteId.length > 0 && !filters.siteId.includes(shipment.siteId)) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(shipment.status)) {
      return false;
    }
    if (filters.deliveryStatus.length > 0) {
      // Only Shipped shipments have a delivery status; others never match.
      const deliveryLabel =
        shipment.status === 'Shipped'
          ? getShipmentDeliveryDates(shipment.orderId).isLate
            ? 'Late'
            : 'On Time'
          : null;
      if (!deliveryLabel || !filters.deliveryStatus.includes(deliveryLabel)) {
        return false;
      }
    }
    if (!matchesAnyAlertRule(shipment, appliedAlertFilters, shipmentAppliesAlert)) {
      return false;
    }
    if (!matchesAnyRuleFilter(shipment, appliedRuleFilters)) {
      return false;
    }
    return true;
  });

  // Default ordering: Shipped shipments first (the common case for this screen),
  // then everything else. Stable sort preserves the original order within each group.
  const orderedShipments = [...filteredShipments].sort(
    (a, b) => (a.status === 'Shipped' ? 0 : 1) - (b.status === 'Shipped' ? 0 : 1),
  );

  const totalPages = Math.ceil(orderedShipments.length / rowsPerPage);
  const paginatedShipments = orderedShipments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // --- Row selection with bulk actions ---
  const allMatchingIds = useMemo(() => orderedShipments.map((s) => s.orderId), [orderedShipments]);
  const pageIds = useMemo(() => paginatedShipments.map((s) => s.orderId), [paginatedShipments]);
  const selection = useRowSelection(allMatchingIds);
  const [exporting, setExporting] = useState(false);
  // Demo aid: pretend the selection holds 1000+ documents so the emailed-link
  // export path is reachable with the small mock dataset.
  const [simulateLargeExport, setSimulateLargeExport] = useState(false);

  // Clear the selection whenever the selection context changes (search / filters).
  // Pagination does not change this key, so selection persists across pages.
  const selectionContextKey = JSON.stringify({
    searchQuery,
    filters,
    appliedAlertFilters,
    appliedRuleFilters,
  });
  const prevSelectionContextKey = useRef(selectionContextKey);
  useEffect(() => {
    if (prevSelectionContextKey.current === selectionContextKey) return;
    prevSelectionContextKey.current = selectionContextKey;
    if (selection.isAnySelected) {
      selection.clear();
      toast('Selection cleared');
    }
  }, [selectionContextKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const headerChecked = selection.isPageFullySelected(pageIds);
  const headerIndeterminate = selection.isPagePartiallySelected(pageIds);
  const canSelectAllMatching =
    !selection.allSelected && headerChecked && filteredShipments.length > pageIds.length;

  const handleHeaderToggle = () => {
    if (selection.allSelected) {
      selection.clear();
      return;
    }
    selection.setPageSelected(pageIds, !selection.isPageFullySelected(pageIds));
  };

  // Documents across a set of orders (each row may carry a label and an invoice).
  const countDocumentsFor = (orderIds: string[]) => {
    if (simulateLargeExport) return SIMULATED_DOCUMENT_COUNT; // demo: force the emailed-link threshold
    const ids = new Set(orderIds);
    return filteredShipments.reduce(
      (n, s) => (ids.has(s.orderId) ? n + (s.label ? 1 : 0) + (s.invoice ? 1 : 0) : n),
      0,
    );
  };

  // NOTE: prototype — there is no backend, so the direct-download path reuses the
  // client-side CSV export and the emailed-link path is a mocked toast.
  const handleExportDocuments = async (sel: BulkMenuSelection) => {
    const fileCount = countDocumentsFor(sel.orderIds);
    if (fileCount > DOCUMENTS_EMAIL_THRESHOLD) {
      // Async path: enqueue a job and let the user go (no blocking wait).
      toast("We'll email you when your download is ready");
      return;
    }
    setExporting(true);
    try {
      const ids = new Set(sel.orderIds);
      // All rows are available client-side, so all-matching mode needs no extra fetch.
      const rows = filteredShipments.filter((s) => ids.has(s.orderId));
      downloadShipmentsCsv(rows, visibleColumns);
      toast.success(`${fileCount.toLocaleString()} documents exported`);
    } catch {
      toast.error('Export failed', {
        action: { label: 'Retry', onClick: () => { void handleExportDocuments(sel); } },
      });
    } finally {
      setExporting(false);
    }
  };

  const menuSelection: BulkMenuSelection = {
    count: selection.selectedCount,
    total: filteredShipments.length,
    allSelected: selection.allSelected,
    orderIds: selection.getSelectedIds(),
  };

  // Config-driven bulk-actions menu. To add a new bulk action later, append one
  // entry here — the menu's rendering and a11y logic don't need to change.
  const bulkMenuItems: BulkMenuItem[] = [
    {
      key: 'export-documents',
      icon: <Files className="size-5" />,
      title: 'Export documents',
      variant: 'direct',
      getDescription: (sel) => {
        const fileCount = countDocumentsFor(sel.orderIds);
        return fileCount > DOCUMENTS_EMAIL_THRESHOLD
          ? `${fileCount.toLocaleString()} files — we'll email you a download link`
          : `${fileCount.toLocaleString()} files as ZIP`;
      },
      disabled: (sel) =>
        countDocumentsFor(sel.orderIds) === 0
          ? { disabled: true, reason: 'No documents in selection' }
          : { disabled: false },
      onSelect: (sel) => { void handleExportDocuments(sel); },
    },
    {
      // TODO: replace with a real bulk action. Structural placeholder only —
      // it demonstrates how to add another entry to this config array.
      key: 'future-action',
      icon: <Sparkles className="size-5" />,
      title: 'Future bulk action example goes here',
      variant: 'direct',
      separatorBefore: true,
      getDescription: (sel) => `Applies to ${sel.count} shipments`,
      disabled: () => ({ disabled: true, reason: 'Coming soon' }),
      onSelect: () => {},
    },
  ];

  const hasActiveColumnFilters = Object.values(filters).some((arr) => arr.length > 0);

  const clearColumnFilter = (filterKey: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: []
    }));
  };

  const getStatusVariant = (status: ShipmentStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-[#f5f5f5] text-[#1f2937] hover:bg-[#f5f5f5]';
      case 'Pending':
        return 'bg-[#fff8e1] text-[#ef6c00] hover:bg-[#fff8e1]';
      case 'On Hold':
        return 'bg-[#f3e5f5] text-[#4A148C] hover:bg-[#f3e5f5]';
      case 'Ready to Pack':
        return 'bg-[#e8f5e9] text-[#166534] hover:bg-[#e8f5e9]';
      case 'Packed':
        return 'bg-[#b9f6ca] text-[#1b5e20] hover:bg-[#b9f6ca]';
      case 'Shipped':
        return 'bg-[#e3f2fd] text-[#0d47a1] hover:bg-[#e3f2fd]';
      case 'Cancelled':
        return 'bg-[#ffebee] text-[#e53935] hover:bg-[#ffebee]';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const handleExportCSV = () => {
    console.log('Exporting CSV...');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[rgb(249,250,251)]">
      <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
            {/* Page Header */}
            <div className="bg-white rounded-xl p-6 shrink-0">
              <div className="flex items-start justify-between mb-[16px] mt-[0px] mr-[0px] ml-[0px]">
                <div>
                  <h1 className="text-3xl mb-2">Shipments</h1>
                  <p className="text-gray-500">Browse all shipments in one place</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleExportCSV}
                    className="bg-[#1976d2] hover:bg-[#1565c0] text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full max-w-[360px] shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search by Order or Tracking ID"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full max-w-[360px] pl-10 bg-white border-gray-300"
                    />
                  </div>
                  <AlertFilterAddControl
                    appliedIds={appliedAlertFilters}
                    onAppliedIdsChange={(ids) => {
                      setAppliedAlertFilters(ids);
                      setCurrentPage(1);
                    }}
                  />
                  <RuleFilterAddControl
                    appliedIds={appliedRuleFilters}
                    rules={ACTIVE_RULES}
                    onAppliedIdsChange={(ids) => {
                      setAppliedRuleFilters(ids);
                      setCurrentPage(1);
                    }}
                  />
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    {hasActiveColumnFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFilters({
                            packingFacility: [],
                            destination: [],
                            carrier: [],
                            siteId: [],
                            status: [],
                            deliveryStatus: [],
                          });
                        }}
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>
                <AlertFilterActiveChips
                  appliedIds={appliedAlertFilters}
                  alertCounts={alertCounts}
                  onAppliedIdsChange={(ids) => {
                    setAppliedAlertFilters(ids);
                    setCurrentPage(1);
                  }}
                />
                <RuleFilterActiveChips
                  appliedIds={appliedRuleFilters}
                  ruleCounts={ruleCounts}
                  rules={ACTIVE_RULES}
                  onAppliedIdsChange={(ids) => {
                    setAppliedRuleFilters(ids);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Table Section */}
            <div className="relative bg-white rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
              {/* Floating bulk-action toolbar, anchored to the bottom of the table */}
              {selection.isAnySelected && (
                <div className="pointer-events-none absolute inset-x-0 bottom-16 z-30 flex justify-center px-4">
                  <div className="pointer-events-auto w-full max-w-3xl rounded-lg border border-gray-200 shadow-xl">
                    <BulkActionBar
                      selectedCount={selection.selectedCount}
                      total={filteredShipments.length}
                      allSelected={selection.allSelected}
                      canSelectAllMatching={canSelectAllMatching}
                      onSelectAllMatching={selection.selectAllMatching}
                      onSelectThisPageOnly={() => selection.selectPageOnly(pageIds)}
                      onClear={selection.clear}
                      menuItems={bulkMenuItems}
                      menuSelection={menuSelection}
                      menuLoading={exporting}
                      simulateLargeExport={simulateLargeExport}
                      onSimulateLargeExportChange={setSimulateLargeExport}
                      simulatedCount={simulateLargeExport ? SIMULATED_DOCUMENT_COUNT : undefined}
                    />
                  </div>
                </div>
              )}
              <div className="relative flex flex-col flex-1 min-h-0">
                {/* Table Content */}
                {/* Extra bottom padding while the floating bar is shown so the last rows scroll clear of it. */}
                <div className={`overflow-auto flex-1 min-h-0 ${selection.isAnySelected ? 'pb-28' : ''}`}>
                  <table className="w-full relative">
                    <thead className="bg-white sticky top-0 border-b z-10">
                    <tr className="relative">
                      <th
                        className="w-12 px-2 py-4 align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center">
                          <SelectionCheckbox
                            checked={headerChecked}
                            indeterminate={headerIndeterminate}
                            onChange={handleHeaderToggle}
                            ariaLabel="Select all shipments on this page"
                          />
                        </label>
                      </th>
                      {visibleColumns.map((column) => {
                        const isFilterable = ['packingFacility', 'destination', 'carrier', 'siteId', 'status', 'deliveryStatus'].includes(column.id);
                        const filterKey = column.id as keyof typeof filters;
                        const hasFilter = isFilterable && filters[filterKey]?.length > 0;
                        
                        return (
                          <th
                            key={column.id}
                            className="px-4 py-4 text-left text-sm font-medium text-gray-700"
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                {column.label}
                                {hasFilter && (
                                  <>
                                    <span className="text-[#1976d2] ml-1">
                                      ({filters[filterKey].length})
                                    </span>
                                    <X
                                      className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearColumnFilter(filterKey);
                                      }}
                                    />
                                  </>
                                )}
                              </span>
                              {isFilterable && (
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
                                        <h4 className="text-sm font-normal">Filter by {column.label}</h4>
                                        {hasFilter && (
                                          <button
                                            onClick={() => clearColumnFilter(filterKey)}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                          >
                                            Clear
                                          </button>
                                        )}
                                      </div>
                                      <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {filterOptions[filterKey]?.map((value) => (
                                          <div key={value} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`${column.id}-${value}`}
                                              checked={filters[filterKey].includes(value)}
                                              onCheckedChange={() => toggleFilter(filterKey, value)}
                                            />
                                            <Label
                                              htmlFor={`${column.id}-${value}`}
                                              className="text-sm cursor-pointer flex-1"
                                            >
                                              {value}
                                            </Label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
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
                          aria-controls={columnMenuOpen ? 'shipments-columns-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={columnMenuOpen}
                          onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
                        >
                          <MoreVertical className="h-5 w-5 text-gray-600" />
                        </Button>
                        <MuiPopover
                          id="shipments-columns-menu"
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
                              sx: {
                                mt: 0.5,
                                minWidth: 224,
                                maxHeight: 400,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                borderRadius: 1,
                              },
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
                                    sx={{
                                      color: 'rgba(0, 0, 0, 0.54)',
                                      '&.Mui-checked': { color: '#1976d2' },
                                    }}
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={col.label}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
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
                              primaryTypographyProps={{
                                variant: 'body2',
                                fontWeight: 600,
                                color: 'primary',
                              }}
                            />
                          </MenuItem>
                        </MuiPopover>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedShipments.map((shipment) => (
                      <tr
                        key={shipment.orderId}
                        className={`border-b cursor-pointer transition-colors ${
                          selection.isSelected(shipment.orderId) ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedShipment(shipment);
                          setShowDetailsDrawer(true);
                        }}
                      >
                        <td
                          className="w-12 px-2 py-4 align-middle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center">
                            <SelectionCheckbox
                              checked={selection.isSelected(shipment.orderId)}
                              onChange={() => selection.toggle(shipment.orderId)}
                              ariaLabel={`Select order ${shipment.orderId}`}
                            />
                          </label>
                        </td>
                        {visibleColumns.map((column) => (
                          <td key={column.id} className="px-4 py-4 whitespace-nowrap text-sm">
                            {column.id === 'status' ? (
                              <Badge className={getStatusVariant(shipment.status)}>
                                {shipment.status}
                              </Badge>
                            ) : column.id === 'statusReason' ? (
                              <span className="text-gray-700">
                                {shipment.status === 'Pending'
                                  ? shipment.pendingReason ?? '—'
                                  : shipment.status === 'On Hold'
                                    ? shipment.holdReason ?? '—'
                                    : shipment.status === 'Cancelled'
                                      ? shipment.cancellationReason ?? '—'
                                      : '—'}
                              </span>
                            ) : column.id === 'alerts' ? (
                              <div
                                className="flex max-w-[280px] flex-wrap gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {getShipmentDisplayAlerts(shipment).length === 0 ? (
                                  <span className="text-gray-400">—</span>
                                ) : (
                                  getShipmentDisplayAlerts(shipment).map((aid) => (
                                    <span
                                      key={aid}
                                      className="inline-flex max-w-full truncate rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                                    >
                                      {alertLabelForId(aid)}
                                    </span>
                                  ))
                                )}
                              </div>
                            ) : column.id === 'cartsCarrier' ? (
                              <span className="text-gray-700">{getCartsCarrier(shipment.carrier)}</span>
                            ) : column.id === 'documents' ? (
                              <div className="flex items-center gap-3">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('View Label clicked');
                                      }}
                                      className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                      <FileText className="w-5 h-5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p>View Label</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('View Invoice clicked');
                                      }}
                                      className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                      <Receipt className="w-5 h-5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p>View Invoice</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            ) : column.id === 'orderEta' ? (
                              <span className="text-gray-900">
                                {getShipmentDeliveryDates(shipment.orderId).orderEta}
                              </span>
                            ) : column.id === 'shipmentEdd' ? (
                              <span className="text-gray-900">
                                {getShipmentDeliveryDates(shipment.orderId).shipmentEdd}
                              </span>
                            ) : column.id === 'deliveryStatus' ? (
                              shipment.status === 'Shipped' ? (
                                <DeliveryStatus
                                  isLate={getShipmentDeliveryDates(shipment.orderId).isLate}
                                  className="text-[13px]"
                                />
                              ) : (
                                <span className="text-gray-400">—</span>
                              )
                            ) : (
                              shipment[column.id as keyof Shipment]
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-4 whitespace-nowrap text-sm"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer with pagination */}
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
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <span className="text-sm text-gray-700">
                    {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, filteredShipments.length)} of {filteredShipments.length}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
                      </svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={currentPage === totalPages || filteredShipments.length === 0}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <ShipmentDetailsDrawer
        open={showDetailsDrawer}
        onClose={() => setShowDetailsDrawer(false)}
        shipment={selectedShipment}
      />
      <Toaster />
    </div>
  );
}
