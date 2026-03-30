import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, FileText, Receipt } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import {
  consolidatedDrawerStatusBadgeClass,
  displayCarrierType,
  displayDestination,
} from './consolidatedShipmentUi';
import type { DrawerTimelineItem } from './shipmentDrawerSections';
import ConsolidatedPacksOrdersReadOnly from './ConsolidatedPacksOrdersReadOnly';

export interface ConsolidatedDocumentRow {
  id: string;
  label: string;
}

const DEFAULT_DOCS: ConsolidatedDocumentRow[] = [
  { id: 'label', label: 'Shipping label' },
  { id: 'manifest', label: 'Manifest' },
  { id: 'invoice', label: 'Commercial invoice' },
];

const DOC_VIEW_TITLES = ['View Label', 'View Manifest', 'View Invoice'] as const;
const DOC_ICONS = [FileText, ClipboardList, Receipt] as const;

function mockCreatedAt(s: ConsolidatedShipment): string {
  return `${s.dateCreated} at 08:15`;
}

function mockPackedAt(s: ConsolidatedShipment): string {
  const d = s.packedDate;
  if (d && d !== '—') return `${d} at 12:58`;
  return '11/06/2025 at 12:58';
}

function mockShippedAt(s: ConsolidatedShipment): string {
  const d = s.shippedDate;
  if (d && d !== '—') return `${d} at 09:00`;
  return '17/10/2023 at 09:00';
}

/** Figma node 545:46113 — timeline rail and typography */
function ConsolidatedDrawerTimeline({ items }: { items: DrawerTimelineItem[] }) {
  return (
    <section
      className="rounded-[10px] border border-black/12 bg-white px-4 pb-6 pt-4"
      aria-labelledby="consolidated-drawer-timeline-heading"
    >
      <h3
        id="consolidated-drawer-timeline-heading"
        className="mb-3 text-base font-semibold tracking-tight text-[#0a0a0a]"
      >
        Timeline
      </h3>
      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCompleted = item.state === 'completed';
          const nextCompleted = items[index + 1]?.state === 'completed';
          const lineDark = isCompleted && nextCompleted;

          return (
            <div key={`${item.label}-${index}`} className="flex gap-3">
              <div className="flex w-2 shrink-0 flex-col items-center">
                <div
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    isCompleted ? 'bg-[#364153]' : 'box-border border-2 border-gray-400 bg-white'
                  }`}
                />
                {!isLast && (
                  <div
                    className={`my-1 min-h-[28px] w-0.5 flex-1 ${lineDark ? 'bg-[#364153]' : 'bg-gray-300'}`}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <p className="text-sm font-medium tracking-tight text-[#0a0a0a]">{item.label}</p>
                <p className="text-sm leading-5 tracking-tight text-[#6a7282]">{item.date}</p>
                {item.user && item.user !== '—' && (
                  <p className="mt-0.5 text-xs leading-5 tracking-tight text-[#6a7282]">{item.user}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface ConsolidatedShipmentDetailDrawerProps {
  shipment: ConsolidatedShipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrackingIdCommit: (shipmentId: string, trackingId: string) => void;
  documents?: ConsolidatedDocumentRow[];
}

export default function ConsolidatedShipmentDetailDrawer({
  shipment,
  open,
  onOpenChange,
  onTrackingIdCommit,
  documents = DEFAULT_DOCS,
}: ConsolidatedShipmentDetailDrawerProps) {
  const [trackingDraft, setTrackingDraft] = useState('');

  useEffect(() => {
    if (shipment) setTrackingDraft(shipment.trackingId);
  }, [shipment?.id, shipment?.trackingId, open]);

  const timelineItems = useMemo(() => {
    if (!shipment) return [];
    const st = shipment.status;
    const createdUser = 'Jamie Chen';
    const packedUser = 'Morgan Blake';
    const shippedUser = 'Alex Rivera';
    const shippedDone = st === 'Shipped';
    const packedDone = st === 'Packed' || st === 'Shipped';

    return [
      {
        label: 'Shipped',
        date: shippedDone ? mockShippedAt(shipment) : 'Pending carrier handoff',
        user: shippedDone ? shippedUser : undefined,
        state: shippedDone ? ('completed' as const) : ('pending' as const),
      },
      {
        label: 'Packed',
        date: packedDone ? mockPackedAt(shipment) : 'Not yet packed',
        user: packedDone ? packedUser : undefined,
        state: packedDone ? ('completed' as const) : ('pending' as const),
      },
      {
        label: 'Created',
        date: mockCreatedAt(shipment),
        user: createdUser,
        state: 'completed' as const,
      },
    ];
  }, [shipment]);

  if (!shipment) return null;

  const handleSheetOpenChange = (next: boolean) => {
    if (!next) onTrackingIdCommit(shipment.id, trackingDraft.trim());
    onOpenChange(next);
  };

  const closeDrawer = () => handleSheetOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-[540px] flex-col gap-0 border-l border-black/12 p-0 sm:max-w-[540px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="shrink-0 gap-1 border-b border-black/12 px-6 py-6 text-left">
          <SheetTitle className="text-base font-medium leading-6 tracking-[0.15px] text-[rgba(0,0,0,0.87)]">
            Consolidated Shipment Details
          </SheetTitle>
          <p className="text-sm leading-5 tracking-tight text-[#6a7282]">
            Consolidation ID: {shipment.id}
          </p>
          <div className="flex w-full gap-2">
            <span className="w-[50px] shrink-0 text-sm leading-5 tracking-tight text-[#6a7282]">Type:</span>
            <span className="text-sm font-medium leading-5 tracking-tight text-[#0a0a0a]">
              {displayCarrierType(shipment)}
            </span>
          </div>
          <div className="flex h-7 items-center gap-2">
            <span className="w-[50px] shrink-0 text-sm leading-5 tracking-tight text-[#6a7282]">Status:</span>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${consolidatedDrawerStatusBadgeClass(shipment.status)}`}
            >
              {shipment.status}
            </span>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
            <ConsolidatedDrawerTimeline items={timelineItems} />

            <section
              className="rounded-[10px] border border-black/12 bg-white px-4 pb-4 pt-4"
              aria-labelledby="consolidated-drawer-shipping-heading"
            >
              <h3
                id="consolidated-drawer-shipping-heading"
                className="mb-4 text-base font-semibold tracking-tight text-[#0a0a0a]"
              >
                Shipping Information
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="w-full shrink-0 text-sm leading-5 tracking-tight text-[#4a5565] sm:w-[180px]">
                    Tracking ID
                  </span>
                  <div className="min-w-0 flex-1">
                    <Input
                      id="consolidated-tracking-id"
                      value={trackingDraft}
                      onChange={(e) => setTrackingDraft(e.target.value)}
                      onBlur={() => onTrackingIdCommit(shipment.id, trackingDraft.trim())}
                      placeholder="Enter tracking number"
                      autoFocus={false}
                      className="h-auto min-h-[40px] rounded border border-[rgba(0,0,0,0.23)] bg-white px-3 py-2 text-base leading-6 tracking-[0.15px] text-[#101828] focus-visible:border-[#1976d2]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                  <span className="w-full shrink-0 text-sm leading-5 tracking-tight text-[#4a5565] sm:w-[180px]">
                    Packing Facility
                  </span>
                  <span className="text-sm leading-5 tracking-tight text-[#101828]">{shipment.packingFacility}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                  <span className="w-full shrink-0 text-sm leading-5 tracking-tight text-[#4a5565] sm:w-[180px]">
                    Destination
                  </span>
                  <span className="text-sm leading-5 tracking-tight text-[#101828]">{displayDestination(shipment)}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                  <span className="w-full shrink-0 text-sm leading-5 tracking-tight text-[#4a5565] sm:w-[180px]">
                    Carrier
                  </span>
                  <span className="text-sm leading-5 tracking-tight text-[#101828]">{shipment.carrier}</span>
                </div>
              </div>
            </section>

            <section
              className="rounded-[10px] border border-black/12 bg-white p-4"
              aria-labelledby="consolidated-drawer-documents-heading"
            >
              <h3
                id="consolidated-drawer-documents-heading"
                className="mb-4 text-base font-semibold tracking-tight text-[#0a0a0a]"
              >
                Documents
              </h3>
              <div className="flex flex-wrap items-start justify-between gap-6 px-2 sm:px-4">
                {documents.map((doc, index) => {
                  const Icon = DOC_ICONS[index] ?? FileText;
                  const viewTitle = DOC_VIEW_TITLES[index] ?? `View ${doc.label}`;
                  return (
                    <div
                      key={doc.id}
                      className="flex min-w-[100px] flex-1 flex-col items-center gap-2 text-center"
                    >
                      <Icon className="size-5 shrink-0 text-[#101828]" aria-hidden />
                      <span className="text-sm leading-5 tracking-tight text-[#101828]">{viewTitle}</span>
                      <button
                        type="button"
                        className="text-xs font-semibold tracking-tight text-[#1976d2] underline decoration-solid underline-offset-2 hover:text-[#1565c0]"
                        onClick={() => {
                          console.log('Download', doc.id, shipment.id);
                        }}
                      >
                        Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <ConsolidatedPacksOrdersReadOnly shipment={shipment} variant="drawer" />
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-black/12 bg-white px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-2 text-[15px] font-medium tracking-[0.46px] text-black/60 hover:bg-transparent hover:text-black/80"
              onClick={closeDrawer}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#1976d2] px-[22px] py-2 text-[15px] font-medium tracking-[0.46px] text-white shadow-md hover:bg-[#1565c0]"
              onClick={closeDrawer}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
