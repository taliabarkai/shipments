import { useMemo } from 'react';
import type { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import { ShipmentHistoryPanel, buildConsolidatedShipmentHistory } from './ShipmentHistorySection';

export type { ShipmentHistoryEntry } from './ShipmentHistorySection';

export default function ConsolidatedShipmentHistorySection({ shipment }: { shipment: ConsolidatedShipment }) {
  const entries = useMemo(() => buildConsolidatedShipmentHistory(shipment), [shipment]);
  return (
    <ShipmentHistoryPanel
      sectionHeadingId="consolidated-drawer-history-heading"
      logDescription={`Consolidation ID: ${shipment.id}`}
      entries={entries}
    />
  );
}
