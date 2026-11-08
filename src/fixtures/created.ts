// Things the viewer creates this session: groups, their group chats and
// published experiences from Legg til (Phase 12 H5b), and direct messages
// started from a person's page (Phase 13). They are registered into the
// in-memory fixture lists, so every existing lookup (groupById, chatById,
// experienceById, sessionsFor, the map adapter) finds them without a
// store-aware variant; `useCreatedVersion()` lets lists re-render when
// something is added. A reload clears them — persistence and publishing are
// contract-blocked (BLOCKED_CONTRACT_GAP); nothing is sent anywhere.
import { useSyncExternalStore } from "react";
import type { ImageSourcePropType } from "react-native";

import { media } from "@/theme/media";

import type { LibraryKey } from "./images";
import {
  chats,
  experiences,
  groups,
  invalidateFixtureIndexes,
  AREAS,
  places,
  profile,
  type CancellationOption,
  type DurationOption,
  type EnergyLevel,
  type ExperienceAccess,
  type ExperienceCategory,
  type ExperienceVibe,
  type MockChat,
  type MockChatAccess,
  type MockExperience,
  type MockGroup,
  type RepeatOption,
  type TimeWindow,
} from "./index";

let version = 0;
const listeners = new Set<() => void>();
const createdIds = {
  groups: new Set<string>(),
  chats: new Set<string>(),
  experiences: new Set<string>(),
};
let seq = 0;

function bump() {
  version += 1;
  invalidateFixtureIndexes();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Changes whenever something is created (use it as a memo dependency). */
export function useCreatedVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => version,
  );
}

/** The experiences the viewer hosts: what they published this session
 *  (newest first), then Profil's "Arrangert" list. For "Start fra en
 *  tidligere opplevelse" in Legg til (Phase 16). */
export function hostedExperiences(): MockExperience[] {
  const ids = [
    ...[...createdIds.experiences].reverse(),
    ...profile.activity
      .filter((a) => a.role === "Arrangert")
      .map((a) => a.experienceId),
  ];
  return [...new Set(ids)]
    .map((id) => experiences.find((e) => e.id === id))
    .filter((e): e is MockExperience => !!e);
}

/** Test helper: forget everything created this session. */
export function resetCreated() {
  const drop = <T extends { id: string }>(list: T[], ids: Set<string>) => {
    for (let i = list.length - 1; i >= 0; i -= 1)
      if (ids.has(list[i]!.id)) list.splice(i, 1);
    ids.clear();
  };
  drop(groups, createdIds.groups);
  drop(chats, createdIds.chats);
  drop(experiences, createdIds.experiences);
  seq = 0;
  bump();
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "TP";

/** The viewer as a host label: "Ola Nordmann" → "Ola N.". */
const hostLabel = () => {
  const [first, last] = profile.name.split(" ");
  return last ? `${first} ${last[0]}.` : (first ?? profile.name);
};

export type NewGroupInput = {
  name: string;
  about: string;
  interests: string[];
  area: string;
  photos: LibraryKey[];
  access: MockChatAccess;
  /** Optional, the creator's own words (Phase 18). */
  rules?: string;
};

/** Creates a group and its group chat; returns both ids. */
export function createGroup(input: NewGroupInput): {
  groupId: string;
  chatId: string;
} {
  seq += 1;
  const groupId = `gx${seq}`;
  const chatId = `cx${seq}`;
  const group: MockGroup = {
    id: groupId,
    name: input.name.trim(),
    about: input.about.trim() || `En gruppe på ${input.area}.`,
    memberCount: 1,
    members: [initialsOf(profile.name)],
    cover: input.photos[0]!,
    photos: input.photos,
    mine: true,
    interests: [],
    ...(input.rules?.trim() ? { rules: input.rules.trim() } : {}),
  };
  const chat: MockChat = {
    id: chatId,
    name: group.name,
    last: "Gruppen er opprettet",
    time: "Nå",
    unread: 0,
    type: "user_created",
    access: input.access,
    status: "active",
    members: 1,
    initials: initialsOf(group.name),
  };
  groups.push(group);
  chats.unshift(chat);
  createdIds.groups.add(groupId);
  createdIds.chats.add(chatId);
  bump();
  return { groupId, chatId };
}

/** "Maria Movik" → "Maria M." (how the chat list names a direct message). */
const shortName = (name: string) => {
  const [first, last] = name.trim().split(/\s+/);
  return last ? `${first} ${last[0]}.` : (first ?? name);
};

/**
 * Melding on a person's page (PDF p13): the direct message with that person,
 * or a new empty one at the top of the chat list. Returns the chat id.
 */
export function directChatFor(person: { id: string; name: string }): string {
  const existing = chats.find(
    (c) => c.type === "dm" && c.personId === person.id,
  );
  if (existing) return existing.id;
  seq += 1;
  const chatId = `dx${seq}`;
  chats.unshift({
    id: chatId,
    name: shortName(person.name),
    last: "Ingen meldinger ennå",
    time: "Nå",
    unread: 0,
    type: "dm",
    access: "invite_only",
    status: "active",
    initials: initialsOf(person.name),
    personId: person.id,
  });
  createdIds.chats.add(chatId);
  bump();
  return chatId;
}

export type NewExperienceInput = {
  title: string;
  about: string;
  category: string;
  /** A place name, or an Oslo area for "Annet sted". */
  area: string;
  meetingPoint: string;
  photos: ImageSourcePropType[];
  date: string; // ISO yyyy-mm-dd
  startTime: string; // HH:MM
  duration: string;
  repeat: string;
  capacity: number;
  priceNok: number;
  access: string;
  cancellation: string;
  vibes: string[];
  energy: string | null;
  languages: string[];
  included: string[];
  steps: string[];
};

const WEEKDAY_SHORT = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

/** "2 timer" → 120, "Hele dagen" → 480. */
export function durationMinutes(label: string): number {
  const m = /^(\d+)\s+time/.exec(label);
  return m ? Number(m[1]) * 60 : 480;
}

/** The "Når" filter window for a date (MOCK, like the fixtures' `day`). */
export function windowFor(date: Date, now: Date = new Date()): TimeWindow {
  const day = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((day(date) - day(now)) / 86_400_000);
  if (diff <= 0) return "I dag";
  if (diff === 1) return "I morgen";
  if (date.getDay() === 0 || date.getDay() === 6) return "Helg";
  return "Denne uka";
}

/** Publishes an experience from the Add flow; returns its id. */
export function createExperience(input: NewExperienceInput): string {
  seq += 1;
  const id = `ex${seq}`;
  const [y, mo, d] = input.date.split("-").map(Number);
  const date = new Date(y ?? 2026, (mo ?? 1) - 1, d ?? 1);
  const place = places.find((p) => p.name === input.area);
  const areaCoord =
    AREAS.find((a) => a.name === input.area)?.coord ?? AREAS[0]!.coord;
  const exp: MockExperience = {
    id,
    title: input.title.trim(),
    host: hostLabel(),
    when: `${WEEKDAY_SHORT[date.getDay()]} ${input.startTime}`,
    firstDate: input.date,
    placeId: place?.id,
    groupId: "",
    status: "open",
    capacity: input.capacity,
    going: 0,
    priceNok: input.priceNok > 0 ? input.priceNok : undefined,
    day: windowFor(date),
    tags: [input.category],
    about: input.about.trim(),
    photos: input.photos,
    // No sampled tint for picked photos: the media base keeps text legible.
    scrims: input.photos.map(() => media.base),
    category: input.category as ExperienceCategory,
    duration: input.duration as DurationOption,
    durationMin: durationMinutes(input.duration),
    languages: input.languages,
    included: input.included,
    vibes: input.vibes as ExperienceVibe[],
    energy: (input.energy ?? "Middels") as EnergyLevel,
    access: input.access as ExperienceAccess,
    cancellation: input.cancellation as CancellationOption,
    repeat: input.repeat as RepeatOption,
    types: [],
    audiences: [],
    meetingPoint: {
      name: input.meetingPoint.trim() || place?.name || input.area,
      address: place?.address ?? `${input.area}, Oslo`,
      coord: place?.coord ?? areaCoord,
    },
    itinerary: input.steps
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title, i) => ({
        title,
        text: "",
        photo: input.photos[i % input.photos.length]!,
      })),
  };
  // Every experience has a chat (founder 2026-11-06); the host is in it.
  const chat: MockChat = {
    id: `cx${seq}`,
    name: exp.title,
    last: "Opplevelsen er publisert",
    time: "Nå",
    unread: 0,
    type: "experience",
    access: "open",
    status: "active",
    pinnedExperienceId: id,
    members: 1,
    initials: initialsOf(exp.title),
  };
  experiences.push(exp);
  chats.unshift(chat);
  createdIds.experiences.add(id);
  createdIds.chats.add(chat.id);
  bump();
  return id;
}
