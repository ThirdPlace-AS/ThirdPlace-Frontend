import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { experiences, people, type MockPerson } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { colors } from "@/theme";

type Phase = "setup" | "lobby" | "swipe" | "match";

const FILTERS = ["Rolig", "Kreativt", "Utendørs", "Mat"];
const TIMES = ["1–2 timer", "Hele kvelden", "Hele dagen"];
// The demo's friends "agree" on this card, so a like on it produces a match.
const AGREED_ID = "e3";

// Gruppe-sveip (DEMO), per the design (PDF p8–p9): Start gruppe-sveip →
// lobby (who is ready) → shared deck ("Hvem har sveipet?") → "Dere matcher!".
// BLOCKED_CONTRACT_GAP: there is no group-swipe session, invite or matching
// contract. Friends are fixture people and their readiness and votes are
// simulated — the screens say so plainly.
export default function GroupSwipeScreen() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [name, setName] = useState("");
  const [invited, setInvited] = useState<string[]>(["u1", "u2"]);
  const [filters, setFilters] = useState<string[]>([]);
  const [time, setTime] = useState<string | null>(null);
  const [ready, setReady] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const friends = people.filter((p) => invited.includes(p.id));
  const deck = experiences.filter((e) => e.status !== "cancelled");
  const card = deck[index % deck.length];
  const title = name.trim() || "Gruppe-sveip";

  // Lobby: simulated friends become ready one by one.
  useEffect(() => {
    if (phase !== "lobby" || ready.length >= friends.length) return;
    const t = setTimeout(
      () => setReady((r) => [...r, friends[r.length]?.id ?? ""]),
      1200,
    );
    return () => clearTimeout(t);
  }, [phase, ready, friends]);

  const back = () => {
    if (phase === "setup") router.back();
    else if (phase === "lobby") setPhase("setup");
    else setPhase("lobby");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-gutter pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tilbake"
          onPress={back}
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
        >
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </Pressable>
        {phase === "swipe" ? (
          <Text className="text-base font-semibold text-ink">{title}</Text>
        ) : null}
        <View className="w-10" />
      </View>

      {phase === "setup" ? (
        <ScrollView
          contentContainerClassName="gap-4 p-gutter pb-8"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-3xl font-bold text-ink">
            Start gruppe-sveip
          </Text>
          <Text className="text-sm text-muted">
            Sveip sammen med venner — finn noe dere alle vil.
          </Text>
          <Input
            label="Navn på økten"
            placeholder="F.eks. «Lørdagsplanlegging»"
            value={name}
            onChangeText={setName}
            maxLength={40}
          />
          <Text className="text-sm font-semibold text-ink">Inviter venner</Text>
          <View className="flex-row flex-wrap gap-3">
            {people.map((p) => {
              const on = invited.includes(p.id);
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={p.name}
                  onPress={() =>
                    setInvited((s) =>
                      on ? s.filter((x) => x !== p.id) : [...s, p.id],
                    )
                  }
                  className="items-center gap-1"
                >
                  <View
                    className={`rounded-full border-2 p-0.5 ${on ? "border-ink" : "border-transparent"}`}
                  >
                    <Image
                      source={libImage(p.avatar)}
                      style={{ height: 48, width: 48, borderRadius: 24 }}
                    />
                  </View>
                  <Text className="text-xs text-ink">
                    {p.name.split(" ")[0]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="text-sm font-semibold text-ink">
            Filtre for gruppen
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Chip
                key={f}
                label={f}
                selected={filters.includes(f)}
                onPress={() =>
                  setFilters((s) =>
                    s.includes(f) ? s.filter((x) => x !== f) : [...s, f],
                  )
                }
              />
            ))}
          </View>
          <Text className="text-sm font-semibold text-ink">
            Tid tilgjengelig
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TIMES.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={time === t}
                onPress={() => setTime(t)}
              />
            ))}
          </View>
          <View className="rounded-md bg-surfaceMuted p-3">
            <Text className="text-sm text-ink">
              Alle får se kortene — match når alle sveiper høyre.
            </Text>
          </View>
          <Button
            label="Start gruppe-sveip →"
            variant="ink"
            disabled={invited.length === 0}
            onPress={() => {
              setReady([]);
              setPhase("lobby");
            }}
          />
        </ScrollView>
      ) : null}

      {phase === "lobby" ? (
        <ScrollView contentContainerClassName="gap-4 p-gutter pb-8">
          <Text className="text-3xl font-bold text-ink">{title}</Text>
          <Text className="text-sm text-muted">
            Venter på at alle blir med …
          </Text>
          {friends.map((f) => (
            <MemberRow key={f.id} person={f} ready={ready.includes(f.id)} />
          ))}
          {filters.length || time ? (
            <View className="gap-2 rounded-md border border-line bg-surface p-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
                Økt-innstillinger
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[...filters, ...(time ? [time] : [])].map((f) => (
                  <View
                    key={f}
                    className="rounded-full bg-surfaceMuted px-3 py-1"
                  >
                    <Text className="text-xs font-medium text-ink">{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          <Text className="text-center text-sm text-muted">
            {ready.length} av {friends.length} klare
          </Text>
          <DemoNote>
            Vennene er eksempler — at de blir klare er simulert, og ingen
            invitasjon er sendt.
          </DemoNote>
          <Button
            label="Start når alle er klare"
            variant="ink"
            disabled={ready.length < friends.length}
            onPress={() => {
              setIndex(0);
              setPhase("swipe");
            }}
          />
        </ScrollView>
      ) : null}

      {phase === "swipe" && card ? (
        <ScrollView contentContainerClassName="gap-4 p-gutter pb-8">
          <View className="overflow-hidden rounded-xl bg-ink">
            <Image
              source={card.photos[0]}
              contentFit="cover"
              style={{ height: 300, width: "100%" }}
            />
          </View>
          <View className="gap-1">
            <Text className="text-2xl font-bold text-ink">{card.title}</Text>
            <Text className="text-sm text-muted">{card.when}</Text>
            <View className="flex-row flex-wrap gap-2 pt-1">
              {card.tags.map((t) => (
                <View
                  key={t}
                  className="rounded-full border border-line px-3 py-1"
                >
                  <Text className="text-xs text-ink">{t}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text className="text-center text-sm font-semibold text-ink">
            Hvem har sveipet?
          </Text>
          <View className="flex-row justify-center gap-4">
            {friends.map((f) => (
              <View key={f.id} className="items-center gap-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-success">
                  <Ionicons name="checkmark" size={18} color={colors.onInk} />
                </View>
                <Text className="text-xs text-ink">{f.name.split(" ")[0]}</Text>
              </View>
            ))}
          </View>
          <Text className="text-center text-xs text-muted">
            Stemmer avsløres ikke før match!
          </Text>
          <View className="flex-row justify-center gap-6">
            <RoundButton
              icon="close"
              label="Hopp over"
              onPress={() => setIndex((i) => i + 1)}
            />
            <RoundButton
              icon="heart"
              label="Liker"
              filled
              onPress={() =>
                card.id === AGREED_ID
                  ? setPhase("match")
                  : setIndex((i) => i + 1)
              }
            />
          </View>
          <DemoNote>Stemmene til vennene er simulert i demoen.</DemoNote>
        </ScrollView>
      ) : null}

      {phase === "match" && card ? (
        <View className="flex-1 justify-center gap-5 p-gutter">
          <Image
            source={card.photos[0]}
            contentFit="cover"
            style={{ height: 200, width: "100%", borderRadius: 20 }}
          />
          <Text className="text-center text-3xl font-bold text-ink">
            Dere matcher!
          </Text>
          <Text className="text-center text-sm text-muted">
            Alle sveipet høyre på {card.title}.
          </Text>
          <View className="flex-row items-center gap-1.5 self-center rounded-full bg-success/15 px-3 py-1">
            <Ionicons name="checkmark" size={14} color={colors.success} />
            <Text className="text-xs font-semibold text-success">
              Alle er enige
            </Text>
          </View>
          <DemoNote>Ingen gruppechat ble opprettet i demoen.</DemoNote>
          <Button
            label="Åpne chatten →"
            variant="ink"
            onPress={() => router.navigate("/chat")}
          />
          <Button
            label="Fortsett å sveipe"
            variant="secondary"
            onPress={() => {
              setIndex((i) => i + 1);
              setPhase("swipe");
            }}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function MemberRow({ person, ready }: { person: MockPerson; ready: boolean }) {
  return (
    <View className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-3">
      <Image
        source={libImage(person.avatar)}
        style={{ height: 40, width: 40, borderRadius: 20 }}
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink">{person.name}</Text>
        <Text className={`text-xs ${ready ? "text-success" : "text-muted"}`}>
          {ready ? "Klar ✓" : "Venter …"}
        </Text>
      </View>
    </View>
  );
}

function RoundButton({
  icon,
  label,
  filled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  filled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`h-16 w-16 items-center justify-center rounded-full ${
        filled ? "bg-ink" : "border border-line bg-surface"
      } active:opacity-80`}
    >
      <Ionicons
        name={icon}
        size={28}
        color={filled ? colors.ember : colors.ink}
      />
    </Pressable>
  );
}
