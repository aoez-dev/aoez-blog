import { noop, reduceMotion, type Dispose } from "./dom";

const SELECTOR =
  ".pin > *:not(.pgrid):not(.cvg), .pgrid > *, .cvg > *, .phead > *, .hero-img, .art, .prail";

/** Content pages fade in block by block, top to bottom. */
export function initReveal(): Dispose {
  if (document.querySelector(".terminal-page") || reduceMotion()) return noop;
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el, n) => {
    el.classList.add("rv");
    el.style.setProperty("--i", String(n));
  });
  return noop;
}
