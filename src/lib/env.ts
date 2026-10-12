// Runtime environment access.
//
// Reads public config from Expo's EXPO_PUBLIC_* vars (inlined at build time)
// with an expoConfig.extra fallback. No secrets are embedded in the client.
// The API base URL has no routes wired yet (Phase 0 / non-contract).
//
// EXPO_PUBLIC_* must be referenced statically (expo/no-dynamic-env-var) so the
// bundler can inline them.
import Constants from "expo-constants";

function pick(inlined: string | undefined, key: string): string | undefined {
  if (inlined && inlined.length > 0) return inlined;
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const val = extra[key];
  return typeof val === "string" && val.length > 0 ? val : undefined;
}

export const env = {
  /** Base URL of the ThirdPlace backend. No endpoints are consumed yet. */
  apiBaseUrl: pick(
    process.env.EXPO_PUBLIC_API_BASE_URL,
    "EXPO_PUBLIC_API_BASE_URL",
  ),
  supabaseUrl: pick(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    "EXPO_PUBLIC_SUPABASE_URL",
  ),
  supabaseAnonKey: pick(
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  ),
} as const;
