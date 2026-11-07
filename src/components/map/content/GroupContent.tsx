import { useState } from "react";
import { View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GuestLock } from "@/components/GuestLock";
import { SignInPrompt } from "@/components/SignInPrompt";
import { groupById } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { membersLabel } from "@/lib/format";
import { haptics } from "@/lib/haptics";
import { Text } from "@/components/ui";

import { Gallery } from "../Gallery";
import { useGuestMode } from "../hooks/useGuestMode";

export function GroupContent({ id }: { id: string }) {
  const group = groupById(id);
  const { isGuest } = useGuestMode();
  // The creator of a group (made in Legg til) is already in it.
  const [member, setMember] = useState(group?.mine === true);
  const [promptOpen, setPromptOpen] = useState(false);

  if (!group) {
    return (
      <Text variant="caption" tone="muted">
        Fant ikke gruppen.
      </Text>
    );
  }

  // Joining is an account action: guests get the sign-in prompt, the
  // signed-in demo flips local state only (BLOCKED_CONTRACT_GAP).
  const toggle = () => {
    if (isGuest) return setPromptOpen(true);
    if (!member) haptics.light();
    setMember((m) => !m);
  };

  return (
    <View className="gap-4">
      <Gallery
        photos={group.photos.map(libImage)}
        height={200}
        label={group.name}
      />
      <Text variant="caption" tone="muted">
        {group.about}
      </Text>
      <Text variant="caption" tone="muted">
        {membersLabel(group.memberCount)}
      </Text>

      <Card>
        <View className="gap-2">
          <Text variant="body" weight="semibold">
            Medlemmer
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {group.members.map((m) => (
              <Avatar key={m} initials={m} size="sm" />
            ))}
          </View>
        </View>
      </Card>

      {isGuest ? (
        <GuestLock message="Logg inn for å bli medlem og se gruppechatten." />
      ) : null}

      <Button
        label={member ? "Forlat gruppen" : "Bli medlem"}
        variant={member ? "secondary" : "ember"}
        onPress={toggle}
      />

      <SignInPrompt
        visible={promptOpen}
        onClose={() => setPromptOpen(false)}
        action="bli medlem"
      />
    </View>
  );
}
