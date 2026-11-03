/** Tab completion state machine. Pure; the command strings come from the registry. */
import { COMMANDS } from "./commands";
import type { TPost } from "./types";

export interface TabState {
  on: boolean;
  list: string[];
  index: number;
}

export const IDLE_TAB: TabState = { on: false, list: [], index: 0 };

export const commandList = (posts: TPost[]): string[] =>
  COMMANDS.flatMap((def) => def.completions(posts));

/** Candidates for `stem`. An empty stem starts at `current` (the example the placeholder shows). */
function candidates(all: string[], stem: string, current: string): string[] {
  if (stem) return all.filter((command) => command.startsWith(stem));
  const k = Math.max(0, all.indexOf(current));
  return [...all.slice(k), ...all.slice(0, k)];
}

export function startTab(
  all: string[],
  stem: string,
  current: string,
  back: boolean,
): TabState {
  const list = candidates(all, stem, current);
  if (!list.length) return IDLE_TAB;
  const skipSelf = list[0] === stem && list.length > 1;
  return { on: true, list, index: back ? list.length - 1 : Number(skipSelf) };
}

export function stepTab(tab: TabState, back: boolean): TabState {
  const n = tab.list.length;
  return { ...tab, index: (tab.index + (back ? -1 : 1) + n) % n };
}

export const tabValue = (tab: TabState) => tab.list[tab.index] ?? "";
