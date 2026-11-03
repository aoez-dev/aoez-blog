import type { Dir } from "./game";

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

export const dirOfKey = (key: string): Dir | undefined => KEY_DIRS[key];

const SWIPE_MIN = 24;

/** Direction of a swipe, or undefined for a tap. */
export function dirOfSwipe(dx: number, dy: number): Dir | undefined {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return undefined;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

export interface InputHandlers {
  onDir(dir: Dir): void;
}

/** Keyboard (only while the board has focus) and swipe on the board. */
export function bindInput(
  board: HTMLElement,
  handlers: InputHandlers,
  signal: AbortSignal,
): void {
  board.addEventListener(
    "keydown",
    (e) => {
      const dir = dirOfKey(e.key);
      if (dir) e.preventDefault();
      if (dir) handlers.onDir(dir);
    },
    { signal },
  );
  bindSwipe(board, handlers, signal);
}

function bindSwipe(
  board: HTMLElement,
  handlers: InputHandlers,
  signal: AbortSignal,
): void {
  let x = 0;
  let y = 0;
  board.addEventListener(
    "pointerdown",
    (e) => {
      x = e.clientX;
      y = e.clientY;
      board.focus();
    },
    { signal },
  );
  board.addEventListener(
    "pointerup",
    (e) => {
      const dir = dirOfSwipe(e.clientX - x, e.clientY - y);
      if (dir) handlers.onDir(dir);
    },
    { signal },
  );
}
