import { isCrumbItems, renderCrumb } from "@/utils/crumb";
import { noop, type Dispose } from "./dom";

function updateCrumb() {
  const meta = document.head.querySelector<HTMLMetaElement>(
    'meta[name="x-crumb"]',
  );
  const crumb = document.getElementById("crumb");
  if (!meta || !crumb) return;
  try {
    const items: unknown = JSON.parse(meta.content);
    if (isCrumbItems(items)) crumb.innerHTML = renderCrumb(items);
  } catch {
    /* keep the server-rendered crumb */
  }
}

const isActive = (path: string, target: string) =>
  path === target || path.startsWith(target + "/");

function updateNav() {
  const path = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll<HTMLAnchorElement>("[data-nav]").forEach((a) => {
    const on = isActive(path, a.dataset.nav ?? "");
    a.classList.toggle("on", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

/** Breadcrumb and nav state follow the page that was just loaded. */
export function initChrome(): Dispose {
  updateCrumb();
  updateNav();
  return noop;
}
