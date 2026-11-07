// Pages (docs/design/DESIGN_SYSTEM.md "Pages vs sheets", Phase 12 H4c).
//
// Content you read, browse or fill in over several fields is a stack route,
// not a sheet (founder 2026-11-06). These shells keep every converted page
// the same: back header, scroll body, and for forms a sticky footer that
// rides above the keyboard (edge-to-edge Android does not resize the window,
// so KeyboardAvoidingView pads instead — CLAUDE.md "Keyboard").
//
//   <Page title>      header + scroll body (lists, details, settings)
//   <FormPage title>  header + scroll body + sticky footer above the keyboard
import type { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView } from "react-native";

import { Header } from "./Header";
import { Screen } from "./Screen";
import { StickyFooter } from "./StickyFooter";

type PageProps = {
  title: string;
  /** Header actions (icon buttons). */
  trailing?: ReactNode;
  /** Override back (defaults to back, or the map from a cold deep link). */
  onBack?: () => void;
  children: ReactNode;
};

export function Page({ title, trailing, onBack, children }: PageProps) {
  return (
    <Screen edges={["top", "bottom"]}>
      <Header title={title} trailing={trailing} onBack={onBack} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-gutter pb-12 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </Screen>
  );
}

export function FormPage({
  title,
  trailing,
  onBack,
  footer,
  children,
}: PageProps & {
  /** Primary action(s), pinned above the keyboard. */
  footer?: ReactNode;
}) {
  return (
    <Screen edges={["top"]}>
      <Header title={title} trailing={trailing} onBack={onBack} />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-gutter pb-8 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer ? <StickyFooter safeBottom>{footer}</StickyFooter> : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
