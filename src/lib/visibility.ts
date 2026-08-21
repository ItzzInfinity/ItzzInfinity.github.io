import { SectionKey } from "@/lib/sections";

/**
 * Manual-override hide tokens and runtime item ordering for the Download page.
 *
 * The Advanced panel can hide three grains of content, and all three travel in
 * the same flat id list the renderers already receive as `hiddenBulletIds`:
 *
 *   - a bullet, by its own id             — emitted by auto-fit and by manual mode
 *   - a whole section, as `section:<key>` — auto-fit (FSD rule 10) and manual mode
 *   - a single entry, as `item:<id>`      — manual mode only
 *
 * Bullet ids and `section:` tokens are interpreted *inside* both renderers.
 * `item:` tokens are deliberately NOT: they are applied upstream by
 * `visibleItems`, which drops whole entries from the arrays before either
 * renderer sees them. That keeps the two renderers from having to grow a
 * per-section filtering rule each — the place they have historically drifted
 * apart — and makes a hidden entry impossible to render in one but not the
 * other.
 */
export const ITEM_HIDE_PREFIX = "item:";

export function itemHideId(id: string): string {
  return `${ITEM_HIDE_PREFIX}${id}`;
}

export function isItemHideId(token: string): boolean {
  return token.startsWith(ITEM_HIDE_PREFIX);
}

/** Drops entries whose `item:<id>` token is present in `hidden`. */
export function visibleItems<T extends { id: string }>(
  items: T[],
  hidden: ReadonlySet<string>
): T[] {
  if (hidden.size === 0) return items;
  return items.filter((i) => !hidden.has(itemHideId(i.id)));
}

/**
 * Reorders `items` to match `order` (a list of ids). Ids missing from `order`
 * — a newly seeded entry, or one from another domain — keep their relative
 * position at the end rather than disappearing, so a stale order can never
 * drop content.
 */
export function applyItemOrder<T extends { id: string }>(
  items: T[],
  order?: string[]
): T[] {
  if (!order || order.length === 0) return items;
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...items].sort(
    (a, b) =>
      (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER)
  );
}

/**
 * Sections whose individual entries can be checked/unchecked and dragged in
 * the Advanced panel. `summary` is excluded — it is one paragraph, so the
 * `section:summary` toggle already covers it.
 */
export const ITEMIZED_SECTIONS = [
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "awards",
  "languages",
  "strengths",
  "hobbies",
] as const;

export type ItemizedSection = (typeof ITEMIZED_SECTIONS)[number];

export function isItemized(key: SectionKey): key is ItemizedSection {
  return (ITEMIZED_SECTIONS as readonly string[]).includes(key);
}

/** Runtime-only per-section item order, keyed by section. */
export type ItemOrder = Partial<Record<ItemizedSection, string[]>>;
