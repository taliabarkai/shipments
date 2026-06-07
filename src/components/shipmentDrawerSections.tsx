import type { ReactNode } from 'react';

export type TimelineItemState = 'completed' | 'pending';

export interface DrawerTimelineItem {
  label: string;
  date: string;
  /** Display name of user who performed the step (omit for pending / N/A steps) */
  user?: string;
  state: TimelineItemState;
  /** Optional sub-line (e.g. "Reason: Waiting for pending item") shown below the label. */
  reason?: string;
}

/**
 * Timeline block matching Shipment Full Details drawer styling.
 */
export function DrawerTimelineSection({ items }: { items: DrawerTimelineItem[] }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="font-semibold mb-3">Timeline</h3>

      <div className="space-y-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCompleted = item.state === 'completed';

          return (
            <div key={`${item.label}-${index}`} className="flex gap-3">
              <div className="flex flex-col items-center w-2 shrink-0">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    isCompleted ? 'bg-gray-700' : 'border-2 border-gray-400 bg-white box-border'
                  }`}
                />
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[28px] my-1 ${
                      isCompleted && items[index + 1]?.state === 'completed'
                        ? 'bg-gray-700'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-4 min-w-0">
                <p className="font-medium text-sm">{item.label}</p>
                {item.reason ? (
                  <p className="text-xs text-gray-500 mt-0.5">Reason: {item.reason}</p>
                ) : null}
                <p className="text-sm text-gray-500">{item.date}</p>
                {item.user && item.user !== '—' && (
                  <p className="text-xs text-gray-500 mt-1">By {item.user}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Shipping information card matching Shipment Full Details drawer styling.
 */
export function DrawerShippingInformationSection({
  title = 'Shipping Information',
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function DrawerInfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 sm:items-center">
      <span className="text-sm text-gray-600 min-w-[180px] shrink-0">{label}</span>
      <div className="text-sm text-gray-900 min-w-0">{value}</div>
    </div>
  );
}
