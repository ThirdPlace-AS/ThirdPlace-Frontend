// CodeInput on input-otp-native (P5): digits only, six boxes, a pasted or
// autofilled code keeps its digits.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";

import { CodeInput } from "@/components/auth/CodeInput";

function setup() {
  const onChange = jest.fn();
  const view = render(<CodeInput value="" onChange={onChange} />);
  const field = view.getByLabelText("Kode, 6 siffer");
  return { view, field, onChange };
}

describe("CodeInput", () => {
  it("passes typed digits on", () => {
    const { field, onChange } = setup();
    fireEvent.changeText(field, "1");
    fireEvent.changeText(field, "12");
    expect(onChange).toHaveBeenLastCalledWith("12");
  });

  it("ignores letters", () => {
    const { field, onChange } = setup();
    fireEvent.changeText(field, "a");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the digits of a pasted code", () => {
    const { view, field, onChange } = setup();
    fireEvent.changeText(field, "Kode: 123 456");
    expect(onChange).toHaveBeenLastCalledWith("123456");
    expect(view.getByText("1")).toBeTruthy();
    expect(view.getByText("6")).toBeTruthy();
  });
});
