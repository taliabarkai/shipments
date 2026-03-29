import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import Fab from '../imports/Fab';
import { ChevronRight } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import ScheduleFuturePricingDialog, { FuturePricingData } from './ScheduleFuturePricingDialog';

interface CreateCarrierDialogProps {
  onClose: () => void;
  onSubmit: (carrierData: any) => void;
  carrier?: any | null;
}

export default function CreateCarrierDialog({
  onClose,
  onSubmit,
  carrier,
}: CreateCarrierDialogProps) {
  const [formData, setFormData] = useState({
    carrierName: carrier?.carrier || '',
    originalCarrierServiceType: carrier?.originalCarrierServiceType || '',
    agreementCost: carrier?.agreementCost || '',
    fuelTax: carrier?.fuelTax || '',
    vat: carrier?.vat || '',
    discount: carrier?.discount || '',
    agentCommission: carrier?.agentCommission || '',
    agentCommissionType: carrier?.agentCommissionType || 'percentage',
    surchargeFee: carrier?.surchargeFee || '',
    surchargeType: carrier?.surchargeType || 'flat',
  });

  const [isHistoricalPricingOpen, setIsHistoricalPricingOpen] = useState(false);
  const [showFuturePricingDialog, setShowFuturePricingDialog] = useState(false);
  const [futurePricingEntries, setFuturePricingEntries] = useState<FuturePricingData[]>([]);

  const isEditMode = !!carrier;
  const title = isEditMode ? `Update ${carrier.carrier}` : 'Create Carrier';

  // Store original values for comparison when in edit mode
  const [originalData] = useState({
    ...formData,
  });

  // Check if any changes have been made
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const formChanged = 
        formData.carrierName !== originalData.carrierName ||
        formData.originalCarrierServiceType !== originalData.originalCarrierServiceType ||
        formData.agreementCost !== originalData.agreementCost ||
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
    // Handle future pricing submission logic here
    setFuturePricingEntries(prev => [...prev, pricingData]);
  };

  // Mock historical pricing data
  const getHistoricalData = () => {
    if (!isEditMode) return [];
    
    // Generate mock historical data based on carrier name
    const baseData = [
      {
        dateTimeFrame: '01/15/2024 - 06/30/2024',
        agreementCost: '16.2',
        fuelTax: '2.8',
        discount: '-',
        agentCommissionType: '1.5%',
      },
      {
        dateTimeFrame: '07/01/2023 - 01/14/2024',
        agreementCost: '15.8',
        fuelTax: '2.5',
        discount: '5%',
        agentCommissionType: '2%',
      },
      {
        dateTimeFrame: '01/01/2023 - 06/30/2023',
        agreementCost: '15.0',
        fuelTax: '2.2',
        discount: '-',
        agentCommissionType: '2%',
      },
    ];
    return baseData;
  };

  const historicalData = getHistoricalData();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[rgb(249,250,251)]">
      {/* White Card Container with 24px margin */}
      <div className="flex-1 mx-6 my-6 bg-white rounded-lg shadow-sm flex flex-col overflow-hidden">
        {/* Header - Inside the white card */}
        <div className="flex items-center justify-between px-6 py-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-10 h-10">
              <Fab />
            </button>
            <h2 className="text-xl font-medium text-black/87">{title}</h2>
          </div>
          {carrier?.activeRoutes && (
            <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded text-xs font-medium">
              {carrier.activeRoutes} Active Routes
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b px-6 bg-white shrink-0">
          <div className="flex gap-0">
            <button
              className="px-4 pb-3 pt-4 text-sm font-medium border-b-2 transition-colors uppercase border-[#1976d2] text-[#1976d2]"
            >
              Settings
            </button>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* First Row: Three Columns - General, Pricing (Part 1), Pricing (Part 2) */}
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - General */}
              <div>
                <h3 className="font-medium mb-6 text-[20px] font-normal">General</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="carrierName" className="text-sm text-gray-700 mb-2 block">
                      Carrier Service Name
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

              {/* Middle Column - Pricing Part 1 */}
              <div>
                <h3 className="font-medium mb-6 text-[20px] font-normal">Pricing</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agreementCost" className="text-sm text-gray-700 mb-2 block">
                      Agreement Cost
                    </Label>
                    <Input
                      id="agreementCost"
                      placeholder="e.g., $10.00 or 4%"
                      value={formData.agreementCost}
                      onChange={(e) => handleInputChange('agreementCost', e.target.value)}
                      className="w-full"
                      disabled={isEditMode}
                    />
                  </div>

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
              </div>

              {/* Right Column - Pricing Part 2 */}
              <div>
                <h3 className="font-medium mb-6 text-[20px] font-normal invisible">Pricing</h3>
                <div className="space-y-4">
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
                          onClick={() => handleInputChange('agentCommissionType', 'percentage')}
                          disabled={isEditMode}
                          className={`px-3 py-1 text-xs font-medium transition-colors ${
                            formData.agentCommissionType === 'percentage'
                              ? 'bg-gray-200 text-gray-900'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('agentCommissionType', 'flat')}
                          disabled={isEditMode}
                          className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-300 ${
                            formData.agentCommissionType === 'flat'
                              ? 'bg-gray-200 text-gray-900'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          $
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        id="agentCommission"
                        placeholder="4"
                        value={formData.agentCommission}
                        onChange={(e) => handleInputChange('agentCommission', e.target.value)}
                        className={`w-full ${formData.agentCommissionType === 'percentage' ? 'pr-8' : 'pl-8'}`}
                        disabled={isEditMode}
                      />
                      <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm ${
                        formData.agentCommissionType === 'percentage' ? 'right-3' : 'left-3'
                      }`}>
                        {formData.agentCommissionType === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="surchargeFee" className="text-sm text-gray-700">
                        Surcharge Fee
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

            {/* Second Row: Future Pricing - Full Width */}
            {isEditMode && (
              <div>
                <h3 className="font-medium mb-6 text-[20px] font-normal">Future Pricing</h3>
                {futurePricingEntries.length > 0 && (
                  <div className="mb-4 border border-[rgba(0,0,0,0.12)] rounded overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[rgba(0,0,0,0.04)] hover:bg-[rgba(0,0,0,0.04)]">
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Effective Date
                          </TableHead>
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Agreement Cost
                          </TableHead>
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Fuel Tax
                          </TableHead>
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            VAT
                          </TableHead>
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Discount
                          </TableHead>
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Agent Commission
                          </TableHead>
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Surcharge
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {futurePricingEntries.map((entry, index) => (
                          <TableRow key={index} className="hover:bg-[rgba(0,0,0,0.02)]">
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {new Date(entry.starting_day).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })}
                            </TableCell>
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {entry.cost || '-'}
                            </TableCell>
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {entry.fuel_tax_percent ? `${entry.fuel_tax_percent}%` : '-'}
                            </TableCell>
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {entry.vat_percent ? `${entry.vat_percent}%` : '-'}
                            </TableCell>
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {entry.discount_percent ? `${entry.discount_percent}%` : '-'}
                            </TableCell>
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {entry.agent_commission 
                                ? entry.agent_commission_type === 'percentage' 
                                  ? `${entry.agent_commission}%`
                                  : `$${entry.agent_commission}`
                                : '-'}
                            </TableCell>
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {entry.surcharge_fee 
                                ? entry.surcharge_type === 'flat' 
                                  ? `$${entry.surcharge_fee}`
                                  : `${entry.surcharge_fee}%`
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <div className="w-1/3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowFuturePricingDialog(true)}
                    className="w-full justify-center text-[#1976d2] hover:text-[#1565c0] hover:bg-[rgba(25,118,210,0.04)] border border-[rgba(0,0,0,0.12)]"
                  >
                    <span className="text-xl mr-2">+</span>
                    Schedule future pricing
                  </Button>
                </div>
              </div>
            )}

            {/* Third Row: Historical Pricing - Full Width */}
            {isEditMode && (
              <div className="pt-[24px] pr-[0px] pb-[0px] pl-[0px]">
                <div className="border-t border-[rgba(0,0,0,0.12)] mb-6"></div>
                <button
                  onClick={() => setIsHistoricalPricingOpen(!isHistoricalPricingOpen)}
                  className="flex items-center gap-2 text-[rgba(0,0,0,0.87)] font-['Roboto'] text-[16px] hover:text-[rgba(0,0,0,1)] transition-colors"
                >
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      isHistoricalPricingOpen ? 'rotate-90' : ''
                    }`}
                  />
                  <span className="text-[20px]">Historical Pricing</span>
                </button>
                {isHistoricalPricingOpen && (
                  <div className="mt-4 border border-[rgba(0,0,0,0.12)] rounded overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[rgba(0,0,0,0.04)] hover:bg-[rgba(0,0,0,0.04)]">
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Date Time Frame
                          </TableHead>
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Agreement Cost
                          </TableHead>
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Fuel Tax
                          </TableHead>
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Discount
                          </TableHead>
                          <TableHead className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                            Agent Commission Type
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historicalData.map((row, index) => (
                          <TableRow key={index} className="hover:bg-[rgba(0,0,0,0.02)]">
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {row.dateTimeFrame}
                            </TableCell>
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {row.agreementCost}
                            </TableCell>
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {row.fuelTax}
                            </TableCell>
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {row.discount}
                            </TableCell>
                            <TableCell className="font-['Roboto'] text-[14px] text-[rgba(0,0,0,0.87)]">
                              {row.agentCommissionType}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
      </div>

      {/* Schedule Future Pricing Dialog */}
      <ScheduleFuturePricingDialog
        open={showFuturePricingDialog}
        onClose={() => setShowFuturePricingDialog(false)}
        onSubmit={handleFuturePricingSubmit}
        currentPricing={{
          agreementCost: formData.agreementCost === '-' ? '' : formData.agreementCost,
          fuelTax: formData.fuelTax === '-' ? '' : formData.fuelTax.replace('%', ''),
          vat: formData.vat === '-' ? '' : formData.vat.replace('%', ''),
          discount: formData.discount === '-' ? '' : formData.discount.replace('%', ''),
          agentCommission: formData.agentCommission === '-' ? '' : formData.agentCommission.replace('%', '').replace('$', ''),
          agentCommissionType: formData.agentCommissionType,
          surcharge: formData.surchargeFee === '-' ? '' : formData.surchargeFee.replace('%', '').replace('$', ''),
          surchargeType: formData.surchargeType,
        }}
      />
    </div>
  );
}