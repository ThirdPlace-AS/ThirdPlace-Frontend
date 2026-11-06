import { Link } from "expo-router";
import { ScrollView, View } from "react-native";

import { Screen, Text } from "@/components/ui";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/Button";
import { DemoBadge } from "@/components/DemoBadge";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { resetTo } from "@/lib/navigation";

// Visual-only sign-in. Inputs are inert; no auth is performed (no backend).
export default function Login() {
  const { setGuest } = useGuestMode();
  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-6 p-gutter">
        <View className="items-center">
          <Logo size={48} />
        </View>
        <ScreenHeader
          title="Velkommen tilbake"
          subtitle="Finn veien tilbake til ditt lokale fellesskap."
        />
        <View className="gap-4">
          <Input
            label="E-postadresse"
            placeholder="navn@epost.no"
            keyboardType="email-address"
          />
          <Input label="Passord" placeholder="••••••••" secureTextEntry />
          <Link
            href="/forgot-password"
            className="text-right text-sm font-semibold text-emberText"
          >
            Glemt passord?
          </Link>
          <SocialAuthButtons verb="Logg inn med" />
          <Button
            label="Logg inn"
            variant="ink"
            onPress={() => {
              setGuest(false);
              resetTo("/map");
            }}
          />
          <View className="flex-row items-center justify-center gap-2">
            <DemoBadge />
            <Text variant="caption" tone="muted">
              Ingen reell innlogging; feltene lagrer ingenting.
            </Text>
          </View>
        </View>
        <Text variant="caption" tone="muted" className="text-center">
          Har du ikke konto?{" "}
          <Link href="/register" className="font-semibold text-emberText">
            Registrer deg
          </Link>
        </Text>
      </ScrollView>
    </Screen>
  );
}
