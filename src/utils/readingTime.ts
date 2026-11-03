const WORDS_PER_MINUTE = 200;

export const readingTime = (body: string | undefined) => {
  const words = (body ?? "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};
