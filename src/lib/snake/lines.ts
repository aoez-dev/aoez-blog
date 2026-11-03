import { fnv, rngOf } from "@/lib/terminal/rng";

/** Game over lines. Short and dry. */
export const LINES = [
  "Exit code 1.",
  "Segmentation fault (snake dumped).",
  "Unhandled exception: wall.",
  "git blame says: you.",
  "Works on my machine.",
  "Stack overflow, but in length.",
];

/** Same path and score always give the same line. */
export function pickLine(seed: string, score: number): string {
  const rng = rngOf(fnv(`${seed}:${score}`));
  return LINES[Math.floor(rng() * LINES.length)];
}
