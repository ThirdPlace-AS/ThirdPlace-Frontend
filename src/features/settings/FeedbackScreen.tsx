import { type Href, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { showToast } from "@/components/Toast";
import { Chip, FormPage, Text } from "@/components/ui";
import { confirmToast } from "@/copy";
import { goBackOr } from "@/lib/navigation";

const KINDS = ["Forslag", "Noe virker ikke", "Ros"] as const;

// Send tilbakemelding (Phase 18, screen benchmark: in-app feedback that knows
// where it came from, as Linear and Notion do). Reached from Hjelp og støtte;
// `?from=<screen>` names the screen a later entry point comes from. What it
// is about is optional, the text is not.
// BLOCKED_CONTRACT_GAP: no feedback backend; sending confirms in product voice.
export default function FeedbackScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [kind, setKind] = useState<(typeof KINDS)[number] | null>(null);
  const [text, setText] = useState("");
  const ok = text.trim().length > 0;
  return (
    <FormPage
      title="Send tilbakemelding"
      footer={
        <Button
          label="Send"
          variant="ink"
          disabled={!ok}
          onPress={() => {
            goBackOr("/settings/help" as Href);
            showToast(confirmToast.feedbackSent);
          }}
        />
      }
    >
      {from ? (
        <Text variant="caption" tone="muted">
          Fra: {from}
        </Text>
      ) : null}
      <View className="gap-2">
        <Text variant="label" weight="semibold">
          Hva gjelder det?
        </Text>
        <View
          className="flex-row flex-wrap gap-2"
          accessibilityRole="radiogroup"
        >
          {KINDS.map((k) => (
            <Chip
              key={k}
              label={k}
              role="radio"
              selected={kind === k}
              onPress={() => setKind((cur) => (cur === k ? null : k))}
            />
          ))}
        </View>
      </View>
      <Input
        label="Tilbakemelding"
        placeholder="Skriv det du vil vi skal vite"
        multiline
        value={text}
        onChangeText={setText}
      />
    </FormPage>
  );
}
