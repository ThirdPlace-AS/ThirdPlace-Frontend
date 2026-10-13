import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { ScreenHeader } from "@/components/ScreenHeader";

const CATEGORIES = ["Kafé", "Konsert", "Trening", "Kunst", "Mat", "Natur"];

// Static "create" form (visual only). Inert — nothing is persisted or sent
// (no backend, no canonical entity). Chip selection is local UI state only.
export default function AddScreen() {
  const [selected, setSelected] = useState<string>("Kafé");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-gutter">
        <ScreenHeader
          title="Legg til"
          subtitle="Del et sted eller en opplevelse med nabolaget."
        />
        <View className="gap-4">
          <Input label="Tittel" placeholder="Hva skjer?" />
          <View className="gap-2">
            <Text className="text-sm text-ink">Kategori</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={c === selected}
                  onPress={() => setSelected(c)}
                />
              ))}
            </View>
          </View>
          <Input label="Sted" placeholder="Adresse eller stedsnavn" />
          <Input label="Beskrivelse" placeholder="Fortell litt om det ..." />
          <Button label="Forhåndsvis" variant="ink" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
