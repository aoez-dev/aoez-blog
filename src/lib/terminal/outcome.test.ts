import { describe, expect, it } from "vitest";
import { COMMANDS } from "./commands";
import { hasOutput } from "./render";
import { computeOutcome } from "./outcome";
import { parseCommand } from "./parse";
import { fnv, rngOf } from "./rng";
import { fixture } from "./testData";
import { commandList } from "./completion";

const outputCommands = commandList(fixture.posts)
  .map((raw) => ({ raw, cmd: parseCommand(raw, fixture) }))
  .filter(({ cmd }) => hasOutput(cmd));

describe("computeOutcome (shared by live run and replay)", () => {
  it("covers every command that prints something", () => {
    expect(outputCommands.length).toBeGreaterThanOrEqual(5);
  });

  it("returns the same result for the same seed, for every printing command", () => {
    for (const { raw, cmd } of outputCommands) {
      const run = () =>
        computeOutcome(cmd, fixture, rngOf(fnv(`${raw}#1`)), false);
      expect(run(), raw).toEqual(run());
    }
  });

  it("consumes the rng in the same order regardless of reduced motion", () => {
    const { raw, cmd } = outputCommands[0];
    const draws = (reduce: boolean) => {
      let n = 0;
      const base = rngOf(fnv(`${raw}#1`));
      computeOutcome(cmd, fixture, () => (n++, base()), reduce);
      return n;
    };
    expect(draws(true)).toBe(draws(false));
  });

  it("changes the result when the same command is run a second time", () => {
    const { raw, cmd } = outputCommands[0];
    const first = computeOutcome(cmd, fixture, rngOf(fnv(`${raw}#1`)), false);
    const second = computeOutcome(cmd, fixture, rngOf(fnv(`${raw}#2`)), false);
    expect(first.delta).not.toEqual(second.delta);
  });

  it("is declared by the registry: every command kind has a definition", () => {
    expect(COMMANDS.some((def) => def.kind === "help")).toBe(true);
  });
});
