/** http(s) links leave the site; they open in a new tab. mailto: and site paths do not. */
export const isExternal = (href: string): boolean => /^https?:\/\//i.test(href);

/** `target` and `rel` for an external link, as an attribute string for HTML templates. */
export const externalAttrs = (href: string): string =>
  isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
