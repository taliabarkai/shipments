import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceUrl?: string;
}

export default function InvoiceDialog({ isOpen, onClose, invoiceUrl }: InvoiceDialogProps) {
  // Default invoice image URL - you can replace this with actual invoice data
  const defaultInvoiceUrl = 'https://images.unsplash.com/photo-1554224311-beee460c201f?w=500&q=80';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0" aria-describedby={undefined}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <DialogTitle className="text-xl font-['Roboto'] text-[rgba(0,0,0,0.87)]">
            Invoice
          </DialogTitle>
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex flex-col items-center gap-4">
          {/* Invoice Image/Preview */}
          <div className="w-full border border-gray-200 rounded overflow-hidden">
            <img
              src={invoiceUrl || defaultInvoiceUrl}
              alt="Invoice Preview"
              className="w-full h-auto"
            />
          </div>

          {/* Download Link */}
          <a
            href={invoiceUrl || defaultInvoiceUrl}
            download="invoice.pdf"
            className="text-[#1976d2] hover:text-[#1565c0] font-['Roboto'] text-sm underline cursor-pointer"
          >
            Download Invoice
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}