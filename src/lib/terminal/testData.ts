import type { TerminalData, TPost } from "./types";

const post = (
  name: string,
  title: string,
  tags: string[],
  body: string,
): TPost => ({
  slug: name,
  name,
  file: `${name}.md`,
  url: `/posts/${name}`,
  title,
  description: `About ${title.toLowerCase()}.`,
  tags,
  date: "2026-10-24T00:00:00.000Z",
  dateLabel: "Oct 24",
  minutes: 5,
  hash: "abc1234",
  body,
});

/** Small fixed data set for tests. */
export const fixture: TerminalData = {
  site: {
    name: "Test Person",
    tagline: "Dev.",
    bio: "Builds things.",
    socials: [{ name: "GitHub", href: "https://example.com" }],
  },
  posts: [
    post(
      "agent-loops",
      "Agent loops that survive",
      ["agents", "llms"],
      "Retries matter. Backoff matters too.",
    ),
    post(
      "evals-fast",
      "Evals without a dataset",
      ["evals"],
      "Label thirty cases. Then score changes.",
    ),
    post(
      "astro-notes",
      "Astro and search",
      ["astro"],
      "Static sites are fast. Pagefind indexes them.",
    ),
  ],
};
