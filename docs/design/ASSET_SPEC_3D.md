# ThirdPlace — 3D category art spec

Status: **hand-built SVG set shipped** (S12, 2026-11-06). This spec is the brief for anyone who later makes real renders (a designer, a commission, or an approved generator). Real files replace the SVG one key at a time; no screen code changes.

## Where the art appears

Only in slots the design PDF already has:

| Slot                                               | PDF     | Size | Key(s)                         |
| -------------------------------------------------- | ------- | ---- | ------------------------------ |
| "Hva vil du legge til?" rows                       | p10     | 48   | `place`, `experience`, `group` |
| Location prompt tile ("Hvor er du?")               | p5      | 96   | `location`                     |
| Category value / "Velg kategori" (when wired, P4e) | p10–p11 | 32   | category keys below            |

Not used for: tab bar, chips smaller than 32 px, decoration rails, or anything the PDF doesn't show.

## Keys and labels

`src/assets/3d/manifest.ts` maps app labels to keys.

| Key          | Object                                               | Labels                 |
| ------------ | ---------------------------------------------------- | ---------------------- |
| `cafe`       | Cup and saucer, coffee, ember band                   | Kafé, Bokcafé          |
| `bar`        | Beer mug with foam                                   | Bar                    |
| `restaurant` | Plate with tomato and herb                           | Restaurant             |
| `outdoors`   | Round tree                                           | Utendørs               |
| `culture`    | Columned building, ember pediment                    | Kultur                 |
| `workshop`   | Hammer                                               | Verksted               |
| `tasting`    | Wine glass                                           | Kurs & smaking, Vinbar |
| `music`      | Vinyl record, ember label                            | Musikk                 |
| `hiking`     | Two peaks, snow cap, green base                      | Tur & friluft          |
| `art`        | Painter's palette                                    | Kunst & kultur         |
| `sport`      | Football                                             | Sport & trening        |
| `social`     | Two speech bubbles                                   | Sosialt                |
| `place`      | Map plate with ember pin                             | Sted                   |
| `experience` | Ember ticket                                         | Opplevelse             |
| `group`      | Three friends: ember in front, grey and green behind | Gruppe                 |
| `location`   | App-tile map with an ink pin                         | location prompt        |

## Style (locked)

- **Recognisable objects only.** A cup, a mug, a hammer — never abstract blobs, glossy spheres or "AI 3D" shapes.
- **Toon shading:** flat face colour, one shade (same hue, darker) on the side away from the light, one hard-edged highlight on the lit side. Renders: matte/satin, no reflections, no glow.
- **Light:** one key light from the top-left for every object.
- **Camera:** ¾ view, about 30° down; objects show thickness (top ellipse or a 3–4 px extrusion).
- **Contact shadow:** one flat soft ellipse under the object, ink at about 12 %.
- **Palette:** ThirdPlace tokens only — brand pink `#FF385C` (the `ember` token, Airbnb palette since 2026-11-06), ink `#222222`, success green, warning amber, and their light/dark mixes; paper-grey (muted mixed with white) for "white" objects so they read on white cards. At most one ember element per object. No purple/blue gradients, no rainbow, no neon.
- **Background:** transparent; nothing behind the object.
- **No text** in the art.
- Works on light and dark screens unchanged (like a photo).

## Delivering a real render

1. Render at 192 × 192 px (64 pt @3x), transparent background, object centred with ~8 % margin, contact shadow included.
2. Export WebP, quality 90, ≤ 40 KB. Name it `<key>@3x.webp` (add `@2x` 128 px and `@1x` 64 px if wanted).
3. Put it in `src/assets/3d/` and list it in `artFiles` in `manifest.ts`: `cafe: require("./cafe@3x.webp")`.
4. `CategoryArt` shows the file instead of the SVG everywhere that key is used. Check the slot on the Android emulator in light and dark.

## Checks before accepting a render

- Same light direction and camera as the rest of the set.
- Reads at 32 px (squint test against the other keys).
- One ember accent at most; no off-palette colours.
- Passes the "does this look AI-made?" check in `docs/reviews` (no plastic gloss, no impossible geometry, no melted details).
