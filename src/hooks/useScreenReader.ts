import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Whether TalkBack / VoiceOver is on, following changes while mounted. */
export function useScreenReader(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((v) => {
        if (alive) setOn(v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setOn,
    );
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return on;
}
