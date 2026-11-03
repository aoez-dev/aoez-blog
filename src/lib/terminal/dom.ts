/** Typed DOM lookups and one place that owns every listener and loop of a terminal. */
export interface Els {
  hist: HTMLElement;
  sess: HTMLElement;
  inp: HTMLInputElement;
  field: HTMLElement;
  ph: HTMLElement;
  box: HTMLElement;
  pick: HTMLElement;
  sl: HTMLElement;
  ascii: HTMLElement;
  tabBtn: HTMLElement;
  goBtn: HTMLElement;
  live: HTMLElement;
}

export function required<T extends HTMLElement = HTMLElement>(
  root: ParentNode,
  selector: string,
): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`terminal: missing element ${selector}`);
  return el;
}

export function getEls(root: HTMLElement): Els {
  return {
    hist: required(root, "#hist"),
    sess: required(root, "#sess"),
    inp: required<HTMLInputElement>(root, "#inp"),
    field: required(root, "#field"),
    ph: required(root, "#ph"),
    box: required(root, "#box"),
    pick: required(root, "#pick"),
    sl: required(root, "#sl"),
    ascii: required(root, "#ascii"),
    tabBtn: required(root, "#tabBtn"),
    goBtn: required(root, "#goBtn"),
    live: required(root, "#live"),
  };
}

export interface Scope {
  readonly signal: AbortSignal;
  alive(): boolean;
  abort(): void;
  on(
    target: EventTarget,
    type: string,
    handler: (e: Event) => void,
    capture?: boolean,
  ): void;
}

/** Everything registered here is removed when the scope is aborted. */
export function createScope(): Scope {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    alive: () => !controller.signal.aborted,
    abort: () => controller.abort(),
    on: (target, type, handler, capture = false) =>
      target.addEventListener(type, handler, {
        signal: controller.signal,
        capture,
      }),
  };
}

export const isKey = (e: Event): e is KeyboardEvent => "key" in e;
