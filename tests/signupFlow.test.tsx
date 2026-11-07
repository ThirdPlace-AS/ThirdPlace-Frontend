// Phase 12 H5e (founder 2026-11-06): "Kom i gang" goes straight to
// onboarding and the account + verification come last; from "Registrer deg"
// the account comes first. Whichever step completes the pair starts the
// session.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Welcome from "../app/(auth)/welcome";
import {
  getSignupProgress,
  isSignedUp,
  markAccountCreated,
  markOnboarded,
  resetSignupProgress,
} from "@/lib/signupProgress";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
    canDismiss: () => false,
    dismissAll: jest.fn(),
  },
  Link: ({ children }: { children: React.ReactNode }) => children,
  useFocusEffect: () => {},
}));

beforeEach(() => {
  mockPush.mockClear();
  act(() => resetSignupProgress());
});

describe("sign-up order", () => {
  it("from the welcome screen: onboarding, then the account, then the map", () => {
    expect(markOnboarded()).toBe("/register");
    expect(isSignedUp(getSignupProgress())).toBe(false);
    expect(markAccountCreated()).toBe("/map");
    expect(isSignedUp(getSignupProgress())).toBe(true);
  });

  it("from Registrer deg: the account, then onboarding, then the map", () => {
    expect(markAccountCreated()).toBe("/onboarding");
    expect(markOnboarded()).toBe("/map");
  });

  it("logging out starts over", () => {
    markOnboarded();
    markAccountCreated();
    resetSignupProgress();
    expect(getSignupProgress()).toEqual({
      onboarded: false,
      accountCreated: false,
    });
  });
});

describe("welcome screen", () => {
  it("Kom i gang opens onboarding, not registration", () => {
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 640 },
          insets: { top: 24, left: 0, right: 0, bottom: 0 },
        }}
      >
        <Welcome />
      </SafeAreaProvider>,
    );
    fireEvent.press(screen.getByText("Kom i gang"));
    expect(mockPush).toHaveBeenCalledWith("/onboarding");
  });
});
