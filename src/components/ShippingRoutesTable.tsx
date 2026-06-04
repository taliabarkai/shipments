import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Search, RefreshCw, X, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import MuiPopover from '@mui/material/Popover';
import MuiBox from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import MuiCheckbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CreateShippingRouteDialog from './CreateShippingRouteDialog';
import svgPaths from '../imports/svg-8i0hxkhc97';

const DEFAULT_SHIPPING_ROUTE_COLUMNS = [
  { id: 'id', label: 'Route ID', visible: true },
  { id: 'carrierServiceType', label: 'Carrier Service Type', visible: true },
  { id: 'serviceLevel', label: 'Service Level', visible: true },
  { id: 'priority', label: 'Priority', visible: false },
  { id: 'fromCountryCode', label: 'From', visible: true },
  { id: 'toCountryCode', label: 'To', visible: true },
  { id: 'maxShippingValue', label: 'Max Ship. Value', visible: false },
  { id: 'currencyCode', label: 'Currency Code', visible: false },
  { id: 'packingTimeFrame', label: 'Pack. Time Frame', visible: false },
  { id: 'shippingTimeFrame', label: 'Ship. Time Frame', visible: true },
  { id: 'shippingCost', label: 'Cost', visible: true },
  { id: 'packingFacility', label: 'Packing Facility', visible: true },
  { id: 'shippingWorkingDays', label: 'Ship. Working Days', visible: false },
  { id: 'externalId', label: 'External ID', visible: false },
  { id: 'status', label: 'Status', visible: true },
] as const;

export type ServiceLevel = 'Basic' | 'Expedited' | 'Express';

export interface ShippingRoute {
  /** Auto-assigned shipping route ID. */
  id: string;
  /** Auto-assigned external ID. */
  externalId: string;
  /** Mandatory. Defaults to Inactive when adding a new route. */
  status: 'Active' | 'Inactive';
  /** Restricted to the names in CARRIER_SERVICE_TYPE_TABLE. */
  carrierServiceType: string;
  /** Auto-assigned from the selected carrier service type. */
  serviceLevel: ServiceLevel;
  /** Mandatory. Defaults to false. */
  priority: boolean;
  /** 2-char ISO country code. */
  fromCountryCode: string;
  /** 2-char ISO country code. */
  toCountryCode: string;
  /** Number 0–10000, up to 2 decimals. Stored as string for form-friendly editing. */
  maxShippingValue: string;
  /** Always 'USD' — cannot be edited. */
  currencyCode: 'USD';
  /** Whole number 0–30. */
  packingTimeFrame: string;
  /** Whole number 0–30. */
  shippingTimeFrame: string;
  /** Number 0–1000, up to 2 decimals. */
  shippingCost: string;
  /** Restricted to PACKING_FACILITIES. */
  packingFacility: string;
  /** Multi-select of days 1 (Mon) through 7 (Sun). At least one required. */
  shippingWorkingDays: number[];
}

/** Carrier service type table: name → service level. */
export const CARRIER_SERVICE_TYPE_TABLE: { name: string; serviceLevel: ServiceLevel }[] = [
  { name: 'DHL', serviceLevel: 'Express' },
  { name: 'DHL TH', serviceLevel: 'Express' },
  { name: 'FedEx', serviceLevel: 'Express' },
  { name: 'UPS', serviceLevel: 'Express' },
  { name: 'USPS', serviceLevel: 'Basic' },
  { name: 'Korea Post', serviceLevel: 'Basic' },
  { name: 'GlobalPost', serviceLevel: 'Basic' },
  { name: 'Global Post TH', serviceLevel: 'Expedited' },
];

export const SHIPPING_ROUTE_PACKING_FACILITIES = [
  'Kiryat Gat',
  'Nazereth',
  'TLV VPN',
  'Hungary',
  'Salamander',
  'Thailand',
  'Virtual',
  'Jondo US',
  'Jondo EU',
  'Jondo CA',
  'Jondo UK',
  'Jondo AU',
  'Jondo IE',
  'Prodigi US',
  'Prodigi EU UK',
  'Prodigi AU',
  'Prodigi CA',
  'RPI',
  'Bay Photo',
  'Pop Up Lighting',
  'Mineola Luggage',
  'Gooten',
  'Intagly',
  'Pic The Gift',
  'Luggage UK',
  'HDF',
  'ShineOn',
  'I Home Industrial',
  'Jondo SG',
  'Scan Cafe',
];

export const SHIPPING_ROUTE_COUNTRY_CODES = [
  'AU',
  'BR',
  'CA',
  'CN',
  'DE',
  'EG',
  'FR',
  'GB',
  'HK',
  'IL',
  'IN',
  'IT',
  'JP',
  'KR',
  'MX',
  'NZ',
  'RU',
  'SG',
  'TH',
  'US',
];

export const SHIPPING_ROUTE_FROM_COUNTRY_CODES = ['US', 'IL', 'HU', 'TH', 'UK'];

export const SHIPPING_ROUTE_WORKING_DAY_LABELS: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
};

export function formatShippingWorkingDays(days: number[]): string {
  if (!days || days.length === 0) return '';
  const sorted = [...days].sort((a, b) => a - b);
  return sorted.map((d) => (d === 1 ? '1 day' : `${d} days`)).join(', ');
}

const NUMERIC_SORT_COLUMNS = new Set([
  'maxShippingValue',
  'packingTimeFrame',
  'shippingTimeFrame',
  'shippingCost',
]);

function compareRoutes(a: ShippingRoute, b: ShippingRoute, columnId: string): number {
  if (columnId === 'priority') {
    return Number(a.priority) - Number(b.priority);
  }
  if (columnId === 'shippingWorkingDays') {
    const da = (a.shippingWorkingDays ?? []).slice().sort((x, y) => x - y);
    const db = (b.shippingWorkingDays ?? []).slice().sort((x, y) => x - y);
    if (da.length !== db.length) return da.length - db.length;
    for (let i = 0; i < da.length; i++) {
      if (da[i] !== db[i]) return da[i] - db[i];
    }
    return 0;
  }
  const aVal = (a as Record<string, unknown>)[columnId];
  const bVal = (b as Record<string, unknown>)[columnId];
  if (NUMERIC_SORT_COLUMNS.has(columnId)) {
    return (Number(aVal) || 0) - (Number(bVal) || 0);
  }
  // For SR-#### / EXT-#### style IDs, numeric-aware compare keeps SR-0009 < SR-0010.
  return String(aVal ?? '').localeCompare(String(bVal ?? ''), undefined, { numeric: true, sensitivity: 'base' });
}

interface ShippingRoutesTableProps {
  routes: ShippingRoute[];
  onSectionChange?: (section: 'shipments' | 'collections' | 'consolidated' | 'routes') => void;
}

export default function ShippingRoutesTable({ routes, onSectionChange }: ShippingRoutesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const columnMenuOpen = Boolean(columnMenuAnchor);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<ShippingRoute | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [lastUpdated] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

  const [filters, setFilters] = useState({
    packingFacility: [] as string[],
    toCountryCode: [] as string[],
    fromCountryCode: [] as string[],
    carrierServiceType: [] as string[],
    serviceLevel: [] as string[],
    status: [] as string[],
  });
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    if (sortBy !== columnId) {
      setSortBy(columnId);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      // Third click clears sort.
      setSortBy(null);
      setSortDir('asc');
    }
  };

  const [columns, setColumns] = useState(() => DEFAULT_SHIPPING_ROUTE_COLUMNS.map((c) => ({ ...c })));

  const setColumnVisible = (columnId: string, visible: boolean) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, visible } : col)));
  };

  const resetColumnsToDefault = () => {
    setColumns(DEFAULT_SHIPPING_ROUTE_COLUMNS.map((c) => ({ ...c })));
  };

  const visibleColumns = columns.filter(c => c.visible);

  // Extract unique filter options from routes
  const filterOptions = {
    packingFacility: Array.from(new Set(routes.map(r => r.packingFacility))).sort(),
    toCountryCode: Array.from(new Set(routes.map(r => r.toCountryCode))).sort(),
    fromCountryCode: Array.from(new Set(routes.map(r => r.fromCountryCode))).sort(),
    carrierServiceType: Array.from(new Set(routes.map(r => r.carrierServiceType))).sort(),
    serviceLevel: Array.from(new Set(routes.map(r => r.serviceLevel))).sort(),
    status: Array.from(new Set(routes.map(r => r.status))).sort(),
  };

  const toggleFilter = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
    setCurrentPage(1);
  };

  const clearColumnFilter = (filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: []
    }));
    setCurrentPage(1);
  };

  // Apply filters
  const filteredRoutes = routes.filter(route => {
    if (searchQuery && !route.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.packingFacility.length > 0 && !filters.packingFacility.includes(route.packingFacility)) {
      return false;
    }
    if (filters.toCountryCode.length > 0 && !filters.toCountryCode.includes(route.toCountryCode)) {
      return false;
    }
    if (filters.fromCountryCode.length > 0 && !filters.fromCountryCode.includes(route.fromCountryCode)) {
      return false;
    }
    if (filters.carrierServiceType.length > 0 && !filters.carrierServiceType.includes(route.carrierServiceType)) {
      return false;
    }
    if (filters.serviceLevel.length > 0 && !filters.serviceLevel.includes(route.serviceLevel)) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(route.status)) {
      return false;
    }
    return true;
  });

  const sortedRoutes = useMemo(() => {
    if (!sortBy) return filteredRoutes;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filteredRoutes].sort((a, b) => dir * compareRoutes(a, b, sortBy));
  }, [filteredRoutes, sortBy, sortDir]);

  const totalPages = Math.ceil(sortedRoutes.length / rowsPerPage);
  const paginatedRoutes = sortedRoutes.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const hasActiveFilters = false;

  const handleNewRoute = () => {
    setSelectedRoute(null);
    setShowCreateDialog(true);
  };

  const handleRowClick = (route: ShippingRoute) => {
    setSelectedRoute(route);
    setShowCreateDialog(true);
  };

  const handleCreateRouteSubmit = (routeData: any) => {
    console.log('New route created:', routeData);
    // In real app, this would add the route to the routes array
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[rgb(249,250,251)]">
      <CreateShippingRouteDialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setSelectedRoute(null);
        }}
        onSubmit={handleCreateRouteSubmit}
        route={selectedRoute}
      />
      <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
            {/* Page Header */}
            <div className="bg-white rounded-xl p-6 shrink-0">
              <div className="flex items-start justify-between mb-[16px] mt-[0px] mr-[0px] ml-[0px]">
                <div>
                  <h1 className="text-3xl mb-2">Shipping Routes</h1>
                  <p className="text-gray-500">Manage and track all shipping routes</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleNewRoute}
                    className="bg-[#1976d2] hover:bg-[#1565c0] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Route
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <div className="relative w-full max-w-[360px] shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search routes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-[360px] pl-10 bg-white border-gray-300"
                  />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({})}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="relative flex flex-col flex-1 min-h-0">
                {/* Table Content */}
                <div className="overflow-auto flex-1 min-h-0">
                  <table className="w-full relative">
                    <thead className="bg-white sticky top-0 border-b z-10">
                    <tr className="relative">
                      {visibleColumns.map((column) => {
                        const filterableColumns = ['packingFacility', 'toCountryCode', 'fromCountryCode', 'carrierServiceType', 'serviceLevel', 'status'];
                        const isFilterable = filterableColumns.includes(column.id);
                        const filterKey = column.id as keyof typeof filters;
                        const hasFilter = isFilterable && filters[filterKey]?.length > 0;
                        const isSortable = !isFilterable;
                        const isSorted = sortBy === column.id;

                        return (
                          <th
                            key={column.id}
                            className="px-4 py-4 text-left text-sm font-medium text-gray-700"
                          >
                            <div className="flex items-center gap-2">
                              {isSortable ? (
                                <button
                                  type="button"
                                  onClick={() => handleSort(column.id)}
                                  className="flex items-center gap-1 hover:text-gray-900"
                                  aria-label={`Sort by ${column.label}`}
                                >
                                  {column.label}
                                  {isSorted ? (
                                    sortDir === 'asc' ? (
                                      <ArrowUp className="w-4 h-4 shrink-0 text-[#1976d2]" />
                                    ) : (
                                      <ArrowDown className="w-4 h-4 shrink-0 text-[#1976d2]" />
                                    )
                                  ) : (
                                    <ArrowUpDown className="w-4 h-4 shrink-0 text-gray-400" />
                                  )}
                                </button>
                              ) : (
                                <span className="flex items-center gap-1">
                                  {column.label}
                                  {hasFilter && (
                                    <>
                                      <span className="text-[#1976d2] ml-1">
                                        ({filters[filterKey].length})
                                      </span>
                                      <X
                                        className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          clearColumnFilter(filterKey);
                                        }}
                                      />
                                    </>
                                  )}
                                </span>
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
                          aria-controls={columnMenuOpen ? 'shipping-routes-columns-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={columnMenuOpen}
                          onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
                        >
                          <MoreVertical className="h-5 w-5 text-gray-600" />
                        </Button>
                        <MuiPopover
                          id="shipping-routes-columns-menu"
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
                      {paginatedRoutes.length === 0 ? (
                        <tr>
                          <td colSpan={visibleColumns.length} className="text-center p-8 text-gray-500">
                            No routes found
                          </td>
                        </tr>
                      ) : (
                        paginatedRoutes.map((route) => (
                          <tr key={route.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(route)}>
                            {visibleColumns.map((column) => {
                              let cellContent = '';
                              switch(column.id) {
                                case 'id':
                                  cellContent = route.id;
                                  break;
                                case 'externalId':
                                  cellContent = route.externalId;
                                  break;
                                case 'packingFacility':
                                  cellContent = route.packingFacility;
                                  break;
                                case 'fromCountryCode':
                                  cellContent = route.fromCountryCode;
                                  break;
                                case 'toCountryCode':
                                  cellContent = route.toCountryCode;
                                  break;
                                case 'carrierServiceType':
                                  cellContent = route.carrierServiceType;
                                  break;
                                case 'serviceLevel':
                                  cellContent = route.serviceLevel;
                                  break;
                                case 'priority':
                                  cellContent = route.priority ? 'Yes' : 'No';
                                  break;
                                case 'packingTimeFrame':
                                  cellContent = route.packingTimeFrame ? `${route.packingTimeFrame} days` : '';
                                  break;
                                case 'shippingTimeFrame':
                                  cellContent = route.shippingTimeFrame ? `${route.shippingTimeFrame} days` : '';
                                  break;
                                case 'shippingCost':
                                  cellContent = route.shippingCost;
                                  break;
                                case 'maxShippingValue':
                                  cellContent = route.maxShippingValue;
                                  break;
                                case 'currencyCode':
                                  cellContent = route.currencyCode;
                                  break;
                                case 'status':
                                  return (
                                    <td key={column.id} className="p-4 text-sm">
                                      <Badge
                                        className={
                                          route.status === 'Active'
                                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                        }
                                      >
                                        {route.status}
                                      </Badge>
                                    </td>
                                  );
                                case 'shippingWorkingDays':
                                  cellContent = formatShippingWorkingDays(route.shippingWorkingDays);
                                  break;
                                default:
                                  cellContent = '';
                              }
                              return (
                                <td key={column.id} className="p-4 text-sm">
                                  {cellContent}
                                </td>
                              );
                            })}
                            <td className="p-4 text-right w-12"></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Sticky Footer with Pagination */}
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
                      {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, filteredRoutes.length)} of {filteredRoutes.length}
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
                        disabled={currentPage === totalPages || filteredRoutes.length === 0}
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
    </div>
  );
}