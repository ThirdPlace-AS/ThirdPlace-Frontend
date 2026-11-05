import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Icon } from "@/components/ui";
import { Sheet } from "@/components/Sheet";
import { people, places, type MockPerson, type MockPlace } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { useThemeColors } from "@/theme";

// Shared pickers (PDF p24–p25): Velg sted, Velg kategori, Søk brukere. Search
// over fixture data only — no geocoding or user directory exists
// (BLOCKED_CONTRACT_GAP). Mount each only while open.

export function SearchField({
  value,
  onChange,
  placeholder,
  autoFocus = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-2 rounded-full border border-line bg-surface px-4">
      <Icon name="search" size="sm" tone="muted" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        className="flex-1 py-2.5 text-sm text-ink font-normal"
        autoFocus={autoFocus}
      />
    </View>
  );
}

export function PlacePicker({
  onPick,
  onClose,
}: {
  onPick: (p: MockPlace) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const list = places.filter((p) =>
    `${p.name} ${p.category} ${p.address}`
      .toLowerCase()
      .includes(q.trim().toLowerCase()),
  );
  return (
    <Sheet visible onClose={onClose} title="Velg sted">
      <View className="gap-2">
        <SearchField value={q} onChange={setQ} placeholder="Søk etter sted …" />
        {list.length === 0 ? (
          <Text className="py-6 text-center text-sm text-muted font-normal">
            Ingen steder matcher «{q}».
          </Text>
        ) : null}
        {list.slice(0, 8).map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            onPress={() => {
              onPick(p);
              onClose();
            }}
            className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3 active:opacity-80"
          >
            <Icon name="location-outline" size="md" tone="ink" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink">{p.name}</Text>
              <Text className="text-xs text-muted font-normal">
                {p.category} · {p.distance}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

export function CategoryPicker({
  options,
  value,
  onPick,
  onClose,
}: {
  options: string[];
  value: string | null;
  onPick: (c: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const list = options.filter((o) =>
    o.toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <Sheet visible onClose={onClose} title="Velg kategori">
      <View className="gap-2">
        <SearchField value={q} onChange={setQ} placeholder="Søk kategori …" />
        {list.map((o) => (
          <Pressable
            key={o}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === o }}
            onPress={() => {
              onPick(o);
              onClose();
            }}
            className="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3.5 active:opacity-80"
          >
            <Text className="text-sm font-medium text-ink">{o}</Text>
            {value === o ? (
              <Icon name="checkmark" size="md" tone="ink" />
            ) : null}
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

export function UserSearch({
  onPick,
  onClose,
  title = "Søk brukere",
}: {
  onPick: (p: MockPerson) => void;
  onClose: () => void;
  title?: string;
}) {
  const [q, setQ] = useState("");
  const list = people.filter((p) =>
    `${p.name} ${p.handle}`.toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <Sheet visible onClose={onClose} title={title}>
      <View className="gap-2">
        <SearchField
          value={q}
          onChange={setQ}
          placeholder="Navn eller brukernavn …"
        />
        {list.length === 0 ? (
          <Text className="py-6 text-center text-sm text-muted font-normal">
            Ingen brukere matcher «{q}».
          </Text>
        ) : null}
        {list.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            onPress={() => {
              onPick(p);
              onClose();
            }}
            className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3 active:opacity-80"
          >
            <Image
              source={libImage(p.avatar)}
              style={{ height: 36, width: 36, borderRadius: 18 }}
            />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink">{p.name}</Text>
              <Text className="text-xs text-muted font-normal">
                {p.handle} · {p.area}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}
