import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon, PopIcon } from "@/components/ui";
import { haptics } from "@/lib/haptics";
import { ReportSheet, ShareSheet } from "@/components/actions/ActionSheets";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "../hooks/useGuestMode";
import { useMapSaved } from "../hooks/useMapSaved";

// Save / Share / Report action row shared by detail content. Save toggles the
// in-memory demo store (persistence CONTRACT-BLOCKED CB-5) — or, for a guest,
// prompts sign-in. Del and Rapporter open the PDF p23 sheets, which say
// plainly that nothing was shared or reported.
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
      if (!saved) haptics.light();
      toggle(markerId);
    }
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
          <PopIcon
            pop={saved}
            name={saved ? "heart" : "heart-outline"}
            size="md"
            tone={saved ? "ember" : "ink"}
          />
          <Text
            className={`text-sm font-semibold ${saved ? "text-emberText" : "text-ink"}`}
          >
            {saved ? "Lagret" : "Lagre"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Del"
          onPress={() => setNotice("share")}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5"
        >
          <Icon name="share-outline" size="md" tone="ink" />
          <Text className="text-sm font-semibold text-ink">Del</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rapporter"
          onPress={() => setNotice("report")}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5"
        >
          <Icon name="flag-outline" size="md" tone="ink" />
          <Text className="text-sm font-semibold text-ink">Rapporter</Text>
        </Pressable>
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
