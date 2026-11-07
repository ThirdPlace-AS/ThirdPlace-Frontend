// Page shell for a place or group opened as a route (Phase 12 H4c): header
// with back (the map when opened from a deep link), the same detail content
// the map sheet shows, and a sheet for short sub-views. Links to other whole
// entities (an experience, all reviews) open their own page.
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { ScrollView } from "react-native";

import { titleFor, DetailContent } from "@/components/map/DetailContentRouter";
import type { PushFn, SheetTarget } from "@/components/map/sheetTypes";
import { Sheet } from "@/components/Sheet";
import { EmptyState, Header, Screen } from "@/components/ui";
import { routeFor } from "@/lib/entityRoutes";
import { goBackOr } from "@/lib/navigation";

export function EntityPage({
  title,
  missing,
  children,
}: {
  title: string;
  /** Shown instead of the content when the id is unknown. */
  missing?: string;
  /** Render prop: the page content, given a push that routes whole entities
   *  and opens everything else in the page's sheet. */
  children: (push: PushFn) => ReactNode;
}) {
  const [sub, setSub] = useState<SheetTarget[]>([]);
  const push: PushFn = (t) => {
    const href = routeFor(t);
    if (href) router.push(href);
    else setSub((s) => [...s, t]);
  };
  const top = sub[sub.length - 1];
  return (
    <Screen edges={["top", "bottom"]}>
      <Header title={title} />
      {missing ? (
        <EmptyState
          icon="map-outline"
          title={missing}
          actionLabel="Til kartet"
          onAction={() => goBackOr("/map")}
        />
      ) : (
        <ScrollView
          contentContainerClassName="gap-4 px-gutter pb-12 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          {children(push)}
        </ScrollView>
      )}
      {top ? (
        <Sheet
          visible
          onClose={() => setSub([])}
          title={titleFor(top)}
          onBack={
            sub.length > 1 ? () => setSub((s) => s.slice(0, -1)) : undefined
          }
        >
          <DetailContent
            target={top}
            push={(t) => {
              const href = routeFor(t);
              if (href) {
                setSub([]);
                router.push(href);
              } else setSub((s) => [...s, t]);
            }}
          />
        </Sheet>
      ) : null}
    </Screen>
  );
}
