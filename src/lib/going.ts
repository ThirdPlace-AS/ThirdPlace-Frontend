import { useSyncExternalStore } from "react";

import {
  attendeesForExperience,
  experienceById,
  people,
  profile,
} from "@/fixtures";
import type { LibraryKey } from "@/fixtures/images";

// Who's going (Phase 16, founder 2026-11-07 after the section benchmark:
// opt-in per person, like Airbnb). A face only for people who chose "Vis meg
// som deltaker" (the viewer too, once joined and opted in); the count is
// everyone going. Faces and count come from the experience's attendee list
// (MOCK), so they never disagree with "Se deltakere".

export type GoingFace = {
  key: string;
  name: string;
  initials: string;
  avatar?: LibraryKey;
};
export type Going = { faces: GoingFace[]; count: number };

export const MAX_FACES = 3;

const portraitOf = (name: string): LibraryKey | undefined =>
  people.find((p) => p.name === name)?.avatar as LibraryKey | undefined;

export function goingFor(
  expId: string,
  viewer: { joined: boolean; showMe: boolean } = {
    joined: false,
    showMe: false,
  },
): Going {
  const exp = experienceById(expId);
  if (!exp) return { faces: [], count: 0 };
  const shown = attendeesForExperience(expId)
    .filter((a) => a.shown)
    .map((a) => ({
      key: a.id,
      name: a.name,
      initials: a.initials,
      avatar: portraitOf(a.name),
    }));
  const me: GoingFace[] =
    viewer.joined && viewer.showMe
      ? [
          {
            key: "me",
            name: "Du",
            initials: "DU",
            avatar: profile.avatar as LibraryKey,
          },
        ]
      : [];
  return {
    faces: [...me, ...shown].slice(0, MAX_FACES),
    count: exp.going + (viewer.joined ? 1 : 0),
  };
}

/** "5 skal" (Facebook's Norwegian "Skal" for going). */
export const goingLabel = (count: number) => `${count} skal`;

/** Cards: "5 skal · 3 plasser igjen" or "8 skal · ingen ledige plasser". */
export function goingLine(e: { capacity: number; going: number }): string {
  const left = Math.max(0, e.capacity - e.going);
  return left > 0
    ? `${goingLabel(e.going)} · ${left} plasser igjen`
    : `${goingLabel(e.going)} · ingen ledige plasser`;
}

// The viewer's own "Vis meg som deltaker" (Personvern). Off by default and,
// like the other Personvern switches, kept in memory only: visibility is an
// account setting (BLOCKED_CONTRACT_GAP).
let showMe = false;
const listeners = new Set<() => void>();

export function setShowMeAsAttendee(next: boolean) {
  if (showMe === next) return;
  showMe = next;
  listeners.forEach((l) => l());
}

export function useShowMeAsAttendee(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => showMe,
    () => showMe,
  );
}
