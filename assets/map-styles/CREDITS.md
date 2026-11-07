# Map style previews

`dawn.webp`, `day.webp`, `dusk.webp` and `night.webp` are crops of ThirdPlace's own Mapbox Studio styles (`src/components/map/mapStyles.ts`) as the app renders them on the Android emulator (Bislett / Uranienborg, Oslo, 7 November 2026). `auto.webp` puts the day crop next to the night crop. They are shown in the Kartlag sheet only.

`type-standard.webp` and `type-terrain.webp` (Karttype) are crops of the Dag style without and with Terreng's hill shading and contour lines, at Holmenkollen, Oslo (zoom 15, 7 November 2026). The Satellitt tile is not stored: it loads live from the Mapbox Static Images API (`satellite-v9`) over the same area, since Mapbox's terms did not clearly allow storing imagery in the app.

Map data © Mapbox © OpenStreetMap contributors; satellite imagery © Maxar (as the map's own ⓘ lists them). The Kartlag sheet shows the same credit under its previews.

To refresh them after a style changes: open the map in Lagret mode (no pins), zoom to street level, pick each style in Kartlag, screenshot, and crop the same region of each.
