import type { Href } from "expo-router";

// Where sign-in returns to (founder 2026-11-19 Q1: a guest's personal action
// opens sign-in, "then returns to the same spot"). The root layout records the
// screen in front (`RouteTracker`), the map records the detail it has open,
// and `SignInPrompt` keeps the spot when the guest picks Logg inn / Opprett
// konto. The step that starts the session (login, the code, onboarding)
// lands there instead of the map. Memory only; logout and "Fortsett som
// gjest" forget it. BLOCKED_CONTRACT_GAP: no auth backend.

type MapTarget = { kind: string; id: string };

let current: { pathname: string; params: Record<string, unknown> } = {
  pathname: "/map",
  params: {},
};
let mapTarget: MapTarget | null = null;
let pending: string | null = null;

/** Root layout: the route in front, with its search params. */
export function setCurrentRoute(
  pathname: string,
  params: Record<string, unknown>,
) {
  current = { pathname, params };
}

/** Map: the detail sheet's root (null when closed). */
export function setMapTarget(target: MapTarget | null) {
  mapTarget = target;
}

// Screens a sign-in must never land back on: the sign-in and sign-up steps
// themselves and the system screens.
const NO_RETURN = [
  "/login",
  "/register",
  "/verify-code",
  "/onboarding",
  "/business-onboarding",
  "/welcome",
  "/forgot-password",
  "/state",
  "/_sandbox",
];

/**
 * The href for a spot. A dynamic segment's param ("/experience/e1" has
 * id=e1) is already in the path, so only the other params become the query.
 * On the map the open detail is what matters: `/map?focus=<kind>:<id>`
 * reopens it (places and experiences, the kinds the map's focus link
 * takes); the map's own one-shot params are not replayed.
 */
export function returnHrefFor(
  pathname: string,
  params: Record<string, unknown>,
  map: MapTarget | null,
  stamp: number = Date.now(),
): string {
  if (NO_RETURN.some((p) => pathname === p || pathname.startsWith(`${p}/`)))
    return "/map";
  if (pathname === "/" || pathname === "/map") {
    if (map && (map.kind === "place" || map.kind === "experience"))
      return `/map?focus=${map.kind}:${encodeURIComponent(map.id)}&at=${stamp}`;
    return "/map";
  }
  const segments = new Set(
    pathname.split("/").filter(Boolean).map(decodeURIComponent),
  );
  const query = Object.entries(params)
    .filter(([, v]) => typeof v === "string" && v !== "" && !segments.has(v))
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`,
    )
    .join("&");
  return query ? `${pathname}?${query}` : pathname;
}

/** SignInPrompt: keep the spot the guest is leaving. */
export function rememberSignInReturn(href?: string) {
  pending = href ?? returnHrefFor(current.pathname, current.params, mapTarget);
}

/** The step that starts the session: where to land (once). */
export function takeSignInReturn(): Href {
  const href = pending ?? "/map";
  pending = null;
  return href as Href;
}

/** Logout / "Fortsett som gjest": no spot to return to. */
export function forgetSignInReturn() {
  pending = null;
}
