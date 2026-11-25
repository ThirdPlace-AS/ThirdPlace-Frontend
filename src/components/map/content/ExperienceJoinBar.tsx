import { router, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import {
  LeaveSheet,
  PaySheet,
  WaitlistSheet,
} from "@/components/actions/ActionSheets";
import { JoinedSheet } from "@/components/experience/JoinedSheet";
import { FaceStack } from "@/components/FaceStack";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Text, Button } from "@/components/ui";
import { chatForExperience, experienceById } from "@/fixtures";
import { isHostedByMe } from "@/fixtures/created";
import { goingLabel } from "@/lib/going";

import { useJoinSession } from "../../experience/joinedActions";

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
// 0464: the host of an experience they published sees "Administrer" (the
// host view) instead of Bli med; onManage opens it where the bar sits.
export function ExperienceJoinBar({
  id,
  onManage,
}: {
  id: string;
  onManage?: () => void;
}) {
  const experience = experienceById(id);
  const [user, setUser] = useExperienceJoin(
    id,
    experience?.status === "joined" ? "joined" : "none",
  );
  const { isGuest } = useGuestMode();
  const going = useGoing(id);
  const [promptOpen, setPromptOpen] = useState(false);
  const { session, when } = useJoinSession(experience);
  // PDF p23: leaving, paying and joining the waitlist confirm in a sheet.
  // Phase 18: "Du er med" after joining (screen benchmark).
  const [confirm, setConfirm] = useState<
    "leave" | "waitlist" | "pay" | "joined" | null
  >(null);
  if (!experience) return null;

  const gated = (run: () => void) => () =>
    isGuest ? setPromptOpen(true) : run();
  const join = () => {
    setUser("joined");
    setConfirm("joined");
  };
  // Places left at the picked time (the viewer's own seat counts once joined).
  const left = Math.max(
    0,
    (session?.spotsLeft ?? experience.capacity - experience.going) -
      (user === "joined" ? 1 : 0),
  );
  const hosting = isHostedByMe(id);
  const chat = chatForExperience(id);
  const primary = (() => {
    if (hosting)
      return { label: "Administrer", action: onManage, disabled: !onManage };
    // PR-03: once joined, the card leads to the chat and Forlat sits in the
    // page's «Du er med» card; without a chat it stays here.
    if (user === "joined")
      return chat
        ? {
            label: "Til samtalen",
            action: () => router.push(`/chat/${chat.id}` as Href),
          }
        : { label: "Forlat", action: () => setConfirm("leave") };
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
          {/* Two lines (0461): beside the button one line cut the date and
              left out the places left on a 360 dp phone. */}
          <Text variant="caption" tone="muted" numberOfLines={2}>
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
            variant={
              hosting
                ? "secondary"
                : user === "none"
                  ? "ember"
                  : user === "joined" && chat
                    ? "ink"
                    : "secondary"
            }
            disabled={primary.disabled}
            onPress={primary.action}
          />
        </View>

        {confirm === "leave" ? (
          <LeaveSheet
            title={`Forlate ${experience.title}?`}
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
            onJoined={() => {
              setUser("joined");
              // After the pay sheet has gone (one Modal at a time).
              setTimeout(() => setConfirm("joined"), 260);
            }}
          />
        ) : null}
        {confirm === "joined" ? (
          <JoinedSheet
            experience={experience}
            session={session}
            when={when}
            onClose={() => setConfirm(null)}
          />
        ) : null}
        {confirm === "waitlist" ? (
          <WaitlistSheet
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
