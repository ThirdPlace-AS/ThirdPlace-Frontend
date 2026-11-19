import { useRef, useState } from "react";
import { useNavigation, usePreventRemove } from "expo-router/react-navigation";

// The action that tried to remove the page (back, Android back, a swipe).
type LeaveAction = Parameters<
  Parameters<typeof usePreventRemove>[1]
>[0]["data"]["action"];

// Sheets close in 200 ms; leave after that so the page does not go while its
// sheet is still on screen.
const AFTER_SHEET_MS = 240;

/**
 * Ask before a page with unsaved changes is left (Phase 18, screen
 * benchmark: Hinge's "discard changes?"). Covers the header back, Android
 * back and the iOS swipe, since all of them remove the route. The page shows
 * its own "Forkaste endringene?" sheet while `asking` is true.
 *
 * `allowLeave()` goes right before leaving on purpose (after Lagre): the
 * render that clears `dirty` has not happened yet when the page navigates.
 */
export function useConfirmLeave(dirty: boolean) {
  const navigation = useNavigation();
  const [asking, setAsking] = useState(false);
  const pending = useRef<LeaveAction | null>(null);
  const allowed = useRef(false);

  usePreventRemove(dirty, ({ data }) => {
    if (allowed.current) {
      navigation.dispatch(data.action);
      return;
    }
    pending.current = data.action;
    setAsking(true);
  });

  return {
    asking,
    /** "Fortsett å redigere", or the sheet closed. */
    stay: () => {
      pending.current = null;
      setAsking(false);
    },
    /** "Forkast": leave the way the person tried to. */
    leave: () => {
      const action = pending.current;
      pending.current = null;
      allowed.current = true;
      setAsking(false);
      if (action) setTimeout(() => navigation.dispatch(action), AFTER_SHEET_MS);
    },
    allowLeave: () => {
      allowed.current = true;
    },
  };
}
