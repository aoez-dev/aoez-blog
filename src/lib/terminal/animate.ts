/** Time-based effects: the thinking line, typing, the open-post countdown. */
import type { Scope } from "./dom";
import type { History } from "./history";
import { esc, sleep } from "./text";

const FRAMES = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";

/** Becomes true when any key is pressed after it was created. */
function skipOnKey() {
  const start = performance.now();
  let skipped = false;
  const onKey = (e: KeyboardEvent) => {
    skipped = skipped || (e.timeStamp > start && !e.metaKey && !e.ctrlKey);
  };
  window.addEventListener("keydown", onKey);
  return {
    skipped: () => skipped,
    stop: () => window.removeEventListener("keydown", onKey),
  };
}

async function spin(glyph: HTMLElement, durMs: number, stop: () => boolean) {
  const t0 = performance.now();
  for (let i = 0; performance.now() - t0 < durMs && !stop(); i++) {
    glyph.textContent = FRAMES[i % FRAMES.length];
    await sleep(80);
  }
}

/** A braille spinner with a verb, removed again when done. Any key skips it. */
export async function think(
  history: History,
  verb: string,
  durMs: number,
  scope: Scope,
) {
  const line = history.add(
    `<span class="g">${FRAMES[0]}</span> ${esc(verb)}…`,
    "think",
  );
  const key = skipOnKey();
  await spin(
    line.querySelector<HTMLElement>(".g") ?? line,
    durMs,
    () => key.skipped() || !scope.alive(),
  );
  key.stop();
  line.remove();
}

export type CountdownResult = "done" | "cancelled" | "aborted";

async function countdownLoop(
  line: HTMLElement,
  label: string,
  stop: () => boolean,
) {
  for (let n = 3; n > 0 && !stop(); n--) {
    line.innerHTML = `Opening ${label} in ${n}… <span style="color:var(--cmt)">(esc to cancel)</span>`;
    await sleep(650);
  }
}

export async function runCountdown(
  line: HTMLElement,
  label: string,
  scope: Scope,
  reduce: boolean,
): Promise<CountdownResult> {
  let cancelled = false;
  const onKey = (e: KeyboardEvent) => {
    cancelled = cancelled || e.key === "Escape";
  };
  window.addEventListener("keydown", onKey);
  if (!reduce)
    await countdownLoop(line, label, () => cancelled || !scope.alive());
  window.removeEventListener("keydown", onKey);
  if (!scope.alive()) return "aborted";
  return cancelled ? "cancelled" : "done";
}

/** Writes `text` one character at a time; stops early when `keep()` turns false. */
export async function typeChars(
  text: string,
  msPerChar: number,
  write: (partial: string) => void,
  keep: () => boolean,
) {
  for (let i = 1; i <= text.length && keep(); i++) {
    write(text.slice(0, i));
    await sleep(msPerChar);
  }
}

export async function eraseChars(
  text: string,
  msPerChar: number,
  write: (partial: string) => void,
  keep: () => boolean,
) {
  for (let i = text.length; i >= 0 && keep(); i--) {
    write(text.slice(0, i));
    await sleep(msPerChar);
  }
}
