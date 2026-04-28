export type PackingInstructionDisplayLevel = 'Item' | 'Shipment';

export type PackingInstructionStatus = 'Live' | 'Draft';

export type PackingInstructionScopeTab = 'All' | 'Live' | 'Draft' | 'Item' | 'Shipment';

export interface PackingInstructionRow {
  id: string;
  instructionName: string;
  displayLevel: PackingInstructionDisplayLevel;
  /** ISO yyyy-mm-dd */
  startDate: string;
  /** ISO yyyy-mm-dd; empty when none */
  endDate: string;
  status: PackingInstructionStatus;
  /** Serialized rule conditions for display / edit */
  activationLogic: string;
  contentEn: string;
  contentHe: string;
  contentAr: string;
  contentHu: string;
  contentTh: string;
  imageDataUrl?: string;
}
