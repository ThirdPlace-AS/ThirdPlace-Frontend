import { Redirect } from "expo-router";

// Entry point → auth welcome. No session logic yet (no backend); the shell is
// visual-only with static fixtures.
export default function Index() {
  return <Redirect href="/welcome" />;
}
