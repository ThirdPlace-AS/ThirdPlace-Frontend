import { router, type Href } from "expo-router";

// Session-boundary navigation (logout, login, finishing onboarding). A plain
// router.replace only swaps the top screen, so hardware back could return to a
// signed-in screen underneath. Pop the root stack first, then replace.
export function resetTo(href: Href) {
  if (router.canDismiss()) router.dismissAll();
  router.replace(href);
}

/** Back when there is history; a page opened by a cold deep link has none,
 *  so it goes to `fallback` instead of doing nothing. */
export function goBackOr(fallback: Href = "/map") {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
