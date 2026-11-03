export type Dispose = () => void;

export const noop: Dispose = () => {};

export const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
