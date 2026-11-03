const KEY = "aoez:snake-best";

/** Best score of this visitor. Storage can be blocked, so every access is guarded. */
export function loadBest(): number {
  try {
    const n = Number(localStorage.getItem(KEY));
    return Number.isInteger(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveBest(score: number): void {
  try {
    localStorage.setItem(KEY, String(score));
  } catch {
    /* storage blocked: the score just is not remembered */
  }
}
