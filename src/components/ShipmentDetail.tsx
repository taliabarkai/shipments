import { useState } from 'react';
import { ConsolidatedShipment, ShipmentStatus } from './ConsolidatedShipmentsApp';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Pause, Play, Package } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ExpandableSidebar from './ExpandableSidebar';
import MainMenuSidebar from '../imports/MainMenuSidebar';
import InvoiceDialog from './InvoiceDialog';

interface ShipmentDetailProps {
  shipment: ConsolidatedShipment;
  onBack: () => void;
  onUpdate: (shipment: ConsolidatedShipment) => void;
}

export default function ShipmentDetail({ shipment, onBack, onUpdate }: ShipmentDetailProps) {
  const [trackingId, setTrackingId] = useState(shipment.trackingId);
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    onUpdate({ ...shipment, status: newStatus });
  };

  const handleTrackingUpdate = () => {
    onUpdate({ ...shipment, trackingId });
    setIsEditingTracking(false);
  };

  const handlePutOnHold = () => {
    handleStatusChange('On Hold');
  };

  const handleResumeFromHold = () => {
    handleStatusChange('Ready to Pack');
  };

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'Shipped': return 'bg-green-100 text-green-700';
      case 'Ready to Pack': return 'bg-[#e1f5fe] text-[#01579b]';
      case 'On Hold': return 'bg-[#feebee] text-[#b71c1c]';
      case 'Packed': return 'bg-[#ede7f6] text-[#311b92]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Menu Sidebar */}
      <div className="w-[98px] shrink-0">
        <MainMenuSidebar />
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* Expandable Sidebar */}
          <ExpandableSidebar activeSection="consolidated" />

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto bg-[#f7f7f4]">
            <div className="p-6 space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={onBack}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>

              {/* Shipment Details Card */}
              <div className="bg-white rounded-xl p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl mb-2">Shipment Details</h1>
                    <p className="text-gray-500">Consolidated Shipment ID: {shipment.id}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Packing Facility</label>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
                      </svg>
                      <span className="text-lg">{shipment.packingFacility}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Destination Country</label>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" fill="none" strokeWidth="1.5"/>
                      </svg>
                      <span className="text-lg">{shipment.destination}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Carrier type</label>
                    <span className="text-lg">
                      {shipment.carrierType ?? 'Merukazim'}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Carrier</label>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16 6h-3V4H2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
                      </svg>
                      <span className="text-lg">{shipment.carrier}</span>
                    </div>
                  </div>

                  {shipment.shippingRoute && (
                    <div>
                      <label className="text-sm text-gray-500 block mb-2">Shipping route</label>
                      <span className="text-lg">{shipment.shippingRoute}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Tracking ID</label>
                    {isEditingTracking ? (
                      <div className="flex gap-2">
                        <Input
                          value={trackingId}
                          onChange={(e) => setTrackingId(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleTrackingUpdate} size="sm">Save</Button>
                        <Button onClick={() => setIsEditingTracking(false)} size="sm" variant="outline">
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{shipment.trackingId}</span>
                        <Button
                          onClick={() => setIsEditingTracking(true)}
                          size="sm"
                          variant="ghost"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Total Invoice Value</label>
                    <span className="text-lg font-semibold">{shipment.totalValue}</span>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Number of Orders</label>
                    <span className="text-lg">{shipment.orders.length} orders</span>
                  </div>
                </div>

                {/* Orders List */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Orders in this Shipment</h3>
                  <div className="flex flex-wrap gap-2">
                    {shipment.orders.map(order => (
                      <span
                        key={order}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {order}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Documents</h3>
                  <div className="flex gap-3">
                    <Button variant="outline">
                      View Label
                    </Button>
                    <Button variant="outline">
                      View Manifest
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowInvoiceDialog(true)}
                    >
                      View Invoice
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-xl font-medium mb-4">Actions</h2>
                <div className="space-y-4">
                  {/* Status Change */}
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Change Status</label>
                    <Select
                      value={shipment.status}
                      onValueChange={(value) => handleStatusChange(value as ShipmentStatus)}
                    >
                      <SelectTrigger className="w-full md:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ready to Pack">Ready to Pack</SelectItem>
                        <SelectItem value="Packed">Packed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    {shipment.status !== 'On Hold' && shipment.status !== 'Shipped' && (
                      <Button
                        onClick={handlePutOnHold}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Put on Hold
                      </Button>
                    )}
                    {shipment.status === 'On Hold' && (
                      <Button
                        onClick={handleResumeFromHold}
                        variant="outline"
                        className="border-blue-500 text-blue-500 hover:bg-blue-50"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    {shipment.status === 'Ready to Pack' && (
                      <Button
                        onClick={() => handleStatusChange('Packed')}
                        className="bg-[#1976d2] hover:bg-[#1565c0]"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Mark as Packed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Invoice Dialog */}
      <InvoiceDialog
        isOpen={showInvoiceDialog}
        onClose={() => setShowInvoiceDialog(false)}
      />
    </div>
  );
}