#!/usr/bin/env bash
# Small emulator screenshot for agent checks (token pass 2026-11-15).
# Usage: bash scripts/shot.sh out.png [width]   (default width 540)
# Takes `adb exec-out screencap -p`, drops any bytes before the PNG
# signature (adb on Windows can prefix noise), then downscales with ffmpeg
# so a screenshot costs a fraction of the full-resolution frame.
set -euo pipefail
OUT="${1:?usage: shot.sh out.png [width]}"
WIDTH="${2:-540}"
export PATH="$PATH:/c/Users/Ahmed/AppData/Local/Android/Sdk/platform-tools"
RAW="$(mktemp -t shotraw.XXXXXX)"
trap 'rm -f "$RAW"' EXIT
adb exec-out screencap -p > "$RAW"
node -e '
  const fs = require("fs");
  const b = fs.readFileSync(process.argv[1]);
  const i = b.indexOf(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  if (i < 0) { console.error("shot.sh: no PNG in screencap output"); process.exit(1); }
  fs.writeFileSync(process.argv[1], b.subarray(i));
' "$RAW"
ffmpeg -loglevel error -y -i "$RAW" -vf "scale=${WIDTH}:-2" "$OUT"
echo "$OUT"
