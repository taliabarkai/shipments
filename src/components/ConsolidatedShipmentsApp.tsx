import { useState, useRef, useEffect } from 'react';
import ShipmentsList from './ShipmentsList';
import ConsolidatedShipmentScreen from './ConsolidatedShipmentScreen';
import ConsolidatedShipmentCreateDrawer from './ConsolidatedShipmentCreateDrawer';
import ConsolidatedShipmentDetailDrawer from './ConsolidatedShipmentDetailDrawer';
import SuccessNotification from './SuccessNotification';
import Header from '../imports/Header';

export type ShipmentStatus = 'Packed' | 'Shipped';

export type ConsolidatedCarrierType = 'Bulk' | 'Merukazim';

/** Scanned orders grouped by pack (creation + item view). */
export interface ConsolidatedPack {
  id: number;
  orders: string[];
}

export interface ConsolidatedShipment {
  id: string;
  packingFacility: string;
  destination: string;
  carrier: string;
  /** Bulk vs Merukazim; drives destination / route requirements */
  carrierType?: ConsolidatedCarrierType;
  /** Required when carrierType is Merukazim */
  shippingRoute?: string;
  trackingId: string;
  totalValue: string;
  status: ShipmentStatus;
  orders: string[];
  /**
   * Pack structure for display and editing. When omitted, all `orders` are shown as a single pack.
   */
  packs?: ConsolidatedPack[];
  dateCreated: string;
  /** Optional; UI can derive mock values when absent */
  totalShipments?: number;
  packedDate?: string;
  shippedDate?: string;
  hasCancelledItems?: boolean;
  cancelledOrders?: string[];
}

interface ConsolidatedShipmentsAppProps {
  onSectionChange?: (section: 'shipments' | 'collections' | 'consolidated') => void;
}

type ViewType = 'list' | 'edit';

/** Match `SheetContent` `data-[state=closed]:duration-300` so we unmount after slide-out. */
const DETAIL_DRAWER_CLOSE_MS = 300;

export default function ConsolidatedShipmentsApp({ onSectionChange }: ConsolidatedShipmentsAppProps = {}) {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedShipment, setSelectedShipment] = useState<ConsolidatedShipment | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailDrawerShipment, setDetailDrawerShipment] = useState<ConsolidatedShipment | null>(null);
  const detailDrawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const [shipments, setShipments] = useState<ConsolidatedShipment[]>([
    {
      id: '273133181',
      packingFacility: 'Kiryat Gat',
      destination: '—',
      carrier: 'FedEx',
      carrierType: 'Bulk',
      trackingId: '1Z12345E0',
      totalValue: '$15,420.50',
      status: 'Shipped',
      orders: [
        ...Array.from({ length: 15 }, (_, i) => `ORD-${1000 + i}`),
        ...Array.from({ length: 20 }, (_, i) => `ORD-${1015 + i}`),
        ...Array.from({ length: 7 }, (_, i) => `ORD-${1035 + i}`),
      ],
      packs: [
        { id: 1, orders: Array.from({ length: 15 }, (_, i) => `ORD-${1000 + i}`) },
        { id: 2, orders: Array.from({ length: 20 }, (_, i) => `ORD-${1015 + i}`) },
        { id: 3, orders: Array.from({ length: 7 }, (_, i) => `ORD-${1035 + i}`) },
      ],
      dateCreated: '10/1/2023'
    },
    {
      id: '273133182',
      packingFacility: 'Thailand',
      destination: 'United Kingdom',
      carrier: 'DHL EU',
      trackingId: '1Z12345E1',
      totalValue: '$18,320.75',
      status: 'Packed',
      orders: [
        ...Array.from({ length: 12 }, (_, i) => `ORD-${1100 + i}`),
        ...Array.from({ length: 18 }, (_, i) => `ORD-${1112 + i}`),
      ],
      packs: [
        { id: 1, orders: Array.from({ length: 12 }, (_, i) => `ORD-${1100 + i}`) },
        { id: 2, orders: Array.from({ length: 18 }, (_, i) => `ORD-${1112 + i}`) },
      ],
      hasCancelledItems: true,
      cancelledOrders: ['ORD-1105'],
      dateCreated: '10/2/2023'
    },
    {
      id: '273133183',
      packingFacility: 'Hungary',
      destination: '—',
      carrier: 'DHL EU',
      carrierType: 'Bulk',
      trackingId: '1Z12345E2',
      totalValue: '$12,890.25',
      status: 'Packed',
      orders: Array.from({ length: 28 }, (_, i) => `ORD-${1200 + i}`),
      dateCreated: '10/3/2023'
    },
    {
      id: '273133184',
      packingFacility: 'Nazareth',
      destination: 'United States',
      carrier: 'UPS',
      trackingId: '1Z12345E3',
      totalValue: '$22,150.00',
      status: 'Shipped',
      orders: Array.from({ length: 38 }, (_, i) => `ORD-${1300 + i}`),
      dateCreated: '10/4/2023'
    },
    {
      id: '273133185',
      packingFacility: 'Kiryat Gat',
      destination: 'GB',
      carrier: 'DHL Royal HU',
      carrierType: 'Merukazim',
      trackingId: '1Z12345E4',
      totalValue: '$19,420.50',
      status: 'Packed',
      orders: Array.from({ length: 31 }, (_, i) => `ORD-${1400 + i}`),
      dateCreated: '10/5/2023'
    },
    {
      id: '273133186',
      packingFacility: 'Thailand',
      destination: 'US',
      carrier: 'DHL',
      carrierType: 'Merukazim',
      trackingId: '1Z12345E5',
      totalValue: '$16,780.30',
      status: 'Packed',
      orders: Array.from({ length: 27 }, (_, i) => `ORD-${1500 + i}`),
      dateCreated: '10/6/2023'
    },
    {
      id: '273133187',
      packingFacility: 'Hungary',
      destination: 'United Kingdom',
      carrier: 'FedEx',
      trackingId: '1Z12345E6',
      totalValue: '$14,250.90',
      status: 'Shipped',
      orders: Array.from({ length: 29 }, (_, i) => `ORD-${1600 + i}`),
      dateCreated: '10/7/2023'
    },
    {
      id: '273133188',
      packingFacility: 'Nazareth',
      destination: 'United States',
      carrier: 'USPS',
      trackingId: '1Z12345E7',
      totalValue: '$20,500.00',
      status: 'Shipped',
      orders: Array.from({ length: 33 }, (_, i) => `ORD-${1700 + i}`),
      dateCreated: '10/8/2023'
    },
    {
      id: '273133189',
      packingFacility: 'Thailand',
      destination: 'China',
      carrier: 'DHL US',
      trackingId: '1Z12345E8',
      totalValue: '$25,340.80',
      status: 'Packed',
      orders: Array.from({ length: 45 }, (_, i) => `ORD-${1800 + i}`),
      dateCreated: '10/9/2023'
    },
    {
      id: '273133190',
      packingFacility: 'Kiryat Gat',
      destination: '—',
      carrier: 'FedEx',
      carrierType: 'Bulk',
      trackingId: '1Z12345E9',
      totalValue: '$17,650.00',
      status: 'Packed',
      orders: Array.from({ length: 27 }, (_, i) => `ORD-${1900 + i}`),
      dateCreated: '10/10/2023'
    },
    {
      id: '273133191',
      packingFacility: 'Thailand',
      destination: 'India',
      carrier: 'DHL EU',
      trackingId: '1Z12345F0',
      totalValue: '$21,230.40',
      status: 'Packed',
      orders: Array.from({ length: 35 }, (_, i) => `ORD-${2000 + i}`),
      dateCreated: '10/11/2023'
    },
    {
      id: '273133192',
      packingFacility: 'Hungary',
      destination: 'United States',
      carrier: 'UPS',
      trackingId: '1Z12345F1',
      totalValue: '$13,890.75',
      status: 'Packed',
      orders: Array.from({ length: 28 }, (_, i) => `ORD-${2100 + i}`),
      dateCreated: '10/12/2023'
    },
    {
      id: '273133193',
      packingFacility: 'Nazareth',
      destination: 'United States',
      carrier: 'LaserShip',
      trackingId: '1Z12345F2',
      totalValue: '$19,120.50',
      status: 'Shipped',
      orders: Array.from({ length: 32 }, (_, i) => `ORD-${2200 + i}`),
      dateCreated: '10/13/2023'
    },
    {
      id: '273133194',
      packingFacility: 'Kiryat Gat',
      destination: 'United Kingdom',
      carrier: 'FedEx',
      trackingId: '1Z12345F3',
      totalValue: '$24,560.30',
      status: 'Packed',
      orders: Array.from({ length: 40 }, (_, i) => `ORD-${2300 + i}`),
      dateCreated: '10/14/2023'
    },
    {
      id: '273133195',
      packingFacility: 'Thailand',
      destination: 'Italy',
      carrier: 'Royal Mail',
      trackingId: '1Z12345F4',
      totalValue: '$16,340.80',
      status: 'Packed',
      orders: Array.from({ length: 29 }, (_, i) => `ORD-${2400 + i}`),
      dateCreated: '10/15/2023'
    },
    {
      id: '273133196',
      packingFacility: 'Hungary',
      destination: '—',
      carrier: 'DHL EU',
      carrierType: 'Bulk',
      trackingId: '1Z12345F5',
      totalValue: '$18,770.25',
      status: 'Packed',
      orders: Array.from({ length: 27 }, (_, i) => `ORD-${2500 + i}`),
      dateCreated: '10/16/2023'
    },
    {
      id: '273133197',
      packingFacility: 'Nazareth',
      destination: 'United Kingdom',
      carrier: 'OnTrac',
      trackingId: '1Z12345F6',
      totalValue: '$22,890.00',
      status: 'Shipped',
      orders: Array.from({ length: 36 }, (_, i) => `ORD-${2600 + i}`),
      dateCreated: '10/17/2023'
    },
    {
      id: '273133198',
      packingFacility: 'Kiryat Gat',
      destination: '—',
      carrier: 'UPS',
      carrierType: 'Bulk',
      trackingId: '1Z12345F7',
      totalValue: '$14,520.60',
      status: 'Packed',
      orders: Array.from({ length: 31 }, (_, i) => `ORD-${2700 + i}`),
      dateCreated: '10/18/2023'
    },
  ]);

  const clearDetailDrawerCloseTimer = () => {
    if (detailDrawerCloseTimerRef.current) {
      clearTimeout(detailDrawerCloseTimerRef.current);
      detailDrawerCloseTimerRef.current = null;
    }
  };

  useEffect(() => () => clearDetailDrawerCloseTimer(), []);

  const handleShipmentClick = (shipment: ConsolidatedShipment) => {
    clearDetailDrawerCloseTimer();
    setDetailDrawerShipment(shipment);
    setDetailDrawerOpen(true);
  };

  const handleDetailDrawerOpenChange = (open: boolean) => {
    setDetailDrawerOpen(open);
    if (!open) {
      clearDetailDrawerCloseTimer();
      detailDrawerCloseTimerRef.current = setTimeout(() => {
        setDetailDrawerShipment(null);
        detailDrawerCloseTimerRef.current = null;
      }, DETAIL_DRAWER_CLOSE_MS);
    } else {
      clearDetailDrawerCloseTimer();
    }
  };

  const handleDetailTrackingCommit = (id: string, trackingId: string) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, trackingId } : s)));
  };

  const handleCreatePacked = (shipment: ConsolidatedShipment) => {
    setShipments(prev => [...prev, shipment]);
    setNotificationMessage(`Consolidated shipment ${shipment.id} was created successfully!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleSaveShipment = (shipment: ConsolidatedShipment) => {
    setShipments(prev => prev.map(s => (s.id === shipment.id ? shipment : s)));
    setNotificationMessage(`Consolidated shipment ${shipment.id} was updated successfully!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleUpdateShipment = (updatedShipment: ConsolidatedShipment) => {
    setShipments(prev => prev.map(s => s.id === updatedShipment.id ? updatedShipment : s));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f7f7f4] flex flex-col">
      {currentView === 'list' ? (
        <>
          <div className="h-[72px] shrink-0">
            <Header />
          </div>

          <div className="flex-1 overflow-hidden">
            <ShipmentsList
              shipments={shipments}
              onShipmentClick={handleShipmentClick}
              onCreateNew={() => {
                setCreateFormKey((k) => k + 1);
                setCreateDrawerOpen(true);
              }}
              onUpdateShipment={handleUpdateShipment}
              onSectionChange={onSectionChange}
            />
          </div>

          <ConsolidatedShipmentCreateDrawer
            key={createFormKey}
            open={createDrawerOpen}
            onOpenChange={setCreateDrawerOpen}
            onPacked={handleCreatePacked}
          />

          {detailDrawerShipment && (
            <ConsolidatedShipmentDetailDrawer
              shipment={
                shipments.find((s) => s.id === detailDrawerShipment.id) ?? detailDrawerShipment
              }
              open={detailDrawerOpen}
              onOpenChange={handleDetailDrawerOpenChange}
              onTrackingIdCommit={handleDetailTrackingCommit}
            />
          )}
        </>
      ) : (
        selectedShipment && (
          <ConsolidatedShipmentScreen
            shipment={selectedShipment}
            onBack={() => setCurrentView('list')}
            onSave={handleSaveShipment}
          />
        )
      )}

      {showNotification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <SuccessNotification 
            message={notificationMessage}
            onClose={() => setShowNotification(false)}
          />
        </div>
      )}
    </div>
  );
}