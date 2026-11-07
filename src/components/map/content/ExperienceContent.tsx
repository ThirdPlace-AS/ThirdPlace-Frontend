import { router } from "expo-router";

import { ExperiencePage } from "@/components/experience/ExperiencePage";
import { Text } from "@/components/ui";
import { experienceById } from "@/fixtures";

import type { PushFn } from "../sheetTypes";

// Map experience detail: the shared ExperiencePage (Phase 11 G5) inside the
// detail sheet. Short sub-views push onto the in-sheet stack; place, group,
// other experiences, host profile, chat and all reviews open as pages (the
// portal sheet hides while the map is out of focus and returns on back). The
// join action is the sheet's floating ExperienceJoinBar card.
export function ExperienceContent({ id, push }: { id: string; push: PushFn }) {
  const experience = experienceById(id);
  if (!experience) {
    return (
      <Text variant="caption" tone="muted">
        Fant ikke arrangementet.
      </Text>
    );
  }
  return (
    <ExperiencePage
      exp={experience}
      onOpen={push}
      onNavigate={(href) => router.push(href)}
    />
  );
}
