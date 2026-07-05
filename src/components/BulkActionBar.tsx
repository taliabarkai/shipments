import { Fragment, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Loader2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

/**
 * The current selection, passed to every bulk-menu callback so descriptions and
 * disabled state are computed against the live selection each render.
 */
export interface BulkMenuSelection {
  /** Number of selected rows (mode-aware). */
  count: number;
  /** Total rows matching the current filters. */
  total: number;
  /** Whether every matching row is selected (all-matching mode). */
  allSelected: boolean;
  /** IDs of the selected rows. */
  orderIds: string[];
}

/**
 * One entry in the bulk-actions menu. Adding a new bulk action later means
 * appending one of these to the config array — no changes to the menu's
 * rendering or accessibility logic.
 */
export interface BulkMenuItem {
  key: string;
  icon: ReactNode;
  title: string;
  getDescription: (selection: BulkMenuSelection) => string;
  onSelect: (selection: BulkMenuSelection) => void;
  /** Return `{ disabled: true, reason }` to disable the item with a tooltip. */
  disabled?: (selection: BulkMenuSelection) => { disabled: boolean; reason?: string };
  /** 'direct' = one-click; 'opensFollowUp' = opens a further step (picker/dialog). */
  variant?: 'direct' | 'opensFollowUp';
  /** Render a hairline divider above this item. */
  separatorBefore?: boolean;
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
  /** Exit all-matching mode, keeping only the current page's rows selected. */
  onSelectThisPageOnly: () => void;
  onClear: () => void;
  /** The bulk-actions menu configuration. */
  menuItems: BulkMenuItem[];
  /** Live selection context passed to each menu item's callbacks. */
  menuSelection: BulkMenuSelection;
  /** When true, the trigger shows a spinner and is disabled (a direct action is running). */
  menuLoading?: boolean;
  /** Optional demo toggle rendered in the bar; omit the handler to hide it. */
  simulateLargeExport?: boolean;
  onSimulateLargeExportChange?: (value: boolean) => void;
  /** When set (demo mode), the count badge/labels display this number instead of the real counts. */
  simulatedCount?: number;
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
        <span className="text-[13px] font-medium leading-5">{title}</span>
        {description && (
          <span className="text-xs leading-4 text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  );
}

/** The single "Bulk actions" trigger + its config-driven menu. */
function BulkActionsMenu({
  menuItems,
  menuSelection,
  menuLoading,
}: {
  menuItems: BulkMenuItem[];
  menuSelection: BulkMenuSelection;
  menuLoading?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="bg-[#1976d2] text-white hover:bg-[#1565c0]"
          disabled={menuLoading}
        >
          Bulk actions
          {menuLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {menuItems.map((item) => {
          const disabledState = item.disabled?.(menuSelection) ?? { disabled: false };
          const description = item.getDescription(menuSelection);
          return (
            <Fragment key={item.key}>
              {item.separatorBefore && <DropdownMenuSeparator />}
              {disabledState.disabled ? (
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
                        description={description}
                      />
                    </div>
                  </TooltipTrigger>
                  {disabledState.reason && (
                    <TooltipContent side="left">
                      <p>{disabledState.reason}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer px-2 py-2"
                  onSelect={() => item.onSelect(menuSelection)}
                >
                  <MenuItemContent
                    icon={item.icon}
                    title={item.title}
                    description={description}
                  />
                  {item.variant === 'opensFollowUp' && (
                    <ChevronRight className="ml-auto size-4 self-center text-muted-foreground" />
                  )}
                </DropdownMenuItem>
              )}
            </Fragment>
          );
        })}
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
  onSelectThisPageOnly,
  onClear,
  menuItems,
  menuSelection,
  menuLoading,
  simulateLargeExport,
  onSimulateLargeExportChange,
  simulatedCount,
}: BulkActionBarProps) {
  const displaySelectedCount = simulatedCount ?? selectedCount;
  const displayTotal = simulatedCount ?? total;
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-100 p-4 text-gray-900 transition-colors"
    >
      <span className="flex items-center gap-2">
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#1976d2] px-2 text-sm font-medium tabular-nums text-white">
          {(allSelected ? displayTotal : displaySelectedCount).toLocaleString()}
        </span>
        {allSelected ? (
          <span className="text-sm font-medium text-gray-900">
            All {displayTotal.toLocaleString()} shipments selected
          </span>
        ) : (
          <span className="text-sm font-normal text-gray-600">selected on this page</span>
        )}
      </span>

      {allSelected ? (
        <>
          <span className="h-5 w-px self-center bg-gray-300" aria-hidden />
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-sm text-[#1976d2] underline underline-offset-4"
            onClick={onSelectThisPageOnly}
          >
            Select this page only
          </Button>
        </>
      ) : (
        canSelectAllMatching && (
          <>
            <span className="h-5 w-px self-center bg-gray-300" aria-hidden />
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-sm text-[#1976d2] underline underline-offset-4"
              onClick={onSelectAllMatching}
            >
              Select all {displayTotal.toLocaleString()} shipments
            </Button>
          </>
        )
      )}

      <div className="ml-auto flex items-center gap-3">
        {onSimulateLargeExportChange && (
          <div className="flex items-center gap-2">
            <Switch
              id="simulate-large-export"
              checked={!!simulateLargeExport}
              onCheckedChange={onSimulateLargeExportChange}
            />
            <Label
              htmlFor="simulate-large-export"
              className="cursor-pointer text-xs text-gray-500"
            >
              1000+ docs
            </Label>
          </div>
        )}
        <BulkActionsMenu
          menuItems={menuItems}
          menuSelection={menuSelection}
          menuLoading={menuLoading}
        />
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
