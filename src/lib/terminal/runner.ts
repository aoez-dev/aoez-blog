/** The public face of command execution: submit, type-and-run, open search, replay. */
import { typeChars } from "./animate";
import type { Ctx } from "./context";
import { execute, replayEntry } from "./execute";
import type { Prompt } from "./prompt";
import { sleep } from "./text";
import type { LogEntry } from "./types";

export interface Runner {
  run(raw: string): Promise<void>;
  typeRun(command: string): Promise<void>;
  openSearch(): Promise<void>;
  replay(log: LogEntry[]): void;
}

/** Types a command into the prompt; false when a picker, typing or a user edit got in the way. */
async function typeCommand(
  ctx: Ctx,
  prompt: Prompt,
  command: string,
): Promise<boolean> {
  const { state } = ctx;
  const keep = () => ctx.scope.alive() && !state.picker;
  state.typing = true;
  prompt.focus();
  prompt.set("");
  try {
    await typeChars(command, ctx.reduce ? 0 : 22, prompt.set, keep);
    await sleep(ctx.reduce ? 0 : 180);
  } finally {
    state.typing = false;
  }
  return keep() && prompt.get() === command;
}

export function createRunner(ctx: Ctx, prompt: Prompt): Runner {
  const { state } = ctx;

  const run = async (raw: string) => {
    const text = raw.trim();
    if (!text || state.busy || state.picker) return;
    state.busy = true;
    try {
      await execute(ctx, text);
    } finally {
      state.busy = false;
    }
  };

  const typeRun = async (command: string) => {
    if (state.busy || state.picker || state.typing) return;
    if (!(await typeCommand(ctx, prompt, command))) return;
    prompt.set("");
    await run(command);
  };

  /** The header search button and the typed /search take the same path. */
  const openSearch = () => run("/search");

  const replay = (log: LogEntry[]) =>
    log.forEach((entry) => replayEntry(ctx, entry));

  return { run, typeRun, openSearch, replay };
}
