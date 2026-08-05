import { cn } from './ui/utils';

interface ProgressMeterProps {
  /** Left-hand reading, e.g. "742 / 1,000" or "$120.00 / $500.00". */
  label: React.ReactNode;
  /** 0–100. Callers clamp; this only guards the rendered width. */
  percent: number;
  /**
   * Amber bar and label instead of blue, for usage close enough to the cap that
   * an admin scanning the table should notice it.
   */
  warning?: boolean;
  className?: string;
}

/**
 * Full-width "fraction + percentage over a bar" meter used in table cells —
 * the Spend column on Upgrade/Downgrade Rules and the Priority column on
 * Shipping Routes. Extracted so the two stay visually identical.
 */
export default function ProgressMeter({ label, percent, warning, className }: ProgressMeterProps) {
  const width = Math.max(0, Math.min(100, percent));

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        className={cn(
          'flex items-center justify-between gap-2 text-xs tabular-nums',
          warning ? 'text-amber-700' : 'text-gray-600',
        )}
      >
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn('h-full rounded-full transition-all', warning ? 'bg-amber-500' : 'bg-[#1976d2]')}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
