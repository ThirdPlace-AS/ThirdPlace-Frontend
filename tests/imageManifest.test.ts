// H0b (Phase 12): every bundled photo ships as WebP in two sizes with a
// blurred preview, and nothing loads the old JPEGs any more.
import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

import {
  LIBRARY_FULL,
  LIBRARY_SMALL,
  PLACEHOLDER,
  SWIPE_FULL,
  SWIPE_SMALL,
} from "@/fixtures/imageAssets.generated";
import {
  imagePreview,
  libImage,
  libThumb,
  smallImage,
  swipeImage,
  type LibraryKey,
  type SwipeKey,
} from "@/fixtures/images";

const ROOT = path.join(__dirname, "..");

describe("bundled image manifest", () => {
  const SETS: [string, Record<string, unknown>, Record<string, unknown>][] = [
    ["library", LIBRARY_FULL, LIBRARY_SMALL],
    ["swipe", SWIPE_FULL, SWIPE_SMALL],
  ];
  it.each(SETS)(
    "%s: both sizes on disk and a preview per photo",
    (dir, full, small) => {
      const keys = Object.keys(full);
      expect(keys.length).toBeGreaterThan(0);
      expect(Object.keys(small).sort()).toEqual([...keys].sort());
      for (const key of keys) {
        expect(
          fs.existsSync(path.join(ROOT, "assets", dir, `${key}.webp`)),
        ).toBe(true);
        expect(
          fs.existsSync(path.join(ROOT, "assets", dir, `${key}-sm.webp`)),
        ).toBe(true);
        expect(PLACEHOLDER[`${dir}/${key}`]).toMatch(
          /^data:image\/webp;base64,/,
        );
      }
    },
  );

  it("maps a full photo to its small file and its preview", () => {
    for (const key of Object.keys(LIBRARY_FULL) as LibraryKey[]) {
      expect(smallImage(libImage(key))).toBe(libThumb(key));
      expect(imagePreview(libImage(key))?.uri).toBe(
        PLACEHOLDER[`library/${key}`],
      );
      expect(imagePreview(libThumb(key))?.uri).toBe(
        PLACEHOLDER[`library/${key}`],
      );
    }
    for (const key of Object.keys(SWIPE_FULL) as SwipeKey[]) {
      expect(smallImage(swipeImage(key))).toBe(SWIPE_SMALL[key]);
      expect(imagePreview(swipeImage(key))).toBeDefined();
    }
  });

  it("leaves unknown sources unchanged", () => {
    const remote = { uri: "https://example.com/a.jpg" };
    expect(smallImage(remote)).toBe(remote);
    expect(imagePreview(remote)).toBeUndefined();
  });

  it("no JPEG is bundled or required any more", () => {
    for (const dir of ["library", "swipe"]) {
      const jpgs = fs
        .readdirSync(path.join(ROOT, "assets", dir))
        .filter((f) => /\.jpe?g$/i.test(f));
      expect(jpgs).toEqual([]);
    }
    const offenders: string[] = [];
    const walk = (d: string) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e.name)) {
          const src = fs.readFileSync(p, "utf8");
          if (/require\([^)]*\.jpe?g["']\)/.test(src)) offenders.push(p);
        }
      }
    };
    walk(path.join(ROOT, "src"));
    walk(path.join(ROOT, "app"));
    expect(offenders).toEqual([]);
  });
});
