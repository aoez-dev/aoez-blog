/** Opens a picker in place of the input bar and resolves when it is closed (and its follow-up is done). */
import type { Ctx } from "../context";
import { showNote } from "../notes";
import { openPost } from "../open-post";
import type { Note, Picker, PickerName } from "../types";
import type { PickerHost } from "./host";
import { createSearchPicker } from "./search";
import { createThemePicker } from "./theme";

const FACTORIES: Record<PickerName, (host: PickerHost, arg: string) => Picker> =
  {
    theme: (host) => createThemePicker(host),
    search: (host, arg) => createSearchPicker(host, arg),
  };

function closeUi(ctx: Ctx) {
  ctx.els.pick.hidden = true;
  ctx.els.box.hidden = false;
  ctx.state.picker = null;
  ctx.status.setMode("READY");
  if (ctx.fine) ctx.els.inp.focus();
}

function finishNote(ctx: Ctx, raw: string, note: Note) {
  const entry = showNote(ctx, raw, note);
  const previous = entry.previousElementSibling;
  ctx.history.scrollTo(previous instanceof HTMLElement ? previous : entry);
}

export interface OpenPickerOptions {
  ctx: Ctx;
  name: PickerName;
  arg: string;
  raw: string;
}

export function openPicker({
  ctx,
  name,
  arg,
  raw,
}: OpenPickerOptions): Promise<void> {
  return new Promise((resolve) => {
    const finish: PickerHost["finish"] = (note, after) => {
      closeUi(ctx);
      if (note) finishNote(ctx, raw, note);
      Promise.resolve(after?.()).finally(resolve);
    };
    ctx.els.box.hidden = true;
    ctx.els.pick.hidden = false;
    ctx.status.setMode(name.toUpperCase());
    const host: PickerHost = {
      ctx,
      raw,
      finish,
      openPost: (post) => openPost(ctx, post, raw),
    };
    ctx.state.picker = FACTORIES[name](host, arg);
  });
}
