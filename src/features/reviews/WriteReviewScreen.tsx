// Skriv anmeldelse (/review/[kind]/[id]), a form page since Phase 12 H4c:
// stars and a few words, "Send anmeldelse" pinned above the keyboard. It
// goes back and confirms in product voice; nothing is stored
// (BLOCKED_CONTRACT_GAP: no review contract).
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Button } from "@/components/Button";
import { showToast } from "@/components/Toast";
import { FormPage, Icon, Text } from "@/components/ui";
import { confirmToast } from "@/copy";
import { experienceById, placeById } from "@/fixtures";
import { goBackOr } from "@/lib/navigation";
import { useThemeColors } from "@/theme";

export default function WriteReviewScreen() {
  const { kind = "place", id = "" } = useLocalSearchParams<{
    kind?: string;
    id?: string;
  }>();
  const name =
    kind === "experience" ? experienceById(id)?.title : placeById(id)?.name;
  const colors = useThemeColors();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  return (
    <FormPage
      title={`Anmeld ${name ?? (kind === "experience" ? "opplevelsen" : "stedet")}`}
      footer={
        <Button
          label="Send anmeldelse"
          variant="ember"
          disabled={rating === 0}
          onPress={() => {
            goBackOr("/map");
            showToast(confirmToast.reviewSent);
          }}
        />
      }
    >
      <Text variant="label" weight="semibold">
        Hvor fornøyd var du?
      </Text>
      <View className="flex-row gap-1" accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityState={{ checked: n === rating }}
            accessibilityLabel={`${n} stjerner`}
            onPress={() => setRating(n)}
            hitSlop={4}
          >
            <Icon
              name={n <= rating ? "star" : "star-outline"}
              size="xl"
              tone={n <= rating ? "ink" : "muted"}
            />
          </Pressable>
        ))}
      </View>
      <TextInput
        placeholder={
          kind === "experience"
            ? "Skriv noen ord om opplevelsen …"
            : "Skriv noen ord om stedet …"
        }
        placeholderTextColor={colors.muted}
        value={text}
        onChangeText={setText}
        multiline
        className="min-h-32 rounded-md border border-line bg-surface p-3 text-ink font-normal"
        style={{ fontSize: 16 }}
        textAlignVertical="top"
      />
    </FormPage>
  );
}
