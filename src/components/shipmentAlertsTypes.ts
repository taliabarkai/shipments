/**
 * none = the "Add Release condition" checkbox is unchecked (nothing configured);
 * status = released on reaching a status; stuck = released after dwelling in a status.
 * All three render as plain text, from `releaseLogicLabel`, in table cells and exports.
 */
export type ShipmentAlertReleaseLogic =
  | { kind: 'none' }
  | { kind: 'status'; value: string }
  | {
      kind: 'stuck';
      value: string;
      durationValue: number;
      durationUnit: ShipmentAlertDurationUnit;
    };

export type ShipmentAlertDurationUnit = 'hours' | 'days';

export type ShipmentAlertStatus = 'Draft' | 'Live';

export interface ShipmentAlertRow {
  id: string;
  alertName: string;
  activationLogic: string;
  releaseLogic: ShipmentAlertReleaseLogic;
  status: ShipmentAlertStatus;
  lastUpdated: string;
  /** Optional scheduling from configuration drawer (create/edit). */
  startDay?: string;
  endDay?: string;
}

/** Compact threshold for table cells: 4 hours -> "4h+", 3 days -> "3d+". */
export function formatAlertDurationThreshold(
  value: number,
  unit: ShipmentAlertDurationUnit,
): string {
  return `${value}${unit === 'hours' ? 'h' : 'd'}+`;
}

/** Shown in the table when no release condition is configured. */
export const RELEASE_LOGIC_EMPTY_CELL = '-';

/**
 * Descriptive label, used for the column filter options and the CSV export where there is
 * no column header for context. The table cell uses `releaseLogicCellText` instead.
 */
export function releaseLogicLabel(logic: ShipmentAlertReleaseLogic): string {
  if (logic.kind === 'none') return 'No release condition';
  // A configured trigger always carries a status (the form requires one before saving);
  // this guard keeps a malformed record from rendering the word "undefined" in the table.
  const status = (logic.value ?? '').trim();
  if (!status) return 'No release condition';
  if (logic.kind === 'stuck') {
    const threshold = formatAlertDurationThreshold(logic.durationValue, logic.durationUnit);
    return `Stuck in status — ${status}, ${threshold}`;
  }
  return `Reaches status — ${status}`;
}

/** Table-cell text: a dash for the unconfigured state, otherwise the descriptive label. */
export function releaseLogicCellText(logic: ShipmentAlertReleaseLogic): string {
  const label = releaseLogicLabel(logic);
  return label === 'No release condition' ? RELEASE_LOGIC_EMPTY_CELL : label;
}

export function releaseLogicFilterValue(logic: ShipmentAlertReleaseLogic): string {
  return releaseLogicLabel(logic);
}

export function releaseLogicCsvValue(logic: ShipmentAlertReleaseLogic): string {
  return releaseLogicLabel(logic);
}
