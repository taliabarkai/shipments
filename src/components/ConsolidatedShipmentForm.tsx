import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, ArrowLeft, MapPin, Truck, ListChecks, Plus, ScanLine } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import Header from '../imports/Header';
import {
  BULK_CARRIERS,
  MERUKAZIM_CARRIERS,
  MERUKAZIM_DESTINATIONS,
  SHIPPING_ROUTES,
  BULK_DESTINATION_PLACEHOLDER,
  parseCarrierOption,
  findCarrierOptionId,
} from './consolidatedShipmentConstants';

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
  merukazimDestination: string;
  shippingRoute: string;
  packs: Pack[];
  orderInput: string;
}): boolean {
  const { carrierOptionId, merukazimDestination, shippingRoute, packs, orderInput } = input;
  if (carrierOptionId) return true;
  if (merukazimDestination || shippingRoute) return true;
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
  const [merukazimDestination, setMerukazimDestination] = useState('');
  const [shippingRoute, setShippingRoute] = useState('');
  const [packs, setPacks] = useState<Pack[]>([{ id: 1, orders: [] }]);
  const [activePack, setActivePack] = useState(1);
  const [orderInput, setOrderInput] = useState('');
  const [tempShipmentId] = useState(() => shipment?.id ?? `${Date.now()}`);

  const parsedCarrier = useMemo(
    () => (carrierOptionId ? parseCarrierOption(carrierOptionId) : null),
    [carrierOptionId]
  );

  const routeOptions = useMemo(() => {
    if (!merukazimDestination) return [];
    return SHIPPING_ROUTES[merukazimDestination] ?? [];
  }, [merukazimDestination]);

  const detailsComplete = useMemo(() => {
    if (!parsedCarrier) return false;
    if (parsedCarrier.type === 'Bulk') return true;
    return Boolean(merukazimDestination && shippingRoute);
  }, [parsedCarrier, merukazimDestination, shippingRoute]);

  useEffect(() => {
    if (shipment) {
      setCarrierOptionId(findCarrierOptionId(shipment));
      if (
        shipment.carrierType === 'Merukazim' ||
        (!shipment.carrierType &&
          shipment.destination &&
          shipment.destination !== BULK_DESTINATION_PLACEHOLDER)
      ) {
        const destValue =
          MERUKAZIM_DESTINATIONS.find((d) => d.country === shipment.destination)?.value || '';
        setMerukazimDestination(destValue);
      } else {
        setMerukazimDestination('');
      }
      if (shipment.shippingRoute) {
        const destKey =
          MERUKAZIM_DESTINATIONS.find((d) => d.country === shipment.destination)?.value || '';
        const match = destKey
          ? SHIPPING_ROUTES[destKey]?.find((r) => r.label === shipment.shippingRoute)
          : undefined;
        setShippingRoute(match?.value ?? '');
      } else {
        setShippingRoute('');
      }

      if (shipment.orders && shipment.orders.length > 0) {
        if (shipment.id === '273133181' && shipment.orders.length === 42) {
          setPacks([
            { id: 1, orders: shipment.orders.slice(0, 15) },
            { id: 2, orders: shipment.orders.slice(15, 35) },
            { id: 3, orders: shipment.orders.slice(35, 42) },
          ]);
        } else if (shipment.id === '273133182' && shipment.orders.length === 30) {
          setPacks([
            { id: 1, orders: shipment.orders.slice(0, 8) },
            { id: 2, orders: shipment.orders.slice(8, 20) },
            { id: 3, orders: shipment.orders.slice(20, 26) },
            { id: 4, orders: shipment.orders.slice(26, 30) },
          ]);
        } else {
          setPacks([{ id: 1, orders: shipment.orders }]);
        }
      } else {
        setPacks([{ id: 1, orders: [] }]);
      }
      setActivePack(1);
    } else {
      setCarrierOptionId('');
      setMerukazimDestination('');
      setShippingRoute('');
      setPacks([{ id: 1, orders: [] }]);
      setActivePack(1);
      setOrderInput('');
    }
  }, [shipment]);

  const isDirty = useMemo(
    () =>
      computeConsolidatedFormDirty({
        carrierOptionId,
        merukazimDestination,
        shippingRoute,
        packs,
        orderInput,
      }),
    [carrierOptionId, merukazimDestination, shippingRoute, packs, orderInput]
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleCarrierChange = (value: string) => {
    setCarrierOptionId(value);
    setMerukazimDestination('');
    setShippingRoute('');
  };

  const handleMerukazimDestinationChange = (value: string) => {
    setMerukazimDestination(value);
    setShippingRoute('');
  };

  const handleScanOrder = () => {
    if (orderInput.trim()) {
      const newPacks = packs.map((pack) => {
        if (pack.id === activePack) {
          return { ...pack, orders: [...pack.orders, orderInput.trim()] };
        }
        return pack;
      });
      setPacks(newPacks);
      setOrderInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScanOrder();
    }
  };

  const removeOrder = (packId: number, orderIndex: number) => {
    const newPacks = packs.map((pack) => {
      if (pack.id === packId) {
        return {
          ...pack,
          orders: pack.orders.filter((_, index) => index !== orderIndex),
        };
      }
      return pack;
    });
    setPacks(newPacks);
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

    const packingFacilities = ['Thailand', 'Kiryat Gat', 'Hungary', 'Nazareth'];
    const randomFacility = packingFacilities[Math.floor(Math.random() * packingFacilities.length)];

    let destination: string;
    let shippingRouteLabel: string | undefined;

    if (parsed.type === 'Bulk') {
      destination = BULK_DESTINATION_PLACEHOLDER;
      shippingRouteLabel = undefined;
    } else {
      const dest = MERUKAZIM_DESTINATIONS.find((d) => d.value === merukazimDestination);
      destination = dest?.country ?? '';
      const route = routeOptions.find((r) => r.value === shippingRoute);
      shippingRouteLabel = route?.label ?? '';
    }

    return {
      id: tempShipmentId,
      packingFacility: shipment?.packingFacility || randomFacility,
      destination,
      carrier: parsed.carrierName,
      carrierType: parsed.type,
      shippingRoute: shippingRouteLabel,
      trackingId: shipment?.trackingId || `TRK${Date.now()}`,
      orders: packs.flatMap((pack) => pack.orders),
      dateCreated: shipment?.dateCreated || new Date().toLocaleDateString('en-US'),
      hasCancelledItems: shipment?.hasCancelledItems || false,
      cancelledOrders: shipment?.cancelledOrders || [],
    };
  }, [
    carrierOptionId,
    merukazimDestination,
    shippingRoute,
    routeOptions,
    packs,
    shipment,
    tempShipmentId,
  ]);

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
      status: 'Draft',
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
          ? 'rounded-xl bg-[#fafafa] p-4 space-y-4'
          : 'bg-white rounded-lg border p-6 space-y-4'
      }
    >
      {variant === 'page' && <h2 className="font-semibold text-lg">Shipment Details</h2>}

      <div className="space-y-2">
        <label
          className={`mb-0 flex items-center gap-2 ${variant === 'drawer' ? 'text-base font-medium text-[rgba(0,0,0,0.87)]' : 'font-medium block'}`}
        >
          <Truck className="w-5 h-5 shrink-0 text-[rgba(0,0,0,0.87)]" />
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
                ? 'h-14 w-full min-w-0 border-[rgba(0,0,0,0.23)] bg-white'
                : 'h-10 w-full min-w-0'
            }
          >
            <SelectValue placeholder="Select" />
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
        {parsedCarrier && (
          <p className="text-sm text-[rgba(0,0,0,0.6)]">
            Carrier Type:{' '}
            <span className="font-medium text-[rgba(0,0,0,0.87)]">
              {parsedCarrier.type === 'Merukazim' ? 'Merukazim' : 'Bulk'}
            </span>
          </p>
        )}
      </div>

      {parsedCarrier?.type === 'Merukazim' && (
        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 font-medium">
              <MapPin className="h-4 w-4" />
              Destination Country <span className="text-red-500">*</span>
            </label>
            <Select
              value={merukazimDestination || undefined}
              onValueChange={handleMerukazimDestinationChange}
              disabled={!!isShippedOrPacked}
            >
              <SelectTrigger className={variant === 'drawer' ? 'h-14 border-[rgba(0,0,0,0.23)] bg-white' : 'w-full'}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {MERUKAZIM_DESTINATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 font-medium">
              <Truck className="h-4 w-4" />
              Shipping Route <span className="text-red-500">*</span>
            </label>
            <Select
              value={shippingRoute || undefined}
              onValueChange={setShippingRoute}
              disabled={!merukazimDestination || !!isShippedOrPacked}
            >
              <SelectTrigger className={variant === 'drawer' ? 'h-14 border-[rgba(0,0,0,0.23)] bg-white' : 'w-full'}>
                <SelectValue
                  placeholder={merukazimDestination ? 'Select route' : 'Select destination first'}
                />
              </SelectTrigger>
              <SelectContent>
                {routeOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );

  const packsSection =
    variant === 'drawer' ? (
      <div className="flex min-h-[280px] flex-1 flex-col gap-4 overflow-hidden rounded-xl bg-[#fafafa] p-6">
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
          <div className="flex items-center gap-3">
            <ListChecks className="h-6 w-6 text-[rgba(0,0,0,0.87)]" />
            <span className="text-base font-medium text-[rgba(0,0,0,0.87)]">Scan Orders</span>
          </div>
          <span className="text-base text-[rgba(0,0,0,0.6)]">{totalScanned} items</span>
        </div>

        {!isShippedOrPacked && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e0e0e0] bg-white">
            <div className="flex items-center gap-3 border-b border-[rgba(0,0,0,0.12)] px-3 py-3">
              <ScanLine className="h-6 w-6 shrink-0 text-gray-500" />
              <Input
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scan or Enter Order ID"
                disabled={!detailsComplete}
                className="border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex min-h-[200px] flex-1 flex-col overflow-y-auto">
              {activatePackOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-12">
                  <ListChecks className="h-12 w-12 text-gray-400" />
                  <p className="text-base text-[rgba(0,0,0,0.6)]">No orders scanned yet</p>
                  <p className="text-sm text-[rgba(0,0,0,0.6)]">Start scanning to add orders</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activatePackOrders.map((order, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50"
                    >
                      <span className="text-sm">{order}</span>
                      <button
                        type="button"
                        onClick={() => removeOrder(activePack, index)}
                        className="text-gray-400 hover:text-red-600"
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
          <div>
            <label className="mb-2 block font-medium">
              <ListChecks className="mr-2 inline h-4 w-4" />
              Scan Orders into Pack #{activePack}
            </label>
            <div className="flex gap-2">
              <Input
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
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
                  className="group flex items-center justify-between border-b px-4 py-2 last:border-b-0 hover:bg-gray-50"
                >
                  <span className="text-sm">{order}</span>
                  {!isShippedOrPacked && (
                    <button
                      type="button"
                      onClick={() => removeOrder(activePack, index)}
                      className="text-gray-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
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
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 pt-2">
          {carrierSection}
          {packsSection}
        </div>

        <div className="mt-auto flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            className="text-[15px] font-medium uppercase tracking-wide text-[rgba(0,0,0,0.6)]"
            onClick={onCloseRequest}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePack}
            disabled={!canPack}
            className={`min-w-[88px] text-[15px] font-medium uppercase tracking-wide ${
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
