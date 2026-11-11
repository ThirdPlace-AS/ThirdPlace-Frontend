// The live position and compass heading for the map's location dot (speed
// pass 0346): only the dot reads this store, and a compass reading counts
// only after a real turn and a short gap, so a phone in the hand no longer
// renders the map up to 20 times a second.
import { afterEach, describe, expect, it, jest } from "@jest/globals";

import {
  clearUserFix,
  getUserLocation,
  HEADING_MIN_GAP_MS,
  HEADING_MIN_TURN,
  headingCounts,
  resetUserLocation,
  setNativeCoord,
  setUserCoord,
  setUserHeading,
} from "@/lib/userLocation";

afterEach(() => {
  resetUserLocation();
  jest.useRealTimers();
});

describe("headingCounts", () => {
  it("takes the first reading and a clear to unknown", () => {
    expect(headingCounts(null, 90, 0)).toBe(true);
    expect(headingCounts(90, null, 0)).toBe(true);
    expect(headingCounts(null, null, 1000)).toBe(false);
  });

  it("needs a turn of HEADING_MIN_TURN degrees", () => {
    const later = HEADING_MIN_GAP_MS;
    expect(headingCounts(90, 90 + HEADING_MIN_TURN - 1, later)).toBe(false);
    expect(headingCounts(90, 90 + HEADING_MIN_TURN, later)).toBe(true);
    expect(headingCounts(90, 90 - HEADING_MIN_TURN, later)).toBe(true);
  });

  it("measures the turn across north", () => {
    expect(headingCounts(358, 2, HEADING_MIN_GAP_MS)).toBe(true);
    expect(headingCounts(359, 1, HEADING_MIN_GAP_MS)).toBe(false);
  });

  it("needs HEADING_MIN_GAP_MS since the last reading that counted", () => {
    expect(headingCounts(0, 90, HEADING_MIN_GAP_MS - 1)).toBe(false);
    expect(headingCounts(0, 90, HEADING_MIN_GAP_MS)).toBe(true);
  });
});

describe("the store", () => {
  it("keeps at most one compass reading per gap", () => {
    setUserHeading(0, 1000);
    setUserHeading(45, 1000 + HEADING_MIN_GAP_MS);
    expect(getUserLocation().heading).toBe(45);
  });

  // Review of the speed pass: the compass sends nothing more while the phone
  // is held still, so a turn that ends inside the gap must still show.
  it("shows a quick turn when the gap is over", () => {
    jest.useFakeTimers();
    setUserHeading(0, 1000);
    setUserHeading(45, 1050);
    expect(getUserLocation().heading).toBe(0);
    jest.advanceTimersByTime(HEADING_MIN_GAP_MS - 50);
    expect(getUserLocation().heading).toBe(45);
  });

  it("shows the latest of several quick readings, once", () => {
    jest.useFakeTimers();
    setUserHeading(0, 1000);
    setUserHeading(30, 1050);
    setUserHeading(60, 1100);
    setUserHeading(90, 1150);
    expect(getUserLocation().heading).toBe(0);
    jest.advanceTimersByTime(HEADING_MIN_GAP_MS - 50);
    expect(getUserLocation().heading).toBe(90);
    jest.advanceTimersByTime(HEADING_MIN_GAP_MS * 2);
    expect(getUserLocation().heading).toBe(90);
  });

  it("drops a held turn when the phone turns back", () => {
    jest.useFakeTimers();
    setUserHeading(0, 1000);
    setUserHeading(45, 1050);
    setUserHeading(2, 1100);
    jest.advanceTimersByTime(HEADING_MIN_GAP_MS);
    expect(getUserLocation().heading).toBe(0);
  });

  it("does not change for the same coordinate", () => {
    setUserCoord([10.75, 59.92]);
    const before = getUserLocation();
    setUserCoord([10.75, 59.92]);
    expect(getUserLocation()).toBe(before);
    setNativeCoord([10.7, 59.9]);
    expect(getUserLocation().nativeCoord).toEqual([10.7, 59.9]);
  });

  it("a manual area clears the fix and the heading, not the engine's position", () => {
    setUserCoord([10.75, 59.92]);
    setNativeCoord([10.7, 59.9]);
    setUserHeading(90, 1000);
    clearUserFix();
    expect(getUserLocation()).toEqual({
      coord: null,
      nativeCoord: [10.7, 59.9],
      heading: null,
    });
    // The next reading counts at once.
    setUserHeading(91, 1001);
    expect(getUserLocation().heading).toBe(91);
  });

  it("a manual area drops a held turn", () => {
    jest.useFakeTimers();
    setUserHeading(0, 1000);
    setUserHeading(45, 1050);
    clearUserFix();
    jest.advanceTimersByTime(HEADING_MIN_GAP_MS);
    expect(getUserLocation().heading).toBe(null);
  });
});
