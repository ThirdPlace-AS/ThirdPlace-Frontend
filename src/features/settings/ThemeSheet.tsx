import { View } from "react-native";

import { Pressable, RadioMark, Sheet, Text } from "@/components/ui";
import {
  SCHEME_PREFERENCES,
  setSchemePreference,
  useSchemePreference,
  type SchemePreference,
} from "@/theme";

// Utseende (user request 2026-11-24; not in the design PDF): follow the
// phone, or keep the app light or dark. A device choice, kept on the phone
// (src/lib/deviceSettings.ts). A tap applies at once and the sheet stays
// open, as Kartlag's choices do, so the new look shows behind it.
export const SCHEME_LABEL: Record<SchemePreference, string> = {
  system: "System",
  auto: "Auto",
  light: "Lys",
  dark: "Mørk",
};

// «Auto» (user 2026-11-25) turns with the map's own auto style: dark while
// the map shows Skumring or Natt (17–05; Skumring from 2026-11-26), light
// otherwise.
const SCHEME_HINT: Partial<Record<SchemePreference, string>> = {
  system: "Følger telefonen",
  auto: "Mørk fra skumring, som kartet",
};

export function ThemeSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const current = useSchemePreference();
  return (
    <Sheet visible={visible} onClose={onClose} title="Utseende">
      <View accessibilityRole="radiogroup">
        {SCHEME_PREFERENCES.map((p) => {
          const on = p === current;
          const hint = SCHEME_HINT[p];
          return (
            <Pressable
              key={p}
              accessibilityRole="radio"
              accessibilityLabel={SCHEME_LABEL[p]}
              accessibilityState={{ checked: on }}
              onPress={() => setSchemePreference(p)}
              contentClassName="flex-row items-center justify-between border-b border-line py-4"
            >
              <View className="gap-1">
                <Text variant="body" weight={on ? "semibold" : "regular"}>
                  {SCHEME_LABEL[p]}
                </Text>
                {hint ? (
                  <Text variant="caption" tone="muted">
                    {hint}
                  </Text>
                ) : null}
              </View>
              <RadioMark checked={on} />
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
