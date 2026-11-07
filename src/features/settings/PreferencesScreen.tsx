// Preferanser (PDF p13): the onboarding's "Dine preferanser" plus
// Gruppestørrelse, one single-choice row each. Lagre keeps them in the shared
// in-memory store (src/lib/preferences.ts) and goes back. Left out from the
// PDF: "Endringer oppdaterer anbefalingene dine." and "Score beregnes på nytt
// når du lagrer": how preferences feed recommendations is a ranking rule that
// is not specified (BLOCKED_NOT_V22_CERTIFIED).
import { type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { showToast } from "@/components/Toast";
import { ChipGroup, FormPage, Text } from "@/components/ui";
import { confirmToast } from "@/copy";
import { goBackOr } from "@/lib/navigation";
import {
  PREFERENCE_ROWS,
  setPreferences,
  usePreferences,
} from "@/lib/preferences";

export default function PreferencesScreen() {
  const saved = usePreferences();
  const [draft, setDraft] = useState<Record<string, string>>(() => ({
    ...saved,
  }));

  return (
    <FormPage
      title="Preferanser"
      footer={
        <Button
          label="Lagre"
          variant="ink"
          onPress={() => {
            setPreferences(draft);
            goBackOr("/settings" as Href);
            showToast(confirmToast.preferencesSaved);
          }}
        />
      }
    >
      {PREFERENCE_ROWS.map((row) => (
        <View key={row.label} className="gap-2">
          <Text variant="label" weight="semibold">
            {row.label}
          </Text>
          <ChipGroup
            label={row.label}
            options={row.options}
            value={draft[row.label] ?? null}
            onChange={(o) =>
              setDraft((d) => ({
                ...d,
                [row.label]: d[row.label] === o ? "" : o,
              }))
            }
          />
        </View>
      ))}
    </FormPage>
  );
}
