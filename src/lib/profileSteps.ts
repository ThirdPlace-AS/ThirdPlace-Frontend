import type { IconName } from "@/components/ui";
import type { MyProfile } from "@/lib/myProfile";

export type ProfileStepKey = "photo" | "bio" | "interests" | "languages";
export type ProfileStep = {
  key: ProfileStepKey;
  label: string;
  icon: IconName;
};

// "Fullfør profilen" on Profil (Phase 18, screen benchmark: LinkedIn names the
// next step of a profile). A step is a Rediger profil field that is still
// empty; nothing is scored. "Vis meg som deltaker" is deliberately not a step:
// it is a privacy choice that stays off until the person picks it (founder
// 2026-11-07), so an unfinished profile never presses for it.
const STEPS: readonly (ProfileStep & { done: (p: MyProfile) => boolean })[] = [
  {
    key: "photo",
    label: "Legg til et profilbilde",
    icon: "camera-outline",
    done: (p) => p.avatar !== null,
  },
  {
    key: "bio",
    label: "Skriv litt om deg selv",
    icon: "create-outline",
    done: (p) => p.bio.trim().length > 0,
  },
  {
    key: "interests",
    label: "Velg interesser",
    icon: "pricetags-outline",
    done: (p) => p.interests.length > 0,
  },
  {
    key: "languages",
    label: "Skriv hvilke språk du snakker",
    icon: "globe-outline",
    done: (p) => p.languages.trim().length > 0,
  },
];

export const PROFILE_STEP_COUNT = STEPS.length;

/** The steps still open, in the order Rediger profil shows the fields. */
export function openProfileSteps(p: MyProfile): ProfileStep[] {
  return STEPS.filter((s) => !s.done(p)).map(({ key, label, icon }) => ({
    key,
    label,
    icon,
  }));
}
