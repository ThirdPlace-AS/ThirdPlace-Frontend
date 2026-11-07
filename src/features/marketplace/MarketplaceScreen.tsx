import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, ScrollView, TextInput, View } from "react-native";

import {
  Badge,
  EmptyState,
  Icon,
  Screen,
  Pressable as UIPressable,
  Text,
} from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import {
  LISTING_TYPES,
  listings,
  type MockListing,
  type MockListingType,
} from "@/fixtures";
import { libThumb } from "@/fixtures/images";
import { gutterPx, useThemeColors } from "@/theme";

// Marketplace, per the design (PDF p15–p16) and master spec §13: a B2B
// collaboration space where creators, businesses and enterprises offer
// venues, hosting, sponsorships and brand deals. Search + type chips (Alle /
// Venue / Skaper / Sponsing / Co-hosting / Brand), listing cards; a listing
// opens as a page (/marketplace/[id], Phase 12 H4c). BLOCKED_CONTRACT_GAP: no offers,
// contracts or payments exist — nothing is sent, saved or signed.
export default function MarketplaceScreen() {
  const colors = useThemeColors();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MockListingType | null>(null);
  // Filtre (PDF p16): only facets the fixtures carry — 'Kun gratis' reads
  // the display terms; no invented price logic.
  const [freeOnly, setFreeOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const data = useMemo(
    () =>
      listings.filter(
        (l) =>
          (!type || l.type === type) &&
          (!freeOnly || l.terms.toLowerCase().includes("gratis")) &&
          (!q ||
            l.title.toLowerCase().includes(q) ||
            l.owner.toLowerCase().includes(q) ||
            l.tags.some((t) => t.toLowerCase().includes(q))),
      ),
    [q, type, freeOnly],
  );

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Marketplace" />
      <FlatList
        data={data}
        keyExtractor={(l) => l.id}
        contentContainerClassName="gap-3 px-gutter pb-10 pt-4"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="gap-3 pb-1">
            <Text variant="caption" tone="muted">
              Her finner skapere og bedrifter hverandre.
            </Text>

            <UIPressable
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              accessibilityRole="button"
              onPress={() => router.push("/my-listings" as Href)}
              className="self-start"
              contentClassName="flex-row items-center gap-2"
            >
              <Icon name="albums-outline" size="sm" tone="ember" />
              <Text variant="label" weight="semibold" tone="ember">
                Mine listings →
              </Text>
            </UIPressable>
            <View className="flex-row gap-4">
              <UIPressable
                accessibilityRole="button"
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                onPress={() => setFilterOpen(true)}
                contentClassName="flex-row items-center gap-1.5"
              >
                <Icon name="options-outline" size="sm" tone="ink" />
                <Text variant="label" weight="semibold">
                  Filtre{freeOnly ? " (1)" : ""}
                </Text>
              </UIPressable>
              <UIPressable
                accessibilityRole="button"
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                onPress={() => router.push("/workspace/analytics" as Href)}
                contentClassName="flex-row items-center gap-1.5"
              >
                <Icon name="stats-chart-outline" size="sm" tone="ink" />
                <Text variant="label" weight="semibold">
                  Analyse
                </Text>
              </UIPressable>
            </View>
            <View className="flex-row items-center gap-2 rounded-full border border-line bg-surface px-4">
              <Icon name="search" size="md" tone="muted" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Søk listings, samarbeid …"
                placeholderTextColor={colors.muted}
                className="flex-1 py-3 text-ink font-normal"
                style={{ fontSize: 16 }}
                accessibilityLabel="Søk i Marketplace"
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              // -mx-gutter generates nothing for the custom token; bleed explicitly.
              style={{ marginHorizontal: -gutterPx }}
              contentContainerClassName="gap-2 px-gutter"
            >
              <Chip
                label="Alle"
                selected={type === null}
                onPress={() => setType(null)}
              />
              {LISTING_TYPES.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected={type === t}
                  onPress={() => setType(t)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            fill={false}
            icon="search-outline"
            title="Ingen listings matcher søket"
            actionLabel="Nullstill søk"
            onAction={() => {
              setQuery("");
              setType(null);
            }}
          />
        }
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => router.push(`/marketplace/${item.id}` as Href)}
          />
        )}
      />

      <Sheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filtre"
      >
        <View className="gap-3">
          <Text variant="label" weight="semibold">
            Type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip
              label="Alle"
              selected={type === null}
              onPress={() => setType(null)}
            />
            {LISTING_TYPES.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={type === t}
                onPress={() => setType(t)}
              />
            ))}
          </View>
          <Text variant="label" weight="semibold">
            Vilkår
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip
              label="Kun gratis / eksponering"
              selected={freeOnly}
              onPress={() => setFreeOnly((f) => !f)}
            />
          </View>
          <Button
            label={`Vis ${data.length} listings`}
            variant="ink"
            onPress={() => setFilterOpen(false)}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

function ListingCard({
  listing,
  onPress,
}: {
  listing: MockListing;
  onPress: () => void;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      onPress={onPress}
      contentClassName="flex-row gap-3 rounded-lg border border-line bg-surface p-3"
      pressedScale={0.99}
    >
      <Image
        source={libThumb(listing.cover)}
        contentFit="cover"
        transition={150}
        style={{ height: 88, width: 88, borderRadius: 12 }}
        className="bg-surfaceMuted"
        accessibilityLabel={listing.title}
      />
      <View className="flex-1 gap-1">
        <Text variant="body" weight="semibold" numberOfLines={1}>
          {listing.title}
        </Text>
        <Badge kind="status" label={listing.type} />
        <Text variant="label" weight="semibold">
          {listing.terms}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {listing.owner}
        </Text>
      </View>
    </UIPressable>
  );
}
