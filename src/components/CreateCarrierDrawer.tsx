import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import ScheduleFuturePricingDialog, { FuturePricingData } from './ScheduleFuturePricingDialog';

interface CreateCarrierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (carrierData: any) => void;
  carrier?: any | null;
}

export default function CreateCarrierDrawer({
  isOpen,
  onClose,
  onSubmit,
  carrier,
}: CreateCarrierDrawerProps) {
  const [formData, setFormData] = useState({
    carrierName: '',
    originalCarrierServiceType: '',
    fuelTax: '',
    vat: '',
    discount: '',
    agentCommission: '',
    agentCommissionType: 'percentage',
    surchargeFee: '',
    surchargeType: 'flat',
  });

  const [isHistoricalPricingOpen, setIsHistoricalPricingOpen] = useState(false);
  const [showFuturePricingDialog, setShowFuturePricingDialog] = useState(false);
  const [futurePricingEntries, setFuturePricingEntries] = useState<FuturePricingData[]>([]);
  const [editingEntryIndex, setEditingEntryIndex] = useState<number | null>(null);

  const isEditMode = !!carrier;
  const title = isEditMode ? `Update ${formData.carrierName || carrier.carrier}` : 'Add Carrier';

  // Store original values for comparison when in edit mode
  const [originalData, setOriginalData] = useState({
    carrierName: '',
    originalCarrierServiceType: '',
    fuelTax: '',
    vat: '',
    discount: '',
    agentCommission: '',
    agentCommissionType: 'percentage',
    surchargeFee: '',
    surchargeType: 'flat',
  });

  // Initialize form data when carrier prop changes
  useEffect(() => {
    if (carrier) {
      const initialData = {
        carrierName: carrier.carrier || '',
        originalCarrierServiceType: carrier.originalCarrierServiceType || '',
        fuelTax: carrier.fuelTax || '',
        vat: carrier.vat || '',
        discount: carrier.discount || '',
        agentCommission: carrier.agentCommission || '',
        agentCommissionType: carrier.agentCommissionType || 'percentage',
        surchargeFee: carrier.surchargeFee || '',
        surchargeType: carrier.surchargeType || 'flat',
      };
      setFormData(initialData);
      setOriginalData(initialData);
      
      // Initialize future pricing entries from carrier prop
      if (carrier.futurePricing) {
        setFuturePricingEntries(carrier.futurePricing);
      } else {
        setFuturePricingEntries([]);
      }
    } else {
      // Reset for new carrier
      const emptyData = {
        carrierName: '',
        originalCarrierServiceType: '',
        fuelTax: '',
        vat: '',
        discount: '',
        agentCommission: '',
        agentCommissionType: 'percentage',
        surchargeFee: '',
        surchargeType: 'flat',
      };
      setFormData(emptyData);
      setOriginalData(emptyData);
      setFuturePricingEntries([]);
    }
  }, [carrier]);

  // Check if any changes have been made
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const formChanged = 
        formData.carrierName !== originalData.carrierName ||
        formData.originalCarrierServiceType !== originalData.originalCarrierServiceType ||
        formData.fuelTax !== originalData.fuelTax ||
        formData.vat !== originalData.vat ||
        formData.discount !== originalData.discount ||
        formData.agentCommission !== originalData.agentCommission ||
        formData.agentCommissionType !== originalData.agentCommissionType ||
        formData.surchargeFee !== originalData.surchargeFee ||
        formData.surchargeType !== originalData.surchargeType;
      setHasChanges(formChanged);
    } else {
      // For new carriers, always enable save button
      setHasChanges(true);
    }
  }, [formData, isEditMode, originalData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const handleFuturePricingSubmit = (pricingData: FuturePricingData) => {
    console.log('Future pricing data:', pricingData);
    if (editingEntryIndex !== null) {
      // Update existing entry
      setFuturePricingEntries(prev => {
        const updated = [...prev];
        updated[editingEntryIndex] = pricingData;
        return updated;
      });
      setEditingEntryIndex(null);
    } else {
      // Add new entry
      setFuturePricingEntries(prev => [...prev, pricingData]);
    }
  };

  const handleEditEntry = (index: number) => {
    setEditingEntryIndex(index);
    setShowFuturePricingDialog(true);
  };

  const handleDeleteEntry = (index: number) => {
    setFuturePricingEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleCloseFuturePricingDialog = () => {
    setShowFuturePricingDialog(false);
    setEditingEntryIndex(null);
  };

  // Mock historical pricing data
  const getHistoricalData = () => {
    if (!isEditMode) return [];
    
    const baseData = [
      {
        dateTimeFrame: '01/15/2024 - 06/30/2024',
        agreementCost: '16.2',
        fuelTax: '2.8',
        vat: '20',
        discount: '-',
        agentCommissionType: '1.5%',
        surcharge: '$0.50',
      },
      {
        dateTimeFrame: '07/01/2023 - 01/14/2024',
        agreementCost: '15.8',
        fuelTax: '2.5',
        vat: '20',
        discount: '5%',
        agentCommissionType: '2%',
        surcharge: '3%',
      },
      {
        dateTimeFrame: '01/01/2023 - 06/30/2023',
        agreementCost: '15.0',
        fuelTax: '2.2',
        vat: '18',
        discount: '-',
        agentCommissionType: '2%',
        surcharge: '-',
      },
    ];
    return baseData;
  };

  const historicalData = getHistoricalData();

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-[560px] p-0 flex flex-col" 
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="px-6 pt-4 pb-3 border-b shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle>{title}</SheetTitle>
              {carrier?.activeRoutes && (
                <div className={`${carrier.activeRoutes === '0' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'} px-3 py-1.5 rounded text-xs font-medium mt-[0px] mr-[24px] mb-[0px] ml-[0px]`}>
                  {carrier.activeRoutes === '0' ? 'No Active Routes' : `${carrier.activeRoutes} Active Routes`}
                </div>
              )}
            </div>
          </SheetHeader>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto pt-[12px] pr-[24px] pb-[24px] pl-[24px] px-[24px] py-[12px]">
            <div className="space-y-8">
              {/* General Section */}
              <div>
                <h3 className="text-xl mb-4">General</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="carrierName" className="text-sm text-gray-700 mb-2 block">
                      Carrier Name
                    </Label>
                    <Input
                      id="carrierName"
                      placeholder="e.g., UPS"
                      value={formData.carrierName}
                      onChange={(e) => handleInputChange('carrierName', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="originalCarrierServiceType" className="text-sm text-gray-700 mb-2 block">
                      Original Carrier Service Type
                    </Label>
                    <Input
                      id="originalCarrierServiceType"
                      placeholder="e.g., UPS"
                      value={formData.originalCarrierServiceType}
                      onChange={(e) => handleInputChange('originalCarrierServiceType', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Current Pricing Section */}
              <div>
                <h3 className="text-xl mb-4">Current Pricing</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fuelTax" className="text-sm text-gray-700 mb-2 block">
                        Fuel Tax
                      </Label>
                      <div className="relative">
                        <Input
                          id="fuelTax"
                          placeholder="4"
                          value={formData.fuelTax}
                          onChange={(e) => handleInputChange('fuelTax', e.target.value)}
                          className="w-full pr-8"
                          disabled={isEditMode}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="vat" className="text-sm text-gray-700 mb-2 block">
                        VAT
                      </Label>
                      <div className="relative">
                        <Input
                          id="vat"
                          placeholder="4"
                          value={formData.vat}
                          onChange={(e) => handleInputChange('vat', e.target.value)}
                          className="w-full pr-8"
                          disabled={isEditMode}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount" className="text-sm text-gray-700 mb-2 block">
                        Discount
                      </Label>
                      <div className="relative">
                        <Input
                          id="discount"
                          placeholder="4"
                          value={formData.discount}
                          onChange={(e) => handleInputChange('discount', e.target.value)}
                          className="w-full pr-8"
                          disabled={isEditMode}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="agentCommission" className="text-sm text-gray-700">
                          Agent Commission
                        </Label>
                        <div className="flex border border-gray-300 rounded overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleInputChange('agentCommissionType', 'flat')}
                            disabled={isEditMode}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${
                              formData.agentCommissionType === 'flat'
                                ? 'bg-gray-200 text-gray-900'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            $
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInputChange('agentCommissionType', 'percentage')}
                            disabled={isEditMode}
                            className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-300 ${
                              formData.agentCommissionType === 'percentage'
                                ? 'bg-gray-200 text-gray-900'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            %
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <Input
                          id="agentCommission"
                          placeholder="4"
                          value={formData.agentCommission}
                          onChange={(e) => handleInputChange('agentCommission', e.target.value)}
                          className={`w-full ${formData.agentCommissionType === 'flat' ? 'pl-8' : 'pr-8'}`}
                          disabled={isEditMode}
                        />
                        <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm ${
                          formData.agentCommissionType === 'flat' ? 'left-3' : 'right-3'
                        }`}>
                          {formData.agentCommissionType === 'flat' ? '$' : '%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="surchargeFee" className="text-sm text-gray-700">
                          Surcharge
                        </Label>
                        <div className="flex border border-gray-300 rounded overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleInputChange('surchargeType', 'flat')}
                            disabled={isEditMode}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${
                              formData.surchargeType === 'flat'
                                ? 'bg-gray-200 text-gray-900'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            $
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInputChange('surchargeType', 'percentage')}
                            disabled={isEditMode}
                            className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-300 ${
                              formData.surchargeType === 'percentage'
                                ? 'bg-gray-200 text-gray-900'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            %
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <Input
                          id="surchargeFee"
                          placeholder="0.50"
                          value={formData.surchargeFee}
                          onChange={(e) => handleInputChange('surchargeFee', e.target.value)}
                          className={`w-full ${formData.surchargeType === 'percentage' ? 'pr-8' : 'pl-8'}`}
                          disabled={isEditMode}
                        />
                        <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm ${
                          formData.surchargeType === 'percentage' ? 'right-3' : 'left-3'
                        }`}>
                          {formData.surchargeType === 'flat' ? '$' : '%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Future Pricing Section */}
              {isEditMode && (
                <div>
                  <h3 className="text-xl mb-4">Future Pricing</h3>
                  {futurePricingEntries.length > 0 && (
                    <div className="mb-4 space-y-4">
                      {futurePricingEntries.map((entry, index) => (
                        <div
                          key={index}
                          className="border border-[rgba(0,0,0,0.12)] rounded-lg p-4 bg-[rgb(255,255,255)] relative"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                              Scheduled for {new Date(entry.starting_day).toLocaleDateString('en-US', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    onClick={() => handleEditEntry(index)}
                                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-full h-8 w-8 p-0"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p>Edit</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                            <div>
                              <div className="text-[12px] text-[rgba(0,0,0,0.6)] mb-1">Fuel Tax</div>
                              <div className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                                {entry.fuel_tax_percent ? `${entry.fuel_tax_percent}%` : '-'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[12px] text-[rgba(0,0,0,0.6)] mb-1">VAT</div>
                              <div className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                                {entry.vat_percent ? `${entry.vat_percent}%` : '-'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[12px] text-[rgba(0,0,0,0.6)] mb-1">Discount</div>
                              <div className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                                {entry.discount_percent ? `${entry.discount_percent}%` : '-'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[12px] text-[rgba(0,0,0,0.6)] mb-1">Agent Commission</div>
                              <div className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                                {entry.agent_commission
                                  ? entry.agent_commission_type === 'percentage'
                                    ? `${entry.agent_commission}%`
                                    : `$${entry.agent_commission}`
                                  : '-'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[12px] text-[rgba(0,0,0,0.6)] mb-1">Surcharge</div>
                              <div className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                                {entry.surcharge_fee
                                  ? entry.surcharge_type === 'flat'
                                    ? `$${entry.surcharge_fee}`
                                    : `${entry.surcharge_fee}%`
                                  : '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setShowFuturePricingDialog(true)}
                    className="w-full justify-center text-[#1976d2] hover:text-[#1565c0] hover:bg-[rgba(25,118,210,0.04)] border border-[rgba(0,0,0,0.12)]"
                  >
                    <span className="text-xl mr-2">+</span>
                    Schedule future pricing
                  </Button>
                </div>
              )}

              {/* Historical Pricing Section */}
              {isEditMode && historicalData.length > 0 && (
                <div className="pt-0 p-[0px]">
                  <button
                    onClick={() => setIsHistoricalPricingOpen(!isHistoricalPricingOpen)}
                    className="w-full flex items-center text-xl mb-4 hover:text-gray-700 transition-colors gap-2"
                  >
                    {isHistoricalPricingOpen ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <h3>Historical Pricing</h3>
                  </button>
                  {isHistoricalPricingOpen && (
                    <div className="space-y-4">
                      {historicalData.map((row, index) => (
                        <div
                          key={index}
                          className="border border-[rgba(0,0,0,0.12)] rounded-lg p-4 bg-white hover:bg-[rgba(0,0,0,0.02)] transition-colors"
                        >
                          <div className="font-['Roboto'] text-[16px] text-[rgba(0,0,0,0.87)] font-medium mb-3">
                            {row.dateTimeFrame}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-[12px] text-[rgba(0,0,0,0.6)] mb-1">Fuel Tax</div>
                              <div className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                                {row.fuelTax}
                              </div>
                            </div>
                            <div>
                              <div className="text-[12px] text-[rgba(0,0,0,0.6)] mb-1">VAT</div>
                              <div className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                                {row.vat}
                              </div>
                            </div>
                            <div>
                              <div className="text-[12px] text-[rgba(0,0,0,0.6)] mb-1">Discount</div>
                              <div className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                                {row.discount}
                              </div>
                            </div>
                            <div>
                              <div className="text-[12px] text-[rgba(0,0,0,0.6)] mb-1">Agent Commission</div>
                              <div className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                                {row.agentCommissionType}
                              </div>
                            </div>
                            <div>
                              <div className="text-[12px] text-[rgba(0,0,0,0.6)] mb-1">Surcharge</div>
                              <div className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                                {row.surcharge}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - Sticky at bottom */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-white shrink-0">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges}
              className="bg-[#1976d2] hover:bg-[#1565c0] text-white"
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Schedule Future Pricing Dialog */}
      <ScheduleFuturePricingDialog
        open={showFuturePricingDialog}
        onClose={handleCloseFuturePricingDialog}
        onSubmit={handleFuturePricingSubmit}
        onDelete={editingEntryIndex !== null ? () => handleDeleteEntry(editingEntryIndex) : undefined}
        editingData={editingEntryIndex !== null ? futurePricingEntries[editingEntryIndex] : null}
        currentPricing={{
          fuelTax: formData.fuelTax === '-' ? '' : formData.fuelTax.replace('%', ''),
          vat: formData.vat === '-' ? '' : formData.vat.replace('%', ''),
          discount: formData.discount === '-' ? '' : formData.discount.replace('%', ''),
          agentCommission: formData.agentCommission === '-' ? '' : formData.agentCommission.replace('%', '').replace('$', ''),
          agentCommissionType: formData.agentCommissionType,
          surcharge: formData.surchargeFee === '-' ? '' : formData.surchargeFee.replace('%', '').replace('$', ''),
          surchargeType: formData.surchargeType,
        }}
      />
    </>
  );
}