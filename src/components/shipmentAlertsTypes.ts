/** Manual = plain text; status = chip-style value in table cells. */
export type ShipmentAlertReleaseLogic = { kind: 'manual' } | { kind: 'status'; value: string };

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

export function releaseLogicFilterValue(logic: ShipmentAlertReleaseLogic): string {
  return logic.kind === 'manual' ? 'Manual' : logic.value;
}

export function releaseLogicCsvValue(logic: ShipmentAlertReleaseLogic): string {
  return logic.kind === 'manual' ? 'Manual' : `Status: ${logic.value}`;
}
