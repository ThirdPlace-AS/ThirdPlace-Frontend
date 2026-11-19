# 06 — Icon Inventory & Approval Status

Reference date 2026-10-24. Baseline = branch `feat/map-m7-m8-hardening` @ `14134e2`.

**Source of every icon:** Ionicons via `@expo/vector-icons`. No custom SVG, PNG, Lottie, Rive or font assets exist (no `assets/` folder).

**Approval status:** founder confirmed (2026-10-24) that **no icon artwork is approved**. The only approved item is the **5-tab navigation structure** (`docs/map/MAP_GAP_MATRIX.md`). Everything below is `PROVISIONAL`. `src/fixtures/index.ts` explicitly says its category icons are "chosen for the demo, not brand-approved iconography".

Proposed families/tiers refer to [02 §4–5](02-dimensional-iconography.md).

## Navigation (tab bar) — `app/(tabs)/_layout.tsx`

| Tab (route) | Glyph                 | Status                                    | Proposed family |
| ----------- | --------------------- | ----------------------------------------- | --------------- |
| map         | `map-outline` / `map` | Structure **APPROVED**; glyph PROVISIONAL | Navigation T1   |
| swipe       | `albums-outline`      | Structure **APPROVED**; glyph PROVISIONAL | Navigation T1   |
| add         | `add-circle-outline`  | Structure **APPROVED**; glyph PROVISIONAL | Navigation T1   |
| chat        | `chatbubbles-outline` | Structure **APPROVED**; glyph PROVISIONAL | Navigation T1   |
| profile     | `person-outline`      | Structure **APPROVED**; glyph PROVISIONAL | Navigation T1   |

## Map utility — `app/(tabs)/map.tsx`, `src/components/map/*`

| Glyph                                             | Where                                                            | Meaning                     | Proposed                     |
| ------------------------------------------------- | ---------------------------------------------------------------- | --------------------------- | ---------------------------- |
| `search`                                          | map.tsx, SearchBar, MapFilterSheet, MapSearchOverlay, WhereField | Search                      | T1                           |
| `options-outline`                                 | map.tsx                                                          | Filters                     | T1                           |
| `layers-outline`                                  | map.tsx                                                          | Map layers                  | T1                           |
| `locate-outline`                                  | map.tsx                                                          | Recentre on me              | T1                           |
| `notifications-outline`                           | map.tsx                                                          | Notifications               | T1                           |
| `cloud-offline-outline`                           | map.tsx                                                          | Offline                     | T1                           |
| `compass-outline`                                 | MapBrowseSheet                                                   | Browse/explore              | T1                           |
| `location` / `location-outline`                   | MapBrowseSheet, MapLocationSheet, CheckinContent, content/\*     | Place / address             | T1                           |
| `information-circle-outline`                      | MapLocationSheet                                                 | Info                        | T1                           |
| `warning-outline`                                 | MapLocationSheet                                                 | Location permission warning | T1                           |
| `sparkles-outline`                                | MapSearchOverlay                                                 | Suggestions                 | T1                           |
| Map pins (drawn Views / Mapbox circles, no glyph) | MapCanvas, MapboxMap (`PIN_COLOR`)                               | Category pins               | Category T1 glyph inside pin |

## Actions & controls

| Glyph                                                           | Where                                                                                             | Proposed                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `close`, `close-circle`                                         | swipe.tsx, Sheet, MapDetailSheet, MapSearchOverlay, WhereField                                    | T1                                                     |
| `arrow-back`, `chevron-back`                                    | NotificationsSheet, MapSearchOverlay, MapDetailSheet                                              | T1                                                     |
| `chevron-forward/down/up`                                       | content/\*, Accordion, MapFilterSheet                                                             | T1                                                     |
| `checkmark`, `checkmark-circle(-outline)`                       | CheckboxRow, NotificationsSheet, MapLayerSheet, WhereField, CheckinContent, Business/PlaceContent | T1                                                     |
| `add`, `remove`                                                 | Stepper                                                                                           | T1                                                     |
| `heart`, `heart-outline`                                        | swipe.tsx, MapBrowseSheet, DetailActions                                                          | T1 (save — candidate for a one-shot "spark" animation) |
| `share-outline`, `flag-outline`                                 | DetailActions                                                                                     | T1                                                     |
| `trash-outline`, `eye-off-outline`, `notifications-off-outline` | NotificationsSheet                                                                                | T1                                                     |
| `settings-outline`                                              | ExperienceContent                                                                                 | T1                                                     |
| `star`, `star-outline`                                          | RatingStars, WriteReviewSheet, ReviewsContent, others                                             | T1                                                     |
| `lock-closed-outline`                                           | GuestLock, SignInPrompt                                                                           | T1 (honesty marker)                                    |

## Content / status

| Glyph                                      | Where                                                        | Proposed                                  |
| ------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------- |
| `time`, `time-outline`, `calendar-outline` | MapFilterSheet, content/\*                                   | T1                                        |
| `people-outline`, `people-circle-outline`  | MapSearchOverlay, Experience/HostContent                     | T1                                        |
| `chatbubbles-outline`                      | Experience/PlaceContent                                      | T1                                        |
| `image-outline`, `images-outline`          | swipe.tsx, MapBrowseSheet, PlaceContent (media placeholders) | Replace with real/demo photography        |
| `shield-checkmark-outline`                 | Business/PlaceContent                                        | Business T1 badge (must stay demo-honest) |
| `alert-circle-outline`                     | StateView                                                    | T1                                        |
| `albums-outline`                           | swipe.tsx empty state                                        | T2 empty-state object                     |

## Category — `src/fixtures/index.ts` `EXPERIENCE_TYPES` (MOCK taxonomy)

| Label                  | Glyph                   | Label            | Glyph              |
| ---------------------- | ----------------------- | ---------------- | ------------------ |
| Arkitektur             | `business-outline`      | Prøvesmakinger   | `cafe-outline`     |
| Dyreliv                | `paw-outline`           | Shopping og møte | `bag-outline`      |
| Flyging                | `airplane-outline`      | Skjønnhet        | `cut-outline`      |
| Forestillinger         | `musical-notes-outline` | Trening          | `barbell-outline`  |
| Friluftsliv            | `leaf-outline`          | Vannsport        | `water-outline`    |
| Gallerier              | `image-outline`         | Velvære          | `flower-outline`   |
| Kulturelle aktiviteter | `color-palette-outline` | Natteliv         | `moon-outline`     |
| Kunstverksteder        | `brush-outline`         | Konserter        | `mic-outline`      |
| Landemerker            | `flag-outline`          | Festivaler       | `sparkles-outline` |
| Matlaging              | `restaurant-outline`    | Historie         | `time-outline`     |
| Matturer               | `fast-food-outline`     | Fotografering    | `camera-outline`   |
| Museer                 | `library-outline`       | Sykkelturer      | `bicycle-outline`  |
| Måltider               | `wine-outline`          |                  |                    |

All 25: status PROVISIONAL / MOCK, proposed **Category T2** (dimensional) + T1 fallback. Collisions to fix in the owned set: `image-outline` (Gallerier vs media placeholder), `flag-outline` (Landemerker vs report), `time-outline` (Historie vs time), `sparkles-outline` (Festivaler vs Førstegangsbesøkende vs suggestions).

## Audience — `AUDIENCES` (MOCK)

Barn `happy-outline` · Store grupper `people-outline` · Alenereisende `person-outline` · Par `heart-outline` · Førstegangsbesøkende `sparkles-outline` · Lokalkjente `location-outline`. Status PROVISIONAL; proposed **Interest T2-lite**. `heart-outline` collides with "save".

## Families with no icons yet

Vibe, Achievement, Business-type, Interest (as a set) — nothing exists. All to be designed per [02 §5](02-dimensional-iconography.md) after approval.

## Brand mark

`src/components/Logo.tsx` — code-drawn Ember square + white dot. PROVISIONAL. See [05 §2](05-brand-recommendations.md).
