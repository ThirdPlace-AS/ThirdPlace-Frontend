// Every interest seed, in catalogue order (Phase 19). One file per pin colour
// (split in two above ~1,000 lines); the content batches add theirs here.
import { KAFE } from "./kafe";
import { KULTUR_A } from "./kultur-a";
import { KULTUR_B } from "./kultur-b";
import { KULTUR_C } from "./kultur-c";
import { KULTUR_D } from "./kultur-d";
import { MAT_A } from "./mat-a";
import { MAT_B } from "./mat-b";
import { NATUR_A } from "./natur-a";
import { NATUR_B } from "./natur-b";
import { SOSIALT_A } from "./sosialt-a";
import { SOSIALT_B } from "./sosialt-b";
import { SOSIALT_C } from "./sosialt-c";
import { TRENING_A } from "./trening-a";
import { TRENING_B } from "./trening-b";
import { TRENING_C } from "./trening-c";
import { TRENING_D } from "./trening-d";
import { TRENING_E } from "./trening-e";
import { TRENING_F } from "./trening-f";
import { TRENING_G } from "./trening-g";
import type { InterestSeed } from "./types";
import { VELVAERE_A } from "./velvaere-a";
import { VELVAERE_B } from "./velvaere-b";

export const SEEDS: readonly InterestSeed[] = [
  ...KAFE,
  ...MAT_A,
  ...MAT_B,
  ...SOSIALT_A,
  ...SOSIALT_B,
  ...SOSIALT_C,
  ...NATUR_A,
  ...NATUR_B,
  ...TRENING_A,
  ...TRENING_B,
  ...TRENING_C,
  ...TRENING_D,
  ...TRENING_E,
  ...TRENING_F,
  ...TRENING_G,
  ...KULTUR_A,
  ...KULTUR_B,
  ...KULTUR_C,
  ...KULTUR_D,
  ...VELVAERE_A,
  ...VELVAERE_B,
];
