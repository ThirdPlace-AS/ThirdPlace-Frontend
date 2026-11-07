// Ny / Rediger listing (PDF p16), a form page since Phase 12 H4c:
// /my-listings/new and /my-listings/[id]/edit. BLOCKED_CONTRACT_GAP: no
// listing entity, publishing or pricing contract; it confirms in product
// voice and goes back.
import { useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { showToast } from "@/components/Toast";
import { FormPage, Text } from "@/components/ui";
import { confirmToast } from "@/copy";
import { LISTING_TYPES, listingById, type MockListingType } from "@/fixtures";
import { goBackOr } from "@/lib/navigation";

type Draft = { title: string; type: MockListingType; about: string };

export default function ListingEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = id ? listingById(id) : undefined;
  const isNew = !existing;
  const [d, setD] = useState<Draft>(
    existing
      ? {
          title: existing.title,
          type: existing.type,
          about: existing.description,
        }
      : { title: "", type: "Venue", about: "" },
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
    </FormPage>
  );
}
