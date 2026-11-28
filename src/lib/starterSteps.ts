import type { Href } from "expo-router";

import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import type { IconName } from "@/components/ui";
import { groups } from "@/fixtures";
import { interestForLabel } from "@/fixtures/catalog/interests";
import { useInAnyGroup } from "@/lib/groupMembership";
import { useMyProfile, type MyProfile } from "@/lib/myProfile";

// «Kom i gang» on Profil (review 2026-11-18 PR-06; founder 2026-11-19 #5:
// "Profil shows Kom i gang", #15: the Skaper criteria card goes). Three first
// steps, each done by what the app already holds: something saved that is a
// place, being in a group, a profile photo. Nothing is scored or rewarded, and
// no step promises what happens next. Like «Fullfør profilen» it is gone once
// every step is done; that card shows only after this one (one checklist at
// a time).

export type StarterKey = "save" | "group" | "photo";
export type StarterStep = {
  key: StarterKey;
  label: string;
  icon: IconName;
  done: boolean;
  href: Href;
};

export type StarterInput = {
  savedIds: readonly string[];
  inGroup: boolean;
  avatar: MyProfile["avatar"];
  interests: readonly string[];
};

/** A group to open for «Bli med i en gruppe»: one that shares an interest
 *  with you, else the first one; never one you made yourself. */
export function suggestedGroupId(
  interests: readonly string[],
): string | undefined {
  const mine = new Set(
    interests.flatMap((l) => {
      const id = interestForLabel(l)?.id;
      return id ? [id] : [];
    }),
  );
  const others = groups.filter((g) => !g.mine);
  const match = others.find((g) => g.interests.some((i) => mine.has(i)));
  return (match ?? others[0])?.id;
}

export function starterSteps(input: StarterInput): StarterStep[] {
  const groupId = suggestedGroupId(input.interests);
  return [
    {
      key: "save",
      label: "Lagre et sted",
      icon: "heart-outline",
      // Saved ids are marker ids ("place:<id>", "experience:<id>").
      done: input.savedIds.some((id) => id.startsWith("place:")),
      href: "/map",
    },
    {
      key: "group",
      label: "Bli med i en gruppe",
      icon: "people-outline",
      done: input.inGroup,
      href: (groupId ? `/group/${groupId}` : "/map") as Href,
    },
    {
      key: "photo",
      label: "Legg til et profilbilde",
      icon: "camera-outline",
      done: input.avatar !== null,
      href: "/profile/edit" as Href,
    },
  ];
}

export function useStarterSteps(): StarterStep[] {
  const { savedIds } = useMapSaved();
  const inGroup = useInAnyGroup();
  const me = useMyProfile();
  return starterSteps({
    savedIds,
    inGroup,
    avatar: me.avatar,
    interests: me.interests,
  });
}
