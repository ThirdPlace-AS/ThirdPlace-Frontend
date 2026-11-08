// Every interest seed, in catalogue order (Phase 19). One file per pin colour
// (split in two above ~1,000 lines); the content batches add theirs here.
import { KAFE } from "./kafe";
import { TRENING } from "./trening";
import type { InterestSeed } from "./types";
import { VELVAERE_A } from "./velvaere-a";
import { VELVAERE_B } from "./velvaere-b";

export const SEEDS: readonly InterestSeed[] = [
  ...KAFE,
  ...TRENING,
  ...VELVAERE_A,
  ...VELVAERE_B,
];
