// System back steps back inside a multi-step screen (0454): while `active`
// (a step after the first) and the screen is focused, Android's back runs
// the same `back` as the header ← instead of leaving the screen. On the
// first step the event passes through, so the router (and useConfirmLeave)
// handle leaving as before.
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { BackHandler } from "react-native";

export function useStepBack(active: boolean, back: () => void) {
  // The latest `back` without re-registering the listener on every render.
  const backRef = useRef(back);
  useEffect(() => {
    backRef.current = back;
  });
  useFocusEffect(
    useCallback(() => {
      if (!active) return undefined;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        backRef.current();
        return true;
      });
      return () => sub.remove();
    }, [active]),
  );
}
