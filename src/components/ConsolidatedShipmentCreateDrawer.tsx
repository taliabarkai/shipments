import { useState, useCallback, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import ConsolidatedShipmentForm from './ConsolidatedShipmentForm';
import type { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ConsolidatedShipmentCreateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPacked: (shipment: ConsolidatedShipment) => void;
  /** After simulated label API failure — opens consolidated item detail (Draft). */
  onGoToShipment: (shipment: ConsolidatedShipment) => void;
}

export default function ConsolidatedShipmentCreateDrawer({
  open,
  onOpenChange,
  onPacked,
  onGoToShipment,
}: ConsolidatedShipmentCreateDrawerProps) {
  const [dirty, setDirty] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  /** When ON, Pack creates the shipment in Draft (existing API-error / recovery flow). */
  const [apiErrorSimulation, setApiErrorSimulation] = useState(false);
  const [labelApiErrorOpen, setLabelApiErrorOpen] = useState(false);
  const [labelApiErrorShipment, setLabelApiErrorShipment] = useState<ConsolidatedShipment | null>(null);

  useEffect(() => {
    if (!open) setApiErrorSimulation(false);
  }, [open]);

  const requestClose = useCallback(() => {
    if (dirty) {
      setDiscardOpen(true);
    } else {
      onOpenChange(false);
    }
  }, [dirty, onOpenChange]);

  const handleSheetOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        onOpenChange(true);
        return;
      }
      requestClose();
    },
    [onOpenChange, requestClose]
  );

  const confirmDiscard = () => {
    setDiscardOpen(false);
    setDirty(false);
    onOpenChange(false);
  };

  const handlePacked = (shipment: ConsolidatedShipment) => {
    setDirty(false);
    if (apiErrorSimulation) {
      const draft: ConsolidatedShipment = { ...shipment, status: 'Draft', trackingId: '' };
      onPacked(draft);
      setApiErrorSimulation(false);
      onOpenChange(false);
      setLabelApiErrorShipment(draft);
      setLabelApiErrorOpen(true);
      return;
    }
    onPacked(shipment);
    setApiErrorSimulation(false);
    onOpenChange(false);
  };

  const handleGoToShipmentFromLabelError = () => {
    if (!labelApiErrorShipment) return;
    onGoToShipment(labelApiErrorShipment);
    setLabelApiErrorOpen(false);
    setLabelApiErrorShipment(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          hideClose
          side="right"
          className="flex h-full min-h-0 w-full flex-col gap-0 overflow-hidden border-l bg-white p-0 sm:max-w-[600px]"
        >
          <SheetHeader className="shrink-0 space-y-0 border-b px-6 py-4 text-left">
            <div className="flex items-start justify-between gap-4 pr-2">
              <div className="min-w-0 flex-1 space-y-2">
                <SheetTitle className="text-base font-medium leading-normal tracking-[0.15px] text-[rgba(0,0,0,0.87)]">
                  New Consolidated Shipment
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Label
                    htmlFor="consolidated-api-error-simulation"
                    className="cursor-pointer text-[12px] font-normal leading-snug text-[rgba(0,0,0,0.6)]"
                  >
                    API Error Simulation
                  </Label>
                  <Switch
                    id="consolidated-api-error-simulation"
                    checked={apiErrorSimulation}
                    onCheckedChange={setApiErrorSimulation}
                    className="scale-90"
                    aria-label="API Error Simulation"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-full"
                onClick={requestClose}
                aria-label="Close"
              >
                <X className="size-5" />
              </Button>
            </div>
          </SheetHeader>

          <ConsolidatedShipmentForm
            variant="drawer"
            shipment={null}
            onPack={handlePacked}
            onCloseRequest={requestClose}
            onDirtyChange={setDirty}
          />
        </SheetContent>
      </Sheet>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent className="sm:max-w-lg [&>button.ring-offset-background]:hidden">
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              You have unsaved information. If you leave now, you will lose what you entered for this
              shipment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDiscardOpen(false)}>
              Stay
            </Button>
            <Button
              type="button"
              className="bg-[#1976d2] text-white hover:bg-[#1565c0]"
              onClick={confirmDiscard}
            >
              Leave and discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={labelApiErrorOpen} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-lg [&>button.ring-offset-background]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-500" aria-hidden />
              Create label manually
            </DialogTitle>
            <DialogDescription>
              {
                "We couldn't generate a label for this consolidated shipment. Please create one manually and enter the tracking ID."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="destructive"
              className="w-fit px-[22px] py-2 text-[15px] font-medium shadow-md"
              onClick={handleGoToShipmentFromLabelError}
            >
              Continue to Shipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
