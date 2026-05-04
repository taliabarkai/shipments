export type AlertFilterId = 'not_packed_24h' | 'draft_12h' | 'packed_12h';

export const ALERT_FILTER_OPTIONS: { id: AlertFilterId; label: string }[] = [
  { id: 'not_packed_24h', label: 'Not Packed - Over 24 hrs' },
  { id: 'draft_12h', label: 'Draft - Over 12 hrs' },
  { id: 'packed_12h', label: 'Packed - Over 12 hrs' },
];

export function alertLabelForId(id: AlertFilterId): string {
  return ALERT_FILTER_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

export const EMPTY_ALERT_COUNTS: Record<AlertFilterId, number> = {
  not_packed_24h: 0,
  draft_12h: 0,
  packed_12h: 0,
};

export function countRowsPerAlertRule<T>(
  rows: T[],
  applies: (row: T, rule: AlertFilterId) => boolean
): Record<AlertFilterId, number> {
  const counts: Record<AlertFilterId, number> = { ...EMPTY_ALERT_COUNTS };
  for (const row of rows) {
    for (const opt of ALERT_FILTER_OPTIONS) {
      if (applies(row, opt.id)) counts[opt.id] += 1;
    }
  }
  return counts;
}

/** Row matches when `shipmentAlerts` includes the rule (mock / API-driven). */
export function shipmentAppliesAlert(
  row: { shipmentAlerts?: AlertFilterId[] },
  rule: AlertFilterId
): boolean {
  return row.shipmentAlerts?.includes(rule) ?? false;
}

export function getShipmentDisplayAlerts(row: {
  shipmentAlerts?: AlertFilterId[];
}): AlertFilterId[] {
  return row.shipmentAlerts ?? [];
}

export function consolidationAppliesAlert(
  row: { consolidationAlerts?: AlertFilterId[] },
  rule: AlertFilterId
): boolean {
  return row.consolidationAlerts?.includes(rule) ?? false;
}

export function getConsolidationDisplayAlerts(row: {
  consolidationAlerts?: AlertFilterId[];
}): AlertFilterId[] {
  return row.consolidationAlerts ?? [];
}

export function matchesAnyAlertRule<T>(
  row: T,
  applied: AlertFilterId[],
  matcher: (row: T, rule: AlertFilterId) => boolean
): boolean {
  if (applied.length === 0) return true;
  return applied.some((rule) => matcher(row, rule));
}
