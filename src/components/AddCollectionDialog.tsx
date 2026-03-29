import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import svgPaths from '../imports/svg-ejk8r75i8o';

interface AddCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (carrier: string, pickupTime: string) => void;
  editMode?: boolean;
  initialCarrier?: string;
  initialPickupTime?: string;
}

export default function AddCollectionDialog({
  isOpen,
  onClose,
  onAdd,
  editMode,
  initialCarrier,
  initialPickupTime,
}: AddCollectionDialogProps) {
  const [carrier, setCarrier] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  const carriers = [
    'FedEx',
    'UPS',
    'USPS',
    'DHL',
    'Royal Mail',
    'DPD',
    'Hermes',
    'LaserShip',
    'OnTrac',
    'Global Post HU',
    'DHL EU',
    'DHL TH',
    'MailLog',
  ];

  const pickupTimes = [
    '8:00',
    '9:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  useEffect(() => {
    if (isOpen) {
      if (editMode) {
        setCarrier(initialCarrier || '');
        setPickupTime(initialPickupTime || '');
      } else {
        setCarrier('');
        setPickupTime('');
      }
    }
  }, [isOpen, editMode, initialCarrier, initialPickupTime]);

  const handleAdd = () => {
    if (carrier && pickupTime) {
      onAdd(carrier, pickupTime);
      // Reset form
      setCarrier('');
      setPickupTime('');
    }
  };

  const handleCancel = () => {
    // Reset form
    setCarrier('');
    setPickupTime('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0">
        <DialogDescription className="sr-only">
          Select carrier and pickup time to add a new collection
        </DialogDescription>
        
        <div className="flex flex-col gap-[24px] p-[24px] relative">
          {/* Title */}
          <DialogTitle className="font-['Roboto'] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] tracking-[0.15px]">
            {editMode ? 'Edit Collection' : 'Add Collection'}
          </DialogTitle>

          {/* Carrier */}
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <p className="font-['Roboto'] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] tracking-[0.15px]">
              Carrier
            </p>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger className="w-full h-auto border-[rgba(0,0,0,0.23)] rounded-[4px] px-[12px] py-0">
                <div className="flex items-center min-h-[24px] overflow-clip py-[16px] w-full">
                  <SelectValue placeholder="Select" className="font-['Roboto'] text-[16px] text-[rgba(0,0,0,0.6)] tracking-[0.15px]" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {carriers.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pickup Time */}
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <p className="font-['Roboto'] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] tracking-[0.15px]">
              Pickup Time
            </p>
            <Select value={pickupTime} onValueChange={setPickupTime}>
              <SelectTrigger className="w-full h-auto border-[rgba(0,0,0,0.23)] rounded-[4px] px-[12px] py-0">
                <div className="flex items-center min-h-[24px] overflow-clip py-[16px] w-full">
                  <SelectValue placeholder="Select" className="font-['Roboto'] text-[16px] text-[rgba(0,0,0,0.6)] tracking-[0.15px]" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {pickupTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="content-stretch flex gap-[11.997px] items-start justify-end mt-[48px]">
            {/* Cancel Button */}
            <button 
              onClick={handleCancel}
              className="bg-white relative rounded-[8px] shrink-0 hover:bg-gray-50 cursor-pointer"
            >
              <div aria-hidden="true" className="absolute border-[#1976d2] border-[0.556px] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[13px] py-[7px] relative">
                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#1976d2] text-[14px] text-center text-nowrap tracking-[-0.1504px] whitespace-pre">
                  Cancel
                </p>
              </div>
            </button>
            
            {/* Add/Save Button */}
            <button
              onClick={handleAdd}
              disabled={!carrier || !pickupTime}
              className="bg-[#1976d2] relative rounded-[8px] shrink-0 hover:bg-[#1565c0] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[24px] py-[7px] relative">
                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white tracking-[-0.1504px] whitespace-pre">
                  {editMode ? 'Save' : 'Add'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}