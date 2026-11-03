/** The animated example command in the empty prompt. */
import { eraseChars, typeChars } from "./animate";
import type { Scope } from "./dom";
import { sleep } from "./text";

interface PlaceholderOptions {
  el: HTMLElement;
  examples: string[];
  scope: Scope;
  reduce: boolean;
  onExample: (example: string) => void;
}

async function cycle(opts: PlaceholderOptions, example: string) {
  const write = (text: string) => {
    opts.el.textContent = text;
  };
  const keep = () => opts.scope.alive();
  opts.onExample(example);
  await typeChars(example, 90, write, keep);
  await sleep(2800);
  await eraseChars(example, 28, write, keep);
  await sleep(700);
}

export async function runPlaceholder(opts: PlaceholderOptions) {
  if (opts.reduce) {
    opts.el.textContent = opts.examples[0];
    opts.onExample(opts.examples[0]);
    return;
  }
  for (let i = 0; opts.scope.alive(); i++) {
    await cycle(opts, opts.examples[i % opts.examples.length]);
  }
}
