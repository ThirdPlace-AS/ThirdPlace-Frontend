// One picker for every place that chooses interests (Phase 19 S5, founder
// 2026-11-08): onboarding's "Hva liker du?", Rediger profil and the Gruppe
// wizard. The design's 22 come first, then the other 62 under the eight
// category headings; a search matches a name or an older one ("Bøker" finds
// Litteratur). Values are interest labels, as the stores keep them.
import { useMemo, useState } from "react";
import { View } from "react-native";

import { MARKER_LABEL } from "@/components/map/services/markerCategory";
import { ChipGroup, Text } from "@/components/ui";
import {
  DESIGN_INTEREST_IDS,
  INTEREST_CATEGORIES,
  INTERESTS,
  interestById,
  interestWords,
  interestsInCategory,
  type Interest,
} from "@/fixtures/catalog/interests";

import { SearchField } from "./Pickers";

export type InterestSection = { title: string; items: Interest[] };

/** The picker's sections: "Forslag" (the design's 22) and the categories
 *  with the rest, or, while searching, the matches under "Treff". */
export function interestSections(query: string): InterestSection[] {
  const q = query.trim().toLowerCase();
  if (q) {
    const hits = (INTERESTS as readonly Interest[]).filter((i) =>
      interestWords(i.id).some((w) => w.includes(q)),
    );
    return hits.length > 0 ? [{ title: "Treff", items: hits }] : [];
  }
  const design = DESIGN_INTEREST_IDS.flatMap((id) => {
    const i = interestById(id);
    return i ? [i] : [];
  });
  const first = new Set<string>(DESIGN_INTEREST_IDS);
  const rest = INTEREST_CATEGORIES.map((cat) => ({
    title: MARKER_LABEL[cat],
    items: interestsInCategory(cat).filter((i) => !first.has(i.id)),
  })).filter((s) => s.items.length > 0);
  return [{ title: "Forslag", items: design }, ...rest];
}

export function InterestPicker({
  value,
  onToggle,
  autoFocus = false,
}: {
  /** The chosen interests' labels. */
  value: readonly string[];
  onToggle: (label: string) => void;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const sections = useMemo(() => interestSections(query), [query]);
  return (
    <View className="gap-4">
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Søk etter en interesse"
        autoFocus={autoFocus}
      />
      {sections.length === 0 ? (
        <Text variant="caption" tone="muted">
          {`Ingen interesser passer «${query.trim()}».`}
        </Text>
      ) : (
        sections.map((s) => (
          <View key={s.title} className="gap-2">
            <Text variant="micro" weight="semibold" tone="muted">
              {s.title}
            </Text>
            <ChipGroup
              multiple
              label={s.title}
              options={s.items.map((i) => i.label)}
              value={value}
              onChange={onToggle}
            />
          </View>
        ))
      )}
    </View>
  );
}
