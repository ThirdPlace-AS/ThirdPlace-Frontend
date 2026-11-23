import { useCallback, useState } from "react";

import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";

/**
 * A personal action on a page a guest may read (founder 2026-11-19 Q1:
 * guests browse only). `gate("rapportere", fn)` returns a press handler that
 * runs `fn` when signed in and opens the sign-in sheet for a guest; render
 * `prompt` once on the page. Sign-in returns to the page (signInReturn.ts).
 * Visual only: no authorization exists (BLOCKED_CONTRACT_GAP).
 */
export function useGuestGate() {
  const { isGuest } = useGuestMode();
  const [open, setOpen] = useState(false);
  // Kept after close, so the sheet's exit shows the same words.
  const [action, setAction] = useState("fortsette");
  const gate = useCallback(
    (what: string, fn: () => void) => () => {
      if (!isGuest) return fn();
      setAction(what);
      setOpen(true);
    },
    [isGuest],
  );
  const close = useCallback(() => setOpen(false), []);
  const prompt = (
    <SignInPrompt visible={open} onClose={close} action={action} />
  );
  return { isGuest, gate, prompt };
}
