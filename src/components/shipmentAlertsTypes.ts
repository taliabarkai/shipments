/**
 * Manual = no release condition configured (the "Add release condition" checkbox is off);
 * status = released on reaching a status; stuck = released after dwelling in a status.
 * All three render as plain text in table cells.
 */
export type ShipmentAlertReleaseLogic =
  | { kind: 'manual' }
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

export function formatAlertDuration(value: number, unit: ShipmentAlertDurationUnit): string {
  const singular = unit === 'hours' ? 'hour' : 'day';
  return `${value} ${value === 1 ? singular : unit}`;
}

function releaseLogicLabel(logic: ShipmentAlertReleaseLogic): string {
  if (logic.kind === 'manual') return 'Manual';
  if (logic.kind === 'stuck') {
    return `Stuck — ${logic.value} > ${formatAlertDuration(logic.durationValue, logic.durationUnit)}`;
  }
  return `Status — ${logic.value}`;
}

export function releaseLogicFilterValue(logic: ShipmentAlertReleaseLogic): string {
  return releaseLogicLabel(logic);
}

export function releaseLogicCsvValue(logic: ShipmentAlertReleaseLogic): string {
  return releaseLogicLabel(logic);
}
