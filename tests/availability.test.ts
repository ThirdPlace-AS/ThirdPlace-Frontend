import { describe, expect, it } from "@jest/globals";

import { experienceAvailability } from "@/components/swipe/availability";
import { experiences, type MockExperience } from "@/fixtures";

// Single source of truth for availability wording (card + detail). Pure helper.
const base: MockExperience = {
  ...experiences[0]!,
  id: "x",
  title: "T",
  host: "H",
  when: "Ons 09:00",
  placeId: "p1",
  groupId: "g1",
  status: "open",
  capacity: 8,
  going: 5,
  day: "Denne uka",
  tags: [],
  about: "",
  photos: [],
  scrims: [],
};

describe("experienceAvailability", () => {
  it("open with room → remaining count + join CTA", () => {
    const a = experienceAvailability({ ...base, status: "open", going: 5 });
    expect(a.isWaitlist).toBe(false);
    expect(a.isFull).toBe(false);
    expect(a.spotsLeft).toBe(3);
    expect(a.label).toBe("3 plasser igjen · 5/8");
    expect(a.statusText).toBe("3 plasser igjen");
    expect(a.joinLabel).toBe("Bli med");
  });

  it("full (open but at capacity) → Fullt", () => {
    const a = experienceAvailability({
      ...base,
      status: "open",
      capacity: 8,
      going: 8,
    });
    expect(a.isFull).toBe(true);
    expect(a.isWaitlist).toBe(false);
    expect(a.label).toBe("Fullt");
    expect(a.statusText).toBe("Fullt");
    // A full experience offers the waitlist, matching the map detail.
    expect(a.joinLabel).toBe("Meld på venteliste");
  });

  it("explicit full status → Fullt", () => {
    const a = experienceAvailability({
      ...base,
      status: "full",
      capacity: 12,
      going: 12,
    });
    expect(a.isFull).toBe(true);
    expect(a.label).toBe("Fullt");
    expect(a.joinLabel).toBe("Meld på venteliste");
  });

  it("explicit full status wins even with seats on paper", () => {
    const a = experienceAvailability({
      ...base,
      status: "full",
      capacity: 12,
      going: 9,
    });
    expect(a.isFull).toBe(true);
    expect(a.joinLabel).toBe("Meld på venteliste");
  });

  it("waitlist → Venteliste + waitlist CTA (even at capacity)", () => {
    const a = experienceAvailability({
      ...base,
      status: "waitlist",
      capacity: 10,
      going: 10,
    });
    expect(a.isWaitlist).toBe(true);
    expect(a.isFull).toBe(false);
    expect(a.label).toBe("Venteliste");
    expect(a.statusText).toBe("Venteliste");
    expect(a.joinLabel).toBe("Meld på venteliste");
  });
});
