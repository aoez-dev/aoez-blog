import { DEFAULT_PAL, PALS, PAL_STORAGE_KEY } from "./themes";

let fadeTimer: number | undefined;

/** Switch theme with a gentle colour fade. */
export function themeSet(id: string): void {
  const root = document.documentElement;
  root.classList.add("theming");
  root.dataset.pal = id;
  window.clearTimeout(fadeTimer);
  fadeTimer = window.setTimeout(() => root.classList.remove("theming"), 900);
}

export const currentPal = (): string =>
  document.documentElement.dataset.pal ?? DEFAULT_PAL;

export function savePal(id: string): void {
  try {
    localStorage.setItem(PAL_STORAGE_KEY, id);
  } catch {
    /* storage blocked: the theme only lasts for this page */
  }
}

export const palById = (id: string) => PALS.find((p) => p.id === id);
