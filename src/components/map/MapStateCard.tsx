// The map's floating state cards: the empty overlay (no results) and the
// card that holds it and the error state. Taps outside the card still reach
// the map.
import type React from "react";
import { View } from "react-native";

import { EmptyState } from "@/components/ui";
import { useElevation } from "@/theme";

import type { DiscoveryMode } from "./types/mapPresentation";

export function MapStateCard({ children }: { children: React.ReactNode }) {
  const elev = useElevation();
  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-0 items-center justify-center p-gutter"
    >
      <View className="w-full max-w-sm rounded-md bg-surface" style={elev.e2}>
        {children}
      </View>
    </View>
  );
}

// No results for the current mode and filters. Lagret ignores filters, so an
// empty Lagret says nothing is saved (the Lagret page's copy) and offers no
// reset (0465); every other mode offers Nullstill.
export function MapEmptyCard({
  mode,
  message,
  onReset,
}: {
  mode: DiscoveryMode;
  message: string;
  onReset: () => void;
}) {
  return (
    <MapStateCard>
      {mode === "saved" ? (
        <EmptyState
          fill={false}
          icon="bookmark-outline"
          title="Ingenting lagret – ennå"
          message="Lagre stedene og opplevelsene du ikke vil gå glipp av."
        />
      ) : (
        <EmptyState
          fill={false}
          icon="search"
          title="Ingen treff"
          message={message}
          actionLabel="Nullstill"
          onAction={onReset}
        />
      )}
    </MapStateCard>
  );
}
