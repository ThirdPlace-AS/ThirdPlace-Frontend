import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";

import {
  Illustration,
  type IllustrationName,
} from "@/components/illustrations/Illustration";

const NAMES: IllustrationName[] = [
  "offline",
  "error",
  "maintenance",
  "update",
  "emptySaved",
  "emptyDeck",
  "emptyPlans",
];

describe("Illustration", () => {
  it.each(NAMES)("renders %s at the 4:3 canvas", (name) => {
    const { toJSON } = render(<Illustration name={name} width={200} />);
    const svg = toJSON() as { props: { height?: number } } | null;
    expect(svg).toBeTruthy();
    expect(svg?.props.height).toBe(150);
  });
});
