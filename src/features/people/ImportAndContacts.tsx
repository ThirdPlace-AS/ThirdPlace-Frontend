import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Icon, Screen, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { RouteHeader } from "@/components/RouteHeader";

// Importer innhold (PDF p26): paste a link (event page, Instagram post) to
// prefill an experience or place. DEMO — nothing is fetched or parsed (no
// content-import contract); the button only says so.
export function ImportContentScreen() {
  const [url, setUrl] = useState("");
  const [tried, setTried] = useState(false);
  const valid = /^https?:\/\/\S+\.\S+/.test(url.trim());
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Importer innhold" />
      <ScrollView
        contentContainerClassName="gap-4 px-gutter py-4 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="caption" tone="muted">
          Lim inn en lenke til et arrangement eller et innlegg, så fyller vi ut
          det vi kan.
        </Text>
        <Input
          label="Lenke"
          placeholder="https://…"
          value={url}
          onChangeText={setUrl}
          keyboardType="default"
        />
        {url.length > 0 && !valid ? (
          <Text variant="caption" tone="danger">
            Skriv inn en hel lenke som starter med https://
          </Text>
        ) : null}
        <View className="gap-2 rounded-md bg-surfaceMuted p-3">
          {[
            "Arrangementssider",
            "Instagram-innlegg",
            "Facebook-arrangementer",
          ].map((s) => (
            <View key={s} className="flex-row items-center gap-2">
              <Icon name="link-outline" size="sm" tone="ink" />
              <Text variant="label" weight="regular">
                {s}
              </Text>
            </View>
          ))}
        </View>
        {tried ? (
          <DemoNote>Import er ikke slått på. Ingenting ble hentet.</DemoNote>
        ) : null}
        <Button
          label="Importer"
          variant="ink"
          disabled={!valid}
          onPress={() => setTried(true)}
        />
      </ScrollView>
    </Screen>
  );
}

// Inviter kontakter (PDF p22): permission explainer before reading contacts.
// DEMO — the device contacts permission is never requested and no contact is
// read or uploaded.
export function InviteContactsScreen() {
  const [tried, setTried] = useState(false);
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Inviter kontakter" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-6 pb-12">
        <View className="items-center gap-3">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-surfaceMuted">
            <Icon name="people-outline" size="xl" tone="ink" />
          </View>
          <Text variant="h2" weight="bold" className="text-center">
            Finn venner som allerede er her
          </Text>
          <Text variant="caption" tone="muted" className="px-4 text-center">
            Se hvem av kontaktene dine som bruker ThirdPlace, og inviter resten.
          </Text>
        </View>
        {tried ? (
          <DemoNote>
            Tilgang til kontakter blir ikke spurt om i demoen.
          </DemoNote>
        ) : null}
        <Button
          label="Gi tilgang til kontakter"
          variant="ink"
          onPress={() => setTried(true)}
        />
      </ScrollView>
    </Screen>
  );
}
