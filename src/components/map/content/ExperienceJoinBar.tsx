import { useState } from "react";
import { View } from "react-native";

import {
  LeaveSheet,
  PaySheet,
  WaitlistSheet,
} from "@/components/actions/ActionSheets";
import { Button } from "@/components/Button";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Text } from "@/components/ui";
import { experienceById } from "@/fixtures";
import { haptics } from "@/lib/haptics";

import { useExperienceJoin } from "../hooks/useExperienceJoin";
import { useGuestMode } from "../hooks/useGuestMode";

// Pinned action bar of the experience detail sheet (PDF p6): price or
// "Gratis" and places left on the left, the join action on the right, so
// "Bli med" is reachable at every snap (it used to sit at the end of the
// scroll, out of sight at the peek). Join / waitlist / leave are local demo
// state only (BLOCKED_CONTRACT_GAP); guests get the sign-in prompt.
export function ExperienceJoinBar({ id }: { id: string }) {
  const experience = experienceById(id);
  const [user, setUser] = useExperienceJoin(
    id,
    experience?.status === "joined" ? "joined" : "none",
  );
  const { isGuest } = useGuestMode();
  const [promptOpen, setPromptOpen] = useState(false);
  // PDF p23: leaving, paying and joining the waitlist confirm in a sheet.
  const [confirm, setConfirm] = useState<"leave" | "waitlist" | "pay" | null>(
    null,
  );
  if (!experience) return null;

  const gated = (run: () => void) => () =>
    isGuest ? setPromptOpen(true) : run();
  const join = () => {
    haptics.light();
    setUser("joined");
  };

  const primary = (() => {
    if (user === "joined")
      return { label: "Forlat", action: () => setConfirm("leave") };
    if (user === "waitlisted")
      return { label: "Meld av venteliste", action: () => setUser("none") };
    if (experience.status === "cancelled")
      return { label: "Avlyst", action: undefined, disabled: true };
    if (experience.status === "full" || experience.status === "waitlist")
      return {
        label: "Meld på venteliste",
        action: gated(() => setConfirm("waitlist")),
      };
    if (experience.priceNok)
      return { label: "Bli med", action: gated(() => setConfirm("pay")) };
    return { label: "Bli med", action: gated(join) };
  })();

  const going = experience.going + (user === "joined" ? 1 : 0);
  const left = Math.max(0, experience.capacity - going);

  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1">
        <Text variant="body" weight="bold" numberOfLines={1}>
          {experience.priceNok ? `${experience.priceNok} kr` : "Gratis"}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {user === "joined"
            ? "Du er påmeldt"
            : user === "waitlisted"
              ? "Du står på venteliste"
              : left > 0
                ? `${left} plasser igjen`
                : "Fullt"}
        </Text>
      </View>
      <View style={{ minWidth: 150 }}>
        <Button
          label={primary.label}
          variant={user === "none" ? "ember" : "secondary"}
          disabled={primary.disabled}
          onPress={primary.action}
        />
      </View>

      {confirm === "leave" ? (
        <LeaveSheet
          onClose={() => setConfirm(null)}
          onConfirm={() => setUser("none")}
        />
      ) : null}
      {confirm === "pay" && experience.priceNok ? (
        <PaySheet
          title={experience.title}
          when={experience.when}
          priceNok={experience.priceNok}
          onClose={() => setConfirm(null)}
          onJoined={() => setUser("joined")}
        />
      ) : null}
      {confirm === "waitlist" ? (
        <WaitlistSheet
          ahead={3}
          onClose={() => setConfirm(null)}
          onConfirm={() => setUser("waitlisted")}
        />
      ) : null}
      <SignInPrompt
        visible={promptOpen}
        onClose={() => setPromptOpen(false)}
        action={primary.label.toLowerCase()}
      />
    </View>
  );
}
