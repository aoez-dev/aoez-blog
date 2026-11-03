export const SITE = {
  website: "https://aoez.dev/",
  author: "Aykut Özdemir",
  profile: "",
  desc: "Practical notes on AI, LLMs and software development by Aykut Özdemir.",
  title: "aoez.dev",
  ogImage: "astropaper-og.jpg",
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "Europe/Berlin",
} as const;

export const HERO = {
  name: "Aykut Özdemir",
  tagline: "AI tinkerer. Dev.",
  bio: "I build with LLMs and agents, and write down what actually worked. Code you can copy, opinions you can argue with.",
  stack: "TypeScript · Python · Astro",
  focus: "LLMs, agents, dev tooling",
} as const;
