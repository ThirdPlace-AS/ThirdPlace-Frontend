import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";

import {
  Icon,
  SearchBar,
  Pressable as UIPressable,
  Text,
} from "@/components/ui";
import {
  CategoryArt,
  hasCategoryArt,
} from "@/components/illustrations/CategoryArt";
import { Sheet } from "@/components/Sheet";
import { people, places, type MockPerson, type MockPlace } from "@/fixtures";
import { libImage } from "@/fixtures/images";

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
  return (
    <SearchBar
      size="sm"
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
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
          <Text variant="caption" tone="muted" className="py-6 text-center">
            Ingen steder matcher «{q}».
          </Text>
        ) : null}
        {list.slice(0, 8).map((p) => (
          <UIPressable
            key={p.id}
            accessibilityRole="button"
            onPress={() => {
              onPick(p);
              onClose();
            }}
            contentClassName="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
            pressedScale={0.99}
          >
            <Icon name="location-outline" size="md" tone="ink" />
            <View className="flex-1">
              <Text variant="label" weight="semibold">
                {p.name}
              </Text>
              <Text variant="caption" tone="muted">
                {p.category} · {p.distance}
              </Text>
            </View>
          </UIPressable>
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
          <UIPressable
            key={o}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === o }}
            onPress={() => {
              onPick(o);
              onClose();
            }}
            pressedScale={0.99}
            contentClassName={`flex-row items-center gap-3 rounded-md border bg-surface px-4 py-3 ${
              value === o ? "border-ink" : "border-line"
            }`}
          >
            {hasCategoryArt(o) ? <CategoryArt name={o} size={32} /> : null}
            <Text variant="body" weight="medium" className="flex-1">
              {o}
            </Text>
            {value === o ? (
              <Icon name="checkmark" size="md" tone="ink" />
            ) : null}
          </UIPressable>
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
          <Text variant="caption" tone="muted" className="py-6 text-center">
            Ingen brukere matcher «{q}».
          </Text>
        ) : null}
        {list.map((p) => (
          <UIPressable
            key={p.id}
            accessibilityRole="button"
            onPress={() => {
              onPick(p);
              onClose();
            }}
            contentClassName="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
            pressedScale={0.99}
          >
            <Image
              source={libImage(p.avatar)}
              style={{ height: 36, width: 36, borderRadius: 18 }}
            />
            <View className="flex-1">
              <Text variant="label" weight="semibold">
                {p.name}
              </Text>
              <Text variant="caption" tone="muted">
                {p.handle} · {p.area}
              </Text>
            </View>
          </UIPressable>
        ))}
      </View>
    </Sheet>
  );
}
