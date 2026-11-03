import { PALS, type Pal } from "@/lib/themes";
import { currentPal, palById, savePal, themeSet } from "@/lib/theme";
import { esc } from "../text";
import type { Picker } from "../types";
import type { PickerHost } from "./host";

type Group = "dark" | "light";

const palsOf = (group: Group): Pal[] => PALS.filter((p) => p.group === group);
const swatch = (pal: Pal) =>
  `<i>${pal.swatch.map((c) => `<s style="background:${c}"></s>`).join("")}</i>`;

const groupButton = (group: Group, current: Group) =>
  `<button type="button" data-grp="${group}" class="${group === current ? "on" : ""}">${group === "dark" ? "‹ Dark" : "Light ›"}</button>`;

function optionHtml(pal: Pal, i: number, idx: number, orig: string): string {
  const on = i === idx;
  const mark = pal.id === orig ? " ✔" : "";
  return `<button type="button" role="option" id="theme-opt-${i}" aria-selected="${on}" class="opt ${on ? "on" : ""}" data-i="${i}"><span class="cr">❯</span><span class="nm">${swatch(pal)}${esc(pal.name)}${mark}</span><span class="ds">${esc(pal.desc)}</span></button>`;
}

export function renderThemePicker(
  group: Group,
  idx: number,
  orig: string,
): string {
  const options = palsOf(group)
    .map((pal, i) => optionHtml(pal, i, idx, orig))
    .join("");
  return [
    `<h4 role="heading" aria-level="2">Select theme</h4>`,
    `<div class="grp">${groupButton("dark", group)}${groupButton("light", group)}</div>`,
    `<div role="listbox" tabindex="-1" aria-label="Themes" aria-activedescendant="theme-opt-${idx}">${options}</div>`,
    `<div class="pfoot">↑↓ navigate · ←→ or tab dark / light · enter select · esc cancel</div>`,
  ].join("");
}

/** Arrow keys preview the theme live; Enter keeps it, Esc restores the previous one. */
export class ThemePicker implements Picker {
  readonly name = "theme" as const;
  private readonly orig = currentPal();
  private group: Group = palById(this.orig)?.group ?? "dark";
  private idx = 0;
  private readonly actions: Record<string, () => void> = {
    ArrowDown: () => this.move(1),
    ArrowUp: () => this.move(-1),
    ArrowLeft: () => this.toggle(),
    ArrowRight: () => this.toggle(),
    Tab: () => this.toggle(),
    Enter: () => this.enter(),
    Escape: () => this.cancel(),
  };

  constructor(private readonly host: PickerHost) {
    this.idx = Math.max(
      0,
      palsOf(this.group).findIndex((p) => p.id === this.orig),
    );
    this.draw();
  }

  private get pal(): Pal {
    return palsOf(this.group)[this.idx];
  }

  private draw() {
    const { pick } = this.host.ctx.els;
    pick.innerHTML = renderThemePicker(this.group, this.idx, this.orig);
    pick
      .querySelector<HTMLElement>("[role=listbox]")
      ?.focus({ preventScroll: true });
  }

  private apply() {
    themeSet(this.pal.id);
    this.host.ctx.announce(`Theme ${this.pal.name}`);
    this.draw();
  }

  private move(d: number) {
    const n = palsOf(this.group).length;
    this.idx = (this.idx + d + n) % n;
    this.apply();
  }

  private setGroup(next: Group) {
    if (next === this.group) return;
    this.group = next;
    this.idx = Math.min(this.idx, palsOf(next).length - 1);
    this.apply();
  }

  private toggle() {
    this.setGroup(this.group === "dark" ? "light" : "dark");
  }

  private enter() {
    savePal(this.pal.id);
    this.host.finish({ kind: "theme", name: this.pal.name });
  }

  cancel() {
    themeSet(this.orig);
    this.host.finish({ kind: "dismissed", what: "theme" });
  }

  handleKey(e: KeyboardEvent) {
    const action = this.actions[e.key];
    action?.();
    return Boolean(action);
  }

  click(target: Element) {
    const button = target.closest<HTMLElement>("[data-grp]");
    if (button)
      return this.setGroup(button.dataset.grp === "light" ? "light" : "dark");
    const option = target.closest<HTMLElement>(".opt");
    if (!option) return undefined;
    if (Number(option.dataset.i) === this.idx) return this.enter();
    this.idx = Number(option.dataset.i);
    return this.apply();
  }

  hover() {
    /* the theme list reacts to the keyboard and to clicks only */
  }
}

export const createThemePicker = (host: PickerHost): Picker =>
  new ThemePicker(host);
