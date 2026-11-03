# aoez.dev

Personal blog by Aykut Özdemir about AI, LLMs and software development.
The homepage is an interactive terminal session. Posts and the CV are normal pages.

Built with [Astro](https://astro.build), TypeScript and Tailwind CSS v4. Based on the AstroPaper theme, since rebuilt.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

| Command                  | What it does                               |
| ------------------------ | ------------------------------------------ |
| `npm run dev`            | Dev server                                 |
| `npm run build`          | Type-check, build, search index (Pagefind) |
| `npm run preview`        | Serve the production build                 |
| `npm run lint`           | ESLint incl. complexity limits (see below) |
| `npm test`               | Unit tests (Vitest) for the terminal logic |
| `npm run format`         | Prettier                                   |
| `npm run new -- "Title"` | Scaffold a post (starts as `draft: true`)  |

## Write a post

`npm run new -- "My title"` creates `src/data/blog/my-title.md`. Frontmatter:
`title`, `description`, `pubDatetime`, `tags`; optional `cover` (image) and `coverAlt`.
Posts without a cover get generated art. Remove `draft: true` to publish.
With no posts the site shows a "No posts yet" state.

## How it is organised

```
src/
  pages/        routes: / (terminal), /posts, /posts/<post>, /about, 404, rss, og images
  layouts/      Layout (head, theme, header), PostDetails
  components/   SiteHeader, TerminalSession, PostCard, GeneratedCover
  lib/terminal/ the terminal: pure logic + small DOM modules
  scripts/      site-wide client script (breadcrumb, outline, progress)
  styles/       themes.css (12 palettes), global, terminal, pages, typography
  data/         blog posts (markdown) and cv.ts
```

Details for contributors and coding agents: [AGENTS.md](AGENTS.md).

## Themes

12 palettes (6 dark, 6 light) switched with `/theme` in the terminal; the choice is stored in
`localStorage`. Add one by following [src/styles/AGENTS.md](src/styles/AGENTS.md).

## Quality gates

ESLint enforces: cyclomatic complexity ≤ 5, ≤ 40 lines per function, ≤ 250 lines per file,
nesting depth ≤ 3, ≤ 4 parameters. Split code instead of raising a limit.

## Deploy

Pushes to `main` deploy to <https://aoez.dev> on Vercel.

## License

MIT, see [LICENSE](LICENSE).
