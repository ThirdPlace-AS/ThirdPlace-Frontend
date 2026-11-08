# Map Surface — Gap & Traceability Matrix

Source: master Map implementation brief + `DESIGN/ThirdPlace_All_Screens.pdf`
(**visual reference only**, not an API/data authority). This matrix traces every
Map capability to its current implementation and status. It is the Milestone-1
deliverable and is updated as later milestones land.

**Authority** — `approved` (founder/contract), `provisional` (in repo, not
founder-approved), `historical` (prior doc, not V2.2-certified), `blocked`
(needs a canonical contract decision).
**Status** — `complete`, `partial`, `missing`, `blocked`.
**Completion class** — `verified`, `demo-complete` (fixtures, no backend),
`partial`, `contract-blocked`, `native-verify-outstanding`.

## Legend of current paths

- Route: [app/(tabs)/map.tsx](<../../app/(tabs)/map.tsx>)
- Map render: [MapCanvas.tsx](../../src/components/map/MapCanvas.tsx), [MapboxMap.tsx](../../src/components/map/MapboxMap.tsx)
- Detail sheet: [MapDetailSheet.tsx](../../src/components/map/MapDetailSheet.tsx) + [content/\*](../../src/components/map/content)
- Filters: [MapFilterSheet.tsx](../../src/components/map/MapFilterSheet.tsx)
- Fixtures: [fixtures/index.ts](../../src/fixtures/index.ts)

## Matrix

| Feature                                                                       | Brief § | Authority   | Current path                                        | Status                      | Deps             | Priority | Tests                | Founder approval                                    |
| ----------------------------------------------------------------------------- | ------- | ----------- | --------------------------------------------------- | --------------------------- | ---------------- | -------- | -------------------- | --------------------------------------------------- |
| Full-screen map canvas                                                        | 5, 20   | provisional | MapCanvas `fill`                                    | complete                    | —                | critical | render               | no                                                  |
| Native Mapbox + SoftMap fallback                                              | 20      | provisional | MapboxMap / SoftMap / stub                          | demo-complete               | native build     | critical | bundle smoke         | no                                                  |
| Floating search bar + grouped overlay                                         | 8       | provisional | map.tsx + MapSearch (/search page) + mapSearch      | demo-complete               | fixtures         | high     | mapSearch            | no                                                  |
| Search suggestions (autocomplete)                                             | 8       | provisional | MapSearch (/search page) chips + suggestFixtures    | demo-complete (titles only) | mock             | medium   | mapSearch            | no                                                  |
| Unified query matcher (overlay = map = adapter)                               | 8, 9    | provisional | mapSearch.placeMatchesQuery/experience…             | complete                    | —                | high     | mapSearch/mapFilters | no                                                  |
| Discovery-mode selector (6)                                                   | 6       | provisional | DiscoveryModeTabs                                   | demo-complete               | fixtures         | critical | mode switch          | For You/Friends: yes                                |
| Notifications control + unread                                                | 5       | provisional | map.tsx + NotificationsScreen (/notifications)      | complete                    | —                | medium   | render               | no                                                  |
| Notifications: IG restyle + swipe/menu actions                                | 5, 11   | provisional | NotificationsScreen (/notifications) + SwipeableRow | demo-complete               | fixtures         | medium   | visibleNotifications | demo-only (see note)                                |
| Floating filter button + badge                                                | 5, 9    | provisional | map.tsx                                             | complete                    | —                | high     | render               | no                                                  |
| Current-location control                                                      | 5, 13   | provisional | map.tsx + useMapLocation                            | demo-complete (NV-6)        | expo-location    | high     | interaction          | no                                                  |
| Category pins                                                                 | 7       | provisional | MapboxMap pins                                      | demo-complete               | —                | high     | render               | no                                                  |
| Marker clustering                                                             | 7       | provisional | MapboxMap ShapeSource + softClustering              | demo-complete               | native build     | high     | —                    | no                                                  |
| Selected-marker highlight                                                     | 7       | provisional | MapboxMap `isSelected`                              | complete                    | —                | high     | render               | no                                                  |
| Floating preview card                                                         | 10      | provisional | MapPreviewCard                                      | demo-complete               | —                | critical | preview sync         | no                                                  |
| Expandable detail sheet                                                       | 10, 11  | provisional | MapDetailSheet (16/50/92%)                          | complete                    | —                | critical | render               | no                                                  |
| Map/list toggle + results list                                                | 5, 18K  | provisional | MapBrowseSheet (peek list, Airbnb rows)             | demo-complete               | fixtures         | high     | switch preserves ctx | no                                                  |
| Browse peek sheet + weather/city header                                       | 5       | provisional | MapBrowseSheet (city label + mock weather)          | demo-complete               | mock weather     | medium   | peek/expand          | weather: mock (CB-9)                                |
| Loading / empty states                                                        | 19      | provisional | map.tsx overlays + StateView                        | demo-complete               | —                | medium   | empty results        | no                                                  |
| Error / offline / recovery                                                    | 19      | provisional | map.tsx + StateView                                 | demo-complete               | —                | medium   | recovery             | no                                                  |
| 5-tab navigation                                                              | 5       | approved    | app/(tabs)/\_layout.tsx                             | complete                    | —                | —        | —                    | no                                                  |
| Advanced filters: category/distance/open-now                                  | 9       | provisional | MapFilterSheet (Opplevelsestype/Avstand/Tilgj.)     | complete                    | —                | high     | each filter          | no                                                  |
| Advanced filters: vibes                                                       | 9       | provisional | MapFilterSheet (Vibe section, `vibes`)              | demo-complete               | mock field       | high     | vibe select          | fields: flagged mock                                |
| Advanced filters: time                                                        | 9       | provisional | MapFilterSheet (Når section, `time`)                | demo-complete               | mock field       | high     | time select          | fields: flagged mock                                |
| Price: histogram + dual-range slider                                          | 9       | provisional | MapFilterSheet + PriceHistogram/RangeSlider         | demo-complete               | mock field       | high     | drag range           | fields: flagged mock                                |
| Filters: Opplevelsestype/Passer for/Varighet/Tid på dagen/Språk/Tilgj.funksj. | 9       | provisional | MapFilterSheet (Airbnb "Filtre" redesign)           | demo-complete               | mock taxonomies  | high     | each section         | fields: flagged mock                                |
| Search header: Where/When/Who (collapsible)                                   | 9, 25   | provisional | MapFilterSheet + WhereField/Calendar/Stepper        | demo-complete               | demo-only axes   | high     | expand/select        | Where recenters; dates+guests demo-only (no filter) |
| Rating: star thresholds + sort                                                | 9       | provisional | MapFilterSheet + RatingStars + sortPlaces           | demo-complete               | mock field       | medium   | threshold/sort       | fields: flagged mock                                |
| Place detail                                                                  | 11      | provisional | content/PlaceContent                                | demo-complete               | —                | high     | open                 | no                                                  |
| Business detail                                                               | 11      | provisional | content/BusinessContent                             | demo-complete               | —                | high     | open                 | no                                                  |
| Experience detail + lifecycle                                                 | 11      | provisional | content/ExperienceContent                           | demo-complete               | —                | high     | open/states          | no                                                  |
| Group detail                                                                  | 11      | provisional | content/GroupContent                                | demo-complete               | —                | medium   | open                 | no                                                  |
| Host / attendees / reviews / write-review                                     | 11      | provisional | content/\* + WriteReviewScreen (/review page)       | demo-complete               | —                | medium   | open                 | no                                                  |
| GPS check-in + verification                                                   | 11      | provisional | content/CheckinContent, VerificationContent         | demo-complete               | expo-location    | medium   | open                 | no                                                  |
| Personalization / recommendation presentation                                 | 12      | blocked     | —                                                   | contract-blocked            | V2.2 ranking     | later    | —                    | yes                                                 |
| Location permission states + manual area                                      | 13      | provisional | MapLocationSheet + useMapLocation                   | demo-complete               | expo-location    | high     | denied fallback      | no                                                  |
| Social-location privacy                                                       | 13      | blocked     | —                                                   | contract-blocked            | privacy contract | later    | —                    | yes                                                 |
| Guest mode + context preservation                                             | 14      | provisional | GuestLock + SignInPrompt + useGuestMode             | demo-complete               | auth state       | high     | guest restriction    | no                                                  |
| Motion system (central tokens)                                                | 15      | provisional | src/theme/motion.ts                                 | complete                    | —                | medium   | reduced-motion       | no                                                  |
| Haptics                                                                       | 16      | provisional | src/lib/haptics.ts                                  | demo-complete (NV)          | expo-haptics     | low      | —                    | no                                                  |
| Accessibility pass                                                            | 22      | provisional | partial labels/roles                                | partial                     | —                | high     | a11y                 | no                                                  |
| Map test coverage                                                             | 24      | provisional | tests/map\*.test.ts                                 | complete                    | —                | high     | —                    | no                                                  |

## Completion summary (after M1–M8)

- **Demo-complete:** map canvas + fallback, detail sheet + 9 content views,
  6 discovery modes, floating preview card, map/list toggle + results list,
  marker model + clustering, full search overlay (grouped results + recent),
  base + vibes/time/price-band filters, notifications, selected-marker highlight,
  central motion tokens, haptics, location permission UX + manual-area fallback,
  guest sign-in journey, error/offline recovery, 53 unit/interaction tests.
- **Contract-blocked:** personalization/ranking, social-location privacy, real
  counts/social proof, real mutations (join/save/follow/review/attendance),
  real search backend, saved persistence, real auth.
- **Native-verification-outstanding:** real GPS, native tile load + clustering,
  category pins/selected ring on tiles, camera/gesture feel, haptics, 60fps.

## Notifications — gaps vs the V2.2 contract

Varsler is the `/notifications` page (`NotificationsScreen`, a page since
0240): fixture cards with a category glyph, name, one-line detail, time and an
unread dot. A tap marks the card read and opens what it names: the person,
experience, group or a place's reviews (fixture targets, 0255); "Merk alle
lest" sits in the header;
read state is the shared in-memory store (`useNotificationReads`, 0208), so
the map, chat and Sveip bells drop as cards are read. It resets on reload.

There are no per-item delete, mute or "Ikke interessert" actions: the V2.2
Notifications contract prohibits deletion via API and leaves per-item mute
unspecified.

Still unimplemented / contract-blocked: a real `/notifications*` API,
preferences + quiet hours (field-gated `DTO_LOCK`), push + delivery lifecycle,
cross-device sync, category taxonomy and resolving targets from a real feed
(the fixture cards carry their own).

See [MAP_BLOCKERS.md](MAP_BLOCKERS.md) for the blocker + native-verify registers
and [MAP_DELIVERABLES.md](MAP_DELIVERABLES.md) for journeys + completion classes.

## Phase 9–10 changes (2026-11-06)

- Android back steps back / closes the detail sheet before leaving the map (0193).
- Experience detail pins its join bar through gorhom `footerComponent` (PDF p6); join state is a shared demo store (`useExperienceJoin`) (0204).
- `/map?focus=<kind>:<id>&at=<stamp>` opens a detail from Steder "Vis på kartet", Lagret and Mine planer (0199, 0208).
- Browse heart asks guests to sign in, like every other save (0208).
- Map tools sit 12 dp above the measured browse peek (0204).
- Map search shows "Nylig sett" (founder-approved; `useRecentlyViewed`, in-memory) (0209).
- Filtre mounts every section with the sheet; the 400 ms deferral made the lower half settle 1.2–1.4 s on the production bundle (0212).
- The map no longer fakes a 500 ms load on open; loading/error stay reachable via the offline toggle and "Prøv igjen" (0206).

## Phase 11 changes (2026-11-06)

- Marker glyphs: `services/markerIcon.ts` (per place, category fallback, experience tags, business → place, group → people); native `point-icon` SymbolLayer from `Images` views, emissive (0218).
- User location: `userPuck.ts`; the native UserLocation only reports position, our emissive halo/dot/heading layers draw the puck the same on every preset; SoftMap matches; "Posisjon" flies to the user at zoom 15 (0223).
- Experience detail: snaps 35/60/100 % in an app-root `RootPortal` above the tab bar; page chrome from `animatedIndex`; `mapBackAction` gains "collapse" (0221).
- Detail galleries for places, businesses and groups (0217); loading rule on the browse list (0222); Sveip pre-render after the map loads (0224).

## Phase 12 changes (2026-11-07)

- Everything on the map: For deg, Utforsk, Trending and Lagret list places and experiences; Live keeps experiences; experiences sit at their own meeting point; the first load fits the camera to every pin; clusters only where pins overlap (radius 24 native, matching SoftMap bbox) (0231).
- Pins coloured by category (`services/markerCategory.ts`, `mapPalette` in tokens, never the brand pink); places ringed white, experiences ink; the pink ring marks the selection; titles light on a dark halo at dusk/night (`pinStyle.ts`) (0232).
- One filter pipeline: `applyExperienceFilters` runs every Filtre facet over experiences (venue facts from the venue), used by the map adapter, the count and Sveip; Sveip opens the same `MapFilterSheet` with a `count(draft)` (0243).
- Pages, not modals: the map's search is the `/search` page (a submit returns `?q=…&at=…`, a pick `?focus=…`); Varsler is `/notifications`; "Skriv anmeldelse" is `/review/[kind]/[id]`; from the experience sheet, place, group, other experiences and all reviews open as pages over the map (0235, 0240). Map pins keep their detail sheet.
- The experience sheet's page gains the video's sections (rating line, reviews, steps, times, meeting point with "Vis på kartet", chat, things to know) (0233, 0234).

## Phase 13 changes (2026-11-07)

- TalkBack: the browse and detail sheets no longer speak the bottom-sheet library's English; the handle is "Endre størrelse" (swipe up or down to show more or less, `src/components/map/sheetA11y.tsx`) and the backdrop is "Lukk" (0257).
- Photo pagers in browse cards and galleries no longer expose an empty scroller to TalkBack (0257).
- One rating per place: the place sheet, browse cards, the rating filter and the best / most sorts count the place's reviews (`placeRating`); the stored rating and count are gone (0258).
- Varsler cards open what they name (0255); the release build was timed on the emulator (0257).

## Phase 14 changes (2026-11-07)

- Kartlag is a grid of style previews (founder reference): Auto first, Norwegian names, pink ring on the style in use, ⓘ explains Auto's schedule (0260).

## Phase 15 changes (2026-11-07)

- Kartlag has a Karttype section: Standard, Satellitt (Mapbox Standard Satellite with the same light preset; pins get the dark-map paint at every hour) and Terreng (hill shading from Terrain-DEM v1 and contour lines with metre labels from Terrain v2 in the style's bottom slot). The sheet stays open on a pick; ⓘ also says that Auto shows night in dark mode (0264).
- The Mapbox logo and ⓘ sit above the browse peek (they were under it); the Satellitt preview loads live from the Static Images API instead of being stored; cluster counts are self-lit like their bubbles (0264).

## Phase 16 changes (2026-11-07)

- "Søk i dette området" (0276, reworked 0282, **removed 0283** by the founder, 2026-11-07): a pill after a pan or pinch limited the pins, the browse list and count, and Filtre's count to the visible part of the map (rnmapbox `CameraGestureObserver`, corners from `getCoordinateFromView`). All of it is gone (`useMapArea`, the area helpers in `bounds.ts`, `area` in `useMapDiscovery` / `countResults`); the list follows the mode and filters only.
- Each style opens north up and flat (0276): heading and pitch reset to 0 on every style load, because the Studio styles were saved with bearing 13.6° and pitch 14° and the camera took that over. The rotate and tilt lock that came with the area search was lifted in 0283 (founder): the gestures are on again; there is no compass.
- "Veibeskrivelse" on places and meeting points hands the coordinate to the phone's maps app (0276, `src/lib/directions.ts`).
- After Posisjon the map no longer pulls back to the user (0282, an older bug found while testing the area pill): the recenter effect ran on every new centre array, which the GPS watch gives on each fix, and the camera's controlled `centerCoordinate` / `zoomLevel` props re-applied whenever the screen re-rendered (the area pill appearing was enough). The camera now takes its first view from `defaultSettings`, and Posisjon or an area flies once per `recenterSignal`.

## Phase 18 changes (2026-11-07)

- Quick chips under the mode chips (`MapQuickChips`): applied filters with an ✕, then the eight pin categories (`MARKER_CATEGORIES`, pin colours), chosen first. `categories` is a new `MapFilters` axis (OR) applied in `applyFilters` / `applyExperienceFilters`, so the list, `countResults`, Filtre's badge and Sveip agree; `appliedFilterChips()` names each applied value in the sheet's words. Empty results offer "Fjern «…»" per filter. Founder 2026-11-08 (0295): the category chips left the map row and the search page (with the `/map?cat=` link); categories are chosen in Filtre only, the row shows applied filters only and is hidden when none apply, and the first fitted view is back to 190 dp at the top. Kategori in Filtre uses the sheet's `ChipGroup` (outline chips, `MARKER_FILTER_ICON`) since 0297; the coloured-dot `CategoryChip` is gone.
- Long-press on a browse card: Lagre / Fjern fra Lagret, Del, Veibeskrivelse (`ItemActionsSheet`).
- Når (0288): an "I kveld" tile (I dag + the Kveld band) and "Nøyaktig dato" / "± 1 dag" for one picked day (`dateFlex`). A picked day or period now narrows experiences to those with a session in the window (`dateWindow`, `hasSessionIn` over `sessionsFor`), counts in the badge and shows as a chip ("11. nov ± 1 dag"); a quick tile decides instead of its dates; places ignore dates (opening hours, not times).
- "Nytt i ThirdPlace" (0290) opens on the map once after an app update (`WhatsNewOnFocus`), sharing the one-hint-per-session slot.

## Phase 19 changes (2026-11-08)

- Interest catalogue (0299): 84 interests (`src/fixtures/catalog/interests.ts`), each in one of the eight pin colours with its own pin glyph; every place has a kind (Bedrift, Organisasjon, Byrom) and an interest, experiences a host id; lookups go through lazy indexes.
- Areas and distances (0300): `AREAS` covers Oslo and every Akershus municipality; distances are measured from the person (`src/lib/origin.ts`: the phone while the map follows it, else the area picked in Hvor, else Grünerløkka; jitter under 250 m ignored); the browse header names the origin’s municipality.
- Pins by interest (0301): fill = the interest’s category, glyph = the interest’s Material Community Icons glyph (`PinGlyph`, yarn drawn by hand), all pin images registered once; titles from zoom 13 (nearest first on collisions), glyphs from zoom 11, cluster steps 10/50/100, the selected pin redrawn on top. p10 (Seiling) moved from Natur to Trening. Native verification: emulator, Standard / Natt / Satellitt.
- Catalogue builder and Klatring (0302): `src/fixtures/catalog/build.ts` turns hand-written seeds into places, businesses, clubs, experiences, events, groups, chats and reviews; Klatring is the first full set (Lillestrøm, Asker, Kolsås). `scripts/check-land.js` keeps every catalogue point on land.
- Item types (0303): cards, the preview line, search rows ("Bedrift · Lillestrøm · ★ 4,7", "Festival · Kolsås · Lør 10:00", "Gruppe · 46 medlemmer"), Saved and Sveip name the kind; Filtre has "Type" (Bedrift, Organisasjon, Byrom, Opplevelse, Arrangement) after Kategori, for places and experiences alike, with a removable chip per kind; search matches interests. "Vis 1 resultat" in the singular.
