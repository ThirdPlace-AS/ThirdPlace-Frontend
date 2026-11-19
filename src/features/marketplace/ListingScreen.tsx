// A Marketplace listing (PDF p15–p16), a page since Phase 12 H4c (content
// you read): gallery, type, description, terms, tags, owner, and the
// actions "Send forespørsel" / "Lagre" pinned at the bottom. Guests get the
// sign-in prompt. BLOCKED_CONTRACT_GAP: no offers, contracts or payments;
// Lagre toggles locally. Your own listing (Mine listings) shows "Rediger
// listing" instead: no request to yourself, no saving your own (review
// 2026-11-18 #18).
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Gallery } from "@/components/map/Gallery";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import {
  Badge,
  EmptyState,
  FormPage,
  Icon,
  Page,
  Text,
  Button,
} from "@/components/ui";
import { listingById, myListingStates } from "@/fixtures";
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
  // A listing published this session has no price row or details (H-04).
  const rows = [
    ...(listing.terms ? [{ label: "Pris", value: listing.terms }] : []),
    ...listing.details,
  ];
  const own = !isGuest && listing.id in myListingStates;
  return (
    <FormPage
      title={listing.title}
      footer={
        own ? (
          <Button
            label="Rediger listing"
            variant="ink"
            onPress={() =>
              router.push(`/my-listings/${listing.id}/edit` as Href)
            }
          />
        ) : (
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
                onPress={() =>
                  isGuest ? setSignIn(true) : setSaved((v) => !v)
                }
              />
            </View>
          </View>
        )
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
      {rows.length > 0 ? (
        <View className="overflow-hidden rounded-md border border-line bg-surface">
          {rows.map((d) => (
            <View
              key={d.label}
              className="flex-row justify-between border-b border-line px-4 py-3"
            >
              <Text variant="caption" tone="muted">
                {d.label}
              </Text>
              <Text variant="label">{d.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
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
          {listing.ownerMeta ? (
            <Text variant="caption" tone="muted">
              {listing.ownerMeta}
            </Text>
          ) : null}
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
