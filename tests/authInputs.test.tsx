// Phase 13 J7: the e-mail and password fields on Logg inn, Registrer deg and
// Glemt passord take typing (they looked editable but were read-only).
// Nothing is checked or sent; the buttons work as before.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ForgotPassword from "../app/(auth)/forgot-password";
import Login from "../app/(auth)/login";
import Register from "../app/register";

jest.mock("expo-router", () => {
  const { Fragment, createElement } =
    jest.requireActual<typeof import("react")>("react");
  return {
    router: {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
      navigate: jest.fn(),
      canGoBack: () => true,
      dismissAll: jest.fn(),
    },
    Link: ({ children }: { children: React.ReactNode }) =>
      createElement(Fragment, null, children),
    useFocusEffect: () => {},
  };
});

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

const typeInto = (label: string, text: string) => {
  fireEvent.changeText(screen.getByLabelText(label), text);
  expect(screen.getByDisplayValue(text)).toBeTruthy();
};

describe("auth fields take typing", () => {
  it("Logg inn", () => {
    render(<Login />, { wrapper });
    typeInto("E-postadresse", "kari@example.com");
    typeInto("Passord", "hemmelig123");
  });

  it("Registrer deg", () => {
    render(<Register />, { wrapper });
    typeInto("E-postadresse", "kari@example.com");
    typeInto("Passord", "hemmelig123");
  });

  it("Glemt passord", () => {
    render(<ForgotPassword />, { wrapper });
    typeInto("E-postadresse", "kari@example.com");
  });
});
