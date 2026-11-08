// Every interest seed, in catalogue order (Phase 19). One file per pin colour
// (split in two above ~1,000 lines); the content batches add theirs here.
import { KAFE } from "./kafe";
import { MAT_A } from "./mat-a";
import { MAT_B } from "./mat-b";
import { SOSIALT_A } from "./sosialt-a";
import { SOSIALT_B } from "./sosialt-b";
import { SOSIALT_C } from "./sosialt-c";
import { TRENING } from "./trening";
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
  ...TRENING,
  ...VELVAERE_A,
  ...VELVAERE_B,
];
