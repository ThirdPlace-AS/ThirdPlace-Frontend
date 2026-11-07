// A Marketplace listing (PDF p15–p16), a page since Phase 12 H4c (content
// you read): gallery, type, description, terms, tags, owner, and the
// actions "Send forespørsel" / "Lagre" pinned at the bottom. Guests get the
// sign-in prompt. BLOCKED_CONTRACT_GAP: no offers, contracts or payments;
// Lagre toggles locally.
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Gallery } from "@/components/map/Gallery";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Badge, EmptyState, FormPage, Icon, Page, Text } from "@/components/ui";
import { listingById } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { goBackOr } from "@/lib/navigation";

export default function ListingScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const listing = listingById(id);
  const { isGuest } = useGuestMode();
  const [saved, setSaved] = useState(false);
  const [signIn, setSignIn] = useState(false);
  if (!listing) {
    return (
      <Page title="Marketplace">
        <EmptyState
          fill={false}
          icon="pricetags-outline"
          title="Fant ikke listingen"
          actionLabel="Til Marketplace"
          onAction={() => goBackOr("/marketplace" as Href)}
        />
      </Page>
    );
  }
  return (
    <FormPage
      title={listing.title}
      footer={
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Send forespørsel"
              variant="ink"
              onPress={() =>
                isGuest
                  ? setSignIn(true)
                  : router.push({
                      pathname: "/collab/new",
                      params: { listing: listing.id },
                    })
              }
            />
          </View>
          <View className="w-28">
            <Button
              label={saved ? "Lagret" : "Lagre"}
              icon={saved ? "bookmark" : "bookmark-outline"}
              variant="secondary"
              onPress={() => (isGuest ? setSignIn(true) : setSaved((v) => !v))}
            />
          </View>
        </View>
      }
    >
      <Gallery
        photos={listing.photos.map(libImage)}
        height={200}
        label={listing.title}
      />
      <Badge kind="status" label={listing.type} />
      <Text variant="label" weight="regular">
        {listing.description}
      </Text>
      <View className="overflow-hidden rounded-md border border-line bg-surface">
        {[{ label: "Pris", value: listing.terms }, ...listing.details].map(
          (d) => (
            <View
              key={d.label}
              className="flex-row justify-between border-b border-line px-3.5 py-3"
            >
              <Text variant="caption" tone="muted">
                {d.label}
              </Text>
              <Text variant="label">{d.value}</Text>
            </View>
          ),
        )}
      </View>
      <View className="flex-row flex-wrap gap-2">
        {listing.tags.map((t) => (
          <View key={t} className="rounded-full bg-surfaceMuted px-3 py-1">
            <Text variant="caption" weight="medium">
              {t}
            </Text>
          </View>
        ))}
      </View>
      <View className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3">
        <Icon name="tp-business" size="md" tone="ink" />
        <View className="flex-1">
          <Text variant="label" weight="semibold">
            {listing.owner}
          </Text>
          <Text variant="caption" tone="muted">
            {listing.ownerMeta}
          </Text>
        </View>
      </View>
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="sende forespørsler i Marketplace"
      />
    </FormPage>
  );
}
