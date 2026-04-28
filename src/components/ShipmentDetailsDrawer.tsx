import { FileText, Receipt } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useState } from 'react';
import type { Shipment } from './ShipmentsTable';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  DrawerTimelineSection,
  DrawerShippingInformationSection,
  DrawerInfoRow,
  type DrawerTimelineItem,
} from './shipmentDrawerSections';

interface ShipmentDetailsDrawerProps {
  shipment: Shipment | null;
  open: boolean;
  onClose: () => void;
}

export default function ShipmentDetailsDrawer({ shipment, open, onClose }: ShipmentDetailsDrawerProps) {
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showLabelPreview, setShowLabelPreview] = useState(false);

  // Mock data for additional fields not in the Shipment interface
  const orderCreatedDate = '08/06/2025 at 22:06';
  const packedDate = '11/06/2025 at 12:58';
  const collectedDate = '12/06/2025 at 16:00';
  const deliveredDate = '25/06/2025 at 05:21';
  const shippingCost = '$12 USD';
  const additionalShippingCost = '$24 USD';
  const shippingFinancialInfo = 'DDP';
  const shipmentCollectionId = '273133181';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800';
      case 'On the Way':
        return 'bg-blue-100 text-blue-800';
      case 'Label Created':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!shipment) return null;

  const timelineItems: DrawerTimelineItem[] = [
    { label: 'Delivered', date: deliveredDate, user: 'Avery Kim', state: 'completed' },
    { label: 'Collected for Shipment', date: collectedDate, user: 'Jordan Lee', state: 'completed' },
    { label: 'Packed', date: packedDate, user: 'Morgan Blake', state: 'completed' },
    { label: 'Order Created', date: orderCreatedDate, user: 'Jamie Chen', state: 'completed' },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-[560px] p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Shipment Full Details</SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              Order ID: {shipment.orderId}
            </SheetDescription>
            {/* Status Badge */}
            <div className="flex items-center gap-2 pt-[4px] pr-[0px] pb-[0px] pl-[0px]">
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(shipment.status)}`}>
                {shipment.status}
              </span>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <DrawerTimelineSection items={timelineItems} />

              <DrawerShippingInformationSection>
                {shipment.consolidatedId && (
                  <>
                    <DrawerInfoRow label="Consolidated ID:" value={shipment.consolidatedId} />
                    <DrawerInfoRow label="Consolidated Pack:" value={`#${shipment.consolidatedPack}`} />
                  </>
                )}
                <DrawerInfoRow label="Shipping ID:" value={shipment.trackingId} />
                <DrawerInfoRow label="Shipment Collection ID:" value={shipmentCollectionId} />
                <DrawerInfoRow label="Packing Facility" value={shipment.packingFacility} />
                <DrawerInfoRow label="Destination" value={shipment.destination} />
                <DrawerInfoRow label="Carrier" value={shipment.carrier} />
              </DrawerShippingInformationSection>

              {/* Cost Summary Section */}
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-4">Cost Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 min-w-[200px]">Order Cost:</span>
                    <span className="text-sm text-gray-900">{shipment.orderCost}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 min-w-[200px]">Shipping Cost:</span>
                    <span className="text-sm text-gray-900">{shippingCost}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 min-w-[200px]">Additional Shipping Cost:</span>
                    <span className="text-sm text-gray-900">{additionalShippingCost}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 min-w-[200px]">Shipping Financial Info:</span>
                    <span className="text-sm text-gray-900">{shippingFinancialInfo}</span>
                  </div>
                </div>
              </div>

              {/* Additional Section */}
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-4">Additional</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-gray-600 min-w-[100px]">Site ID:</span>
                    <span className="text-sm text-gray-900">{shipment.siteId}</span>
                  </div>
                  
                  <button className="flex items-center gap-2 text-sm text-gray-900 hover:text-blue-600 transition-colors" onClick={() => setShowInvoicePreview(true)}>
                    <Receipt className="w-5 h-5" />
                    <span>View Invoice</span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-sm text-gray-900 hover:text-blue-600 transition-colors" onClick={() => setShowLabelPreview(true)}>
                    <FileText className="w-5 h-5" />
                    <span>View Label</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Order ID: {shipment.orderId}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1693045181676-57199422ee66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwaW52b2ljZSUyMGRvY3VtZW50fGVufDF8fHx8MTc2NjY3MjkzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
              alt="Invoice Preview" 
              className="w-full h-auto"
            />
          </div>
          <div className="pt-4 pb-2 text-center">
            <a 
              href="#" 
              className="text-sm text-gray-900 hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // Mock download action
                console.log('Downloading invoice...');
              }}
            >
              Download Invoice
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shipping Label Preview Dialog */}
      <Dialog open={showLabelPreview} onOpenChange={setShowLabelPreview}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Shipping Label Preview</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Order ID: {shipment.orderId}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1631010232525-cd45da1a1fbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlwcGluZyUyMGxhYmVsJTIwcGFja2FnZXxlbnwxfHx8fDE3NjY1NjUzMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
              alt="Shipping Label Preview" 
              className="w-full h-auto"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}