// Drag to reorder (P9): pure helpers shared by the sortable primitives and the
// stores that keep an order (pinned chats, profile interests).

/** `list` with the item at `from` moved to `to` (both clamped to the list). */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const out = [...list];
  if (from < 0 || from >= out.length) return out;
  const target = Math.max(0, Math.min(out.length - 1, to));
  const [item] = out.splice(from, 1);
  out.splice(target, 0, item as T);
  return out;
}

/**
 * `full` after the user reordered only the items they could see: the shown
 * items take their new order in the slots they held, the hidden ones (a pinned
 * chat filtered out by search, archived …) keep their places.
 */
export function reorderSubset<T>(
  full: readonly T[],
  shownInNewOrder: readonly T[],
): T[] {
  const shown = new Set(shownInNewOrder);
  const queue = [...shownInNewOrder];
  return full.map((x) => (shown.has(x) ? (queue.shift() as T) : x));
}
