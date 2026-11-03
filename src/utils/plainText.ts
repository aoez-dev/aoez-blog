/** Rough markdown to plain text, used for the terminal's grep and search preview. */
export const plainText = (markdown: string | undefined, max = 6000) =>
  (markdown ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>|~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
