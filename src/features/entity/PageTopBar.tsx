// Top bar of an entity page (experience, place), as in the reference video:
// back, a small centred caption, share and save. Saving is an account action:
// guests get the sign-in prompt. Back falls back to the map on a cold deep
// link (goBackOr).
import { useState } from "react";
import { Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PAGE_BAR_ROW } from "@/components/experience/ExperiencePage";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { SignInPrompt } from "@/components/SignInPrompt";
import { BACK_ICON, HeartToggle, IconButton, Text } from "@/components/ui";
import { goBackOr } from "@/lib/navigation";

export function PageTopBar({
  caption,
  shareMessage,
  savedKey,
}: {
  caption: string;
  shareMessage: string;
  /** markerId of the entity for the shared Saved store. */
  savedKey: string;
}) {
  const insets = useSafeAreaInsets();
  const { isGuest } = useGuestMode();
  const { isSaved, toggle } = useMapSaved();
  const [signIn, setSignIn] = useState(false);
  const saved = isSaved(savedKey);
  return (
    <View
      className="flex-row items-center gap-1 border-b border-line bg-background px-2"
      style={{ paddingTop: insets.top, height: insets.top + PAGE_BAR_ROW }}
    >
      <IconButton
        icon={BACK_ICON}
        label="Tilbake"
        onPress={() => goBackOr("/map")}
      />
      <Text
        variant="caption"
        weight="semibold"
        tone="muted"
        className="flex-1 text-center"
        numberOfLines={1}
      >
        {caption}
      </Text>
      <IconButton
        icon="share-outline"
        label="Del"
        onPress={() =>
          void Share.share({ message: shareMessage }).catch(() => {})
        }
      />
      <HeartToggle
        selected={saved}
        variant="ghost"
        label={saved ? "Fjern fra lagret" : "Lagre"}
        onToggle={() => (isGuest ? setSignIn(true) : toggle(savedKey))}
      />
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="lagre"
      />
    </View>
  );
}
