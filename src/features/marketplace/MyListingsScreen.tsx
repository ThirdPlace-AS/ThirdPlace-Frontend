import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  Badge,
  EmptyState,
  IconButton,
  Screen,
  ScrollRow,
  Text,
} from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { showToastAfterSheet } from "@/components/Toast";
import { confirmToast } from "@/copy";
import { LISTING_TYPES, listings, type MockListingType } from "@/fixtures";

// Mine listings + Ny / Rediger listing, per the design (PDF p16).
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
        <ScrollRow radio>
          {TABS.map((t) => (
            <Chip
              key={t}
              role="radio"
              label={`${t} (${MINE.filter((l) => l.state === t).length})`}
              selected={tab === t}
              onPress={() => setTab(t)}
            />
          ))}
        </ScrollRow>
        {rows.length === 0 ? (
          <EmptyState
            fill={false}
            icon="pricetags-outline"
            title="Ingen listings her ennå"
            message="Bruk + nederst for å lage en."
          />
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
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Text variant="label" weight="semibold" className="underline">
                Rediger
              </Text>
            </Pressable>
          </View>
        ))}
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

        <Button
          label={isNew ? "Publiser listing →" : "Lagre endringer"}
          variant="ink"
          disabled={d.title.trim().length < 3}
          onPress={() => {
            onClose();
            showToastAfterSheet(
              isNew ? confirmToast.listingPublished : confirmToast.listingSaved,
            );
          }}
        />
        {d.title.trim().length < 3 ? (
          <Text variant="caption" tone="muted" className="text-center">
            Tittelen trenger minst 3 tegn.
          </Text>
        ) : null}
      </View>
    </Sheet>
  );
}
