/** Opening a post from the terminal: a short countdown, then navigation. Every outcome is recorded. */
import { runCountdown } from "./animate";
import type { Ctx } from "./context";
import { showNote } from "./notes";
import { esc } from "./text";
import type { Note, TPost } from "./types";

export async function openPost(
  ctx: Ctx,
  post: TPost,
  raw: string,
): Promise<void> {
  const entry = ctx.history.add("");
  const line = document.createElement("div");
  line.className = "rs";
  entry.append(line);
  ctx.history.scrollTo(entry);
  const label = `<b style="color:var(--fg);font-weight:500">${esc(post.file)}</b>`;
  const result = await runCountdown(line, label, ctx.scope, ctx.reduce);
  if (result === "aborted") return;
  const note: Note =
    result === "cancelled"
      ? { kind: "cancelled" }
      : { kind: "open", file: post.file };
  showNote(ctx, raw, note, line);
  if (result === "done") await ctx.navigate(post.url);
}
