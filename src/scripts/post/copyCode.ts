import type { Dispose } from "../dom";

const LABEL = "cp";

async function copy(pre: HTMLElement, btn: HTMLButtonElement) {
  const text = pre.querySelector("code")?.textContent ?? "";
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = "copied";
  } catch {
    btn.textContent = "select";
  }
}

function addButton(pre: HTMLElement, timers: number[]) {
  if (pre.querySelector(".copy-code")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "copy-code";
  btn.textContent = LABEL;
  btn.addEventListener("click", async () => {
    await copy(pre, btn);
    timers.push(window.setTimeout(() => (btn.textContent = LABEL), 1300));
  });
  pre.appendChild(btn);
}

/** Copy buttons on code blocks. */
export function initCopyCode(article: HTMLElement): Dispose {
  const timers: number[] = [];
  article.querySelectorAll("pre").forEach((pre) => addButton(pre, timers));
  return () => timers.forEach((t) => window.clearTimeout(t));
}
