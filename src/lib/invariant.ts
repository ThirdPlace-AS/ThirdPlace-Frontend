/**
 * Throws when `condition` is falsy. Generic runtime guard — no product
 * semantics. Narrows the type for the caller when it returns.
 */
export function invariant(
  condition: unknown,
  message = "Invariant violation",
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
