import { required } from "../dom";
import { searchPosts } from "../search";
import { esc, highlight } from "../text";
import type { Hit, Picker } from "../types";
import type { PickerHost } from "./host";

const MAX_SHOWN = 6;

export const renderSearchShell = (query: string) =>
  `<h4 role="heading" aria-level="2">Search posts</h4><div class="sq"><span class="pr">›</span><input id="sqi" type="text" role="combobox" aria-expanded="true" aria-controls="sres" aria-autocomplete="list" autocomplete="off" spellcheck="false" aria-label="Search posts" value="${esc(query)}" placeholder="type to search…"></div><div class="sgrid"><div class="rsl" id="sres" role="listbox" aria-label="Results"></div><div class="pv" id="spv" aria-live="polite"></div></div><div class="pfoot">↑↓ navigate · enter open · esc cancel</div>`;

function optionHtml(hit: Hit, k: number, idx: number, query: string): string {
  const on = k === idx;
  return `<button type="button" role="option" id="sopt-${k}" aria-selected="${on}" class="opt ${on ? "on" : ""}" data-i="${k}"><span class="cr">❯</span><span class="nm">${highlight(hit.post.title, query)}</span><span class="ds">${esc(hit.post.dateLabel)}</span></button>`;
}

export function renderHits(hits: Hit[], idx: number, query: string): string {
  if (!hits.length)
    return `<div class="rs" style="padding:4px 8px">No posts match '${esc(query)}'</div>`;
  return hits
    .slice(0, MAX_SHOWN)
    .map((hit, k) => optionHtml(hit, k, idx, query))
    .join("");
}

export function renderPreview(hit: Hit | undefined, query: string): string {
  if (!hit) return "";
  const { post } = hit;
  const tags = post.tags.map((tag) => `#${esc(tag)}`).join(" ");
  return `<b>${highlight(post.title, query)}</b><div style="color:var(--cmt)">${tags} · ${post.minutes} min · ${esc(post.dateLabel)}</div><p>${hit.excerpt}</p>`;
}

/** Live search with a preview. Enter opens the highlighted post. */
export class SearchPicker implements Picker {
  readonly name = "search" as const;
  private readonly input: HTMLInputElement;
  private readonly results: HTMLElement;
  private readonly preview: HTMLElement;
  private hits: Hit[] = [];
  private idx = 0;
  private request = 0;
  private readonly actions: Record<string, () => void> = {
    ArrowDown: () => this.move(1),
    ArrowUp: () => this.move(-1),
    Enter: () => this.enter(),
    Escape: () => this.cancel(),
  };

  constructor(
    private readonly host: PickerHost,
    initial: string,
  ) {
    const { pick } = host.ctx.els;
    pick.innerHTML = renderSearchShell(initial);
    this.input = required<HTMLInputElement>(pick, "#sqi");
    this.results = required(pick, "#sres");
    this.preview = required(pick, "#spv");
    this.input.addEventListener("input", () => {
      this.idx = 0;
      void this.refresh();
    });
    void this.refresh();
    setTimeout(() => this.input.focus(), 0);
  }

  private get shown() {
    return Math.min(this.hits.length, MAX_SHOWN);
  }

  private paint() {
    const query = this.input.value;
    this.results.innerHTML = renderHits(this.hits, this.idx, query);
    this.preview.innerHTML = renderPreview(this.hits[this.idx], query);
    this.input.setAttribute("aria-activedescendant", `sopt-${this.idx}`);
  }

  private async refresh() {
    const mine = ++this.request;
    const { ctx } = this.host;
    const found = await searchPosts(ctx.data.posts, this.input.value);
    if (mine !== this.request || ctx.state.picker !== this) return;
    this.hits = found;
    this.idx = Math.min(this.idx, Math.max(0, this.shown - 1));
    this.paint();
    ctx.announce(`${found.length} results`);
  }

  private move(d: number) {
    if (!this.shown) return;
    this.idx = (this.idx + d + this.shown) % this.shown;
    this.paint();
  }

  private select(option: HTMLElement | null): boolean {
    if (!option) return false;
    const next = Number(option.dataset.i);
    const changed = next !== this.idx;
    this.idx = next;
    if (changed) this.paint();
    return !changed;
  }

  private enter() {
    const hit = this.hits[this.idx];
    if (hit) this.host.finish(null, () => this.host.openPost(hit.post));
  }

  cancel() {
    this.host.finish({ kind: "dismissed", what: "search" });
  }

  handleKey(e: KeyboardEvent) {
    const action = this.actions[e.key];
    action?.();
    return Boolean(action);
  }

  click(target: Element) {
    if (this.select(target.closest<HTMLElement>(".opt"))) this.enter();
  }

  hover(target: Element) {
    this.select(target.closest<HTMLElement>(".opt"));
  }
}

export const createSearchPicker = (host: PickerHost, initial: string): Picker =>
  new SearchPicker(host, initial);
