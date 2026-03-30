import { useId, useMemo, useState } from 'react';
import { Input } from '../components/ui/input';
import { Check } from 'lucide-react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

const muiFontFamily =
  "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

const inputLabelSx = {
  fontFamily: muiFontFamily,
  fontSize: '16px',
  color: 'rgba(0, 0, 0, 0.6)',
  '&.Mui-focused': {
    color: '#1976d2',
  },
} as const;

// Custom MUI-styled Select component
function MUISelect({ value, onChange, placeholder, options }: { value: string; onChange: (value: string) => void; placeholder: string; options: string[] }) {
  const labelId = useId();
  const selectId = useId();
  const [open, setOpen] = useState(false);
  const selectOptions = useMemo(
    () => (value !== '' && !options.includes(value) ? [...options, value] : options),
    [options, value]
  );
  const labelShrink = value !== '' || open;

  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full p-[0px]">
      <FormControl fullWidth variant="outlined">
        <InputLabel id={labelId} htmlFor={selectId} shrink={labelShrink} sx={inputLabelSx}>
          {placeholder}
        </InputLabel>
        <Select
          id={selectId}
          labelId={labelId}
          label={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          displayEmpty
          renderValue={(selected) => {
            if (selected === '') {
              return '\u200b';
            }
            return selected as string;
          }}
          sx={{
            height: '48px',
            fontFamily: muiFontFamily,
            fontSize: '16px',
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
            borderRadius: '4px',
            backgroundColor: 'white',
          }}
        >
          <MenuItem value="" sx={{ display: 'none' }} aria-hidden />
          {selectOptions.map((option) => (
            <MenuItem key={option} value={option} sx={{ fontFamily: muiFontFamily, fontSize: '16px' }}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

// Custom MUI-styled MultiSelect component
function MUIMultiSelect({ 
  value, 
  onChange, 
  placeholder, 
  options 
}: { 
  value: string[]; 
  onChange: (value: string[]) => void; 
  placeholder: string; 
  options: string[] 
}) {
  const labelId = useId();
  const selectId = useId();
  const [open, setOpen] = useState(false);
  const hasSelection = value.length > 0;
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <FormControl fullWidth variant="outlined">
        <InputLabel id={labelId} htmlFor={selectId} shrink={hasSelection || open} sx={inputLabelSx}>
          {placeholder}
        </InputLabel>
        <Select
          id={selectId}
          labelId={labelId}
          label={placeholder}
          multiple
          value={value}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          onChange={(e) => onChange(e.target.value as string[])}
          renderValue={(selected) =>
            selected.length === 0 ? (
              '\u200b'
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    onDelete={() => {
                      onChange(selected.filter((s) => s !== item));
                    }}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                    sx={{
                      height: '24px',
                      fontSize: '13px',
                      fontFamily: muiFontFamily,
                      backgroundColor: '#f5f5f5',
                      '& .MuiChip-deleteIcon': {
                        fontSize: '16px',
                        color: 'rgba(0, 0, 0, 0.6)',
                        '&:hover': {
                          color: 'rgba(0, 0, 0, 0.87)',
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            )
          }
          sx={{
            minHeight: '48px',
            fontFamily: muiFontFamily,
            fontSize: '16px',
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
            borderRadius: '4px',
            backgroundColor: 'white',
          }}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option} sx={{ fontFamily: muiFontFamily, fontSize: '16px' }}>
              <Checkbox 
                checked={value.indexOf(option) > -1}
                sx={{
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-checked': {
                    color: '#1976d2',
                  },
                }}
              />
              <ListItemText
                primary={option}
                primaryTypographyProps={{ sx: { fontFamily: muiFontFamily, fontSize: '16px' } }}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

// Custom MUI-styled Input component
function MUIInput({ value, onChange, placeholder, inputPlaceholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; inputPlaceholder?: string }) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const labelShrink = Boolean(value) || focused;

  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <FormControl fullWidth variant="outlined">
        <InputLabel htmlFor={id} shrink={labelShrink} sx={inputLabelSx}>
          {placeholder}
        </InputLabel>
        <OutlinedInput
          id={id}
          label={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={inputPlaceholder || `Enter ${placeholder.toLowerCase()}`}
          sx={{
            height: '56px',
            fontFamily: muiFontFamily,
            fontSize: '16px',
            color: 'rgba(0, 0, 0, 0.87)',
            '& .MuiOutlinedInput-input': {
              padding: '16px 14px',
              '&::placeholder': {
                color: 'rgba(0, 0, 0, 0.38)',
                opacity: 1,
                fontFamily: muiFontFamily,
              },
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
            borderRadius: '4px',
            backgroundColor: 'white',
          }}
        />
      </FormControl>
    </div>
  );
}

interface FormData {
  packingFacility: string;
  destinationCountries: string[];
  carrierServiceType: string;
  carrierName: string;
  originalCarrierServiceType: string;
  slug: string;
  method: string;
  shippingCost: string;
  packingTimeFrame: string;
  shippingTimeFrame: string;
  maxShippingValue: string;
  currencyCode: string;
  shippingWorkingDays: string[];
}

interface FrameProps {
  initialData?: FormData;
  onDataChange?: (data: FormData) => void;
}

function Frame1({ formData, setFormData }: { formData: FormData; setFormData: (data: FormData) => void }) {
  const packingFacilities = ['Kiryat Gat', 'Nazareth', 'Thailand', 'Hungary'];
  const destinationCountries = ['Africa', 'Asia', 'Australia', 'NZ', 'Canada', 'Europe', 'South America', 'USA'];
  const carrierServiceTypes = ['DHL', 'FedEx', 'Global Post TH', 'GlobalPost', 'Korea Post', 'UPS', 'USPS', 'DHL TH'];
  const methods = ['Expedited', 'Express', 'Standard'];

  // Carrier data from Global Carrier Settings
  const carriers = [
    { name: 'DHL', originalServiceType: 'Express' },
    { name: 'FedEx', originalServiceType: 'Ground' },
    { name: 'UPS', originalServiceType: 'Next Day Air' },
    { name: 'MailLog', originalServiceType: 'Standard' },
    { name: 'USPS', originalServiceType: 'Priority Mail' },
    { name: 'ShineOn', originalServiceType: 'Express' },
    { name: 'Tapuz', originalServiceType: 'LTL' },
    { name: 'RoyalMail', originalServiceType: 'First Class' },
    { name: 'Hermes', originalServiceType: 'Standard' },
    { name: 'IsraelPost', originalServiceType: 'Express' },
    { name: 'Landmark', originalServiceType: 'Ground' },
  ];

  const carrierNames = carriers.map(c => c.name);
  
  // Get original service types for the selected carrier
  const selectedCarrier = carriers.find(c => c.name === formData.carrierName);
  const originalServiceTypes = selectedCarrier ? [selectedCarrier.originalServiceType] : [];
  const originalCarrierOptions =
    originalServiceTypes.length > 0
      ? originalServiceTypes
      : formData.originalCarrierServiceType
        ? [formData.originalCarrierServiceType]
        : [];

  return (
    <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start max-w-[600px] min-h-px min-w-px relative shrink-0">
      <div
        className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[24px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontFamily: muiFontFamily }}
      >
        <p className="leading-[1.334] text-[20px]">General</p>
      </div>
      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
        <MUISelect
          value={formData.packingFacility}
          onChange={(value) => setFormData({ ...formData, packingFacility: value })}
          placeholder="Packing Facility"
          options={packingFacilities}
        />
        <MUIMultiSelect
          value={formData.destinationCountries}
          onChange={(value) => setFormData({ ...formData, destinationCountries: value })}
          placeholder="Destination Countries"
          options={destinationCountries}
        />
        <MUISelect
          value={formData.carrierServiceType}
          onChange={(value) => setFormData({ ...formData, carrierServiceType: value })}
          placeholder="Carrier Service Type"
          options={carrierServiceTypes}
        />
        <MUISelect
          value={formData.carrierName}
          onChange={(value) => {
            const carrier = carriers.find(c => c.name === value);
            setFormData({ 
              ...formData, 
              carrierName: value,
              originalCarrierServiceType: carrier?.originalServiceType || ''
            });
          }}
          placeholder="Carrier Name"
          options={carrierNames}
        />
        <MUISelect
          value={formData.originalCarrierServiceType}
          onChange={(value) => setFormData({ ...formData, originalCarrierServiceType: value })}
          placeholder="Original Carrier Service Type"
          options={originalCarrierOptions}
        />
        <MUIInput
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="Slug"
          inputPlaceholder="e.g., dhl-express-usa"
        />
        <MUISelect
          value={formData.method}
          onChange={(value) => setFormData({ ...formData, method: value })}
          placeholder="Shipping Method"
          options={methods}
        />
      </div>
    </div>
  );
}

function ShippingRoute({ formData, setFormData }: { formData: FormData; setFormData: (data: FormData) => void }) {
  const currencyCodes = ['BRL', 'EGP', 'EUR', 'INR', 'KRW', 'RUB', 'USD'];
  const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start max-w-[600px] min-h-px min-w-px relative shrink-0" data-name="shipping route">
      <div
        className="flex flex-col font-normal justify-center leading-[0] min-w-full relative shrink-0 text-[24px] text-[rgba(0,0,0,0.87)] w-[min-content]"
        style={{ fontFamily: muiFontFamily }}
      >
        <p className="leading-[1.334] text-[20px]">Shipping Values</p>
      </div>
      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
        <MUIInput
          value={formData.shippingCost}
          onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
          placeholder="Shipping Cost"
          inputPlaceholder="e.g., 25.00"
        />
        <MUIInput
          value={formData.packingTimeFrame}
          onChange={(e) => setFormData({ ...formData, packingTimeFrame: e.target.value })}
          placeholder="Packing Time Frame"
          inputPlaceholder="e.g., 1-2 business days"
        />
        <MUIInput
          value={formData.shippingTimeFrame}
          onChange={(e) => setFormData({ ...formData, shippingTimeFrame: e.target.value })}
          placeholder="Shipping Time Frame"
          inputPlaceholder="e.g., 3-5 business days"
        />
        <MUIInput
          value={formData.maxShippingValue}
          onChange={(e) => setFormData({ ...formData, maxShippingValue: e.target.value })}
          placeholder="Max Shipping Value"
          inputPlaceholder="e.g., 1000.00"
        />
        <MUISelect
          value={formData.currencyCode}
          onChange={(value) => setFormData({ ...formData, currencyCode: value })}
          placeholder="Currency Code"
          options={currencyCodes}
        />
        <MUIMultiSelect
          value={formData.shippingWorkingDays}
          onChange={(value) => setFormData({ ...formData, shippingWorkingDays: value })}
          placeholder="Shipping Working Days"
          options={workingDays}
        />
      </div>
    </div>
  );
}

export default function Frame({ initialData, onDataChange }: FrameProps) {
  const [formData, setFormData] = useState<FormData>({
    packingFacility: initialData?.packingFacility || '',
    destinationCountries: initialData?.destinationCountries || [],
    carrierServiceType: initialData?.carrierServiceType || '',
    carrierName: initialData?.carrierName || '',
    originalCarrierServiceType: initialData?.originalCarrierServiceType || '',
    slug: initialData?.slug || '',
    method: initialData?.method || '',
    shippingCost: initialData?.shippingCost || '',
    packingTimeFrame: initialData?.packingTimeFrame || '',
    shippingTimeFrame: initialData?.shippingTimeFrame || '',
    maxShippingValue: initialData?.maxShippingValue || '',
    currencyCode: initialData?.currencyCode || '',
    shippingWorkingDays: initialData?.shippingWorkingDays || [],
  });

  const handleDataChange = (data: FormData) => {
    setFormData(data);
    if (onDataChange) {
      onDataChange(data);
    }
  };

  return (
    <div className="relative size-full">
      <div className="size-full">
        <div className="content-stretch flex gap-[72px] items-start p-[0px] relative size-full px-[24px] py-[0px]">
          <Frame1 formData={formData} setFormData={handleDataChange} />
          <ShippingRoute formData={formData} setFormData={handleDataChange} />
        </div>
      </div>
    </div>
  );
}