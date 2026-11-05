import { makeMutable } from "react-native-reanimated";

// Live fractional snap index of the map browse sheet, written by gorhom's
// `animatedIndex`. 0 = peek, 1 = mid, 2 = fully extended. The Tabs tab bar
// reads this (shared value, module-level so both the sheet and the tab bar
// see it) to slide + fade itself out of the way as the sheet approaches full
// extent — a continuous, drag-tracking transition instead of a hard toggle.
export const browseAnimatedIndex = makeMutable(0);
