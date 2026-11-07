import { ScrollView, View } from "react-native";

import { ListRow, Screen, Switch, Text } from "@/components/ui";
import { RouteHeader } from "@/components/RouteHeader";
import { setDevSimulation, useDevSimulation } from "@/lib/devSimulation";

// Dev-only: switches for states that need a real network or GPS to appear
// (map offline/error, a slow load, check-in distance). Not linked from product UI; open
// with `thirdplace://_sandbox/simulate`. System screens stay reachable via
// `thirdplace://state/<kind>`.
export default function SimulateSandbox() {
  const sim = useDevSimulation();
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Simulering (dev)" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          Bare for utvikling. Bryterne nullstilles når appen lastes på nytt.
        </Text>
        <ListRow
          variant="card"
          title="Kartet er frakoblet"
          subtitle="Kartet viser feiltilstanden med «Prøv igjen»."
          trailing={
            <Switch
              value={sim.mapOffline}
              onValueChange={(v) => setDevSimulation({ mapOffline: v })}
              label="Kartet er frakoblet"
            />
          }
        />
        <ListRow
          variant="card"
          title="For langt unna ved innsjekk"
          subtitle="Innsjekk ser deg som ~1,2 km unna."
          trailing={
            <Switch
              value={sim.checkinFar}
              onValueChange={(v) => setDevSimulation({ checkinFar: v })}
              label="For langt unna ved innsjekk"
            />
          }
        />
        <ListRow
          variant="card"
          title="Treg lasting (3 s)"
          subtitle="Kartet laster på nytt i 3 sekunder: skjelett de første 2 sekundene, så lasteindikator."
          trailing={
            <Switch
              value={sim.slowLoad}
              onValueChange={(v) => setDevSimulation({ slowLoad: v })}
              label="Treg lasting (3 s)"
            />
          }
        />
        <View className="h-2" />
      </ScrollView>
    </Screen>
  );
}
