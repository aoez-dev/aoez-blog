/**
 * Which outline item is active at a scroll position. Pure, so it can be tested.
 *
 * A heading normally becomes active when it scrolls up to `threshold`. Headings near the end of
 * a post may never get that far (the page ends first). Working backwards from the bottom, every
 * item gets at least `minGap` pixels of scrolling, so none is skipped and the last one wins at
 * the very bottom.
 */
export function activationPoints(
  positions: number[],
  maxScroll: number,
  threshold: number,
  minGap = 40,
): number[] {
  const points = positions.map((p) => p - threshold);
  const last = points.length - 1;
  if (last < 0) return points;
  points[last] = Math.min(points[last], maxScroll);
  for (let k = last - 1; k >= 0; k--) {
    points[k] = Math.min(points[k], points[k + 1] - minGap);
  }
  return points;
}

/** Index of the last item whose activation point has been passed (1px tolerance). */
export const activeIndex = (points: number[], scrollY: number): number =>
  points.reduce((cur, point, k) => (scrollY >= point - 1 ? k : cur), 0);
