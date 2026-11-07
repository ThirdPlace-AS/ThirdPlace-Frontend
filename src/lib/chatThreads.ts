import { useSyncExternalStore } from "react";

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
let threads: Readonly<Record<string, Thread>> = {};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function update(chatId: string, fn: (t: Thread) => Thread) {
  threads = { ...threads, [chatId]: fn(threads[chatId] ?? EMPTY) };
  emit();
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
  threads = {};
  emit();
}

export function useThread(chatId: string): Thread {
  return useSyncExternalStore(
    subscribe,
    () => threads[chatId] ?? EMPTY,
    () => threads[chatId] ?? EMPTY,
  );
}
