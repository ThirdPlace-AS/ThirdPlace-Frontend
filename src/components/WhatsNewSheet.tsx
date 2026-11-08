import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { Icon, Sheet, Text } from "@/components/ui";
import { WHATS_NEW } from "@/copy/whatsNew";
import { appVersion, claimWhatsNew, markWhatsNewSeen } from "@/lib/whatsNew";

// "Nytt i ThirdPlace" (Phase 18, Apple's What's New): three rows of icon,
// title and line, then Fortsett.
export function WhatsNewSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title={WHATS_NEW.title}>
      <View className="gap-4">
        {WHATS_NEW.items.map((item) => (
          <View key={item.title} className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
              <Icon name={item.icon} size="md" tone="ink" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="label" weight="semibold">
                {item.title}
              </Text>
              <Text variant="caption" tone="muted">
                {item.text}
              </Text>
            </View>
          </View>
        ))}
        <Button label={WHATS_NEW.done} variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}

/** On the map, the first screen after start: shows the sheet once after an
 *  update, for a signed-in person, when no other hint has had the session. */
export function WhatsNewOnFocus() {
  const { isGuest } = useGuestMode();
  const [open, setOpen] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!isGuest && claimWhatsNew(appVersion())) setOpen(true);
    }, [isGuest]),
  );
  return (
    <WhatsNewSheet
      visible={open}
      onClose={() => {
        setOpen(false);
        markWhatsNewSeen(appVersion());
      }}
    />
  );
}
