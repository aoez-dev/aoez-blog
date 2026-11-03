import { describe, expect, it } from "vitest";
import { COMMANDS } from "./commands";
import { renderCommits, renderHelp } from "./render";
import { fixture } from "./testData";
import { highlight } from "./text";

describe("renderHelp", () => {
  it("fills a prefix without a placeholder when a row with <...> is clicked", () => {
    const fills = [...renderHelp().matchAll(/data-fill="([^"]*)"/g)].map(
      (m) => m[1],
    );
    const rows = COMMANDS.flatMap((def) => def.help).filter((row) =>
      row.syntax.includes("<"),
    );
    expect(fills).toHaveLength(rows.length);
    for (const fill of fills) expect(fill).not.toMatch(/[<>]|&lt;|&gt;/);
    expect(fills).toContain("!cat posts/");
    expect(fills).toContain("!grep ");
  });
});

describe("renderCommits", () => {
  it("does not print an empty decoration for a post without tags", () => {
    const posts = fixture.posts.map((p) => ({ ...p, tags: [] }));
    const html = renderCommits(posts, false);
    expect(html).not.toContain("()");
    expect(html).not.toContain(", )");
  });
});

describe("highlight", () => {
  it("marks words in the raw text, so entities stay intact", () => {
    expect(highlight("Q&A about amp", "amp")).toBe(
      "Q&amp;A about <mark>amp</mark>",
    );
  });

  it("escapes everything else", () => {
    expect(highlight("<b>x</b>", "x")).toBe(
      "&lt;b&gt;<mark>x</mark>&lt;/b&gt;",
    );
  });
});

describe("renderCommits without posts", () => {
  it("prints a plain message instead of an empty list", () => {
    expect(renderCommits([], false)).toContain("no posts yet");
  });
});
