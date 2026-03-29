import { useState } from 'react';
import { Download, Search, RefreshCw, X, FileText, Receipt, MoreVertical } from 'lucide-react';
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
  { id: 'trackingId', label: 'Tracking ID', visible: true },
  { id: 'siteId', label: 'Site ID', visible: true },
  { id: 'documents', label: 'Documents', visible: true },
  { id: 'orderCost', label: 'Order Cost', visible: true },
  { id: 'status', label: 'Status', visible: true },
] as const;

export type ShipmentStatus = 'Label Created' | 'Delivered' | 'Out for Delivery' | 'On the Way';

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
  });

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

  // Apply filters
  const filteredShipments = shipments.filter(shipment => {
    if (searchQuery && !shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
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
    return true;
  });

  const totalPages = Math.ceil(filteredShipments.length / rowsPerPage);
  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  const clearColumnFilter = (filterKey: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: []
    }));
  };

  const getStatusVariant = (status: ShipmentStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'On the Way':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Label Created':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
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
                  <p className="text-gray-500">Track all shipments</p>
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

              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Shipment ID, Order ID, Tracking ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-[600px] bg-white border-gray-300"
                  />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({
                        packingFacility: [],
                        destination: [],
                        carrier: [],
                        siteId: [],
                        status: [],
                      })}
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
                        const isFilterable = ['packingFacility', 'destination', 'carrier', 'siteId', 'status'].includes(column.id);
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
                                        <h4 className="font-medium text-sm">Filter by {column.label}</h4>
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
                        className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedShipment(shipment);
                          setShowDetailsDrawer(true);
                        }}
                      >
                        {visibleColumns.map((column) => (
                          <td key={column.id} className="px-4 py-4 whitespace-nowrap text-sm">
                            {column.id === 'status' ? (
                              <Badge className={getStatusVariant(shipment.status)}>
                                {shipment.status}
                              </Badge>
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
    </div>
  );
}
