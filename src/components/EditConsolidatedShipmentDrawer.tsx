import { useState, useEffect } from 'react';
import { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, MapPin, Truck, ListChecks, Maximize2, Check, AlertCircle, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';

interface EditConsolidatedShipmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: ConsolidatedShipment | null;
  onUpdate: (shipment: ConsolidatedShipment) => void;
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

export default function EditConsolidatedShipmentDrawer({ isOpen, onClose, shipment, onUpdate }: EditConsolidatedShipmentDrawerProps) {
  const [destination, setDestination] = useState('');
  const [carrier, setCarrier] = useState('');
  const [packs, setPacks] = useState<Pack[]>([{ id: 1, orders: [] }]);
  const [activePack, setActivePack] = useState(1);
  const [orderInput, setOrderInput] = useState('');

  useEffect(() => {
    if (shipment) {
      // Find the destination value from the country
      const destValue = destinations.find(d => d.country === shipment.destination)?.value || '';
      setDestination(destValue);
      setCarrier(shipment.carrier);
      
      // Initialize packs from shipment orders
      if (shipment.orders && shipment.orders.length > 0) {
        // For the first shipment (273133181), split into 3 packs: 15, 20, 7
        if (shipment.id === '273133181' && shipment.orders.length === 42) {
          setPacks([
            { id: 1, orders: shipment.orders.slice(0, 15) },
            { id: 2, orders: shipment.orders.slice(15, 35) },
            { id: 3, orders: shipment.orders.slice(35, 42) }
          ]);
        } 
        // For the second shipment (273133182), split into 4 packs: 8, 12, 6, 4
        else if (shipment.id === '273133182' && shipment.orders.length === 30) {
          setPacks([
            { id: 1, orders: shipment.orders.slice(0, 8) },
            { id: 2, orders: shipment.orders.slice(8, 20) },
            { id: 3, orders: shipment.orders.slice(20, 26) },
            { id: 4, orders: shipment.orders.slice(26, 30) }
          ]);
        } 
        else {
          // For existing shipments without pack structure, put all orders in Pack #1
          setPacks([{ id: 1, orders: shipment.orders }]);
        }
      } else {
        setPacks([{ id: 1, orders: [] }]);
      }
      setActivePack(1);
    }
  }, [shipment]);

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
    if (!shipment || !destination || !carrier || packs.some(pack => pack.orders.length === 0)) {
      if (!destination || !carrier) {
        toast.error('Destination and carrier are required');
      } else if (packs.some(pack => pack.orders.length === 0)) {
        toast.error('At least one order is required in each pack');
      }
      return;
    }

    const updatedShipment: ConsolidatedShipment = {
      ...shipment,
      destination: destinations.find(d => d.value === destination)?.country || shipment.destination,
      carrier,
      orders: packs.flatMap(pack => pack.orders),
      status: 'Packed',
    };

    onUpdate(updatedShipment);
    toast.success('Shipment packed successfully');
    onClose();
  };

  const handleUnpack = () => {
    if (!shipment) {
      return;
    }

    if (!destination || !carrier) {
      toast.error('Destination and carrier are required');
      return;
    }

    const updatedShipment: ConsolidatedShipment = {
      ...shipment,
      destination: destinations.find(d => d.value === destination)?.country || shipment.destination,
      carrier,
      orders: packs.flatMap(pack => pack.orders),
      status: 'Draft',
    };

    onUpdate(updatedShipment);
    toast.success('Shipment unpacked successfully');
  };

  const handleSaveAndClose = () => {
    if (!shipment || !destination || !carrier) {
      toast.error('Destination and carrier are required');
      return;
    }

    const updatedShipment: ConsolidatedShipment = {
      ...shipment,
      destination: destinations.find(d => d.value === destination)?.country || shipment.destination,
      carrier,
      orders: packs.flatMap(pack => pack.orders),
    };

    onUpdate(updatedShipment);
    toast.success('Shipment saved successfully');
    onClose();
  };

  const isOrderCancelled = (order: string) => {
    return shipment?.cancelledOrders?.includes(order) || false;
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

  const hasCancelledOrdersInScanned = packs.some(pack => pack.orders.some(order => isOrderCancelled(order)));

  const availableCarriers = destination ? carriers[destination as keyof typeof carriers] || [] : [];
  const canPack = destination && carrier && packs.some(pack => pack.orders.length > 0) && shipment?.status !== 'Shipped' && !hasCancelledOrdersInScanned;
  const canSave = destination && carrier;

  if (!shipment) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-xl">Edit Consolidated Shipment</SheetTitle>
          <SheetDescription className="text-sm text-gray-500">
            Shipment ID: {shipment.id}
          </SheetDescription>
          {/* Status Badge */}
          <div className="flex items-center gap-2 pt-[4px] pr-[0px] pb-[0px] pl-[0px]">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`px-3 py-1 rounded-md text-xs font-medium ${
              shipment.status === 'Shipped' ? 'bg-green-100 text-green-700' :
              shipment.status === 'Packed' ? 'bg-[#ede7f6] text-[#311b92]' :
              shipment.status === 'Ready to Pack' ? 'bg-[#e1f5fe] text-[#01579b]' :
              shipment.status === 'On Hold' ? 'bg-[#feebee] text-[#b71c1c]' :
              'bg-gray-100 text-gray-800'
            }`}>
              {shipment.status}
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
              <Select value={destination} onValueChange={setDestination} disabled={shipment.status === 'Shipped' || shipment.status === 'Packed'}>
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
                disabled={!destination || shipment.status === 'Shipped' || shipment.status === 'Packed'}
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
                  {packs.length > 1 && pack.orders.length === 0 && shipment.status !== 'Shipped' && shipment.status !== 'Packed' && (
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
              {packs.length < 10 && shipment.status !== 'Shipped' && shipment.status !== 'Packed' && (
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
              <h3 className="font-medium">Scanned Orders</h3>
              <span className="text-sm text-gray-500">{packs.flatMap(pack => pack.orders).length} items</span>
            </div>

            {/* Cancelled Orders Warning */}
            {hasCancelledOrdersInScanned && (
              <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">
                  This shipment has cancelled orders. Please remove them before packing.
                </p>
              </div>
            )}

            {/* Scan Input - only show if not shipped and not packed */}
            {shipment.status !== 'Shipped' && shipment.status !== 'Packed' && (
              <div className="border rounded-lg mb-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(255,255,255,0)]">
                  <Maximize2 className="w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Scan or Enter Order ID"
                    value={orderInput}
                    onChange={(e) => setOrderInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!destination || !carrier}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-[16px] py-[0px]"
                  />
                </div>
              </div>
            )}

            {/* Scanned Orders Display */}
            <div className="border rounded-lg flex-1 overflow-y-auto bg-gray-50 min-h-[200px] px-[12px] p-[12px]">
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
                  {currentPackOrders.map((order, index) => {
                    const isCancelled = isOrderCancelled(order);
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isCancelled ? 'bg-red-50 border-red-200' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCancelled ? (
                            <X className="w-4 h-4 text-red-600" />
                          ) : (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                          <span className={`font-mono text-sm ${isCancelled ? 'text-red-600 line-through' : ''}`}>
                            {order}
                          </span>
                          {isCancelled && (
                            <span className="text-xs text-red-600 font-medium">CANCELLED</span>
                          )}
                        </div>
                        {shipment.status !== 'Shipped' && shipment.status !== 'Packed' && (
                          <button
                            onClick={() => setPacks(packs.map(pack => {
                              if (pack.id === activePack) {
                                return { ...pack, orders: pack.orders.filter((_, i) => i !== index) };
                              }
                              return pack;
                            }))}
                            className="text-gray-400 hover:text-black transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
            {shipment.status === 'Shipped' ? (
              <Button
                onClick={onClose}
                className="bg-[#1976d2] hover:bg-[#1565c0]"
              >
                Close
              </Button>
            ) : (
              <>
                {shipment.status !== 'Packed' && (
                  <Button
                    variant="outline"
                    onClick={handleSaveAndClose}
                    disabled={!canSave}
                    className="text-[#1976d2] border-[#1976d2] hover:bg-[#1976d2]/5 hover:text-[#1976d2]"
                  >
                    Save & Close
                  </Button>
                )}
                {shipment.status === 'Packed' ? (
                  <Button
                    onClick={handleUnpack}
                    className="bg-[#1976d2] hover:bg-[#1565c0]"
                  >
                    Unpack
                  </Button>
                ) : (
                  <Button
                    onClick={handlePack}
                    disabled={!canPack}
                    className={canPack ? 'bg-[#1976d2] hover:bg-[#1565c0]' : ''}
                  >
                    Pack
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}