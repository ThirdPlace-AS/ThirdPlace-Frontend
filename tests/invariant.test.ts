import { invariant } from "@/lib/invariant";

describe("invariant", () => {
  it("passes through when the condition is truthy", () => {
    expect(() => invariant(true)).not.toThrow();
    expect(() => invariant(1)).not.toThrow();
    expect(() => invariant("ok")).not.toThrow();
  });

  it("throws with the default message when falsy", () => {
    expect(() => invariant(false)).toThrow("Invariant violation");
    expect(() => invariant(0)).toThrow("Invariant violation");
    expect(() => invariant(null)).toThrow("Invariant violation");
  });

  it("throws with a custom message", () => {
    expect(() => invariant(undefined, "nope")).toThrow("nope");
  });
});
