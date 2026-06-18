import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import type { RouteChangeEvent } from './ShipmentsTable';

/** Fields used for default-shipment mock history (structurally compatible with `Shipment` from `ShipmentsTable`). */
export type ShipmentHistoryShipmentLike = {
  orderId: string;
  trackingId: string;
  carrier: string;
  status: string;
  routeChangeEvent?: RouteChangeEvent;
};

export interface ShipmentHistoryEntry {
  id: string;
  source: string;
  occurredAtLabel: string;
  message: string;
}

const PREVIEW_MAX = 4;

/** Dot center from list container left: card border (1px) + padding (12px) + half dot (4px). */
const TIMELINE_LINE_LEFT = 'calc(1px + 0.75rem + 4px)';

export function buildConsolidatedShipmentHistory(shipment: ConsolidatedShipment): ShipmentHistoryEntry[] {
  const tid = shipment.trackingId.trim() || '41236471846';
  const carrier = shipment.carrier.toUpperCase();
  const cid = shipment.id;

  const entries: ShipmentHistoryEntry[] = [
    {
      id: 'h1',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '1/8/2026 12:00 AM',
      message: 'Status moved to pack',
    },
    {
      id: 'h2',
      source: carrier,
      occurredAtLabel: '1/3/2026 7:06 PM',
      message: `Tracking ID provided ${tid}`,
    },
    {
      id: 'h3',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '2/3/2026 12:49 PM',
      message: 'API initiated',
    },
    {
      id: 'h4',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '12/18/2025 10:15 AM',
      message: `Consolidation ${cid} created`,
    },
    {
      id: 'h5',
      source: carrier,
      occurredAtLabel: '12/12/2025 3:22 PM',
      message: 'Carrier credentials verified',
    },
    {
      id: 'h6',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '12/1/2025 8:40 AM',
      message: 'Packing facility assignment confirmed',
    },
  ];

  if (shipment.status === 'Shipped') {
    entries.unshift({
      id: 'h-shipped',
      source: carrier,
      occurredAtLabel: '1/10/2026 4:15 PM',
      message: 'Shipment handed off to carrier',
    });
  }

  if (shipment.status === 'Cancelled') {
    entries.unshift({
      id: 'h-cancel',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: shipment.cancelledAt ?? '10/19/2023 4:45 PM',
      message: 'Consolidated shipment cancelled',
    });
  }

  return entries;
}

export function buildDefaultShipmentHistory(shipment: ShipmentHistoryShipmentLike): ShipmentHistoryEntry[] {
  const tid = shipment.trackingId.trim() || '41236471846';
  const carrier = shipment.carrier.toUpperCase();
  const oid = shipment.orderId;

  const entries: ShipmentHistoryEntry[] = [
    {
      id: 'h1',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '1/8/2026 12:00 AM',
      message: 'Warehouse scan completed',
    },
    {
      id: 'h2',
      source: carrier,
      occurredAtLabel: '1/3/2026 7:06 PM',
      message: `Tracking ID provided ${tid}`,
    },
    {
      id: 'h3',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '2/3/2026 12:49 PM',
      message: 'API initiated',
    },
    {
      id: 'h4',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '12/18/2025 10:15 AM',
      message: `Shipment record created for ${oid}`,
    },
    {
      id: 'h5',
      source: carrier,
      occurredAtLabel: '12/12/2025 3:22 PM',
      message: 'Carrier account linked',
    },
    {
      id: 'h6',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '12/1/2025 8:40 AM',
      message: 'Order linked to packing facility',
    },
  ];

  if (shipment.routeChangeEvent) {
    const ev = shipment.routeChangeEvent;
    let message: string;
    if (ev.type === 'auto-upgrade') {
      message = `Shipment was upgraded from ${ev.initialCarrierServiceType}${ev.initialEta ? ` with ETA ${ev.initialEta}` : ''} to ${ev.newCarrierServiceType}${ev.newEta ? ` with ETA ${ev.newEta}` : ''} triggered by ${ev.triggeredBy}.`;
    } else if (ev.type === 'auto-downgrade') {
      message = `Shipment was downgraded from ${ev.initialCarrierServiceType}${ev.initialEta ? ` with ETA ${ev.initialEta}` : ''} to ${ev.newCarrierServiceType}${ev.newEta ? ` with ETA ${ev.newEta}` : ''} triggered by ${ev.triggeredBy}.`;
    } else {
      message = `Shipment carrier service type was changed from ${ev.initialCarrierServiceType} to ${ev.newCarrierServiceType} by ${ev.triggeredBy}.`;
    }
    entries.unshift({
      id: 'h-route-change',
      source: 'UPGRADE/DOWNGRADE RULES',
      occurredAtLabel: ev.occurredAtLabel ?? '1/6/2026 9:00 AM',
      message,
    });
  }

  if (shipment.status === 'Shipped') {
    entries.unshift({
      id: 'h-shipped',
      source: carrier,
      occurredAtLabel: '1/7/2026 2:00 PM',
      message: 'In transit to destination hub',
    });
  } else if (shipment.status === 'Packed') {
    entries.unshift({
      id: 'h-packed',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '1/2/2026 10:14 AM',
      message: 'Shipment packed',
    });
  } else if (shipment.status === 'Ready to Pack') {
    entries.unshift({
      id: 'h-ready',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '12/30/2025 9:08 AM',
      message: 'Shipment ready to pack',
    });
  } else if (shipment.status === 'Cancelled') {
    entries.unshift({
      id: 'h-cancelled',
      source: 'SHIPMENT SYSTEM',
      occurredAtLabel: '12/29/2025 5:45 PM',
      message: 'Shipment cancelled',
    });
  }

  return entries;
}

function HistoryTimelineList({ entries }: { entries: ShipmentHistoryEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="relative min-h-[1px]">
      <div
        className="pointer-events-none absolute bottom-2 top-2 z-0 w-px bg-[#e5e7eb]"
        style={{ left: TIMELINE_LINE_LEFT }}
        aria-hidden
      />
      <ul className="relative z-[1] m-0 list-none space-y-3 p-0">
        {entries.map((item) => (
          <li key={item.id}>
            <div className="relative rounded-[10px] border border-black/12 bg-white p-3">
              <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-0">
                <span
                  className="pointer-events-none relative z-[2] col-start-1 row-start-1 mt-1.5 size-2 shrink-0 self-start rounded-full bg-[#1976d2] ring-[3px] ring-white"
                  aria-hidden
                />
                <div className="col-start-2 row-start-1 flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[#6a7282]">
                    {item.source}
                  </span>
                  <span className="text-[11px] leading-4 tracking-tight text-[#6a7282] whitespace-nowrap">
                    {item.occurredAtLabel}
                  </span>
                </div>
                <p className="col-start-2 row-start-2 mt-1 min-w-0 text-sm leading-5 tracking-tight text-[#0a0a0a]">
                  {item.message}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface ShipmentHistoryPanelProps {
  sectionHeadingId: string;
  logDescription: string;
  entries: ShipmentHistoryEntry[];
}

export function ShipmentHistoryPanel({ sectionHeadingId, logDescription, entries }: ShipmentHistoryPanelProps) {
  const [fullLogOpen, setFullLogOpen] = useState(false);
  const previewEntries = useMemo(() => entries.slice(0, PREVIEW_MAX), [entries]);

  return (
    <>
      <section
        className="flex flex-col rounded-[10px] border border-black/12 bg-white"
        aria-labelledby={sectionHeadingId}
      >
        <div className="px-4 pb-3 pt-4">
          <h3 id={sectionHeadingId} className="text-base font-semibold tracking-tight text-[#0a0a0a]">
            History
          </h3>
        </div>

        <div className="px-4 pb-4">
          <HistoryTimelineList entries={previewEntries} />
          <div className="pt-3 text-center">
            <button
              type="button"
              className="text-sm font-medium tracking-tight text-[#1976d2] underline decoration-solid underline-offset-2 hover:text-[#1565c0]"
              onClick={() => setFullLogOpen(true)}
            >
              View Full History Log
            </button>
          </div>
        </div>
      </section>

      <Dialog open={fullLogOpen} onOpenChange={setFullLogOpen}>
        <DialogContent className="flex max-h-[500px] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px]">
          <DialogHeader className="shrink-0 space-y-1 border-b border-black/10 px-6 py-5 pr-12 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight text-[#0a0a0a]">Log History</DialogTitle>
            <DialogDescription className="text-sm text-[#6a7282]">{logDescription}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <HistoryTimelineList entries={entries} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DefaultShipmentHistorySection({ shipment }: { shipment: ShipmentHistoryShipmentLike }) {
  const entries = useMemo(() => buildDefaultShipmentHistory(shipment), [shipment]);
  return (
    <ShipmentHistoryPanel
      sectionHeadingId="shipment-drawer-history-heading"
      logDescription={`Order ID: ${shipment.orderId}`}
      entries={entries}
    />
  );
}
