import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { IconButton, Screen, Text, Badge } from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { LISTING_TYPES, listings, type MockListingType } from "@/fixtures";

// Mine listings + Ny / Rediger listing (DEMO), per the design (PDF p16).
// Tabs Aktive / Utkast / Avsluttede over the user's example listings, a
// pencil per row to edit, and a "+" for a new listing. BLOCKED_CONTRACT_GAP:
// no listing entity, publishing or pricing contract — nothing is published or
// saved, and no view/request counts are shown (no invented social proof).
const TABS = ["Aktive", "Utkast", "Avsluttede"] as const;
const MINE = listings.slice(0, 3).map((l, i) => ({
  ...l,
  state: (i === 2 ? "Utkast" : "Aktive") as (typeof TABS)[number],
}));

type Draft = { title: string; type: MockListingType; about: string };

export default function MyListingsScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Aktive");
  const [editing, setEditing] = useState<Draft | null>(null);
  const rows = MINE.filter((l) => l.state === tab);
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Mine listings" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-28">
        <View className="flex-row flex-wrap gap-2">
          {TABS.map((t) => (
            <Chip
              key={t}
              label={`${t} (${MINE.filter((l) => l.state === t).length})`}
              selected={tab === t}
              onPress={() => setTab(t)}
            />
          ))}
        </View>
        {rows.length === 0 ? (
          <Text variant="caption" tone="muted" className="py-10 text-center">
            Ingen listings her ennå.
          </Text>
        ) : null}
        {rows.map((l) => (
          <View
            key={l.id}
            className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-3.5"
          >
            <View className="flex-1 gap-1">
              <Text variant="body" weight="semibold">
                {l.title}
              </Text>
              <Badge kind="status" label={l.type} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Rediger ${l.title}`}
              onPress={() =>
                setEditing({
                  title: l.title,
                  type: l.type,
                  about: l.description,
                })
              }
              hitSlop={8}
            >
              <Text variant="label" weight="semibold" tone="ember">
                Rediger
              </Text>
            </Pressable>
          </View>
        ))}
        <DemoNote>Eksempel-listings — ingenting er publisert.</DemoNote>
      </ScrollView>
      <IconButton
        icon="add"
        label="Ny listing"
        variant="ember"
        size="xl"
        haptic="light"
        onPress={() => setEditing({ title: "", type: "Venue", about: "" })}
        className="absolute bottom-6 right-5"
      />
      {editing ? (
        <ListingEditor initial={editing} onClose={() => setEditing(null)} />
      ) : null}
    </Screen>
  );
}

function ListingEditor({
  initial,
  onClose,
}: {
  initial: Draft;
  onClose: () => void;
}) {
  const isNew = initial.title === "";
  const [d, setD] = useState(initial);
  const [done, setDone] = useState(false);
  return (
    <Sheet
      visible
      onClose={onClose}
      title={isNew ? "Ny listing" : "Rediger listing"}
    >
      <View className="gap-3">
        <Text variant="caption" tone="muted">
          Del det du tilbyr med andre skapere og bedrifter.
        </Text>
        <Text variant="label" weight="semibold">
          Type
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {LISTING_TYPES.map((t) => (
            <Chip
              key={t}
              label={t}
              selected={d.type === t}
              onPress={() => setD({ ...d, type: t })}
            />
          ))}
        </View>
        <Input
          label="Tittel"
          placeholder="F.eks. «Koselig lokale med scene»"
          value={d.title}
          onChangeText={(t) => setD({ ...d, title: t })}
          maxLength={60}
        />
        <Input
          label="Beskrivelse"
          placeholder="Hva tilbyr du? Detaljer …"
          value={d.about}
          onChangeText={(t) => setD({ ...d, about: t })}
          multiline
          maxLength={400}
        />
        {done ? (
          <DemoNote>
            {isNew
              ? "Listingen ble ikke publisert."
              : "Endringene ble ikke lagret."}
          </DemoNote>
        ) : null}
        <Button
          label={isNew ? "Publiser listing →" : "Lagre endringer"}
          variant="ink"
          disabled={d.title.trim().length < 3}
          onPress={() => setDone(true)}
        />
      </View>
    </Sheet>
  );
}
