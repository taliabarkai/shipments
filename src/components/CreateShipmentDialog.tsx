import { useState } from 'react';
import { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, MapPin, Truck, ListChecks, Maximize2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CreateShipmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (shipment: ConsolidatedShipment) => void;
}

const destinations = [
  { value: 'usa', label: 'United States', country: 'United States' },
  { value: 'uk', label: 'United Kingdom', country: 'United Kingdom' },
  { value: 'germany', label: 'Germany', country: 'Germany' },
  { value: 'france', label: 'France', country: 'France' },
  { value: 'canada', label: 'Canada', country: 'Canada' },
  { value: 'australia', label: 'Australia', country: 'Australia' },
  { value: 'japan', label: 'Japan', country: 'Japan' },
  { value: 'china', label: 'China', country: 'China' },
];

const carriers = {
  usa: ['FedEx', 'UPS', 'USPS', 'DHL US', 'Amazon Logistics', 'OnTrac', 'LaserShip'],
  uk: ['Royal Mail', 'Parcelforce', 'DPD UK', 'Hermes UK', 'Yodel', 'DHL EU'],
  germany: ['DHL EU', 'DPD EU', 'Hermes', 'GLS'],
  france: ['La Poste', 'Colissimo', 'DHL EU', 'Chronopost'],
  canada: ['Canada Post', 'FedEx', 'UPS', 'Purolator'],
  australia: ['Australia Post', 'FedEx', 'DHL', 'StarTrack'],
  japan: ['Japan Post', 'Yamato Transport', 'Sagawa Express', 'FedEx'],
  china: ['China Post', 'SF Express', 'YTO Express', 'DHL'],
};

export default function CreateShipmentDialog({ isOpen, onClose, onCreate }: CreateShipmentDialogProps) {
  const [destination, setDestination] = useState('');
  const [carrier, setCarrier] = useState('');
  const [scannedOrders, setScannedOrders] = useState<string[]>([]);
  const [orderInput, setOrderInput] = useState('');

  const handleScanOrder = () => {
    if (orderInput.trim()) {
      setScannedOrders([...scannedOrders, orderInput.trim()]);
      setOrderInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScanOrder();
    }
  };

  const handleCreate = () => {
    if (!destination || !carrier || scannedOrders.length === 0) {
      return;
    }

    const packingFacilities = ['Thailand', 'Kiryat Gat', 'Hungary', 'Nazareth'];
    const randomFacility = packingFacilities[Math.floor(Math.random() * packingFacilities.length)];
    
    const newShipment: ConsolidatedShipment = {
      id: `${Date.now()}`,
      packingFacility: randomFacility,
      destination: destinations.find(d => d.value === destination)?.country || '',
      carrier,
      trackingId: `TRK${Date.now()}`,
      totalValue: `$${(Math.random() * 20000 + 5000).toFixed(2)}`,
      status: 'Packed',
      orders: scannedOrders,
    };

    onCreate(newShipment);
    
    // Reset form
    setDestination('');
    setCarrier('');
    setScannedOrders([]);
    setOrderInput('');
  };

  const availableCarriers = destination ? carriers[destination as keyof typeof carriers] || [] : [];
  const canCreate = destination && carrier && scannedOrders.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Create New Consolidated Shipment</DialogTitle>
        <DialogDescription className="sr-only">
          Create a new consolidated shipment by selecting a destination, carrier, and scanning orders.
        </DialogDescription>
        <div className="relative">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-medium">Create New Consolidated Shipment</h2>
            </div>

            {/* Form Fields */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Destination */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <MapPin className="w-5 h-5" />
                    Destination
                  </label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map(dest => (
                        <SelectItem key={dest.value} value={dest.value}>
                          {dest.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Carrier */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Truck className="w-5 h-5" />
                    Carrier
                  </label>
                  <Select 
                    value={carrier} 
                    onValueChange={setCarrier}
                    disabled={!destination}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCarriers.map(c => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Scan Orders Section */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ListChecks className="w-5 h-5" />
                  <h3 className="font-medium">Scan Orders</h3>
                </div>
                <span className="text-sm text-gray-500">{scannedOrders.length} items</span>
              </div>

              {/* Scan Input */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 border-b">
                  <Maximize2 className="w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Scan or Enter Order ID"
                    value={orderInput}
                    onChange={(e) => setOrderInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  />
                </div>

                {/* Scanned Orders Display */}
                <div className="p-8 min-h-[200px]">
                  {scannedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                      <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 48 48">
                        <path d="M22 14H34V18H22V14ZM22 22H34V26H22V22ZM22 30H34V34H22V30ZM14 14H18V18H14V14ZM14 22H18V26H14V22ZM14 30H18V34H14V30ZM40.2 6H7.8C6.8 6 6 6.8 6 7.8V40.2C6 41 6.8 42 7.8 42H40.2C41 42 42 41 42 40.2V7.8C42 6.8 41 6 40.2 6ZM38 38H10V10H38V38Z"/>
                      </svg>
                      <p className="text-gray-600">No orders scanned yet</p>
                      <p className="text-sm text-gray-500">Start scanning to add orders</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {scannedOrders.map((order, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-mono text-sm">{order}</span>
                          <button
                            onClick={() => setScannedOrders(scannedOrders.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-[#1976d2]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!canCreate}
                className={canCreate ? 'bg-[#1976d2] hover:bg-[#1565c0]' : 'bg-gray-200 text-gray-400'}
              >
                Pack Consolidated Shipment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}