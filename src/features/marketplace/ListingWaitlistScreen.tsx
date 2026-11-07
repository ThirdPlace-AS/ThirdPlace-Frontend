// Venteliste for a listing you own (PDF p18): who waits for a spot, in the
// order they joined, with the listing's capacity on top and "Tilby" per row
// (opens Nytt samarbeid with that partner filled in). The count shown is the
// list length. Left out: the PDF's "Auto-godta" tag, an acceptance rule that
// is not specified. BLOCKED_CONTRACT_GAP: no listing, waitlist or offer
// backend; the list is MOCK and nothing is sent until the offer page's own
// confirm.
import { router, useLocalSearchParams, type Href } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Avatar, EmptyState, Page, Text } from "@/components/ui";
import { listingById } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { goBackOr } from "@/lib/navigation";

export default function ListingWaitlistScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const listing = listingById(id);
  const waitlist = listing?.waitlist ?? [];

  if (!listing) {
    return (
      <Page title="Venteliste">
        <EmptyState
          icon="pricetags-outline"
          title="Fant ikke listingen"
          actionLabel="Til Mine listings"
          onAction={() => goBackOr("/my-listings" as Href)}
        />
      </Page>
    );
  }

  const { capacity, taken } = listing;
  const full =
    capacity !== undefined && taken !== undefined && taken >= capacity;

  return (
    <Page title="Venteliste">
      <Text variant="caption" tone="muted">
        {listing.title} · {waitlist.length} på venteliste
      </Text>

      {capacity !== undefined && taken !== undefined ? (
        <View className="gap-2 rounded-lg border border-line bg-surface p-3.5">
          <View className="flex-row items-center justify-between">
            <Text variant="label" weight="semibold">
              Kapasitet
            </Text>
            <Text
              variant="label"
              weight="semibold"
              tone={full ? "warning" : "ink"}
            >
              {full
                ? `Fullt (${taken} av ${capacity} samarbeid)`
                : `${taken} av ${capacity} samarbeid`}
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-surfaceMuted">
            <View
              className={`h-2 rounded-full ${full ? "bg-warning" : "bg-ink"}`}
              style={{
                width: `${Math.min(100, Math.round((taken / Math.max(1, capacity)) * 100))}%`,
              }}
            />
          </View>
        </View>
      ) : null}

      {waitlist.length === 0 ? (
        <EmptyState
          icon="hourglass-outline"
          title="Ingen på ventelisten"
          message="Når listingen er full, kan andre melde seg på her."
        />
      ) : (
        waitlist.map((w, i) => (
          <View
            key={w.name}
            className="flex-row items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3"
          >
            <View className="h-8 w-8 items-center justify-center rounded-sm bg-ink">
              <Text variant="caption" weight="bold" tone="onInk">
                #{i + 1}
              </Text>
            </View>
            <Avatar
              name={w.name}
              source={libImage(w.avatar)}
              size="md"
              decorative
            />
            <View className="flex-1">
              <Text variant="label" weight="semibold" numberOfLines={1}>
                {w.name}
              </Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {w.role} · {w.joined}
              </Text>
            </View>
            <Button
              label="Tilby"
              size="sm"
              variant="secondary"
              fullWidth={false}
              accessibilityLabel={`Tilby samarbeid til ${w.name}`}
              onPress={() =>
                router.push(
                  `/collab/new?listing=${listing.id}&partner=${encodeURIComponent(w.name)}` as Href,
                )
              }
            />
          </View>
        ))
      )}
    </Page>
  );
}
