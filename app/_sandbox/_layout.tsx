import { Redirect, Stack } from "expo-router";

// Dev-only screens (thirdplace://_sandbox/…): a release build sends these
// links to the map instead.
export default function SandboxLayout() {
  if (!__DEV__) return <Redirect href="/map" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
