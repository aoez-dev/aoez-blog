import type { Dispose } from "../dom";

export function initProgress(bar: HTMLElement | null): Dispose {
  const fill = bar?.querySelector<HTMLElement>("i");
  if (!fill) return () => {};
  const update = () => {
    const max = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    );
    fill.style.width = `${(window.scrollY / max) * 100}%`;
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
  return () => window.removeEventListener("scroll", update);
}
