import { useState } from "react";
import { View } from "react-native";
import { Icon, Switch, Text, Pressable as UIPressable } from "@/components/ui";
import { Button } from "@/components/Button";
import { haptics } from "@/lib/haptics";
import { experienceById } from "@/fixtures";

export function CheckinContent({ id }: { id: string }) {
  const exp = experienceById(id);
  const [near, setNear] = useState(true);
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
              ? "Du er i nærheten (~40 m)"
              : "For langt unna (~1,2 km)"}
        </Text>
        <Text variant="caption" tone="muted" className="text-center">
          {checkedIn
            ? "God tur!"
            : near
              ? "Du kan sjekke inn nå."
              : "Kom nærmere stedet for å sjekke inn."}
        </Text>
      </View>

      <UIPressable
        accessibilityRole="switch"
        accessibilityState={{ checked: near }}
        haptic="selection"
        onPress={() => setNear((n) => !n)}
        contentClassName="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3"
        pressedScale={0.99}
      >
        <Text variant="label" weight="regular">
          Simuler: i nærheten
        </Text>
        {/* Display-only: the whole row is the switch (role="switch" above). */}
        <View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
        >
          <Switch
            value={near}
            onValueChange={() => {}}
            label="Simuler: i nærheten"
          />
        </View>
      </UIPressable>

      <Button
        label={checkedIn ? "Angre innsjekk" : "Sjekk inn"}
        variant={checkedIn ? "secondary" : "ember"}
        disabled={!near && !checkedIn}
        onPress={() => {
          if (!checkedIn) haptics.light();
          setCheckedIn((c) => !c);
        }}
      />
    </View>
  );
}
