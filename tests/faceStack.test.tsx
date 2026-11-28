// Faces of people going: three at most, then a "+N" circle for the rest
// (user 2026-11-27, 0560).
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { FaceStack } from "@/components/FaceStack";
import type { GoingFace } from "@/lib/going";

const face = (n: number): GoingFace => ({
  key: `p${n}`,
  name: `Person ${n}`,
  initials: `P${n}`,
});

const three = [face(1), face(2), face(3)];
// The stack is decorative (hidden from screen readers).
const H = { includeHiddenElements: true };

describe("FaceStack", () => {
  it("shows three faces and +N for the others when more than three go", () => {
    render(<FaceStack faces={three} count={5} />);
    expect(screen.getByText("P1", H)).toBeTruthy();
    expect(screen.getByText("P3", H)).toBeTruthy();
    expect(screen.getByText("+2", H)).toBeTruthy();
  });

  it("shows no +N at three or fewer", () => {
    render(<FaceStack faces={three} count={3} />);
    expect(screen.queryByText(/^\+/, H)).toBeNull();
  });

  it("counts people who are not shown in the +N", () => {
    render(<FaceStack faces={[face(1)]} count={6} />);
    expect(screen.getByText("+5", H)).toBeTruthy();
  });

  it("without a count, only the faces", () => {
    render(<FaceStack faces={three} />);
    expect(screen.queryByText(/^\+/, H)).toBeNull();
  });
});
