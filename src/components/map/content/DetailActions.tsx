import { useState } from "react";
import { View } from "react-native";
import { Icon, PopIcon, Text, Pressable as UIPressable } from "@/components/ui";
import { ReportSheet, ShareSheet } from "@/components/actions/ActionSheets";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "../hooks/useGuestMode";
import { useMapSaved } from "../hooks/useMapSaved";

// Save / Share / Report action row shared by detail content. Save toggles the
// in-memory store (persistence CONTRACT-BLOCKED CB-5) — or, for a guest,
// prompts sign-in. Del and Rapporter open the PDF p23 sheets, which close
// with a confirmation.
export function DetailActions({
  markerId,
  title,
}: {
  markerId: string;
  title: string;
}) {
  const { isSaved, toggle } = useMapSaved();
  const { isGuest } = useGuestMode();
  const [promptOpen, setPromptOpen] = useState(false);
  const [notice, setNotice] = useState<"share" | "report" | null>(null);
  const saved = isSaved(markerId);

  const onSave = () => {
    if (isGuest) setPromptOpen(true);
    else {
      toggle(markerId);
    }
  };

  return (
    <>
      <View className="flex-row gap-2">
        <UIPressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "Fjern fra lagret" : "Lagre"}
          accessibilityState={{ selected: saved }}
          onPress={onSave}
          className="flex-1"
          contentClassName={`flex-row items-center justify-center gap-2 rounded-md border px-3 py-2.5 ${
            saved ? "border-ember bg-ember/10" : "border-line bg-surface"
          }`}
          pressedScale={0.99}
        >
          <PopIcon
            pop={saved}
            name={saved ? "heart" : "heart-outline"}
            size="md"
            tone={saved ? "ember" : "ink"}
          />
          <Text
            variant="label"
            weight="semibold"
            tone={saved ? "ember" : "ink"}
          >
            {saved ? "Lagret" : "Lagre"}
          </Text>
        </UIPressable>

        <UIPressable
          accessibilityRole="button"
          accessibilityLabel="Del"
          onPress={() => setNotice("share")}
          className="flex-1"
          contentClassName="flex-row items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5"
          pressedScale={0.99}
        >
          <Icon name="share-outline" size="md" tone="ink" />
          <Text variant="label" weight="semibold">
            Del
          </Text>
        </UIPressable>

        <UIPressable
          accessibilityRole="button"
          accessibilityLabel="Rapporter"
          onPress={() => setNotice("report")}
          className="flex-1"
          contentClassName="flex-row items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5"
          pressedScale={0.99}
        >
          <Icon name="flag-outline" size="md" tone="ink" />
          <Text variant="label" weight="semibold">
            Rapporter
          </Text>
        </UIPressable>
      </View>

      {notice === "share" ? (
        <ShareSheet
          title={title}
          slug={markerId.replace(":", "/")}
          onClose={() => setNotice(null)}
        />
      ) : null}
      {notice === "report" ? (
        <ReportSheet onClose={() => setNotice(null)} />
      ) : null}

      <SignInPrompt
        visible={promptOpen}
        onClose={() => setPromptOpen(false)}
        action="lagre"
      />
    </>
  );
}
