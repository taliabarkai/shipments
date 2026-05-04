import { useState } from 'react';
import { SHOW_SHIPMENT_COLLECTIONS } from './featureFlags';
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

type ActiveView =
  | 'shipments'
  | 'collections'
  | 'consolidated'
  | 'routes'
  | 'shipmentAlerts'
  | 'shippingProductCatalog'
  | 'packingInstructions'
  | 'globalCarrier';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('shipments');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const resolvedView: ActiveView =
    !SHOW_SHIPMENT_COLLECTIONS && activeView === 'collections' ? 'shipments' : activeView;
  const [isAddCollectionDialogOpen, setIsAddCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<ShipmentCollection | null>(null);

  // Shipping Routes data
  const [routes] = useState<ShippingRoute[]>(() =>
    [
    {
      id: '1',
      packingFacility: 'Hungary',
      fromCountryCode: 'Germany',
      toCountryCodes: 'USA, Canada',
      carrierServiceType: 'DHL',
      packingTimeFrame: '3 days',
      shippingTimeFrame: '6 days',
      shippingCost: '17.6',
      maxShippingValue: '100 USD',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Express',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['USA', 'Canada'],
      slug: 'hungary-usa-canada-dhl',
      fuelTax: '4.5',
      vat: '1.5',
      discount: '5',
      agentCommissionType: 'Percentage',
    },
    {
      id: '2',
      packingFacility: 'Thailand',
      fromCountryCode: 'Japan',
      toCountryCodes: 'USA',
      carrierServiceType: 'FedEx',
      packingTimeFrame: '4 days',
      shippingTimeFrame: '10 days',
      shippingCost: '17.6',
      maxShippingValue: '200 USD',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Express',
      shippingWorkingDays: 'Mon, Wed, Fri',
      destinationCountries: ['USA'],
      slug: 'thailand-usa-fedex',
      fuelTax: '5.2',
      vat: '2.0',
      discount: '3',
      agentCommissionType: 'Fixed Amount',
    },
    {
      id: '3',
      packingFacility: 'Kiryat Gat',
      fromCountryCode: 'South Korea',
      toCountryCodes: 'Canada',
      carrierServiceType: 'Korea Post',
      packingTimeFrame: '5 days',
      shippingTimeFrame: '10 days',
      shippingCost: '17.6',
      maxShippingValue: '100 USD',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['Canada'],
      slug: 'kiryat-gat-canada-korea-post',
      fuelTax: '3.8',
      vat: '1.2',
      discount: '7',
      agentCommissionType: 'Tiered',
    },
    {
      id: '4',
      packingFacility: 'Nazareth',
      fromCountryCode: 'India',
      toCountryCodes: 'Europe',
      carrierServiceType: 'DHL',
      packingTimeFrame: '3 days',
      shippingTimeFrame: '6 days',
      shippingCost: '17.6',
      maxShippingValue: '200 USD',
      currencyCode: 'EUR',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['Europe'],
      slug: 'nazareth-europe-dhl',
      fuelTax: '6.0',
      vat: '2.5',
      discount: '0',
      agentCommissionType: 'Percentage',
    },
    {
      id: '5',
      packingFacility: 'Thailand',
      fromCountryCode: 'Thailand',
      toCountryCodes: 'Australia, NZ',
      carrierServiceType: 'Global Post TH',
      packingTimeFrame: '4 days',
      shippingTimeFrame: '3 days',
      shippingCost: '20.5',
      maxShippingValue: '100 USD',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Express',
      shippingWorkingDays: 'Mon, Tue, Thu',
      destinationCountries: ['Australia', 'NZ'],
      slug: 'thailand-au-nz-global-post',
      fuelTax: '7.5',
      vat: '1.8',
      discount: '4',
      agentCommissionType: 'Fixed Amount',
    },
    {
      id: '6',
      packingFacility: 'Hungary',
      fromCountryCode: 'Brazil',
      toCountryCodes: 'South America',
      carrierServiceType: 'GlobalPost',
      packingTimeFrame: '5 days',
      shippingTimeFrame: '6 days',
      shippingCost: '15.0',
      maxShippingValue: '100 USD',
      currencyCode: 'BRL',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['South America'],
      slug: 'hungary-south-america-global',
      fuelTax: '3.2',
      vat: '1.0',
      discount: '8',
      agentCommissionType: 'Tiered',
    },
    {
      id: '7',
      packingFacility: 'Nazareth',
      fromCountryCode: 'Egypt',
      toCountryCodes: 'Africa',
      carrierServiceType: 'DHL',
      packingTimeFrame: '3 days',
      shippingTimeFrame: '10 days',
      shippingCost: '15.0',
      maxShippingValue: '200 USD',
      currencyCode: 'EGP',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Mon, Wed, Fri',
      destinationCountries: ['Africa'],
      slug: 'nazareth-africa-dhl',
      fuelTax: '4.8',
      vat: '1.3',
      discount: '2',
      agentCommissionType: 'Percentage',
    },
    {
      id: '8',
      packingFacility: 'Hungary',
      fromCountryCode: 'Russia',
      toCountryCodes: 'Europe, Asia',
      carrierServiceType: 'UPS',
      packingTimeFrame: '4 days',
      shippingTimeFrame: '6 days',
      shippingCost: '18.0',
      maxShippingValue: '200 USD',
      currencyCode: 'EUR',
      status: 'Active',
      method: 'Express',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['Europe', 'Asia'],
      slug: 'hungary-europe-asia-ups',
      fuelTax: '5.5',
      vat: '2.2',
      discount: '6',
      agentCommissionType: 'Fixed Amount',
    },
    {
      id: '9',
      packingFacility: 'Kiryat Gat',
      fromCountryCode: 'Israel',
      toCountryCodes: 'USA',
      carrierServiceType: 'FedEx',
      packingTimeFrame: '5 days',
      shippingTimeFrame: '10 days',
      shippingCost: '12.5',
      maxShippingValue: '100 USD',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['USA'],
      slug: 'kiryat-gat-usa-fedex',
      fuelTax: '2.9',
      vat: '1.1',
      discount: '10',
      agentCommissionType: 'Tiered',
    },
    {
      id: '10',
      packingFacility: 'Nazareth',
      fromCountryCode: 'Israel',
      toCountryCodes: 'Europe',
      carrierServiceType: 'USPS',
      packingTimeFrame: '3 days',
      shippingTimeFrame: '6 days',
      shippingCost: '22.0',
      maxShippingValue: '200 USD',
      currencyCode: 'EUR',
      status: 'Inactive',
      method: 'Standard',
      shippingWorkingDays: 'Mon, Tue, Wed',
      destinationCountries: ['Europe'],
      slug: 'nazareth-europe-usps',
      fuelTax: '6.8',
      vat: '2.1',
      discount: '0',
      agentCommissionType: 'Percentage',
    },
    {
      id: '11',
      packingFacility: 'Hungary',
      fromCountryCode: 'Germany',
      toCountryCodes: 'Asia',
      carrierServiceType: 'DHL',
      packingTimeFrame: '4 days',
      shippingTimeFrame: '10 days',
      shippingCost: '16.0',
      maxShippingValue: '200 USD',
      currencyCode: 'EUR',
      status: 'Active',
      method: 'Expedited',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['Asia'],
      slug: 'hungary-asia-dhl',
      fuelTax: '4.2',
      vat: '1.6',
      discount: '5',
      agentCommissionType: 'Fixed Amount',
    },
    {
      id: '12',
      packingFacility: 'Thailand',
      fromCountryCode: 'Japan',
      toCountryCodes: 'Europe, USA',
      carrierServiceType: 'FedEx',
      packingTimeFrame: '5 days',
      shippingTimeFrame: '3 days',
      shippingCost: '19.5',
      maxShippingValue: '100 USD',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Expedited',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['Europe', 'USA'],
      slug: 'thailand-europe-usa-fedex',
      fuelTax: '7.2',
      vat: '1.9',
      discount: '3',
      agentCommissionType: 'Tiered',
    },
    {
      id: '13',
      packingFacility: 'Thailand',
      fromCountryCode: 'Thailand',
      toCountryCodes: 'NZ',
      carrierServiceType: 'DHL TH',
      packingTimeFrame: '3 days',
      shippingTimeFrame: '6 days',
      shippingCost: '14.5',
      maxShippingValue: '100 USD',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Express',
      shippingWorkingDays: 'Mon, Thu, Fri',
      destinationCountries: ['NZ'],
      slug: 'thailand-nz-dhl-th',
      fuelTax: '3.5',
      vat: '1.4',
      discount: '7',
      agentCommissionType: 'Percentage',
    },
    {
      id: '14',
      packingFacility: 'Nazareth',
      fromCountryCode: 'India',
      toCountryCodes: 'USA, Canada',
      carrierServiceType: 'GlobalPost',
      packingTimeFrame: '4 days',
      shippingTimeFrame: '10 days',
      shippingCost: '13.5',
      maxShippingValue: '200 USD',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['USA', 'Canada'],
      slug: 'nazareth-usa-canada-global',
      fuelTax: '2.5',
      vat: '1.0',
      discount: '9',
      agentCommissionType: 'Fixed Amount',
    },
    {
      id: '15',
      packingFacility: 'Kiryat Gat',
      fromCountryCode: 'South Korea',
      toCountryCodes: 'USA',
      carrierServiceType: 'Korea Post',
      packingTimeFrame: '5 days',
      shippingTimeFrame: '6 days',
      shippingCost: '11.0',
      maxShippingValue: '100 USD',
      currencyCode: 'USD',
      status: 'Inactive',
      method: 'Standard',
      shippingWorkingDays: 'Mon, Wed, Fri',
      destinationCountries: ['USA'],
      slug: 'kiryat-gat-usa-korea-post',
      fuelTax: '2.2',
      vat: '0.9',
      discount: '12',
      agentCommissionType: 'Tiered',
    },
    {
      id: '16',
      packingFacility: 'Nazareth',
      fromCountryCode: 'Egypt',
      toCountryCodes: 'Europe',
      carrierServiceType: 'UPS',
      packingTimeFrame: '3 days',
      shippingTimeFrame: '3 days',
      shippingCost: '19.0',
      maxShippingValue: '200 USD',
      currencyCode: 'EUR',
      status: 'Active',
      method: 'Express',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['Europe'],
      slug: 'nazareth-europe-ups',
      fuelTax: '5.8',
      vat: '2.3',
      discount: '1',
      agentCommissionType: 'Percentage',
    },
    {
      id: '17',
      packingFacility: 'Hungary',
      fromCountryCode: 'Brazil',
      toCountryCodes: 'USA',
      carrierServiceType: 'FedEx',
      packingTimeFrame: '4 days',
      shippingTimeFrame: '6 days',
      shippingCost: '21.0',
      maxShippingValue: '100 USD',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Express',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['USA'],
      slug: 'hungary-usa-fedex',
      fuelTax: '3.0',
      vat: '1.0',
      discount: '0',
      agentCommissionType: 'Fixed Amount',
    },
    {
      id: '18',
      packingFacility: 'Thailand',
      fromCountryCode: 'Russia',
      toCountryCodes: 'Asia',
      carrierServiceType: 'DHL',
      packingTimeFrame: '5 days',
      shippingTimeFrame: '10 days',
      shippingCost: '18.5',
      maxShippingValue: '200 USD',
      currencyCode: 'RUB',
      status: 'Active',
      method: 'Expedited',
      shippingWorkingDays: 'Mon-Fri',
      destinationCountries: ['Asia'],
      slug: 'thailand-asia-dhl',
      fuelTax: '4.0',
      vat: '1.5',
      discount: '2',
      agentCommissionType: 'Tiered',
    },
    {
      id: '19',
      packingFacility: 'Kiryat Gat',
      fromCountryCode: 'Israel',
      toCountryCodes: 'Canada',
      carrierServiceType: 'USPS',
      packingTimeFrame: '2 days',
      shippingTimeFrame: '8 days',
      shippingCost: '16.5',
      maxShippingValue: '$4,200',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Monday-Friday',
      fuelTax: '2.5',
      vat: '1.0',
      discount: '5',
      agentCommissionType: 'Percentage',
    },
    {
      id: '20',
      packingFacility: 'Nazareth',
      fromCountryCode: 'Israel',
      toCountryCodes: 'Australia',
      carrierServiceType: 'GlobalPost',
      packingTimeFrame: '1 day',
      shippingTimeFrame: '10 days',
      shippingCost: '20.0',
      maxShippingValue: '$5,800',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Monday-Friday',
      fuelTax: '3.0',
      vat: '1.5',
      discount: '3',
      agentCommissionType: 'Fixed Amount',
    },
    {
      id: '21',
      packingFacility: 'Hungary',
      fromCountryCode: 'Germany',
      toCountryCodes: 'Canada',
      carrierServiceType: 'UPS',
      packingTimeFrame: '1 day',
      shippingTimeFrame: '6 days',
      shippingCost: '21.5',
      maxShippingValue: '$7,500',
      currencyCode: 'EUR',
      status: 'Active',
      method: 'Express',
      shippingWorkingDays: 'Monday-Friday',
      fuelTax: '4.5',
      vat: '2.0',
      discount: '1',
      agentCommissionType: 'Tiered',
    },
    {
      id: '22',
      packingFacility: 'Thailand',
      fromCountryCode: 'Japan',
      toCountryCodes: 'Asia',
      carrierServiceType: 'DHL',
      packingTimeFrame: '1 day',
      shippingTimeFrame: '4 days',
      shippingCost: '14.0',
      maxShippingValue: '$3,500',
      currencyCode: 'USD',
      status: 'Inactive',
      method: 'Standard',
      shippingWorkingDays: 'Monday-Friday',
      fuelTax: '2.0',
      vat: '1.0',
      discount: '0',
      agentCommissionType: 'Percentage',
    },
    {
      id: '23',
      packingFacility: 'Thailand',
      fromCountryCode: 'Thailand',
      toCountryCodes: 'USA',
      carrierServiceType: 'Global Post TH',
      packingTimeFrame: '2 days',
      shippingTimeFrame: '8 days',
      shippingCost: '17.0',
      maxShippingValue: '$4,800',
      currencyCode: 'USD',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Monday-Friday',
      fuelTax: '3.5',
      vat: '1.5',
      discount: '4',
      agentCommissionType: 'Fixed Amount',
    },
    {
      id: '24',
      packingFacility: 'Kiryat Gat',
      fromCountryCode: 'India',
      toCountryCodes: 'Canada',
      carrierServiceType: 'FedEx',
      packingTimeFrame: '2 days',
      shippingTimeFrame: '7 days',
      shippingCost: '19.8',
      maxShippingValue: '$6,000',
      currencyCode: 'INR',
      status: 'Active',
      method: 'Express',
      shippingWorkingDays: 'Monday-Friday',
      fuelTax: '4.0',
      vat: '1.5',
      discount: '2',
      agentCommissionType: 'Tiered',
    },
    {
      id: '25',
      packingFacility: 'Kiryat Gat',
      fromCountryCode: 'South Korea',
      toCountryCodes: 'Europe',
      carrierServiceType: 'Korea Post',
      packingTimeFrame: '2 days',
      shippingTimeFrame: '10 days',
      shippingCost: '15.5',
      maxShippingValue: '$4,000',
      currencyCode: 'KRW',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Monday-Friday',
      fuelTax: '3.0',
      vat: '1.0',
      discount: '5',
      agentCommissionType: 'Percentage',
    },
    {
      id: '26',
      packingFacility: 'Nazareth',
      fromCountryCode: 'Egypt',
      toCountryCodes: 'USA',
      carrierServiceType: 'GlobalPost',
      packingTimeFrame: '3 days',
      shippingTimeFrame: '12 days',
      shippingCost: '13.0',
      maxShippingValue: '$3,200',
      currencyCode: 'EGP',
      status: 'Active',
      method: 'Standard',
      shippingWorkingDays: 'Monday-Friday',
      fuelTax: '2.5',
      vat: '1.0',
      discount: '3',
      agentCommissionType: 'Fixed Amount',
    },
    {
      id: '27',
      packingFacility: 'Hungary',
      fromCountryCode: 'Brazil',
      toCountryCodes: 'Europe',
      carrierServiceType: 'DHL',
      packingTimeFrame: '2 days',
      shippingTimeFrame: '8 days',
      shippingCost: '20.8',
      maxShippingValue: '$7,000',
      currencyCode: 'BRL',
      status: 'Active',
      method: 'Expedited',
      shippingWorkingDays: 'Monday-Friday',
      fuelTax: '3.5',
      vat: '1.5',
      discount: '1',
      agentCommissionType: 'Tiered',
    },
    {
      id: '28',
      packingFacility: 'Hungary',
      fromCountryCode: 'Russia',
      toCountryCodes: 'USA',
      carrierServiceType: 'UPS',
      packingTimeFrame: '1 day',
      shippingTimeFrame: '7 days',
      shippingCost: '22.5',
      maxShippingValue: '$8,500',
      currencyCode: 'RUB',
      status: 'Active',
      method: 'Express',
      shippingWorkingDays: 'Monday-Friday',
      fuelTax: '4.0',
      vat: '1.5',
      discount: '2',
      agentCommissionType: 'Percentage',
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