// Root portal (Phase 11 G5): renders a full-screen surface at the app root,
// above the tab bar, without an Android dialog. Used for the map's experience
// page: a Modal opened from a sheet's drag (no touch) took ~1 s to paint and
// hid the sheet meanwhile. <RootPortalHost /> sits in app/_layout.tsx inside
// the providers; <RootPortal> publishes its children there while mounted.
import { type ReactNode, useEffect, useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import { createStore, useStore } from "zustand";

type State = { node: ReactNode };
const store = createStore((): State => ({ node: null }));
const selectNode = (s: State) => s.node;

function publish(node: ReactNode) {
  store.setState({ node });
}

export function RootPortalHost() {
  const node = useStore(store, selectNode);
  return node ? (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {node}
    </View>
  ) : null;
}

/** Shows its children at the root while mounted (one portal at a time). */
export function RootPortal({ children }: { children: ReactNode }) {
  // Re-publish whenever the children change, so the portal follows its
  // props; a render with the same children publishes nothing (speed pass
  // 0345: every publish re-renders the host at the app root).
  useLayoutEffect(() => {
    publish(children);
  }, [children]);
  useEffect(() => () => publish(null), []);
  return null;
}
