import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { SignInPrompt } from "@/components/SignInPrompt";
import { colors } from "@/theme";

import { useGuestMode } from "../hooks/useGuestMode";
import { useMapSaved } from "../hooks/useMapSaved";

// Save / Share action row shared by detail content. Save toggles the in-memory
// demo store (persistence CONTRACT-BLOCKED CB-5) — or, for a guest, prompts
// sign-in. Share is a DEMO no-op — no real share sheet is invoked.
export function DetailActions({ markerId }: { markerId: string }) {
  const { isSaved, toggle } = useMapSaved();
  const { isGuest } = useGuestMode();
  const [promptOpen, setPromptOpen] = useState(false);
  const saved = isSaved(markerId);

  const onSave = () => {
    if (isGuest) setPromptOpen(true);
    else toggle(markerId);
  };

  return (
    <>
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "Fjern fra lagret" : "Lagre"}
          accessibilityState={{ selected: saved }}
          onPress={onSave}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-md border px-3 py-2.5 ${
            saved ? "border-ember bg-ember/10" : "border-line bg-surface"
          }`}
        >
          <Ionicons
            name={saved ? "heart" : "heart-outline"}
            size={18}
            color={saved ? colors.ember : colors.ink}
          />
          <Text
            className={`text-sm font-semibold ${saved ? "text-ember" : "text-ink"}`}
          >
            {saved ? "Lagret" : "Lagre"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Del (demo)"
          onPress={() => {
            /* DEMO — no real share sheet. */
          }}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5"
        >
          <Ionicons name="share-outline" size={18} color={colors.ink} />
          <Text className="text-sm font-semibold text-ink">Del</Text>
        </Pressable>
      </View>
      <SignInPrompt
        visible={promptOpen}
        onClose={() => setPromptOpen(false)}
        action="lagre"
      />
    </>
  );
}
