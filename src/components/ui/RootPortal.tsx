// Root portal (Phase 11 G5): renders a full-screen surface at the app root,
// above the tab bar, without an Android dialog. Used for the map's experience
// page: a Modal opened from a sheet's drag (no touch) took ~1 s to paint and
// hid the sheet meanwhile. <RootPortalHost /> sits in app/_layout.tsx inside
// the providers; <RootPortal> publishes its children there while mounted.
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
} from "react";
import { StyleSheet, View } from "react-native";

let current: ReactNode = null;
const listeners = new Set<() => void>();

function publish(node: ReactNode) {
  current = node;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function RootPortalHost() {
  const node = useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
  return node ? (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {node}
    </View>
  ) : null;
}

/** Shows its children at the root while mounted (one portal at a time). */
export function RootPortal({ children }: { children: ReactNode }) {
  // Re-publish on every render so the portal follows its props.
  useLayoutEffect(() => {
    publish(children);
  });
  useEffect(() => () => publish(null), []);
  return null;
}
