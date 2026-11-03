# Terminal internals

The homepage is a command-driven terminal. `terminal.ts` only wires modules together.

## Modules

| Module                                                          | Responsibility                                                                                                                   |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `terminal.ts`                                                   | `initTerminal(root)`: builds the context, wires everything, returns the dispose function.                                        |
| `commands.ts`                                                   | **Command registry.** One entry per command: syntax, help text, completions, thinking verbs, parser.                             |
| `parse.ts`                                                      | Raw input to `Cmd` (plain data). Pure.                                                                                           |
| `render.ts`                                                     | `Cmd` / data to HTML. Everything dynamic goes through `esc()` / `highlight()`.                                                   |
| `outcome.ts`                                                    | **One result per command**: verb, duration, HTML, cost line, counter change. Used by the live run and by replay.                 |
| `execute.ts`, `runner.ts`, `open-post.ts`                       | Run a `Cmd` (output, navigation, pickers), type-and-run, open a post after a countdown.                                          |
| `session.ts`, `notes.ts`                                        | Session log (data only, validated on load) and result lines ("Opening ...", "Theme set to ...").                                 |
| `pickers/`                                                      | `/theme` and `/search` replace the input bar: `host.ts` (what a picker may do), `open.ts` (open/close), `theme.ts`, `search.ts`. |
| `prompt.ts`, `completion.ts`, `placeholder.ts`                  | Input bar, Tab completion, animated placeholder.                                                                                 |
| `search.ts`                                                     | Pagefind with a local fallback; excerpts are sanitised.                                                                          |
| `data.ts`                                                       | Builds the JSON the page embeds (server side).                                                                                   |
| `status.ts`, `cost.ts`, `rng.ts`, `verbs.ts`                    | Statusline, fake token/cost line, seeded random, spinner wording.                                                                |
| `dom.ts`, `context.ts`, `history.ts`, `animate.ts`, `banner.ts` | DOM lookups and the cancellation scope, shared context, output list, timed effects, ASCII banner.                                |
| `text.ts`, `types.ts`                                           | Escaping/highlighting/relative dates; shared types.                                                                              |
| `*.test.ts`, `testData.ts`                                      | Vitest unit tests and a small fixture.                                                                                           |

Pure modules (no DOM): `commands`, `parse`, `render`, `outcome`, `completion`, `search`, `session` (parse part), `cost`, `rng`, `text`, `verbs`.

## Rules

- **Add a command**: one entry in `commands.ts`; if it prints, one renderer in `render.ts`; if it needs an action, one handler in `execute.ts`. Help, Tab completion and verbs follow automatically. Run `npm test`.
- **Deterministic output**: same commands, same output. Use `nextRng()`, never `Math.random()`. A replay must consume the rng in the same order as the live run.
- **The session log stores data, never HTML.** Add a note kind in `types.ts` (`NoteData`) and `session.ts` (`NOTE_TEXT`).
- **Cancellation**: every loop and listener belongs to the `Scope` (`dom.ts`). Check `scope.alive()` after every `await` that leads to navigation.
- **Keyboard**: Tab completes only until the prompt is empty and untouched; Shift+Tab or a second Esc leaves the prompt. Pickers own the keys only while open and only inside the terminal.
- **Accessibility**: output is a `role="log"`; changes are announced through `ctx.announce()`; pickers use `listbox` / `option` / `combobox`.
