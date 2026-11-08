import { useState } from "react";
import { View } from "react-native";
import { Icon, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { experienceById } from "@/fixtures";
import { useDevSimulation } from "@/lib/devSimulation";

export function CheckinContent({ id }: { id: string }) {
  const exp = experienceById(id);
  // In range unless the dev switch says otherwise (app/_sandbox/simulate).
  // BLOCKED_CONTRACT_GAP: no GPS arrival check is wired.
  const near = !useDevSimulation().checkinFar;
  const [checkedIn, setCheckedIn] = useState(false);

  if (!exp) {
    return (
      <Text variant="caption" tone="muted">
        Fant ikke arrangementet.
      </Text>
    );
  }

  return (
    <View className="gap-5">
      <View>
        <Text variant="body" weight="semibold">
          {exp.title}
        </Text>
        <Text variant="caption" tone="muted">
          {exp.when}
        </Text>
      </View>

      <View className="items-center gap-3 rounded-xl border border-line bg-surface p-6">
        <View
          className={`h-20 w-20 items-center justify-center rounded-full ${
            checkedIn ? "bg-success" : near ? "bg-ember" : "bg-surfaceMuted"
          }`}
        >
          <Icon
            name={checkedIn ? "checkmark" : "tp-arrival"}
            size="2xl"
            tone={checkedIn || near ? "onEmber" : "muted"}
          />
        </View>
        <Text variant="body" weight="semibold" className="text-center">
          {checkedIn
            ? "Du er sjekket inn"
            : near
              ? "Du er fremme!"
              : "For langt unna (~1,2 km)"}
        </Text>
        <Text variant="caption" tone="muted" className="text-center">
          {checkedIn
            ? "God tur!"
            : near
              ? "Du er rundt 40 m unna. Du kan sjekke inn nå."
              : "Kom nærmere stedet for å sjekke inn."}
        </Text>
      </View>

      <Button
        label={checkedIn ? "Angre innsjekk" : "Sjekk inn"}
        variant={checkedIn ? "secondary" : "ember"}
        disabled={!near && !checkedIn}
        onPress={() => {
          setCheckedIn((c) => !c);
        }}
      />
    </View>
  );
}
