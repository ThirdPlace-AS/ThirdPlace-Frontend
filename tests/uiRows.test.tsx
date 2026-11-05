import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import {
  Avatar,
  initialsOf,
  Input,
  ListRow,
  MetaRow,
  SearchBar,
} from "@/components/ui";

describe("Avatar", () => {
  it("derives initials from first and last name", () => {
    expect(initialsOf("Maria Movik")).toBe("MM");
    expect(initialsOf("  åse  kvam ")).toBe("ÅK");
    expect(initialsOf("Cher")).toBe("C");
  });

  it("is an image labelled with the name, unless decorative", () => {
    render(<Avatar name="Maria Movik" />);
    expect(screen.getByRole("image", { name: "Maria Movik" })).toBeTruthy();
    expect(screen.getByText("MM")).toBeTruthy();
  });
});

describe("ListRow", () => {
  it("is a button with a chevron when pressable", () => {
    const onPress = jest.fn();
    render(<ListRow title="Personvern" value="På" onPress={onPress} />);
    fireEvent.press(screen.getByRole("button", { name: "Personvern" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText("På")).toBeTruthy();
  });

  it("is static without onPress", () => {
    render(<ListRow title="Maria" subtitle="Vert" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Vert")).toBeTruthy();
  });

  it("MetaRow renders its text", () => {
    render(<MetaRow icon="time-outline" text="08–16" />);
    expect(screen.getByText("08–16")).toBeTruthy();
  });
});

describe("Input", () => {
  it("shows an error message and announces it as a hint", () => {
    render(
      <Input
        label="E-post"
        value="x"
        onChangeText={() => {}}
        error="Ugyldig e-post"
      />,
    );
    expect(screen.getByText("Ugyldig e-post")).toBeTruthy();
    expect(screen.getByLabelText("E-post").props.accessibilityHint).toBe(
      "Ugyldig e-post",
    );
  });

  it("is not editable without onChangeText", () => {
    render(<Input label="Navn" />);
    expect(screen.getByLabelText("Navn").props.editable).toBe(false);
  });
});

describe("SearchBar", () => {
  it("offers a clear button only when there is text", () => {
    const onChangeText = jest.fn();
    const { rerender } = render(
      <SearchBar placeholder="Søk" value="" onChangeText={onChangeText} />,
    );
    expect(screen.queryByRole("button", { name: "Tøm søk" })).toBeNull();
    rerender(
      <SearchBar placeholder="Søk" value="jazz" onChangeText={onChangeText} />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Tøm søk" }));
    expect(onChangeText).toHaveBeenCalledWith("");
  });
});
