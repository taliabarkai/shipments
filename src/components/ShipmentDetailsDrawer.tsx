import { FileText, Receipt } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useState } from 'react';
import type { Shipment } from './ShipmentsTable';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  DrawerTimelineSection,
  DrawerShippingInformationSection,
  DrawerInfoGroup,
  DrawerInfoRow,
  type DrawerTimelineItem,
} from './shipmentDrawerSections';
import { DefaultShipmentHistorySection } from './ShipmentHistorySection';
import { MOCK_RULES } from './upgradeDowngradeTypes';
import { getShipmentDeliveryDates } from './shipmentDeliveryDates';
import { DeliveryStatus } from './DeliveryStatus';

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
  const shipmentCollectionId = '273133181';

  /** Format a monetary amount up to 2 decimals max, in $. */
  const formatMoney = (n: number | undefined | null): string => {
    if (n == null || Number.isNaN(n)) return '—';
    return `$${n.toFixed(2)}`;
  };

  /** Parse a money string like '$245.50' into a Number (or undefined if blank). */
  const parseMoney = (raw: string | undefined): number | undefined => {
    if (!raw) return undefined;
    const cleaned = raw.replace(/[^0-9.\-]/g, '');
    if (!cleaned) return undefined;
    const n = Number(cleaned);
    return Number.isNaN(n) ? undefined : n;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-[#f5f5f5] text-[#1f2937]';
      case 'Pending':
        return 'bg-[#fff8e1] text-[#ef6c00]';
      case 'On Hold':
        return 'bg-[#f3e5f5] text-[#4A148C]';
      case 'Ready to Pack':
        return 'bg-[#e8f5e9] text-[#166534]';
      case 'Packed':
        return 'bg-[#b9f6ca] text-[#1b5e20]';
      case 'Shipped':
        return 'bg-[#e3f2fd] text-[#0d47a1]';
      case 'Cancelled':
        return 'bg-[#ffebee] text-[#e53935]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!shipment) return null;

  const { orderEta, shipmentEdd, isLate } = getShipmentDeliveryDates(shipment.orderId);

  // Mock event dates. Real impl reads these off the shipment record.
  const readyToPackDate = '10/06/2025 at 08:15';
  const eventDate = '14/06/2025 at 09:42';
  const shippedDate = '20/06/2025 at 14:30';
  const heldReason = shipment.holdReason ?? 'Waiting for pending item';
  const pendingReason = shipment.pendingReason ?? 'API error';
  const cancellationReason = shipment.cancellationReason ?? 'Customer request';

  // Steps are listed newest-first to match the existing visual order.
  const orderCreatedStep: DrawerTimelineItem = {
    label: 'Order Created',
    date: orderCreatedDate,
    user: 'Jamie Chen',
    state: 'completed',
  };

  const timelineItems: DrawerTimelineItem[] = (() => {
    switch (shipment.status) {
      case 'Draft':
        return [orderCreatedStep];
      case 'Pending':
        return [
          { label: 'Pending', date: eventDate, user: 'Avery Kim', state: 'completed', reason: pendingReason },
          orderCreatedStep,
        ];
      case 'On Hold':
        return [
          { label: 'On Hold', date: eventDate, user: 'Avery Kim', state: 'completed', reason: heldReason },
          orderCreatedStep,
        ];
      case 'Ready to Pack':
        return [
          { label: 'Ready to Pack', date: readyToPackDate, user: 'Morgan Blake', state: 'completed' },
          orderCreatedStep,
        ];
      case 'Packed':
        return [
          { label: 'Packed', date: packedDate, user: 'Morgan Blake', state: 'completed' },
          { label: 'Ready to Pack', date: readyToPackDate, user: 'Morgan Blake', state: 'completed' },
          orderCreatedStep,
        ];
      case 'Shipped':
        return [
          { label: 'Shipped', date: shippedDate, user: 'Avery Kim', state: 'completed' },
          { label: 'Collected for Shipment', date: collectedDate, user: 'Jordan Lee', state: 'completed' },
          { label: 'Packed', date: packedDate, user: 'Morgan Blake', state: 'completed' },
          { label: 'Ready to Pack', date: readyToPackDate, user: 'Morgan Blake', state: 'completed' },
          orderCreatedStep,
        ];
      case 'Cancelled':
        return [
          { label: 'Cancelled', date: eventDate, user: 'Avery Kim', state: 'completed', reason: cancellationReason },
          orderCreatedStep,
        ];
      default:
        return [orderCreatedStep];
    }
  })();

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

              <DrawerShippingInformationSection title="Shipping information">
                {/* Delivery — dates first; these are the most-scanned values, so slightly bold. */}
                <DrawerInfoGroup label="Delivery">
                  <DrawerInfoRow label="Shipment EDD" valueClassName="font-medium" value={shipmentEdd} />
                  <DrawerInfoRow label="Order ETA" valueClassName="font-medium" value={orderEta} />
                  <DrawerInfoRow
                    label="Delivery status"
                    value={
                      shipment.status === 'Shipped' ? (
                        <DeliveryStatus isLate={isLate} className="text-sm" />
                      ) : (
                        '—'
                      )
                    }
                  />
                </DrawerInfoGroup>

                {/* Route — the shipment's path as one mental unit. */}
                <DrawerInfoGroup label="Route">
                  <DrawerInfoRow label="Packing facility" value={shipment.packingFacility} />
                  <DrawerInfoRow label="Destination" value={shipment.destination} />
                  <DrawerInfoRow label="Carrier" value={shipment.carrier} />
                  {shipment.appliedRuleIds?.map((ruleId) => {
                    const rule = MOCK_RULES.find((r) => r.id === ruleId);
                    if (!rule) return null;
                    const label = rule.action === 'upgrade' ? 'Upgrade rule' : 'Downgrade rule';
                    return <DrawerInfoRow key={ruleId} label={label} value={rule.name} />;
                  })}
                  {shipment.status === 'Shipped' && shipment.carrierServiceType && (
                    <DrawerInfoRow label="Carrier service type" value={shipment.carrierServiceType} />
                  )}
                </DrawerInfoGroup>

                {/* References — IDs for support lookups; monospace for easy reading/copying. */}
                <DrawerInfoGroup label="References">
                  <DrawerInfoRow
                    label="Shipping ID"
                    valueClassName="font-mono"
                    value={shipment.trackingId}
                  />
                  <DrawerInfoRow
                    label="Shipment collection ID"
                    valueClassName="font-mono"
                    value={shipmentCollectionId}
                  />
                  {shipment.consolidatedId && (
                    <>
                      <DrawerInfoRow
                        label="Consolidated ID"
                        valueClassName="font-mono"
                        value={shipment.consolidatedId}
                      />
                      <DrawerInfoRow label="Consolidated pack" value={`#${shipment.consolidatedPack}`} />
                    </>
                  )}
                </DrawerInfoGroup>
              </DrawerShippingInformationSection>

              <DefaultShipmentHistorySection shipment={shipment} />

              {/* Cost Summary Section */}
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-4">Cost Summary</h3>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 min-w-[200px]">Order value:</span>
                    <span className="text-sm text-gray-900">{formatMoney(parseMoney(shipment.orderCost))}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 min-w-[200px]">Financial Incoterm:</span>
                    <span className="text-sm text-gray-900">{shipment.financialIncoterm ?? 'DAP'}</span>
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