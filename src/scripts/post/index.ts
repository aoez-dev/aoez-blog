import { noop, type Dispose } from "../dom";
import { initCopyCode } from "./copyCode";
import { initOutline } from "./outline";
import { initProgress } from "./progress";

/** Reading progress, outline scroll-spy and code copy for post pages. */
export function initPost(): Dispose {
  const article = document.querySelector<HTMLElement>("#article");
  const bar = document.getElementById("read-progress");
  if (bar) bar.hidden = !article;
  if (!article) return noop;
  const disposers = [initProgress(bar), initOutline(), initCopyCode(article)];
  return () => disposers.forEach((d) => d());
}
