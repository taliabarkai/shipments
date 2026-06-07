import { useState } from 'react';
import { SHOW_SHIPMENT_COLLECTIONS, SHOW_SHIPPING_PRODUCT_CATALOG } from './featureFlags';
import { TooltipProvider } from './components/ui/tooltip';
import Header from './imports/Header';
import ExpandableSidebar from './components/ExpandableSidebar';
import MainMenuSidebar from './imports/MainMenuSidebar';
import ShipmentsTable, { Shipment } from './components/ShipmentsTable';
import type { AlertFilterId } from './components/alertFilterRules';
import ShipmentCollectionsTable, { ShipmentCollection, CollectionStatus } from './components/ShipmentCollectionsTable';
import ConsolidatedShipmentsApp from './components/ConsolidatedShipmentsApp';
import AddCollectionDialog from './components/AddCollectionDialog';
import ShippingRoutesTable, { ShippingRoute } from './components/ShippingRoutesTable';
import GlobalCarrierConfiguration from './components/GlobalCarrierConfiguration';
import ShipmentAlertsApp from './components/ShipmentAlertsApp';
import ShippingProductCatalogApp from './components/ShippingProductCatalogApp';
import PackingInstructionsApp from './components/PackingInstructionsApp';
import UpgradeDowngradeRulesApp from './components/UpgradeDowngradeRulesApp';
import CarrierServiceTypesApp from './components/CarrierServiceTypesApp';
import type { CarrierServiceType } from './components/carrierServiceTypes';

type ActiveView =
  | 'shipments'
  | 'collections'
  | 'consolidated'
  | 'routes'
  | 'shipmentAlerts'
  | 'shippingProductCatalog'
  | 'packingInstructions'
  | 'upgradeDowngradeRules'
  | 'carrierServiceTypes'
  | 'globalCarrier';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('shipments');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const resolvedView: ActiveView =
    !SHOW_SHIPMENT_COLLECTIONS && activeView === 'collections'
      ? 'shipments'
      : !SHOW_SHIPPING_PRODUCT_CATALOG && activeView === 'shippingProductCatalog'
        ? 'shipments'
        : activeView;
  const [isAddCollectionDialogOpen, setIsAddCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<ShipmentCollection | null>(null);

  // Shipping Routes data
  const [routes] = useState<ShippingRoute[]>(() =>
    [
      {
        id: 'SR-0001',
        externalId: 'EXT-1001',
        status: 'Active',
        carrierServiceType: 'DHL',
        serviceLevel: 'Express',
        priority: true,
        fromCountryCode: 'DE',
        toCountryCode: 'US',
        maxShippingValue: '1200.00',
        currencyCode: 'USD',
        packingTimeFrame: '3',
        shippingTimeFrame: '6',
        shippingCost: '17.60',
        packingFacility: 'Hungary',
        shippingWorkingDays: [1, 2],
      },
      {
        id: 'SR-0002',
        externalId: 'EXT-1002',
        status: 'Active',
        carrierServiceType: 'FedEx',
        serviceLevel: 'Express',
        priority: false,
        fromCountryCode: 'JP',
        toCountryCode: 'US',
        maxShippingValue: '2000.00',
        currencyCode: 'USD',
        packingTimeFrame: '4',
        shippingTimeFrame: '10',
        shippingCost: '17.60',
        packingFacility: 'Thailand',
        shippingWorkingDays: [3, 4],
      },
      {
        id: 'SR-0003',
        externalId: 'EXT-1003',
        status: 'Active',
        carrierServiceType: 'Korea Post',
        serviceLevel: 'Basic',
        priority: false,
        fromCountryCode: 'KR',
        toCountryCode: 'CA',
        maxShippingValue: '1000.00',
        currencyCode: 'USD',
        packingTimeFrame: '5',
        shippingTimeFrame: '10',
        shippingCost: '17.60',
        packingFacility: 'Kiryat Gat',
        shippingWorkingDays: [2, 3],
      },
      {
        id: 'SR-0004',
        externalId: 'EXT-1004',
        status: 'Active',
        carrierServiceType: 'DHL',
        serviceLevel: 'Express',
        priority: true,
        fromCountryCode: 'IN',
        toCountryCode: 'DE',
        maxShippingValue: '2000.00',
        currencyCode: 'USD',
        packingTimeFrame: '3',
        shippingTimeFrame: '6',
        shippingCost: '17.60',
        packingFacility: 'Nazereth',
        shippingWorkingDays: [1, 2],
      },
      {
        id: 'SR-0005',
        externalId: 'EXT-1005',
        status: 'Active',
        carrierServiceType: 'Global Post TH',
        serviceLevel: 'Expedited',
        priority: false,
        fromCountryCode: 'TH',
        toCountryCode: 'AU',
        maxShippingValue: '1500.00',
        currencyCode: 'USD',
        packingTimeFrame: '4',
        shippingTimeFrame: '3',
        shippingCost: '20.50',
        packingFacility: 'Thailand',
        shippingWorkingDays: [3, 4],
      },
      {
        id: 'SR-0006',
        externalId: 'EXT-1006',
        status: 'Active',
        carrierServiceType: 'GlobalPost',
        serviceLevel: 'Basic',
        priority: false,
        fromCountryCode: 'BR',
        toCountryCode: 'BR',
        maxShippingValue: '1000.00',
        currencyCode: 'USD',
        packingTimeFrame: '5',
        shippingTimeFrame: '6',
        shippingCost: '15.00',
        packingFacility: 'Hungary',
        shippingWorkingDays: [2, 3],
      },
      {
        id: 'SR-0007',
        externalId: 'EXT-1007',
        status: 'Active',
        carrierServiceType: 'DHL',
        serviceLevel: 'Express',
        priority: true,
        fromCountryCode: 'EG',
        toCountryCode: 'EG',
        maxShippingValue: '2000.00',
        currencyCode: 'USD',
        packingTimeFrame: '3',
        shippingTimeFrame: '10',
        shippingCost: '15.00',
        packingFacility: 'Nazereth',
        shippingWorkingDays: [1, 2],
      },
      {
        id: 'SR-0008',
        externalId: 'EXT-1008',
        status: 'Active',
        carrierServiceType: 'UPS',
        serviceLevel: 'Express',
        priority: false,
        fromCountryCode: 'RU',
        toCountryCode: 'DE',
        maxShippingValue: '2000.00',
        currencyCode: 'USD',
        packingTimeFrame: '4',
        shippingTimeFrame: '6',
        shippingCost: '18.00',
        packingFacility: 'Hungary',
        shippingWorkingDays: [3, 4],
      },
      {
        id: 'SR-0009',
        externalId: 'EXT-1009',
        status: 'Active',
        carrierServiceType: 'FedEx',
        serviceLevel: 'Express',
        priority: false,
        fromCountryCode: 'IL',
        toCountryCode: 'US',
        maxShippingValue: '1000.00',
        currencyCode: 'USD',
        packingTimeFrame: '5',
        shippingTimeFrame: '10',
        shippingCost: '12.50',
        packingFacility: 'Kiryat Gat',
        shippingWorkingDays: [2, 3],
      },
      {
        id: 'SR-0010',
        externalId: 'EXT-1010',
        status: 'Inactive',
        carrierServiceType: 'USPS',
        serviceLevel: 'Basic',
        priority: false,
        fromCountryCode: 'IL',
        toCountryCode: 'DE',
        maxShippingValue: '2000.00',
        currencyCode: 'USD',
        packingTimeFrame: '3',
        shippingTimeFrame: '6',
        shippingCost: '22.00',
        packingFacility: 'Nazereth',
        shippingWorkingDays: [1, 2],
      },
      {
        id: 'SR-0011',
        externalId: 'EXT-1011',
        status: 'Active',
        carrierServiceType: 'DHL',
        serviceLevel: 'Express',
        priority: false,
        fromCountryCode: 'DE',
        toCountryCode: 'JP',
        maxShippingValue: '2000.00',
        currencyCode: 'USD',
        packingTimeFrame: '4',
        shippingTimeFrame: '10',
        shippingCost: '16.00',
        packingFacility: 'Hungary',
        shippingWorkingDays: [3, 4],
      },
      {
        id: 'SR-0012',
        externalId: 'EXT-1012',
        status: 'Active',
        carrierServiceType: 'FedEx',
        serviceLevel: 'Express',
        priority: true,
        fromCountryCode: 'JP',
        toCountryCode: 'DE',
        maxShippingValue: '1000.00',
        currencyCode: 'USD',
        packingTimeFrame: '5',
        shippingTimeFrame: '3',
        shippingCost: '19.50',
        packingFacility: 'Thailand',
        shippingWorkingDays: [2, 3],
      },
      {
        id: 'SR-0013',
        externalId: 'EXT-1013',
        status: 'Active',
        carrierServiceType: 'DHL TH',
        serviceLevel: 'Express',
        priority: false,
        fromCountryCode: 'TH',
        toCountryCode: 'NZ',
        maxShippingValue: '1000.00',
        currencyCode: 'USD',
        packingTimeFrame: '3',
        shippingTimeFrame: '6',
        shippingCost: '14.50',
        packingFacility: 'Thailand',
        shippingWorkingDays: [1, 2],
      },
      {
        id: 'SR-0014',
        externalId: 'EXT-1014',
        status: 'Active',
        carrierServiceType: 'GlobalPost',
        serviceLevel: 'Basic',
        priority: false,
        fromCountryCode: 'IN',
        toCountryCode: 'US',
        maxShippingValue: '2000.00',
        currencyCode: 'USD',
        packingTimeFrame: '4',
        shippingTimeFrame: '10',
        shippingCost: '13.50',
        packingFacility: 'Nazereth',
        shippingWorkingDays: [3, 4],
      },
      {
        id: 'SR-0015',
        externalId: 'EXT-1015',
        status: 'Inactive',
        carrierServiceType: 'Korea Post',
        serviceLevel: 'Basic',
        priority: false,
        fromCountryCode: 'KR',
        toCountryCode: 'US',
        maxShippingValue: '1000.00',
        currencyCode: 'USD',
        packingTimeFrame: '5',
        shippingTimeFrame: '6',
        shippingCost: '11.00',
        packingFacility: 'Kiryat Gat',
        shippingWorkingDays: [2, 3],
      },
      {
        id: 'SR-0016',
        externalId: 'EXT-1016',
        status: 'Active',
        carrierServiceType: 'UPS',
        serviceLevel: 'Express',
        priority: true,
        fromCountryCode: 'EG',
        toCountryCode: 'DE',
        maxShippingValue: '2000.00',
        currencyCode: 'USD',
        packingTimeFrame: '3',
        shippingTimeFrame: '3',
        shippingCost: '19.00',
        packingFacility: 'Nazereth',
        shippingWorkingDays: [1, 2],
      },
      {
        id: 'SR-0017',
        externalId: 'EXT-1017',
        status: 'Active',
        carrierServiceType: 'FedEx',
        serviceLevel: 'Express',
        priority: false,
        fromCountryCode: 'BR',
        toCountryCode: 'US',
        maxShippingValue: '1000.00',
        currencyCode: 'USD',
        packingTimeFrame: '4',
        shippingTimeFrame: '6',
        shippingCost: '21.00',
        packingFacility: 'Hungary',
        shippingWorkingDays: [3, 4],
      },
      {
        id: 'SR-0018',
        externalId: 'EXT-1018',
        status: 'Active',
        carrierServiceType: 'DHL',
        serviceLevel: 'Express',
        priority: false,
        fromCountryCode: 'RU',
        toCountryCode: 'JP',
        maxShippingValue: '2000.00',
        currencyCode: 'USD',
        packingTimeFrame: '5',
        shippingTimeFrame: '10',
        shippingCost: '18.50',
        packingFacility: 'Thailand',
        shippingWorkingDays: [2, 3],
      },
      {
        id: 'SR-0019',
        externalId: 'EXT-1019',
        status: 'Active',
        carrierServiceType: 'USPS',
        serviceLevel: 'Basic',
        priority: false,
        fromCountryCode: 'IL',
        toCountryCode: 'CA',
        maxShippingValue: '4200.00',
        currencyCode: 'USD',
        packingTimeFrame: '2',
        shippingTimeFrame: '8',
        shippingCost: '16.50',
        packingFacility: 'Kiryat Gat',
        shippingWorkingDays: [1, 2],
      },
      {
        id: 'SR-0020',
        externalId: 'EXT-1020',
        status: 'Active',
        carrierServiceType: 'GlobalPost',
        serviceLevel: 'Basic',
        priority: false,
        fromCountryCode: 'IL',
        toCountryCode: 'AU',
        maxShippingValue: '5800.00',
        currencyCode: 'USD',
        packingTimeFrame: '1',
        shippingTimeFrame: '10',
        shippingCost: '20.00',
        packingFacility: 'Nazereth',
        shippingWorkingDays: [3, 4],
      },
    ],
  );

  // Carrier Service Types data
  const [carrierServiceTypes, setCarrierServiceTypes] = useState<CarrierServiceType[]>([
    {
      carrier_service_type_id: 1,
      carrier_company_number: 1,
      car_company_name: 'USPS',
      blocked_downgrade: false,
      service_level_method: 'basic',
      shipping_label_method: 'api',
      slug: 'usps-prio',
      shipped_report_method: 'api',
    },
    {
      carrier_service_type_id: 2,
      carrier_company_number: 3,
      car_company_name: 'FedEx',
      blocked_downgrade: true,
      service_level_method: 'express',
      shipping_label_method: 'label_template',
      slug: 'fedex-exp',
      shipped_report_method: 'api',
    },
    {
      carrier_service_type_id: 3,
      carrier_company_number: 4,
      car_company_name: 'DHL',
      blocked_downgrade: false,
      service_level_method: 'expedited',
      shipping_label_method: 'pool',
      slug: 'dhl-eu',
      shipped_report_method: 'pick_up_schedule',
    },
    {
      carrier_service_type_id: 4,
      carrier_company_number: 2,
      car_company_name: 'UPS',
      blocked_downgrade: true,
      service_level_method: 'express',
      shipping_label_method: 'api',
      slug: 'ups-next',
      shipped_report_method: 'api_merukazim',
    },
    {
      carrier_service_type_id: 5,
      carrier_company_number: 12,
      car_company_name: 'Landmark',
      blocked_downgrade: false,
      service_level_method: 'basic',
      shipping_label_method: 'order_id',
      slug: 'landmark',
      shipped_report_method: null,
    },
    {
      carrier_service_type_id: 6,
      carrier_company_number: 6,
      car_company_name: 'Canada Post',
      blocked_downgrade: false,
      service_level_method: null,
      shipping_label_method: null,
      slug: 'cp-std',
      shipped_report_method: null,
    },
  ]);

  const handleSaveCarrierServiceType = (next: CarrierServiceType) => {
    setCarrierServiceTypes((prev) => {
      if (next.carrier_service_type_id && prev.some((r) => r.carrier_service_type_id === next.carrier_service_type_id)) {
        return prev.map((r) => (r.carrier_service_type_id === next.carrier_service_type_id ? next : r));
      }
      const nextId = prev.reduce((max, r) => Math.max(max, r.carrier_service_type_id), 0) + 1;
      return [...prev, { ...next, carrier_service_type_id: nextId }];
    });
  };

  // Shipments data
  const [shipments, setShipments] = useState<Shipment[]>([
    {
      orderId: '273134001',
      packingFacility: 'Nazareth',
      destination: 'USA',
      carrier: 'UPS',
      trackingId: 'US7755610982',
      siteId: 'S4',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$182.30',
      status: 'On Hold',
      holdReason: 'Waiting for pending item',
    },
    {
      orderId: '273134002',
      packingFacility: 'Thailand',
      destination: 'Germany',
      carrier: 'DHL',
      trackingId: 'DE9921778103',
      siteId: 'S12',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$76.10',
      status: 'Pending',
      pendingReason: 'Supervisor inspection',
    },
    {
      orderId: '273134003',
      packingFacility: 'Kiryat Gat',
      destination: 'Canada',
      carrier: 'Canada Post',
      trackingId: 'CA4477120389',
      siteId: 'S7',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$54.90',
      status: 'Pending',
      pendingReason: 'API error',
    },
    {
      orderId: '273134004',
      packingFacility: 'Hungary',
      destination: 'Belgium',
      carrier: 'Bpost',
      trackingId: 'BE3349990017',
      siteId: 'S9',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$118.40',
      status: 'Ready to Pack',
    },
    {
      orderId: '273134005',
      packingFacility: 'Thailand',
      destination: 'United Kingdom',
      carrier: 'Royal Mail',
      trackingId: 'GB1188400255',
      siteId: 'S22',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$203.10',
      status: 'Packed',
    },
    {
      orderId: '273134006',
      packingFacility: 'Nazareth',
      destination: 'Israel',
      carrier: 'Israel Post',
      trackingId: 'IL5512300884',
      siteId: 'S3',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$39.95',
      status: 'Cancelled',
      cancellationReason: 'Customer request',
    },
    {
      orderId: '273133181',
      packingFacility: 'Kiryat Gat',
      destination: 'USA',
      carrier: 'FedEx',
      trackingId: '1Z999AA10123456784',
      siteId: 'S1',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$245.50',
      status: 'Draft',
      consolidatedId: '273133181',
      consolidatedPack: 1,
      shipmentAlerts: ['not_packed_24h'] as AlertFilterId[],
      shipmentPrice: 24.99,
      shippingCostAmount: 12.4,
      declaredValue: 245.5,
      financialIncoterm: 'DDP',
    },
    {
      orderId: '273133182',
      packingFacility: 'Thailand',
      destination: 'Australia',
      carrier: 'UPS',
      trackingId: 'AU8734625789',
      siteId: 'S27',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$1,289.75',
      status: 'Shipped',
      consolidatedId: '273133181',
      consolidatedPack: 2,
      shipmentAlerts: ['draft_12h'] as AlertFilterId[],
    },
    {
      orderId: '273133183',
      packingFacility: 'Nazareth',
      destination: 'Canada',
      carrier: 'USPS',
      trackingId: 'CA92001903250123456789',
      siteId: 'S43',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$567.30',
      status: 'Shipped',
      consolidatedId: '273133181',
      consolidatedPack: 3,
      shipmentAlerts: ['packed_12h'] as AlertFilterId[],
    },
    {
      orderId: '273133184',
      packingFacility: 'Hungary',
      destination: 'UK',
      carrier: 'Royal Mail',
      trackingId: 'RN123456789GB',
      siteId: 'S16',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$892.45',
      status: 'Shipped',
      consolidatedId: '273133182',
      consolidatedPack: 1,
    },
    {
      orderId: '273133185',
      packingFacility: 'Kiryat Gat',
      destination: 'Germany',
      carrier: 'DHL',
      trackingId: 'DE00340434192383470192',
      siteId: 'S54',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$1,456.80',
      status: 'Shipped',
      consolidatedId: '273133182',
      consolidatedPack: 2,
    },
    {
      orderId: '273133186',
      packingFacility: 'Thailand',
      destination: 'Ireland',
      carrier: 'DPD',
      trackingId: 'IE0801234567890',
      siteId: 'S19',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$734.20',
      status: 'Shipped',
    },
    {
      orderId: '273133187',
      packingFacility: 'Nazareth',
      destination: 'USA',
      carrier: 'UPS',
      trackingId: '1Z999AA10987654321',
      siteId: 'S43',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$425.90',
      status: 'Shipped',
    },
    {
      orderId: '273133188',
      packingFacility: 'Hungary',
      destination: 'Australia',
      carrier: 'Hermes',
      trackingId: 'HER123456789AU',
      siteId: 'S27',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$2,134.65',
      status: 'Shipped',
    },
    {
      orderId: '273133189',
      packingFacility: 'Kiryat Gat',
      destination: 'USA',
      carrier: 'FedEx',
      trackingId: '1Z999AA10123456785',
      siteId: 'S2',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$315.75',
      status: 'Shipped',
    },
    {
      orderId: '273133190',
      packingFacility: 'Thailand',
      destination: 'Japan',
      carrier: 'DHL',
      trackingId: 'JP9876543210',
      siteId: 'S33',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$1,567.90',
      status: 'Shipped',
    },
    {
      orderId: '273133191',
      packingFacility: 'Nazareth',
      destination: 'France',
      carrier: 'La Poste',
      trackingId: 'FR123456789',
      siteId: 'S44',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$678.40',
      status: 'Draft',
    },
    {
      orderId: '273133192',
      packingFacility: 'Hungary',
      destination: 'Spain',
      carrier: 'Correos',
      trackingId: 'ES987654321',
      siteId: 'S17',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$890.55',
      status: 'Shipped',
    },
    {
      orderId: '273133193',
      packingFacility: 'Kiryat Gat',
      destination: 'Italy',
      carrier: 'Poste Italiane',
      trackingId: 'IT456789123',
      siteId: 'S5',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$1,245.30',
      status: 'Shipped',
    },
    {
      orderId: '273133194',
      packingFacility: 'Thailand',
      destination: 'China',
      carrier: 'China Post',
      trackingId: 'CN789123456',
      siteId: 'S28',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$2,456.80',
      status: 'Shipped',
    },
    {
      orderId: '273133195',
      packingFacility: 'Nazareth',
      destination: 'Netherlands',
      carrier: 'PostNL',
      trackingId: 'NL321654987',
      siteId: 'S45',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$534.90',
      status: 'Shipped',
    },
    {
      orderId: '273133196',
      packingFacility: 'Hungary',
      destination: 'Belgium',
      carrier: 'Bpost',
      trackingId: 'BE147258369',
      siteId: 'S18',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$765.25',
      status: 'Draft',
    },
    {
      orderId: '273133197',
      packingFacility: 'Kiryat Gat',
      destination: 'Canada',
      carrier: 'Canada Post',
      trackingId: 'CA369258147',
      siteId: 'S6',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$987.60',
      status: 'Shipped',
    },
    {
      orderId: '273133198',
      packingFacility: 'Thailand',
      destination: 'South Korea',
      carrier: 'Korea Post',
      trackingId: 'KR852963741',
      siteId: 'S29',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$1,789.45',
      status: 'Shipped',
    },
    {
      orderId: '273133199',
      packingFacility: 'Nazareth',
      destination: 'Sweden',
      carrier: 'PostNord',
      trackingId: 'SE741852963',
      siteId: 'S46',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$623.80',
      status: 'Shipped',
    },
    {
      orderId: '273133200',
      packingFacility: 'Hungary',
      destination: 'Norway',
      carrier: 'Posten Norge',
      trackingId: 'NO963852741',
      siteId: 'S19',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$845.90',
      status: 'Draft',
    },
    {
      orderId: '273133201',
      packingFacility: 'Kiryat Gat',
      destination: 'Denmark',
      carrier: 'PostNord',
      trackingId: 'DK159753486',
      siteId: 'S7',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$1,156.70',
      status: 'Shipped',
    },
    {
      orderId: '273133202',
      packingFacility: 'Thailand',
      destination: 'Singapore',
      carrier: 'SingPost',
      trackingId: 'SG486159753',
      siteId: 'S30',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$2,234.55',
      status: 'Shipped',
    },
    {
      orderId: '273133203',
      packingFacility: 'Nazareth',
      destination: 'Switzerland',
      carrier: 'Swiss Post',
      trackingId: 'CH753486159',
      siteId: 'S47',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$945.30',
      status: 'Shipped',
    },
    {
      orderId: '273133204',
      packingFacility: 'Hungary',
      destination: 'Austria',
      carrier: 'Österreichische Post',
      trackingId: 'AT159486753',
      siteId: 'S20',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$1,067.85',
      status: 'Draft',
    },
    {
      orderId: '273133205',
      packingFacility: 'Kiryat Gat',
      destination: 'Poland',
      carrier: 'Poczta Polska',
      trackingId: 'PL486753159',
      siteId: 'S8',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$678.95',
      status: 'Shipped',
    },
    {
      orderId: '273133206',
      packingFacility: 'Thailand',
      destination: 'Mexico',
      carrier: 'Correos de México',
      trackingId: 'MX753159486',
      siteId: 'S31',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$1,345.60',
      status: 'Shipped',
    },
    {
      orderId: '273133207',
      packingFacility: 'Nazareth',
      destination: 'Brazil',
      carrier: 'Correios',
      trackingId: 'BR159753486',
      siteId: 'S48',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$2,567.40',
      status: 'Shipped',
    },
    {
      orderId: '273133208',
      packingFacility: 'Hungary',
      destination: 'India',
      carrier: 'India Post',
      trackingId: 'IN486159753',
      siteId: 'S21',
      label: 'View Label',
      invoice: 'View Invoice',
      orderCost: '$1,890.25',
      status: 'Draft',
    },
  ]);

  // Shipment Collections data
  const [collections, setCollections] = useState<ShipmentCollection[]>([
    {
      id: '1',
      packingFacility: 'Hungary',
      carrier: 'Global Post HU',
      pickUpTime: '8:00',
      sentToPack: 120,
      packed: 420,
      status: 'Picked Up',
      dateCreated: '11/15/2023',
    },
    {
      id: '2',
      packingFacility: 'Hungary',
      carrier: 'DHL EU',
      pickUpTime: '8:00',
      sentToPack: 23,
      packed: 18,
      status: 'Pending',
      dateCreated: '11/20/2023',
    },
    {
      id: '3',
      packingFacility: 'Kiryat Gat',
      carrier: 'UPS',
      pickUpTime: '12:00',
      sentToPack: 47,
      packed: 11,
      status: 'Pending',
      dateCreated: '11/25/2023',
    },
    {
      id: '4',
      packingFacility: 'Kiryat Gat',
      carrier: 'MailLog',
      pickUpTime: '8:00',
      sentToPack: 400,
      packed: 0,
      status: 'Pending',
      dateCreated: '12/1/2023',
    },
    {
      id: '5',
      packingFacility: 'Nazareth',
      carrier: 'USPS',
      pickUpTime: '16:00',
      sentToPack: 500,
      packed: 150,
      status: 'Pending',
      dateCreated: '12/5/2023',
    },
    {
      id: '6',
      packingFacility: 'Nazareth',
      carrier: 'FedEx',
      pickUpTime: '16:00',
      sentToPack: 217,
      packed: 420,
      status: 'Pending',
      dateCreated: '12/8/2023',
    },
    {
      id: '7',
      packingFacility: 'Thailand',
      carrier: 'DHL TH',
      pickUpTime: '8:00',
      sentToPack: 29,
      packed: 503,
      status: 'Picked Up',
      dateCreated: '12/10/2023',
    },
    {
      id: '8',
      packingFacility: 'Thailand',
      carrier: 'DHL TH',
      pickUpTime: '12:00',
      sentToPack: 288,
      packed: 384,
      status: 'Picked Up',
      dateCreated: '12/11/2023',
    },
  ]);

  const handleUpdateCollectionStatus = (id: string, status: CollectionStatus) => {
    setCollections(prev =>
      prev.map(collection =>
        collection.id === id ? { ...collection, status } : collection
      )
    );
  };

  const handleRefresh = () => {
    // Mock refresh - in real app would fetch new data
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const handleAddCollection = () => {
    // Mock add collection - would open dialog
    setIsAddCollectionDialogOpen(true);
  };

  const handleAddCollectionSubmit = (carrier: string, pickupTime: string) => {
    if (editingCollection) {
      // Edit existing collection
      setCollections(prev =>
        prev.map(collection =>
          collection.id === editingCollection.id
            ? { ...collection, carrier, pickUpTime: pickupTime }
            : collection
        )
      );
      setEditingCollection(null);
    } else {
      // Create new collection
      const newCollection: ShipmentCollection = {
        id: String(collections.length + 1),
        packingFacility: 'Kiryat Gat', // Default facility
        carrier,
        pickUpTime: pickupTime,
        sentToPack: 0,
        packed: 0,
        status: 'Pending',
        dateCreated: new Date().toLocaleDateString('en-US'),
      };
      
      setCollections(prev => [...prev, newCollection]);
    }
    setIsAddCollectionDialogOpen(false);
  };

  const handleEditCollection = (collection: ShipmentCollection) => {
    setEditingCollection(collection);
    setIsAddCollectionDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddCollectionDialogOpen(false);
    setEditingCollection(null);
  };

  const handleCreateShipment = () => {
    // Mock create shipment - would open dialog
    console.log('Create new shipment...');
  };

  // If viewing consolidated shipments, use the existing component
  if (resolvedView === 'consolidated') {
    return <ConsolidatedShipmentsApp onSectionChange={setActiveView} />;
  }

  return (
    <TooltipProvider>
      <div className="relative w-full h-screen overflow-hidden bg-[#f7f7f4] flex flex-col">
        {/* Header */}
        <div className="h-[72px] shrink-0">
          <Header />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Menu Sidebar */}
          <div className="shrink-0">
            <MainMenuSidebar />
          </div>

          {/* Expandable Sidebar */}
          <div className="shrink-0">
            <ExpandableSidebar 
              activeSection={resolvedView} 
              onSectionChange={setActiveView}
            />
          </div>

          {/* Content Area */}
          <div className="flex flex-col flex-1 overflow-hidden bg-[rgb(249,250,251)]">
            {resolvedView === 'shipments' && (
              <ShipmentsTable
                shipments={shipments}
              />
            )}
            {SHOW_SHIPMENT_COLLECTIONS && resolvedView === 'collections' && (
              <ShipmentCollectionsTable
                collections={collections}
                onRefresh={handleRefresh}
                onAddCollection={handleAddCollection}
                onUpdateStatus={handleUpdateCollectionStatus}
                isRefreshing={isRefreshing}
                onEditCollection={handleEditCollection}
              />
            )}
            {resolvedView === 'routes' && (
              <ShippingRoutesTable
                routes={routes}
              />
            )}
            {resolvedView === 'shipmentAlerts' && <ShipmentAlertsApp />}
            {resolvedView === 'shippingProductCatalog' && <ShippingProductCatalogApp />}
            {resolvedView === 'packingInstructions' && <PackingInstructionsApp />}
            {resolvedView === 'upgradeDowngradeRules' && <UpgradeDowngradeRulesApp />}
            {resolvedView === 'carrierServiceTypes' && (
              <CarrierServiceTypesApp
                records={carrierServiceTypes}
                onSave={handleSaveCarrierServiceType}
              />
            )}
            {resolvedView === 'globalCarrier' && (
              <GlobalCarrierConfiguration />
            )}
          </div>
        </div>

        {SHOW_SHIPMENT_COLLECTIONS && (
          <AddCollectionDialog
            isOpen={isAddCollectionDialogOpen}
            onClose={handleCloseDialog}
            onAdd={handleAddCollectionSubmit}
            editMode={!!editingCollection}
            initialCarrier={editingCollection?.carrier}
            initialPickupTime={editingCollection?.pickUpTime}
          />
        )}
      </div>
    </TooltipProvider>
  );
}