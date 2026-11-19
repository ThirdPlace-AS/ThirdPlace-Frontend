import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { Header, StepHeader, TitleBlock } from "@/components/ui";

describe("Header", () => {
  it("shows a back button that calls onBack, title as heading", () => {
    const onBack = jest.fn();
    render(<Header title="Innstillinger" onBack={onBack} />);
    fireEvent.press(screen.getByRole("button", { name: "Tilbake" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("header", { name: "Innstillinger" })).toBeTruthy();
  });

  it("can hide the back button", () => {
    render(<Header title="Chat" back={false} />);
    expect(screen.queryByRole("button", { name: "Tilbake" })).toBeNull();
  });
});

describe("StepHeader", () => {
  it("exposes progress to assistive tech", () => {
    render(<StepHeader current={1} total={8} onBack={() => {}} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 8, now: 2 });
    expect(screen.getByText("2 av 8")).toBeTruthy();
  });

  it("uses a custom counter label", () => {
    render(
      <StepHeader
        current={0}
        total={5}
        onBack={() => {}}
        label="Steg 1 av 5"
      />,
    );
    expect(screen.getByText("Steg 1 av 5")).toBeTruthy();
  });
});

describe("TitleBlock", () => {
  it("renders title and subtitle", () => {
    render(<TitleBlock title="Logg inn" subtitle="Velkommen tilbake" />);
    expect(screen.getByText("Logg inn")).toBeTruthy();
    expect(screen.getByText("Velkommen tilbake")).toBeTruthy();
  });
});
