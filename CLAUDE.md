# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a personal blog for publishing tech-related articles, particularly about AI, LLMs, and tech topics. Built on the AstroPaper Astro theme template. The site is deployed to https://aoez.dev via Vercel with automatic deployments triggered on every push to the main branch.

## Commands

All commands use `pnpm` as the package manager:

```bash
# Development
pnpm install              # Install dependencies
pnpm run dev              # Start dev server at localhost:4321
pnpm run preview          # Preview production build locally

# Building
pnpm run build            # Type-check, build, generate search index, copy pagefind
                          # This runs: astro check && astro build && pagefind --site dist && cp -r dist/pagefind public/

# Code Quality
pnpm run format:check     # Check code formatting with Prettier
pnpm run format           # Format code with Prettier
pnpm run lint             # Lint with ESLint (no-console rule enforced)
pnpm run sync             # Generate TypeScript types for Astro modules

# Docker (alternative)
docker build -t astropaper .
docker run -p 4321:80 astropaper
```

## Deployment

The site is deployed on **Vercel**:
- Production URL: https://aoez.dev
- Automatic deployments triggered on push to `main` branch
- GitHub repository is synced with Vercel

## Architecture

### Content Management

**Blog posts** are stored as markdown files in `src/data/blog/`. The content collection is defined in [src/content.config.ts](src/content.config.ts) with a schema that includes:
- Standard frontmatter: `title`, `description`, `pubDatetime`, `modDatetime`, `author`, `tags`
- Optional fields: `featured`, `draft`, `ogImage`, `canonicalURL`, `hideEditPost`, `timezone`
- Posts starting with `_` are ignored by the glob loader pattern

**Post filtering**: Draft posts are filtered based on `SITE.scheduledPostMargin` (15 minutes) to handle scheduled publishing.

### Routing Structure

- `/` - Homepage showing recent posts (configured by `SITE.postPerIndex`)
- `/posts/[...page]` - Paginated post listing (configured by `SITE.postPerPage`)
- `/posts/[...slug]/` - Individual post pages with dynamic routes
- `/tags/[tag]/[...page]` - Tag-filtered post listings
- `/archives/` - Archives page (shown if `SITE.showArchives` is true)
- `/search` - Client-side search using Pagefind
- `/about` - About page (markdown)
- `/rss.xml` - RSS feed
- `/robots.txt` - Generated robots.txt
- `/og.png` - Site OG image endpoint

### Dynamic OG Images

The blog generates dynamic Open Graph images using Satori and @resvg/resvg-js:
- Site OG image: `/og.png` endpoint
- Post OG images: Generated at build time for each post (if `SITE.dynamicOgImage` is true)
- Templates are in `src/utils/og-templates/`
- Generation logic in [src/utils/generateOgImages.ts](src/utils/generateOgImages.ts)

### Key Configuration

**[src/config.ts](src/config.ts)** - Main site configuration:
- `SITE.website` - Base URL (https://aoez.dev/)
- `SITE.author` - Default author name (Aykut Özdemir)
- `SITE.postPerIndex` / `postPerPage` - Pagination settings (both set to 4)
- `SITE.lightAndDarkMode` - Theme toggle
- `SITE.dynamicOgImage` - Enable/disable dynamic OG images
- `SITE.editPost` - GitHub edit links configuration
- `SITE.timezone` - Timezone for date handling (Europe/Berlin)

**[src/constants.ts](src/constants.ts)** - Social links and share buttons:
- `SOCIALS` - Header/footer social links (GitHub, LinkedIn, Mail)
- `SHARE_LINKS` - Post share buttons (WhatsApp, Facebook, X, Telegram, Mail)

### Utilities

**Post utilities** (in `src/utils/`):
- `getSortedPosts.ts` - Sort posts by date
- `getPostsByTag.ts` - Filter posts by tag
- `getPostsByGroupCondition.ts` - Group posts by condition
- `getUniqueTags.ts` - Extract unique tags
- `postFilter.ts` - Filter logic for draft/scheduled posts
- `slugify.ts` - URL slug generation
- `getPath.ts` - Path generation helpers

**OG image utilities**:
- `generateOgImages.ts` - Main OG image generation
- `loadGoogleFont.ts` - Load fonts for OG images
- `transformers/fileName.ts` - Custom Shiki transformer for filenames

### Markdown Processing

Configured in [astro.config.ts](astro.config.ts):
- **Remark plugins**: `remark-toc`, `remark-collapse` (for collapsible TOC)
- **Shiki syntax highlighting**:
  - Light theme: `min-light`
  - Dark theme: `night-owl`
  - Custom transformers: notation diff, highlighting, word highlighting, filename display

### Search

Uses **Pagefind** for static search:
- Search index is generated during build with `pagefind --site dist`
- Index is copied to `public/pagefind/` for deployment
- Search UI is in [src/pages/search.astro](src/pages/search.astro)
- Uses `@pagefind/default-ui` component

### Styling

- **TailwindCSS v4** with Vite plugin
- **@tailwindcss/typography** for markdown content styling
- Custom styles in `src/styles/`
- Light/dark mode support via Tailwind

### TypeScript

- Path aliases: `@/*` maps to `./src/*`
- Strict configuration extending `astro/tsconfigs/strict`
- JSX configured for React (used in Satori for OG images)

## Important Notes

- The build command includes type-checking (`astro check`) - the build will fail on type errors
- ESLint enforces `no-console` rule - use proper logging if needed
- Post filenames starting with `_` are ignored (useful for drafts/WIP)
- The `public/pagefind/` directory is copied from `dist/pagefind/` during build
- Edit post URLs point to the original AstroPaper repo by default - update in `SITE.editPost.url` if needed
- Google Site Verification can be added via `PUBLIC_GOOGLE_SITE_VERIFICATION` environment variable

## Environment Variables

Optional variables in `.env`:
```bash
PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```
