import { describe, expect, it } from "vitest";
import {
  createGame,
  crashed,
  placeFood,
  step,
  tickDelay,
  turn,
  type Game,
} from "./game";
import { LINES, pickLine } from "./lines";

const rng = () => 0;
const withFood = (g: Game, x: number, y: number): Game => ({
  ...g,
  food: { x, y },
});

describe("snake", () => {
  it("starts with three cells and food off the snake", () => {
    const g = createGame(8, rng);
    expect(g.snake).toHaveLength(3);
    expect(g.snake.some((p) => p.x === g.food?.x && p.y === g.food?.y)).toBe(
      false,
    );
  });

  it("moves one cell and keeps its length", () => {
    const g = step(createGame(8, rng), rng);
    expect(g.snake[0]).toEqual({ x: 5, y: 4 });
    expect(g.snake).toHaveLength(3);
  });

  it("ignores a reversal", () => {
    const g = turn(createGame(8, rng), "left");
    expect(g.next).toBe("right");
  });

  it("grows and scores when it eats", () => {
    const g = step(withFood(createGame(8, rng), 5, 4), rng);
    expect(g.snake).toHaveLength(4);
    expect(g.eaten).toBe(1);
    expect(g.food).not.toEqual({ x: 5, y: 4 });
  });

  it("dies on the wall", () => {
    let g = createGame(8, rng);
    for (let i = 0; i < 6 && !g.over; i++) g = step(g, rng);
    expect(g.over).toBe(true);
    expect(crashed(g)).toBe(true);
  });

  it("dies on itself", () => {
    const snake = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
      { x: 4, y: 5 },
      { x: 4, y: 4 },
    ];
    const g = {
      ...withFood(createGame(10, rng), 9, 9),
      snake,
      dir: "up" as const,
      next: "up" as const,
    };
    expect(step(turn(g, "left"), rng).over).toBe(true);
  });

  it("returns null food when the board is full", () => {
    const snake = [0, 1, 2, 3].map((i) => ({ x: i % 2, y: Math.floor(i / 2) }));
    expect(placeFood(2, snake, rng)).toBeNull();
  });

  it("does not move after the game is over", () => {
    const over = { ...createGame(8, rng), over: true };
    expect(step(over, rng)).toBe(over);
  });

  it("gets faster with every point, down to a floor", () => {
    expect(tickDelay(1)).toBeLessThan(tickDelay(0));
    expect(tickDelay(5)).toBeLessThan(tickDelay(1));
    expect(tickDelay(500)).toBe(tickDelay(1000));
  });

  it("picks the same line for the same seed and score", () => {
    expect(pickLine("/x", 3)).toBe(pickLine("/x", 3));
    expect(LINES).toContain(pickLine("/y", 0));
  });
});
