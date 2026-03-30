import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  X,
  ArrowLeft,
  Plus,
  Scan,
  Check,
  CheckCircle2,
  CircleAlert,
  MapPin,
  Package,
  Link2,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from './ui/utils';
import { carrierTypeLabelClass } from './consolidatedShipmentUi';
import Header from '../imports/Header';
import {
  BULK_CARRIERS,
  MERUKAZIM_CARRIERS,
  BULK_DESTINATION_STORED,
  merukazimConfigByCarrierId,
  parseCarrierOption,
  findCarrierOptionId,
} from './consolidatedShipmentConstants';
import {
  validateOrderScan,
  type ScanFeedback,
} from './consolidatedScanValidation';

function ScanFeedbackBanner({
  feedback,
  onDismiss,
}: {
  feedback: ScanFeedback | null;
  onDismiss: () => void;
}) {
  if (!feedback) return null;

  if (feedback.variant === 'success') {
    return (
      <div className="flex items-center gap-2 border-b border-green-200 bg-[#ecfdf3] px-3 py-2.5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16a34a]" aria-hidden />
        <p className="text-sm font-medium leading-5 text-[#166534]">{feedback.message}</p>
      </div>
    );
  }

  if (feedback.variant === 'warning') {
    const Icon = feedback.style === 'facility' ? Building2 : AlertTriangle;
    return (
      <div className="relative flex gap-2 border-b border-amber-200 bg-amber-50 px-3 py-3 pr-9">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900">{feedback.title}</p>
          <p className="text-sm leading-5 text-amber-950/90">{feedback.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded p-0.5 text-amber-800/70 hover:bg-amber-100 hover:text-amber-900"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const icon =
    feedback.style === 'status' ? (
      <Package className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden />
    ) : feedback.style === 'not-found' ? (
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden />
    ) : feedback.style === 'destination' ? (
      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden />
    ) : (
      <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden />
    );

  return (
    <div className="relative flex gap-2 border-b border-red-100 bg-red-50 px-3 py-3 pr-9">
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-950">{feedback.title}</p>
        <p className="text-sm leading-5 text-red-900/95">{feedback.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded p-0.5 text-red-800/70 hover:bg-red-100 hover:text-red-950"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Blocky list-in-frame icon (filled bullets + lines), matches empty-state reference. */
function EmptyOrdersListIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="6" width="3" height="3" fill="currentColor" />
      <rect x="11" y="6.5" width="9" height="2" fill="currentColor" />
      <rect x="6" y="11" width="3" height="3" fill="currentColor" />
      <rect x="11" y="11.5" width="9" height="2" fill="currentColor" />
      <rect x="6" y="16" width="3" height="3" fill="currentColor" />
      <rect x="11" y="16.5" width="9" height="2" fill="currentColor" />
    </svg>
  );
}

export interface Pack {
  id: number;
  orders: string[];
}

export interface ConsolidatedShipmentFormProps {
  variant: 'page' | 'drawer';
  /** Edit mode: existing shipment. Create (drawer): null */
  shipment: ConsolidatedShipment | null;
  onPack: (shipment: ConsolidatedShipment) => void;
  /** Page / edit only — draft save */
  onSaveDraft?: (shipment: ConsolidatedShipment) => void;
  /** Back, Cancel, or close — parent may confirm discard */
  onCloseRequest: () => void;
  /** Fires when dirty state changes (for discard confirmation) */
  onDirtyChange?: (dirty: boolean) => void;
}

export function computeConsolidatedFormDirty(input: {
  carrierOptionId: string;
  packs: Pack[];
  orderInput: string;
}): boolean {
  const { carrierOptionId, packs, orderInput } = input;
  if (carrierOptionId) return true;
  if (packs.some((p) => p.orders.length > 0)) return true;
  if (orderInput.trim()) return true;
  return false;
}

export default function ConsolidatedShipmentForm({
  variant,
  shipment,
  onPack,
  onSaveDraft,
  onCloseRequest,
  onDirtyChange,
}: ConsolidatedShipmentFormProps) {
  const [carrierOptionId, setCarrierOptionId] = useState('');
  const [packs, setPacks] = useState<Pack[]>([{ id: 1, orders: [] }]);
  const [activePack, setActivePack] = useState(1);
  const [orderInput, setOrderInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState<ScanFeedback | null>(null);
  const [orderScannedAt, setOrderScannedAt] = useState<Record<string, number>>({});
  const [tempShipmentId] = useState(() => shipment?.id ?? `${Date.now()}`);

  const parsedCarrier = useMemo(
    () => (carrierOptionId ? parseCarrierOption(carrierOptionId) : null),
    [carrierOptionId]
  );

  const detailsComplete = useMemo(() => Boolean(parsedCarrier), [parsedCarrier]);

  /** Hide scan until carrier is chosen. */
  const showPacksAndScan = detailsComplete;

  const consolidationLaneDest = useMemo(() => {
    if (!parsedCarrier) return BULK_DESTINATION_STORED;
    if (parsedCarrier.type === 'Bulk') return BULK_DESTINATION_STORED;
    const [, merId] = carrierOptionId.split('::');
    return merukazimConfigByCarrierId(merId ?? '')?.destination ?? '';
  }, [parsedCarrier, carrierOptionId]);

  useEffect(() => {
    if (shipment) {
      setCarrierOptionId(findCarrierOptionId(shipment));

      if (shipment.packs && shipment.packs.length > 0) {
        setPacks(shipment.packs.map((p) => ({ id: p.id, orders: [...p.orders] })));
      } else if (shipment.orders && shipment.orders.length > 0) {
        setPacks([{ id: 1, orders: [...shipment.orders] }]);
      } else {
        setPacks([{ id: 1, orders: [] }]);
      }
      setActivePack(1);
      if (shipment.orders?.length) {
        const meta: Record<string, number> = {};
        shipment.orders.forEach((o, i) => {
          meta[o] = Date.now() - i * 1000;
        });
        setOrderScannedAt(meta);
      } else {
        setOrderScannedAt({});
      }
      setScanFeedback(null);
    } else {
      setCarrierOptionId('');
      setPacks([{ id: 1, orders: [] }]);
      setActivePack(1);
      setOrderInput('');
      setOrderScannedAt({});
      setScanFeedback(null);
    }
  }, [shipment]);

  useEffect(() => {
    if (scanFeedback?.variant !== 'success') return;
    const t = window.setTimeout(() => setScanFeedback(null), 4000);
    return () => window.clearTimeout(t);
  }, [scanFeedback]);

  const isDirty = useMemo(
    () =>
      computeConsolidatedFormDirty({
        carrierOptionId,
        packs,
        orderInput,
      }),
    [carrierOptionId, packs, orderInput]
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleCarrierChange = (value: string) => {
    setCarrierOptionId(value);
  };

  const handleOrderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderInput(e.target.value);
    if (scanFeedback && scanFeedback.variant !== 'success') {
      setScanFeedback(null);
    }
  };

  const handleScanOrder = () => {
    const id = orderInput.trim();
    if (!id || !parsedCarrier || !detailsComplete) return;

    const alreadyScannedIds = new Set(packs.flatMap((p) => p.orders));
    const feedback = validateOrderScan(id, {
      carrierType: parsedCarrier.type,
      consolidationDestination: consolidationLaneDest,
      alreadyScannedIds,
    });

    if (feedback) {
      setScanFeedback(feedback);
      return;
    }

    setScanFeedback({ variant: 'success', message: `Shipment ${id} added successfully` });
    setPacks(
      packs.map((pack) =>
        pack.id === activePack ? { ...pack, orders: [...pack.orders, id] } : pack
      )
    );
    setOrderScannedAt((prev) => ({ ...prev, [id]: Date.now() }));
    setOrderInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScanOrder();
    }
  };

  const removeOrder = (packId: number, orderIndex: number) => {
    const pack = packs.find((p) => p.id === packId);
    const removedId = pack?.orders[orderIndex];
    const newPacks = packs.map((p) => {
      if (p.id === packId) {
        return {
          ...p,
          orders: p.orders.filter((_, index) => index !== orderIndex),
        };
      }
      return p;
    });
    setPacks(newPacks);
    if (removedId) {
      setOrderScannedAt((prev) => {
        const next = { ...prev };
        delete next[removedId];
        return next;
      });
    }
  };

  const formatScannedTime = (orderId: string) => {
    const ts = orderScannedAt[orderId];
    if (!ts) return '\u00a0';
    return new Date(ts).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const addNewPack = () => {
    if (packs.length < 10) {
      const newPackId = Math.max(...packs.map((p) => p.id)) + 1;
      setPacks([...packs, { id: newPackId, orders: [] }]);
      setActivePack(newPackId);
    }
  };

  const deletePack = (packId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    const packToDelete = packs.find((p) => p.id === packId);
    if (!packToDelete || packToDelete.orders.length > 0 || packs.length === 1) {
      return;
    }

    const newPacks = packs.filter((p) => p.id !== packId);
    const renumberedPacks = newPacks.map((pack, index) => ({
      ...pack,
      id: index + 1,
    }));

    setPacks(renumberedPacks);

    if (activePack === packId) {
      setActivePack(1);
    } else if (activePack > packId) {
      setActivePack(activePack - 1);
    }
  };

  const buildShipmentBase = useCallback((): Omit<ConsolidatedShipment, 'status' | 'totalValue'> | null => {
    const parsed = parseCarrierOption(carrierOptionId);
    if (!parsed) return null;

    let destination: string;

    if (parsed.type === 'Bulk') {
      destination = BULK_DESTINATION_STORED;
    } else {
      const [, merId] = carrierOptionId.split('::');
      const cfg = merId ? merukazimConfigByCarrierId(merId) : undefined;
      destination = cfg?.destination ?? '';
    }

    return {
      id: tempShipmentId,
      packingFacility: shipment?.packingFacility ?? 'Kiryat Gat',
      destination,
      carrier: parsed.carrierName,
      carrierType: parsed.type,
      trackingId: shipment?.trackingId || `TRK${Date.now()}`,
      orders: packs.flatMap((pack) => pack.orders),
      packs: packs.map((p) => ({ id: p.id, orders: [...p.orders] })),
      dateCreated: shipment?.dateCreated || new Date().toLocaleDateString('en-US'),
      hasCancelledItems: shipment?.hasCancelledItems || false,
      cancelledOrders: shipment?.cancelledOrders || [],
    };
  }, [carrierOptionId, packs, shipment, tempShipmentId]);

  const handlePack = () => {
    if (!detailsComplete || packs.every((pack) => pack.orders.length === 0)) {
      return;
    }

    const base = buildShipmentBase();
    if (!base) return;

    const updatedShipment: ConsolidatedShipment = {
      ...base,
      totalValue: shipment?.totalValue || `$${(Math.random() * 20000 + 5000).toFixed(2)}`,
      status: 'Packed',
    };

    onPack(updatedShipment);
  };

  const handleSaveAndClose = () => {
    if (!detailsComplete || !onSaveDraft) {
      return;
    }

    const base = buildShipmentBase();
    if (!base) return;

    const updatedShipment: ConsolidatedShipment = {
      ...base,
      totalValue: packs.some((pack) => pack.orders.length > 0)
        ? shipment?.totalValue || `$${(Math.random() * 20000 + 5000).toFixed(2)}`
        : '$0.00',
      status: 'Packed',
    };

    onSaveDraft(updatedShipment);
  };

  const activatePackOrders = packs.find((p) => p.id === activePack)?.orders || [];
  const totalScanned = packs.reduce((n, p) => n + p.orders.length, 0);
  const isShippedOrPacked = shipment && (shipment.status === 'Shipped' || shipment.status === 'Packed');
  const canPack =
    detailsComplete &&
    packs.some((pack) => pack.orders.length > 0) &&
    !isShippedOrPacked;

  const carrierSection = (
    <div
      className={
        variant === 'drawer'
          ? 'flex flex-col gap-6 rounded-xl bg-[#fafafa] p-6'
          : 'flex flex-col gap-2 rounded-lg border bg-white p-6'
      }
    >
      {variant === 'page' && <h2 className="font-semibold text-lg">Shipment Details</h2>}

      <div className="flex flex-col gap-2">
        <label
          className={`mb-0 ${variant === 'drawer' ? 'text-base font-medium text-[rgba(0,0,0,0.87)]' : 'font-medium block'}`}
        >
          Select Carrier
        </label>
        <Select
          value={carrierOptionId || undefined}
          onValueChange={handleCarrierChange}
          disabled={!!isShippedOrPacked}
        >
          <SelectTrigger
            className={
              variant === 'drawer'
                ? 'h-14 w-full min-w-0 border-[rgba(0,0,0,0.23)] bg-white [&_[data-slot=select-value]]:min-w-0'
                : 'h-10 w-full min-w-0 [&_[data-slot=select-value]]:min-w-0'
            }
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden pr-1">
              <SelectValue placeholder="Select" className="min-w-0 flex-1 truncate text-left" />
              {parsedCarrier && (
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tracking-tight',
                    carrierTypeLabelClass(parsedCarrier.type),
                  )}
                >
                  {parsedCarrier.type === 'Merukazim' ? 'Merukazim' : 'Bulk'}
                </span>
              )}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Bulk</SelectLabel>
              {BULK_CARRIERS.map((c) => (
                <SelectItem key={`bulk-${c.id}`} value={`bulk::${c.id}`}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Merukazim</SelectLabel>
              {MERUKAZIM_CARRIERS.map((c) => (
                <SelectItem key={`merukazim-${c.id}`} value={`merukazim::${c.id}`}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const packsSection =
    variant === 'drawer' ? (
      !showPacksAndScan ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl bg-[#fafafa] p-6 text-center">
          <p className="text-sm leading-5 text-[rgba(0,0,0,0.6)]">
            {!parsedCarrier ? 'Select a carrier to scan orders.' : null}
          </p>
        </div>
      ) : (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-xl bg-[#fafafa] p-6">
        <div className="flex flex-wrap items-center gap-2">
          {packs.map((pack) => (
            <button
              type="button"
              key={pack.id}
              onClick={() => setActivePack(pack.id)}
              className={`relative rounded-full px-3 py-1.5 text-sm transition-colors ${
                activePack === pack.id
                  ? 'bg-[#1976d2] text-white'
                  : 'bg-gray-200/80 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Pack #{pack.id} ({pack.orders.length})
              {packs.length > 1 && pack.orders.length === 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePack(pack.id, e);
                  }}
                  className={`absolute -right-1 -top-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-[10px] ${
                    activePack === pack.id ? 'bg-white text-[#1976d2]' : 'bg-gray-700 text-white'
                  }`}
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </button>
          ))}
          {packs.length < 10 && (
            <button
              type="button"
              onClick={addNewPack}
              disabled={!detailsComplete}
              className="flex items-center gap-1 rounded-full bg-gray-200/80 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-200 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <span className="text-base font-medium text-[rgba(0,0,0,0.87)]">Scan Orders</span>
          <span className="text-base text-[rgba(0,0,0,0.6)]">{totalScanned} items</span>
        </div>

        {!isShippedOrPacked && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e0e0e0] bg-white focus-within:border-[#1976d2] focus-within:ring-1 focus-within:ring-[#1976d2]/30">
            <div className="flex items-center gap-3 border-b border-[rgba(0,0,0,0.12)] px-3 py-3">
              <Scan className="h-6 w-6 shrink-0 text-[#1976d2]" />
              <Input
                value={orderInput}
                onChange={handleOrderInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Scan or Enter Order ID"
                disabled={!detailsComplete}
                className="border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
              />
            </div>
            <ScanFeedbackBanner feedback={scanFeedback} onDismiss={() => setScanFeedback(null)} />
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {activatePackOrders.length === 0 ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-8">
                  <EmptyOrdersListIcon className="h-12 w-12 text-gray-400" />
                  <p className="text-base text-[rgba(0,0,0,0.6)]">No orders scanned yet</p>
                  <p className="text-sm text-[rgba(0,0,0,0.6)]">Start scanning to add orders</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activatePackOrders.map((order, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span
                          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4CAF50]"
                          aria-hidden
                        >
                          <Check className="size-3 text-white" strokeWidth={3} />
                        </span>
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-[#101828]">{order}</span>
                          <span className="block text-xs leading-4 text-[#6a7282]">
                            {formatScannedTime(order)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOrder(activePack, index)}
                        className="shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isShippedOrPacked && (
          <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
            Orders are locked for this shipment status.
          </div>
        )}
      </div>
      )
    ) : !showPacksAndScan ? (
      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm leading-5 text-[rgba(0,0,0,0.6)]">
          {!parsedCarrier ? 'Select a carrier to scan orders.' : null}
        </p>
      </div>
    ) : (
      <div className="space-y-4 rounded-lg border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-lg">Packs</h2>
          <div className="flex flex-wrap items-center gap-2">
            {packs.map((pack) => (
              <button
                type="button"
                key={pack.id}
                onClick={() => setActivePack(pack.id)}
                className={`relative rounded-full px-3 py-1.5 text-sm transition-colors group ${
                  activePack === pack.id
                    ? 'bg-[#1976d2] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pack #{pack.id} ({pack.orders.length})
                {packs.length > 1 && pack.orders.length === 0 && !isShippedOrPacked && (
                  <span
                    onClick={(e) => deletePack(pack.id, e)}
                    className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 ${
                      activePack === pack.id ? 'bg-white text-[#1976d2]' : 'bg-gray-700 text-white'
                    }`}
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>
            ))}
            {packs.length < 10 && !isShippedOrPacked && (
              <button
                type="button"
                onClick={addNewPack}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                disabled={!detailsComplete}
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {!isShippedOrPacked && (
          <div className="space-y-2">
            <label className="mb-2 block font-medium">Scan Orders into Pack #{activePack}</label>
            <div className="flex gap-2">
              <Input
                value={orderInput}
                onChange={handleOrderInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Scan or type order ID"
                disabled={!detailsComplete}
                className="flex-1"
              />
              <Button
                onClick={handleScanOrder}
                disabled={!orderInput.trim() || !detailsComplete}
                className="bg-[#1976d2] text-white hover:bg-[#1565c0]"
              >
                Add
              </Button>
            </div>
            <ScanFeedbackBanner feedback={scanFeedback} onDismiss={() => setScanFeedback(null)} />
          </div>
        )}

        <div>
          <div className="mb-2 font-medium">
            Orders in Pack #{activePack} ({activatePackOrders.length})
          </div>
          {activatePackOrders.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto rounded-lg border">
              {activatePackOrders.map((order, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between gap-3 border-b px-4 py-2 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4CAF50]"
                      aria-hidden
                    >
                      <Check className="size-3 text-white" strokeWidth={3} />
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-[#101828]">{order}</span>
                      <span className="block text-xs text-gray-500">{formatScannedTime(order)}</span>
                    </div>
                  </div>
                  {!isShippedOrPacked && (
                    <button
                      type="button"
                      onClick={() => removeOrder(activePack, index)}
                      className="shrink-0 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border px-4 py-8 text-center text-gray-500">
              No orders in this pack yet
            </div>
          )}
        </div>
      </div>
    );

  if (variant === 'drawer') {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-6 py-6">
          <div className="shrink-0">{carrierSection}</div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{packsSection}</div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            className="text-[15px] font-medium text-[rgba(0,0,0,0.6)]"
            onClick={onCloseRequest}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePack}
            disabled={!canPack}
            className={`min-w-[88px] text-[15px] font-medium ${
              canPack ? 'bg-[#1976d2] text-white hover:bg-[#1565c0]' : 'bg-[rgba(0,0,0,0.12)] text-[rgba(0,0,0,0.38)]'
            }`}
          >
            Pack
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f7f7f4]">
      <div className="h-[72px] shrink-0">
        <Header />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onCloseRequest}
              className="flex items-center gap-2 text-gray-700 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl">Edit Consolidated Shipment: {shipment?.id}</h1>
          </div>
          <div className="flex items-center gap-3">
            {onSaveDraft && (
              <Button
                onClick={handleSaveAndClose}
                variant="outline"
                disabled={!detailsComplete || !!isShippedOrPacked}
              >
                Save and Close
              </Button>
            )}
            <Button
              onClick={handlePack}
              disabled={!canPack}
              className="bg-[#1976d2] text-white hover:bg-[#1565c0]"
            >
              Pack
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {carrierSection}
            {packsSection}
          </div>
        </div>
      </div>
    </div>
  );
}
