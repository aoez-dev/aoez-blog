/** The ASCII "aoez.dev" banner. It starts in its final colours; a highlight sweeps across it on a loop. */
import { sleep } from "./text";

const GLYPHS: Record<string, string[]> = {
  a: [" █████╗ ", "██╔══██╗", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
  o: [
    " ██████╗ ",
    "██╔═══██╗",
    "██║   ██║",
    "██║   ██║",
    "╚██████╔╝",
    " ╚═════╝ ",
  ],
  e: ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "███████╗", "╚══════╝"],
  z: ["███████╗", "╚══███╔╝", "  ███╔╝ ", " ███╔╝  ", "███████╗", "╚══════╝"],
  dot: ["    ", "    ", "    ", "    ", " ██╗", " ╚═╝"],
  d: ["██████╗ ", "██╔══██╗", "██║  ██║", "██║  ██║", "██████╔╝", "╚═════╝ "],
  v: [
    "██╗   ██╗",
    "██║   ██║",
    "██║   ██║",
    "╚██╗ ██╔╝",
    " ╚████╔╝ ",
    "  ╚═══╝  ",
  ],
};
const WORD = ["a", "o", "e", "z", "dot", "d", "e", "v"];
const COLS = 62;
const BAND = 8;
const SWEEP_MS = 1300;

/** Gradient across the banner width, built from the theme's three gradient stops. */
const colour = (k: number) => {
  const t = k / (COLS - 1);
  const [from, to, local] =
    t < 0.5 ? ["--g1", "--g2", t * 2] : ["--g2", "--g3", (t - 0.5) * 2];
  return `color-mix(in srgb,var(${from}) ${Math.round((1 - local) * 100)}%,var(${to}))`;
};

const rowHtml = (row: number) =>
  Array.from(WORD.map((letter) => GLYPHS[letter][row]).join(""))
    .map(
      (ch, k) =>
        `<span class="c" data-k="${k}" style="--bc:${colour(k)}">${ch}</span>`,
    )
    .join("");

export function renderBanner(el: HTMLElement): HTMLElement[] {
  el.innerHTML = [0, 1, 2, 3, 4, 5].map(rowHtml).join("\n");
  return Array.from(el.querySelectorAll<HTMLElement>(".c"));
}

function frameAt(spans: HTMLElement[], head: number) {
  for (const span of spans) {
    const k = Number(span.dataset.k);
    span.classList.toggle("hot", k < head && k >= head - BAND);
  }
}

function sweep(spans: HTMLElement[], alive: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const tick = () => {
      const head = ((performance.now() - t0) / SWEEP_MS) * (COLS + BAND * 2);
      frameAt(spans, alive() ? head : COLS + BAND * 3);
      if (alive() && head < COLS + BAND * 2) return requestAnimationFrame(tick);
      spans.forEach((span) => span.classList.remove("hot"));
      return resolve();
    };
    tick();
  });
}

export async function loopBanner(
  spans: HTMLElement[],
  alive: () => boolean,
  visible: () => boolean,
) {
  await sleep(900);
  while (alive()) {
    if (visible() && !document.hidden) await sweep(spans, alive);
    await sleep(7000);
  }
}
