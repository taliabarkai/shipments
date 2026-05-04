import { useState } from 'react';
import { Plus, Search, Columns3, RefreshCw, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import ColumnSettingsDialog from './ColumnSettingsDialog';
import CreateCarrierDrawer from './CreateCarrierDrawer';
import svgPaths from '../imports/svg-8i0hxkhc97';
import { DateRangePicker } from './DateRangePicker';
import { FuturePricingData } from './ScheduleFuturePricingDialog';

export interface CarrierConfig {
  id: string;
  carrier: string;
  originalCarrierServiceType?: string;
  effectiveDate: string;
  agreementCost: string;
  fuelTax: string;
  vat: string;
  discount: string;
  agentCommission: string;
  agentCommissionType?: string;
  surcharge: string;
  surchargeFee?: string;
  surchargeType?: string;
  activeRoutes: string;
  futurePricing?: FuturePricingData[];
}

interface GlobalCarrierConfigurationProps {
  onSectionChange?: (section: 'shipments' | 'collections' | 'consolidated') => void;
}

export default function GlobalCarrierConfiguration({ onSectionChange }: GlobalCarrierConfigurationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showCreateCarrierDialog, setShowCreateCarrierDialog] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lastUpdated] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

  // Carrier configuration data
  const [carriers, setCarriers] = useState<CarrierConfig[]>([
    {
      id: '1',
      carrier: 'DHL',
      originalCarrierServiceType: 'Express',
      effectiveDate: '01/15/2026',
      agreementCost: '12.5',
      fuelTax: '3.5',
      vat: '2',
      discount: '1.5',
      agentCommission: '3',
      agentCommissionType: 'percentage',
      surcharge: '-',
      activeRoutes: '32',
      futurePricing: [
        {
          starting_day: '2026-03-01',
          cost: '13.2',
          fuel_tax_percent: '4',
          vat_percent: '2.5',
          discount_percent: '2',
          agent_commission: '3.5',
          agent_commission_type: 'percentage',
          surcharge_fee: '0.75',
          surcharge_type: 'flat',
        },
      ],
    },
    {
      id: '2',
      carrier: 'FedEx',
      originalCarrierServiceType: 'Ground',
      effectiveDate: '02/12/2026',
      agreementCost: '14.6',
      fuelTax: '2',
      vat: '4',
      discount: '3',
      agentCommission: '1',
      agentCommissionType: 'percentage',
      surcharge: '$5',
      surchargeFee: '5',
      surchargeType: 'flat',
      activeRoutes: '48',
    },
    {
      id: '3',
      carrier: 'Virtual',
      originalCarrierServiceType: 'Digital',
      effectiveDate: '02/28/2026',
      agreementCost: '11.2',
      fuelTax: '2.5',
      vat: '3',
      discount: '2.5',
      agentCommission: '4',
      agentCommissionType: 'percentage',
      surcharge: '-',
      activeRoutes: '0',
    },
    {
      id: '4',
      carrier: 'UPS',
      originalCarrierServiceType: 'Next Day Air',
      effectiveDate: '03/15/2026',
      agreementCost: '20.1',
      fuelTax: '5',
      vat: '3.5',
      discount: '-',
      agentCommission: '5',
      agentCommissionType: 'percentage',
      surcharge: '$8',
      surchargeFee: '8',
      surchargeType: 'flat',
      activeRoutes: '30',
    },
    {
      id: '5',
      carrier: 'MailLog',
      originalCarrierServiceType: 'Standard',
      effectiveDate: '01/30/2026',
      agreementCost: '16.3',
      fuelTax: '4',
      vat: '2.8',
      discount: '2',
      agentCommission: '4',
      agentCommissionType: 'percentage',
      surcharge: '$5',
      surchargeFee: '5',
      surchargeType: 'flat',
      activeRoutes: '2',
    },
    {
      id: '6',
      carrier: 'Basic Plus',
      originalCarrierServiceType: 'Economy',
      effectiveDate: '03/05/2026',
      agreementCost: '9.8',
      fuelTax: '1.5',
      vat: '2',
      discount: '-',
      agentCommission: '2.5',
      agentCommissionType: 'percentage',
      surcharge: '$3',
      surchargeFee: '3',
      surchargeType: 'flat',
      activeRoutes: '0',
    },
    {
      id: '7',
      carrier: 'USPS',
      originalCarrierServiceType: 'Priority Mail',
      effectiveDate: '04/10/2026',
      agreementCost: '18.5',
      fuelTax: '6',
      vat: '3.0',
      discount: '-',
      agentCommission: '6',
      agentCommissionType: 'percentage',
      surcharge: '-',
      activeRoutes: '15',
    },
    {
      id: '8',
      carrier: 'ShineOn',
      originalCarrierServiceType: 'Express',
      effectiveDate: '02/25/2026',
      agreementCost: '17.6',
      fuelTax: '3',
      vat: '2.2',
      discount: '-',
      agentCommission: '2',
      agentCommissionType: 'percentage',
      surcharge: '-',
      surchargeFee: '0.50',
      surchargeType: 'flat',
      activeRoutes: '27',
    },
    {
      id: '9',
      carrier: 'AdsOne',
      originalCarrierServiceType: 'Parcel',
      effectiveDate: '01/18/2026',
      agreementCost: '13.9',
      fuelTax: '3.2',
      vat: '2.7',
      discount: '1.8',
      agentCommission: '50',
      agentCommissionType: 'flat',
      surcharge: '-',
      activeRoutes: '0',
    },
    {
      id: '10',
      carrier: 'Tapuz',
      originalCarrierServiceType: 'LTL',
      effectiveDate: '03/20/2026',
      agreementCost: '15.2',
      fuelTax: '3.8',
      vat: '2.5',
      discount: '-',
      agentCommission: '2.5',
      agentCommissionType: 'percentage',
      surcharge: '-',
      activeRoutes: '22',
    },
  ]);

  const [filters, setFilters] = useState({
    carrier: [] as string[],
  });

  // Date range filter state
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: '',
  });

  const [columns, setColumns] = useState([
    { id: 'carrier', label: 'Carrier Name', visible: true },
    { id: 'originalCarrierServiceType', label: 'Original Service Type', visible: true },
    { id: 'effectiveDate', label: 'Last Updated', visible: true },
    { id: 'agreementCost', label: 'Agreement Cost', visible: true },
    { id: 'fuelTax', label: 'Fuel Tax', visible: true },
    { id: 'vat', label: 'VAT', visible: true },
    { id: 'discount', label: 'Discount', visible: true },
    { id: 'agentCommission', label: 'Agent Commission', visible: true },
    { id: 'surcharge', label: 'Surcharge', visible: true },
    { id: 'activeRoutes', label: 'Active Routes', visible: true },
  ]);

  const visibleColumns = columns.filter(c => c.visible);

  // Extract unique filter options
  const filterOptions = {
    carrier: Array.from(new Set(carriers.map(s => s.carrier))).sort(),
    effectiveDate: Array.from(new Set(carriers.map(s => s.effectiveDate))).sort(),
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
  const filteredConfigs = carriers.filter(config => {
    if (searchQuery && !config.carrier.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.carrier.length > 0 && !filters.carrier.includes(config.carrier)) {
      return false;
    }
    if (dateRange.startDate && new Date(config.effectiveDate) < new Date(dateRange.startDate)) {
      return false;
    }
    if (dateRange.endDate && new Date(config.effectiveDate) > new Date(dateRange.endDate)) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredConfigs.length / rowsPerPage);
  const paginatedConfigs = filteredConfigs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0) || dateRange.startDate || dateRange.endDate;

  const clearColumnFilter = (filterKey: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: []
    }));
  };

  const handleAddCarrier = () => {
    setSelectedCarrier(null);
    setShowCreateCarrierDialog(true);
  };

  const handleRowClick = (carrier: CarrierConfig) => {
    setSelectedCarrier(carrier);
    setShowCreateCarrierDialog(true);
  };

  const handleCarrierSubmit = (carrierData: any) => {
    console.log('Carrier data:', carrierData);
    
    if (selectedCarrier) {
      // Update existing carrier
      setCarriers(prev => prev.map(c => 
        c.id === selectedCarrier.id 
          ? {
              ...c,
              carrier: carrierData.carrierName,
              originalCarrierServiceType: carrierData.originalCarrierServiceType,
              agreementCost: carrierData.agreementCost,
              fuelTax: carrierData.fuelTax,
              vat: carrierData.vat,
              discount: carrierData.discount,
              agentCommission: carrierData.agentCommission,
              agentCommissionType: carrierData.agentCommissionType,
              surchargeFee: carrierData.surchargeFee,
              surchargeType: carrierData.surchargeType,
            }
          : c
      ));
    } else {
      // Create new carrier
      const newCarrier: CarrierConfig = {
        id: String(carriers.length + 1),
        carrier: carrierData.carrierName,
        originalCarrierServiceType: carrierData.originalCarrierServiceType,
        effectiveDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        agreementCost: carrierData.agreementCost,
        fuelTax: carrierData.fuelTax,
        vat: carrierData.vat,
        discount: carrierData.discount,
        agentCommission: carrierData.agentCommission,
        agentCommissionType: carrierData.agentCommissionType,
        surcharge: carrierData.surchargeFee || '-',
        surchargeFee: carrierData.surchargeFee,
        surchargeType: carrierData.surchargeType,
        activeRoutes: '0',
      };
      setCarriers(prev => [...prev, newCarrier]);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[rgb(249,250,251)]">
      <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
            {/* Page Header */}
            <div className="bg-white rounded-xl p-6 shrink-0">
              <div className="flex items-start justify-between mb-[16px] mt-[0px] mr-[0px] ml-[0px]">
                <div>
                  <h1 className="text-3xl mb-2">Global Carrier Settings</h1>
                  <p className="text-gray-500">Manage carrier-wide pricing rules that apply to all shipping routes</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddCarrier}
                    className="bg-[#1976d2] hover:bg-[#1565c0] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Carrier
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <div className="relative w-full max-w-[360px] shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Carrier..."
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
                      onClick={() => {
                        setFilters({
                          carrier: [],
                        });
                        setDateRange({
                          startDate: '',
                          endDate: '',
                        });
                      }}
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
                        // Special handling for Effective Date column
                        if (column.id === 'effectiveDate') {
                          return (
                            <th
                              key={column.id}
                              className="px-4 py-4 text-left text-sm font-medium text-gray-700"
                            >
                              <div className="flex items-center gap-2">
                                <span>
                                  {column.label}
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
                          );
                        }

                        // Regular columns with checkbox filter (only carrier)
                        const isFilterable = column.id === 'carrier';
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
                      <th className="px-4 py-4 text-right relative w-12">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowColumnSettings(true)}
                              className="hidden"
                            >
                              <Columns3 className="w-5 h-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Column Settings</p>
                          </TooltipContent>
                        </Tooltip>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedConfigs.map((config) => (
                      <tr key={config.id} className="border-b hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleRowClick(config)}>
                        {visibleColumns.map((column) => (
                          <td key={column.id} className="px-4 py-4 whitespace-nowrap text-sm">
                            {column.id === 'activeRoutes' ? (
                              config.activeRoutes === '0' ? (
                                <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                  No Active Routes
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                  {config.activeRoutes} Active Routes
                                </span>
                              )
                            ) : ['fuelTax', 'vat', 'discount'].includes(column.id) ? (
                              <div className="flex items-center gap-1">
                                <span>{config[column.id as keyof CarrierConfig]}</span>
                                {config[column.id as keyof CarrierConfig] !== '-' && (
                                  <span className="text-gray-500">%</span>
                                )}
                              </div>
                            ) : column.id === 'agentCommission' ? (
                              <div className="flex items-center gap-1">
                                <span>{config.agentCommission}</span>
                                {config.agentCommission !== '-' && config.agentCommissionType === 'percentage' && (
                                  <span className="text-gray-500">%</span>
                                )}
                                {config.agentCommission !== '-' && config.agentCommissionType === 'flat' && (
                                  <span className="text-gray-500">$</span>
                                )}
                              </div>
                            ) : (
                              config[column.id as keyof CarrierConfig]
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
                    {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, filteredConfigs.length)} of {filteredConfigs.length}
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
                      disabled={currentPage === totalPages || filteredConfigs.length === 0}
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

      <ColumnSettingsDialog
        isOpen={showColumnSettings}
        onClose={() => setShowColumnSettings(false)}
        columns={columns}
        onColumnsChange={setColumns}
      />

      <CreateCarrierDrawer
        isOpen={showCreateCarrierDialog}
        onClose={() => {
          setShowCreateCarrierDialog(false);
          setSelectedCarrier(null);
        }}
        onSubmit={handleCarrierSubmit}
        carrier={selectedCarrier}
      />
    </div>
  );
}