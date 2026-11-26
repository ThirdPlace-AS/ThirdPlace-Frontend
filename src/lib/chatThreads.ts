import { useCallback } from "react";
import { createStore, useStore } from "zustand";

import type { MockMessage } from "@/fixtures";

// What the viewer adds to a chat this session (Phase 16): messages they send,
// replies that quote a message, and reactions (one per message, tapping the
// same one again removes it). In memory like the other demo stores; nothing
// is delivered (BLOCKED_CONTRACT_GAP: no messaging backend, no receipts).
export const REACTIONS = ["❤️", "😂", "👍", "😮", "😢", "🙏"] as const;

export type Reply = { author: string; text: string };
export type ThreadMessage = MockMessage & { replyTo?: Reply };
export type Thread = {
  sent: ThreadMessage[];
  /** messageId → the viewer's reaction. */
  reactions: Readonly<Record<string, string>>;
  /** Order of the viewer's last send across chats (higher is newer). */
  sentAt?: number;
};

const EMPTY: Thread = { sent: [], reactions: {} };
type State = { threads: Readonly<Record<string, Thread>> };
const store = createStore<State>(() => ({ threads: {} }));
// Counts sends this session, so the Chat list can put the chat you wrote in
// last on top without a clock.
let sends = 0;

function update(chatId: string, fn: (t: Thread) => Thread) {
  store.setState(({ threads }) => ({
    threads: { ...threads, [chatId]: fn(threads[chatId] ?? EMPTY) },
  }));
}

export function sendMessage(chatId: string, text: string, replyTo?: Reply) {
  sends += 1;
  const sentAt = sends;
  update(chatId, (t) => ({
    ...t,
    sentAt,
    sent: [
      ...t.sent,
      {
        id: `local-${chatId}-${t.sent.length}`,
        author: "Ola",
        initials: "OL",
        text,
        time: "Nå",
        mine: true,
        ...(replyTo ? { replyTo } : {}),
      },
    ],
  }));
}

export function toggleReaction(
  chatId: string,
  messageId: string,
  emoji: string,
) {
  update(chatId, (t) => {
    const next = { ...t.reactions };
    if (next[messageId] === emoji) delete next[messageId];
    else next[messageId] = emoji;
    return { ...t, reactions: next };
  });
}

/** Tests and logout. */
export function resetThreads() {
  store.setState({ threads: {} });
  sends = 0;
}

const selectThreads = (s: State) => s.threads;

/** Every chat's session additions, for lists that show a last message. */
export function useThreads(): Readonly<Record<string, Thread>> {
  return useStore(store, selectThreads);
}

/** A chat as a list shows it once the viewer has written in it this session:
 *  their last message as the preview, time «Nå» (phone check 2026-11-26: the
 *  Chat list kept the fixture's last line after a send). */
export function withLastSent<
  C extends { id: string; last: string; time: string },
>(chat: C, threads: Readonly<Record<string, Thread>>): C {
  const sent = threads[chat.id]?.sent;
  const last = sent?.[sent.length - 1];
  return last ? { ...chat, last: `Du: ${last.text}`, time: last.time } : chat;
}

/** Chats you wrote in this session first, the latest send on top; the rest
 *  keep their order (phone sweep 2026-11-26: a chat stayed where it was in
 *  the Chat list after a send). */
export function byLastSent<C extends { id: string }>(
  list: readonly C[],
  threads: Readonly<Record<string, Thread>>,
): C[] {
  const at = (c: C) => threads[c.id]?.sentAt ?? 0;
  return list
    .map((c, i) => ({ c, i }))
    .sort((a, b) => at(b.c) - at(a.c) || a.i - b.i)
    .map(({ c }) => c);
}

export function useThread(chatId: string): Thread {
  const select = useCallback(
    (s: State) => s.threads[chatId] ?? EMPTY,
    [chatId],
  );
  return useStore(store, select);
}
