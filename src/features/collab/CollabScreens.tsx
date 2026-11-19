import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  Badge,
  CheckboxMark,
  ChipGroup,
  Field,
  FormPage,
  Icon,
  type IconName,
  pageBody,
  Pressable as UIPressable,
  Screen,
  StickyFooter,
  Text,
  KeyboardAvoider,
  Button,
  Input,
} from "@/components/ui";
import { showToast } from "@/components/Toast";
import { confirmToast } from "@/copy";
import { RouteHeader } from "@/components/RouteHeader";
import { listingById, listings } from "@/fixtures";
import {
  answerOffer,
  isFullName,
  signContract,
  useCollabDeal,
} from "@/lib/collabDeal";
import { goBackOr } from "@/lib/navigation";
import { useStepBack } from "@/lib/useStepBack";
import { useConfirmLeave } from "@/lib/useConfirmLeave";
import { DiscardChangesSheet } from "@/components/DiscardChangesSheet";
import { GuestPage } from "@/components/GuestPage";

// Collaboration flow, per the design (PDF p16–p18): Nytt samarbeid →
// Innkommende tilbud (Godta / Avslå / Mottilbud) → Samarbeid (parter,
// vilkår, tidslinje) → Kontrakt → Signer kontrakt. BLOCKED_CONTRACT_GAP: no
// offer, negotiation, contract, signature, revenue-split or payout model.
// Review 2026-11-18 #9 (H-02/H-03, founder: deal state + typed sign): the
// answer to the offer and the signature live in the session's deal
// (src/lib/collabDeal.ts) and show on the offer, Samarbeid and Kontrakt; no
// fixed "70 % / 30 %" split is stated as agreed (H-05).
const TYPES = ["Co-hosting", "Sponsing", "Brand"];
const HOSTING = ["Likeverdig 50/50", "Primær / sekundær"];
const SPLITS = ["50 / 50", "60 / 40", "70 / 30"];

function NewCollabScreenContent() {
  // From a listing's Venteliste, "Tilby" passes the partner (PDF p18).
  const { listing: listingId, partner } = useLocalSearchParams<{
    listing?: string;
    partner?: string;
  }>();
  const listing = listingById(listingId ?? "") ?? listings[0];
  const [type, setType] = useState("Co-hosting");
  // Defaults agree with each other and with the design example (PDF p16:
  // primær/sekundær co-hosting, 70 / 30).
  const [hosting, setHosting] = useState(HOSTING[1] ?? "");
  const [split, setSplit] = useState("70 / 30");
  const [msg, setMsg] = useState("");
  // Leaving with unsaved input asks first (review 2026-11-18 H-12).
  const leave = useConfirmLeave(
    msg.trim().length > 0 ||
      type !== "Co-hosting" ||
      hosting !== (HOSTING[1] ?? "") ||
      split !== "70 / 30",
  );
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Nytt samarbeid" />
      <KeyboardAvoider>
        <ScrollView
          contentContainerClassName={pageBody.blocks}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="caption" tone="muted">
            Foreslå et samarbeid basert på en listing.
          </Text>
          <Field label="Knyttet listing">
            <View className="gap-1 rounded-md border border-line bg-surface p-3">
              <Text variant="label" weight="semibold">
                {listing?.title}
              </Text>
              <Text variant="caption" tone="muted">
                {listing?.owner} · {listing?.type}
              </Text>
            </View>
          </Field>
          {partner ? (
            <>
              <Field label="Partner">
                <View className="rounded-md border border-line bg-surface p-3">
                  <Text variant="label" weight="semibold">
                    {partner}
                  </Text>
                </View>
              </Field>
            </>
          ) : null}
          <Field label="Samarbeidstype">
            <ChipRow options={TYPES} value={type} onChange={setType} />
          </Field>
          <Field label="Hosting-type">
            <ChipRow options={HOSTING} value={hosting} onChange={setHosting} />
          </Field>
          <Field label="Inntektsdeling (du / partner)">
            <ChipRow options={SPLITS} value={split} onChange={setSplit} />
          </Field>

          <Input
            label="Melding"
            placeholder="Fortell kort hva du foreslår …"
            value={msg}
            onChangeText={setMsg}
            multiline
            maxLength={400}
          />
          <Button
            label="Se pågående samarbeid"
            variant="secondary"
            onPress={() => router.push("/collab" as Href)}
          />
        </ScrollView>
        <StickyFooter safeBottom>
          <Button
            label="Send forespørsel"
            variant="ink"
            disabled={msg.trim().length === 0}
            onPress={() => {
              leave.allowLeave();
              router.back();
              showToast(confirmToast.requestSent);
            }}
          />
          {msg.trim().length === 0 ? (
            <Text variant="caption" tone="muted" className="text-center">
              Skriv en melding først.
            </Text>
          ) : null}
        </StickyFooter>
      </KeyboardAvoider>
      <DiscardChangesSheet
        visible={leave.asking}
        onStay={leave.stay}
        onDiscard={leave.leave}
      />
    </Screen>
  );
}

function CollabDetailScreenContent() {
  const deal = useCollabDeal();
  const timeline: { label: string; meta: string; done: boolean }[] = [
    { label: "Foreslått", meta: "12. juli", done: true },
    { label: "Godtatt", meta: "14. juli", done: true },
    {
      label: "Kontrakt signert",
      meta: deal.signedBy ? "Signert" : "Venter",
      done: deal.signedBy !== null,
    },
    { label: "Opplevelse gjennomført", meta: "Planlagt 1. aug", done: false },
  ];
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Jazz-samarbeid" />
      <ScrollView contentContainerClassName={pageBody.blocks}>
        <Field label="Parter">
          <View className="flex-row gap-3">
            <Party name="Maria Movik" role="Skaper · Primærvert" />
            <Party
              name="Oslo Kaffebar"
              role="Venue · Co-vert"
              icon="tp-business"
            />
          </View>
        </Field>
        <View className="overflow-hidden rounded-md border border-line bg-surface">
          {[
            ["Type", "Co-hosting (primær/sekundær)"],
            ["Opplevelse", "Jazzkveld"],
            ["Startdato", "1. august"],
            ["Betaling", "Gratis mot eksponering"],
            ...(deal.answer
              ? [["Innkommende tilbud", offerAnswerLabel(deal)]]
              : []),
          ].map(([k, v]) => (
            <View
              key={k}
              className="flex-row justify-between border-b border-line px-4 py-3"
            >
              <Text variant="caption" tone="muted">
                {k}
              </Text>
              <Text variant="label">{v}</Text>
            </View>
          ))}
        </View>
        <Label>Tidslinje</Label>
        {timeline.map((t) => (
          <View key={t.label} className="flex-row items-center gap-3">
            <View
              className={`h-4 w-4 rounded-full ${t.done ? "bg-success" : "bg-line"}`}
            />
            <Text
              variant="label"
              weight={t.done ? "semibold" : "regular"}
              tone={t.done ? "ink" : "muted"}
              className="flex-1"
            >
              {t.label}
            </Text>
            <Text variant="caption" tone="muted">
              {t.meta}
            </Text>
          </View>
        ))}
        {/* Primary action full width; "Innkommende tilbud" gets its own row
            (it wrapped to two left-aligned lines in a half-width cell). */}
        <View className="gap-3 pt-2">
          <Button
            label="Kontrakt"
            variant="ink"
            onPress={() => router.push("/collab/contract" as Href)}
          />
          <Button
            label="Innkommende tilbud"
            variant="secondary"
            onPress={() => router.push("/collab/offer" as Href)}
          />
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Betalingsstatus"
              variant="secondary"
              onPress={() => router.push("/collab/payment-status" as Href)}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Historikk"
              variant="secondary"
              onPress={() => router.push("/collab/history" as Href)}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

// Innkommende tilbud + Mottilbud (p17), a page since Phase 12 H4c.
function CollabOfferScreenContent() {
  const deal = useCollabDeal();
  const [counter, setCounter] = useState(false);
  // System back leaves the counter-offer form for the offer (0454).
  useStepBack(counter, () => setCounter(false));
  const [split, setSplit] = useState("50 / 50");
  // An answered offer shows its answer instead of the buttons (#9).
  const answered = deal.answer !== null && !counter;
  return (
    <FormPage
      title={counter ? "Mottilbud" : "Innkommende tilbud"}
      onBack={counter ? () => setCounter(false) : undefined}
      footer={
        answered ? null : counter ? (
          <Button
            label="Send mottilbud"
            variant="ink"
            onPress={() => {
              answerOffer("Mottilbud sendt", split);
              goBackOr("/collab" as Href);
              showToast(confirmToast.counterSent);
            }}
          />
        ) : (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Avslå"
                variant="secondary"
                onPress={() => {
                  answerOffer("Avslått");
                  goBackOr("/collab" as Href);
                  showToast(confirmToast.offerDeclined);
                }}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Godta tilbud"
                variant="ink"
                onPress={() => {
                  answerOffer("Godtatt");
                  goBackOr("/collab" as Href);
                  showToast(confirmToast.offerAccepted);
                }}
              />
            </View>
          </View>
        )
      }
    >
      <View className="gap-1 rounded-md border border-line bg-surface p-3">
        <Text variant="label" weight="semibold">
          Maria Movik
        </Text>
        <Text variant="caption" tone="muted">
          Co-hosting · Primær/sekundær
        </Text>
      </View>
      {answered ? (
        <View className="flex-row items-center gap-2">
          <Text variant="label">Ditt svar:</Text>
          <Badge kind="status" label={offerAnswerLabel(deal)} />
        </View>
      ) : counter ? (
        <>
          <Field label="Din inntektsdeling">
            <ChipRow options={SPLITS} value={split} onChange={setSplit} />
          </Field>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setCounter(true)}
          hitSlop={8}
        >
          <Text
            variant="label"
            weight="semibold"
            className="text-center underline"
          >
            Send mottilbud
          </Text>
        </Pressable>
      )}
    </FormPage>
  );
}

// Kontrakt + Signer kontrakt (p17–p18), a page since Phase 12 H4c.
function CollabContractScreenContent() {
  const deal = useCollabDeal();
  const [name, setName] = useState("");
  const [read, setRead] = useState(false);
  const canSign = isFullName(name) && read;
  return (
    <FormPage
      title="Kontrakt"
      footer={
        deal.signedBy ? null : (
          <Button
            label="Signer"
            variant="ink"
            disabled={!canSign}
            onPress={() => {
              signContract(name);
              showToast(confirmToast.contractSigned);
            }}
          />
        )
      }
    >
      <View className="gap-2 rounded-md border border-line bg-surface p-4">
        <Text variant="title" accessibilityRole="header">
          Samarbeidsavtale
        </Text>
        <Text variant="label" weight="regular">
          Mellom Maria Movik og Oslo Kaffebar
        </Text>
        {[
          "1. Samarbeidstype: Co-hosting (primær/sekundær)",
          "2. Opplevelse: Jazzkveld, 1. august",
          "3. Ansvar: lokale + utstyr / innhold og promotering",
          "4. Varighet: engangshendelse",
        ].map((c) => (
          <Text key={c} variant="caption">
            {c}
          </Text>
        ))}
      </View>
      {deal.signedBy ? (
        <View className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-4">
          <Icon name="checkmark-circle" size="lg" tone="success" />
          <Text variant="label" className="flex-1">
            Signert av {deal.signedBy}
          </Text>
        </View>
      ) : (
        <>
          <Input
            label="Fullt navn"
            placeholder="Fornavn Etternavn"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <UIPressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: read }}
            accessibilityLabel="Jeg har lest avtalen"
            onPress={() => setRead((v) => !v)}
            contentClassName="min-h-14 flex-row items-center gap-3 py-2"
            pressedScale={0.99}
          >
            <CheckboxMark checked={read} />
            <Text variant="body" className="flex-1">
              Jeg har lest avtalen
            </Text>
          </UIPressable>
        </>
      )}
    </FormPage>
  );
}

function offerAnswerLabel(deal: {
  answer: string | null;
  counterSplit: string | null;
}): string {
  return deal.answer === "Mottilbud sendt" && deal.counterSplit
    ? `Mottilbud sendt · ${deal.counterSplit}`
    : (deal.answer ?? "");
}

function Party({
  name,
  role,
  icon = "person-circle-outline",
}: {
  name: string;
  role: string;
  icon?: IconName;
}) {
  return (
    <View className="flex-1 gap-1 rounded-md border border-line bg-surface p-3">
      <Icon name={icon} size="lg" tone="ink" />
      <Text variant="label" weight="semibold">
        {name}
      </Text>
      <Text variant="caption" tone="muted">
        {role}
      </Text>
    </View>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text variant="label" weight="semibold">
      {children}
    </Text>
  );
}

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return <ChipGroup options={options} value={value} onChange={onChange} />;
}

// Account-only (review 2026-11-18, IJ2): a guest sees the lock.
export function NewCollabScreen() {
  return (
    <GuestPage
      title="Nytt samarbeid"
      message="Logg inn for å starte et samarbeid."
      action="starte et samarbeid"
    >
      <NewCollabScreenContent />
    </GuestPage>
  );
}

// Account-only (review 2026-11-18, IJ2): a guest sees the lock.
export function CollabDetailScreen() {
  return (
    <GuestPage
      title="Samarbeid"
      message="Logg inn for å se samarbeidet."
      action="se samarbeidet"
    >
      <CollabDetailScreenContent />
    </GuestPage>
  );
}

// Account-only (review 2026-11-18, IJ2): a guest sees the lock.
export function CollabOfferScreen() {
  return (
    <GuestPage
      title="Tilbud"
      message="Logg inn for å se tilbudet."
      action="se tilbudet"
    >
      <CollabOfferScreenContent />
    </GuestPage>
  );
}

// Account-only (review 2026-11-18, IJ2): a guest sees the lock.
export function CollabContractScreen() {
  return (
    <GuestPage
      title="Kontrakt"
      message="Logg inn for å se kontrakten."
      action="se kontrakten"
    >
      <CollabContractScreenContent />
    </GuestPage>
  );
}
