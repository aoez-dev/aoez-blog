export interface CrumbItem {
  label: string;
  href?: string;
}

export const isCrumbItems = (value: unknown): value is CrumbItem[] =>
  Array.isArray(value) &&
  value.every(
    (v) =>
      typeof v === "object" &&
      v !== null &&
      typeof (v as CrumbItem).label === "string" &&
      (!("href" in v) || typeof (v as CrumbItem).href === "string"),
  );

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

const renderLabel = (item: CrumbItem, root: boolean) =>
  root ? "<i>~/</i>aoez<b>.dev</b>" : esc(item.label);

const renderLink = (item: CrumbItem, href: string, root: boolean) => {
  const title = root ? ' title="Back to the terminal"' : "";
  return `<a class="${root ? "root" : "seg"}" href="${esc(href)}"${title}>${renderLabel(item, root)}</a>`;
};

const renderCurrent = (item: CrumbItem, root: boolean) =>
  `<span class="cur${root ? " root" : ""}">${renderLabel(item, root)}</span>`;

const renderItem = (item: CrumbItem, i: number) => {
  const root = i === 0;
  const sep = root ? "" : `<span class="sep">/</span>`;
  const href = item.href;
  const body =
    href?.startsWith("/") && !href.startsWith("//")
      ? renderLink(item, href, root)
      : renderCurrent(item, root);
  return sep + body;
};

/** `~/aoez.dev/posts/name.md` as markup. The first item is the site root. */
export const renderCrumb = (items: CrumbItem[]) =>
  items.map(renderItem).join("");
