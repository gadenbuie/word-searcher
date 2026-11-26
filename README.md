# Word Search Maker

A standalone, dependency-free website for generating printable word search puzzles.

## Use it

Open `index.html` in any browser — no build step, no server, no dependencies. Everything
runs locally in the page.

1. Pick a preset chip. Holidays come first (Thanksgiving, Christmas, St. Patrick's Day,
   Easter, Halloween, Fourth of July, Bastille Day, Oktoberfest), followed by Fall, the
   soccer themes, and Custom. Each preset has its own color, which becomes the page's
   accent; editing the word list switches to Custom automatically. On load, the page
   starts on the closest upcoming holiday — or one that fell within the last three days.
   A `?theme=<preset>` URL parameter overrides that choice.
2. Adjust the puzzle title, word list, and difficulty:
   - **Allow vertical words** — words read top-to-bottom (or bottom-to-top if backwards is on)
   - **Allow diagonal words** — words run diagonally
   - **Allow backwards words** — words can read right-to-left / bottom-to-top
   - **Allow words to share letters** — crossings make puzzles denser and harder
   - **Filler letters** — random A–Z, or letters drawn from the word list (harder to spot)
   - **Grid size** — auto-sized from the word list, or fixed 8×8 through 24×24
3. Click **Generate puzzle** (or press <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Enter</kbd>).
   Clicking the active preset chip again shuffles a fresh puzzle.
4. Click **Print**. The print layout is clean black & white, fitted to US Letter
   (8.5 × 11) portrait, with the word list below the grid. **Show answer key** adds a
   highlighted solution grid on its own page after the puzzle.

On desktop the controls sidebar and the puzzle area scroll independently, so tuning a
long word list never scrolls the puzzle out of view. On narrow screens the panes stack
and the page scrolls normally.

## Files

| File | Purpose |
|:---|:---|
| `index.html` | Page structure: masthead, controls sidebar, puzzle panel, answer-key panel |
| `styles.css` | Brutalist visual system, per-preset theme palettes, two-pane scrolling layout, and a `@media print` block (`@page size: letter portrait`) |
| `app.js` | Presets and theming, word cleaning, random placement with retries, filler generation, rendering, print/reveal actions |
| `assets/fonts/` | Self-hosted Archivo Black WOFF2 files used for display type |

## Notes on the generator

- Words are normalized to A–Z (spaces, apostrophes, hyphens, and periods are kept for
  display; matching ignores them) and deduplicated.
- Placement is stochastic: directions and start cells are chosen at random, longest words
  are placed first, and the whole grid is retried up to 30 times if a word can't fit.
- Overlap placement only allows a shared cell when the letters match.
- For large word lists the printed grid is shortened slightly and the word list gains
  columns and smaller type, so the whole puzzle stays on one page.
