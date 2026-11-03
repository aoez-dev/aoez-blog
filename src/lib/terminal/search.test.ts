import { afterEach, describe, expect, it, vi } from "vitest";
import { searchPosts, type PagefindApi } from "./search";
import { fixture } from "./testData";

afterEach(() => vi.unstubAllGlobals());
const posts = fixture.posts;
const none = async () => null;

describe("searchPosts", () => {
  it("lists every post for an empty query", async () => {
    expect(await searchPosts(posts, "  ", none)).toHaveLength(posts.length);
  });

  it("falls back to local scoring without pagefind, title matches first", async () => {
    const hits = await searchPosts(posts, "agent", none);
    expect(hits[0].post.name).toBe("agent-loops");
    expect(hits[0].excerpt).toContain("<mark>");
  });

  it("finds words in the body and returns nothing for gibberish", async () => {
    expect(
      (await searchPosts(posts, "pagefind", none)).map((h) => h.post.name),
    ).toEqual(["astro-notes"]);
    expect(await searchPosts(posts, "qqqzzz", none)).toEqual([]);
  });

  it("uses pagefind results first and strips everything but <mark> from excerpts", async () => {
    vi.stubGlobal("location", { origin: "https://example.test" });
    const api: PagefindApi = {
      search: async () => ({
        results: [
          {
            data: async () => ({
              url: "/posts/evals-fast/",
              excerpt: "<mark>evals</mark> <img src=x onerror=alert(1)> here",
            }),
          },
        ],
      }),
    };
    const hits = await searchPosts(posts, "evals", async () => api);
    expect(hits[0].post.name).toBe("evals-fast");
    expect(hits[0].excerpt).toBe(
      "<mark>evals</mark> &lt;img src=x onerror=alert(1)> here",
    );
    expect(hits[0].excerpt).not.toContain("<img");
  });

  it("survives a failing pagefind", async () => {
    const broken: PagefindApi = {
      search: async () => Promise.reject(new Error("offline")),
    };
    expect(
      (await searchPosts(posts, "agent", async () => broken))[0].post.name,
    ).toBe("agent-loops");
  });
});
