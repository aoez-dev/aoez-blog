import type { CollectionEntry } from "astro:content";

/** `src/data/blog/foo/bar.md` -> `bar.md`, shown as the pane / path title */
export const getFileName = (post: CollectionEntry<"blog">) =>
  post.filePath?.split("/").pop() ?? `${post.id}.md`;
