import { Linking, Platform } from "react-native";

// "Veibeskrivelse" (Phase 16, after the section benchmark): hands the
// destination to the phone's maps app, which plans the route. Google Maps URLs
// open the Google Maps app on Android (the browser when it is missing);
// Apple Maps takes the same request on iOS. Only the destination's coordinate
// leaves the app, nothing about the user.

/** The maps link for a route to `coord` ([lng, lat]). */
export function directionsUrl(
  coord: readonly [number, number],
  platform: string = Platform.OS,
): string {
  const [lng, lat] = coord;
  const destination = `${lat},${lng}`;
  return platform === "ios"
    ? `https://maps.apple.com/?daddr=${destination}`
    : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** Opens the route in the maps app; false when nothing could open it. */
export async function openDirections(
  coord: readonly [number, number],
): Promise<boolean> {
  try {
    await Linking.openURL(directionsUrl(coord));
    return true;
  } catch {
    return false;
  }
}
