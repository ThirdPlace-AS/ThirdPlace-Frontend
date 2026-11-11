// The area chips of the location sheet, Legg til and business onboarding
// (Phase 19 S4): every area across Oslo and Akershus, grouped by region
// ("Oslo", "Asker og Bærum", "Follo", "Romerike", "Hadeland"), one choice.
import { View } from "react-native";

import { ChipGroup, Text } from "@/components/ui";
import { areasByRegion, type MockArea } from "@/fixtures";

export function AreaChips({
  value,
  onChange,
}: {
  /** The chosen area's name, or null. */
  value: string | null;
  onChange: (area: MockArea) => void;
}) {
  const groups = areasByRegion();
  return (
    <View className="gap-4">
      {groups.map(({ region, areas }) => (
        <View key={region} className="gap-2">
          <Text variant="micro" weight="semibold" tone="muted">
            {region}
          </Text>
          <ChipGroup
            label={region}
            options={areas.map((a) => a.name)}
            value={value}
            onChange={(name) => {
              const a = areas.find((x) => x.name === name);
              if (a) onChange(a);
            }}
          />
        </View>
      ))}
    </View>
  );
}
