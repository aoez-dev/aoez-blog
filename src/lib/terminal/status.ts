/** The statusline: mode badge, fake token counters and a tip. Deterministic. */
import { esc } from "./text";
import { kfmt, TIPS } from "./cost";

export interface Stats {
  mode: string;
  up: number;
  down: number;
  cost: number;
  ctx: number;
  tip: string;
}

export const initialStats = (): Stats => ({
  mode: "READY",
  up: 1020,
  down: 16,
  cost: 0.003,
  ctx: 0.4,
  tip: TIPS[0],
});

export function statsHtml(s: Stats): string {
  const counters = `↑${kfmt(s.up)} ↓${kfmt(s.down)} $${s.cost.toFixed(3)} ${s.ctx.toFixed(1)}%/∞`;
  return `<span class="l"><b class="mode">${esc(s.mode)}</b><span>~/aoez-blog</span><span>(main*)</span><span class="st">${counters}</span></span><span class="tip">${esc(s.tip)}</span>`;
}

/** How much one command moves the counters. Drawn from the rng in a fixed order. */
export interface StatsDelta {
  up: number;
  down: number;
  cost: number;
  ctx: number;
  tip: string;
}

export function statsDelta(r: () => number): StatsDelta {
  return {
    up: Math.round(40 + r() * 380),
    down: Math.round(30 + r() * 860),
    cost: 0.0004 + r() * 0.0026,
    ctx: 0.1 + r() * 0.4,
    tip: TIPS[Math.floor(r() * TIPS.length)],
  };
}

export const applyDelta = (s: Stats, d: StatsDelta): Stats => ({
  ...s,
  up: s.up + d.up,
  down: s.down + d.down,
  cost: s.cost + d.cost,
  ctx: s.ctx + d.ctx,
  tip: d.tip,
});

export interface Status {
  setMode(mode: string): void;
  apply(delta: StatsDelta): void;
  reset(): void;
}

export function createStatus(el: HTMLElement): Status {
  let stats = initialStats();
  const render = () => {
    el.innerHTML = statsHtml(stats);
  };
  render();
  return {
    setMode(mode) {
      stats = { ...stats, mode };
      render();
    },
    apply(delta) {
      stats = applyDelta(stats, delta);
      render();
    },
    reset() {
      stats = initialStats();
      render();
    },
  };
}
