import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * Row-selection state for a paginated table, encapsulating both selection modes:
 *
 *  - "explicit" mode (default): `selected` holds the ids the user checked. Selection
 *    persists across pagination because it is keyed by id, not row index.
 *  - "all-matching" mode (`allSelected === true`): every row matching the current
 *    filters is considered selected, and `excluded` holds the ids the user
 *    subsequently unchecked.
 *
 * The hook is deliberately free of table/UI concerns so it can be unit-tested in
 * isolation. Callers pass the ids of every row matching the current filters
 * (`allMatchingIds`, in table order); the hook derives counts and resolves the
 * concrete selected ids from it.
 */
export interface RowSelection {
  /** True when in all-matching mode (all rows matching current filters, minus exclusions). */
  allSelected: boolean;
  /** Number of currently selected rows. */
  selectedCount: number;
  /** Whether any row is selected. */
  isAnySelected: boolean;
  /** Whether a specific row is selected (mode-aware). */
  isSelected: (id: string) => boolean;
  /** Every row on `pageIds` is selected. */
  isPageFullySelected: (pageIds: string[]) => boolean;
  /** Some — but not all — rows on `pageIds` are selected. */
  isPagePartiallySelected: (pageIds: string[]) => boolean;
  /** Toggle a single row. */
  toggle: (id: string) => void;
  /** Select or deselect every row on the current page. */
  setPageSelected: (pageIds: string[], selected: boolean) => void;
  /** Switch to all-matching mode. */
  selectAllMatching: () => void;
  /** Exit all-matching mode and select exactly the given page's rows. */
  selectPageOnly: (pageIds: string[]) => void;
  /** Clear selection and exit all-matching mode. */
  clear: () => void;
  /** Resolve the selection to concrete ids, in the order of `allMatchingIds`. */
  getSelectedIds: () => string[];
}

export function useRowSelection(allMatchingIds: string[]): RowSelection {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set());
  const [allSelected, setAllSelected] = useState(false);

  // Keep the latest matching ids in a ref so callbacks stay referentially stable.
  const matchingRef = useRef(allMatchingIds);
  matchingRef.current = allMatchingIds;

  const isSelected = useCallback(
    (id: string) => (allSelected ? !excluded.has(id) : selected.has(id)),
    [allSelected, excluded, selected],
  );

  const toggle = useCallback(
    (id: string) => {
      if (allSelected) {
        setExcluded((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
        return;
      }
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [allSelected],
  );

  const setPageSelected = useCallback(
    (pageIds: string[], select: boolean) => {
      if (allSelected) {
        // In all-matching mode, (de)selecting a page adjusts the exclusion set.
        setExcluded((prev) => {
          const next = new Set(prev);
          for (const id of pageIds) {
            if (select) next.delete(id);
            else next.add(id);
          }
          return next;
        });
        return;
      }
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of pageIds) {
          if (select) next.add(id);
          else next.delete(id);
        }
        return next;
      });
    },
    [allSelected],
  );

  const selectAllMatching = useCallback(() => {
    setAllSelected(true);
    setExcluded(new Set());
    setSelected(new Set());
  }, []);

  const selectPageOnly = useCallback((pageIds: string[]) => {
    setAllSelected(false);
    setExcluded(new Set());
    setSelected(new Set(pageIds));
  }, []);

  const clear = useCallback(() => {
    setAllSelected(false);
    setExcluded(new Set());
    setSelected(new Set());
  }, []);

  const getSelectedIds = useCallback(() => {
    const ids = matchingRef.current;
    return allSelected ? ids.filter((id) => !excluded.has(id)) : ids.filter((id) => selected.has(id));
  }, [allSelected, excluded, selected]);

  const selectedCount = useMemo(() => {
    if (allSelected) {
      let count = 0;
      for (const id of allMatchingIds) if (!excluded.has(id)) count += 1;
      return count;
    }
    // Intersect with the matching set so a stale id can never inflate the count.
    let count = 0;
    for (const id of allMatchingIds) if (selected.has(id)) count += 1;
    return count;
  }, [allSelected, excluded, selected, allMatchingIds]);

  const isPageFullySelected = useCallback(
    (pageIds: string[]) => pageIds.length > 0 && pageIds.every((id) => isSelected(id)),
    [isSelected],
  );

  const isPagePartiallySelected = useCallback(
    (pageIds: string[]) => {
      if (pageIds.length === 0) return false;
      const anySelected = pageIds.some((id) => isSelected(id));
      return anySelected && !pageIds.every((id) => isSelected(id));
    },
    [isSelected],
  );

  return {
    allSelected,
    selectedCount,
    isAnySelected: selectedCount > 0,
    isSelected,
    isPageFullySelected,
    isPagePartiallySelected,
    toggle,
    setPageSelected,
    selectAllMatching,
    selectPageOnly,
    clear,
    getSelectedIds,
  };
}
