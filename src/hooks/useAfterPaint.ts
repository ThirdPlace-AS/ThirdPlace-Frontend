import { useEffect, useState } from "react";

// A flag that turns on two frames after `wanted` does, and stays on. It starts
// on when `immediate` is true at mount (default: when `wanted` already is).
// Used for work a card does as it moves through the Sveip deck (its info, the
// rest of its photos): none of it is seen in the frame the card takes over,
// and mounting it there hitched the swipe (measured 2026-11-20: ~55 ms each,
// ~225 ms per advance in a dev build).
export function useAfterPaint(wanted: boolean, immediate = wanted): boolean {
  const [on, setOn] = useState(immediate);
  useEffect(() => {
    if (!wanted || on) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setOn(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [wanted, on]);
  return on;
}
