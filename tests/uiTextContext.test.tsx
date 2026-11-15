// Text on the React Native Reusables base (P2): the class string is the same
// as before, and a parent's TextClassContext colours a Text without a tone.
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { TextClassContext } from "@/components/ui/base/text";
import { Text } from "@/components/ui/Text";

const cls = (label: string) =>
  (screen.getByText(label).props as { className?: string }).className;

describe("Text on the base layer", () => {
  it("keeps the variant + tone class string (ink by default)", () => {
    render(
      <>
        <Text>a</Text>
        <Text variant="micro" tone="ember" className="mt-sm">
          b
        </Text>
      </>,
    );
    expect(cls("a")).toBe("text-body text-ink");
    expect(cls("b")).toBe("text-micro uppercase text-emberText mt-sm");
  });

  it("takes the context tone; an explicit tone wins", () => {
    render(
      <TextClassContext.Provider value="onInk">
        <Text>c</Text>
        <Text tone="muted">d</Text>
      </TextClassContext.Provider>,
    );
    expect(cls("c")).toBe("text-body text-onInk");
    expect(cls("d")).toBe("text-body text-muted");
  });
});
