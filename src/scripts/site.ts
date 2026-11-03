import { initChrome } from "./chrome";
import { initHeaderScroll } from "./headerScroll";
import { initHeaderSearch } from "./headerSearch";
import { initPost } from "./post";
import { initReveal } from "./reveal";
import type { Dispose } from "./dom";

let disposers: Dispose[] = [];

document.addEventListener("astro:page-load", () => {
  disposers.forEach((d) => d());
  disposers = [
    initChrome(),
    initHeaderScroll(),
    initReveal(),
    initPost(),
    initHeaderSearch(),
  ];
});
