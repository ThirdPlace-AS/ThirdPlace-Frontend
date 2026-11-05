import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { experienceById } from "@/fixtures";
import { useThemeColors } from "@/theme";

export function CheckinContent({ id }: { id: string }) {
  const colors = useThemeColors();
  const exp = experienceById(id);
  const [near, setNear] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);

  if (!exp) {
    return (
      <Text className="text-sm text-muted font-normal">
        Fant ikke arrangementet.
      </Text>
    );
  }

  return (
    <View className="gap-5">
      <View>
        <Text className="text-base font-semibold text-ink">{exp.title}</Text>
        <Text className="text-sm text-muted font-normal">{exp.when}</Text>
      </View>

      <View className="items-center gap-3 rounded-xl border border-line bg-surface p-6">
        <View
          className={`h-20 w-20 items-center justify-center rounded-full ${
            checkedIn ? "bg-success" : near ? "bg-ember" : "bg-surfaceMuted"
          }`}
        >
          <Ionicons
            name={checkedIn ? "checkmark" : "location"}
            size={36}
            color={checkedIn || near ? colors.onEmber : colors.muted}
          />
        </View>
        <Text className="text-center text-base font-semibold text-ink">
          {checkedIn
            ? "Du er sjekket inn"
            : near
              ? "Du er i nærheten (~40 m)"
              : "For langt unna (~1,2 km)"}
        </Text>
        <Text className="text-center text-sm text-muted font-normal">
          {checkedIn
            ? "God tur!"
            : near
              ? "Du kan sjekke inn nå."
              : "Kom nærmere stedet for å sjekke inn."}
        </Text>
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: near }}
        onPress={() => setNear((n) => !n)}
        className="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3"
      >
        <Text className="text-sm text-ink font-normal">
          Simuler: i nærheten
        </Text>
        <View
          className={`h-6 w-11 justify-center rounded-full px-0.5 ${
            near ? "bg-ink" : "bg-surfaceMuted"
          }`}
        >
          <View
            className={`h-5 w-5 rounded-full bg-surface ${
              near ? "self-end" : "self-start"
            }`}
          />
        </View>
      </Pressable>

      <Button
        label={checkedIn ? "Angre innsjekk" : "Sjekk inn"}
        variant={checkedIn ? "secondary" : "ember"}
        disabled={!near && !checkedIn}
        onPress={() => setCheckedIn((c) => !c)}
      />
    </View>
  );
}
