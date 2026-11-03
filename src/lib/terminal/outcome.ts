/**
 * The result of a command that prints something, decided in ONE place.
 * Live runs and replays both call computeOutcome with the same seed, so the rng is
 * always consumed in the same order; the live run only adds timing and animation.
 */
import { costLine } from "./cost";
import { renderOutput } from "./render";
import { statsDelta, type StatsDelta } from "./status";
import type { Cmd, TerminalData } from "./types";
import { thinkParams } from "./verbs";

export interface Outcome {
  /** spinner wording and how long it spins */
  verb: string;
  dur: number;
  html: string;
  cost: string;
  delta: StatsDelta;
}

export function computeOutcome(
  cmd: Cmd,
  data: TerminalData,
  rng: () => number,
  reduce: boolean,
): Outcome {
  const { verb, dur } = thinkParams(cmd, rng, reduce);
  const cost = costLine(Math.max(dur / 1000, 0.2), rng);
  return {
    verb,
    dur,
    html: renderOutput(cmd, data),
    cost,
    delta: statsDelta(rng),
  };
}
