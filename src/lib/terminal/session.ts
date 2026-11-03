/** The session log: what the visitor ran, persisted for the round trip to a post and back. */
import { esc } from "./text";
import type { LogEntry, Note, NoteKind } from "./types";

const KEY = "aoez-session";

type NoteOf<K extends NoteKind> = Extract<Note, { kind: K }>;

/** The text of a note. This table is also the list of valid note kinds. */
const NOTE_TEXT: { [K in NoteKind]: (note: NoteOf<K>) => string } = {
  open: (n) =>
    `Opening <b style="color:var(--fg);font-weight:500">${esc(n.file)}</b>`,
  nav: (n) => `Opening /${esc(String(n.to))}`,
  theme: (n) => `Theme set to ${esc(n.name)}`,
  dismissed: (n) =>
    n.what === "theme" ? "Theme dialog dismissed" : "Search dismissed",
  cancelled: () => "Cancelled",
};

export const noteText = (note: Note): string =>
  (NOTE_TEXT[note.kind] as (n: Note) => string)(note);
export const noteHtml = (note: Note): string =>
  `<div class="rs">${noteText(note)}</div>`;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
/** The string fields each note kind needs; anything else is dropped when a session is loaded. */
const NOTE_FIELDS: Record<NoteKind, string[]> = {
  open: ["file"],
  nav: ["to"],
  theme: ["name"],
  dismissed: ["what"],
  cancelled: [],
};
const isNote = (v: unknown): v is Note =>
  isObject(v) &&
  typeof v.kind === "string" &&
  v.kind in NOTE_FIELDS &&
  NOTE_FIELDS[v.kind as NoteKind].every((key) => typeof v[key] === "string");
const isEntry = (v: unknown): v is LogEntry =>
  isObject(v) &&
  typeof v.raw === "string" &&
  (v.note === undefined || isNote(v.note));

export interface Session {
  log: LogEntry[];
  scroll: number;
}

function readSession(value: unknown): Session | null {
  if (!isObject(value) || !Array.isArray(value.log)) return null;
  const scroll = typeof value.scroll === "number" ? value.scroll : 0;
  return { log: value.log.filter(isEntry), scroll };
}

export function parseSession(text: string | null): Session | null {
  try {
    return readSession(JSON.parse(text ?? "null"));
  } catch {
    return null;
  }
}

export interface SessionLog {
  record(entry: LogEntry): void;
  reset(): void;
  entries(): LogEntry[];
  /** Loads the stored session; the loaded entries become the log. */
  restore(): Session | null;
  persist(): void;
}

/** Owns the entries and their persistence. `getScroll` is read whenever it is saved. */
export function createSessionLog(getScroll: () => number): SessionLog {
  let log: LogEntry[] = [];
  const persist = () => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ log, scroll: getScroll() }));
    } catch {
      /* private mode: the session just does not persist */
    }
  };
  return {
    record(entry) {
      log.push(entry);
      persist();
    },
    reset() {
      log = [];
      persist();
    },
    entries: () => log,
    restore() {
      let saved: Session | null = null;
      try {
        saved = parseSession(sessionStorage.getItem(KEY));
      } catch {
        saved = null;
      }
      log = saved?.log ?? [];
      return saved;
    },
    persist,
  };
}
