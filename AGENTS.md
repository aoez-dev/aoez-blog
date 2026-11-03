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

## Git

Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`). Do not commit or push unless asked.

## More

- Terminal internals: `src/lib/terminal/AGENTS.md`
- Styles and themes: `src/styles/AGENTS.md`
