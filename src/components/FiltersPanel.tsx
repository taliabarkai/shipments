import { ConsolidatedShipment, ShipmentStatus } from './ConsolidatedShipmentsApp';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface FiltersPanelProps {
  filters: {
    packingFacility: string[];
    destination: string[];
    carrier: string[];
    status: ShipmentStatus[];
    dateRange: { from: Date; to: Date } | null;
  };
  onFiltersChange: (filters: any) => void;
  shipments: ConsolidatedShipment[];
}

export default function FiltersPanel({ filters, onFiltersChange, shipments }: FiltersPanelProps) {
  const uniqueFacilities = Array.from(new Set(shipments.map(s => s.packingFacility)));
  const uniqueDestinations = Array.from(new Set(shipments.map(s => s.destination)));
  const uniqueCarriers = Array.from(new Set(shipments.map(s => s.carrier)));
  const statuses: ShipmentStatus[] = ['Packed', 'Shipped'];

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    const current = filters[category] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    onFiltersChange({
      ...filters,
      [category]: updated,
    });
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Packing Facility */}
      <div>
        <h3 className="font-medium mb-3">Packing Facility</h3>
        <div className="space-y-2">
          {uniqueFacilities.map(facility => (
            <div key={facility} className="flex items-center space-x-2">
              <Checkbox
                id={`facility-${facility}`}
                checked={filters.packingFacility.includes(facility)}
                onCheckedChange={() => toggleFilter('packingFacility', facility)}
              />
              <Label htmlFor={`facility-${facility}`} className="text-sm cursor-pointer">
                {facility}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Destination */}
      <div>
        <h3 className="font-medium mb-3">Destination</h3>
        <div className="space-y-2">
          {uniqueDestinations.map(destination => (
            <div key={destination} className="flex items-center space-x-2">
              <Checkbox
                id={`dest-${destination}`}
                checked={filters.destination.includes(destination)}
                onCheckedChange={() => toggleFilter('destination', destination)}
              />
              <Label htmlFor={`dest-${destination}`} className="text-sm cursor-pointer">
                {destination}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Carrier */}
      <div>
        <h3 className="font-medium mb-3">Carrier</h3>
        <div className="space-y-2">
          {uniqueCarriers.map(carrier => (
            <div key={carrier} className="flex items-center space-x-2">
              <Checkbox
                id={`carrier-${carrier}`}
                checked={filters.carrier.includes(carrier)}
                onCheckedChange={() => toggleFilter('carrier', carrier)}
              />
              <Label htmlFor={`carrier-${carrier}`} className="text-sm cursor-pointer">
                {carrier}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="font-medium mb-3">Status</h3>
        <div className="space-y-2">
          {statuses.map(status => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={filters.status.includes(status)}
                onCheckedChange={() => toggleFilter('status', status)}
              />
              <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                {status}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
