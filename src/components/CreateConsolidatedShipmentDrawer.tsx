import { useState } from 'react';
import { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, MapPin, Truck, ListChecks, Maximize2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CreateConsolidatedShipmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (shipment: ConsolidatedShipment) => void;
}

interface Pack {
  id: number;
  orders: string[];
}

const destinations = [
  { value: 'usa', label: 'United States', country: 'United States' },
  { value: 'uk', label: 'United Kingdom', country: 'United Kingdom' },
];

const carriers = {
  usa: ['FedEx', 'UPS', 'USPS', 'LaserShip', 'OnTrac'],
  uk: ['FedEx', 'UPS', 'USPS', 'LaserShip', 'OnTrac'],
};

export default function CreateConsolidatedShipmentDrawer({ isOpen, onClose, onCreate }: CreateConsolidatedShipmentDrawerProps) {
  const [destination, setDestination] = useState('');
  const [carrier, setCarrier] = useState('');
  const [packs, setPacks] = useState<Pack[]>([{ id: 1, orders: [] }]);
  const [activePack, setActivePack] = useState(1);
  const [orderInput, setOrderInput] = useState('');
  const [tempShipmentId] = useState(`${Date.now()}`);

  const handleScanOrder = () => {
    if (orderInput.trim()) {
      const newPacks = packs.map(pack => {
        if (pack.id === activePack) {
          return { ...pack, orders: [...pack.orders, orderInput.trim()] };
        }
        return pack;
      });
      setPacks(newPacks);
      setOrderInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScanOrder();
    }
  };

  const handlePack = () => {
    if (!destination || !carrier || packs.every(pack => pack.orders.length === 0)) {
      return;
    }

    const packingFacilities = ['Thailand', 'Kiryat Gat', 'Hungary', 'Nazareth'];
    const randomFacility = packingFacilities[Math.floor(Math.random() * packingFacilities.length)];
    
    const newShipment: ConsolidatedShipment = {
      id: tempShipmentId,
      packingFacility: randomFacility,
      destination: destinations.find(d => d.value === destination)?.country || '',
      carrier,
      trackingId: `TRK${Date.now()}`,
      totalValue: `$${(Math.random() * 20000 + 5000).toFixed(2)}`,
      status: 'Packed',
      orders: packs.flatMap(pack => pack.orders),
      hasCancelledItems: false,
    };

    onCreate(newShipment);
    resetForm();
  };

  const handleSaveAndClose = () => {
    if (!destination || !carrier) {
      return;
    }

    const packingFacilities = ['Thailand', 'Kiryat Gat', 'Hungary', 'Nazareth'];
    const randomFacility = packingFacilities[Math.floor(Math.random() * packingFacilities.length)];
    
    const newShipment: ConsolidatedShipment = {
      id: tempShipmentId,
      packingFacility: randomFacility,
      destination: destinations.find(d => d.value === destination)?.country || '',
      carrier,
      trackingId: `TRK${Date.now()}`,
      totalValue: packs.some(pack => pack.orders.length > 0) ? `$${(Math.random() * 20000 + 5000).toFixed(2)}` : '$0.00',
      status: 'Packed',
      orders: packs.flatMap(pack => pack.orders),
      hasCancelledItems: false,
    };

    onCreate(newShipment);
    resetForm();
  };

  const resetForm = () => {
    setDestination('');
    setCarrier('');
    setPacks([{ id: 1, orders: [] }]);
    setActivePack(1);
    setOrderInput('');
  };

  const addNewPack = () => {
    if (packs.length < 10) {
      const newPackId = Math.max(...packs.map(p => p.id)) + 1;
      setPacks([...packs, { id: newPackId, orders: [] }]);
      setActivePack(newPackId);
    }
  };

  const deletePack = (packId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const packToDelete = packs.find(p => p.id === packId);
    
    // Don't delete if it has orders or if it's the last pack
    if (packToDelete && packToDelete.orders.length === 0 && packs.length > 1) {
      const filteredPacks = packs.filter(p => p.id !== packId);
      
      // Renumber packs sequentially (1, 2, 3, etc.)
      const renumberedPacks = filteredPacks.map((pack, index) => ({
        ...pack,
        id: index + 1
      }));
      
      setPacks(renumberedPacks);
      
      // If we deleted the active pack, switch to the first available pack
      // Otherwise, adjust the active pack ID based on its new position
      if (activePack === packId) {
        setActivePack(1);
      } else if (activePack > packId) {
        // If active pack was after deleted pack, decrease its ID by 1
        setActivePack(activePack - 1);
      }
    }
  };

  const currentPack = packs.find(p => p.id === activePack);
  const currentPackOrders = currentPack?.orders || [];

  const availableCarriers = destination ? carriers[destination as keyof typeof carriers] || [] : [];
  const canPack = destination && carrier && packs.some(pack => pack.orders.length > 0);
  const canSave = destination && carrier;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>New Consolidated Shipment</SheetTitle>
          <SheetDescription className="text-sm text-gray-500">
            Shipment ID: {tempShipmentId}
          </SheetDescription>
          {/* Status Badge */}
          <div className="flex items-center gap-2 pt-[4px] pr-[0px] pb-[0px] pl-[0px]">
            <span className="text-sm text-gray-500">Status:</span>
            <span className="px-3 py-1 rounded-md text-xs font-medium bg-[#ede7f6] text-[#311b92]">
              Packed
            </span>
          </div>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-4 gap-6">
          {/* Destination & Carrier */}
          <div className="flex flex-col gap-4">
            {/* Destination */}
            <div>
              <label className="font-medium mb-2 block">
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
              <label className="font-medium mb-2 block">
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

          {/* Packs Section */}
          <div>
            <label className="font-medium mb-2 block">
              Packs
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {packs.map(pack => (
                <button
                  key={pack.id}
                  onClick={() => setActivePack(pack.id)}
                  className={`relative px-3 py-1.5 text-sm rounded-full transition-colors group ${
                    activePack === pack.id
                      ? 'bg-[#1976d2] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pack #{pack.id} ({pack.orders.length})
                  {packs.length > 1 && pack.orders.length === 0 && (
                    <span
                      onClick={(e) => deletePack(pack.id, e)}
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                        activePack === pack.id ? 'bg-white text-[#1976d2]' : 'bg-gray-700 text-white'
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
              {packs.length < 10 && (
                <button
                  onClick={addNewPack}
                  className="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1"
                  disabled={!destination || !carrier}
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Scan Orders Section */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Scan Orders</h3>
              <span className="text-sm text-gray-500">{packs.flatMap(pack => pack.orders).length} items</span>
            </div>

            {/* Scan Input */}
            <div className="border rounded-lg flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-[rgba(255,255,255,0)] p-[16px]">
                <Maximize2 className="w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Scan or Enter Order ID"
                  value={orderInput}
                  onChange={(e) => setOrderInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!destination || !carrier}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-[12px] py-[0px]"
                />
              </div>

              {/* Scanned Orders Display */}
              <div className="flex-1 overflow-y-auto bg-gray-50 border min-h-[200px] rounded-t-[0px] rounded-b-[10px] px-[12px] p-[12px]">
                {currentPackOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 48 48">
                      <path d="M22 14H34V18H22V14ZM22 22H34V26H22V22ZM22 30H34V34H22V30ZM14 14H18V18H14V14ZM14 22H18V26H14V22ZM14 30H18V34H14V30ZM40.2 6H7.8C6.8 6 6 6.8 6 7.8V40.2C6 41 6.8 42 7.8 42H40.2C41 42 42 41 42 40.2V7.8C42 6.8 41 6 40.2 6ZM38 38H10V10H38V38Z"/>
                    </svg>
                    <p className="text-gray-600">No orders scanned yet</p>
                    <p className="text-sm text-gray-500">Start scanning to add orders</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentPackOrders.map((order, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <span className="font-mono text-sm">{order}</span>
                        <button
                          onClick={() => setPacks(packs.map(pack => {
                            if (pack.id === activePack) {
                              return { ...pack, orders: pack.orders.filter((_, i) => i !== index) };
                            }
                            return pack;
                          }))}
                          className="text-gray-400 hover:text-red-600 transition-colors"
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
        </div>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 bg-white flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-600"
          >
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSaveAndClose}
              disabled={!canSave}
              className="text-[#1976d2] border-[#1976d2] hover:bg-[#1976d2]/5 hover:text-[#1976d2]"
            >
              Save & Close
            </Button>
            <Button
              onClick={handlePack}
              disabled={!canPack}
              className={canPack ? 'bg-[#1976d2] hover:bg-[#1565c0]' : ''}
            >
              Pack
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}