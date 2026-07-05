import type { ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

/** A single item inside a bulk action's dropdown menu. */
export interface BulkActionMenuItem {
  key: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  /** Tooltip shown when the item is disabled (e.g. "No documents in selection"). */
  disabledTooltip?: string;
  /** Render a hairline divider above this item. */
  separatorBefore?: boolean;
}

/**
 * A single bulk action rendered on the right of the bar. Kept as an open-ended
 * array/slot so further actions (cancel, print labels, status change, …) can be
 * added later without touching this component. When `menuItems` is supplied, the
 * action renders as a dropdown trigger instead of a plain button.
 */
export interface BulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
  menuItems?: BulkActionMenuItem[];
}

interface BulkActionBarProps {
  /** Number of selected rows (already resolved for the current mode). */
  selectedCount: number;
  /** Total rows matching the current filters. */
  total: number;
  /** Whether every matching row is selected (all-matching mode). */
  allSelected: boolean;
  /** Show the "Select all {total}" affordance (page fully selected, more rows exist). */
  canSelectAllMatching: boolean;
  onSelectAllMatching: () => void;
  onClear: () => void;
  actions: BulkAction[];
}

/** Leading-icon + title + description layout shared by every menu item. */
function MenuItemContent({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>}
      <div className="flex flex-col">
        <span className="text-[13px] font-semibold leading-5">{title}</span>
        {description && (
          <span className="text-xs leading-4 text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  );
}

/** An action that opens a dropdown of export options. */
function BulkActionMenu({ action }: { action: BulkAction }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={action.variant ?? 'default'}
          className={action.className}
          disabled={action.disabled || action.loading}
        >
          {action.icon}
          {action.label}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {action.menuItems!.map((item) => (
          <div key={item.key}>
            {item.separatorBefore && <DropdownMenuSeparator />}
            {item.disabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    role="menuitem"
                    aria-disabled
                    className="flex cursor-not-allowed select-none rounded-sm px-2 py-2 opacity-50"
                  >
                    <MenuItemContent
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                    />
                  </div>
                </TooltipTrigger>
                {item.disabledTooltip && (
                  <TooltipContent side="left">
                    <p>{item.disabledTooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer px-2 py-2"
                onSelect={item.onSelect}
              >
                <MenuItemContent
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                />
              </DropdownMenuItem>
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Presentational bulk-action bar. It owns no selection state — it receives the
 * derived count/mode and callbacks. Wrapped in a live region so screen readers
 * announce selection-count changes.
 */
export default function BulkActionBar({
  selectedCount,
  total,
  allSelected,
  canSelectAllMatching,
  onSelectAllMatching,
  onClear,
  actions,
}: BulkActionBarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-100 p-4 text-gray-900 transition-colors"
    >
      <span className="flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#1976d2] text-sm font-medium tabular-nums text-white">
          {allSelected ? total : selectedCount}
        </span>
        <span className="text-sm font-medium">
          {allSelected ? 'selected' : 'selected on this page'}
        </span>
      </span>

      {canSelectAllMatching && (
        <>
          <span className="h-5 w-px self-center bg-gray-300" aria-hidden />
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-sm text-[#1976d2]"
            onClick={onSelectAllMatching}
          >
            Select all {total} shipments
          </Button>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        {actions.map((action) =>
          action.menuItems ? (
            <BulkActionMenu key={action.key} action={action} />
          ) : (
            <Button
              key={action.key}
              variant={action.variant ?? 'default'}
              className={action.className}
              disabled={action.disabled || action.loading}
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </Button>
          ),
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              aria-label="Clear selection"
            >
              <X className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Clear</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
