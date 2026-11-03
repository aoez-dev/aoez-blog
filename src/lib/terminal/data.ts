import type { CollectionEntry } from "astro:content";
import { HERO } from "@/config";
import { SOCIALS } from "@/constants";
import { getPath } from "@/utils/getPath";
import { getFileName } from "@/utils/getFileName";
import { formatDate } from "@/utils/formatDate";
import { readingTime } from "@/utils/readingTime";
import { shortHash } from "@/utils/shortHash";
import { plainText } from "@/utils/plainText";
import type { TerminalData } from "./types";

/** Everything the terminal needs, serialized into the page. `posts` must already be sorted. */
export function buildTerminalData(
  posts: CollectionEntry<"blog">[],
): TerminalData {
  return {
    site: {
      name: HERO.name,
      tagline: HERO.tagline,
      bio: HERO.bio,
      socials: SOCIALS.map(({ name, href }) => ({ name, href })),
    },
    posts: posts.map((post) => {
      const url = getPath(post.id, post.filePath);
      const file = getFileName(post);
      return {
        slug: url.split("/").pop() ?? post.id,
        name: file.replace(/\.md$/, ""),
        file,
        url,
        title: post.data.title,
        description: post.data.description,
        tags: post.data.tags,
        date: post.data.pubDatetime.toISOString(),
        dateLabel: formatDate(
          post.data.pubDatetime,
          "MMM D",
          post.data.timezone,
        ),
        minutes: readingTime(post.body),
        hash: shortHash(post.id),
        body: plainText(post.body),
      };
    }),
  };
}
