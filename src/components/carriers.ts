/**
 * Canonical list of carrier companies. Used by:
 * - The "Filter by Carrier" multi-select on the Shipments screen.
 * - The Carrier Company dropdown / filter on Carrier Service Types.
 *
 * Keep this as the single source of truth so the same checkbox list renders
 * identically wherever a "Carrier" filter or selector is needed.
 */
export interface CarrierCompany {
  number: number;
  name: string;
}

export const CARRIER_COMPANIES: CarrierCompany[] = [
  { number: 1, name: 'USPS' },
  { number: 2, name: 'UPS' },
  { number: 3, name: 'FedEx' },
  { number: 4, name: 'DHL' },
  { number: 5, name: 'Bpost' },
  { number: 6, name: 'Canada Post' },
  { number: 7, name: 'Royal Mail' },
  { number: 8, name: 'Hermes' },
  { number: 9, name: 'Israel Post' },
  { number: 10, name: 'MailLog' },
  { number: 11, name: 'ShineOn' },
  { number: 12, name: 'Landmark' },
  { number: 13, name: 'Tapuz' },
  { number: 14, name: 'GlobalPost' },
  { number: 15, name: 'DHL EU' },
  { number: 16, name: 'DHL TH' },
  { number: 17, name: 'Global Post HU' },
  { number: 18, name: 'LaserShip' },
  { number: 19, name: 'OnTrac' },
  { number: 20, name: 'Korea Post' },
  { number: 21, name: 'India Post' },
  { number: 22, name: 'Purolator' },
  { number: 23, name: 'Global Post TH' },
  { number: 24, name: 'Purolator Express' },
];

export const CARRIER_COMPANY_NAMES = CARRIER_COMPANIES.map((c) => c.name);

export function findCarrierByNumber(num: number): CarrierCompany | undefined {
  return CARRIER_COMPANIES.find((c) => c.number === num);
}

export function findCarrierByName(name: string): CarrierCompany | undefined {
  return CARRIER_COMPANIES.find((c) => c.name === name);
}

export function formatCarrierOption(c: CarrierCompany): string {
  return `${c.number} – ${c.name}`;
}
