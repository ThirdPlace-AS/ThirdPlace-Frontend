import Constants from "expo-constants";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

import { SearchField } from "@/components/pickers/Pickers";
import { EmptyState } from "@/components/states/StateView";
import { ListRow, Page, Screen, Text } from "@/components/ui";
import { Header } from "@/components/ui/Header";
import { MAP_PREVIEW_CREDIT } from "@/components/map/MapLayerSheet";
import { LogoMark } from "@/components/Logo";

import licenses from "../../generated/licenses.json";

// Om ThirdPlace and Lisenser (founder 2026-11-07, Phase 15): the app version
// and the open-source code, font, map data and photos the app is built on,
// each package with its own licence text (src/generated/licenses.json, made by
// scripts/build-licenses.js from the bundle). No terms, privacy policy or
// guidelines here until their texts exist (docs/LAUNCH_CHECKLIST.md).

type LicensePackage = {
  name: string;
  version: string;
  license: string;
  copyright: string[];
  /** From package.json when the licence file names no copyright. */
  author: string | null;
  text: string | null;
  /** The package ships no licence file: the common MIT text is shown. */
  shared: boolean;
};
const PACKAGES = licenses.packages as LicensePackage[];
const TEXTS = licenses.texts as Record<string, string>;

export function AboutScreen() {
  const version = Constants.expoConfig?.version ?? "–";
  return (
    <Page title="Om ThirdPlace">
      <View className="items-center gap-2 py-4">
        <LogoMark size={56} variant="mark" />
        <Text variant="h2">ThirdPlace</Text>
        <Text variant="caption" tone="muted">
          Versjon {version}
        </Text>
      </View>
      <ListRow
        variant="card"
        icon="document-text-outline"
        title="Lisenser"
        subtitle="Åpen kildekode, skrift, kartdata og bilder"
        onPress={() => router.push("/settings/licenses" as Href)}
      />
    </Page>
  );
}

// Credits that are not npm packages, as their own sources state them.
const CREDITS = [
  { title: "Kartdata", detail: MAP_PREVIEW_CREDIT.replace(/^Kart /, "") },
  { title: "Bilder", detail: "Unsplash (Unsplash-lisensen)" },
  {
    title: "Kartikoner",
    detail:
      "Material Design Icons fra Pictogrammers (Pictogrammers Free License), levert med @expo/vector-icons",
  },
];

export function LicensesScreen() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t
      ? PACKAGES.filter(
          (p) =>
            p.name.toLowerCase().includes(t) ||
            p.license.toLowerCase().includes(t),
        )
      : PACKAGES;
  }, [q]);
  return (
    <Screen edges={["top"]}>
      <Header title="Lisenser" />
      <FlatList
        data={list}
        keyExtractor={(p) => `${p.name}@${p.version}`}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-2 px-gutter pb-12 pt-2"
        ListHeaderComponent={
          <View className="gap-3 pb-2">
            <Text variant="caption" tone="muted">
              ThirdPlace bygger på programvare med åpen kildekode. Trykk på en
              pakke for lisensen.
            </Text>
            {CREDITS.map((c) => (
              <View
                key={c.title}
                className="rounded-md border border-line bg-surface p-3"
              >
                <Text variant="label" weight="semibold">
                  {c.title}
                </Text>
                <Text variant="caption" tone="muted">
                  {c.detail}
                </Text>
              </View>
            ))}
            <SearchField
              autoFocus={false}
              value={q}
              onChange={setQ}
              placeholder="Søk pakker …"
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            fill={false}
            icon="search"
            title="Ingen treff"
            message={`Ingen pakker matcher «${q.trim()}».`}
          />
        }
        renderItem={({ item }) => (
          <ListRow
            variant="card"
            title={item.name}
            subtitle={`${item.version} · ${item.license}`}
            onPress={() =>
              router.push({
                pathname: "/settings/license",
                params: { name: item.name, version: item.version },
              } as Href)
            }
          />
        )}
      />
    </Screen>
  );
}

/** Licence files are wrapped at ~80 columns; on a phone each paragraph reads
 *  better as one flowing block. Paragraph breaks are kept. */
function reflow(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .join("\n\n");
}

export function LicenseScreen() {
  const { name, version } = useLocalSearchParams<{
    name: string;
    version?: string;
  }>();
  const pkg =
    PACKAGES.find((p) => p.name === name && p.version === version) ??
    PACKAGES.find((p) => p.name === name);
  if (!pkg) {
    return (
      <Screen edges={["top"]}>
        <Header title="Lisens" />
        <EmptyState icon="document-text-outline" title="Fant ikke lisensen" />
      </Screen>
    );
  }
  const raw = pkg.text ? TEXTS[pkg.text] : undefined;
  const text = raw ? reflow(raw) : undefined;
  return (
    <Page title={pkg.name}>
      <Text variant="caption" tone="muted">
        {pkg.version} · {pkg.license}
      </Text>
      {pkg.copyright.map((c) => (
        <Text key={c} variant="caption">
          {c}
        </Text>
      ))}
      {pkg.author ? <Text variant="caption">Utgiver: {pkg.author}</Text> : null}
      {pkg.shared ? (
        <Text variant="caption" tone="muted">
          Pakken har ingen egen lisensfil. Dette er MIT-teksten pakkene med
          samme lisens bruker.
        </Text>
      ) : null}
      <Text variant="caption" selectable>
        {text ?? `Lisens: ${pkg.license}`}
      </Text>
    </Page>
  );
}
