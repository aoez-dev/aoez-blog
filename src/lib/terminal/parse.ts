/** Turns raw input into a command. Pure: no DOM, no storage, no HTML. */
import { COMMANDS, findCommand } from "./commands";
import type { Cmd, TerminalData } from "./types";

const slashNames = () =>
  COMMANDS.filter((def) => def.prefix === "/").map((def) => def.name);

/** `/p` becomes `posts` when it is the only match. */
export function resolveSlashName(input: string): string {
  const name = input.toLowerCase();
  const names = slashNames();
  if (names.includes(name)) return name;
  const matches = names.filter((candidate) => candidate.startsWith(name));
  return name && matches.length === 1 ? matches[0] : name;
}

const bad = (raw: string, shell: boolean): Cmd => ({ kind: "bad", raw, shell });

type Prefix = "/" | "!";
const isPrefix = (char: string | undefined): char is Prefix =>
  char === "/" || char === "!";

const splitInput = (input: string) => {
  const [word, ...args] = input.slice(1).trim().split(/\s+/);
  return { word: word ?? "", args };
};
const resolveName = (prefix: Prefix, word: string) =>
  prefix === "/" ? resolveSlashName(word) : word;

export function parseCommand(raw: string, data: TerminalData): Cmd {
  const input = raw.trim();
  const prefix = input[0];
  if (!isPrefix(prefix)) return bad(input, false);
  const { word, args } = splitInput(input);
  return (
    findCommand(prefix, resolveName(prefix, word))?.parse(args, data) ??
    bad(input, prefix === "!")
  );
}
