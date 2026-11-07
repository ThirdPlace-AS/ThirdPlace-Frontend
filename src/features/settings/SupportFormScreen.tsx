import { type Href, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { showToast } from "@/components/Toast";
import { FormPage, Icon, Text } from "@/components/ui";
import { confirmToast } from "@/copy";
import { experienceById } from "@/fixtures";
import { goBackOr } from "@/lib/navigation";

// Opprett supportsak (Phase 18, from the screen benchmark: Uber's and
// Amazon's help that starts from the trip or the order). Reached from Hjelp
// og støtte, or with ?about=<experience id> from a plan row or the
// experience page, which fills in what the case is about.
// BLOCKED_CONTRACT_GAP: no support backend; sending confirms in product voice.
export default function SupportFormScreen() {
  const { about } = useLocalSearchParams<{ about?: string }>();
  const exp = about ? experienceById(about) : undefined;
  const [subject, setSubject] = useState(exp ? exp.title : "");
  const [text, setText] = useState("");
  const ok = subject.trim().length > 0 && text.trim().length > 0;
  return (
    <FormPage
      title="Opprett supportsak"
      footer={
        <Button
          label="Send"
          variant="ink"
          disabled={!ok}
          onPress={() => {
            goBackOr("/settings/help" as Href);
            showToast(confirmToast.supportCreated);
          }}
        />
      }
    >
      {exp ? (
        <View className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3">
          <Icon name="tp-experience" size="md" tone="ink" />
          <View className="flex-1 gap-0.5">
            <Text variant="caption" tone="muted">
              Gjelder
            </Text>
            <Text variant="label" weight="semibold" numberOfLines={2}>
              {exp.title} · {exp.when}
            </Text>
          </View>
        </View>
      ) : null}
      <Input
        label="Hva gjelder det?"
        placeholder="En opplevelse, et sted eller kontoen din"
        value={subject}
        onChangeText={setSubject}
      />
      <Input
        label="Beskriv saken"
        placeholder="Skriv hva som har skjedd"
        multiline
        value={text}
        onChangeText={setText}
      />
    </FormPage>
  );
}
