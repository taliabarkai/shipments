import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from './ui/utils';

/** Hosted on Komodo Decks CDN — avoids bundling large assets in deploy. */
const PLACEMENT_GUIDE_ITEM_LEVEL_IMAGE =
  'https://plain-eeur-prod-public.komododecks.com/202604/28/RJcCPTM4a2PimpBucz5E/image.jpg';
const PLACEMENT_GUIDE_SHIPMENT_LEVEL_IMAGE =
  'https://plain-eeur-prod-public.komododecks.com/202604/28/bsutH9bGEnF5xg6JW5an/image.jpg';

export interface PlacementGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PlacementGuideDialog({ open, onOpenChange }: PlacementGuideDialogProps) {
  const [tab, setTab] = useState<'item' | 'shipment'>('item');

  useEffect(() => {
    if (open) setTab('item');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[90vh] w-[min(1100px,calc(100vw-2rem))] max-w-[min(1100px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-0 shadow-lg md:w-[min(1100px,calc(100vw-120px))] md:max-w-[min(1100px,calc(100vw-120px))]',
        )}
      >
        <DialogHeader className="shrink-0 space-y-0 border-b border-gray-200 px-6 py-4 pr-14 text-left">
          <DialogTitle className="text-base font-semibold text-[#101828]">Placement Guide</DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as 'item' | 'shipment')}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <TabsList className="relative flex h-auto w-full shrink-0 flex-wrap items-end justify-start gap-x-6 gap-y-0 rounded-none border-0 border-b border-gray-200 bg-transparent px-6 pt-2 pb-0">
            <TabsTrigger
              value="item"
              className={cn(
                '-mb-px inline-flex h-auto flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-2 text-base font-normal leading-tight transition-[color,box-shadow,background-color] md:text-sm',
                'text-gray-500 hover:text-gray-600',
                'data-[state=active]:border-[#1976d2] data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-[#1976d2]',
                'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
              )}
            >
              Item Level
            </TabsTrigger>
            <TabsTrigger
              value="shipment"
              className={cn(
                '-mb-px inline-flex h-auto flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-2 text-base font-normal leading-tight transition-[color,box-shadow,background-color] md:text-sm',
                'text-gray-500 hover:text-gray-600',
                'data-[state=active]:border-[#1976d2] data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-[#1976d2]',
                'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
              )}
            >
              Shipment Level
            </TabsTrigger>
          </TabsList>

          <TabsContent value="item" className="m-0 min-h-0 flex-1 overflow-y-auto focus-visible:outline-none">
            <div className="bg-[#FAFAFA] px-4 py-4">
              <img
                src={PLACEMENT_GUIDE_ITEM_LEVEL_IMAGE}
                alt="Packing instructions placement at item level in the packing screen"
                className="mx-auto block w-full max-w-full rounded-md border border-gray-200 bg-white"
                loading="lazy"
                decoding="async"
              />
            </div>
          </TabsContent>
          <TabsContent value="shipment" className="m-0 min-h-0 flex-1 overflow-y-auto focus-visible:outline-none">
            <div className="bg-[#FAFAFA] px-4 py-4">
              <img
                src={PLACEMENT_GUIDE_SHIPMENT_LEVEL_IMAGE}
                alt="Packing instructions placement at shipment level in the packing screen"
                className="mx-auto block w-full max-w-full rounded-md border border-gray-200 bg-white"
                loading="lazy"
                decoding="async"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
