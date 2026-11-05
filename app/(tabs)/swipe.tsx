import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import { SwipeDeck } from "@/components/swipe/SwipeDeck";

// Swipe surface (PDF 7-8) — a Tinder-style card deck over MOCK experience
// fixtures. Left = Hopp over, right = Bli med, up = Lagre. Fixtures only; no
// scoring, interest registration, group matching or GPS join exists
// (BLOCKED_CONTRACT_GAP). All actions are local demo state. The deck is full-
// bleed (photo under the status bar, above the tab bar); its own filter bar and
// action row handle the safe-area insets, so no page header here.
export default function SwipeScreen() {
  return (
    <View className="flex-1 bg-ink">
      {/* Light status-bar content (time, battery, signal) so the native bar stays
          clearly legible over the dark full-bleed card — the root default is
          "dark", invisible here. */}
      <StatusBar style="light" />
      <SwipeDeck />
    </View>
  );
}
