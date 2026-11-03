import { reduceMotion, type Dispose } from "../dom";
import { activationPoints, activeIndex } from "./spy";

const THRESHOLD = 130;
const LINK_SEL = ".post-outline a[data-heading]";
const CLICK_SEL = ".post-outline a[data-heading], .moutline a[data-heading]";
/** Input that means the reader is scrolling by hand. */
const USER_SCROLL = ["wheel", "touchmove", "keydown"] as const;

export interface Lock {
  /** Index the reader clicked in the outline, or null. */
  get(): number | null;
  set(idx: number): void;
  /** Forget the click and call `onRelease`. */
  release(): void;
}

/**
 * A clicked outline item stays active until the reader scrolls by hand. Short sections at the
 * end of a post cannot reach the top of the page, so the scroll position alone would not
 * keep them active.
 */
export function createLock(onRelease: () => void): Lock {
  let value: number | null = null;
  return {
    get: () => value,
    set(idx) {
      value = idx;
    },
    release() {
      if (value === null) return;
      value = null;
      onRelease();
    },
  };
}

const topOf = (el: HTMLElement) =>
  el.getBoundingClientRect().top + window.scrollY;

/** The outline item that belongs to the current scroll position. */
function scrollIndex(heads: HTMLElement[]): number {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const points = activationPoints(
    heads.map(topOf),
    Math.max(0, maxScroll),
    THRESHOLD,
  );
  return activeIndex(points, window.scrollY);
}

function scrollToHeading(target: HTMLElement) {
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - 80,
    behavior: reduceMotion() ? "auto" : "smooth",
  });
}

function headingFor(el: Element) {
  const a = el.closest<HTMLAnchorElement>(CLICK_SEL);
  return a ? document.getElementById(a.dataset.heading ?? "") : null;
}

interface Pair {
  link: HTMLAnchorElement;
  head: HTMLElement;
}

/** Outline links that have a heading on the page, so the two lists always line up. */
function collectPairs(): Pair[] {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>(LINK_SEL))
    .map((link) => ({
      link,
      head: document.getElementById(link.dataset.heading ?? ""),
    }))
    .filter((pair): pair is Pair => pair.head !== null);
}

interface Handlers {
  update: () => void;
  onClick: (e: Event) => void;
  release: () => void;
}

function bind({ update, onClick, release }: Handlers): Dispose {
  window.addEventListener("scroll", update, { passive: true });
  document.addEventListener("click", onClick);
  USER_SCROLL.forEach((type) =>
    window.addEventListener(type, release, { passive: true }),
  );
  return () => {
    window.removeEventListener("scroll", update);
    document.removeEventListener("click", onClick);
    USER_SCROLL.forEach((type) => window.removeEventListener(type, release));
  };
}

export function initOutline(): Dispose {
  const pairs = collectPairs();
  const links = pairs.map((pair) => pair.link);
  const heads = pairs.map((pair) => pair.head);
  const mark = (cur: number) =>
    links.forEach((a, k) => a.classList.toggle("on", k === cur));
  const update = () => mark(lock.get() ?? scrollIndex(heads));
  const lock = createLock(update);

  const onClick = (e: Event) => {
    const target = headingFor(e.target as Element);
    if (!target) return;
    e.preventDefault();
    const idx = heads.indexOf(target);
    if (idx >= 0) {
      lock.set(idx);
      mark(idx);
    }
    scrollToHeading(target);
  };

  const dispose = bind({ update, onClick, release: () => lock.release() });
  update();
  return dispose;
}
