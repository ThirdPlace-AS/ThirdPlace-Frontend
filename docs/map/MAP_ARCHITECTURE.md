# Map architecture (detail)

The rules that matter on every change are in [CLAUDE.md](../../CLAUDE.md) ("Map
feature architecture"). This file holds the detail behind them: how each part
works, and which user or founder decision set it. Ledger ids refer to
`docs/implementation-ledger/TP-PHASE0-FE.jsonl`; status per surface is in
[MAP_GAP_MATRIX.md](MAP_GAP_MATRIX.md).

The Map is a thin screen ([app/(tabs)/map.tsx](<../../app/(tabs)/map.tsx>))
composing hooks and components under `src/components/map/`.

## Presentation model and services

- `types/mapPresentation.ts`: `DiscoveryItem` (what markers, clusters, the
  preview and the list render) and the six `DiscoveryMode`s in PDF order (For
  deg default · Trending · Live · Utforsk · Lagret · Venner). `DEMO_MODES` (For
  deg, Venner) must stay non-personalised demo shells.
- Pure services: `services/mapFixtureAdapter.ts` (mode → items),
  `services/mapSearch.ts` (grouped search), `services/softClustering.ts`.

## Selection and the detail sheet

- Hooks: `hooks/useMap{Filters,Discovery,Selection,Presentation,Camera,Location,Saved}.ts`.
- Selection opens the detail sheet (`MapDetailSheet`, snaps peek · mid · full).
  A marker tap opens it at the peek, which is the preview. It keeps a
  `sheetStack` (push/back via `DetailContentRouter` → `content/*`).
- Experiences and places (every kind) open as the page sheet: `ExperiencePage`
  / `PlacePage` in the app-root portal, full screen at the top snap with the
  page top bar (caption, Del, Lagre; `pageTarget.ts`; places since 2026-11-09,
  user). Groups and pushed sub-views (Deltakere, Administrer, …) keep the sheet
  header.
- **Stages** (R3a 0366; 0382, user 2026-11-11: "the details modal sheet is
  should slide in before the screen is done redericting"): the page opens in
  three stages, `sheetStage` in `sheetStage.ts`:
  - 0, the open: only the header and the gallery, what the peek shows;
  - 1, once the sheet has come to rest at a snap: the title block and first
    rows (`useSheetStageFirst`);
  - 2, `STAGE_REST_DELAY_MS` later: the rest (`useSheetStageReady`).
    Stages are keyed on the item, not the tap, so a second tap on the open pin
    keeps its page. A swap while the sheet rests at its snap (no snap event
    comes; user: "Stay up, swap content") counts as at rest after
    `STAGE_SWAP_MS`, FadeSwap's fade; otherwise a 1.2 s fallback. Lists only the
    lower part uses are worked out only once it shows, and the floating card
    mounts from stage 1. Pushed views and the `/place` / `/experience` routes
    render everything. Keep new sections inside the page's `first` or `ready`
    blocks.
- **Floating card** (`PageActionCard`, user 2026-11-09): only on the
  full-screen page. It fades in with the page top bar through `pageReveal`, is
  opaque and takes taps once `atPageTop` (both in `pageTarget.ts`), and tracks
  the snap itself because gorhom remounts a footer whose render callback
  changes. An experience shows its join card (`ExperienceJoinBar`); a place its
  chat (`PlaceChatBar`: the last message and "Bli med i samtalen" / "Åpne
  samtalen"; guests get the sign-in prompt). Since 2026-11-10 a place's body
  keeps its Samtalen section too, like an experience's.
- **Waiting sheet** (0384): the page sheet stays mounted while the map is
  focused, closed at index -1 in the portal, so a tap only animates it up
  (no mount and layout pass first). Closed, its body sits below the screen
  inside gorhom's `box-none` containers, so taps reach the map's buttons, the
  browse sheet and the tab bar; its backdrop starts with
  `enableTouchThrough` (it remounts on every refocus) and the wrapper hides
  it from the screen reader. While it slides closed it keeps its content;
  once it is down the content goes and the stages reset. A group at the root
  keeps the docked sheet, mounted when it opens (nothing opens one today:
  groups open `/group/[id]`). Tried and dropped: starting the slide from the
  press itself (`snapToIndex` before the render): the sheet arrived blank and
  its content came later than without it.

## Rendering and memo boundaries

- `MapCanvas` picks the native `MapboxMap` (clustered `ShapeSource`) or the
  `SoftMap` fallback.
- Memo boundaries (speed pass 0345): `MapCanvas`, `MapboxMap` (with its
  `PinImages`, `PinsSource` and `UserPuck` parts), `MapBrowseSheet`,
  `MapDetailSheet` and `DetailContent` are memoised. Keep every prop from
  `app/(tabs)/map.tsx` stable (`useCallback`, `useMemo`, the shared
  `NO_ITEMS`): rnmapbox re-serialises a ShapeSource's whole FeatureCollection
  and rebuilds every layer style on each render. `useSheetChrome()` and
  `useMapSaved()` return the same object until their inputs change, and the
  map screen keeps the detail sheet's page state in a ref (only the back key
  reads it).
- Location store (speed pass 0346): the live position and compass heading
  live in `src/lib/userLocation.ts`. Only the location dots (`UserPuck` in
  `MapboxMap`, the SoftMap's) subscribe. `useMapLocation` writes them (a
  heading counts after a 4° turn and 200 ms, `headingCounts`), returns the fix
  as of its last render, and its `pause` / `resume` stop the GPS and compass
  watches while the map tab is not focused (the tab stays mounted).

## Mapbox and the basemap

- `@rnmapbox/maps` is native-only; [metro.config.js](../../metro.config.js)
  aliases it to `mapbox-stub.js` on web or when
  `EXPO_PUBLIC_USE_NATIVE_MAP !== "1"`. Keep the stub's exports in sync with
  every component the map uses.
- Tokens: public `pk.*` = `EXPO_PUBLIC_MAPBOX_TOKEN`; secret `sk.*` =
  `MAPBOX_DOWNLOADS_TOKEN`, a native-build input only
  ([app.config.ts](../../app.config.ts)).
- `expo-location`, `expo-haptics` and AsyncStorage (`src/lib/deviceSettings.ts`)
  are required lazily and guarded (AsyncStorage throws on load in a dev client
  built without it).
- Basemap: two axes in `mapStyles.ts`: map type (Standard / Satellitt /
  Terreng, founder 2026-11-07) × time-of-day style (the four Studio styles,
  Mapbox Standard with dawn/day/dusk/night presets, or Auto).
  `basemapFor(type, styleKey)` gives the URL, preset, dark flag and terrain
  flag. Satellitt is Mapbox Standard Satellite (one URL for every preset);
  Terreng is the Studio style plus hill-shading and contour layers
  (`terrainStyle.ts`, bottom slot).
- `MapboxMap` hides POIs through `<StyleImport id="basemap" existing config>`
  mounted after the style loads (keyed by URL + preset). That config **must
  repeat `lightPreset`** or every style renders as day.
- The Mapbox logo and ⓘ sit above the browse peek (`ornamentBottom`).
- Every style load resets heading and pitch to 0 (the Studio styles carry the
  camera they were saved with), so each style opens north up and flat. Rotate
  and tilt gestures are on (founder 2026-11-07).

## Pins

- Paint lives in `pinStyle.ts`. Fill by pin group, what the pin is
  (`services/pinGroup.ts`; user 2026-11-11: "the colors need to change too",
  then "familiar map colours", like Apple and Google Maps): eat orange, night
  out purple, social and shops yellow, nature green, water blue, sport sky
  blue, culture and making plum, wellness teal (`tokens.js` `mapPalette`,
  never pink or red). A place takes its kind's group (`placeKindGroup`, the
  same row as its icon), an experience its activity's (`INTEREST_PIN_GROUP`,
  every interest listed). Glyphs are white or ink per group (≥ 3:1), and the
  palette passes the protanopia and deuteranopia checks
  (`tests/pinStyle.test.ts`). Filtre's Kategori still goes by the interest's
  category (`markerCategoryFor`), so a Kategori result can mix colours.
- Ring by kind (places white, experiences ink), the pink ring only for
  selection. Two layers under the pins (`points-shadow`, `points-edge`, sizes
  in `PIN_SIZE` / `PIN_EDGE_RADIUS`, emissive strength 1): a soft dark edge
  under every pin, so light fills stand off pale map areas, and a thin white
  edge outside an experience's ink ring, which alone vanished on night maps
  (user 2026-11-11). The selection ring (`PIN_SELECTED_RING`) stays outside
  both. SoftMap draws the same with a shadow and padding.
- No colour key on the map (user 2026-11-11); the detail sheet's type label
  carries the item's pin in its colour (`MiniPin` through `SheetHeader`'s
  `labelIcon`), and a long label shrinks a little (to 85 %) beside it.
- The glyph: a place shows what it is, one icon per kind of place
  (`services/placeGlyph.ts`, user 2026-11-11: "the same types of city space
  and businesses should share the same marker icons"; close kinds share one,
  e.g. every café the cup, every restaurant the fork and knife, every park
  the tree; organisations by their type too). Every place category is in its
  table (`tests/placeGlyph.test.ts`). An experience shows its interest's own
  glyph (Phase 19, founder 2026-11-08). Material Community Icons through
  `PinGlyph`, the only door to that family, with the font preloaded in
  `app/_layout.tsx`; Strikking's yarn is drawn. `MapboxMap` registers every
  pin image once from `allPinGlyphs()` (never per filter) and re-copies them
  after mount: the interests' glyphs and each place's kind glyph, each in its
  pin group's tone (100 images).
- Dense maps: titles from zoom 13 with `symbolSortKey` = list rank, glyphs
  from zoom 11 (plain dots below), cluster bubbles step at 10/50/100, and the
  selected pin and its title are redrawn on top. Titles sit below the glyph
  layer (Mapbox places upper symbol layers first) and turn light on a dark halo
  at dusk/night. `thirdplace://_sandbox/pins` shows all 84.
- Selection ring with the tap (0380, user 2026-11-11: "the red focus on the
  marker must be instant on click"): the press sets the four selected layers'
  `filter` natively (`setNativeProps`, `services/pinSelection.ts`) before the
  selection renders. React's `selectedMarkerId` stays the source of truth:
  Fabric keeps a native-set prop only until React's own value for it changes.
  `onSelectMarker` returns whether the screen took the selection, so a
  declined press puts the old filter back.

## Camera

- After the first view the camera is the user's: `<Camera defaultSettings>`,
  not controlled `centerCoordinate` / `zoomLevel` props (a new centre array on
  any render re-applied them). Posisjon or an area flies once per request,
  never on a GPS fix (`useMapCamera().flyTo(coord, zoom, { padding, followUp })`:
  the coordinate travels with the request, R1b).
- First view (Phase 19 S4b): the session's first view opens nearby
  (`firstViewCamera` in `services/bounds.ts`: centred on the origin, the
  nearest 30 pins in view, zoom 11.5–14). In Grünerløkka on the emulator it is
  about 12.6.
- Cluster tap: zooms to where the cluster splits
  (`ShapeSource.getClusterExpansionZoom`, at most 16).
- List pick or `/map?focus=` link: zooms to 15.5 when the map is below 15, so
  the pin leaves its cluster (`focusZoomIn`, `selectionZoom`; clusters end at
  15).
- Pin tap (user 2026-11-10 and 2026-11-11: "only zoom to a cearten zoom level
  after that just move the screen to the next marker"): the camera moves from
  the press itself, before the selection renders.
  - Zoom: `pinTapZoom` / `FOCUS_ZOOM` = 13.6 once, then only a pan; at 13.6 or
    closer the zoom stays, never out. The user picked the device screenshot
    "about 1 km across"; it was labelled 14.5 but measured 13.6 (0381). At
    14.5 the first tap blanked the map on the emulator; the cause is unproven.
  - The zoom is kept in a ref from `onMapIdle` and set to the destination on
    each tap, so a quick second tap reads it.
  - Ease: 450 ms for a pan (`motion.duration.focus`), 650 ms for the first tap
    that also zooms in (`focusFar`, so the sheet arrives before the map
    rests), none with reduced motion.
  - The pin is centred between the top controls and the page sheet's peek
    (`focusPadding` in `services/pinCamera.ts`, from the map screen's measured
    height and top controls; the peek's 35 % / 300 dp live there too). Nothing
    moves for the pin already open, and the selection's focus effect skips the
    pin the tap flew to.
- Posisjon (user 2026-11-10: "the location button must take the user to
  their current location"): `useMapLocation().locate(onPosition)` hands the map
  the best position known at once (the app's fix, else the map engine's
  `nativeCoord`, which the dot shows, else the phone's cached position ≤ 2 min /
  500 m), then a fresh fix (Balanced, then High; 10 s in all,
  `LOCATE_TIMEOUT_MS`). `locateFly` eases on to the fresh fix only past 30 m
  (`LOCATE_REFINE_M`), as a follow-up the map drops once the user has touched
  it since (`followUpAllowed`, a wrapper's `onTouchStart`). Every position it
  flies to becomes the origin and ends manual-area mode. With no position the
  camera stays and the Posisjon sheet says why (never a fly to the area or
  Grünerløkka); without permission the sheet asks. The button shows a spinner
  while locating (`IconButton busy`).

## SoftMap

Frames the markers on screen (`softBoxFor`: 8 % padding, the view's shape),
clusters them on a 44 dp grid at cell centres and names the towns in view
(`softTowns`). Its selected pin still shows with the render, not natively.

## Distances and lists

- Distances (Phase 19, founder 2026-11-08) are measured from the origin store
  [src/lib/origin.ts](../../src/lib/origin.ts): the phone while the map follows
  it, else the area picked in Hvor or the location sheet (`selectArea` stops
  the GPS watch until Posisjon), else Grünerløkka. GPS only moves it on the
  first fix, Posisjon (`reportFix(…, { force: true })`) or a move over
  `ORIGIN_MOVE_M` (250 m), so lists don't jump on jitter.
- Show distances through `distanceLabelFor(coord, origin)` (`useOrigin()` in
  components), never the fixtures' legacy `distance` text.
- Every list is nearest first, places and experiences mixed, ordered once
  after mixing by `orderItems` (mapFixtureAdapter: a chosen Sorter wins,
  Trending puts the most-reviewed first).
- Avstand (1 · 5 · 10 · 25 · 50 km · Alle) measures from the origin to the
  place or the meeting point (never the fixtures' `distanceM`), and
  `useMapFilters` re-filters when the origin moves.
- Sveip builds each deck nearest first when the tab or filters change
  (`deckFor`), never on an origin move.
- Areas across Oslo and Akershus are `AREAS` (`areaFor`, `areaLabel`
  "Sandvika, Bærum", `src/fixtures/catalog/areas.ts`). The area pickers group
  them by region (`areasByRegion`, `AreaChips`; Hvor shows region sections
  until you type, and a search matches the municipality too). The browse header
  names the origin's municipality.
- "Søk i dette området" was built in Phase 16 and removed again (founder
  2026-11-07, ledger 0283): the list and its count follow the mode and filters
  only.

## Filtre

- Applied filters show on the map only as the number on the Filtre button
  (`MapFilterButton`, founder 2026-11-08: no filter chips on the map, none in
  the no-results card either); its screen-reader value names them
  (`appliedFilterChips()`).
- The eight pin categories are picked only in Filtre's "Kategori" section
  (founder 2026-11-08: no category chips on the map or the search page), drawn
  like the sheet's other groups (`ChipGroup` outline chips, an icon per
  category from `MARKER_FILTER_ICON`, ink ring when chosen). `categories` is a
  `MapFilters` axis shared with Filtre and Sveip.
- Kategori is eight rows (founder 2026-11-08: nested so one can filter to one
  activity). Each row (`CategoryRow`, a `lazy` `Accordion`: its chips mount on
  first open, since all of them up front made Filtre slow to open) opens to
  "Alle" and its activities and says what is picked ("Alle", "Klatring",
  "2 valgt"). The `interests` axis is matched by `categoryMatch` (a category
  with picks keeps only those); `toggleActivity` / `toggleWholeCategory` keep
  the two axes in step (leaving the last activity leaves the category);
  `appliedFilterChips()` names each picked activity.
- Filtre's "Type" group (`kinds` axis, after Kategori) narrows places and
  experiences alike.
- Filtre renders each section from a `useMemo` keyed on the filters it shows
  (speed pass 0356: every change used to render the whole sheet again,
  200–360 ms of JS on the emulator). Keep a new section that way, with stable
  callbacks.
- The price slider (`RangeSlider`, like `SteppedSlider`) takes the touch on
  its whole track, since its top thumb rests in Android's back-gesture zone.
  During a drag its labels follow every 80 ms and Filtre hears the price every
  250 ms and on release (`PriceRange`).
- A picked day or period in Når keeps only experiences with a time in it
  (`dateWindow`, widened by `dateFlex` for "± 1 dag"); places have opening
  hours, not times, and ignore dates.

## Item types and labels

- Every map item is a Bedrift, Organisasjon or Byrom (place `kind`) or an
  Opplevelse or Arrangement (experience `format`; "Festival" when it runs
  several days); see `services/itemType.ts`.
- The preview line, search rows, Saved and Sveip say "Kind · area · …".
- On the map (browse cards, search rows, the detail sheet's top bar):
  - a city space says what kind of space it is instead of "Byrom" ("Park ·
    Grünerløkka", its `category` through `placeTypeLabel` / `placeCaption`,
    user 2026-11-09);
  - a business its kind of business instead of "Bedrift" ("Buldresenter ·
    Lillestrøm", user 2026-11-11); an Organisasjon keeps the word;
  - an experience its activity instead of "Opplevelse" / "Arrangement"
    ("Klatring · Kolsås", a festival "Klatring · Festival", the interest's
    label through `experienceKindLabel` / `experienceCaption`, user
    2026-11-09).
    Filtre's Type group still says Bedrift, Byrom, Opplevelse and Arrangement.
- The detail sheet's header says the same kind at its top left, beside Del,
  Lagre and ✕ ("Park", "Vietnamesisk restaurant", "Klatring";
  `PageInfo.typeLabel` through `SheetHeader`'s `label`, user 2026-11-11: "at
  the top left of the details sheet it should say the type"). It folds away
  with the header at the full page, where the top bar's caption ("Park ·
  Grünerløkka") says it.
- Browse cards name the type and no area (founder 2026-11-08): title and
  rating, then `browseCardLine` ("Buldresenter · 1,2 km" / "Organisasjon ·
  Åpent" / "Klatring · Festival · Lør 10:00"). A Bedrift's or Byrom's Åpent /
  Stengt is a solid green / red `Badge` on the photo's top left with its
  distance in the line (user 2026-11-09, `browseCardOpenBadge`). Experiences
  show their price and who is going; places no price. Tags, a bookmark to save
  (not a heart), and no long-press menu (user 2026-11-09).

## Search

- One matcher (`services/mapSearch.ts`) for the overlay, the map list and
  `countResults`. It finds an item by its own words (name or title, host, tags,
  a city space's facilities), its type words (the type, "Festival" for a
  multi-day event, the place's category, the business record's category, the
  organisation's form, the experience's category and Opplevelsestype labels)
  and its interest (label and synonyms, scored just below its own type); user
  2026-11-10: "search for a type of experiance, city space or business and get
  result".
- Accents fold except æ, ø, å (`foldText`); plural and definite endings fold
  (`wordForms`: "parken" → "park"); every query word must match, filler words
  dropped; an area or municipality word counts only next to another word that
  matches ("park bærum"); words of up to three letters match only at a word
  start; per-item words are built once (WeakMap).
- The overlay ranks by match (a type word that is the query or ends with it
  first: "Skatepark" is a park), then nearest first, and offers "Vis alle N på
  kartet" (the submit) when there are more than its rows. No suggestion chips
  above the results (user 2026-11-11, 0378).

## Workspace

The workspace lists only the demo owner's things (`OWNED_BUSINESS_IDS`,
non-catalogue experiences, `isCatalogueId`).

## Swipe

`src/components/swipe/`: `SwipeDeck` (gesture engine, tabs For deg /
Opplevelser / Steder; like → "Bli med i samtalen" sheet; a liked place is also
saved), pure `deckLogic.ts` / `deckItems.ts` / `useSwipeDeck.ts` (tested). Every
tab is the same deck over `DeckItem`s (experience or place → one card model).
Filtre is the map's `MapFilterSheet` (with a `count(draft)` for the deck) and
experiences go through the same `applyExperienceFilters` on both surfaces (user
2026-11-06). Group swipe is `src/features/groupswipe`.
