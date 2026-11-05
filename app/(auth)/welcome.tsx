import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { LogoMark } from "@/components/Logo";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { libImage } from "@/fixtures/images";
import { resetTo } from "@/lib/navigation";

// Welcome (PDF p1): a full-bleed venue photo with the ThirdPlace mark, and a
// bottom card — "Velkommen hjem", the pitch, "Kom i gang" (→ register),
// "Fortsett som gjest" and "Allerede medlem? Logg inn". The photo is bundled
// sample art (no media contract).
export default function Welcome() {
  const { setGuest } = useGuestMode();
  return (
    <View className="flex-1 bg-ink">
      <StatusBar style="light" />
      <Image
        source={libImage("venue-cafe")}
        contentFit="cover"
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        accessibilityIgnoresInvertColors
      />
      <SafeAreaView
        className="flex-1 justify-between"
        edges={["top", "bottom"]}
      >
        <View className="flex-row items-center justify-center gap-2 pt-4">
          <LogoMark size={32} />
          <Text
            className="text-lg font-semibold text-white"
            style={{ letterSpacing: -0.3 }}
          >
            ThirdPlace
          </Text>
        </View>

        <View className="mx-3 mb-2 gap-4 rounded-xl bg-background p-6">
          <View className="h-1 w-10 self-center rounded-full bg-line" />
          <Text className="text-center text-2xl font-bold text-ink">
            Velkommen hjem
          </Text>
          <Text className="text-center text-base text-muted">
            Oppdag nabolagets lune møteplasser. Finn din neste third place — der
            byen faktisk skjer.
          </Text>
          <Button
            label="Kom i gang"
            variant="ember"
            onPress={() => router.push("/register")}
          />
          <Button
            label="Fortsett som gjest"
            variant="secondary"
            onPress={() => {
              setGuest(true);
              resetTo("/map");
            }}
          />
          <Text className="text-center text-sm text-muted">
            Allerede medlem?{" "}
            <Link href="/login" className="font-semibold text-ember">
              Logg inn
            </Link>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
