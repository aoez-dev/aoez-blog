import { afterEach, describe, expect, it, vi } from "vitest";
import { createSessionLog, noteText, parseSession } from "./session";
import type { LogEntry } from "./types";

const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
};

afterEach(() => vi.unstubAllGlobals());

describe("parseSession", () => {
  it("rejects missing or malformed data", () => {
    expect(parseSession(null)).toBeNull();
    expect(parseSession("not json")).toBeNull();
    expect(parseSession('{"log":"x"}')).toBeNull();
  });

  it("keeps valid entries and drops invalid ones", () => {
    const text = JSON.stringify({
      log: [
        { raw: "/help" },
        { raw: 3 },
        { raw: "/x", note: { kind: "nope" } },
        { raw: "/posts", note: { kind: "nav", to: "posts" } },
      ],
      scroll: 42,
    });
    expect(parseSession(text)).toEqual({
      log: [
        { raw: "/help" },
        { raw: "/posts", note: { kind: "nav", to: "posts" } },
      ],
      scroll: 42,
    });
  });

  it("drops notes whose fields are missing or have the wrong type", () => {
    const text = JSON.stringify({
      log: [
        { raw: "/a", note: { kind: "open" } },
        { raw: "/b", note: { kind: "nav", to: 5 } },
        { raw: "/c", note: { kind: "open", file: "x.md" } },
      ],
    });
    expect(parseSession(text)?.log.map((e) => e.raw)).toEqual(["/c"]);
  });

  it("never stores html: notes render from data", () => {
    expect(noteText({ kind: "theme", name: "<b>x</b>" })).toBe(
      "Theme set to &lt;b&gt;x&lt;/b&gt;",
    );
    expect(noteText({ kind: "dismissed", what: "search" })).toBe(
      "Search dismissed",
    );
    expect(noteText({ kind: "cancelled" })).toBe("Cancelled");
  });
});

describe("createSessionLog", () => {
  it("records, persists and restores the same entries", () => {
    vi.stubGlobal("sessionStorage", memoryStorage());
    const entries: LogEntry[] = [
      { raw: "/help" },
      { raw: "!cat posts/a", note: { kind: "open", file: "a.md" } },
    ];
    const first = createSessionLog(() => 120);
    entries.forEach((entry) => first.record(entry));
    const second = createSessionLog(() => 0);
    expect(second.restore()).toEqual({ log: entries, scroll: 120 });
    expect(second.entries()).toEqual(entries);
  });

  it("forgets everything on reset", () => {
    vi.stubGlobal("sessionStorage", memoryStorage());
    const log = createSessionLog(() => 0);
    log.record({ raw: "/help" });
    log.reset();
    expect(createSessionLog(() => 0).restore()?.log).toEqual([]);
  });

  it("works without storage", () => {
    vi.stubGlobal("sessionStorage", undefined);
    const log = createSessionLog(() => 0);
    expect(() => log.record({ raw: "/help" })).not.toThrow();
    expect(log.restore()).toBeNull();
  });
});
