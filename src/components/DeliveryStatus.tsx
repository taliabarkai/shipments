/**
 * Delivery status indicator: a small dot + label, no pill background. Shared by
 * the shipments table cell and the details drawer so both stay identical — only
 * the font size adapts to context (pass a text-size class via `className`).
 *
 * Red for "Late", green for "On time".
 */
export function DeliveryStatus({ isLate, className }: { isLate: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[7px] ${className ?? ''}`}>
      <span
        aria-hidden
        className={`size-[7px] shrink-0 rounded-full ${isLate ? 'bg-[#A32D2D]' : 'bg-green-600'}`}
      />
      {isLate ? (
        <span className="font-medium text-[#A32D2D]">Late</span>
      ) : (
        <span className="font-normal text-green-700">On time</span>
      )}
    </span>
  );
}
