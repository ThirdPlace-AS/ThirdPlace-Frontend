// Speed pass (0349): the browse list decoded every page of every card up
// front (~100 bitmaps after a scroll). A card now mounts its first photo
// only, the rest once someone starts swiping; a bundled photo's blurred
// preview stands in for the skeleton (no pulse loop under it); the preview
// object is built once.
import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Image } from "expo-image";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PhotoPager } from "@/components/map/PhotoPager";
import { LoadingImage } from "@/components/ui/LoadingImage";
import { PhotoViewer } from "@/components/ui/PhotoViewer";
import { imagePreview, libImage } from "@/fixtures/images";

// The viewer sets the status bar through a focus effect; no navigator here.
jest.mock("expo-router", () => ({ useFocusEffect: () => {} }));

const PHOTOS = [
  libImage("venue-cafe"),
  libImage("venue-bar"),
  libImage("venue-books"),
];

describe("PhotoPager", () => {
  it("mounts only the first photo until a swipe starts", () => {
    const ui = render(<PhotoPager photos={PHOTOS} width={320} />);
    expect(ui.UNSAFE_queryAllByType(Image)).toHaveLength(1);
    expect(
      screen.getAllByTestId("photo-page-later", {
        includeHiddenElements: true,
      }),
    ).toHaveLength(2);
    fireEvent(
      screen.getByTestId("photo-pager", { includeHiddenElements: true }),
      "scrollBeginDrag",
    );
    expect(ui.UNSAFE_queryAllByType(Image)).toHaveLength(3);
    expect(
      screen.queryAllByTestId("photo-page-later", {
        includeHiddenElements: true,
      }),
    ).toHaveLength(0);
  });

  it("pages at the width it is given, without a layout pass", () => {
    render(<PhotoPager photos={PHOTOS} width={320} />);
    const later = screen.getAllByTestId("photo-page-later", {
      includeHiddenElements: true,
    });
    expect(later[0]).toHaveStyle({ width: 320 });
  });

  it("measures itself when no width is given", () => {
    const ui = render(<PhotoPager photos={PHOTOS} />);
    expect(ui.UNSAFE_queryAllByType(Image)).toHaveLength(0);
    fireEvent(ui.root, "layout", {
      nativeEvent: { layout: { width: 300, height: 280, x: 0, y: 0 } },
    });
    expect(ui.UNSAFE_queryAllByType(Image)).toHaveLength(1);
  });
});

describe("LoadingImage", () => {
  it("shows no skeleton or spinner under a bundled photo's preview", () => {
    jest.useFakeTimers();
    try {
      render(
        <LoadingImage
          source={libImage("venue-cafe")}
          style={{ width: 100, height: 100 }}
        />,
      );
      act(() => jest.advanceTimersByTime(2500));
      expect(screen.queryByLabelText("Laster bilde")).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it("keeps the loading rule for a photo without a preview", () => {
    jest.useFakeTimers();
    try {
      render(
        <LoadingImage
          source={{ uri: "https://example.org/photo.jpg" }}
          style={{ width: 100, height: 100 }}
        />,
      );
      expect(screen.queryByLabelText("Laster bilde")).toBeNull();
      act(() => jest.advanceTimersByTime(2500));
      expect(screen.getByLabelText("Laster bilde")).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe("imagePreview", () => {
  it("returns the same object every time", () => {
    const src = libImage("venue-cafe");
    expect(imagePreview(src)).toBeDefined();
    expect(imagePreview(src)).toBe(imagePreview(src));
  });
});

// Speed pass (0350): the viewer's list used the defaults (ten items, 21
// screens), so opening it mounted and decoded every full photo of the item.
describe("PhotoViewer", () => {
  it("mounts the photo it opens at and its neighbour, not the whole set", () => {
    jest.useFakeTimers();
    try {
      render(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 360, height: 640 },
            insets: { top: 24, left: 0, right: 0, bottom: 0 },
          }}
        >
          <PhotoViewer
            photos={PHOTOS}
            index={0}
            onClose={() => {}}
            label="Kafé"
          />
        </SafeAreaProvider>,
      );
      act(() => jest.runOnlyPendingTimers());
      expect(screen.getByLabelText("Bilde 1 av 3")).toBeTruthy();
      expect(screen.queryByLabelText("Bilde 3 av 3")).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});
