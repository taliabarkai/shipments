import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';

interface ScheduleFuturePricingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FuturePricingData) => void;
  onDelete?: () => void;
  editingData?: FuturePricingData | null;
  currentPricing?: {
    agreementCost?: string;
    fuelTax?: string;
    vat?: string;
    discount?: string;
    agentCommission?: string;
    agentCommissionType?: string;
    surcharge?: string;
    surchargeType?: string;
  };
}

export interface FuturePricingData {
  starting_day: string;
  cost: string;
  fuel_tax_percent: string;
  vat_percent: string;
  discount_percent: string;
  agent_commission: string;
  agent_commission_type: string;
  surcharge_fee: string;
  surcharge_type: string;
}

export default function ScheduleFuturePricingDialog({
  open,
  onClose,
  onSubmit,
  onDelete,
  editingData,
  currentPricing = {},
}: ScheduleFuturePricingDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState<FuturePricingData>({
    starting_day: '',
    cost: currentPricing.agreementCost || '',
    fuel_tax_percent: currentPricing.fuelTax || '',
    vat_percent: currentPricing.vat || '',
    discount_percent: currentPricing.discount || '',
    agent_commission: currentPricing.agentCommission || '',
    agent_commission_type: currentPricing.agentCommissionType || 'flat',
    surcharge_fee: currentPricing.surcharge || '',
    surcharge_type: currentPricing.surchargeType || 'flat',
  });

  // Store original pricing values for comparison
  const [originalPricing, setOriginalPricing] = useState<Partial<FuturePricingData>>({});

  // Pre-fill form with current pricing when dialog opens
  useEffect(() => {
    if (open) {
      if (editingData) {
        // If editing, load the editing data
        setFormData(editingData);
        setOriginalPricing(editingData);
        setSelectedDate(new Date(editingData.starting_day));
      } else if (currentPricing) {
        // If creating new, load current pricing as defaults
        const initialData = {
          starting_day: '',
          cost: currentPricing.agreementCost || '',
          fuel_tax_percent: currentPricing.fuelTax || '',
          vat_percent: currentPricing.vat || '',
          discount_percent: currentPricing.discount || '',
          agent_commission: currentPricing.agentCommission || '',
          agent_commission_type: currentPricing.agentCommissionType || 'flat',
          surcharge_fee: currentPricing.surcharge || '',
          surcharge_type: currentPricing.surchargeType || 'flat',
        };
        setFormData(initialData);
        setOriginalPricing(initialData);
        setSelectedDate(undefined);
      }
    }
  }, [open, currentPricing, editingData]);

  // Update starting_day when date is selected
  useEffect(() => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        starting_day: `${year}-${month}-${day}`,
      }));
    }
  }, [selectedDate]);

  const handleInputChange = (field: keyof FuturePricingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClearAll = () => {
    setFormData({
      starting_day: '',
      cost: '',
      fuel_tax_percent: '',
      vat_percent: '',
      discount_percent: '',
      agent_commission: '',
      agent_commission_type: 'flat',
      surcharge_fee: '',
      surcharge_type: 'flat',
    });
    setSelectedDate(undefined);
  };

  const handleSchedule = () => {
    onSubmit(formData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Check if any value has changed from the original pricing
  const hasChanges = 
    formData.cost !== originalPricing.cost ||
    formData.fuel_tax_percent !== originalPricing.fuel_tax_percent ||
    formData.vat_percent !== originalPricing.vat_percent ||
    formData.discount_percent !== originalPricing.discount_percent ||
    formData.agent_commission !== originalPricing.agent_commission ||
    formData.agent_commission_type !== originalPricing.agent_commission_type ||
    formData.surcharge_fee !== originalPricing.surcharge_fee ||
    formData.surcharge_type !== originalPricing.surcharge_type;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Schedule Future Pricing</DialogTitle>
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="text-[#1976d2] hover:text-[#1565c0] hover:bg-[rgba(25,118,210,0.04)] text-sm"
            >
              Clear All
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Starting Day */}
          <div>
            <Label htmlFor="starting_day" className="text-sm text-gray-700 mb-2 block">
              Starting Day
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-input-background border-input-border hover:border-black"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    selectedDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Two Column Layout for remaining fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Agreement Cost - Only show if provided */}
            {currentPricing.agreementCost !== undefined && (
              <div>
                <Label htmlFor="cost" className="text-sm text-gray-700 mb-2 block">
                  Agreement Cost
                </Label>
                <div className="relative">
                  <Input
                    id="cost"
                    type="number"
                    placeholder="15"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                    className="w-full pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                    $
                  </span>
                </div>
              </div>
            )}

            {/* Discount */}
            <div>
              <Label htmlFor="discount_percent" className="text-sm text-gray-700 mb-2 block">
                Discount
              </Label>
              <div className="relative">
                <Input
                  id="discount_percent"
                  type="number"
                  placeholder="e.g., 10"
                  value={formData.discount_percent}
                  onChange={(e) => handleInputChange('discount_percent', e.target.value)}
                  className="w-full pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                  %
                </span>
              </div>
            </div>

            {/* Fuel Tax */}
            <div>
              <Label htmlFor="fuel_tax_percent" className="text-sm text-gray-700 mb-2 block">
                Fuel Tax
              </Label>
              <div className="relative">
                <Input
                  id="fuel_tax_percent"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.fuel_tax_percent}
                  onChange={(e) => handleInputChange('fuel_tax_percent', e.target.value)}
                  className="w-full pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                  %
                </span>
              </div>
            </div>

            {/* VAT */}
            <div>
              <Label htmlFor="vat_percent" className="text-sm text-gray-700 mb-2 block">
                VAT
              </Label>
              <div className="relative">
                <Input
                  id="vat_percent"
                  type="number"
                  placeholder="e.g., 12"
                  value={formData.vat_percent}
                  onChange={(e) => handleInputChange('vat_percent', e.target.value)}
                  className="w-full pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                  %
                </span>
              </div>
            </div>

            {/* Agent Commission Type */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="agent_commission" className="text-sm text-gray-700">
                  Agent Commission
                </Label>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleInputChange('agent_commission_type', 'flat')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      formData.agent_commission_type === 'flat'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    $
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('agent_commission_type', 'percentage')}
                    className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-300 ${
                      formData.agent_commission_type === 'percentage'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
              <div className="relative">
                <Input
                  id="agent_commission"
                  type="number"
                  placeholder="e.g., 1"
                  value={formData.agent_commission}
                  onChange={(e) => handleInputChange('agent_commission', e.target.value)}
                  className={`w-full ${formData.agent_commission_type === 'flat' ? 'pl-8' : 'pr-8'}`}
                />
                <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm ${
                  formData.agent_commission_type === 'flat' ? 'left-3' : 'right-3'
                }`}>
                  {formData.agent_commission_type === 'flat' ? '$' : '%'}
                </span>
              </div>
            </div>

            {/* Surcharge */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="surcharge_fee" className="text-sm text-gray-700">
                  Surcharge Fee
                </Label>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleInputChange('surcharge_type', 'flat')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      formData.surcharge_type === 'flat'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    $
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('surcharge_type', 'percentage')}
                    className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-300 ${
                      formData.surcharge_type === 'percentage'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
              <div className="relative">
                <Input
                  id="surcharge_fee"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 0.1"
                  value={formData.surcharge_fee}
                  onChange={(e) => handleInputChange('surcharge_fee', e.target.value)}
                  className={`w-full ${formData.surcharge_type === 'percentage' ? 'pr-8' : 'pl-8'}`}
                />
                <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm ${
                  formData.surcharge_type === 'percentage' ? 'right-3' : 'left-3'
                }`}>
                  {formData.surcharge_type === 'flat' ? '$' : '%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <div>
            {editingData && onDelete && (
              <Button
                variant="ghost"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!formData.starting_day || !hasChanges}
              className="bg-[#1976d2] hover:bg-[#1565c0] text-white"
            >
              {editingData ? 'Update' : 'Schedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}