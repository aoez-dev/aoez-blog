/** Deterministic 7-char hex id (FNV-1a) used as the fake "commit hash" in post lists */
export const shortHash = (value: string) => {
  let hash = 0x811c9dc5;
  for (const char of value) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0").slice(0, 7);
};
