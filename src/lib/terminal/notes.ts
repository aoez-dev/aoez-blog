/** A result line that is part of the session: shown, recorded and announced in one step. */
import type { Ctx } from "./context";
import { noteHtml, noteText } from "./session";
import { stripTags } from "./text";
import type { Note } from "./types";

/** Writes into `line` when given (the countdown line), otherwise adds a new history entry. */
export function showNote(
  ctx: Ctx,
  raw: string,
  note: Note,
  line?: HTMLElement,
): HTMLElement {
  const el = line ?? ctx.history.add(noteHtml(note));
  if (line) line.innerHTML = noteText(note);
  ctx.log.record({ raw, note });
  ctx.announce(stripTags(noteText(note)));
  return el;
}
