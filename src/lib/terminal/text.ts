export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const esc = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escapeRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const queryWords = (query: string) =>
  query.trim().split(/\s+/).filter(Boolean);

/** Escape `text` and wrap every query word in <mark>. Matches the raw text, then escapes each piece. */
export function highlight(text: string, query: string): string {
  const words = queryWords(query);
  if (!words.length) return esc(text);
  const pattern = new RegExp(`(${words.map(escapeRegex).join("|")})`, "ig");
  return text
    .split(pattern)
    .map((part, i) => (i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)))
    .join("");
}

const DAY = 86400000;

/** [exclusive upper bound in days, label] */
const AGO_RULES: [number, (days: number) => string][] = [
  [1, () => "today"],
  [14, (days) => `${days} day${days === 1 ? "" : "s"} ago`],
  [60, (days) => `${Math.round(days / 7)} weeks ago`],
  [Infinity, (days) => `${Math.round(days / 30)} months ago`],
];

/** "9 days ago", "3 weeks ago", "2 months ago" */
export function ago(iso: string, now = Date.now()): string {
  const days = Math.max(0, Math.round((now - new Date(iso).getTime()) / DAY));
  const rule =
    AGO_RULES.find(([limit]) => days < limit) ??
    AGO_RULES[AGO_RULES.length - 1];
  return rule[1](days);
}

export const stripTags = (html: string) => html.replace(/<[^>]+>/g, "");
