/** Search: Pagefind full text when available, local scoring over the embedded text as fallback. */
import { esc, highlight, queryWords } from "./text";
import type { Hit, TPost } from "./types";

interface PagefindData {
  url: string;
  excerpt: string;
}
export interface PagefindApi {
  search(
    query: string,
  ): Promise<{ results: { data(): Promise<PagefindData> }[] }>;
}
export type PagefindLoader = () => Promise<PagefindApi | null>;

const PAGEFIND_URL = "/pagefind/pagefind.js";
let loading: Promise<PagefindApi | null> | null = null;

/** A failed load is not cached, so a later search can try again. */
export const loadPagefind: PagefindLoader = () => {
  loading ??= import(/* @vite-ignore */ PAGEFIND_URL)
    .then((module) => module as PagefindApi)
    .catch(() => {
      loading = null;
      return null;
    });
  return loading;
};

const pathOf = (url: string) =>
  new URL(url, location.origin).pathname.replace(/\/$/, "");

/** Keep text and <mark>; every other "<" becomes visible text, so no other tag can form. */
const safeExcerpt = (html: string) => html.replace(/<(?!\/?mark>)/g, "&lt;");

function toHit(posts: TPost[], item: PagefindData): Hit[] {
  const post = posts.find((p) => pathOf(p.url) === pathOf(item.url));
  return post ? [{ post, excerpt: safeExcerpt(item.excerpt) }] : [];
}

async function remoteHits(
  posts: TPost[],
  term: string,
  load: PagefindLoader,
): Promise<Hit[]> {
  try {
    const api = await load();
    if (!api) return [];
    const found = await api.search(term);
    const items = await Promise.all(
      found.results.slice(0, 8).map((r) => r.data()),
    );
    return items.flatMap((item) => toHit(posts, item));
  } catch {
    return [];
  }
}

const FIELD_WEIGHTS: [(p: TPost) => string, number][] = [
  [(p) => p.title, 3],
  [(p) => p.tags.join(" "), 2],
  [(p) => p.description, 1],
  [(p) => p.body, 1],
];

export function scorePost(post: TPost, words: string[]): number {
  return words.reduce(
    (sum, word) =>
      sum +
      FIELD_WEIGHTS.reduce(
        (inner, [field, weight]) =>
          inner + (field(post).toLowerCase().includes(word) ? weight : 0),
        0,
      ),
    0,
  );
}

function excerptFor(post: TPost, term: string): string {
  const first = queryWords(term)[0]?.toLowerCase() ?? "";
  const sentence = post.body
    .split(/(?<=\.)\s+/)
    .find((s) => s.toLowerCase().includes(first));
  return highlight(sentence ?? post.description, term);
}

function localHits(posts: TPost[], term: string): Hit[] {
  const words = queryWords(term.toLowerCase());
  return posts
    .map((post) => ({ post, score: scorePost(post, words) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => ({ post, excerpt: excerptFor(post, term) }));
}

export async function searchPosts(
  posts: TPost[],
  query: string,
  load: PagefindLoader = loadPagefind,
): Promise<Hit[]> {
  const term = query.trim();
  if (!term)
    return posts.map((post) => ({ post, excerpt: esc(post.description) }));
  const remote = await remoteHits(posts, term, load);
  const seen = new Set(remote.map((hit) => hit.post.url));
  return [
    ...remote,
    ...localHits(
      posts.filter((p) => !seen.has(p.url)),
      term,
    ),
  ];
}
