// Filter pills under the Chat search (0459, user decision 2026-11-17: a pill
// row like the benchmark's chat list, built from our own chat types only).
// Pure: the screen passes the joined, active chats and the read set.
import type { MockChat } from "@/fixtures";

export type ChatFilterKey =
  | "all"
  | "unread"
  | "people"
  | "groups"
  | "experiences"
  | "places"
  | "market";

export type ChatFilter = { key: ChatFilterKey; label: string };

/** Every pill in its order; "Alle" first. */
export const CHAT_FILTERS: readonly ChatFilter[] = [
  { key: "all", label: "Alle" },
  { key: "unread", label: "Ulest" },
  { key: "people", label: "Personer" },
  { key: "groups", label: "Grupper" },
  { key: "experiences", label: "Opplevelser" },
  { key: "places", label: "Steder" },
  { key: "market", label: "Marked" },
];

/** Whether a chat belongs under a pill. `unreadOf` is the chat's unread count
 *  after the viewer's reads (src/lib/chatReads.ts). */
export function matchesChatFilter(
  chat: MockChat,
  key: ChatFilterKey,
  unreadOf: (c: MockChat) => number,
): boolean {
  switch (key) {
    case "all":
      return true;
    case "unread":
      return unreadOf(chat) > 0;
    case "people":
      return chat.type === "dm";
    case "groups":
      return chat.type === "user_created" || chat.type === "group_swipe";
    case "experiences":
      return chat.type === "experience";
    case "places":
      return chat.type === "place" || chat.type === "business";
    case "market":
      return chat.type === "marketplace";
  }
}

/** The pills to show: "Alle" and every other pill that at least one of the
 *  viewer's chats matches (no empty pills, no counts). */
export function chatFilterPills(
  chats: readonly MockChat[],
  unreadOf: (c: MockChat) => number,
): ChatFilter[] {
  return CHAT_FILTERS.filter(
    (f) =>
      f.key === "all" ||
      chats.some((c) => matchesChatFilter(c, f.key, unreadOf)),
  );
}

/** One flat list for a pill other than "Alle": the pinned chats first, in
 *  pin order, then the rest in the list's own order. */
export function filterChats(
  list: readonly MockChat[],
  key: ChatFilterKey,
  unreadOf: (c: MockChat) => number,
  pins: readonly string[],
): MockChat[] {
  const hits = list.filter((c) => matchesChatFilter(c, key, unreadOf));
  const pinned = pins.flatMap((id) => {
    const c = hits.find((x) => x.id === id);
    return c ? [c] : [];
  });
  return [...pinned, ...hits.filter((c) => !pins.includes(c.id))];
}
