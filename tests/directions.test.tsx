// Phase 16 (section benchmark): "Veibeskrivelse" next to a place's address and
// the meeting point hands the destination to the phone's maps app.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MeetingSection } from "@/components/experience/ExperienceSections";
import { PlaceContent } from "@/components/map/content/PlaceContent";
import { PlacePage } from "@/components/place/PlacePage";
import { experienceById, placeById } from "@/fixtures";
import { directionsUrl, openDirections } from "@/lib/directions";

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

const openURL = jest.spyOn(Linking, "openURL");
beforeEach(() => {
  openURL.mockReset();
  openURL.mockResolvedValue(true);
});

describe("directionsUrl", () => {
  it("asks the maps app for a route to the coordinate (lat,lng)", () => {
    expect(directionsUrl([10.7579, 59.9227], "android")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=59.9227,10.7579",
    );
    expect(directionsUrl([10.7579, 59.9227], "ios")).toBe(
      "https://maps.apple.com/?daddr=59.9227,10.7579",
    );
  });

  it("reports when nothing could open it", async () => {
    expect(await openDirections([10.7, 59.9])).toBe(true);
    openURL.mockRejectedValueOnce(new Error("no handler"));
    expect(await openDirections([10.7, 59.9])).toBe(false);
  });
});

describe("Veibeskrivelse", () => {
  it("on the meeting point of an experience", () => {
    const e1 = experienceById("e1")!;
    render(
      <MeetingSection exp={e1} hostName="Sofie Berg" onShowOnMap={jest.fn()} />,
      { wrapper },
    );
    fireEvent.press(
      screen.getByLabelText(`Veibeskrivelse til ${e1.meetingPoint.name}`),
    );
    expect(openURL).toHaveBeenCalledWith(directionsUrl(e1.meetingPoint.coord));
  });

  it("on a place's page and in its map sheet", () => {
    const p1 = placeById("p1")!;
    render(<PlacePage place={p1} onNavigate={jest.fn()} />, { wrapper });
    fireEvent.press(screen.getByLabelText(`Veibeskrivelse til ${p1.name}`));
    expect(openURL).toHaveBeenLastCalledWith(directionsUrl(p1.coord));
    screen.unmount();

    render(<PlaceContent id="p1" push={jest.fn()} />, { wrapper });
    fireEvent.press(screen.getByLabelText(`Veibeskrivelse til ${p1.name}`));
    expect(openURL).toHaveBeenCalledTimes(2);
  });
});
