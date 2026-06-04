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

type ActiveView =
  | 'shipments'
  | 'collections'
  | 'consolidated'
  | 'routes'
  | 'shipmentAlerts'
  | 'shippingProductCatalog'
  | 'packingInstructions'
  | 'upgradeDowngradeRules'
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
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0002',
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
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0003',
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
        shippingWorkingDays: [1, 3, 5],
      },
      {
        id: 'SR-0004',
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
        packingFacility: 'Nazareth',
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0005',
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
        shippingWorkingDays: [1, 2, 4],
      },
      {
        id: 'SR-0006',
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
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0007',
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
        packingFacility: 'Nazareth',
        shippingWorkingDays: [1, 3, 5],
      },
      {
        id: 'SR-0008',
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
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0009',
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
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0010',
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
        packingFacility: 'Nazareth',
        shippingWorkingDays: [1, 2, 3],
      },
      {
        id: 'SR-0011',
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
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0012',
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
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0013',
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
        shippingWorkingDays: [1, 4, 5],
      },
      {
        id: 'SR-0014',
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
        packingFacility: 'Nazareth',
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0015',
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
        shippingWorkingDays: [1, 3, 5],
      },
      {
        id: 'SR-0016',
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
        packingFacility: 'Nazareth',
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0017',
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
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0018',
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
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0019',
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
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 'SR-0020',
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
        packingFacility: 'Nazareth',
        shippingWorkingDays: [1, 2, 3, 4, 5],
      },
    ],
  );

  // Shipments data
  const [shipments, setShipments] = useState<Shipment[]>([
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
      status: 'Label Created',
      consolidatedId: '273133181',
      consolidatedPack: 1,
      shipmentAlerts: ['not_packed_24h'] as AlertFilterId[],
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
      status: 'Delivered',
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
      status: 'Out for Delivery',
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
      status: 'On the Way',
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
      status: 'On the Way',
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
      status: 'On the Way',
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
      status: 'On the Way',
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
      status: 'On the Way',
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
      status: 'Delivered',
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
      status: 'Out for Delivery',
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
      status: 'Label Created',
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
      status: 'On the Way',
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
      status: 'Delivered',
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
      status: 'On the Way',
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
      status: 'Out for Delivery',
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
      status: 'Label Created',
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
      status: 'On the Way',
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
      status: 'Delivered',
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
      status: 'Out for Delivery',
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
      status: 'Label Created',
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
      status: 'On the Way',
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
      status: 'Delivered',
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
      status: 'Out for Delivery',
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
      status: 'Label Created',
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
      status: 'On the Way',
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
      status: 'Delivered',
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
      status: 'Out for Delivery',
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
      status: 'Label Created',
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