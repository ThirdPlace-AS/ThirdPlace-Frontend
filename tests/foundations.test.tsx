import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { DemoBadge } from "@/components/DemoBadge";
import { GuestLock } from "@/components/GuestLock";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/states/StateView";

describe("foundation components", () => {
  it("DemoBadge renders its label", () => {
    render(<DemoBadge />);
    expect(screen.getByText("DEMO")).toBeTruthy();
  });

  it("GuestLock shows the message", () => {
    render(<GuestLock message="Logg inn for å bli med" />);
    expect(screen.getByText("Logg inn for å bli med")).toBeTruthy();
  });

  it("SearchBar reports typed text", () => {
    const onChangeText = jest.fn();
    render(<SearchBar placeholder="Søk steder" onChangeText={onChangeText} />);
    fireEvent.changeText(screen.getByPlaceholderText("Søk steder"), "kaffe");
    expect(onChangeText).toHaveBeenCalledWith("kaffe");
  });

  it("EmptyState renders title and action", () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        icon="search"
        title="Ingen treff"
        actionLabel="Nullstill"
        onAction={onAction}
      />,
    );
    expect(screen.getByText("Ingen treff")).toBeTruthy();
    fireEvent.press(screen.getByText("Nullstill"));
    expect(onAction).toHaveBeenCalled();
  });
});
