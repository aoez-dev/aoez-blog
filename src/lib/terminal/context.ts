import type { Els, Scope } from "./dom";
import type { History } from "./history";
import type { SessionLog } from "./session";
import type { Status } from "./status";
import type { Picker, TerminalData } from "./types";

export interface State {
  busy: boolean;
  typing: boolean;
  picker: Picker | null;
  /** how often each command ran, part of the seed for deterministic output */
  counts: Record<string, number>;
}

/** Everything a terminal module needs. Built once in terminal.ts. */
export interface Ctx {
  data: TerminalData;
  reduce: boolean;
  fine: boolean;
  els: Els;
  scope: Scope;
  history: History;
  status: Status;
  state: State;
  announce(message: string): void;
  log: SessionLog;
  navigate(url: string): Promise<void>;
}
