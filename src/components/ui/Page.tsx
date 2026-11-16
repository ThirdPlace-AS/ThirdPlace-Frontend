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

/**
 * A page's scroll body (DESIGN_SYSTEM.md "Spacing", 0428): the gutter on the
 * sides, 16 below the header, 48 at the end. The gap is the page's density:
 * `sections` (24) between titled sections, `blocks` (16) between cards and
 * forms, `list` (12) between rows of one list, `items` (8) for a tight list.
 * The body grows to the screen's height, so a lone state (EmptyState is
 * flex-1) centres in the space left (0429). Screens with their own
 * ScrollView take the same strings.
 */
export const pageBody = {
  sections: "grow gap-6 px-gutter pb-12 pt-4",
  blocks: "grow gap-4 px-gutter pb-12 pt-4",
  list: "grow gap-3 px-gutter pb-12 pt-4",
  items: "grow gap-2 px-gutter pb-12 pt-4",
} as const;
export type PageDensity = keyof typeof pageBody;

type PageProps = {
  title: string;
  /** Header actions (icon buttons). */
  trailing?: ReactNode;
  /** Override back (defaults to back, or the map from a cold deep link). */
  onBack?: () => void;
  /** Gap between the page's children (default `blocks`, 16). */
  density?: PageDensity;
  children: ReactNode;
};

export function Page({
  title,
  trailing,
  onBack,
  density = "blocks",
  children,
}: PageProps) {
  return (
    <Screen edges={["top", "bottom"]}>
      <Header title={title} trailing={trailing} onBack={onBack} />
      <ScrollView
        className="flex-1"
        contentContainerClassName={pageBody[density]}
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
  density = "blocks",
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
          contentContainerClassName={pageBody[density]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer ? <StickyFooter safeBottom>{footer}</StickyFooter> : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
