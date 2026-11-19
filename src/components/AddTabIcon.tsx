import { View } from "react-native";

import { brandGradient } from "@/theme";

// Centre "Legg til" tab (founder 2026-11-08): TikTok's stacked button in our
// colours. An ink face with the plus, an ember layer peeking out on the left
// and the brand gradient's magenta on the right. In dark mode ink is white,
// so the face turns white with a dark plus, as TikTok's does on a dark bar.
// It looks the same whether Legg til is open or not (as on TikTok); the label
// under it turns ember while the tab is open, like the other tabs. Replaces
// the outline / filled plus glyph of 2026-11-07.
export const ADD_TAB_ICON = { w: 40, h: 28, peek: 3 } as const;
const PLUS = { long: 14, bar: 3 } as const;

export function AddTabIcon() {
  const { w, h, peek } = ADD_TAB_ICON;
  return (
    // The tab button carries the label "Legg til"; the drawing is decoration.
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: w + peek * 2, height: h }}
      className="items-center justify-center"
    >
      <View
        className="absolute rounded-sm bg-ember"
        style={{ left: 0, width: w, height: h }}
      />
      <View
        className="absolute rounded-sm"
        style={{
          right: 0,
          width: w,
          height: h,
          backgroundColor: brandGradient[2],
        }}
      />
      <View
        className="items-center justify-center rounded-sm bg-ink"
        style={{ width: w, height: h }}
      >
        {/* A bold plus as on TikTok (two bars; the icon font's is thin). */}
        <View
          className="absolute rounded-full bg-onInk"
          style={{ width: PLUS.long, height: PLUS.bar }}
        />
        <View
          className="absolute rounded-full bg-onInk"
          style={{ width: PLUS.bar, height: PLUS.long }}
        />
      </View>
    </View>
  );
}
