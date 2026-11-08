import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useState } from "react";
import { Text } from "react-native";

import {
  Accordion,
  ErrorState,
  FollowButton,
  HeartToggle,
  SkeletonList,
  StateView,
} from "@/components/ui";

function Heart() {
  const [on, setOn] = useState(false);
  return <HeartToggle selected={on} onToggle={() => setOn((v) => !v)} />;
}

describe("HeartToggle", () => {
  it("toggles label and selected state", () => {
    render(<Heart />);
    const off = screen.getByRole("button", { name: "Lagre" });
    expect(off.props.accessibilityState).toMatchObject({ selected: false });
    fireEvent.press(off);
    const on = screen.getByRole("button", { name: "Fjern fra lagret" });
    expect(on.props.accessibilityState).toMatchObject({ selected: true });
  });
});

describe("FollowButton", () => {
  it("names the person and reports following", () => {
    const onPress = jest.fn();
    const { rerender } = render(
      <FollowButton following={false} onPress={onPress} name="Ida" />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Følg Ida" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(<FollowButton following onPress={onPress} name="Ida" />);
    const btn = screen.getByRole("button", { name: "Slutt å følge Ida" });
    expect(btn.props.accessibilityState).toMatchObject({ selected: true });
    expect(screen.getByText("Følger")).toBeTruthy();
  });
});

describe("Accordion", () => {
  it("reports expanded and hides collapsed content from screen readers", () => {
    render(
      <Accordion title="Grupper" meta="3">
        <Text>Innhold</Text>
      </Accordion>,
    );
    const header = screen.getByRole("button", { name: "Grupper, 3" });
    expect(header.props.accessibilityState).toMatchObject({ expanded: false });
    fireEvent.press(header);
    expect(
      screen.getByRole("button", { name: "Grupper, 3" }).props
        .accessibilityState,
    ).toMatchObject({ expanded: true });
  });

  it("follows the controlled open prop", () => {
    const onToggle = jest.fn();
    render(
      <Accordion title="Arkiv" open onToggle={onToggle}>
        <Text>Innhold</Text>
      </Accordion>,
    );
    const header = screen.getByRole("button", { name: "Arkiv" });
    expect(header.props.accessibilityState).toMatchObject({ expanded: true });
    fireEvent.press(header);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("lazy: mounts the content on first open and keeps it after", () => {
    // Filtre's Kategori rows (0319): 92 activity chips mounted up front made
    // the sheet slow to open.
    render(
      <Accordion title="Trening" lazy>
        <Text>Klatring</Text>
      </Accordion>,
    );
    // Hidden from screen readers while closed: look past that, at what is
    // mounted at all.
    const all = { includeHiddenElements: true } as const;
    expect(screen.queryByText("Klatring", all)).toBeNull();
    const header = screen.getByRole("button", { name: "Trening" });
    fireEvent.press(header);
    expect(screen.getByText("Klatring", all)).toBeTruthy();
    // Closing keeps it mounted, so the close can animate.
    fireEvent.press(screen.getByRole("button", { name: "Trening" }));
    expect(screen.getByText("Klatring", all)).toBeTruthy();
  });

  it("not lazy: the content is mounted while collapsed (measured)", () => {
    render(
      <Accordion title="Velvære">
        <Text>Yoga</Text>
      </Accordion>,
    );
    expect(
      screen.getByText("Yoga", { includeHiddenElements: true }),
    ).toBeTruthy();
  });
});

describe("StateView", () => {
  it("shows title, message and runs both actions", () => {
    const a = jest.fn();
    const b = jest.fn();
    render(
      <StateView
        icon="albums-outline"
        title="Tomt her"
        message="Endre filtrene for å se mer."
        actionLabel="Endre filtre"
        onAction={a}
        secondaryLabel="Utforsk kartet"
        onSecondary={b}
      />,
    );
    expect(screen.getByText("Tomt her")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Endre filtre" }));
    fireEvent.press(screen.getByRole("button", { name: "Utforsk kartet" }));
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("ErrorState renders a header and a retry", () => {
    const retry = jest.fn();
    render(
      <ErrorState
        title="Noe gikk galt"
        actionLabel="Prøv igjen"
        onAction={retry}
      />,
    );
    expect(screen.getByRole("header", { name: "Noe gikk galt" })).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Prøv igjen" }));
    expect(retry).toHaveBeenCalled();
  });
});

describe("SkeletonList", () => {
  it("is one busy element for screen readers", () => {
    render(<SkeletonList label="Laster steder" />);
    const el = screen.getByLabelText("Laster steder");
    expect(el.props.accessibilityState).toMatchObject({ busy: true });
  });
});
