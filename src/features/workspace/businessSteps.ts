import type { Href } from "expo-router";

import type { MockBusiness } from "@/fixtures";
import { useDevSimulation } from "@/lib/devSimulation";

// Arbeidsflate's «Kom i gang» (review 2026-11-18 PR-09, 0527: «Bedrift:
// sjekkliste først»). Only steps the app can both check and lead to: the
// verification (Verifisering shows its stages) and a first experience (Legg
// til). A step for a menu, opening hours or a payout method is left out: the
// app has no editor or stored choice for them, so it could not tell when
// one is done. BLOCKED_CONTRACT_GAP: no business or verification contract;
// what verification checks and how long it takes is founder question 11, so
// the waiting row promises neither.

export type BusinessStep = {
  key: "verify" | "experience";
  label: string;
  done: boolean;
  /** Shown in place of the chevron while the step waits on someone else. */
  status?: string;
  href: Href;
};

export function businessSteps({
  businessId,
  verified,
  hasExperience,
}: {
  businessId: string;
  verified: boolean;
  hasExperience: boolean;
}): BusinessStep[] {
  return [
    {
      key: "verify",
      label: "Verifiser bedriften",
      done: verified,
      status: verified ? undefined : "Venter",
      href: `/workspace/verification/${businessId}` as Href,
    },
    {
      key: "experience",
      label: "Legg til en opplevelse",
      done: hasExperience,
      href: "/add" as Href,
    },
  ];
}

/** Whether a business is verified. The dev-only «Ny bedrift» switch
 *  (`thirdplace://_sandbox/simulate`) shows the owned business as new:
 *  waiting on verification, nothing published yet. */
export function useBusinessVerified(
  business: Pick<MockBusiness, "verified"> | undefined,
): boolean {
  const { newBusiness } = useDevSimulation();
  return !!business?.verified && !newBusiness;
}
