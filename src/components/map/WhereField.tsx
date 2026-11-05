import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

import { OSLO_AREAS } from "@/fixtures";
import { colors } from "@/theme";

import { useRecentSearches } from "./hooks/useRecentSearches";

// "Where?" search for the filter sheet. A text field over the MOCK OSLO_AREAS
// list (no geocoder). Selecting a suggestion sets the area name; the screen
// recenters the map to it (see map.tsx handleApplyFilters). Not a real search.
// Layout mirrors the reference Where flow: a tall search box, a "Nylige søk"
// (DEMO, in-memory, clears on reload) section, then "Foreslåtte steder".
export function WhereField({
  value,
  onSelect,
}: {
  value: string | null;
  onSelect: (area: string | null) => void;
}) {
  const [text, setText] = useState("");
  const { recent, add } = useRecentSearches();
  const q = text.trim().toLowerCase();
  const matches = q
    ? OSLO_AREAS.filter((a) => a.name.toLowerCase().includes(q))
    : OSLO_AREAS;

  const choose = (name: string) => {
    add(name);
    onSelect(name);
  };

  const Row = ({ name }: { name: string }) => {
    const selected = value === name;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => choose(name)}
        className="flex-row items-center gap-3 py-3"
      >
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-surfaceMuted">
          <Ionicons name="location-outline" size={20} color={colors.ink} />
        </View>
        <Text
          className={`flex-1 text-base ${selected ? "font-semibold text-ink" : "text-ink"}`}
        >
          {name}
        </Text>
        {selected ? (
          <Ionicons name="checkmark" size={18} color={colors.ember} />
        ) : null}
      </Pressable>
    );
  };

  return (
    <View className="gap-4">
      <View className="h-14 flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4">
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Søk etter sted eller landemerke"
          placeholderTextColor={colors.muted}
          className="flex-1 text-base text-ink"
        />
        {text || value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fjern sted"
            onPress={() => {
              setText("");
              onSelect(null);
            }}
            hitSlop={8}
            className="h-7 w-7 items-center justify-center rounded-full bg-surfaceMuted"
          >
            <Ionicons name="close" size={16} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {!q && recent.length > 0 ? (
        <View className="gap-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
            Nylige søk
          </Text>
          <View>
            {recent.map((name) => (
              <Row key={`recent-${name}`} name={name} />
            ))}
          </View>
        </View>
      ) : null}

      <View className="gap-1">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          Foreslåtte steder
        </Text>
        <View>
          {matches.map((a) => (
            <Row key={a.name} name={a.name} />
          ))}
        </View>
      </View>
    </View>
  );
}
