/** The input bar: typing, Tab completion, Esc handling and the animated placeholder. */
import {
  IDLE_TAB,
  startTab,
  stepTab,
  tabValue,
  type TabState,
} from "./completion";
import { isKey, type Els, type Scope } from "./dom";
import { runPlaceholder } from "./placeholder";

export interface Prompt {
  set(value: string): void;
  get(): string;
  focus(): void;
}

export interface PromptOptions {
  els: Els;
  scope: Scope;
  reduce: boolean;
  completions: string[];
  examples: string[];
  isLocked(): boolean;
  onSubmit(raw: string): void;
}

function createTabbing(opts: PromptOptions, set: (v: string) => void) {
  const { inp } = opts.els;
  let tab: TabState = IDLE_TAB;
  let example = opts.examples[0];
  return {
    reset: () => {
      tab = IDLE_TAB;
    },
    isOn: () => tab.on,
    setExample: (value: string) => {
      example = value;
    },
    step(back: boolean) {
      tab = tab.on
        ? stepTab(tab, back)
        : startTab(opts.completions, inp.value, example, back);
      if (tab.on) set(tabValue(tab));
    },
  };
}

function keyHandlers(
  opts: PromptOptions,
  tabbing: ReturnType<typeof createTabbing>,
  set: (v: string) => void,
  submit: () => void,
): Record<string, (e: KeyboardEvent) => void> {
  const { inp } = opts.els;
  return {
    Tab: (e) => {
      // Shift+Tab on an untouched empty prompt leaves it, so keyboard users are never trapped
      if (e.shiftKey && !tabbing.isOn() && !inp.value) return;
      e.preventDefault();
      tabbing.step(e.shiftKey);
    },
    Enter: (e) => {
      e.preventDefault();
      submit();
    },
    Escape: () => {
      if (!inp.value) return inp.blur();
      set("");
      return tabbing.reset();
    },
  };
}

function bindEvents(
  opts: PromptOptions,
  handlers: Record<string, (e: KeyboardEvent) => void>,
  extra: { reset(): void; step(back: boolean): void; submit(): void },
) {
  const { inp, field, tabBtn, goBtn } = opts.els;
  opts.scope.on(inp, "keydown", (e) => isKey(e) && handlers[e.key]?.(e));
  opts.scope.on(inp, "input", () => {
    extra.reset();
    field.classList.toggle("empty", !inp.value);
  });
  opts.scope.on(tabBtn, "click", () => {
    inp.focus();
    extra.step(false);
  });
  opts.scope.on(goBtn, "click", extra.submit);
  opts.scope.on(field, "click", () => inp.focus());
}

export function createPrompt(opts: PromptOptions): Prompt {
  const { inp, field } = opts.els;
  const set = (value: string) => {
    inp.value = value;
    field.classList.toggle("empty", !value);
  };
  const tabbing = createTabbing(opts, set);
  const submit = () => {
    if (opts.isLocked()) return;
    const value = inp.value;
    set("");
    tabbing.reset();
    opts.onSubmit(value);
  };
  bindEvents(opts, keyHandlers(opts, tabbing, set, submit), {
    reset: tabbing.reset,
    step: tabbing.step,
    submit,
  });
  void runPlaceholder({
    el: opts.els.ph,
    examples: opts.examples,
    scope: opts.scope,
    reduce: opts.reduce,
    onExample: tabbing.setExample,
  });
  return { set, get: () => inp.value, focus: () => inp.focus() };
}
