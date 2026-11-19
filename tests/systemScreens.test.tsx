// Phase 15 safety nets: "Fant ikke siden" for unknown links, the crash screen
// (PDF p26 "Noe gikk galt") and what a shared join link opens.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CrashScreen } from "@/features/system/CrashScreen";
import NotFoundScreen from "@/features/system/NotFoundScreen";
import SandboxLayout from "../app/_sandbox/_layout";
import { chats, experiences } from "@/fixtures";
import { chatInviteSlug, joinHref } from "@/lib/entityRoutes";
import { resetTo } from "@/lib/navigation";

const { hasRoute } =
  jest.requireActual<typeof import("@/lib/navigation")>("@/lib/navigation");

jest.mock("expo-router", () => {
  const { Text } =
    jest.requireActual<typeof import("react-native")>("react-native");
  return {
    router: { push: jest.fn(), replace: jest.fn(), canGoBack: () => true },
    Redirect: ({ href }: { href: string }) => <Text>{`redirect:${href}`}</Text>,
    Stack: () => <Text>sandbox</Text>,
  };
});
jest.mock("@/lib/navigation", () => ({
  resetTo: jest.fn(),
  goBackOr: jest.fn(),
}));

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

describe("Fant ikke siden", () => {
  it("says the page was not found and goes to the map", () => {
    render(<NotFoundScreen />, { wrapper });
    expect(screen.getByText("Fant ikke siden")).toBeTruthy();
    fireEvent.press(screen.getByText("Til kartet"));
    expect(resetTo).toHaveBeenCalledWith("/map");
  });
});

describe("Crash screen", () => {
  it("shows the p26 error copy and retries", () => {
    const retry = jest.fn(async () => {});
    render(<CrashScreen error={new Error("x")} retry={retry} />);
    expect(screen.getByText("Noe gikk galt")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Prøv igjen" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("join links", () => {
  it("open the chat whose invite slug they carry", () => {
    const group = chats.find((c) => c.type !== "dm") ?? chats[0];
    if (!group) throw new Error("no chats in fixtures");
    expect(joinHref(chatInviteSlug(group.name))).toBe(`/chat/${group.id}`);
  });

  it("open an experience by id (PDF p26 invite page)", () => {
    const exp = experiences[0];
    if (!exp) throw new Error("no experiences in fixtures");
    expect(joinHref(exp.id)).toBe(`/experience/${exp.id}`);
  });

  it("are not found otherwise", () => {
    expect(joinHref("finnes-ikke")).toBeNull();
  });
});

describe("invite links (thirdplace://i/<code>)", () => {
  it("know whether the tabs are in the history, at any depth", () => {
    const inApp = {
      routes: [
        {
          name: "__root",
          state: { routes: [{ name: "(tabs)" }, { name: "i/[code]" }] },
        },
      ],
    };
    const fresh = {
      routes: [{ name: "__root", state: { routes: [{ name: "i/[code]" }] } }],
    };
    expect(hasRoute(inApp, "(tabs)")).toBe(true);
    expect(hasRoute(fresh, "(tabs)")).toBe(false);
    expect(hasRoute(undefined, "(tabs)")).toBe(false);
  });
});

describe("dev screens", () => {
  const g = globalThis as unknown as { __DEV__: boolean };
  const dev = g.__DEV__;
  afterEach(() => {
    g.__DEV__ = dev;
  });

  it("open in development builds", () => {
    g.__DEV__ = true;
    render(<SandboxLayout />);
    expect(screen.getByText("sandbox")).toBeTruthy();
  });

  it("send a release build to the map", () => {
    g.__DEV__ = false;
    render(<SandboxLayout />);
    expect(screen.getByText("redirect:/map")).toBeTruthy();
  });
});
