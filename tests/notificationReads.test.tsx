// Notification read state is shared (spec §11 read / read-all): reading in
// the sheet lowers every bell badge.
import { afterEach, describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import {
  resetNotificationReads,
  useNotificationReads,
} from "@/hooks/useNotificationReads";

afterEach(() => act(() => resetNotificationReads()));

describe("useNotificationReads", () => {
  it("shares one unread count that drops as items are read", () => {
    const sheet = renderHook(() => useNotificationReads());
    const bell = renderHook(() => useNotificationReads());
    const before = bell.result.current.unread;
    expect(before).toBeGreaterThan(0);
    const firstUnread = sheet.result.current.items.find(
      (n) => !sheet.result.current.readIds.has(n.id),
    );
    act(() => sheet.result.current.markRead(firstUnread!.id));
    expect(bell.result.current.unread).toBe(before - 1);
  });

  it("marks everything read", () => {
    const { result } = renderHook(() => useNotificationReads());
    act(() => result.current.markAllRead());
    expect(result.current.unread).toBe(0);
  });
});
