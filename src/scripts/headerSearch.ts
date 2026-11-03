import { navigate } from "astro:transitions/client";
import { OPEN_SEARCH_KEY, SEARCH_EVENT } from "./keys";
import type { Dispose } from "./dom";

function requestSearchOnHome() {
  try {
    sessionStorage.setItem(OPEN_SEARCH_KEY, "1");
  } catch {
    /* ignore */
  }
  void navigate("/");
}

function onClick(e: Event) {
  if (!(e.target as Element).closest("#open-search")) return;
  if (document.querySelector("#terminal")) {
    window.dispatchEvent(new CustomEvent(SEARCH_EVENT));
  } else {
    requestSearchOnHome();
  }
}

export function initHeaderSearch(): Dispose {
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
