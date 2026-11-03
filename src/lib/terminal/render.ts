/** HTML for command output. Every dynamic value goes through esc() or highlight(). */
import { COMMANDS, type HelpRow } from "./commands";
import { externalAttrs } from "@/utils/links";
import { ago, esc, highlight } from "./text";
import type { Cmd, TerminalData, TPost } from "./types";

function helpRow({ syntax, text }: HelpRow): string {
  const label = `<b>${esc(syntax)}</b><span>${esc(text)}</span>`;
  if (!syntax.includes("<")) {
    return `<button type="button" data-run="${esc(syntax)}">${label}</button>`;
  }
  const stem = syntax.slice(0, syntax.indexOf("<")); // "!grep " or "!cat posts/"
  return `<button type="button" data-fill="${esc(stem)}">${label}</button>`;
}

const helpGroup = (prefix: "/" | "!") =>
  `<div class="hl">${COMMANDS.filter((def) => def.prefix === prefix)
    .flatMap((def) => def.help)
    .map(helpRow)
    .join("")}</div>`;

export function renderHelp(): string {
  return [
    `<div class="rs" style="margin-bottom:6px">Commands</div>`,
    helpGroup("/"),
    `<div class="sec">Shell</div>`,
    helpGroup("!"),
    `<div class="sec"><b>tab</b> cycles commands · <b>shift+tab</b> goes back · <b>esc</b> clears the line, a second <b>esc</b> leaves the prompt</div>`,
  ].join("");
}

export function renderWhoami(site: TerminalData["site"]): string {
  const links = [
    ...site.socials.map((s) => ({ name: s.name.toLowerCase(), href: s.href })),
    { name: "rss", href: "/rss.xml" },
  ];
  const anchors = links
    .map(
      (l) =>
        `<a href="${esc(l.href)}"${externalAttrs(l.href)}>${esc(l.name)}</a>`,
    )
    .join("");
  return `<div class="wh"><h2>${esc(site.name)}<span>${esc(site.tagline)}</span></h2><p>${esc(site.bio)}</p><div class="soc">${anchors}</div></div>`;
}

const decoration = (post: TPost, index: number) => {
  const head = index === 0 ? ["<em>HEAD</em> -&gt; <u>main</u>"] : [];
  const parts = [...head, ...post.tags.map((tag) => `tag: ${esc(tag)}`)];
  return parts.length ? `(${parts.join(", ")})` : "";
};

function commitRow(post: TPost, index: number, long: boolean): string {
  const meta = long
    ? `${esc(post.dateLabel)} · ${post.minutes}m`
    : ago(post.date);
  const row = `<a class="cmr" href="${esc(post.url)}"><span class="g">*</span><span class="h">${post.hash}</span><span class="msg"><span class="dec">${decoration(post, index)}</span> <span class="ttl">${esc(post.title)}</span></span><span class="mt">${meta}</span></a>`;
  if (!long) return row;
  return `${row}<div class="cmb"><span class="g">|</span><span></span><span class="bd">${esc(post.description)}</span><span></span></div>`;
}

export const renderCommits = (posts: TPost[], long: boolean): string =>
  posts.length === 0
    ? `<div class="rs">ls: posts/: no posts yet</div>`
    : `<div class="cm">${posts.map((post, i) => commitRow(post, i, long)).join("")}</div>`;

const sentences = (post: TPost) =>
  `${post.body} ${post.description}`.split(/(?<=\.)\s+/);

function grepRows(posts: TPost[], term: string): string[] {
  const needle = term.toLowerCase();
  return posts.flatMap((post) =>
    sentences(post)
      .map((text, k) => ({ text, line: k + 1 }))
      .filter(({ text }) => text.toLowerCase().includes(needle))
      .map(
        ({ text, line }) =>
          `<a href="${esc(post.url)}"><b>${esc(post.file)}</b>:<i>${line}</i>: ${highlight(text, term)}</a>`,
      ),
  );
}

export function renderGrep(posts: TPost[], term: string): string {
  const rows = grepRows(posts, term);
  if (!rows.length)
    return `<div class="rs">grep: no matches for '${esc(term)}'</div>`;
  return `<div class="grep">${rows.slice(0, 40).join("")}</div>`;
}

export const renderNoFile = (name: string) =>
  `<div class="rs">cat: ${esc(name)}: No such file</div>`;

export const renderBad = (raw: string, shell: boolean) =>
  `<div class="rs">${shell ? "zsh" : "command"} not found: <b style="color:var(--fg)">${esc(raw.split(/\s+/)[0])}</b> · try /help</div>`;

const ECHO_CLASS: Record<string, string> = { "/": "sl", "!": "sh" };

/** The echoed command line: the first word is coloured by kind (/slash or !shell). */
export function renderEcho(raw: string): string {
  const [first, ...rest] = raw.split(/(\s+)/);
  const cls = ECHO_CLASS[raw[0]] ?? "";
  return `<span class="pr">›</span><span><span class="${cls}">${esc(first)}</span>${esc(rest.join(""))}</span>`;
}

type OutputRenderers = {
  [K in Cmd["kind"]]?: (
    cmd: Extract<Cmd, { kind: K }>,
    data: TerminalData,
  ) => string;
};

const OUTPUT: OutputRenderers = {
  help: () => renderHelp(),
  whoami: (_cmd, data) => renderWhoami(data.site),
  ls: (cmd, data) => renderCommits(data.posts, cmd.long),
  grep: (cmd, data) => renderGrep(data.posts, cmd.term),
  cat: (cmd) => renderNoFile(cmd.name),
  bad: (cmd) => renderBad(cmd.raw, cmd.shell),
};

/** True when the command prints a result (an opening `cat` prints nothing, it navigates). */
export const hasOutput = (cmd: Cmd): boolean =>
  cmd.kind in OUTPUT && !(cmd.kind === "cat" && cmd.post);

export const renderOutput = (cmd: Cmd, data: TerminalData): string =>
  (OUTPUT[cmd.kind] as ((c: Cmd, d: TerminalData) => string) | undefined)?.(
    cmd,
    data,
  ) ?? "";
