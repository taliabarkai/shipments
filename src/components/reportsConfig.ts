/**
 * Static configuration for the Reports page. Each report declares its category,
 * description, any auto-applied conditions, data sources (color-coded), and any
 * fields not yet confirmed in the shipment service (rendered as a
 * developer-input warning). Every report takes the same parameters: report type,
 * From/To date, and Site IDs.
 */

export type ReportCategory = 'Shipping' | 'Finance';

/** Drives the source-chip color: Shipment = blue, OCS = green, OM = amber, External = gray. */
export type ReportSourceType = 'Shipment' | 'OCS' | 'OM' | 'External';

export interface ReportSource {
  label: string;
  type: ReportSourceType;
}

export interface ReportConfig {
  id: string;
  name: string;
  category: ReportCategory;
  description: string;
  autoConditions?: string[];
  sources: ReportSource[];
  problematicFields?: string[];
}

export interface SiteOption {
  value: string;
  label: string;
}

/** The selectable sites. The "All sites (n)" summary label is derived from this length. */
export const SITE_OPTIONS: SiteOption[] = [
  { value: 'OAL', label: 'Oak and Luna (OAL)' },
  { value: 'TGR', label: 'Theo Grace (TGR)' },
  { value: 'LAL', label: 'Lime and Lou (LAL)' },
  { value: 'IB', label: 'Israel Blessing (IB)' },
  { value: 'MNN', label: 'MYKA (MNN)' },
  { value: 'SETT', label: 'Sett and Co (SETT)' },
  { value: 'FEM', label: 'Forever My (FEM)' },
  { value: 'MNN-IL', label: 'My Name Necklace IL (MNN-IL)' },
];

export const REPORTS: ReportConfig[] = [
  {
    id: 'aftership',
    name: 'AfterShip Report',
    category: 'Shipping',
    description:
      'Shipment tracking feed — one row per shipped order pushed to AfterShip',
    sources: [
      { label: 'Shipment', type: 'Shipment' },
      { label: 'OCS config', type: 'OCS' },
    ],
  },
  {
    id: 'cs-eta',
    name: 'Customer Support ETA',
    category: 'Shipping',
    description:
      'ETA communication & CX ops — expected vs. actual delivery, proactive interventions, holds and claim flags per order',
    sources: [
      { label: 'Shipment', type: 'Shipment' },
      { label: 'OCS/CRM', type: 'OCS' },
    ],
    problematicFields: ['Original cart carrier', 'Customer shipping price'],
  },
  {
    id: 'fedex-hu-customs',
    name: 'FedEx HU Customs',
    category: 'Shipping',
    description:
      'Item-level customs declaration for FedEx Hungary — SKU, HS code, quantity, and declared value per shipment',
    autoConditions: ['FedEx only', 'Hungary origin'],
    sources: [
      { label: 'Shipment', type: 'Shipment' },
      { label: 'Product catalog', type: 'External' },
    ],
    problematicFields: ['HS Code', 'Declared value'],
  },
  {
    id: 'hungary-non-eu',
    name: 'Hungary Orders — NON-EU',
    category: 'Shipping',
    description:
      'HU factory manifest for non-EU destinations. Order and item details for carrier submission and customs clearance',
    autoConditions: ['Hungary origin', 'Non-EU destinations'],
    sources: [
      { label: 'Shipment', type: 'Shipment' },
      { label: 'Finance/OM', type: 'OM' },
    ],
    problematicFields: ['Declared value', 'Customer shipping price'],
  },
  {
    id: 'mailog-il-us',
    name: 'Manifest Mailog IL→US',
    category: 'Shipping',
    description:
      'Mailog carrier manifest for IL to US — consignment record with sender details, weight, and ID',
    autoConditions: ['Mailog carrier', 'IL → US only'],
    sources: [
      { label: 'Shipment', type: 'Shipment' },
      { label: 'Mailog API', type: 'External' },
    ],
    problematicFields: ['HS Code'],
  },
  {
    id: 'multiple-shipment-items',
    name: 'Multiple Shipment Items',
    category: 'Shipping',
    description:
      'Consolidated shipment invoice — item-level detail across shipments in one batch for multi-shipment customs and invoicing',
    autoConditions: ['Consolidated shipments only'],
    sources: [{ label: 'Shipment', type: 'Shipment' }],
    problematicFields: ['HS Code', 'Declared value'],
  },
  {
    id: 'usps-item-detail',
    name: 'USPS Item Detail',
    category: 'Shipping',
    description:
      'USPS customs & compliance — item-level declared values, weights, VAT, discounts, refunds, and country of manufacture',
    autoConditions: ['USPS carrier only'],
    sources: [
      { label: 'Shipment', type: 'Shipment' },
      { label: 'OM', type: 'OM' },
    ],
    problematicFields: ['HS Code', 'Declared value', 'Item material'],
  },
  {
    id: 'hungary-eu',
    name: 'Hungary Orders — EU',
    category: 'Finance',
    description:
      'HU EU orders with full VAT breakdown — net/gross/tax per item for IOSS/VAT compliance and financial reporting',
    autoConditions: ['Hungary origin', 'EU destinations'],
    sources: [
      { label: 'Shipment', type: 'Shipment' },
      { label: 'OCS/Tax config', type: 'OCS' },
      { label: 'OM', type: 'OM' },
    ],
    problematicFields: ['Customer shipping price'],
  },
  {
    id: 'vat-eu-order',
    name: 'VAT EU Order',
    category: 'Finance',
    description:
      'EU VAT compliance & finance reconciliation — order-level tax, shipping cost, discounts, and payment type for VAT filing',
    autoConditions: ['EU destinations'],
    sources: [
      { label: 'Shipment', type: 'Shipment' },
      { label: 'OCS/Tax config', type: 'OCS' },
      { label: 'OM', type: 'OM' },
    ],
    problematicFields: ['Customer shipping price'],
  },
];

export const REPORT_CATEGORIES: ReportCategory[] = ['Shipping', 'Finance'];

/** MUI sx color pairs for source chips, keyed by source type. */
export const SOURCE_CHIP_COLORS: Record<ReportSourceType, { bg: string; color: string }> = {
  Shipment: { bg: '#e3f2fd', color: '#0d47a1' }, // blue
  OCS: { bg: '#e8f5e9', color: '#1b5e20' }, // green
  OM: { bg: '#fff8e1', color: '#ef6c00' }, // amber
  External: { bg: '#f5f5f5', color: '#616161' }, // gray
};

export function getReportById(id: string): ReportConfig | undefined {
  return REPORTS.find((r) => r.id === id);
}

// ---------------------------------------------------------------------------
// Per-report column definitions. The generated table (and CSV) render only the
// columns for the selected report, in this order, using `label` as the header.
// ---------------------------------------------------------------------------

export type ColumnSource =
  | 'SHIPMENT'
  | 'FULFILLMENT'
  | 'CATALOG'
  | 'DERIVED'
  | 'FX'
  | 'OCS'
  | 'UNKNOWN'
  | 'STATIC';

export interface ColumnDef {
  key: string;
  label: string;
  source: ColumnSource;
  fieldPath?: string;
  notes?: string;
}

/** Column definitions keyed by report id (see REPORTS above). */
export const REPORT_COLUMNS: Record<string, ColumnDef[]> = {
  aftership: [
    { key: 'webSite', label: 'Website', source: 'SHIPMENT', fieldPath: 'order_site_id' },
    { key: 'courier', label: 'Courier', source: 'SHIPMENT', fieldPath: 'shipping_carrier_id', notes: 'carrier_id → carrier service type name e.g. FedexHU' },
    { key: 'trackingNumber', label: 'tracking_number', source: 'SHIPMENT', fieldPath: 'tracking_id' },
    { key: 'customerEmail', label: 'CustomerEmail', source: 'FULFILLMENT', fieldPath: 'customer_email' },
    { key: 'customerPhone', label: 'CustomerPhone', source: 'FULFILLMENT', fieldPath: 'customer_phone' },
    { key: 'orderId', label: 'Order ID', source: 'SHIPMENT', fieldPath: 'order_id', notes: 'om_id' },
    { key: 'orderPath', label: 'Order_path', source: 'STATIC', notes: 'leave empty' },
    { key: 'customerName', label: 'Customer Name', source: 'SHIPMENT', fieldPath: 'customer_name', notes: 'shipping_address.customer_name' },
    { key: 'originCountry', label: 'origin_country', source: 'SHIPMENT', notes: 'facility_id → facility config country_of_origin_code' },
    { key: 'destinationCountry', label: 'destination_country', source: 'SHIPMENT', fieldPath: 'customer_country' },
    { key: 'custom1', label: 'custom_1', source: 'UNKNOWN', fieldPath: 'TABLE_ORDER_EXTENSIONS.EstimatedDeliveryDate', notes: 'OM field' },
    { key: 'custom2', label: 'custom_2', source: 'UNKNOWN', fieldPath: 'TABLE_ORDER_EXTENSIONS.RealShippingTimeFrame', notes: 'OM field, value + 1' },
    { key: 'trackingPostalCode', label: 'tracking_postal_code', source: 'SHIPMENT', fieldPath: 'customer_zip' },
    { key: 'trackingShipDate', label: 'tracking_ship_date', source: 'SHIPMENT', notes: 'timestamp: when status changed to shipped' },
    { key: 'trackingAccountNumber', label: 'tracking_account_number', source: 'STATIC', notes: 'leave empty' },
    { key: 'trackingKey', label: 'tracking_key', source: 'STATIC', notes: 'leave empty' },
    { key: 'trackingDestCountry', label: 'tracking_destination_country', source: 'SHIPMENT', fieldPath: 'customer_country' },
    { key: 'orderDate', label: 'order_date', source: 'FULFILLMENT', fieldPath: 'created_date' },
    { key: 'orderNumber', label: 'order_number', source: 'SHIPMENT', fieldPath: 'order_id' },
    { key: 'language', label: 'language', source: 'STATIC', notes: 'leave empty' },
    { key: 'siteName', label: 'Site Name', source: 'STATIC', notes: 'leave empty' },
    { key: 'eventId', label: 'Event ID', source: 'FULFILLMENT', fieldPath: 'product_items.event_level' },
    { key: 'isMerukz', label: 'Shipping Type', source: 'SHIPMENT', fieldPath: 'consolidation_type', notes: 'Show "Bulk" or "Merukzaim" from consolidation_type ID; null → FALSE' },
    { key: 'state', label: 'State', source: 'SHIPMENT', fieldPath: 'customer_state' },
  ],

  'cs-eta': [
    { key: 'webSite', label: 'Website', source: 'SHIPMENT', fieldPath: 'order_site_id' },
    { key: 'id', label: 'ID', source: 'SHIPMENT', fieldPath: 'order_id' },
    { key: 'orderDate', label: 'Order Date', source: 'FULFILLMENT', fieldPath: 'created_date' },
    { key: 'eta', label: 'ETA', source: 'SHIPMENT', fieldPath: 'fulfillment.estimed_delivery_date' },
    { key: 'etaFromShipping', label: 'ETA based on shipping', source: 'SHIPMENT', fieldPath: 'estimated_delivery_date', notes: 'calculated in the shipment service' },
    { key: 'pickupDate', label: 'Pickup date', source: 'SHIPMENT', notes: 'timestamp: when status changed to packed' },
    { key: 'shippingDate', label: 'Shipping Date', source: 'SHIPMENT', notes: 'timestamp: when status changed to shipped' },
    { key: 'shippingCost', label: 'ShippingCost', source: 'SHIPMENT', fieldPath: 'price', notes: 'order_shipment_price_amount introduced in upgrade/downgrade task' },
    { key: 'shippingNumber', label: 'ShippingNumber', source: 'SHIPMENT', fieldPath: 'tracking_id' },
    { key: 'totalOrderCost', label: 'Total Order Cost', source: 'FULFILLMENT', fieldPath: 'total', notes: 'before discounts' },
    { key: 'firstName', label: 'Name', source: 'FULFILLMENT', fieldPath: 'customer_firstname' },
    { key: 'lastName', label: 'Last name', source: 'FULFILLMENT', fieldPath: 'customer_lastname' },
    { key: 'email', label: 'Email', source: 'FULFILLMENT', fieldPath: 'customer_email' },
    { key: 'shippingName', label: 'Shipping Name', source: 'SHIPMENT', notes: 'carrier_id → carrier service type name' },
    { key: 'shippingCountry', label: 'ShippingCountry', source: 'SHIPMENT', fieldPath: 'customer_country' },
    { key: 'shippingCity', label: 'Shipping City', source: 'SHIPMENT', fieldPath: 'customer_city' },
    { key: 'shippingZip', label: 'Shipping ZipCode', source: 'SHIPMENT', fieldPath: 'customer_zip' },
    { key: 'trackingNumber', label: 'Tracking Number', source: 'SHIPMENT', fieldPath: 'tracking_id' },
    { key: 'shippingRemarks', label: 'ShippingRemarks', source: 'SHIPMENT', notes: 'notes added to shipment including timestamp and username' },
    { key: 'upgradedBy', label: 'Upgraded by', source: 'SHIPMENT', fieldPath: 'is_upgrade,upgrade_reason', notes: 'auto rule name if shipment service; can also be CSR via OCS' },
    { key: 'proactive', label: 'Proactive', source: 'OCS' },
    { key: 'proactiveRemarks', label: 'ProactiveRemarks', source: 'OCS' },
    { key: 'lateSupplier', label: 'LateSupplier', source: 'OCS' },
    { key: 'reorderDate', label: 'Reorder Date', source: 'OCS' },
    { key: 'orderStatus', label: 'Order Status', source: 'OCS' },
    { key: 'lost', label: 'Lost', source: 'OCS' },
    { key: 'late', label: 'Late', source: 'OCS' },
    { key: 'holdOrder', label: 'HoldOrder', source: 'OCS', notes: 'not on-hold/pending packing; source is OCS' },
    { key: 'holdPacking', label: 'HoldPacking', source: 'OCS' },
    { key: 'mightCancel', label: 'MightCancel', source: 'OCS' },
    { key: 'claim', label: 'Claim', source: 'OCS' },
    { key: 'fraudSuspicion', label: 'FraudSuspicion', source: 'OCS' },
    { key: 'returnPackage', label: 'ReturnPackage', source: 'OCS' },
    { key: 'ourRemarks', label: 'OurRemarks', source: 'OCS' },
  ],

  'fedex-hu-customs': [
    { key: 'webSite', label: 'Website', source: 'SHIPMENT', fieldPath: 'order_site_id' },
    { key: 'shippingDate', label: 'Shipping Date', source: 'SHIPMENT', notes: 'timestamp: when status changed to shipped' },
    { key: 'shippingCountry', label: 'Shipping Country', source: 'SHIPMENT', fieldPath: 'customer_country' },
    { key: 'recipientCountry', label: 'Recipient Country', source: 'SHIPMENT', fieldPath: 'customer_country' },
    { key: 'shippingName', label: 'Shipping Name', source: 'SHIPMENT', notes: 'carrier_id → carrier service type name' },
    { key: 'orderId', label: 'Order ID', source: 'SHIPMENT', fieldPath: 'order_id' },
    { key: 'trackingId', label: 'Tracking ID', source: 'SHIPMENT', fieldPath: 'tracking_id' },
    { key: 'itemSku', label: 'Item SKU', source: 'FULFILLMENT', fieldPath: 'product_item.sku' },
    { key: 'hsCode', label: 'HS Code', source: 'CATALOG', notes: 'HS code by SKU; persist to shipment payload at document generation if missing' },
    { key: 'quantity', label: 'Quantity', source: 'DERIVED', fieldPath: 'count(product_items by sku)', notes: 'payload has 1 row per unit, no qty field' },
    { key: 'value', label: 'Value', source: 'SHIPMENT', notes: 'declared item value: dim cost for US; item price after discount before tax for others' },
  ],

  'hungary-non-eu': [
    { key: 'webSite', label: 'Website', source: 'SHIPMENT', fieldPath: 'order_site_id' },
    { key: 'customerName', label: 'Customer Name', source: 'SHIPMENT', fieldPath: 'customer_name' },
    { key: 'shippingAddress', label: 'Shipping address', source: 'SHIPMENT', fieldPath: 'customer_street1' },
    { key: 'shippingCity', label: 'Shipping City', source: 'SHIPMENT', fieldPath: 'customer_city' },
    { key: 'shippingState', label: 'Shipping State', source: 'SHIPMENT', fieldPath: 'customer_state' },
    { key: 'shippingZip', label: 'Shipping ZipCode', source: 'SHIPMENT', fieldPath: 'customer_zip' },
    { key: 'shippingCountry', label: 'Shipping Country', source: 'SHIPMENT', fieldPath: 'customer_country' },
    { key: 'originalShippingMethod', label: 'Original Shipping Method', source: 'SHIPMENT', fieldPath: 'cart_carrier_service_type', notes: 'route id → carrier service name; cart_carrier_service_type from upgrade/downgrade task' },
    { key: 'sku', label: 'SKU', source: 'FULFILLMENT', fieldPath: 'product_items.sku' },
    { key: 'itemName', label: 'Item Name', source: 'FULFILLMENT', fieldPath: 'product_items.name' },
    { key: 'quantity', label: 'Quantity', source: 'DERIVED', fieldPath: 'count(product_items by sku)' },
    { key: 'shippingDate', label: 'Shipping Date', source: 'SHIPMENT', notes: 'timestamp: when status changed to shipped' },
    { key: 'orderId', label: 'OrderId', source: 'SHIPMENT', fieldPath: 'order_id' },
    { key: 'totalCost', label: 'Total Cost', source: 'FULFILLMENT', fieldPath: 'total' },
    { key: 'totalCostIls', label: 'Total Cost(ILS)', source: 'FX', notes: 'use existing exchange rate function in back office' },
    { key: 'currency', label: 'Currency', source: 'FULFILLMENT', fieldPath: 'currency_symbol' },
    { key: 'transactionId', label: 'Transaction ID', source: 'UNKNOWN', notes: 'payment gateway reference — source TBD' },
    { key: 'paymentType', label: 'PaymentType', source: 'UNKNOWN', notes: 'payment gateway — source TBD' },
    { key: 'shippingName', label: 'ShippingName', source: 'SHIPMENT', notes: 'carrier_id → carrier service type name' },
  ],

  'hungary-eu': [
    { key: 'webSite', label: 'Website', source: 'SHIPMENT', fieldPath: 'order_site_id' },
    { key: 'customerName', label: 'Customer Name', source: 'SHIPMENT', fieldPath: 'customer_name' },
    { key: 'shippingAddress', label: 'Shipping address', source: 'SHIPMENT', fieldPath: 'customer_street1' },
    { key: 'shippingCity', label: 'Shipping City', source: 'SHIPMENT', fieldPath: 'customer_city' },
    { key: 'shippingState', label: 'Shipping State', source: 'SHIPMENT', fieldPath: 'customer_state' },
    { key: 'shippingZip', label: 'Shipping ZipCode', source: 'SHIPMENT', fieldPath: 'customer_zip' },
    { key: 'shippingCountry', label: 'Shipping Country', source: 'SHIPMENT', fieldPath: 'customer_country' },
    { key: 'originalShippingMethod', label: 'Original Shipping Method', source: 'SHIPMENT', fieldPath: 'cart_carrier_service_type' },
    { key: 'sku', label: 'SKU', source: 'FULFILLMENT', fieldPath: 'product_items.sku' },
    { key: 'itemName', label: 'Item Name', source: 'FULFILLMENT', fieldPath: 'product_items.name' },
    { key: 'quantity', label: 'Quantity', source: 'DERIVED', fieldPath: 'count(product_items by sku)' },
    { key: 'shippingDate', label: 'Shipping Date', source: 'SHIPMENT', notes: 'timestamp: when status changed to shipped' },
    { key: 'orderId', label: 'OrderID', source: 'SHIPMENT', fieldPath: 'order_id' },
    { key: 'netAmount', label: 'Net Amount', source: 'DERIVED', fieldPath: 'product_item.total - product_item.tax' },
    { key: 'grossAmount', label: 'Gross Amount', source: 'FULFILLMENT', fieldPath: 'total', notes: 'price + tax' },
    { key: 'taxAmount', label: 'TaxAmount', source: 'FULFILLMENT', fieldPath: 'tax' },
    { key: 'taxRate', label: 'TaxRate', source: 'FULFILLMENT', fieldPath: 'tax_rate', notes: 'driven by TAX_CFG region / IOSS' },
    { key: 'currency', label: 'Currency', source: 'FULFILLMENT', fieldPath: 'currency_symbol' },
    { key: 'transactionId', label: 'Transaction ID', source: 'UNKNOWN', notes: 'payment gateway reference — source TBD' },
    { key: 'paymentType', label: 'PaymentType', source: 'UNKNOWN', notes: 'payment gateway — source TBD' },
    { key: 'shippingName', label: 'ShippingName', source: 'SHIPMENT', notes: 'carrier_id → carrier service type name' },
    { key: 'netAmountIls', label: 'Net Amount(ILS)', source: 'FX', notes: 'net × FX rate' },
    { key: 'grossAmountIls', label: 'Gross Amount(ILS)', source: 'FX', notes: 'gross × FX rate' },
    { key: 'taxAmountIls', label: 'TaxAmount(ILS)', source: 'FX', notes: 'tax × FX rate' },
    { key: 'reordered', label: 'Reorded?', source: 'OCS', notes: 'reorder flag' },
  ],

  'mailog-il-us': [
    { key: 'webSite', label: 'Website', source: 'SHIPMENT', fieldPath: 'order_site_id' },
    { key: 'orderNo', label: 'Order No', source: 'SHIPMENT', fieldPath: 'order_id' },
    { key: 'name', label: 'Name', source: 'SHIPMENT', fieldPath: 'customer_name' },
    { key: 'address1', label: 'Address 1', source: 'SHIPMENT', fieldPath: 'customer_street1' },
    { key: 'address2', label: 'Address 2', source: 'SHIPMENT', fieldPath: 'customer_street2' },
    { key: 'city', label: 'Address 3 (City)', source: 'SHIPMENT', fieldPath: 'customer_city' },
    { key: 'state', label: 'Address 4 State', source: 'SHIPMENT', fieldPath: 'customer_state' },
    { key: 'zip', label: 'Post Code / Zip', source: 'SHIPMENT', fieldPath: 'customer_zip' },
    { key: 'countryCode', label: 'Country Code', source: 'SHIPMENT', fieldPath: 'customer_country_code' },
    { key: 'parcelCount', label: 'Parcel Count', source: 'STATIC', notes: 'always 1' },
    { key: 'weight', label: 'Consignment Weight (kg)', source: 'STATIC', notes: 'always 0.05' },
    { key: 'productDesc', label: 'Product Description', source: 'STATIC', notes: 'always "fashion accessories"' },
    { key: 'unitValue', label: 'Product Unit Value', source: 'FULFILLMENT', fieldPath: 'product_items.price' },
    { key: 'countryOfOrigin', label: 'County of Origin', source: 'SHIPMENT', notes: 'facility_id → country_of_origin_code; overridden per SKU from catalog' },
    { key: 'htsCode', label: 'HTS Code', source: 'CATALOG', notes: 'HS code by SKU; persist to payload at document generation' },
    { key: 'barcode', label: 'First Mile Carrier Barcode', source: 'SHIPMENT', fieldPath: 'order_id' },
    { key: 'senderName', label: "Sender's Name", source: 'STATIC', notes: 'leave empty' },
    { key: 'senderAddr1', label: "Sender's Address Line 1", source: 'STATIC', notes: 'leave empty' },
    { key: 'senderAddr2', label: "Sender's Address Line 2", source: 'STATIC', notes: 'leave empty' },
    { key: 'senderAddr3', label: "Sender's Address Line 3", source: 'STATIC', notes: 'leave empty' },
    { key: 'senderAddr4', label: "Sender's Address Line 4", source: 'STATIC', notes: 'leave empty' },
    { key: 'senderPostcode', label: "Sender's Postcode", source: 'STATIC', notes: 'leave empty' },
    { key: 'senderCountry', label: "Sender's Country Code", source: 'SHIPMENT', notes: 'facility_id → facility config country' },
    { key: 'containerId', label: 'Container ID', source: 'SHIPMENT', notes: 'merukazim/bulk shipment ID; collection_id for individual shipment' },
  ],

  'multiple-shipment-items': [
    { key: 'webSite', label: 'Website', source: 'SHIPMENT', fieldPath: 'order_site_id' },
    { key: 'id', label: 'id', source: 'SHIPMENT', fieldPath: 'order_id' },
    { key: 'customerName', label: 'Customer name', source: 'SHIPMENT', fieldPath: 'customer_name' },
    { key: 'address1', label: 'Customer address 1', source: 'SHIPMENT', fieldPath: 'customer_street1' },
    { key: 'city', label: 'Customer city', source: 'SHIPMENT', fieldPath: 'customer_city' },
    { key: 'state', label: 'Customer state', source: 'SHIPMENT', fieldPath: 'customer_state_code' },
    { key: 'zip', label: 'Customer zip code', source: 'SHIPMENT', fieldPath: 'customer_zip' },
    { key: 'country', label: 'Customer country', source: 'SHIPMENT', fieldPath: 'customer_country' },
    { key: 'productCode', label: 'Product Code', source: 'FULFILLMENT', fieldPath: 'product_items.sku' },
    { key: 'htsCode', label: 'HTS Code', source: 'CATALOG', notes: 'HS code by SKU; persist to payload at document generation' },
    { key: 'partDesc', label: 'Part Description', source: 'CATALOG', notes: 'customs description; fallback to product_item.name' },
    { key: 'material', label: 'Material', source: 'CATALOG', notes: 'by SKU — often missing, see SHP-668' },
    { key: 'quantity', label: 'Quantity', source: 'FULFILLMENT', fieldPath: 'count(product_items by sku)' },
    { key: 'volume', label: 'Volume', source: 'DERIVED', notes: 'same value as Quantity' },
    { key: 'unitPrice', label: 'Unit Price', source: 'FULFILLMENT', fieldPath: 'product_items.price' },
    { key: 'totalPrice', label: 'Total Price', source: 'FULFILLMENT', fieldPath: 'product_items.total' },
    { key: 'invoiceNumber', label: 'Invoice #', source: 'UNKNOWN', notes: 'financial invoice number — source FS/OCS unclear, confirm with team' },
    { key: 'shippingNumber', label: 'ShippingNumber', source: 'SHIPMENT', fieldPath: 'tracking_id' },
    { key: 'shippingDate', label: 'Shipping-Date', source: 'SHIPMENT', notes: 'timestamp: when status changed to shipped' },
  ],

  'usps-item-detail': [
    { key: 'webSite', label: 'Website', source: 'SHIPMENT', fieldPath: 'order_site_id' },
    { key: 'date', label: 'Date', source: 'STATIC' },
    { key: 'time', label: 'Time', source: 'STATIC' },
    { key: 'orderDate', label: 'Order Date', source: 'FULFILLMENT', fieldPath: 'created_date' },
    { key: 'shippingDate', label: 'Shipping Date', source: 'SHIPMENT', notes: 'timestamp: when status changed to shipped' },
    { key: 'shippingNumber', label: 'ShippingNumber', source: 'SHIPMENT', fieldPath: 'tracking_id' },
    { key: 'shippingName', label: 'ShippingName', source: 'SHIPMENT', notes: 'carrier_id → carrier service type name' },
    { key: 'eventLevel', label: 'EventLevel', source: 'FULFILLMENT', fieldPath: 'shipping_item.event_level' },
    { key: 'orderNumber', label: 'Order number', source: 'SHIPMENT', fieldPath: 'order_id' },
    { key: 'productDesc', label: 'Product Description', source: 'STATIC', notes: 'always "fashion jewelry"; customs description by SKU' },
    { key: 'customerName', label: 'Customer Name', source: 'SHIPMENT', fieldPath: 'customer_name' },
    { key: 'customerAddress1', label: 'Customer Address 1', source: 'SHIPMENT', fieldPath: 'customer_street1' },
    { key: 'customerCity', label: 'Customer City', source: 'SHIPMENT', fieldPath: 'customer_city' },
    { key: 'customerState', label: 'Customer State', source: 'SHIPMENT', fieldPath: 'customer_state' },
    { key: 'customerZip', label: 'Customer zip Code', source: 'SHIPMENT', fieldPath: 'customer_zip' },
    { key: 'customerCountry', label: 'Customer Country', source: 'SHIPMENT', fieldPath: 'customer_country' },
    { key: 'customerEmail', label: 'Customer email', source: 'FULFILLMENT', fieldPath: 'customer_email' },
    { key: 'customerPhone', label: 'Customer phone', source: 'SHIPMENT', fieldPath: 'customer_phone', notes: 'fallback: fulfillment.customer_phone' },
    { key: 'valueOfOrder', label: 'Value of order', source: 'FULFILLMENT', fieldPath: 'total' },
    { key: 'quantity', label: 'Quantity', source: 'DERIVED', fieldPath: 'count(product_items by sku)' },
    { key: 'weight', label: 'weight', source: 'STATIC', notes: 'always 0.05' },
    { key: 'countryOfMfg', label: 'Country of Manufacture', source: 'SHIPMENT', notes: 'facility_id → country_of_origin_code' },
    { key: 'currency', label: 'Currency', source: 'FULFILLMENT', fieldPath: 'currency_symbol' },
    { key: 'conversionRate', label: 'ConversionRate', source: 'FX', notes: 'FX rate at ship/customs time' },
    { key: 'realValue', label: 'RealValue', source: 'DERIVED', notes: 'value × ConversionRate' },
    { key: 'discount', label: 'Discount', source: 'FULFILLMENT', fieldPath: 'product_items.discount' },
    { key: 'declaredValue', label: 'DeclaredValue', source: 'SHIPMENT', notes: 'declared value: dim cost (US) or item price after discount before tax' },
    { key: 'vat', label: 'VAT', source: 'FULFILLMENT', fieldPath: 'tax' },
    { key: 'invoice', label: 'invoice', source: 'SHIPMENT', fieldPath: 'shipping_invoice_reference', notes: 'fallback: OCS invoice no.' },
    { key: 'isoCountry', label: 'ISO country', source: 'SHIPMENT', fieldPath: 'customer_country_code' },
    { key: 'productsPrice', label: 'Products Price', source: 'FULFILLMENT', fieldPath: 'product_items.total', notes: 'original price before discount, including taxes' },
    { key: 'reorder', label: 'Reorder', source: 'OCS' },
    { key: 'reorderReason', label: 'Reorder Reason', source: 'OCS' },
    { key: 'refundAmount', label: 'Refund Amount', source: 'OCS' },
    { key: 'refundReason', label: 'Refund Reason', source: 'OCS' },
    { key: 'compensation', label: 'Compensation', source: 'OCS' },
    { key: 'eta', label: 'ETA', source: 'OCS' },
    { key: 'proactiveRemarks', label: 'Proactive Remarks', source: 'OCS' },
  ],

  'vat-eu-order': [
    { key: 'webSite', label: 'Website', source: 'SHIPMENT', fieldPath: 'order_site_id' },
    { key: 'orderNumber', label: 'Order Number', source: 'SHIPMENT', fieldPath: 'order_id' },
    { key: 'customerCountry', label: 'Customer Country', source: 'SHIPMENT', fieldPath: 'customer_country' },
    { key: 'reorder', label: 'Reorder', source: 'OCS' },
    { key: 'reorderReason', label: 'Reorder Reason', source: 'OCS' },
    { key: 'refundAmount', label: 'Refund Amount', source: 'OCS' },
    { key: 'refundReason', label: 'Refund Reason', source: 'OCS' },
    { key: 'compensation', label: 'Compensation', source: 'OCS' },
    { key: 'firstShippingDate', label: 'First Shipping Date', source: 'SHIPMENT', notes: 'timestamp: when status changed to shipped' },
    { key: 'orderDate', label: 'Order Date', source: 'FULFILLMENT', fieldPath: 'created_date' },
    { key: 'shippingNumber', label: 'ShippingNumber', source: 'SHIPMENT', fieldPath: 'tracking_id' },
    { key: 'firstShippingName', label: 'First Shipping Name', source: 'SHIPMENT', fieldPath: 'cart_carrier_service_type', notes: 'route id → carrier service name' },
    { key: 'productsPrice', label: 'Products Price', source: 'FULFILLMENT', fieldPath: 'product_items.price' },
    { key: 'currency', label: 'Currency', source: 'FULFILLMENT', fieldPath: 'currency_symbol' },
    { key: 'omShippingName', label: 'OM Shipping Name', source: 'SHIPMENT', fieldPath: 'shipping_carrier_id', notes: 'carrier_id → carrier service type name' },
    { key: 'shippingCost', label: 'ShippingCost', source: 'SHIPMENT', fieldPath: 'total', notes: 'order_shipment_price_amount from upgrade/downgrade task' },
    { key: 'couponDiscount', label: 'Coupon Discount', source: 'OCS' },
    { key: 'tax', label: 'Tax', source: 'FULFILLMENT', fieldPath: 'tax', notes: '+ tax_rate; driven by TAX_CFG' },
    { key: 'orderCost', label: 'Order Cost', source: 'FULFILLMENT', fieldPath: 'total' },
    { key: 'paymentType', label: 'PaymentType', source: 'UNKNOWN', notes: 'payment gateway — source TBD' },
  ],
};

export function getReportColumns(reportId: string): ColumnDef[] {
  return REPORT_COLUMNS[reportId] ?? [];
}
