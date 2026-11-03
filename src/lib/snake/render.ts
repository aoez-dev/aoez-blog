import type { Game } from "./game";

const CELL = 20;

function token(el: HTMLElement, name: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/** Draw the board with the current theme tokens (read on every draw, so theme changes just work). */
export function draw(canvas: HTMLCanvasElement, game: Game): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = canvas.height = game.size * CELL;
  ctx.fillStyle = token(canvas, "--surface");
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (game.food) cell(ctx, game.food, token(canvas, "--green"), 4);
  const body = token(canvas, "--accent");
  game.snake.forEach((p, i) =>
    cell(ctx, p, i ? body : token(canvas, "--fg"), 2),
  );
}

function cell(
  ctx: CanvasRenderingContext2D,
  p: { x: number; y: number },
  color: string,
  inset: number,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(
    p.x * CELL + inset,
    p.y * CELL + inset,
    CELL - inset * 2,
    CELL - inset * 2,
  );
}
