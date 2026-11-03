export interface TPost {
  /** last path segment of the post url */
  slug: string;
  /** file name without extension, used by `!cat posts/<name>` */
  name: string;
  /** file name with extension */
  file: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  /** ISO date */
  date: string;
  /** "Oct 24" */
  dateLabel: string;
  minutes: number;
  hash: string;
  /** plain text, used by grep and search */
  body: string;
}

export interface TerminalData {
  site: {
    name: string;
    tagline: string;
    bio: string;
    socials: { name: string; href: string }[];
  };
  posts: TPost[];
}

export type PickerName = "theme" | "search";
export type NavTarget = "posts" | "about";

/**
 * What a command does, as plain data. Parsed from the raw input (parse.ts),
 * defined once per command in commands.ts, rendered later (render.ts).
 */
export type Cmd =
  | { kind: "help" }
  | { kind: "whoami" }
  | { kind: "ls"; long: boolean }
  | { kind: "grep"; term: string }
  | { kind: "cat"; name: string; post: TPost | null }
  | { kind: "nav"; to: NavTarget }
  | { kind: "picker"; name: PickerName; arg: string }
  | { kind: "clear" }
  | { kind: "bad"; raw: string; shell: boolean };

/** Result lines that cannot be recomputed from the command alone. Stored as data, never as HTML. */
export interface NoteData {
  open: { file: string };
  nav: { to: NavTarget };
  theme: { name: string };
  dismissed: { what: PickerName };
  cancelled: Record<never, never>;
}
export type NoteKind = keyof NoteData;
export type Note = { [K in NoteKind]: { kind: K } & NoteData[K] }[NoteKind];

export interface LogEntry {
  raw: string;
  note?: Note;
}

export interface Hit {
  post: TPost;
  /** html: escaped text plus <mark> tags */
  excerpt: string;
}

/** The input bar is replaced by a picker while one is open. */
export interface Picker {
  name: PickerName;
  /** returns true when the key was used (the router then prevents the default) */
  handleKey(e: KeyboardEvent): boolean;
  click(target: Element): void;
  hover(target: Element): void;
  cancel(): void;
}
