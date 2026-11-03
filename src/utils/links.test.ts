import { describe, expect, it } from "vitest";
import { externalAttrs, isExternal } from "./links";

describe("external links", () => {
  it("recognises http(s) links only", () => {
    expect(isExternal("https://github.com/x")).toBe(true);
    expect(isExternal("http://example.com")).toBe(true);
    expect(isExternal("mailto:a@b.c")).toBe(false);
    expect(isExternal("/posts")).toBe(false);
  });

  it("opens external links in a new tab without leaking the opener", () => {
    expect(externalAttrs("https://x.dev")).toBe(
      ' target="_blank" rel="noopener noreferrer"',
    );
    expect(externalAttrs("/rss.xml")).toBe("");
  });
});
