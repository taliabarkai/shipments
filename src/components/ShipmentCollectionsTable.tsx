import { useState, useMemo } from 'react';
import { RefreshCw, Plus, Search, ChevronDown, Pencil, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import svgPaths from '../imports/svg-8i0hxkhc97';
import { DateRangePicker } from './DateRangePicker';

export type CollectionStatus = 'Pending' | 'Picked Up';

export interface ShipmentCollection {
  id: string;
  packingFacility: string;
  carrier: string;
  pickUpTime: string;
  sentToPack: number;
  packed: number;
  status: CollectionStatus;
  dateCreated: string;
}

interface ShipmentCollectionsTableProps {
  collections: ShipmentCollection[];
  onRefresh: () => void;
  onAddCollection: () => void;
  onUpdateStatus: (id: string, status: CollectionStatus) => void;
  onEditCollection?: (collection: ShipmentCollection) => void;
  onSectionChange?: (section: 'shipments' | 'collections' | 'consolidated') => void;
  isRefreshing?: boolean;
}

export default function ShipmentCollectionsTable({
  collections,
  onRefresh,
  onAddCollection,
  onUpdateStatus,
  onEditCollection,
  onSectionChange,
  isRefreshing,
}: ShipmentCollectionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [lastUpdated] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const [activeTab, setActiveTab] = useState<'all' | CollectionStatus>('all');

  const [filters, setFilters] = useState({
    packingFacility: [] as string[],
    carrier: [] as string[],
    status: [] as CollectionStatus[],
  });

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
    carrier: ['FedEx', 'UPS', 'DHL', 'USPS', 'LaserShip', 'OnTrac', 'Global Post HU', 'DHL EU', 'DHL TH', 'MailLog'],
    status: ['Pending', 'Picked Up'] as CollectionStatus[],
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

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      All: collections.length,
      Pending: collections.filter(c => c.status === 'Pending').length,
      'Picked Up': collections.filter(c => c.status === 'Picked Up').length,
    };
  }, [collections]);

  // Filter collections based on search and filters
  const filteredCollections = collections.filter(collection => {
    // Status tab filter
    if (activeTab !== 'all' && collection.status !== activeTab) {
      return false;
    }

    // Search filter
    const matchesSearch = 
      collection.packingFacility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.carrier.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (searchQuery && !matchesSearch) return false;

    // Packing facility filter
    if (filters.packingFacility.length > 0 && !filters.packingFacility.includes(collection.packingFacility)) {
      return false;
    }

    // Carrier filter
    if (filters.carrier.length > 0 && !filters.carrier.includes(collection.carrier)) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(collection.status)) {
      return false;
    }

    // Date range filter
    if (dateRange.startDate && collection.dateCreated < dateRange.startDate) {
      return false;
    }
    if (dateRange.endDate && collection.dateCreated > dateRange.endDate) {
      return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredCollections.length / rowsPerPage);
  const paginatedCollections = filteredCollections.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const calculateProgress = (packed: number, sentToPack: number) => {
    if (sentToPack === 0) return 0;
    const progress = Math.round((packed / sentToPack) * 100);
    return Math.min(progress, 100); // Cap at 100%
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[rgb(249,250,251)]">
      {/* Loading Overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 text-[#1976d2] animate-spin" />
            <p className="text-sm text-gray-600">Refreshing data...</p>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
            {/* Page Header */}
            <div className="bg-white rounded-xl p-6 shrink-0">
              <div className="flex items-start justify-between mb-[16px] mt-[0px] mr-[0px] ml-[0px]">
                <div>
                  <h1 className="text-3xl mb-2">Shipment Collections</h1>
                  <p className="text-gray-500">Manage and track all shipment collections</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onRefresh}
                    className="border-[#1976d2] text-[#1976d2] hover:text-[#1976d2] hover:bg-blue-50"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={onAddCollection}
                    className="bg-[#1976d2] hover:bg-[#1565c0]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Collection
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Packing Facility, Carrier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-[600px] bg-white border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center justify-between p-[0px]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    activeTab === 'all'
                      ? 'bg-[#1976d2] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({statusCounts.All})
                </button>
                <button
                  onClick={() => setActiveTab('Pending')}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    activeTab === 'Pending'
                      ? 'bg-[#1976d2] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending ({statusCounts.Pending})
                </button>
                <button
                  onClick={() => setActiveTab('Picked Up')}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    activeTab === 'Picked Up'
                      ? 'bg-[#1976d2] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Picked Up ({statusCounts['Picked Up']})
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="relative flex flex-col flex-1 min-h-0">
                {/* Table Content */}
                <div className="overflow-auto flex-1 min-h-0">
                  <table className="w-full relative" style={{ tableLayout: 'fixed' }}>
                    <thead className="bg-white sticky top-0 border-b z-10">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-700" style={{ width: '15%' }}>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            Packing Facility
                            {filters.packingFacility.length > 0 && (
                              <>
                                <span className="text-[#1976d2] ml-1">
                                  ({filters.packingFacility.length})
                                </span>
                                <X
                                  className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearColumnFilter('packingFacility');
                                  }}
                                />
                              </>
                            )}
                          </span>
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
                                  <h4 className="font-medium text-sm">Filter by Packing Facility</h4>
                                  {filters.packingFacility.length > 0 && (
                                    <button
                                      onClick={() => clearColumnFilter('packingFacility')}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {filterOptions.packingFacility.map((value) => (
                                    <div key={value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`packingFacility-${value}`}
                                        checked={filters.packingFacility.includes(value)}
                                        onCheckedChange={() => toggleFilter('packingFacility', value)}
                                      />
                                      <Label
                                        htmlFor={`packingFacility-${value}`}
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
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-700" style={{ width: '14%' }}>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            Carrier
                            {filters.carrier.length > 0 && (
                              <>
                                <span className="text-[#1976d2] ml-1">
                                  ({filters.carrier.length})
                                </span>
                                <X
                                  className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearColumnFilter('carrier');
                                  }}
                                />
                              </>
                            )}
                          </span>
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
                                  <h4 className="font-medium text-sm">Filter by Carrier</h4>
                                  {filters.carrier.length > 0 && (
                                    <button
                                      onClick={() => clearColumnFilter('carrier')}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {filterOptions.carrier.map((value) => (
                                    <div key={value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`carrier-${value}`}
                                        checked={filters.carrier.includes(value)}
                                        onCheckedChange={() => toggleFilter('carrier', value)}
                                      />
                                      <Label
                                        htmlFor={`carrier-${value}`}
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
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-700" style={{ width: '11%' }}>
                        Pick Up Time
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-700" style={{ width: '12%' }}>
                        <div className="flex items-center gap-2">
                          <span>
                            Date Created
                            {(dateRange.startDate || dateRange.endDate) && (
                              <span className="text-[#1976d2] ml-1">
                                (1)
                              </span>
                            )}
                          </span>
                          <DateRangePicker
                            startDate={dateRange.startDate}
                            endDate={dateRange.endDate}
                            onDateRangeChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
                          />
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-700" style={{ width: '10%' }}>
                        Sent to Pack
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-700" style={{ width: '10%' }}>
                        Packed
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-700" style={{ width: '20%' }}>
                        Progress
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-700" style={{ width: '19%' }}>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            Collection Status
                            {filters.status.length > 0 && (
                              <>
                                <span className="text-[#1976d2] ml-1">
                                  ({filters.status.length})
                                </span>
                                <X
                                  className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearColumnFilter('status');
                                  }}
                                />
                              </>
                            )}
                          </span>
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
                                  <h4 className="font-medium text-sm">Filter by Collection Status</h4>
                                  {filters.status.length > 0 && (
                                    <button
                                      onClick={() => clearColumnFilter('status')}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {filterOptions.status.map((value) => (
                                    <div key={value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`status-${value}`}
                                        checked={filters.status.includes(value)}
                                        onCheckedChange={() => toggleFilter('status', value)}
                                      />
                                      <Label
                                        htmlFor={`status-${value}`}
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
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCollections.map((collection) => {
                      const progress = calculateProgress(collection.packed, collection.sentToPack);
                      
                      return (
                        <tr 
                          key={collection.id} 
                          className="border-b hover:bg-gray-50 transition-colors cursor-pointer group relative"
                          onClick={() => onEditCollection?.(collection)}
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {collection.packingFacility}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {collection.carrier}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {collection.pickUpTime}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {collection.dateCreated}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {collection.sentToPack}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {collection.packed === 0 ? '–' : collection.packed}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-3 min-w-[200px]">
                              <Progress value={progress} className="flex-1" />
                              <span className="text-xs text-gray-500 w-10 text-right">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className={`gap-1 px-1.5 py-0.5 text-xs h-auto ${
                                      collection.status === 'Picked Up'
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {collection.status}
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateStatus(collection.id, 'Pending');
                                    }}
                                  >
                                    Pending
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateStatus(collection.id, 'Picked Up');
                                    }}
                                  >
                                    Picked Up
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
                              {/* Edit Icon - appears on hover */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditCollection?.(collection);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-200 transition-all text-gray-600 hover:text-gray-900"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p>Edit</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                    {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, filteredCollections.length)} of {filteredCollections.length}
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
                      disabled={currentPage === totalPages || filteredCollections.length === 0}
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