import { fnv, rngOf } from "@/lib/terminal/rng";
import {
  createGame,
  crashed,
  speedOf,
  step,
  tickDelay,
  turn,
  type Dir,
  type Game,
  type Rng,
} from "./game";
import { bindInput } from "./input";
import { pickLine } from "./lines";
import { draw } from "./render";
import { loadBest, saveBest } from "./storage";

const SIZE = 16;

export interface SnakeConfig {
  seed: string;
}

interface Els {
  board: HTMLElement;
  canvas: HTMLCanvasElement;
  score: HTMLElement;
  bestEl: HTMLElement;
  speed: HTMLElement;
  msg: HTMLElement;
  button: HTMLButtonElement;
}

interface Run {
  els: Els;
  cfg: SnakeConfig;
  rng: Rng;
  game: Game;
  best: number;
  timer: number;
}

function find<T extends HTMLElement>(root: HTMLElement, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`snake: missing ${sel}`);
  return el;
}

function render(run: Run): void {
  const { game, els, best } = run;
  draw(els.canvas, game);
  els.score.textContent = String(game.eaten);
  els.bestEl.textContent = String(best);
  els.speed.textContent = `${speedOf(game.eaten).toFixed(1)}x`;
}

function stop(run: Run): void {
  clearTimeout(run.timer);
  run.timer = 0;
}

function showButton(run: Run, label: string): void {
  run.els.button.textContent = label;
  run.els.button.hidden = false;
}

function pause(run: Run): void {
  if (!run.timer) return;
  stop(run);
  showButton(run, "Resume");
}

function finish(run: Run): void {
  stop(run);
  if (run.game.eaten > run.best) {
    run.best = run.game.eaten;
    saveBest(run.best);
  }
  const line = crashed(run.game)
    ? pickLine(run.cfg.seed, run.game.eaten)
    : "Board full. 404 conquered.";
  run.els.msg.textContent = line;
  showButton(run, "Play again");
  render(run);
}

function tick(run: Run): void {
  run.game = step(run.game, run.rng);
  if (run.game.over) {
    finish(run);
    return;
  }
  render(run);
  schedule(run);
}

function schedule(run: Run): void {
  run.timer = window.setTimeout(() => tick(run), tickDelay(run.game.eaten));
}

function start(run: Run): void {
  if (run.timer) return;
  if (run.game.over) run.game = createGame(SIZE, run.rng);
  run.els.msg.textContent = "";
  run.els.button.hidden = true;
  run.els.board.focus();
  render(run);
  schedule(run);
}

function newRun(root: HTMLElement, cfg: SnakeConfig): Run {
  const rng = rngOf(fnv(cfg.seed));
  const els: Els = {
    board: find(root, "[data-board]"),
    canvas: find(root, "canvas"),
    score: find(root, "[data-score]"),
    bestEl: find(root, "[data-best]"),
    speed: find(root, "[data-speed]"),
    msg: find(root, "[data-msg]"),
    button: find(root, "[data-start]"),
  };
  return {
    els,
    cfg,
    rng,
    game: createGame(SIZE, rng),
    best: loadBest(),
    timer: 0,
  };
}

/** Wires the game to the DOM. Returns a dispose function. */
export function initSnake(root: HTMLElement, cfg: SnakeConfig): () => void {
  const run = newRun(root, cfg);
  const abort = new AbortController();
  const onDir = (dir: Dir) => {
    run.game = turn(run.game, dir);
  };
  bindInput(run.els.board, { onDir }, abort.signal);
  run.els.button.addEventListener("click", () => start(run), {
    signal: abort.signal,
  });
  run.els.board.addEventListener("blur", () => pause(run), {
    signal: abort.signal,
  });
  const themes = new MutationObserver(() => render(run));
  themes.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-pal"],
  });
  render(run);
  return () => {
    stop(run);
    themes.disconnect();
    abort.abort();
  };
}
