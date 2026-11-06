import { makeMutable } from "react-native-reanimated";

// Live fractional snap index of the map browse sheet, written by gorhom's
// `animatedIndex`. 0 = peek, 1 = mid, 2 = fully extended. The floating "Kart"
// pill reads it to fade in as the sheet nears full extent (the tab bar no
// longer collapses with the sheet; see app/(tabs)/_layout.tsx).
export const browseAnimatedIndex = makeMutable(0);
