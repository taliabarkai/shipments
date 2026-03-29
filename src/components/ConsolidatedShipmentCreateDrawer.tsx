import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import ConsolidatedShipmentForm from './ConsolidatedShipmentForm';
import type { ConsolidatedShipment } from './ConsolidatedShipmentsApp';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ConsolidatedShipmentCreateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPacked: (shipment: ConsolidatedShipment) => void;
}

export default function ConsolidatedShipmentCreateDrawer({
  open,
  onOpenChange,
  onPacked,
}: ConsolidatedShipmentCreateDrawerProps) {
  const [dirty, setDirty] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

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
    onPacked(shipment);
    setDirty(false);
    onOpenChange(false);
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
              <SheetTitle className="text-base font-medium leading-normal tracking-[0.15px] text-[rgba(0,0,0,0.87)]">
                New Consolidated Shipment
              </SheetTitle>
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

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved information. If you leave now, you will lose what you entered for this
              shipment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDiscard}
              className="bg-[#1976d2] text-white hover:bg-[#1565c0]"
            >
              Leave and discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
