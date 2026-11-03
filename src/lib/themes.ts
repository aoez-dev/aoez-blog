export interface Pal {
  id: string;
  name: string;
  desc: string;
  group: "dark" | "light";
  swatch: [string, string, string, string];
}

/** Order matters: the /theme picker shows each group in this order. */
export const PALS: Pal[] = [
  {
    id: "nosferatu",
    name: "Nosferatu",
    desc: "near-black violet (default)",
    group: "dark",
    swatch: ["#a98bf5", "#f06bb8", "#4fe68a", "#6fd3e6"],
  },
  {
    id: "iris",
    name: "Midnight Iris",
    desc: "cool blue-violet",
    group: "dark",
    swatch: ["#8f9bff", "#f58fc2", "#6ee7b0", "#7adcf0"],
  },
  {
    id: "ember",
    name: "Ember",
    desc: "warm amber",
    group: "dark",
    swatch: ["#f2a33c", "#e8798f", "#7fc47a", "#6fb8c4"],
  },
  {
    id: "teal",
    name: "Deep Teal",
    desc: "cold and calm",
    group: "dark",
    swatch: ["#4fd8c4", "#f08fb4", "#8ee08a", "#6fc3f0"],
  },
  {
    id: "moss",
    name: "Moss",
    desc: "quiet forest green",
    group: "dark",
    swatch: ["#9ece6a", "#e0d56a", "#6fd3a0", "#d98ae0"],
  },
  {
    id: "rosewood",
    name: "Rosewood",
    desc: "dusty rose on plum",
    group: "dark",
    swatch: ["#e07a9a", "#f0a07a", "#c58bf0", "#8ed6a0"],
  },
  {
    id: "paper",
    name: "Paper",
    desc: "soft lilac daylight",
    group: "light",
    swatch: ["#5a3fc8", "#a8226f", "#157a4a", "#0f6f8c"],
  },
  {
    id: "daylight",
    name: "Daylight",
    desc: "airy blue-violet",
    group: "light",
    swatch: ["#3a4cd0", "#b02377", "#127a58", "#0d6f9c"],
  },
  {
    id: "latte",
    name: "Latte",
    desc: "warm cream and amber",
    group: "light",
    swatch: ["#a85200", "#a8304c", "#2e7438", "#1d6d80"],
  },
  {
    id: "mint",
    name: "Mint",
    desc: "fresh teal on white",
    group: "light",
    swatch: ["#0a7f70", "#a82a66", "#1f7a38", "#136ea0"],
  },
  {
    id: "sage",
    name: "Sage",
    desc: "calm green paper",
    group: "light",
    swatch: ["#3a7010", "#a42f68", "#1f7a45", "#176a7a"],
  },
  {
    id: "blush",
    name: "Blush",
    desc: "warm rose paper",
    group: "light",
    swatch: ["#b82e57", "#cc3377", "#1f7a50", "#166e8a"],
  },
];

export const DEFAULT_PAL = "nosferatu";
export const PAL_STORAGE_KEY = "aoez-pal";
