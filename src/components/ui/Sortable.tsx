// Drag to reorder (P9, docs/design/DESIGN_SYSTEM.md §4 "Sortable"), on
// react-native-sortables. Two shapes, both controlled (the caller owns the
// order and gets the new one back):
// - SortableList: full-width rows, dragged by a handle (the ≡ at the row's
//   end), so the row's own press and long press keep working. Festet chats.
// - SortableChips: a wrapping row of chips, dragged after a long press; a tap
//   still reaches the chip. Rediger profil's interests.
// Screen readers can't drag, so every item also offers "Flytt opp" / "Flytt
// ned" actions that call the same move. Reduced motion: no lift, no slide.
// No vibration: sortables' own feedback stays off (its default), see the
// haptics rule in CLAUDE.md.
import { type ReactNode, useCallback, useMemo } from "react";
import type { AccessibilityActionEvent } from "react-native";
import { View } from "react-native";
import Sortable from "react-native-sortables";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { moveItem } from "@/lib/reorder";

import { Icon } from "./Icon";

/** Screen-reader actions for an item at `index` of `count`. */
export function moveActions(index: number, count: number) {
  return [
    ...(index > 0 ? [{ name: "moveUp", label: "Flytt opp" }] : []),
    ...(index < count - 1 ? [{ name: "moveDown", label: "Flytt ned" }] : []),
  ];
}

/** The handler for those actions: calls `move(from, to)`. */
export function onMoveAction(
  index: number,
  move: (from: number, to: number) => void,
) {
  return (e: AccessibilityActionEvent) => {
    if (e.nativeEvent.actionName === "moveUp") move(index, index - 1);
    if (e.nativeEvent.actionName === "moveDown") move(index, index + 1);
  };
}

function useMotionProps() {
  const reduced = useReducedMotion();
  return useMemo(
    () =>
      reduced
        ? {
            activeItemScale: 1,
            inactiveItemOpacity: 1,
            activationAnimationDuration: 0,
            dropAnimationDuration: 0,
            itemEntering: null,
            itemExiting: null,
            dimensionsAnimationType: "none" as const,
          }
        : {
            activeItemScale: 1.03,
            inactiveItemOpacity: 0.85,
          },
    [reduced],
  );
}

export type SortableListProps<T> = {
  data: readonly T[];
  keyOf: (item: T) => string;
  /** Screen-reader name of an item ("Flytt {name}"). */
  nameOf: (item: T) => string;
  onReorder: (next: T[]) => void;
  /** The row; the handle sits after it. */
  renderItem: (item: T) => ReactNode;
};

export function SortableList<T>({
  data,
  keyOf,
  nameOf,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const motion = useMotionProps();
  const move = useCallback(
    (from: number, to: number) => onReorder(moveItem(data, from, to)),
    [data, onReorder],
  );
  const render = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <View className="flex-row items-center gap-2">
        <View className="flex-1">{renderItem(item)}</View>
        <Sortable.Handle>
          <View
            accessible
            accessibilityLabel={`Flytt ${nameOf(item)}`}
            accessibilityHint="Hold og dra for å endre rekkefølgen"
            accessibilityActions={moveActions(index, data.length)}
            onAccessibilityAction={onMoveAction(index, move)}
            className="h-11 w-9 items-center justify-center"
          >
            <Icon name="reorder-three-outline" size="md" tone="muted" />
          </View>
        </Sortable.Handle>
      </View>
    ),
    [renderItem, nameOf, data.length, move],
  );
  return (
    <Sortable.Grid
      data={data as T[]}
      keyExtractor={keyOf}
      renderItem={render}
      columns={1}
      rowGap={12}
      customHandle
      overDrag="vertical"
      onDragEnd={({ data: next }) => onReorder(next)}
      {...motion}
    />
  );
}

export type SortableChipsProps = {
  /** The chips, in order. */
  items: readonly { key: string; node: ReactNode }[];
  /** A last chip that stays put and can't be dragged ("+ Legg til"). */
  trailing?: ReactNode;
  onReorder: (from: number, to: number) => void;
};

const TRAILING_KEY = "__trailing";

export function SortableChips({
  items,
  trailing,
  onReorder,
}: SortableChipsProps) {
  const motion = useMotionProps();
  return (
    <Sortable.Flex
      gap={8}
      customHandle
      onDragEnd={({ fromIndex, toIndex }) => {
        if (fromIndex !== toIndex) onReorder(fromIndex, toIndex);
      }}
      {...motion}
    >
      {items.map((it) => (
        <Sortable.Handle key={it.key}>{it.node}</Sortable.Handle>
      ))}
      {trailing ? (
        <Sortable.Handle key={TRAILING_KEY} mode="fixed-order">
          {trailing}
        </Sortable.Handle>
      ) : null}
    </Sortable.Flex>
  );
}
