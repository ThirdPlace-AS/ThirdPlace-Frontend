// Kept apart from utils.ts so the base primitives do not load tailwind-merge.
/**
 * Caches a cva function per prop combination. cva walks its variant tables
 * on every call; the base primitives (Text above all) render thousands of
 * times, so each combination is built once and then looked up.
 */
export function memoVariants<P extends object>(
  fn: (props: P) => string,
): (props: P) => string {
  const cache = new Map<string, string>();
  return (props) => {
    let key = "";
    for (const k in props) key += `${k}=${String(props[k])};`;
    let out = cache.get(key);
    if (out === undefined) {
      out = fn(props);
      cache.set(key, out);
    }
    return out;
  };
}
