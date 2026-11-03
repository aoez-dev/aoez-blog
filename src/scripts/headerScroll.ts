import type { Dispose } from "./dom";

/** The header is transparent at the top and gets a soft backdrop once content scrolls under it. */
export function initHeaderScroll(): Dispose {
  const header = document.querySelector(".site-h");
  if (!header) return () => undefined;
  const update = () => header.classList.toggle("scrolled", window.scrollY > 4);
  window.addEventListener("scroll", update, { passive: true });
  update();
  return () => window.removeEventListener("scroll", update);
}
