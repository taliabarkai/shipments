import { useState, useMemo } from 'react';
import { ConsolidatedShipment, ConsolidatedCarrierType } from './ConsolidatedShipmentsApp';
import { consolidatedStatusBadgeClass, displayDestination } from './consolidatedShipmentUi';
import { inferredConsolidatedCarrierType } from './consolidatedShipmentConstants';
import { Download, Plus, Search, RefreshCw, AlertCircle, FileText, Box, Receipt, X, MoreVertical } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import MuiPopover from '@mui/material/Popover';
import MuiBox from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Checkbox as ShadcnCheckbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import ExpandableSidebar from './ExpandableSidebar';
import MainMenuSidebar from '../imports/MainMenuSidebar';
import InvoiceDialog from './InvoiceDialog';
import svgPaths from '../imports/svg-8i0hxkhc97';
import { Toaster } from './ui/sonner';
import { DateRangePicker } from './DateRangePicker';
import { AlertFilterAddControl, AlertFilterActiveChips, RuleFilterAddControl, RuleFilterActiveChips } from './AlertFilterTags';
import {
  matchesAnyAlertRule,
  consolidationAppliesAlert,
  countRowsPerAlertRule,
  getConsolidationDisplayAlerts,
  alertLabelForId,
  matchesAnyRuleFilter,
  countRowsPerRule,
  type AlertFilterId,
} from './alertFilterRules';
import { MOCK_RULES, deriveRuleStatus } from './upgradeDowngradeTypes';

const ACTIVE_RULES = MOCK_RULES.filter((r) => deriveRuleStatus(r) === 'active').map((r) => ({
  id: r.id,
  name: r.name,
}));

type ConsolidatedListStatusTab = 'All' | 'Draft' | 'Packed' | 'Shipped' | 'Cancelled';

interface ShipmentsListProps {
  shipments: ConsolidatedShipment[];
  onShipmentClick: (shipment: ConsolidatedShipment) => void;
  onCreateNew: () => void;
  onUpdateShipment: (shipment: ConsolidatedShipment) => void;
  onSectionChange?: (
    section:
      | 'shipments'
      | 'collections'
      | 'consolidated'
      | 'routes'
      | 'shipmentAlerts'
      | 'shippingProductCatalog'
      | 'packingInstructions'
      | 'globalCarrier',
  ) => void;
}

export type ConsolidatedListColumnId =
  | 'packingFacility'
  | 'destination'
  | 'totalValue'
  | 'totalShipments'
  | 'trackingId'
  | 'apiMethod'
  | 'carrier'
  | 'cartsCarrier'
  | 'carrierType'
  | 'createdDate'
  | 'packedDate'
  | 'shippedDate'
  | 'id'
  | 'documents'
  | 'status'
  | 'alerts';

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

/** Always visible; not controlled by column menu */
const PINNED_CONSOLIDATED_COLUMNS: { id: ConsolidatedListColumnId; label: string }[] = [
  { id: 'id', label: 'Consolidation ID' },
  { id: 'documents', label: 'Documents' },
  { id: 'status', label: 'Status' },
];

const DEFAULT_OPTIONAL_COLUMNS: { id: ConsolidatedListColumnId; label: string; visible: boolean }[] = [
  { id: 'packingFacility', label: 'Facility', visible: true },
  { id: 'destination', label: 'Destination Country', visible: true },
  { id: 'totalValue', label: 'Total value', visible: true },
  { id: 'totalShipments', label: 'Total shipments', visible: false },
  { id: 'trackingId', label: 'Tracking', visible: false },
  { id: 'apiMethod', label: 'API Method', visible: false },
  { id: 'carrier', label: 'Carrier Service', visible: false },
  { id: 'cartsCarrier', label: 'Carts Carrier', visible: false },
  { id: 'carrierType', label: 'Type', visible: false },
  { id: 'createdDate', label: 'Created date', visible: false },
  { id: 'packedDate', label: 'Packed date', visible: false },
  { id: 'shippedDate', label: 'Shipped date', visible: false },
  { id: 'alerts', label: 'Alerts', visible: false },
];

type EnrichedConsolidated = ConsolidatedShipment & {
  displayTotalShipments: number;
  displayCarrierType: ConsolidatedCarrierType | string;
  displayPackedDate: string;
  displayShippedDate: string;
};

function enrichConsolidated(shipments: ConsolidatedShipment[]): EnrichedConsolidated[] {
  return shipments.map((s, i) => {
    const displayTotalShipments = s.totalShipments ?? Math.max(1, s.orders.length);
    const displayCarrierType: ConsolidatedCarrierType | string = inferredConsolidatedCarrierType(s);
    const displayPackedDate =
      s.packedDate ?? `${(i % 12) + 2}/${(i % 27) + 1}/2023`;
    const displayShippedDate =
      s.shippedDate ??
      (s.status === 'Shipped' ? `${(i % 12) + 5}/${(i % 27) + 1}/2023` : '—');
    const displayPackedDateResolved = s.status === 'Draft' ? '—' : displayPackedDate;
    return {
      ...s,
      displayTotalShipments,
      displayCarrierType,
      displayPackedDate: displayPackedDateResolved,
      displayShippedDate,
    };
  });
}

export default function ShipmentsList({
  shipments,
  onShipmentClick,
  onCreateNew,
  onUpdateShipment,
  onSectionChange,
}: ShipmentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [columns, setColumns] = useState(() =>
    DEFAULT_OPTIONAL_COLUMNS.map((c) => ({ ...c }))
  );
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatusTab, setSelectedStatusTab] = useState<ConsolidatedListStatusTab>('All');
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const columnMenuOpen = Boolean(columnMenuAnchor);

  const [filters, setFilters] = useState({
    packingFacility: [] as string[],
    destination: [] as string[],
    status: [] as string[],
  });
  const [appliedAlertFilters, setAppliedAlertFilters] = useState<AlertFilterId[]>([]);
  const [appliedRuleFilters, setAppliedRuleFilters] = useState<string[]>([]);

  const enrichedShipments = useMemo(() => enrichConsolidated(shipments), [shipments]);

  const alertCounts = useMemo(
    () => countRowsPerAlertRule(shipments, consolidationAppliesAlert),
    [shipments]
  );

  const ruleCounts = useMemo(
    () => countRowsPerRule(shipments, ACTIVE_RULES.map((r) => r.id)),
    [shipments]
  );

  // Date range filter state
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: '',
  });

  // Predefined filter options
  const filterOptions = {
    packingFacility: ['Thailand', 'Kiryat Gat', 'Hungary', 'Nazareth'],
    destination: ['—', 'EU', 'US', 'GB'],
    status: ['Draft', 'Packed', 'Shipped', 'Cancelled'],
  };

  const toggleFilter = (column: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const current = prev[column] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return {
        ...prev,
        [column]: updated,
      };
    });
  };

  const clearColumnFilter = (column: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [column]: [],
    }));
  };

  const hasActiveColumnFilters =
    Object.values(filters).some((f) => f.length > 0) ||
    Boolean(dateRange.startDate || dateRange.endDate);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      All: shipments.length,
      Packed: shipments.filter(s => s.status === 'Packed').length,
      Shipped: shipments.filter(s => s.status === 'Shipped').length,
      Cancelled: shipments.filter(s => s.status === 'Cancelled').length,
      Draft: shipments.filter(s => s.status === 'Draft').length,
    };
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    return enrichedShipments.filter(shipment => {
      // Status tab filter
      if (selectedStatusTab !== 'All' && shipment.status !== selectedStatusTab) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          shipment.id.toLowerCase().includes(query) ||
          shipment.trackingId.toLowerCase().includes(query) ||
          shipment.orders.some(order => order.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Packing facility filter
      if (filters.packingFacility.length > 0 && !filters.packingFacility.includes(shipment.packingFacility)) {
        return false;
      }

      // Destination filter (Bulk rows compare as "—")
      if (
        filters.destination.length > 0 &&
        !filters.destination.includes(displayDestination(shipment))
      ) {
        return false;
      }

      // Status column filter (multi-select; empty = no constraint)
      if (filters.status.length > 0 && !filters.status.includes(shipment.status)) {
        return false;
      }

      // Date range filter
      if (dateRange.startDate && shipment.dateCreated < dateRange.startDate) {
        return false;
      }
      if (dateRange.endDate && shipment.dateCreated > dateRange.endDate) {
        return false;
      }

      if (!matchesAnyAlertRule(shipment, appliedAlertFilters, consolidationAppliesAlert)) {
        return false;
      }

      if (!matchesAnyRuleFilter(shipment, appliedRuleFilters)) {
        return false;
      }

      return true;
    });
  }, [
    enrichedShipments,
    searchQuery,
    filters,
    selectedStatusTab,
    dateRange,
    appliedAlertFilters,
    appliedRuleFilters,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredShipments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, endIndex);

  // Reset to page 1 when filters or search changes
  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const setColumnVisible = (columnId: ConsolidatedListColumnId, visible: boolean) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, visible } : col)));
  };

  const resetColumnsToDefault = () => {
    setColumns(DEFAULT_OPTIONAL_COLUMNS.map((c) => ({ ...c })));
  };

  const visibleTableColumns = useMemo(() => {
    const optionalVisibleNoAlerts = columns.filter((c) => c.visible && c.id !== 'alerts');
    const alertsCol = columns.find((c) => c.id === 'alerts' && c.visible);
    const out: { id: ConsolidatedListColumnId; label: string }[] = [
      PINNED_CONSOLIDATED_COLUMNS[0],
      ...optionalVisibleNoAlerts,
      PINNED_CONSOLIDATED_COLUMNS[1],
      PINNED_CONSOLIDATED_COLUMNS[2],
    ];
    if (alertsCol) {
      out.push({ id: 'alerts', label: alertsCol.label });
    }
    return out;
  }, [columns]);

  const cellValueForExport = (s: EnrichedConsolidated, colId: ConsolidatedListColumnId): string => {
    switch (colId) {
      case 'totalValue':
        return s.totalValue;
      case 'totalShipments':
        return String(s.displayTotalShipments);
      case 'carrier':
        return s.carrier;
      case 'apiMethod':
        return 'DHL';
      case 'cartsCarrier':
        return getCartsCarrier(s.carrier);
      case 'carrierType':
        return String(s.displayCarrierType);
      case 'createdDate':
        return s.dateCreated;
      case 'packedDate':
        return s.displayPackedDate;
      case 'shippedDate':
        return s.displayShippedDate;
      case 'destination':
        return displayDestination(s);
      case 'documents':
        return 'Label / Manifest / Invoice';
      case 'status':
        return s.status;
      case 'alerts':
        return getConsolidationDisplayAlerts(s)
          .map((id) => alertLabelForId(id))
          .join('; ');
      default:
        return String((s as Record<string, unknown>)[colId] ?? '');
    }
  };

  const handleExportCSV = () => {
    const headers = visibleTableColumns.map((c) => c.label).join(',');
    const rows = filteredShipments.map((s) => {
      return visibleTableColumns.map((c) => cellValueForExport(s, c.id)).join(',');
    }).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'consolidated-shipments.csv';
    a.click();
  };

  return (
    <div className="flex h-full">
      {/* Main Menu Sidebar */}
      <div className="w-[98px] shrink-0">
        <MainMenuSidebar />
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* Expandable Sidebar */}
          <ExpandableSidebar activeSection="consolidated" onSectionChange={onSectionChange} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden bg-[rgb(249,250,251)]">
              {/* Page Header */}
              <div className="bg-white rounded-xl p-6 shrink-0">
                <div className="flex items-start justify-between mb-[16px] mt-[0px] mr-[0px] ml-[0px]">
                  <div>
                    <h1 className="text-3xl mb-2">Consolidated Shipments</h1>
                    <p className="text-gray-500">Manage and track all consolidated shipments</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleExportCSV}
                      className="border-[#1976d2] text-[#1976d2] hover:text-[#1976d2] hover:bg-blue-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      onClick={onCreateNew}
                      className="bg-[#1976d2] hover:bg-[#1565c0]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Consolidated Shipment
                    </Button>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full max-w-[360px] shrink-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="Search by Consolidation ID, Tracking ID or Order ID"
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
                              status: [],
                            });
                            setDateRange({ startDate: '', endDate: '' });
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

              {/* Status Filter Tabs */}
              <div className="flex items-center justify-between p-[0px]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStatusTab('All')}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedStatusTab === 'All'
                        ? 'bg-[#1976d2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({statusCounts.All})
                  </button>
                  <button
                    onClick={() => setSelectedStatusTab('Draft')}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedStatusTab === 'Draft'
                        ? 'bg-[#1976d2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Draft ({statusCounts.Draft})
                  </button>
                  <button
                    onClick={() => setSelectedStatusTab('Packed')}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedStatusTab === 'Packed'
                        ? 'bg-[#1976d2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Packed ({statusCounts.Packed})
                  </button>
                  <button
                    onClick={() => setSelectedStatusTab('Shipped')}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedStatusTab === 'Shipped'
                        ? 'bg-[#1976d2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Shipped ({statusCounts.Shipped})
                  </button>
                  <button
                    onClick={() => setSelectedStatusTab('Cancelled')}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedStatusTab === 'Cancelled'
                        ? 'bg-[#1976d2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancelled ({statusCounts.Cancelled})
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="relative flex flex-col flex-1 min-h-0">
                  {/* Table Content */}
                  <div className="overflow-auto flex-1 min-h-0">
                    <table className="w-full relative">
                      <thead className="bg-white sticky top-0 border-b z-10">
                        <tr>
                          {visibleTableColumns.map((column) => {
                            const isFilterable = ['packingFacility', 'destination', 'status'].includes(
                              column.id
                            );
                            const isDateCreated = column.id === 'createdDate';
                            const filterKey = column.id as keyof typeof filters;
                            const hasFilter = isFilterable && filters[filterKey]?.length > 0;
                            const hasDateFilter = isDateCreated && (dateRange.startDate || dateRange.endDate);
                            
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
                                    {hasDateFilter && (
                                      <span className="text-[#1976d2] ml-1">
                                        (1)
                                      </span>
                                    )}
                                  </span>
                                  {isDateCreated && (
                                    <DateRangePicker
                                      startDate={dateRange.startDate}
                                      endDate={dateRange.endDate}
                                      onDateRangeChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
                                    />
                                  )}
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
                                                <ShadcnCheckbox
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
                              aria-controls={columnMenuOpen ? 'consolidated-columns-menu' : undefined}
                              aria-haspopup="true"
                              aria-expanded={columnMenuOpen}
                              onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
                            >
                              <MoreVertical className="h-5 w-5 text-gray-600" />
                            </Button>
                            <MuiPopover
                              id="consolidated-columns-menu"
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
                                      <Checkbox
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
                            key={shipment.id}
                            onClick={() => onShipmentClick(shipment)}
                            className="border-b hover:bg-gray-50 cursor-pointer transition-colors relative"
                          >
                            {visibleTableColumns.map((column) => (
                              <td key={column.id} className="px-4 py-4">
                                {column.id === 'id' && (
                                  <div className="flex items-center gap-2">
                                    {shipment.hasCancelledItems && (
                                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                                    )}
                                    <span className="text-sm">{shipment.id}</span>
                                  </div>
                                )}
                                {column.id === 'packingFacility' && (
                                  <span className="text-sm">{shipment.packingFacility}</span>
                                )}
                                {column.id === 'destination' && (
                                  <span className="text-sm">{displayDestination(shipment)}</span>
                                )}
                                {column.id === 'trackingId' && (
                                  <span className="text-sm">{shipment.trackingId}</span>
                                )}
                                {column.id === 'apiMethod' && (
                                  <span className="text-sm">DHL</span>
                                )}
                                {column.id === 'createdDate' && (
                                  <span className="text-sm">{shipment.dateCreated}</span>
                                )}
                                {column.id === 'documents' && (
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
                                            console.log('View Manifest clicked');
                                          }}
                                          className="text-gray-600 hover:text-gray-900 transition-colors"
                                        >
                                          <Box className="w-5 h-5" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p>View Manifest</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowInvoiceDialog(true);
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
                                )}
                                {column.id === 'totalValue' && (
                                  <span className="text-sm">{shipment.totalValue}</span>
                                )}
                                {column.id === 'totalShipments' && (
                                  <span className="text-sm">{shipment.displayTotalShipments}</span>
                                )}
                                {column.id === 'carrier' && (
                                  <span className="text-sm">{shipment.carrier}</span>
                                )}
                                {column.id === 'cartsCarrier' && (
                                  <span className="text-sm">{getCartsCarrier(shipment.carrier)}</span>
                                )}
                                {column.id === 'carrierType' && (
                                  <span className="text-sm">{shipment.displayCarrierType}</span>
                                )}
                                {column.id === 'packedDate' && (
                                  <span className="text-sm">{shipment.displayPackedDate}</span>
                                )}
                                {column.id === 'shippedDate' && (
                                  <span className="text-sm">{shipment.displayShippedDate}</span>
                                )}
                                {column.id === 'status' && (
                                  <span
                                    className={`px-3 py-1 rounded-md text-xs font-medium ${consolidatedStatusBadgeClass(
                                      shipment.status
                                    )}`}
                                  >
                                    {shipment.status}
                                  </span>
                                )}
                                {column.id === 'alerts' && (
                                  <div
                                    className="flex max-w-[280px] flex-wrap gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {getConsolidationDisplayAlerts(shipment).length === 0 ? (
                                      <span className="text-sm text-gray-400">—</span>
                                    ) : (
                                      getConsolidationDisplayAlerts(shipment).map((aid) => (
                                        <span
                                          key={aid}
                                          className="inline-flex max-w-full truncate rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                                        >
                                          {alertLabelForId(aid)}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                )}
                              </td>
                            ))}
                            <td className="px-2 py-4 w-12 align-middle" aria-hidden />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="flex items-center justify-between gap-6 px-4 py-2 border-t bg-white shrink-0">
                    {/* Last Updated */}
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <RefreshCw className="w-4 h-4" />
                      Last Updated at 12:24 AM
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Rows per page:</span>
                        <select 
                          className="border rounded px-2 py-1"
                          value={rowsPerPage}
                          onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                      <span className="text-sm text-gray-700">
                        {startIndex + 1}-{Math.min(endIndex, filteredShipments.length)} of {filteredShipments.length}
                      </span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={currentPage === 1}
                          onClick={handlePrevPage}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
                          </svg>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={currentPage === totalPages || filteredShipments.length === 0}
                          onClick={handleNextPage}
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
          </div>
        </div>

      {/* Invoice Dialog */}
      <InvoiceDialog
        isOpen={showInvoiceDialog}
        onClose={() => setShowInvoiceDialog(false)}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
