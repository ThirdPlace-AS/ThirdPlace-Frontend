import type { IconName } from "@/components/ui";

// "Nytt i ThirdPlace": what the current version brings, shown once after an
// update (src/lib/whatsNew.ts). Drafted from features this version ships
// (Phase 18) for the founder to rewrite; it names features only and states
// no rules. One place to edit before each release.
export const WHATS_NEW: {
  title: string;
  items: { icon: IconName; title: string; text: string }[];
  done: string;
} = {
  title: "Nytt i ThirdPlace",
  items: [
    {
      icon: "grid-outline",
      title: "Kategorier på kartet",
      text: "Velg Kafé, Trening eller Natur og tur rett under søket.",
    },
    {
      icon: "calendar-outline",
      title: "Planene dine i en kalender",
      text: "Se hele måneden i Mine planer, og legg en plan inn i kalenderen på telefonen.",
    },
    {
      icon: "hand-left-outline",
      title: "Hold inne for flere valg",
      text: "Hold inne et kort på kartet eller en rad i Lagret for å se flere valg.",
    },
  ],
  done: "Fortsett",
};
