import { describe, expect, it } from "vitest";
import { commandList } from "./completion";
import { COMMANDS } from "./commands";
import { parseCommand, resolveSlashName } from "./parse";
import { renderHelp } from "./render";
import { fixture } from "./testData";

const parse = (raw: string) => parseCommand(raw, fixture);

describe("command registry", () => {
  it("has unique names per prefix", () => {
    const keys = COMMANDS.map((def) => `${def.prefix}${def.name}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gives every command help rows and thinking verbs", () => {
    for (const def of COMMANDS) {
      expect(def.help.length).toBeGreaterThan(0);
      expect(def.verbs.length).toBeGreaterThan(0);
    }
  });

  it("completes only to commands that parse", () => {
    for (const command of commandList(fixture.posts)) {
      expect(parse(command).kind, command).not.toBe("bad");
    }
  });

  it("parses every help row that is not a placeholder", () => {
    const rows = COMMANDS.flatMap((def) => def.help).filter(
      (row) => !row.syntax.includes("<"),
    );
    for (const row of rows)
      expect(parse(row.syntax).kind, row.syntax).not.toBe("bad");
  });

  it("lists every registered syntax in /help", () => {
    const html = renderHelp();
    for (const row of COMMANDS.flatMap((def) => def.help)) {
      expect(html).toContain(
        row.syntax.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
      );
    }
  });
});

describe("parseCommand", () => {
  it("resolves unique slash prefixes", () => {
    expect(resolveSlashName("p")).toBe("posts");
    expect(resolveSlashName("th")).toBe("theme");
    expect(resolveSlashName("zzz")).toBe("zzz");
  });

  it("treats unknown input as a bad command", () => {
    expect(parse("hello")).toMatchObject({ kind: "bad", shell: false });
    expect(parse("!rm -rf /")).toMatchObject({ kind: "bad", shell: true });
    expect(parse("/nope")).toMatchObject({ kind: "bad" });
  });

  it("opens a post by file name or slug, and reports a missing one", () => {
    expect(parse("!cat posts/agent-loops")).toMatchObject({
      kind: "cat",
      post: { name: "agent-loops" },
    });
    expect(parse("!cat posts/agent-loops.md")).toMatchObject({
      kind: "cat",
      post: { name: "agent-loops" },
    });
    expect(parse("!cat posts/missing")).toMatchObject({
      kind: "cat",
      post: null,
    });
  });

  it("parses the shell options", () => {
    expect(parse("!ls posts/")).toEqual({ kind: "ls", long: false });
    expect(parse("!ls posts/ -l")).toEqual({ kind: "ls", long: true });
    expect(parse("!grep retries posts/")).toEqual({
      kind: "grep",
      term: "retries",
    });
    expect(parse("/search agents")).toEqual({
      kind: "picker",
      name: "search",
      arg: "agents",
    });
  });
});
