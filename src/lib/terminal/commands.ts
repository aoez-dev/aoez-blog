/**
 * The command registry: the one place where a command is defined.
 * Parsing, /help, Tab completion and the thinking verbs are all derived from it.
 * To add a command: add one entry here (and its output in render.ts if it prints something).
 */
import type { Cmd, TerminalData, TPost } from "./types";

export interface HelpRow {
  syntax: string;
  text: string;
}

export interface CommandDef {
  kind: Cmd["kind"];
  prefix: "/" | "!";
  name: string;
  help: HelpRow[];
  /** Spinner wording while the command "thinks"; one is picked deterministically. */
  verbs: string[];
  completions(posts: TPost[]): string[];
  parse(args: string[], data: TerminalData): Cmd | null;
}

const VERBS = {
  help: ["Dusting off the manual", "Unfolding the cheat sheet"],
  whoami: ["Looking in the mirror", "Checking my reflection"],
  nav: ["Warming up the page", "Fetching the good stuff"],
  ls: ["Listing the usual suspects", "Counting files"],
  grep: ["Grepping the archives", "Squinting at logs"],
  bad: ["Pretending to understand", "Consulting the rubber duck"],
};
export const BAD_VERBS = VERBS.bad;

interface SlashSpec {
  name: string;
  kind: Cmd["kind"];
  text: string;
  verbs: string[];
  parse: CommandDef["parse"];
}

const slash = ({ name, kind, text, verbs, parse }: SlashSpec): CommandDef => ({
  kind,
  prefix: "/",
  name,
  help: [{ syntax: `/${name}`, text }],
  verbs,
  completions: () => [`/${name}`],
  parse,
});

const lsDef: CommandDef = {
  kind: "ls",
  prefix: "!",
  name: "ls",
  help: [
    { syntax: "!ls posts/", text: "commit-style list" },
    { syntax: "!ls posts/ -l", text: "with summaries" },
  ],
  verbs: VERBS.ls,
  completions: () => ["!ls posts/", "!ls posts/ -l"],
  parse: (args) =>
    args[0] === "posts/"
      ? { kind: "ls", long: args.slice(1).join(" ").includes("-l") }
      : null,
};

const grepDef: CommandDef = {
  kind: "grep",
  prefix: "!",
  name: "grep",
  help: [{ syntax: "!grep <term> posts/", text: "search the text" }],
  verbs: VERBS.grep,
  completions: (posts) => [`!grep ${posts[0]?.tags[0] ?? "agents"} posts/`],
  parse: (args) => {
    const term = args.filter((arg) => arg !== "posts/").join(" ");
    return term ? { kind: "grep", term } : null;
  },
};

const catDef: CommandDef = {
  kind: "cat",
  prefix: "!",
  name: "cat",
  help: [{ syntax: "!cat posts/<name>", text: "open a post" }],
  verbs: VERBS.ls,
  completions: (posts) => (posts[0] ? [`!cat posts/${posts[0].name}`] : []),
  parse: (args, data) => {
    if (!args[0]) return null;
    const name = args[0].replace(/^posts\//, "").replace(/\.md$/, "");
    const post =
      data.posts.find((p) => p.name === name || p.slug === name) ?? null;
    return { kind: "cat", name: args[0], post };
  },
};

export const COMMANDS: CommandDef[] = [
  slash({
    name: "help",
    kind: "help",
    text: "show this list",
    verbs: VERBS.help,
    parse: () => ({ kind: "help" }),
  }),
  slash({
    name: "whoami",
    kind: "whoami",
    text: "who is Aykut",
    verbs: VERBS.whoami,
    parse: () => ({ kind: "whoami" }),
  }),
  slash({
    name: "posts",
    kind: "nav",
    text: "open the posts page (with covers)",
    verbs: VERBS.nav,
    parse: () => ({ kind: "nav", to: "posts" }),
  }),
  slash({
    name: "about",
    kind: "nav",
    text: "open the about page",
    verbs: VERBS.nav,
    parse: () => ({ kind: "nav", to: "about" }),
  }),
  slash({
    name: "search",
    kind: "picker",
    text: "find anything, live preview",
    verbs: VERBS.nav,
    parse: (args) => ({ kind: "picker", name: "search", arg: args.join(" ") }),
  }),
  slash({
    name: "theme",
    kind: "picker",
    text: "pick a colour theme",
    verbs: VERBS.nav,
    parse: () => ({ kind: "picker", name: "theme", arg: "" }),
  }),
  slash({
    name: "clear",
    kind: "clear",
    text: "clear the screen",
    verbs: VERBS.nav,
    parse: () => ({ kind: "clear" }),
  }),
  lsDef,
  grepDef,
  catDef,
];

export const findCommand = (prefix: "/" | "!", name: string) =>
  COMMANDS.find((def) => def.prefix === prefix && def.name === name);

export const verbsFor = (kind: Cmd["kind"]): string[] =>
  COMMANDS.find((def) => def.kind === kind)?.verbs ?? BAD_VERBS;
