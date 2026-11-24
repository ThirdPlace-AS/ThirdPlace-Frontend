// Ny / Rediger listing (PDF p16), a form page since Phase 12 H4c:
// /my-listings/new and /my-listings/[id]/edit. BLOCKED_CONTRACT_GAP: no
// listing entity, publishing or pricing contract. Publiser adds the listing
// to this session's lists and Lagre endringer saves onto it (created.ts,
// review 2026-11-18 H-04), then it confirms in product voice and goes back.
import { useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { DiscardChangesSheet } from "@/components/DiscardChangesSheet";
import { showToast } from "@/components/Toast";
import { FormPage, Text, Button, Chip, Input } from "@/components/ui";
import { confirmToast } from "@/copy";
import { LISTING_TYPES, listingById, type MockListingType } from "@/fixtures";
import { createListing, updateListing } from "@/fixtures/created";
import { goBackOr } from "@/lib/navigation";
import { useConfirmLeave } from "@/lib/useConfirmLeave";

type Draft = { title: string; type: MockListingType; about: string };

export default function ListingEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = id ? listingById(id) : undefined;
  const isNew = !existing;
  const [start] = useState<Draft>(() =>
    existing
      ? {
          title: existing.title,
          type: existing.type,
          about: existing.description,
        }
      : { title: "", type: "Venue", about: "" },
  );
  const [d, setD] = useState<Draft>(start);
  // Leaving with unsaved input asks first (review 2026-11-18 H-12).
  const leave = useConfirmLeave(
    d.title !== start.title || d.type !== start.type || d.about !== start.about,
  );
  const short = d.title.trim().length < 3;
  return (
    <FormPage
      title={isNew ? "Ny listing" : "Rediger listing"}
      footer={
        <>
          <Button
            label={isNew ? "Publiser listing" : "Lagre endringer"}
            variant="ink"
            disabled={short}
            onPress={() => {
              if (existing) updateListing(existing.id, d);
              else createListing(d);
              leave.allowLeave();
              goBackOr("/my-listings" as Href);
              showToast(
                isNew
                  ? confirmToast.listingPublished
                  : confirmToast.listingSaved,
              );
            }}
          />
          {short ? (
            <Text variant="caption" tone="muted" className="text-center">
              Tittelen trenger minst 3 tegn.
            </Text>
          ) : null}
        </>
      }
    >
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
      <DiscardChangesSheet
        visible={leave.asking}
        onStay={leave.stay}
        onDiscard={leave.leave}
      />
    </FormPage>
  );
}
