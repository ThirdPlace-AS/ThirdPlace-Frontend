// "Åpent nå" from the opening hours (src/lib/openingHours.ts): every format
// the fixtures write, past midnight, special days, and the fallback.
import { describe, expect, it } from "@jest/globals";

import { places } from "@/fixtures";
import {
  closedBySpecialHours,
  isOpenAt,
  isPlaceOpen,
} from "@/lib/openingHours";

// 2026-11-09 is a Monday.
const at = (day: number, h: number, m = 0) => new Date(2026, 10, 9 + day, h, m);
const MON = 0;
const TUE = 1;
const WED = 2;
const THU = 3;
const FRI = 4;
const SAT = 5;
const SUN = 6;

describe("isOpenAt", () => {
  it("reads weekday ranges and single days", () => {
    const h = "Man–fre 07–18 · Lør–søn 09–17";
    expect(isOpenAt(h, at(MON, 7))).toBe(true);
    expect(isOpenAt(h, at(FRI, 17, 59))).toBe(true);
    expect(isOpenAt(h, at(FRI, 18))).toBe(false);
    expect(isOpenAt(h, at(SAT, 8, 59))).toBe(false);
    expect(isOpenAt(h, at(SUN, 12))).toBe(true);
    expect(isOpenAt("Tor 18–22", at(THU, 19))).toBe(true);
    expect(isOpenAt("Tor 18–22", at(WED, 19))).toBe(false);
  });

  it("reads 'og', 'Hver dag', minutes and 'Alltid åpent'", () => {
    expect(isOpenAt("Tir og tor 18–22", at(TUE, 20))).toBe(true);
    expect(isOpenAt("Tir og tor 18–22", at(WED, 20))).toBe(false);
    expect(isOpenAt("Man og ons 19–20.30", at(WED, 20, 15))).toBe(true);
    expect(isOpenAt("Man og ons 19–20.30", at(WED, 20, 30))).toBe(false);
    expect(isOpenAt("Hver dag 07–08", at(SUN, 7, 30))).toBe(true);
    expect(isOpenAt("Alltid åpent", at(TUE, 3))).toBe(true);
  });

  it("runs to midnight and past it", () => {
    expect(isOpenAt("Tir–tor 16–00", at(THU, 23, 59))).toBe(true);
    expect(isOpenAt("Tir–tor 16–00", at(FRI, 0, 30))).toBe(false);
    const late = "Tir–tor 16–00 · Fre–lør 16–02";
    expect(isOpenAt(late, at(SAT, 1, 30))).toBe(true); // Friday night
    expect(isOpenAt(late, at(SUN, 1, 30))).toBe(true); // Saturday night
    expect(isOpenAt(late, at(MON, 1, 30))).toBe(false);
    expect(isOpenAt(late, at(SUN, 2))).toBe(false);
  });

  it("reads 'Første fredag i måneden'", () => {
    const h = "Første fredag i måneden 19–22";
    expect(isOpenAt(h, new Date(2026, 10, 6, 20))).toBe(true); // 6 Nov, Fri
    expect(isOpenAt(h, new Date(2026, 10, 13, 20))).toBe(false); // 13 Nov
  });

  it("returns null for text it can't read", () => {
    expect(isOpenAt("", at(MON, 12))).toBeNull();
    expect(isOpenAt("Etter avtale", at(MON, 12))).toBeNull();
    expect(isOpenAt("Man–fre 07–18 · etter avtale", at(MON, 12))).toBeNull();
  });
});

describe("isPlaceOpen", () => {
  it("closes on a listed special day", () => {
    expect(closedBySpecialHours("Stengt 17. mai", new Date(2026, 4, 17))).toBe(
      true,
    );
    const p = {
      hours: "Hver dag 10–22",
      specialHours: "Stengt 17. mai",
      openNow: true,
    };
    expect(isPlaceOpen(p, new Date(2026, 4, 17, 12))).toBe(false);
    expect(isPlaceOpen(p, new Date(2026, 4, 18, 12))).toBe(true);
  });

  it("falls back to openNow only when the hours can't be read", () => {
    expect(isPlaceOpen({ hours: "", openNow: true }, at(MON, 3))).toBe(true);
    expect(isPlaceOpen({ hours: "Tor 18–22", openNow: true }, at(MON, 3))).toBe(
      false,
    );
  });

  it("reads every fixture place's hours", () => {
    for (const p of places)
      expect([p.id, isOpenAt(p.hours, at(THU, 19))]).not.toEqual([p.id, null]);
  });

  it("closes a Thursday-evening club on a Sunday morning", () => {
    const club = places.find((p) => p.name === "Slemmestad Sjakkvenner")!;
    expect(isPlaceOpen(club, at(SUN, 6))).toBe(false);
    expect(isPlaceOpen(club, at(THU, 19))).toBe(true);
  });
});
