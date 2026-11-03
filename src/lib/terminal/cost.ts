export const TIPS = [
  "tip: press Tab. Press it again. Keep going.",
  "tip: /theme previews live. Judge me.",
  "tip: ctrl+c does nothing here. Nice try.",
  "tip: the model is a lookup table with ambitions.",
  "tip: every post is hand-written. Tokens only go to typos.",
  "tip: I will never ask 'Should I continue?'",
  "tip: !ls beats a hamburger menu.",
  "tip: no agents were harmed in the making of this site.",
  "permissions: yolo (it is a static site)",
];

type Rng = () => number;

const pick = <T>(items: T[], r: Rng): T =>
  items[Math.floor(r() * items.length)];

export const kfmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));

const trim = (x: number) => {
  const s = x.toFixed(10).replace(/0+$/, "");
  return s.endsWith(".") ? `${s}0` : s;
};

/** [unit, seconds per unit] */
const TIME_UNITS: [string, number][] = [
  ["fortnights", 1209600],
  ["moons", 2551443],
  ["microcenturies", 3155.76],
  ["sprints", 1209600],
  ["shakes", 1e-8],
];

/** currency symbol -> amount in that currency */
const AMOUNTS: Record<string, (r: Rng) => string> = {
  "¥": (r) => (0.0003 + r() * 0.0087).toFixed(4),
  "₿": (r) => trim(0.00000002 + r() * 0.0000003),
  Ξ: (r) => trim(0.0000008 + r() * 0.000004),
  "₺": (r) => (0.0003 + r() * 0.0087).toFixed(4),
  "₹": (r) => (0.0003 + r() * 0.0087).toFixed(4),
  kr: (r) => (0.0003 + r() * 0.0087).toFixed(4),
};

const tokenText = (r: Rng) =>
  pick(
    [
      () => `${Math.round(60 + r() * 840)} tokens`,
      () => `↑${kfmt(300 + r() * 1500)} ↓${Math.round(12 + r() * 290)}`,
      () => "1,024 tokens (suspicious)",
      () => `${Math.round(5 + r() * 55)} tokens (nice)`,
    ],
    r,
  )();

function sillyTime(sec: number, r: Rng): string {
  const [unit, size] = pick(TIME_UNITS, r);
  const value =
    size < 1 ? Math.round(sec / size).toLocaleString("en") : trim(sec / size);
  return `${value} ${unit}`;
}

function sillyAmount(r: Rng): string {
  const symbol = pick(Object.keys(AMOUNTS), r);
  return `${symbol}${AMOUNTS[symbol](r)}`;
}

/** "done in ... · tokens · currency". Seeded, so it is the same on every visit. */
export function costLine(sec: number, r: Rng): string {
  const tokens = tokenText(r);
  if (r() < 0.25) {
    return `done in ${sec.toFixed(1)}s · ${tokens} · $${(0.001 + r() * 0.008).toFixed(3)}`;
  }
  return `done in ${sillyTime(sec, r)} · ${tokens} · ${sillyAmount(r)}`;
}
