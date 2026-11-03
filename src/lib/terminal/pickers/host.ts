import type { Ctx } from "../context";
import type { Note, TPost } from "../types";

/** What a picker may do to the terminal around it. */
export interface PickerHost {
  ctx: Ctx;
  raw: string;
  /** Close the picker; `after` runs once the bar is back (e.g. opening a post). */
  finish(note: Note | null, after?: () => Promise<void>): void;
  openPost(post: TPost): Promise<void>;
}
