import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import type { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import { normalizedConsolidatedPacks } from './consolidatedShipmentConstants';

type Variant = 'drawer' | 'page';

interface ConsolidatedPacksOrdersReadOnlyProps {
  shipment: ConsolidatedShipment;
  variant?: Variant;
}

/** Read-only item view: pack pills + order list (create flow keeps its own “Scan Orders” UI). */
export default function ConsolidatedPacksOrdersReadOnly({
  shipment,
  variant = 'drawer',
}: ConsolidatedPacksOrdersReadOnlyProps) {
  const packs = useMemo(() => normalizedConsolidatedPacks(shipment), [shipment]);
  const [activePackId, setActivePackId] = useState(() => packs[0]?.id ?? 1);

  useEffect(() => {
    setActivePackId(packs[0]?.id ?? 1);
  }, [shipment.id, packs]);

  const totalItems = useMemo(() => packs.reduce((n, p) => n + p.orders.length, 0), [packs]);
  const activeOrders = packs.find((p) => p.id === activePackId)?.orders ?? [];

  const isDrawer = variant === 'drawer';

  return (
    <section
      className={
        isDrawer
          ? 'rounded-[10px] border border-black/12 bg-white px-4 pb-4 pt-4'
          : 'rounded-xl border border-gray-200 bg-white px-4 pb-4 pt-4'
      }
      aria-labelledby={`consolidated-packs-orders-${shipment.id}`}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3
          id={`consolidated-packs-orders-${shipment.id}`}
          className={
            isDrawer
              ? 'text-base font-semibold tracking-tight text-[#0a0a0a]'
              : 'text-lg font-medium text-[#0a0a0a]'
          }
        >
          Orders in this shipment
        </h3>
        <span
          className={
            isDrawer
              ? 'text-sm leading-5 tracking-tight text-[#6a7282]'
              : 'text-sm text-gray-500'
          }
        >
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      {totalItems === 0 ? (
        <p
          className={
            isDrawer
              ? 'py-6 text-center text-sm leading-5 tracking-tight text-[#6a7282]'
              : 'py-8 text-center text-sm text-gray-500'
          }
        >
          No orders have been added to this consolidated shipment yet.
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {packs.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => setActivePackId(pack.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  activePackId === pack.id
                    ? 'bg-[#1976d2] text-white'
                    : 'bg-gray-200/80 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Pack #{pack.id} ({pack.orders.length})
              </button>
            ))}
          </div>

          <ul
            className={
              isDrawer
                ? 'max-h-[min(40vh,320px)] divide-y divide-gray-100 overflow-y-auto rounded-lg border border-black/10'
                : 'max-h-[min(50vh,400px)] divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200 bg-white'
            }
            role="list"
          >
            {activeOrders.map((orderId, index) => (
              <li
                key={`${orderId}-${index}`}
                className={isDrawer ? 'flex items-center gap-3 px-3 py-2.5' : 'flex items-center gap-3 px-4 py-3'}
                role="listitem"
              >
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4CAF50]"
                  aria-hidden
                >
                  <Check className="size-3 text-white" strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium leading-5 tracking-tight text-[#101828]">
                  {orderId}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
