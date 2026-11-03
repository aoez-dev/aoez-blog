# src/styles

## Files

- `global.css`: entry point. Tailwind import, `@theme` mapping, base reset, `.sr-only`, background blobs, site header, the single reduced-motion block.
- `themes.css`: the 12 palettes (`html[data-pal=...]`, nosferatu is `:root`), layout/radius/traffic-light tokens, Shiki variable mapping, `.theming` fade.
- `terminal.css`: terminal window, prompt box, picker, keyboard hints.
- `pages.css`: page layouts (home, about, posts, outline, ...).
- `typography.css`: article prose and code blocks.

## Rules

- Colours come only from tokens (`var(--accent)` etc.). No hex values outside `themes.css`.
- Radii use `--r-sm/--r-md/--r-lg`, header height uses `--header-h`.
- Exactly one `prefers-reduced-motion` block, in `global.css`. Extend it, never add another.
- No `backdrop-filter`/`filter: blur` on large fixed layers (perf).

## Tokens every theme must define

- `--bg --surface --line`: backgrounds and borders
- `--fg --dim --cmt`: text, secondary text, tertiary text
- `--accent --ink`: main highlight and the text colour on top of it
- `--pink --green --cyan --orange --yellow --red`: secondary highlights (code, status)
- `--g1 --g2 --g3`: banner / background gradient stops
- `--comp`: complementary colour for `$` prompts
- `--shd`: shadow colour
- light themes also set `color-scheme: light`

## Add a theme

1. Add an `html[data-pal="name"]` block in `themes.css` with all tokens above.
2. Add an entry to `PALS` in `src/lib/themes.ts` (id, label, dark/light, swatch colours).
3. Update the dark/light list in the top comment of `themes.css`.

## Contrast (WCAG, check every palette)

- `--cmt` >= 4.5:1 on `--bg` and on `--surface`, and clearly dimmer than `--dim`
- `--dim` >= 7:1 on `--bg`
- `--accent` >= 4.5:1 on `--bg`; `--ink` on `--accent` >= 4.5:1
