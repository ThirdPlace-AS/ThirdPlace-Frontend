// Phase 18 (screen benchmark, "Finding things"): one-time tips for hidden
// gestures (at most one per session) and long-press quick actions on cards
// and rows.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ItemActionsSheet } from "@/components/actions/ActionSheets";
import { HintBanner } from "@/components/HintBanner";
import { ListRow } from "@/components/ui";
import {
  claimHint,
  getHints,
  markHintSeen,
  resetHintSession,
  restoreHints,
} from "@/lib/hints";

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

afterEach(() => {
  restoreHints(undefined);
  resetHintSession();
  jest.useRealTimers();
});

describe("one-time tips", () => {
  it("show at most one tip per session, and never one already seen", () => {
    expect(claimHint("chatLongPress")).toBe(true);
    // The same tip may render again in this session (a remount).
    expect(claimHint("chatLongPress")).toBe(true);
    // Another tip waits for the next session.
    expect(claimHint("profileSwitch")).toBe(false);
    resetHintSession();
    markHintSeen("profileSwitch");
    expect(getHints().profileSwitch).toBe(true);
    expect(claimHint("profileSwitch")).toBe(false);
    expect(claimHint("swipeGestures")).toBe(true);
  });

  it("the tip says what to hold and closes on Skjønner", () => {
    const onDone = jest.fn();
    render(
      <HintBanner
        icon="hand-left-outline"
        text="Hold inne en melding for å reagere eller svare."
        onDone={onDone}
      />,
    );
    expect(
      screen.getByText("Hold inne en melding for å reagere eller svare."),
    ).toBeTruthy();
    fireEvent.press(screen.getByText("Skjønner"));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe("long-press quick actions", () => {
  it("a row offers its actions on long press and to screen readers", () => {
    const onLongPress = jest.fn();
    render(
      <ListRow
        title="Kaffebrenneriet"
        onPress={() => {}}
        onLongPress={onLongPress}
      />,
    );
    const row = screen.getByRole("button", { name: "Kaffebrenneriet" });
    fireEvent(row, "longPress");
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(row.props.accessibilityActions).toEqual([
      { name: "longpress", label: "Flere valg" },
    ]);
    fireEvent(row, "accessibilityAction", {
      nativeEvent: { actionName: "longpress" },
    });
    expect(onLongPress).toHaveBeenCalledTimes(2);
  });

  it("the sheet closes first; actions that open another sheet wait for it", () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    const save = jest.fn();
    const share = jest.fn();
    render(
      <ItemActionsSheet
        title="Kaffebrenneriet"
        onClose={onClose}
        actions={[
          { label: "Lagre", icon: "heart-outline", onPress: save },
          {
            label: "Del",
            icon: "share-outline",
            afterClose: true,
            onPress: share,
          },
        ]}
      />,
      { wrapper },
    );
    expect(screen.getByText("Lagre")).toBeTruthy();
    fireEvent.press(screen.getByText("Lagre"));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByText("Del"));
    expect(share).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(share).toHaveBeenCalledTimes(1);
  });
});
