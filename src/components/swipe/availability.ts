import type { MockExperience } from "@/fixtures";

// Single source of truth for an experience's availability wording, so the swipe
// card, the dark detail, and any future surface agree on "Venteliste" / "Fullt" /
// remaining spots and the join CTA. Pure (no React/Reanimated) → unit-testable.
// DEMO only — join/waitlist are local demo state (BLOCKED_CONTRACT_GAP).

export type Availability = {
  isWaitlist: boolean;
  isFull: boolean;
  spotsLeft: number;
  // Card spots line, e.g. "3 plasser igjen · 5/8".
  label: string;
  // Detail status word, e.g. "Venteliste" / "Fullt" / "3 plasser igjen".
  statusText: string;
  // Primary CTA label.
  joinLabel: string;
};

export function experienceAvailability(exp: MockExperience): Availability {
  const spotsLeft = Math.max(0, exp.capacity - exp.going);
  const isWaitlist = exp.status === "waitlist";
  const isFull = !isWaitlist && (exp.status === "full" || spotsLeft <= 0);
  const statusText = isWaitlist
    ? "Venteliste"
    : isFull
      ? "Fullt"
      : `${spotsLeft} plasser igjen`;
  const label = isWaitlist
    ? "Venteliste"
    : isFull
      ? "Fullt"
      : `${spotsLeft} plasser igjen · ${exp.going}/${exp.capacity}`;
  const joinLabel = isWaitlist || isFull ? "Meld på venteliste" : "Bli med";
  return { isWaitlist, isFull, spotsLeft, label, statusText, joinLabel };
}
