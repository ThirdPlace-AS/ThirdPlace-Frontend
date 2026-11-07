import { useMemo, useState } from "react";
import { View } from "react-native";

import {
  LeaveSheet,
  PaySheet,
  WaitlistSheet,
} from "@/components/actions/ActionSheets";
import { Button } from "@/components/Button";
import { FaceStack } from "@/components/FaceStack";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Text } from "@/components/ui";
import { experienceById, sessionsFor } from "@/fixtures";
import { shortSessionLabel } from "@/lib/dates";
import { haptics } from "@/lib/haptics";
import { goingLabel } from "@/lib/going";

import { useExperienceSession } from "../../experience/useExperienceSession";

import { useExperienceJoin } from "../hooks/useExperienceJoin";
import { useGoing } from "../hooks/useGoing";
import { useGuestMode } from "../hooks/useGuestMode";

// Pinned action bar of the experience detail sheet (PDF p6), the reference
// video's floating card: price or "Gratis", the picked time (or the next
// one) and its places left on the left, the pink join pill on the right.
// Join / waitlist / leave act on the picked time; they are local demo state
// only (BLOCKED_CONTRACT_GAP); guests get the sign-in prompt.
// Phase 16 (founder, after the section benchmark): above it, who is going:
// faces of people who chose "Vis meg som deltaker" (the viewer once joined
// and opted in) and "N skal", which counts everyone.
export function ExperienceJoinBar({ id }: { id: string }) {
  const experience = experienceById(id);
  const [user, setUser] = useExperienceJoin(
    id,
    experience?.status === "joined" ? "joined" : "none",
  );
  const { isGuest } = useGuestMode();
  const going = useGoing(id);
  const [promptOpen, setPromptOpen] = useState(false);
  const [chosenId] = useExperienceSession(id);
  const [now] = useState(() => new Date());
  const sessions = useMemo(
    () => (experience ? sessionsFor(experience, now, 8) : []),
    [experience, now],
  );
  const session = sessions.find((s) => s.id === chosenId) ?? sessions[0];
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
  // Places left at the picked time (the viewer's own seat counts once joined).
  const left = Math.max(
    0,
    (session?.spotsLeft ?? experience.capacity - experience.going) -
      (user === "joined" ? 1 : 0),
  );
  const when = session
    ? shortSessionLabel(session.start, now)
    : experience.when;

  const primary = (() => {
    if (user === "joined")
      return { label: "Forlat", action: () => setConfirm("leave") };
    if (user === "waitlisted")
      return { label: "Meld av venteliste", action: () => setUser("none") };
    if (experience.status === "cancelled")
      return { label: "Avlyst", action: undefined, disabled: true };
    if (left <= 0)
      return {
        label: "Meld på venteliste",
        action: gated(() => setConfirm("waitlist")),
      };
    if (experience.priceNok)
      return { label: "Bli med", action: gated(() => setConfirm("pay")) };
    return { label: "Bli med", action: gated(join) };
  })();

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <FaceStack faces={going.faces} />
        <Text variant="caption" weight="semibold">
          {goingLabel(going.count)}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <Text variant="body" weight="bold" numberOfLines={1}>
            {experience.priceNok ? `${experience.priceNok} kr` : "Gratis"}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {user === "joined"
              ? `Du er påmeldt · ${when}`
              : user === "waitlisted"
                ? `Venteliste · ${when}`
                : `${when} · ${left > 0 ? `${left} igjen` : "Fullt"}`}
          </Text>
        </View>
        <View style={{ minWidth: 150 }}>
          <Button
            label={primary.label}
            rounded="full"
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
            when={when}
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
    </View>
  );
}
