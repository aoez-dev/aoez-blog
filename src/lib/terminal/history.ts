export interface History {
  add(html: string, cls?: string): HTMLElement;
  scrollTo(el: HTMLElement): void;
  clear(): void;
}

export function createHistory(
  hist: HTMLElement,
  sess: HTMLElement,
  reduce: boolean,
): History {
  return {
    add(html, cls = "") {
      const entry = document.createElement("div");
      entry.className = `ent ${cls}`.trim();
      entry.innerHTML = html;
      hist.appendChild(entry);
      return entry;
    },
    scrollTo(el) {
      sess.scrollTo({
        top: el.offsetTop - 12,
        behavior: reduce ? "auto" : "smooth",
      });
    },
    clear() {
      hist.innerHTML = "";
      sess.scrollTo({ top: 0 });
    },
  };
}
