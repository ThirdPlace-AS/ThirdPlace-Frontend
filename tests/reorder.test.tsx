// Drag to reorder (P9): the pure helpers, the pinned-chat order, the profile
// draft noticing a new interest order, and the screen-reader move actions on
// the Sortable primitives.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { Text } from "react-native";

import { SortableList, moveActions, onMoveAction } from "@/components/ui";
import { moveItem, reorderSubset } from "@/lib/reorder";
import {
  resetPinnedChats,
  setPinnedOrder,
  togglePinnedChat,
  usePinnedChats,
} from "@/lib/pinnedChats";
import { profileDraftChanged, type MyProfile } from "@/lib/myProfile";

// react-native-sortables is mocked in tests/setup/nativeMocks.js.

describe("moveItem", () => {
  it("moves one item and clamps the target", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(moveItem(["a", "b", "c"], 1, 9)).toEqual(["a", "c", "b"]);
    expect(moveItem(["a", "b", "c"], 5, 0)).toEqual(["a", "b", "c"]);
  });
});

describe("reorderSubset", () => {
  it("puts the shown items in their new order and keeps hidden ones in place", () => {
    expect(reorderSubset(["a", "x", "b", "c"], ["c", "a", "b"])).toEqual([
      "c",
      "x",
      "a",
      "b",
    ]);
  });
});

describe("setPinnedOrder", () => {
  beforeEach(() => resetPinnedChats());

  it("stores the order the viewer dragged, hidden pins keep their place", () => {
    const { result } = renderHook(() => usePinnedChats());
    act(() => {
      togglePinnedChat("c1");
      togglePinnedChat("c2");
      togglePinnedChat("c3"); // newest first: c3, c2, c1
    });
    expect(result.current).toEqual(["c3", "c2", "c1"]);
    act(() => setPinnedOrder(["c1", "c3", "c2"]));
    expect(result.current).toEqual(["c1", "c3", "c2"]);
    // c3 hidden by a search: only c1 and c2 were shown and swapped.
    act(() => setPinnedOrder(["c2", "c1"]));
    expect(result.current).toEqual(["c2", "c3", "c1"]);
  });
});

describe("profileDraftChanged", () => {
  it("counts a new interest order as a change", () => {
    const me = {
      name: "A",
      bio: "",
      languages: "",
      avatar: undefined,
      interests: ["Kaffe", "Klatring"],
    } as unknown as MyProfile;
    expect(profileDraftChanged(me, { ...me })).toBe(false);
    expect(
      profileDraftChanged(me, { ...me, interests: ["Klatring", "Kaffe"] }),
    ).toBe(true);
  });
});

describe("move actions", () => {
  it("offers only the moves that exist", () => {
    expect(moveActions(0, 3).map((a) => a.label)).toEqual(["Flytt ned"]);
    expect(moveActions(1, 3).map((a) => a.label)).toEqual([
      "Flytt opp",
      "Flytt ned",
    ]);
    expect(moveActions(2, 3).map((a) => a.label)).toEqual(["Flytt opp"]);
  });

  it("calls the move for each action", () => {
    const move = jest.fn();
    const act = onMoveAction(1, move);
    act({ nativeEvent: { actionName: "moveUp" } } as never);
    act({ nativeEvent: { actionName: "moveDown" } } as never);
    expect(move.mock.calls).toEqual([
      [1, 0],
      [1, 2],
    ]);
  });
});

describe("SortableList", () => {
  it("gives each row a named handle whose actions reorder", () => {
    const onReorder = jest.fn();
    render(
      <SortableList
        data={["Kaffe", "Klatring", "Jazz"]}
        keyOf={(s) => s}
        nameOf={(s) => s}
        renderItem={(s) => <Text>{s}</Text>}
        onReorder={onReorder}
      />,
    );
    const handle = screen.getByLabelText("Flytt Jazz");
    expect(
      (handle.props.accessibilityActions as { label: string }[]).map(
        (a) => a.label,
      ),
    ).toEqual(["Flytt opp"]);
    fireEvent(handle, "accessibilityAction", {
      nativeEvent: { actionName: "moveUp" },
    });
    expect(onReorder).toHaveBeenCalledWith(["Kaffe", "Jazz", "Klatring"]);
  });
});
