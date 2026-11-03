/** Runs one parsed command against the terminal: output, navigation, pickers. */
import { think } from "./animate";
import type { Ctx } from "./context";
import { showNote } from "./notes";
import { computeOutcome, type Outcome } from "./outcome";
import { openPost } from "./open-post";
import { parseCommand } from "./parse";
import { hasOutput, renderEcho } from "./render";
import { fnv, rngOf } from "./rng";
import { noteHtml } from "./session";
import { sleep } from "./text";
import type { Cmd, LogEntry } from "./types";
import { thinkParams } from "./verbs";
import { openPicker } from "./pickers/open";

type Rng = () => number;
interface Rt {
  ctx: Ctx;
  raw: string;
  rng: Rng;
  echo: HTMLElement;
}

/** The same command run twice gets a different, but reproducible, seed. */
export function nextRng(ctx: Ctx, raw: string): Rng {
  const key = raw.toLowerCase();
  const count = (ctx.state.counts[key] ?? 0) + 1;
  ctx.state.counts[key] = count;
  return rngOf(fnv(`${key}#${count}`));
}

/** Show a computed outcome. Used by the live run and by replay. */
function present(ctx: Ctx, outcome: Outcome) {
  ctx.history.add(outcome.html);
  ctx.history.add(outcome.cost, "cost");
  ctx.status.apply(outcome.delta);
}

async function runOutput(cmd: Cmd, rt: Rt) {
  const { ctx } = rt;
  const outcome = computeOutcome(cmd, ctx.data, rt.rng, ctx.reduce);
  await think(ctx.history, outcome.verb, outcome.dur, ctx.scope);
  if (!ctx.scope.alive()) return;
  present(ctx, outcome);
  ctx.log.record({ raw: rt.raw });
  ctx.history.scrollTo(rt.echo);
}

async function runNav(cmd: Extract<Cmd, { kind: "nav" }>, rt: Rt) {
  const { ctx } = rt;
  const { verb, dur } = thinkParams(cmd, rt.rng, ctx.reduce);
  await think(ctx.history, verb, dur, ctx.scope);
  if (!ctx.scope.alive()) return;
  showNote(ctx, rt.raw, { kind: "nav", to: cmd.to });
  await sleep(ctx.reduce ? 0 : 260);
  if (ctx.scope.alive()) await ctx.navigate(`/${cmd.to}`);
}

const runCat = (cmd: Extract<Cmd, { kind: "cat" }>, rt: Rt) =>
  cmd.post ? openPost(rt.ctx, cmd.post, rt.raw) : runOutput(cmd, rt);

const runPicker = (cmd: Extract<Cmd, { kind: "picker" }>, rt: Rt) =>
  openPicker({ ctx: rt.ctx, name: cmd.name, arg: cmd.arg, raw: rt.raw });

type Handler<K extends Cmd["kind"]> = (
  cmd: Extract<Cmd, { kind: K }>,
  rt: Rt,
) => Promise<void>;
const HANDLERS: { [K in Cmd["kind"]]: Handler<K> } = {
  help: runOutput,
  whoami: runOutput,
  ls: runOutput,
  grep: runOutput,
  bad: runOutput,
  cat: runCat,
  nav: runNav,
  picker: runPicker,
  clear: async () => undefined,
};

function dispatch<K extends Cmd["kind"]>(
  cmd: Extract<Cmd, { kind: K }>,
  rt: Rt,
): Promise<void> {
  const handler: Handler<K> = HANDLERS[cmd.kind as K];
  return handler(cmd, rt);
}

export function clearScreen(ctx: Ctx) {
  ctx.history.clear();
  ctx.state.counts = {};
  ctx.status.reset();
  ctx.log.reset();
}

export async function execute(ctx: Ctx, text: string): Promise<void> {
  const cmd = parseCommand(text, ctx.data);
  if (cmd.kind === "clear") return clearScreen(ctx);
  const rng = nextRng(ctx, text);
  const echo = ctx.history.add(renderEcho(text), "echo-ent");
  ctx.history.scrollTo(echo);
  return dispatch(cmd, { ctx, raw: text, rng, echo });
}

/** Rebuilds an entry from the stored log without animation. Uses the same outcome as the live run. */
export function replayEntry(ctx: Ctx, entry: LogEntry): void {
  const cmd = parseCommand(entry.raw, ctx.data);
  if (cmd.kind === "clear") return;
  const rng = nextRng(ctx, entry.raw);
  ctx.history.add(renderEcho(entry.raw), "echo-ent");
  if (entry.note) {
    ctx.history.add(noteHtml(entry.note));
    return;
  }
  if (hasOutput(cmd))
    present(ctx, computeOutcome(cmd, ctx.data, rng, ctx.reduce));
}
