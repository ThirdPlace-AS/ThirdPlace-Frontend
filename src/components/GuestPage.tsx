import { useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";

import { GuestLock } from "@/components/GuestLock";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Button, Header, Page, Screen } from "@/components/ui";

/**
 * An account-only page (review 2026-11-18, IJ2/IJ22/F-04): a guest, or the
 * app after Logg ut, sees the page's title, a short lock note and "Logg
 * inn", never the demo account's plans, chats or notices. Visual only, like
 * GuestLock: no authorization exists (BLOCKED_CONTRACT_GAP). Which screens
 * a guest may see is founder question A-Q3; these are the personal ones.
 */
export function GuestPage({
  title,
  message,
  action,
  tab = false,
  children,
}: {
  title: string;
  /** The lock note, e.g. "Logg inn for å se planene dine." */
  message: string;
  /** For the sign-in sheet: "Du må ha en konto for å {action}." */
  action: string;
  /** A tab (Chat): the large tab header, no back. */
  tab?: boolean;
  /** The signed-in page. */
  children: ReactNode;
}) {
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState(false);
  if (!isGuest) return <>{children}</>;
  const body = (
    <>
      <View className="gap-4">
        <GuestLock message={message} />
        <Button
          label="Logg inn"
          variant="ink"
          onPress={() => setSignIn(true)}
        />
      </View>
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action={action}
      />
    </>
  );
  if (!tab) return <Page title={title}>{body}</Page>;
  // The same frame as the guest Profile tab.
  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="grow gap-6 px-gutter pb-12">
        <Header title={title} size="large" inset={false} />
        {body}
      </ScrollView>
    </Screen>
  );
}
