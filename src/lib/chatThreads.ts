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
};

const EMPTY: Thread = { sent: [], reactions: {} };
type State = { threads: Readonly<Record<string, Thread>> };
const store = createStore<State>(() => ({ threads: {} }));

function update(chatId: string, fn: (t: Thread) => Thread) {
  store.setState(({ threads }) => ({
    threads: { ...threads, [chatId]: fn(threads[chatId] ?? EMPTY) },
  }));
}

export function sendMessage(chatId: string, text: string, replyTo?: Reply) {
  update(chatId, (t) => ({
    ...t,
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
}

export function useThread(chatId: string): Thread {
  const select = useCallback(
    (s: State) => s.threads[chatId] ?? EMPTY,
    [chatId],
  );
  return useStore(store, select);
}
