import { useId, useState } from 'react';
import { ChevronRight, Plus, X, Calendar, Pencil } from 'lucide-react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../components/ui/tooltip';
import ScheduleFuturePricingDialog, { FuturePricingData } from '../components/ScheduleFuturePricingDialog';

interface PricingData {
  shippingCost: string;
  fuelTax: string;
  vat: string;
  discount: string;
  agentCommission: string;
  agentCommissionType: 'percentage' | 'flat';
  surcharge: string;
  surchargeType: 'flat' | 'percentage';
}

interface HistoricalPricing {
  dateTimeFrame: string;
  agreementCost: string;
  fuelTax: string;
  vat: string;
  discount: string;
  agentCommission: string;
  surcharge: string;
}

interface ScheduledPricing extends PricingData {
  id: string;
  startDate: string;
}

interface PricingAndFeesProps {
  initialData?: PricingData;
}

const muiFontFamily =
  "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

const pricingInputLabelSx = {
  fontFamily: muiFontFamily,
  fontSize: '16px',
  color: 'rgba(0, 0, 0, 0.6)',
  '&.Mui-focused': {
    color: '#1976d2',
  },
} as const;

export default function PricingAndFees({ initialData }: PricingAndFeesProps) {
  const [currentPricing, setCurrentPricing] = useState<PricingData>(initialData || {
    shippingCost: '',
    fuelTax: '',
    vat: '',
    discount: '',
    agentCommission: '',
    agentCommissionType: 'flat',
    surcharge: '',
    surchargeType: 'flat',
  });

  const [isHistoricalExpanded, setIsHistoricalExpanded] = useState(false);
  const [isFuturePricingDialogOpen, setIsFuturePricingDialogOpen] = useState(false);
  const [scheduledPricings, setScheduledPricings] = useState<ScheduledPricing[]>([]);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [futurePricing, setFuturePricing] = useState<PricingData & { startDate: string }>({
    shippingCost: '',
    fuelTax: '',
    vat: '',
    discount: '',
    agentCommission: '',
    agentCommissionType: 'flat',
    surcharge: '',
    surchargeType: 'flat',
    startDate: '',
  });
  const [initialFuturePricing, setInitialFuturePricing] = useState<PricingData & { startDate: string }>({
    shippingCost: '',
    fuelTax: '',
    vat: '',
    discount: '',
    agentCommission: '',
    agentCommissionType: 'flat',
    surcharge: '',
    surchargeType: 'flat',
    startDate: '',
  });

  const agreementCostId = useId();
  const fuelTaxId = useId();
  const vatId = useId();
  const discountId = useId();

  const historicalData: HistoricalPricing[] = [
    {
      dateTimeFrame: '04/12/25 - 05/12/25',
      agreementCost: '15.5',
      fuelTax: '1.05%',
      vat: '1.05%',
      discount: '5%',
      agentCommission: '2%',
      surcharge: '1.5%',
    },
    {
      dateTimeFrame: '05/12/25 - 07/12/25',
      agreementCost: '13.5',
      fuelTax: '1.15%',
      vat: '1.15%',
      discount: '2%',
      agentCommission: '1.5%',
      surcharge: '1.0%',
    },
    {
      dateTimeFrame: '07/12/25 - 09/12/25',
      agreementCost: '16.2',
      fuelTax: '1.10%',
      vat: '1.10%',
      discount: '4%',
      agentCommission: '2.5%',
      surcharge: '2.0%',
    },
  ];

  const agentCommissionTypes = ['Fixed Amount', 'Percentage', 'Tiered'];

  const handleOpenFuturePricingDialog = () => {
    setEditingPricingId(null);
    setIsFuturePricingDialogOpen(true);
  };

  const handleFuturePricingSubmit = (data: FuturePricingData) => {
    if (editingPricingId) {
      // Update existing pricing
      const updatedPricings = scheduledPricings.map((p) =>
        p.id === editingPricingId
          ? {
              id: p.id,
              shippingCost: data.cost,
              fuelTax: data.fuel_tax_percent,
              vat: data.vat_percent,
              discount: data.discount_percent,
              agentCommission: data.agent_commission,
              agentCommissionType: data.agent_commission_type as 'percentage' | 'flat',
              surcharge: data.surcharge_fee,
              surchargeType: data.surcharge_type as 'flat' | 'percentage',
              startDate: data.starting_day,
            }
          : p
      );
      setScheduledPricings(updatedPricings);
    } else {
      // Add new pricing
      const newPricing: ScheduledPricing = {
        id: Date.now().toString(),
        shippingCost: data.cost,
        fuelTax: data.fuel_tax_percent,
        vat: data.vat_percent,
        discount: data.discount_percent,
        agentCommission: data.agent_commission,
        agentCommissionType: data.agent_commission_type as 'percentage' | 'flat',
        surcharge: data.surcharge_fee,
        surchargeType: data.surcharge_type as 'flat' | 'percentage',
        startDate: data.starting_day,
      };
      setScheduledPricings([...scheduledPricings, newPricing]);
    }
  };

  const handleCloseFuturePricingDialog = () => {
    setIsFuturePricingDialogOpen(false);
    setEditingPricingId(null);
  };

  const handleEditPricing = (id: string) => {
    const pricingToEdit = scheduledPricings.find((p) => p.id === id);
    if (pricingToEdit) {
      setFuturePricing({
        shippingCost: pricingToEdit.shippingCost,
        fuelTax: pricingToEdit.fuelTax,
        vat: pricingToEdit.vat,
        discount: pricingToEdit.discount,
        agentCommission: pricingToEdit.agentCommission,
        agentCommissionType: pricingToEdit.agentCommissionType,
        surcharge: pricingToEdit.surcharge,
        surchargeType: pricingToEdit.surchargeType,
        startDate: pricingToEdit.startDate,
      });
      setInitialFuturePricing({
        shippingCost: pricingToEdit.shippingCost,
        fuelTax: pricingToEdit.fuelTax,
        vat: pricingToEdit.vat,
        discount: pricingToEdit.discount,
        agentCommission: pricingToEdit.agentCommission,
        agentCommissionType: pricingToEdit.agentCommissionType,
        surcharge: pricingToEdit.surcharge,
        surchargeType: pricingToEdit.surchargeType,
        startDate: pricingToEdit.startDate,
      });
      setEditingPricingId(id);
      setIsFuturePricingDialogOpen(true);
    }
  };

  const handleDeletePricing = (id: string) => {
    const updatedPricings = scheduledPricings.filter((p) => p.id !== id);
    setScheduledPricings(updatedPricings);
  };

  return (
    <div className="flex flex-col gap-6 px-[24px] py-[0px]">
      {/* Two Column Layout */}
      <div className="flex gap-[72px]">
        {/* Current Pricing Column */}
        <div className="basis-0 grow flex flex-col gap-6 max-w-[600px]">
          <h3 className="text-[20px] text-[rgba(0,0,0,0.87)] leading-[1.334]" style={{ fontFamily: muiFontFamily }}>
            Current Pricing
          </h3>
          <div className="flex flex-col gap-4">
            <FormControl fullWidth size="small">
              <InputLabel htmlFor={agreementCostId} sx={pricingInputLabelSx}>
                Agreement Cost
              </InputLabel>
              <OutlinedInput
                id={agreementCostId}
                label="Agreement Cost"
                value={currentPricing.shippingCost}
                onChange={(e) => setCurrentPricing({ ...currentPricing, shippingCost: e.target.value })}
                placeholder="Agreement Cost"
                variant="outlined"
                size="small"
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                sx={{
                  height: '48px',
                  fontFamily: muiFontFamily,
                  fontSize: '16px',
                  '& .MuiOutlinedInput-input::placeholder': {
                    fontFamily: muiFontFamily,
                    opacity: 1,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'black',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: '2px',
                  },
                }}
              />
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel htmlFor={fuelTaxId} sx={pricingInputLabelSx}>
                Fuel Tax
              </InputLabel>
              <OutlinedInput
                id={fuelTaxId}
                label="Fuel Tax"
                value={currentPricing.fuelTax}
                onChange={(e) => setCurrentPricing({ ...currentPricing, fuelTax: e.target.value })}
                placeholder="Fuel Tax"
                variant="outlined"
                size="small"
                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                sx={{
                  height: '48px',
                  fontFamily: muiFontFamily,
                  fontSize: '16px',
                  '& .MuiOutlinedInput-input::placeholder': {
                    fontFamily: muiFontFamily,
                    opacity: 1,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'black',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: '2px',
                  },
                }}
              />
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel htmlFor={vatId} sx={pricingInputLabelSx}>
                VAT
              </InputLabel>
              <OutlinedInput
                id={vatId}
                label="VAT"
                value={currentPricing.vat}
                onChange={(e) => setCurrentPricing({ ...currentPricing, vat: e.target.value })}
                placeholder="VAT"
                variant="outlined"
                size="small"
                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                sx={{
                  height: '48px',
                  fontFamily: muiFontFamily,
                  fontSize: '16px',
                  '& .MuiOutlinedInput-input::placeholder': {
                    fontFamily: muiFontFamily,
                    opacity: 1,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'black',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: '2px',
                  },
                }}
              />
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel htmlFor={discountId} sx={pricingInputLabelSx}>
                Discount
              </InputLabel>
              <OutlinedInput
                id={discountId}
                label="Discount"
                value={currentPricing.discount}
                onChange={(e) => setCurrentPricing({ ...currentPricing, discount: e.target.value })}
                placeholder="Discount"
                variant="outlined"
                size="small"
                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                sx={{
                  height: '48px',
                  fontFamily: muiFontFamily,
                  fontSize: '16px',
                  '& .MuiOutlinedInput-input::placeholder': {
                    fontFamily: muiFontFamily,
                    opacity: 1,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'black',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: '2px',
                  },
                }}
              />
            </FormControl>
            
            {/* Agent Commission with Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[16px] text-[rgba(0,0,0,0.6)]" style={{ fontFamily: muiFontFamily }}>
                  Agent Commission
                </label>
                <div className="flex border border-[rgba(0,0,0,0.23)] rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setCurrentPricing({ ...currentPricing, agentCommissionType: 'flat' })}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      currentPricing.agentCommissionType === 'flat'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    $
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPricing({ ...currentPricing, agentCommissionType: 'percentage' })}
                    className={`px-3 py-1 text-xs font-medium transition-colors border-l border-[rgba(0,0,0,0.23)] ${
                      currentPricing.agentCommissionType === 'percentage'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
              <FormControl fullWidth size="small">
                <OutlinedInput
                  value={currentPricing.agentCommission}
                  onChange={(e) => setCurrentPricing({ ...currentPricing, agentCommission: e.target.value })}
                  placeholder="4"
                  variant="outlined"
                  size="small"
                  startAdornment={currentPricing.agentCommissionType === 'flat' ? <InputAdornment position="start">$</InputAdornment> : undefined}
                  endAdornment={currentPricing.agentCommissionType === 'percentage' ? <InputAdornment position="end">%</InputAdornment> : undefined}
                  sx={{
                    height: '48px',
                    fontFamily: muiFontFamily,
                    fontSize: '16px',
                    '& .MuiOutlinedInput-input::placeholder': {
                      fontFamily: muiFontFamily,
                      opacity: 1,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'black',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: '2px',
                    },
                  }}
                />
              </FormControl>
            </div>
            
            {/* Surcharge with Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[16px] text-[rgba(0,0,0,0.6)]" style={{ fontFamily: muiFontFamily }}>
                  Surcharge
                </label>
                <div className="flex border border-[rgba(0,0,0,0.23)] rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setCurrentPricing({ ...currentPricing, surchargeType: 'flat' })}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      currentPricing.surchargeType === 'flat'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    $
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPricing({ ...currentPricing, surchargeType: 'percentage' })}
                    className={`px-3 py-1 text-xs font-medium transition-colors border-l border-[rgba(0,0,0,0.23)] ${
                      currentPricing.surchargeType === 'percentage'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
              <FormControl fullWidth size="small">
                <OutlinedInput
                  value={currentPricing.surcharge}
                  onChange={(e) => setCurrentPricing({ ...currentPricing, surcharge: e.target.value })}
                  placeholder="0.50"
                  variant="outlined"
                  size="small"
                  startAdornment={currentPricing.surchargeType === 'flat' ? <InputAdornment position="start">$</InputAdornment> : undefined}
                  endAdornment={currentPricing.surchargeType === 'percentage' ? <InputAdornment position="end">%</InputAdornment> : undefined}
                  sx={{
                    height: '48px',
                    fontFamily: muiFontFamily,
                    fontSize: '16px',
                    '& .MuiOutlinedInput-input::placeholder': {
                      fontFamily: muiFontFamily,
                      opacity: 1,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'black',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: '2px',
                    },
                  }}
                />
              </FormControl>
            </div>
          </div>
        </div>

        {/* Future Pricing Column */}
        <div className="basis-0 grow flex flex-col gap-6 max-w-[600px] relative">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] text-[rgba(0,0,0,0.87)] leading-[1.334]" style={{ fontFamily: muiFontFamily }}>
              Future Pricing
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            {scheduledPricings.length > 0 ? (
              <div className="border border-[rgba(0,0,0,0.12)] rounded overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[rgba(0,0,0,0.04)] hover:bg-[rgba(0,0,0,0.04)]">
                      <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                        Scheduled Date
                      </TableHead>
                      {scheduledPricings.some(p => p.shippingCost !== currentPricing.shippingCost) && (
                        <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                          Shipping Cost
                        </TableHead>
                      )}
                      {scheduledPricings.some(p => p.fuelTax !== currentPricing.fuelTax) && (
                        <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                          Fuel Tax
                        </TableHead>
                      )}
                      {scheduledPricings.some(p => p.vat !== currentPricing.vat) && (
                        <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                          VAT
                        </TableHead>
                      )}
                      {scheduledPricings.some(p => p.discount !== currentPricing.discount) && (
                        <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                          Discount
                        </TableHead>
                      )}
                      {scheduledPricings.some(p => p.agentCommissionType !== currentPricing.agentCommissionType) && (
                        <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                          Agent Commission Type
                        </TableHead>
                      )}
                      <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium w-[80px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledPricings.map((row) => (
                      <TableRow key={row.id} className="hover:bg-[rgba(0,0,0,0.02)]">
                        <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                          {row.startDate}
                        </TableCell>
                        {scheduledPricings.some(p => p.shippingCost !== currentPricing.shippingCost) && (
                          <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                            {row.shippingCost}
                          </TableCell>
                        )}
                        {scheduledPricings.some(p => p.fuelTax !== currentPricing.fuelTax) && (
                          <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                            {row.fuelTax}
                          </TableCell>
                        )}
                        {scheduledPricings.some(p => p.vat !== currentPricing.vat) && (
                          <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                            {row.vat}
                          </TableCell>
                        )}
                        {scheduledPricings.some(p => p.discount !== currentPricing.discount) && (
                          <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                            {row.discount}
                          </TableCell>
                        )}
                        {scheduledPricings.some(p => p.agentCommissionType !== currentPricing.agentCommissionType) && (
                          <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                            {row.agentCommissionType}
                          </TableCell>
                        )}
                        <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleEditPricing(row.id)}
                                className="w-8 h-8 flex items-center justify-center text-[rgba(0,0,0,0.54)] hover:text-[#1976d2] transition-colors rounded-full hover:bg-[rgba(25,118,210,0.04)]"
                                aria-label="Edit pricing"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Edit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}
            <Button
              variant="outline"
              onClick={handleOpenFuturePricingDialog}
              className="h-12 justify-start text-[16px] text-[#1976d2] border-[rgba(0,0,0,0.23)] hover:bg-[rgba(25,118,210,0.04)] hover:text-[#1976d2] hover:border-[#1976d2]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Schedule future pricing
            </Button>
          </div>
        </div>
      </div>

      {/* Historical Pricing Section */}
      <div className="mt-6">
        <button
          onClick={() => setIsHistoricalExpanded(!isHistoricalExpanded)}
          className="flex items-center gap-2 text-[rgba(0,0,0,0.87)] text-[16px] hover:text-[rgba(0,0,0,1)] transition-colors"
        >
          <ChevronRight
            className={`w-5 h-5 transition-transform ${
              isHistoricalExpanded ? 'rotate-90' : ''
            }`}
          />
          <span className="text-[20px]">Historical Pricing</span>
        </button>

        {isHistoricalExpanded && (
          <div className="mt-4 border border-[rgba(0,0,0,0.12)] rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[rgba(0,0,0,0.04)] hover:bg-[rgba(0,0,0,0.04)]">
                  <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                    Date Time Frame
                  </TableHead>
                  <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                    Agreement Cost
                  </TableHead>
                  <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                    Fuel Tax
                  </TableHead>
                  <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                    VAT
                  </TableHead>
                  <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                    Discount
                  </TableHead>
                  <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                    Agent Commission
                  </TableHead>
                  <TableHead className="text-[14px] text-[rgba(0,0,0,0.87)] font-medium">
                    Surcharge
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-[rgba(0,0,0,0.02)]">
                    <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                      {row.dateTimeFrame}
                    </TableCell>
                    <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                      {row.agreementCost}
                    </TableCell>
                    <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                      {row.fuelTax}
                    </TableCell>
                    <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                      {row.vat}
                    </TableCell>
                    <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                      {row.discount}
                    </TableCell>
                    <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                      {row.agentCommission}
                    </TableCell>
                    <TableCell className="text-[14px] text-[rgba(0,0,0,0.87)]">
                      {row.surcharge}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Future Pricing Dialog */}
      <ScheduleFuturePricingDialog
        open={isFuturePricingDialogOpen}
        onClose={handleCloseFuturePricingDialog}
        onSubmit={handleFuturePricingSubmit}
        onDelete={editingPricingId ? () => handleDeletePricing(editingPricingId) : undefined}
        editingData={editingPricingId ? {
          starting_day: scheduledPricings.find(p => p.id === editingPricingId)?.startDate || '',
          cost: scheduledPricings.find(p => p.id === editingPricingId)?.shippingCost || '',
          fuel_tax_percent: scheduledPricings.find(p => p.id === editingPricingId)?.fuelTax || '',
          vat_percent: scheduledPricings.find(p => p.id === editingPricingId)?.vat || '',
          discount_percent: scheduledPricings.find(p => p.id === editingPricingId)?.discount || '',
          agent_commission: scheduledPricings.find(p => p.id === editingPricingId)?.agentCommission || '',
          agent_commission_type: scheduledPricings.find(p => p.id === editingPricingId)?.agentCommissionType || 'percentage',
          surcharge_fee: scheduledPricings.find(p => p.id === editingPricingId)?.surcharge || '',
          surcharge_type: scheduledPricings.find(p => p.id === editingPricingId)?.surchargeType || 'flat',
        } : null}
        currentPricing={{
          agreementCost: currentPricing.shippingCost,
          fuelTax: currentPricing.fuelTax,
          vat: currentPricing.vat,
          discount: currentPricing.discount,
          agentCommission: currentPricing.agentCommission,
          agentCommissionType: currentPricing.agentCommissionType,
          surcharge: currentPricing.surcharge,
          surchargeType: currentPricing.surchargeType,
        }}
      />
    </div>
  );
}