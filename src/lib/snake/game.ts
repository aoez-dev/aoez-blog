/** Snake rules. Pure: no DOM, no timers. Randomness comes from the `rng` argument. */
export type Dir = "up" | "down" | "left" | "right";
export interface Point {
  x: number;
  y: number;
}
export interface Game {
  size: number;
  snake: Point[]; // head first
  dir: Dir; // direction of the last step
  next: Dir; // direction of the next step
  food: Point | null;
  eaten: number;
  over: boolean;
}
export type Rng = () => number;

const DELTA: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const outside = (p: Point, size: number) =>
  p.x < 0 || p.y < 0 || p.x >= size || p.y >= size;

export function freeCells(size: number, snake: Point[]): Point[] {
  const free: Point[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!snake.some((p) => same(p, { x, y }))) free.push({ x, y });
    }
  }
  return free;
}

/** A random free cell, or null when the snake fills the board. */
export function placeFood(
  size: number,
  snake: Point[],
  rng: Rng,
): Point | null {
  const free = freeCells(size, snake);
  return free.length ? free[Math.floor(rng() * free.length)] : null;
}

export function createGame(size: number, rng: Rng): Game {
  const mid = Math.floor(size / 2);
  const snake = [0, 1, 2].map((i) => ({ x: mid - i, y: mid }));
  const food = placeFood(size, snake, rng);
  return {
    size,
    snake,
    dir: "right",
    next: "right",
    food,
    eaten: 0,
    over: false,
  };
}

/** Queue a direction. Reversing into the neck is ignored. */
export function turn(game: Game, dir: Dir): Game {
  return dir === OPPOSITE[game.dir] ? game : { ...game, next: dir };
}

const eats = (head: Point, food: Point | null) =>
  food !== null && same(head, food);

const collides = (head: Point, body: Point[], size: number) =>
  outside(head, size) || body.some((p) => same(p, head));

function afterMove(game: Game, snake: Point[], ate: boolean, rng: Rng): Game {
  const food = ate ? placeFood(game.size, snake, rng) : game.food;
  const eaten = game.eaten + Number(ate);
  return { ...game, snake, dir: game.next, food, eaten, over: food === null };
}

export function step(game: Game, rng: Rng): Game {
  if (game.over) return game;
  const delta = DELTA[game.next];
  const head = { x: game.snake[0].x + delta.x, y: game.snake[0].y + delta.y };
  const ate = eats(head, game.food);
  const body = ate ? game.snake : game.snake.slice(0, -1);
  if (collides(head, body, game.size)) {
    return { ...game, dir: game.next, over: true };
  }
  return afterMove(game, [head, ...body], ate, rng);
}

const START_MS = 170;
const STEP_MS = 7;
const MIN_MS = 55;

/** Milliseconds between steps. Every point makes the snake faster, down to a floor. */
export function tickDelay(eaten: number): number {
  return Math.max(MIN_MS, START_MS - eaten * STEP_MS);
}

/** Speed relative to the start, e.g. 1.0 at the start and 3.1 at the floor. */
export const speedOf = (eaten: number) => START_MS / tickDelay(eaten);

/** Did the snake die (as opposed to filling the board)? */
export const crashed = (game: Game) => game.over && game.food !== null;
