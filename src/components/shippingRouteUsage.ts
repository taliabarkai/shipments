import { ShippingRoute } from './ShippingRoutesTable';

/**
 * Usage limits for the "preferred" (Priority) route classification.
 *
 * A route with `usageLimit === null` is unlimited — the behaviour that existed
 * before this field, unchanged. Once `usageCount` reaches `usageLimit`, the
 * route loses its preferred flag: it stays Active and remains selectable on its
 * normal merits (country, value, cost, service level), it just no longer wins
 * ties against other qualifying routes.
 */

/** A usage limit of 0 is legal — it means "never preferred". Negatives are not. */
export const USAGE_LIMIT_MIN = 0;

/**
 * Fraction of the limit at which the table's progress bar turns amber, so a
 * route about to lose preferred status is visible while scanning.
 */
export const USAGE_WARNING_THRESHOLD = 0.8;

/** Only the two usage fields, so callers can pass form drafts as well as saved routes. */
export type RouteUsage = { usageLimit: number | null; usageCount: number };

export function isUnlimited(usage: Pick<RouteUsage, 'usageLimit'>): boolean {
  return usage.usageLimit === null || usage.usageLimit === undefined;
}

/**
 * True when the route has used up its allowance and must not be treated as
 * preferred. Uses `>=` so a count that already sits past a newly lowered limit
 * counts as reached, not just an exact hit.
 */
export function hasReachedUsageLimit(usage: RouteUsage): boolean {
  if (isUnlimited(usage)) return false;
  return usage.usageCount >= (usage.usageLimit as number);
}

/** 0–100 for the progress indicator. Unlimited routes have no meaningful ratio. */
export function usagePercent(usage: RouteUsage): number | null {
  if (isUnlimited(usage)) return null;
  const limit = usage.usageLimit as number;
  if (limit <= 0) return 100;
  return Math.min(100, Math.round((usage.usageCount / limit) * 100));
}

export type UsageLimitParse = { value: number | null; error: string | null };

/**
 * Parses the "Usage limit" form field. Blank means unlimited, which is valid.
 * Rejects negatives, decimals and anything non-numeric.
 */
export function parseUsageLimit(raw: string): UsageLimitParse {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, error: null };
  if (!/^-?\d+$/.test(trimmed)) return { value: null, error: 'Whole number only.' };
  const n = Number(trimmed);
  if (!Number.isSafeInteger(n)) return { value: null, error: 'Whole number only.' };
  if (n < USAGE_LIMIT_MIN) return { value: null, error: `Must be ${USAGE_LIMIT_MIN} or more.` };
  return { value: n, error: null };
}

/** Renders a saved limit back into the form field. `null` → blank (unlimited). */
export function formatUsageLimit(usageLimit: number | null | undefined): string {
  return usageLimit === null || usageLimit === undefined ? '' : String(usageLimit);
}

/** True once usage is close enough to the limit to warrant a warning colour. */
export function isUsageWarning(usage: RouteUsage): boolean {
  const percent = usagePercent(usage);
  return percent !== null && percent >= USAGE_WARNING_THRESHOLD * 100;
}

export type PreferredResolution = {
  priority: boolean;
  /**
   * True only when the usage limit is what removed preferred status, so the
   * table can distinguish an auto-dropped route from one that was never
   * preferred. Recorded rather than inferred: inferring it from
   * `usageCount >= usageLimit` relies on the limit always being nulled when
   * priority is off, which is a single-caller invariant a future bulk edit or
   * import could break silently.
   */
  preferredClearedByLimit: boolean;
};

/**
 * The single place that decides whether a route may keep its preferred flag.
 * Used both by the automatic path (a shipment was packed) and the admin path
 * (the limit was edited on save), so the two can never disagree.
 */
export function resolvePreferred(
  requestedPriority: boolean,
  usage: RouteUsage,
): PreferredResolution {
  // Switching Priority off by hand is a deliberate choice, not a limit clear.
  if (!requestedPriority) return { priority: false, preferredClearedByLimit: false };
  if (hasReachedUsageLimit(usage)) return { priority: false, preferredClearedByLimit: true };
  // Re-enabling within a raised limit also retires any earlier limit drop.
  return { priority: true, preferredClearedByLimit: false };
}

/**
 * Records one packed shipment against `routeId` and clears `priority` if that
 * increment reached the limit. No-ops when the shipment has no route.
 *
 * NOTE ON ATOMICITY: this is a read-modify-write because the prototype's routes
 * live in React state. Against a real database the increment and the priority
 * check MUST be one statement so two packing events near the limit cannot lose
 * an increment or leave `priority` set past the limit:
 *
 *   UPDATE shipping_routes
 *      SET usage_count = usage_count + 1,
 *          priority = CASE
 *            WHEN usage_limit IS NOT NULL AND usage_count + 1 >= usage_limit
 *            THEN false ELSE priority END
 *    WHERE id = $1
 *   RETURNING usage_count, usage_limit, priority;
 *
 * Callers must invoke this from the packing/fulfilment event itself — never
 * from route selection or route assignment.
 */
export function recordRoutePacked(
  routes: ShippingRoute[],
  routeId: string | null | undefined,
): ShippingRoute[] {
  if (!routeId) return routes;
  let matched = false;
  const next = routes.map((route) => {
    if (route.id !== routeId) return route;
    matched = true;
    const usageCount = route.usageCount + 1;
    const reached = hasReachedUsageLimit({ usageLimit: route.usageLimit, usageCount });
    // Only the transition sets the flag. A route already dropped by its limit
    // keeps both the flag and its climbing count — usageCount means "shipments
    // packed on this route", so it does not freeze at the limit.
    if (route.priority && reached) {
      return { ...route, usageCount, priority: false, preferredClearedByLimit: true };
    }
    return { ...route, usageCount };
  });
  // Preserve identity when the route is unknown so callers don't re-render for nothing.
  return matched ? next : routes;
}

/**
 * True only for a *transition* into Packed. Guards against double-counting when
 * an already-packed shipment is edited and re-saved, and means cancelling or
 * reassigning a shipment never increments.
 */
export function isPackingTransition(
  previousStatus: string | null | undefined,
  nextStatus: string | null | undefined,
): boolean {
  return nextStatus === 'Packed' && previousStatus !== 'Packed';
}

/**
 * How the table's Priority cell should read for a route. Keeping this a pure
 * descriptor keeps the four states in one place instead of spread across JSX
 * conditionals, and makes the cell a straight render of the result.
 */
export type RoutePriorityDisplay =
  /** Preferred with a cap: show "742/1000" and a bar. */
  | { kind: 'preferred-limited'; usageCount: number; usageLimit: number; percent: number; warning: boolean }
  /** Preferred, uncapped: show "No limit", no bar. */
  | { kind: 'preferred-unlimited' }
  /** Auto-dropped on reaching its cap: show a muted "Limit reached 1000/1000". */
  | { kind: 'limit-reached'; usageCount: number; usageLimit: number }
  /** Never preferred, or switched off by hand: bare "No", unchanged from before. */
  | { kind: 'not-preferred' };

export function describeRoutePriority(
  route: Pick<ShippingRoute, 'priority' | 'usageLimit' | 'usageCount' | 'preferredClearedByLimit'>,
): RoutePriorityDisplay {
  const { priority, usageCount } = route;
  const usageLimit = route.usageLimit ?? null;

  if (priority) {
    if (usageLimit === null) return { kind: 'preferred-unlimited' };
    return {
      kind: 'preferred-limited',
      usageCount,
      usageLimit,
      percent: usagePercent({ usageCount, usageLimit }) ?? 0,
      warning: isUsageWarning({ usageCount, usageLimit }),
    };
  }

  // The flag is authoritative. Rows that predate it simply read as "No", which
  // is the quiet default — better than guessing and mislabelling a route that
  // was never preferred.
  if (route.preferredClearedByLimit && usageLimit !== null) {
    return { kind: 'limit-reached', usageCount, usageLimit };
  }
  return { kind: 'not-preferred' };
}

/**
 * Warning shown in the panel *before* saving, when the entered limit would
 * strip preferred status. Returns null when there's nothing to warn about.
 */
export function usageLimitWarning(
  priority: boolean,
  usageLimit: number | null,
  usageCount: number,
): string | null {
  if (!priority || usageLimit === null) return null;
  if (usageCount < usageLimit) return null;
  return `Usage limit is at or below the current usage count (${usageCount}). Saving will remove this route's preferred status.`;
}
