# AGENTS.md

Guidance for coding agents and contributors. Keep changes small, typed and tested.

## Project

Personal blog (<https://aoez.dev>). Astro 5, TypeScript (strict), Tailwind v4, Pagefind search.
Homepage = terminal session (`src/lib/terminal/`). Everything else is a normal Astro page.
Package manager: **npm**.

## Commands

```bash
npm run dev          # dev server
npm run lint         # must pass: includes complexity limits
npm test             # unit tests (Vitest), pure logic in src/lib
npm run build        # astro check + build + pagefind
npm run format       # prettier
```

Before finishing a change: `npm run lint && npm test && npm run build`. For UI changes also click through
`/`, `/posts`, a post and `/about` in a browser (try two themes, one light).

## Code rules (enforced by ESLint)

- Cyclomatic complexity ≤ 5, ≤ 40 lines/function, ≤ 250 lines/file, depth ≤ 3, ≤ 4 params.
  If a rule fails, **extract a function or module**. Do not raise a limit or disable a rule.
- Pure logic (parsing, formatting, search, seeded random) lives apart from DOM code so it can be tested.
- No `any`, no `console`. Prefer small named functions over inline closures.
- Every value put into `innerHTML` goes through `esc()` (text) or is a trusted constant.
- Do not add dependencies without a reason in the PR description.

## Design rules

- Colours only via tokens from `src/styles/themes.css` (`var(--accent)` etc.). No hex values elsewhere.
- Every theme defines the full token set (see `src/styles/AGENTS.md`).
- Respect `prefers-reduced-motion` for every animation, CSS and JS.
- Terminal output is **deterministic**: same commands, same output (seeded RNG, no `Math.random`).
- Keep the header, breadcrumb and background stable across navigation (`transition:persist`).

## Content

Posts live in `src/data/blog/*.md`. Files starting with `_` are ignored. New posts start as drafts.
Tags are lowercase words. There are no tag pages for now.

## Decisions (why it is this way)

- **Homepage = terminal session** (Pi / Claude Code style): the blog is for nerds and shows off. Reading pages (posts, about) stay normal pages, so long posts remain readable.
- **Dark first, Nosferatu default.** 12 palettes (6 dark, 6 light) via `html[data-pal]` tokens; switching is animated (`.theming`).
- **Terminal output is deterministic** (seeded RNG): same command, same result, testable. Session log stores data, never HTML (XSS-safe).
- **Logic apart from DOM** and strict ESLint limits (complexity ≤ 5): keeps modules small and unit-testable.
- **Background is a slow, blurred gradient** ("lava lamp"), kept subtle. Header, breadcrumb and background persist across navigation.
- **No tag pages, no covers in the terminal**: the terminal lists posts as a git-log style list; covers only on `/posts`.
- **Search = Pagefind**, generated at build time (`public/pagefind` is not tracked). `/search` redirects to the terminal.
- **npm only.** Deployment is Vercel (static), so no Docker.
- **Security headers** live in `vercel.json`. The CSP is report-only first; enforce it once the console on aoez.dev is clean.
- **Large screens** are scaled with CSS `zoom` (UI is built in px). Viewport heights must be divided by `--zoom`.
- **Open:** dependency updates ([#1](https://github.com/aoez-dev/aoez-blog/issues/1)), per-post OG images in the terminal look (currently AstroPaper default), logos for AIRSYS and whicee.

## Git

Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`). Work on a feature branch and open a PR to `main`; delete the branch after merging. Do not commit or push unless asked.

## More

- Terminal internals: `src/lib/terminal/AGENTS.md`
- Styles and themes: `src/styles/AGENTS.md`
