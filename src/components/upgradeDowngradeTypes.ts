export type RuleAction = 'upgrade' | 'downgrade';

export type RuleStatus = 'active' | 'scheduled' | 'expired' | 'done' | 'cancelled';

export type UpgradeDowngradeScopeTab = 'All' | RuleStatus;

/** Per-shipment cost formula variants (upgrade / per-shipment only). */
export type PerShipmentFormula = 'vs_original' | 'vs_revenue';

export type CostControl =
  | { mode: 'per_rule'; budgetCap: number }
  | { mode: 'per_shipment'; maxPerShipment: number; formula?: PerShipmentFormula };

/** Single delivery-day condition — exactly one of the two modes is stored. */
export type DeliveryCondition =
  | { mode: 'eta'; etaDays: number }
  | { mode: 'specific_day'; date: string };

export type ActivationFieldId =
  | 'brand'
  | 'destination_country'
  | 'event_level'
  | 'packing_facility'
  | 'skus'
  | 'total_order_value';

export type ActivationOperator = 'in' | 'not_in' | 'gt' | 'lt' | 'eq';

export interface ActivationCondition {
  field: ActivationFieldId;
  operator: ActivationOperator;
  /** Selected lookup values (multi-select) or comma-derived free-text / single number. */
  values: string[];
}

export interface UpgradeDowngradeRule {
  id: string;
  name: string;
  action: RuleAction;
  /** Present only for upgrade rules. */
  costControl?: CostControl;
  /** Accumulated upgrade spend (upgrade rules). */
  spent?: number;
  /** Accumulated savings (downgrade rules). */
  savings?: number;
  timesApplied: number;
  deliveryCondition: DeliveryCondition;
  conditions: ActivationCondition[];
  /** ISO yyyy-mm-dd; empty when none (rule active immediately). */
  startDate: string;
  /** ISO yyyy-mm-dd; empty when none. */
  endDate: string;
  /** Sticky flag persisted on the rule once a user cancels it. */
  manuallyCancelled?: boolean;
}

/**
 * The "current date" used for status derivation and date validation. Uses the real
 * current date so a start date of today reads as Active and only future start dates
 * read as Scheduled.
 */
export const REFERENCE_NOW = new Date();

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function parseIsoDay(iso: string): Date | null {
  if (!iso || !iso.trim()) return null;
  const d = new Date(`${iso.trim()}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Derive a rule's status purely from its dates, budget and cancelled flag. */
export function deriveRuleStatus(rule: UpgradeDowngradeRule, now: Date = REFERENCE_NOW): RuleStatus {
  if (rule.manuallyCancelled) return 'cancelled';

  const today = startOfDay(now);
  const start = parseIsoDay(rule.startDate);
  const end = parseIsoDay(rule.endDate);

  // Future start date → hasn't begun yet.
  if (start && startOfDay(start) > today) return 'scheduled';

  // End date in the past → Expired. Takes precedence over Done: once the window
  // closes the rule is expired regardless of whether the budget cap was reached.
  if (end && startOfDay(end) < today) return 'expired';

  // Budget cap reached while still within the active window (end date in the future) → Done.
  if (
    rule.action === 'upgrade' &&
    rule.costControl?.mode === 'per_rule' &&
    (rule.spent ?? 0) >= rule.costControl.budgetCap
  ) {
    return 'done';
  }

  return 'active';
}

export const STATUS_LABEL: Record<RuleStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  done: 'Done',
  cancelled: 'Cancelled',
};

/** Table-style status badge classes, shared by the list view and the drawer. */
export function statusBadgeClass(status: RuleStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'expired':
      return 'bg-gray-200 text-gray-800';
    case 'done':
      return 'bg-purple-100 text-purple-800';
    case 'cancelled':
      return 'bg-rose-100 text-rose-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
}

export const MOCK_RULES: UpgradeDowngradeRule[] = [
  {
    id: 'rule_1',
    name: 'Standard upgrade — US Rings',
    action: 'upgrade',
    costControl: { mode: 'per_rule', budgetCap: 5000 },
    spent: 1240,
    timesApplied: 87,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    deliveryCondition: { mode: 'eta', etaDays: 5 },
    conditions: [
      { field: 'destination_country', operator: 'in', values: ['US'] },
      { field: 'brand', operator: 'in', values: ['MYKA', 'OAL'] },
    ],
  },
  {
    id: 'rule_2',
    name: 'EU downgrade — economy lane',
    action: 'downgrade',
    savings: 3420,
    timesApplied: 412,
    startDate: '2026-01-15',
    endDate: '2026-12-31',
    deliveryCondition: { mode: 'eta', etaDays: 12 },
    conditions: [
      { field: 'destination_country', operator: 'in', values: ['DE', 'FR', 'UK'] },
      { field: 'total_order_value', operator: 'lt', values: ['150'] },
    ],
  },
  {
    id: 'rule_3',
    name: 'Black Friday — premium upgrade',
    action: 'upgrade',
    costControl: { mode: 'per_rule', budgetCap: 25000 },
    spent: 0,
    timesApplied: 0,
    startDate: '2026-11-20',
    endDate: '2026-12-05',
    deliveryCondition: { mode: 'eta', etaDays: 3 },
    conditions: [{ field: 'brand', operator: 'in', values: ['MYKA', 'TGR', 'LAL'] }],
  },
  {
    id: 'rule_4',
    name: 'Bracelets upgrade — APAC',
    action: 'upgrade',
    costControl: { mode: 'per_rule', budgetCap: 8000 },
    spent: 8000,
    timesApplied: 1043,
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    deliveryCondition: { mode: 'eta', etaDays: 7 },
    conditions: [
      { field: 'destination_country', operator: 'in', values: ['AU', 'JP'] },
      { field: 'packing_facility', operator: 'in', values: ['TH'] },
    ],
  },
  {
    id: 'rule_5',
    name: 'Holiday season — UK express',
    action: 'upgrade',
    costControl: { mode: 'per_shipment', maxPerShipment: 4, formula: 'vs_original' },
    spent: 982,
    timesApplied: 256,
    startDate: '2025-12-01',
    endDate: '2025-12-20',
    deliveryCondition: { mode: 'eta', etaDays: 2 },
    conditions: [{ field: 'destination_country', operator: 'in', values: ['UK'] }],
  },
  {
    id: 'rule_6',
    name: 'Necklaces — slow lane test',
    action: 'downgrade',
    savings: 124,
    timesApplied: 18,
    startDate: '2026-03-10',
    endDate: '2026-05-01',
    manuallyCancelled: true,
    deliveryCondition: { mode: 'specific_day', date: '2026-04-25' },
    conditions: [{ field: 'skus', operator: 'in', values: ['SKU-NECK-88', 'SKU-NECK-91'] }],
  },
  {
    id: 'rule_7',
    name: "Mother's Day — premium rings",
    action: 'upgrade',
    costControl: { mode: 'per_shipment', maxPerShipment: 6, formula: 'vs_revenue' },
    spent: 348,
    timesApplied: 64,
    startDate: '2026-04-20',
    endDate: '2026-05-10',
    deliveryCondition: { mode: 'eta', etaDays: 4 },
    conditions: [
      { field: 'event_level', operator: 'in', values: ['1', '2'] },
      { field: 'total_order_value', operator: 'gt', values: ['300'] },
    ],
  },
  {
    id: 'rule_8',
    name: 'Summer rings — EU upgrade',
    action: 'upgrade',
    costControl: { mode: 'per_rule', budgetCap: 6000 },
    spent: 6000,
    timesApplied: 521,
    startDate: '2026-01-10',
    endDate: '2026-07-15',
    deliveryCondition: { mode: 'eta', etaDays: 5 },
    conditions: [
      { field: 'destination_country', operator: 'in', values: ['DE', 'FR'] },
      { field: 'brand', operator: 'in', values: ['MYKA', 'TGR'] },
    ],
    // status: done (budget cap reached, end date still in the future)
  },
  {
    id: 'rule_9',
    name: 'Charms upgrade — US priority',
    action: 'upgrade',
    costControl: { mode: 'per_rule', budgetCap: 12000 },
    spent: 12000,
    timesApplied: 889,
    startDate: '2026-02-15',
    endDate: '2026-07-31',
    deliveryCondition: { mode: 'eta', etaDays: 3 },
    conditions: [
      { field: 'destination_country', operator: 'in', values: ['US', 'CA'] },
      { field: 'total_order_value', operator: 'gt', values: ['250'] },
    ],
    // status: done (budget cap reached, end date still in the future)
  },
];
