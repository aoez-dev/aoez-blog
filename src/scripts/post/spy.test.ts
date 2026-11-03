import { describe, expect, it } from "vitest";
import { activationPoints, activeIndex } from "./spy";

describe("outline scroll spy", () => {
  it("activates a heading when it reaches the threshold", () => {
    const points = activationPoints([0, 1000, 2000], 5000, 100);
    expect(points).toEqual([-100, 900, 1900]);
    expect(activeIndex(points, 0)).toBe(0);
    expect(activeIndex(points, 950)).toBe(1);
    expect(activeIndex(points, 1950)).toBe(2);
  });

  it("gives every item a turn when the last headings cannot reach the threshold", () => {
    // headings 3, 4 and 5 sit too close to the end of the page
    const positions = [0, 1000, 2000, 2900, 3100, 3300];
    const maxScroll = 2500;
    const points = activationPoints(positions, maxScroll, 100);
    expect(points.at(-1)).toBe(maxScroll);
    expect(points.slice().sort((a, b) => a - b)).toEqual(points);
    points
      .slice(1)
      .forEach((point, k) =>
        expect(point - points[k]).toBeGreaterThanOrEqual(40),
      );
    const seen = new Set<number>();
    for (let y = 0; y <= maxScroll; y += 10) seen.add(activeIndex(points, y));
    expect([...seen].sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("makes the last item active at the very bottom", () => {
    const points = activationPoints([0, 500, 900], 600, 100);
    expect(activeIndex(points, 600)).toBe(2);
  });

  it("copes with a page that does not scroll", () => {
    const points = activationPoints([0, 200, 400], 0, 100);
    expect(activeIndex(points, 0)).toBe(2);
  });
});
