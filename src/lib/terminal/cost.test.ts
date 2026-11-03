import { describe, expect, it } from "vitest";
import { costLine } from "./cost";
import { fnv, rngOf } from "./rng";

describe("seeded output", () => {
  it("gives the same cost line for the same seed", () => {
    const line = () => costLine(1.5, rngOf(fnv("/help#1")));
    expect(line()).toBe(line());
    expect(line()).toMatch(/^done in .+ · .+ · .+$/);
  });

  it("varies with the seed", () => {
    const lines = new Set(
      [1, 2, 3, 4, 5, 6].map((n) => costLine(1.5, rngOf(fnv(`/help#${n}`)))),
    );
    expect(lines.size).toBeGreaterThan(1);
  });

  it("produces repeatable random numbers", () => {
    const a = rngOf(7);
    const b = rngOf(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
