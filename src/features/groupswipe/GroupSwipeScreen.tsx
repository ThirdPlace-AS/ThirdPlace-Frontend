import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { type Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import {
  Avatar,
  BACK_ICON,
  FadeSwap,
  Icon,
  IconButton,
  ListRow,
  pageBody,
  Pressable as UIPressable,
  Screen,
  ScrollRow,
  StickyFooter,
  Text,
  KeyboardAvoider,
  Button,
  Chip,
  Input,
} from "@/components/ui";
import { showToast } from "@/components/Toast";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import {
  chatForExperience,
  experienceById,
  experiences,
  people,
  profile,
  type MockExperience,
  type MockPerson,
} from "@/fixtures";
import { useFollowing } from "@/lib/following";
import { libImage, libThumb } from "@/fixtures/images";
import { media } from "@/theme";

type Phase = "setup" | "lobby" | "swipe" | "match";

const FILTERS = ["Rolig", "Kreativt", "Utendørs", "Mat"];
const TIMES = ["1–2 timer", "Hele kvelden", "Hele dagen"];
// The demo's friends "agree" on this card, so a like on it produces a match.
const AGREED_ID = "e3";
const LOBBY_STEP_MS = 500;

// Gruppe-sveip, per the design (PDF p8–p9): Start gruppe-sveip
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
  // Invite from your network: people you follow or who follow you (a
  // catalogue host joins it once you follow them).
  const following = useFollowing();
  const network = people.filter(
    (p) => following.has(p.id) || profile.followerIds.includes(p.id),
  );
  // /group-swipe?from=saved (approved addition, 2026-11-06): the deck is the
  // user's saved experiences, it ends instead of looping, and the simulated
  // friends agree on the first card the user likes.
  const fromSaved = useLocalSearchParams<{ from?: string }>().from === "saved";
  const { savedIds, isSaved, toggle } = useMapSaved();
  const { isGuest } = useGuestMode();
  const [signInOpen, setSignInOpen] = useState(false);
  const savedDeck = useMemo(
    () =>
      savedIds
        .filter((k) => k.startsWith("experience:"))
        .map((k) => experienceById(k.slice("experience:".length)))
        .filter((e): e is MockExperience => !!e),
    [savedIds],
  );
  const deck = fromSaved
    ? savedDeck
    : experiences.filter((e) => e.status !== "cancelled");
  const deckEnded = fromSaved && index >= deck.length;
  const card = fromSaved ? deck[index] : deck[index % deck.length];
  // Photos scale with the screen so the vote buttons stay in view on a
  // 640 dp phone (fixed 300 / 200 pushed them below the fold).
  const { height: winH } = useWindowDimensions();
  const cardImgH = Math.round(Math.min(300, winH * 0.3));
  const matchImgH = Math.round(Math.min(200, winH * 0.24));
  // The example chat pinned to the matched experience, if one exists.
  const matchChat = card ? chatForExperience(card.id) : undefined;
  const title = name.trim() || "Gruppe-sveip";

  // Lobby: simulated friends become ready one by one (labelled as a
  // simulation). Paced at 500 ms: enough to read, not a wait for nothing.
  useEffect(() => {
    if (phase !== "lobby" || ready.length >= friends.length) return;
    const t = setTimeout(
      () => setReady((r) => [...r, friends[r.length]?.id ?? ""]),
      LOBBY_STEP_MS,
    );
    return () => clearTimeout(t);
  }, [phase, ready, friends]);

  const back = () => {
    if (phase === "setup") router.back();
    else if (phase === "lobby") setPhase("setup");
    else setPhase("lobby");
  };

  return (
    <Screen>
      <View className="min-h-12 flex-row items-center justify-between px-gutter">
        <IconButton icon={BACK_ICON} label="Tilbake" onPress={back} />
        {phase === "swipe" ? (
          <Text variant="body" weight="semibold">
            {title}
          </Text>
        ) : null}
        <View className="w-10" />
      </View>

      {phase === "setup" ? (
        <KeyboardAvoider>
          <ScrollView
            contentContainerClassName={pageBody.blocks}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-1">
              <Text variant="display">Start gruppe-sveip</Text>
              <Text variant="caption" tone="muted">
                Sveip sammen med venner og finn noe alle har lyst til.
              </Text>
            </View>
            <Input
              label="Navn på økten"
              placeholder="F.eks. «Lørdagsplanlegging»"
              value={name}
              onChangeText={setName}
              maxLength={40}
            />
            <View className="gap-2">
              <Text variant="label" weight="semibold">
                Inviter venner
                {invited.length ? ` · ${invited.length} valgt` : ""}
              </Text>
              <ScrollRow gap="gap-3">
                {network.map((p) => {
                  const on = invited.includes(p.id);
                  return (
                    <UIPressable
                      key={p.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      accessibilityLabel={p.name}
                      onPress={() =>
                        setInvited((s) =>
                          on ? s.filter((x) => x !== p.id) : [...s, p.id],
                        )
                      }
                      contentClassName="items-center gap-1"
                    >
                      <View
                        className={`rounded-full border-2 p-1 ${on ? "border-ink" : "border-transparent"}`}
                      >
                        <Image
                          source={libThumb(p.avatar)}
                          style={{ height: 48, width: 48, borderRadius: 24 }}
                        />
                        {on ? (
                          // A filled check makes the choice readable at a glance.
                          <View className="absolute -bottom-0.5 -right-0.5 h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-ink">
                            <Icon name="checkmark" size="sm" tone="onInk" />
                          </View>
                        ) : null}
                      </View>
                      <Text
                        variant="caption"
                        weight={on ? "semibold" : "regular"}
                      >
                        {p.name.split(" ")[0]}
                      </Text>
                    </UIPressable>
                  );
                })}
              </ScrollRow>
            </View>
            {fromSaved ? (
              <View className="gap-1 rounded-md border border-line bg-surface p-3">
                <Text variant="label" weight="semibold">
                  Kortstokk: Lagret ({deck.length})
                </Text>
                <Text variant="caption" tone="muted">
                  Dere sveiper på opplevelsene du har lagret.
                </Text>
              </View>
            ) : (
              <>
                <View className="gap-2">
                  <Text variant="label" weight="semibold">
                    Filtre for gruppen
                  </Text>
                  <ScrollRow>
                    {FILTERS.map((f) => (
                      <Chip
                        key={f}
                        label={f}
                        selected={filters.includes(f)}
                        onPress={() =>
                          setFilters((s) =>
                            s.includes(f)
                              ? s.filter((x) => x !== f)
                              : [...s, f],
                          )
                        }
                      />
                    ))}
                  </ScrollRow>
                </View>
                <View className="gap-2">
                  <Text variant="label" weight="semibold">
                    Tid tilgjengelig
                  </Text>
                  <ScrollRow radio>
                    {TIMES.map((t) => (
                      <Chip
                        key={t}
                        role="radio"
                        label={t}
                        selected={time === t}
                        onPress={() => setTime(t)}
                      />
                    ))}
                  </ScrollRow>
                </View>
              </>
            )}
            <View className="rounded-md bg-surfaceMuted p-3">
              <Text variant="label" weight="regular">
                Alle ser de samme kortene. Det blir match når alle sveiper til
                høyre.
              </Text>
            </View>
          </ScrollView>
          <StickyFooter>
            <Button
              label="Start gruppe-sveip"
              variant="ink"
              disabled={invited.length === 0}
              onPress={() => {
                setReady([]);
                setPhase("lobby");
              }}
            />
            {invited.length === 0 ? (
              <Text variant="caption" tone="muted" className="text-center">
                Velg minst én venn.
              </Text>
            ) : null}
          </StickyFooter>
        </KeyboardAvoider>
      ) : null}

      {phase === "lobby" ? (
        <ScrollView contentContainerClassName={pageBody.blocks}>
          <Text variant="display" accessibilityRole="text">
            {title}
          </Text>
          <Text variant="caption" tone="muted">
            Venter på at alle blir med …
          </Text>
          {friends.map((f) => (
            <MemberRow key={f.id} person={f} ready={ready.includes(f.id)} />
          ))}
          {filters.length || time ? (
            <View className="gap-2 rounded-md border border-line bg-surface p-4">
              <Text variant="title" accessibilityRole="header">
                Økt-innstillinger
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[...filters, ...(time ? [time] : [])].map((f) => (
                  <View
                    key={f}
                    className="rounded-full bg-surfaceMuted px-3 py-1"
                  >
                    <Text variant="caption" weight="medium">
                      {f}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          <Text variant="caption" tone="muted" className="text-center">
            {ready.length} av {friends.length} klare
          </Text>

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

      {phase === "swipe" && deckEnded ? (
        // Saved deck: an end instead of a loop (2–3 cards looped visibly).
        <View className="flex-1 items-center justify-center gap-4 p-gutter">
          <Text variant="h1" className="text-center">
            Ingen match denne gangen
          </Text>
          <Text variant="caption" tone="muted" className="text-center">
            Dere har sveipet gjennom alle de lagrede opplevelsene.
          </Text>
          <View className="w-full gap-3 pt-2">
            <Button
              label="Sveip igjen"
              variant="ink"
              onPress={() => setIndex(0)}
            />
            <Button
              label="Tilbake til Lagret"
              variant="secondary"
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/saved")
              }
            />
          </View>
        </View>
      ) : null}

      {phase === "swipe" && card ? (
        <ScrollView contentContainerClassName={pageBody.blocks}>
          {/* Next card fades in (it swapped in one frame). */}
          <FadeSwap swapKey={card.id} style={{ gap: 16 }}>
            <View
              className="overflow-hidden rounded-lg"
              style={{ backgroundColor: media.base }}
            >
              <Image
                source={card.photos[0]}
                contentFit="cover"
                style={{ height: cardImgH, width: "100%" }}
              />
            </View>
            <View className="gap-1">
              <Text variant="h1" accessibilityRole="text">
                {card.title}
              </Text>
              <Text variant="caption" tone="muted">
                {card.when}
              </Text>
              <View className="flex-row flex-wrap gap-2 pt-1">
                {card.tags.map((t) => (
                  <View
                    key={t}
                    className="rounded-full border border-line px-3 py-1"
                  >
                    <Text variant="caption">{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </FadeSwap>
          <Text variant="label" weight="semibold" className="text-center">
            Hvem har sveipet?
          </Text>
          <View className="flex-row justify-center gap-4">
            {friends.map((f) => (
              <View key={f.id} className="items-center gap-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-success">
                  <Icon name="checkmark" size="md" tone="onInk" />
                </View>
                <Text variant="caption">{f.name.split(" ")[0]}</Text>
              </View>
            ))}
          </View>
          <Text variant="caption" tone="muted" className="text-center">
            Ingen ser hva du stemte før dere har en match.
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
              onPress={() => {
                const agrees = fromSaved || card.id === AGREED_ID;
                if (!agrees) return setIndex((i) => i + 1);
                setPhase("match");
              }}
            />
          </View>
        </ScrollView>
      ) : null}

      {phase === "match" && card ? (
        <ScrollView contentContainerClassName="flex-grow justify-center gap-6 p-gutter">
          <Image
            source={card.photos[0]}
            contentFit="cover"
            style={{ height: matchImgH, width: "100%", borderRadius: 20 }}
          />
          <Text variant="display" className="text-center">
            Dere matcher!
          </Text>
          <Text variant="caption" tone="muted" className="text-center">
            Alle sveipet høyre på {card.title}.
          </Text>
          <View className="flex-row items-center gap-2 self-center rounded-full bg-success/15 px-3 py-1">
            <Icon name="checkmark" size="sm" tone="success" />
            <Text variant="caption" weight="semibold" tone="success">
              Alle er enige
            </Text>
          </View>

          <Button
            // The experience's own chat, not one for this group (D4,
            // review 2026-11-18): the label says whose chat opens.
            label="Åpne opplevelsens chat"
            variant="ink"
            onPress={() =>
              matchChat
                ? router.push(`/chat/${matchChat.id}` as Href)
                : router.navigate("/chat")
            }
          />
          <Button
            label={
              isSaved(`experience:${card.id}`) ? "Lagret" : "Lagre til senere"
            }
            icon={
              isSaved(`experience:${card.id}`) ? "bookmark" : "bookmark-outline"
            }
            variant="secondary"
            onPress={() => {
              if (isGuest) return setSignInOpen(true);
              const key = `experience:${card.id}`;
              const was = isSaved(key);
              toggle(key);
              showToast({
                title: was ? "Fjernet fra Lagret" : "Lagret",
                body: card.title,
                icon: was ? "bookmark-outline" : "bookmark",
              });
            }}
          />
          <Button
            label="Fortsett å sveipe"
            variant="secondary"
            onPress={() => {
              setIndex((i) => i + 1);
              setPhase("swipe");
            }}
          />
        </ScrollView>
      ) : null}
      <SignInPrompt
        visible={signInOpen}
        onClose={() => setSignInOpen(false)}
        action="lagre"
      />
    </Screen>
  );
}

function MemberRow({ person, ready }: { person: MockPerson; ready: boolean }) {
  return (
    <ListRow
      variant="card"
      title={person.name}
      subtitle={ready ? "Klar ✓" : "Venter …"}
      subtitleTone={ready ? "success" : "muted"}
      leading={
        <Avatar
          name={person.name}
          source={libImage(person.avatar)}
          size="md"
          decorative
        />
      }
    />
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
      <Icon name={icon} size="xl" tone={filled ? "ember" : "ink"} />
    </Pressable>
  );
}
