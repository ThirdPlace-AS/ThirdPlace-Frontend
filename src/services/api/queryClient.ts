import { QueryClient } from "@tanstack/react-query";

// Shared TanStack Query client.
//
// NOTE (Phase 0 / non-contract): there are deliberately NO endpoints,
// query keys, or fetchers defined here. The public API contract is
// BLOCKED_CONTRACT_GAP until the authoritative V2.2 spec is imported.
// This file only establishes the client shell + sane defaults.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
