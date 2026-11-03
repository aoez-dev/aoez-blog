import { verbsFor } from "./commands";
import type { Cmd } from "./types";

/** Which verb to show and for how long. Consumes the rng in a fixed order, so a replay matches. */
export function thinkParams(cmd: Cmd, rng: () => number, reduce: boolean) {
  const pool = verbsFor(cmd.kind);
  const verb = pool[Math.floor(rng() * pool.length)];
  const jitter = rng(); // always drawn, so reduced motion does not shift later draws
  return { verb, dur: reduce ? 0 : 1200 + jitter * 900 };
}
