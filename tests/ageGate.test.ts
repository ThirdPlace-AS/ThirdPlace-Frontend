import { describe, expect, it } from "@jest/globals";

import { checkBirthday, formatBirthdayInput } from "@/features/onboarding/age";

const today = new Date(2026, 10, 5); // 5 Nov 2026

describe("checkBirthday (18+ gate, TP-D-001)", () => {
  it("empty and malformed input", () => {
    expect(checkBirthday("", today).status).toBe("empty");
    expect(checkBirthday("1990-01-01", today).status).toBe("invalid");
    expect(checkBirthday("31.02.1990", today).status).toBe("invalid");
    expect(checkBirthday("01.01.2030", today).status).toBe("invalid");
  });

  it("exactly 18 today passes; one day short is underage", () => {
    expect(checkBirthday("05.11.2008", today)).toEqual({
      status: "ok",
      age: 18,
    });
    expect(checkBirthday("06.11.2008", today)).toEqual({
      status: "underage",
      age: 17,
    });
  });

  it("adult passes with whole years", () => {
    expect(checkBirthday("12.03.1997", today)).toEqual({
      status: "ok",
      age: 29,
    });
  });
});

describe("formatBirthdayInput", () => {
  it("inserts dots as digits are typed", () => {
    expect(formatBirthdayInput("0")).toBe("0");
    expect(formatBirthdayInput("0101")).toBe("01.01");
    expect(formatBirthdayInput("01011990")).toBe("01.01.1990");
    expect(formatBirthdayInput("01.01.19901")).toBe("01.01.1990");
  });
});
