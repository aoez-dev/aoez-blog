/** Wires the terminal together. Everything else lives in the modules next to this file. */
import { navigate } from "astro:transitions/client";
import { OPEN_SEARCH_KEY, SEARCH_EVENT } from "@/scripts/keys";
import { loopBanner, renderBanner } from "./banner";
import { commandList } from "./completion";
import type { Ctx } from "./context";
import { createScope, getEls, isKey, type Els, type Scope } from "./dom";
import { createHistory } from "./history";
import { createPrompt } from "./prompt";
import { createRunner, type Runner } from "./runner";
import { createSessionLog } from "./session";
import { createStatus } from "./status";
import type { TerminalData } from "./types";

const EMPTY: TerminalData = {
  site: { name: "", tagline: "", bio: "", socials: [] },
  posts: [],
};

function readData(): TerminalData {
  try {
    return JSON.parse(
      document.getElementById("terminal-data")?.textContent ?? "",
    ) as TerminalData;
  } catch {
    return EMPTY;
  }
}

function buildCtx(els: Els, scope: Scope): Ctx {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx: Ctx = {
    data: readData(),
    reduce,
    fine: window.matchMedia("(pointer:fine)").matches,
    els,
    scope,
    history: createHistory(els.hist, els.sess, reduce),
    status: createStatus(els.sl),
    state: { busy: false, typing: false, picker: null, counts: {} },
    announce: (message) => {
      els.live.textContent = message;
    },
    log: createSessionLog(() => els.sess.scrollTop),
    navigate: (url) => navigate(url),
  };
  return ctx;
}

const isInside = (root: HTMLElement, e: Event) =>
  e.target instanceof Node && root.contains(e.target);

/** While a picker is open it owns the keyboard (but only for keys pressed inside the terminal). */
function bindPickerKeys(ctx: Ctx, root: HTMLElement) {
  ctx.scope.on(
    document,
    "keydown",
    (e) => {
      const picker = ctx.state.picker;
      if (!picker || !isKey(e) || !isInside(root, e)) return;
      if (picker.handleKey(e)) e.preventDefault();
    },
    true,
  );
  ctx.scope.on(ctx.els.pick, "click", (e) => {
    if (e.target instanceof Element) ctx.state.picker?.click(e.target);
  });
  ctx.scope.on(ctx.els.pick, "mouseover", (e) => {
    if (e.target instanceof Element) ctx.state.picker?.hover(e.target);
  });
}

function dataOf(e: Event, attr: "run" | "fill"): string | null {
  const el =
    e.target instanceof Element
      ? e.target.closest<HTMLElement>(`[data-${attr}]`)
      : null;
  return el?.dataset[attr] ?? null;
}

function bindShortcuts(
  ctx: Ctx,
  root: HTMLElement,
  runner: Runner,
  focusInput: (v: string) => void,
) {
  ctx.scope.on(root, "click", (e) => {
    const run = dataOf(e, "run");
    const fill = dataOf(e, "fill");
    if (run !== null) void runner.typeRun(run);
    if (fill !== null) focusInput(fill);
  });
  ctx.scope.on(window, SEARCH_EVENT, () => void runner.openSearch());
  ctx.scope.on(window, "pagehide", ctx.log.persist);
}

function consumeSearchFlag(): boolean {
  try {
    const flagged = sessionStorage.getItem(OPEN_SEARCH_KEY) !== null;
    sessionStorage.removeItem(OPEN_SEARCH_KEY);
    return flagged;
  } catch {
    return false;
  }
}

function restore(ctx: Ctx, runner: Runner) {
  const saved = ctx.log.restore();
  if (!saved) return;
  runner.replay(ctx.log.entries());
  ctx.els.sess.scrollTop = saved.scroll;
}

function startBanner(ctx: Ctx) {
  const spans = renderBanner(ctx.els.ascii);
  if (ctx.reduce) return;
  const { sess, ascii } = ctx.els;
  const visible = () => {
    const a = ascii.getBoundingClientRect();
    const s = sess.getBoundingClientRect();
    return a.bottom > s.top && a.top < s.bottom;
  };
  void loopBanner(spans, ctx.scope.alive, visible);
}

const EXAMPLES = (first: string) => [
  "/help",
  "/whoami",
  "!ls posts/",
  "/search",
  "!ls posts/ -l",
  `!grep ${first} posts/`,
  "/theme",
];

export function initTerminal(root: HTMLElement): () => void {
  const scope = createScope();
  const els = getEls(root);
  const ctx = buildCtx(els, scope);
  const prompt = createPrompt({
    els,
    scope,
    reduce: ctx.reduce,
    completions: commandList(ctx.data.posts),
    examples: EXAMPLES(ctx.data.posts[0]?.tags[0] ?? "agents"),
    isLocked: () => ctx.state.typing,
    onSubmit: (raw) => void runner.run(raw),
  });
  const runner = createRunner(ctx, prompt);
  els.box.hidden = false;
  bindPickerKeys(ctx, root);
  bindShortcuts(ctx, root, runner, (value) => {
    prompt.set(value);
    prompt.focus();
  });
  startBanner(ctx);
  restore(ctx, runner);
  if (consumeSearchFlag()) {
    setTimeout(() => ctx.scope.alive() && void runner.openSearch(), 120);
  }
  if (ctx.fine) prompt.focus();

  /** Called before the page is swapped out: remember the session, stop everything. */
  return () => {
    ctx.log.persist();
    scope.abort();
  };
}
