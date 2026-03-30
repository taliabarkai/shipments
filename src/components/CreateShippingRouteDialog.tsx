import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import Fab from '../imports/Fab';
import Frame625133 from '../imports/Frame625133';
import PricingAndFees from '../imports/PricingAndFees';
import { ChevronDown } from 'lucide-react';
import { ShippingRoute } from './ShippingRoutesTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface CreateShippingRouteDialogProps {
  onClose: () => void;
  onSubmit: (routeData: any) => void;
  route?: ShippingRoute | null;
}

export default function CreateShippingRouteDialog({
  onClose,
  onSubmit,
  route,
}: CreateShippingRouteDialogProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'pricing'>('properties');
  const [status, setStatus] = useState<'Inactive' | 'Active'>(route?.status || 'Inactive');
  const [formData, setFormData] = useState({
    packingFacility: route?.packingFacility || '',
    destinationCountries: route?.destinationCountries || [],
    carrierServiceType: route?.carrierServiceType || '',
    carrierName: route?.carrierName || '',
    originalCarrierServiceType: route?.originalCarrierServiceType || '',
    slug: route?.slug || '',
    method: route?.method || '',
    shippingCost: route?.shippingCost || '',
    packingTimeFrame: route?.packingTimeFrame || '',
    shippingTimeFrame: route?.shippingTimeFrame || '',
    maxShippingValue: route?.maxShippingValue || '',
    currencyCode: route?.currencyCode || '',
    shippingWorkingDays: route?.shippingWorkingDays ? route.shippingWorkingDays.split(', ') : [],
  });

  const isEditMode = !!route;
  const title = isEditMode ? `Update ${route.toCountryCodes}` : 'Create Shipping Route';

  // Store original values for comparison when in edit mode
  const [originalData] = useState({
    status: route?.status || 'Inactive',
    ...formData,
  });

  // Check if any changes have been made
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const formChanged = 
        status !== originalData.status ||
        formData.packingFacility !== originalData.packingFacility ||
        JSON.stringify(formData.destinationCountries) !== JSON.stringify(originalData.destinationCountries) ||
        formData.carrierServiceType !== originalData.carrierServiceType ||
        formData.carrierName !== originalData.carrierName ||
        formData.originalCarrierServiceType !== originalData.originalCarrierServiceType ||
        formData.slug !== originalData.slug ||
        formData.method !== originalData.method ||
        formData.shippingCost !== originalData.shippingCost ||
        formData.packingTimeFrame !== originalData.packingTimeFrame ||
        formData.shippingTimeFrame !== originalData.shippingTimeFrame ||
        formData.maxShippingValue !== originalData.maxShippingValue ||
        formData.currencyCode !== originalData.currencyCode ||
        JSON.stringify(formData.shippingWorkingDays) !== JSON.stringify(originalData.shippingWorkingDays);
      setHasChanges(formChanged);
    } else {
      // For new routes, always enable save button
      setHasChanges(true);
    }
  }, [formData, status, isEditMode, originalData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const packingFacilities = ['Berlin', 'Cairo', 'Kiryat Gat', 'Nazareth', 'Moscow', 'Mumbai', 'Seoul', 'São Paulo', 'Thailand', 'Tokyo'];
  const destinationCountries = ['Africa', 'Asia', 'Australia', 'NZ', 'Canada', 'Europe', 'South America', 'USA'];
  const carrierServiceTypes = ['DHL', 'FedEx', 'Global Post TH', 'GlobalPost', 'Korea Post', 'UPS', 'USPS', 'DHL TH'];
  const methods = ['Expedited', 'Express', 'Standard'];
  const currencyCodes = ['BRL', 'EGP', 'EUR', 'INR', 'KRW', 'RUB', 'USD'];
  const workingDays = ['Monday-Friday', 'Monday-Saturday', 'Every Day'];

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`gap-1 px-3 py-1.5 text-xs h-auto ${
                  status === 'Inactive' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' : 'bg-green-100 text-green-800 hover:bg-green-100'
                }`}
              >
                {status}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatus('Inactive')}>
                Inactive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus('Active')}>
                Active
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="border-b px-6 bg-white shrink-0">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 pb-3 pt-4 text-sm font-medium border-b-2 transition-colors uppercase ${
                activeTab === 'properties'
                  ? 'border-[#1976d2] text-[#1976d2]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Route Properties
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 pb-3 pt-4 text-sm font-medium border-b-2 transition-colors uppercase ${
                activeTab === 'pricing'
                  ? 'border-[#1976d2] text-[#1976d2]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Pricing & Fees
            </button>
          </div>
        </div>

        {/* Content with light gray background */}
        <div className="flex-1 overflow-y-auto p-6 bg-[rgb(255,255,255)]">
          {activeTab === 'properties' && (
            <Frame625133 key={route?.id ?? 'new'} initialData={formData} onDataChange={setFormData} />
          )}

          {activeTab === 'pricing' && (
            <PricingAndFees initialData={route ? {
              shippingCost: route.shippingCost || '',
              fuelTax: route.fuelTax || '',
              vat: route.vat || '',
              discount: route.discount || '',
              agentCommissionType: route.agentCommissionType || '',
            } : undefined} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 bg-white shrink-0">
          <Button variant="outline" onClick={onClose} className="h-9 px-4">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#1976d2] hover:bg-[#1565c0] h-9 px-4"
            disabled={!hasChanges}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}