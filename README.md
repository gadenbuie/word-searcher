# Word Search Maker

A standalone printable word-search generator. The page runs entirely in the browser —
no server and no network calls. Translations are powered by i18next and compiled into
the page by a tiny build step.

## Use it

Open `index.html` in any browser. Everything runs locally in the page.

1. Pick a language from the dropdown in the masthead (English, Spanish — Latin America,
   Spanish — Spain, Portuguese — Brazil, Portuguese — Portugal, French, German). The choice is written to the URL as
   `?lang=<code>`, so the page can be reloaded or shared in that language; it is also
   remembered on the device as a fallback when no parameter is present. Switching
   language keeps the current theme but swaps its title and word list into the new
   language. Language-only codes such as `?lang=es` or `?lang=pt` resolve to the
   regional variant and are canonicalized in the URL.
2. Pick a preset chip. Holidays come first (Thanksgiving, Christmas, St. Patrick's Day,
   Easter, Halloween, Fourth of July, Bastille Day, Oktoberfest), followed by Fall, the
   soccer themes, and Custom. Each preset has its own color, which becomes the page's
   accent; editing the word list switches to Custom automatically. On load, the page
   starts on the closest upcoming holiday — or one that fell within the last three days.
   A `?theme=<preset>` URL parameter overrides that choice.
3. Adjust the puzzle title, word list, and difficulty:
   - **Allow vertical words** — words read top-to-bottom (or bottom-to-top if backwards is on)
   - **Allow diagonal words** — words run diagonally
   - **Allow backwards words** — words can read right-to-left / bottom-to-top
   - **Allow words to share letters** — crossings make puzzles denser and harder
   - **Filler letters** — random letters, or letters drawn from the word list (harder to spot)
   - **Grid size** — auto-sized from the word list, or fixed 8×8 through 24×24
4. Click **Generate puzzle** (or press <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Enter</kbd>).
   Clicking the active preset chip again shuffles a fresh puzzle.
5. Click **Print**. The print layout is clean black & white, fitted to US Letter
   (8.5 × 11) portrait, with the word list below the grid. **Show answer key** adds a
   highlighted solution grid on its own page after the puzzle.

On desktop the controls sidebar and the puzzle area scroll independently, so tuning a
long word list never scrolls the puzzle out of view. On narrow screens the panes stack
and the page scrolls normally.

## Build

The checked-in `app.js` is a generated bundle, so you can just open `index.html`. To edit:

```sh
npm install
npm run build       # rebuild app.js from src/ + locales/
npm run watch       # rebuild automatically while editing
```

The build bundles `src/app.js`, i18next, and every `locales/*.json` file into `app.js`.
It does not start a server or touch `index.html` / `styles.css`.

## Files

| File | Purpose |
|:---|:---|
| `index.html` | Page structure; visible text carries `data-i18n` / `data-i18n-html` / `data-i18n-placeholder` / `data-i18n-aria` hooks |
| `styles.css` | Brutalist visual system, per-preset theme palettes, two-pane scrolling layout, and a `@media print` block (`@page size: letter portrait`) |
| `src/app.js` | Source for the bundle: preset keys, theming, word cleaning, placement, rendering, print/reveal actions, i18n wiring |
| `locales/*.json` | One file per language: UI strings, native language name, and every preset's label/title/word list |
| `build.mjs` | Discovers `locales/*.json` and bundles everything into `app.js` with esbuild |
| `app.js` | **Generated.** Standalone bundle loaded by `index.html`; don't edit by hand |

## Adding a language

Add one file, `locales/<code>.json`, and run `npm run build`. Nothing else needs editing:
the build discovers files automatically, the language appears in the dropdown with its
native name, and it becomes available via `?lang=<code>`.

Start from `locales/en.json` and translate as much or as little as you like. Any key you
leave out falls back to English — including individual presets, so a partial translation
still produces a working page. The file has three sections:

```json
{
  "meta":  { "name": "Español (Latinoamérica)", "dir": "ltr" },
  "ui":    { "generate": "Generar rompecabezas", "...": "..." },
  "presets": {
    "thanksgiving": {
      "label": "Día de Acción de Gracias",
      "emoji": "🦃",
      "title": "🦃 ¡Feliz Día de Acción de Gracias! 🥧",
      "words": ["PAVO", "RELLENO", "..."]
    }
  }
}
```

- `meta.name` is the label shown in the language dropdown; `meta.dir` is `ltr` or `rtl`.
- `ui` holds all interface text, button labels, error messages and screen-reader text.
  `{{count}}`, `{{size}}`, `{{label}}`, `{{rows}}` and `{{columns}}` are interpolated.
  A few values (`brand`, `hint`, `findLabel`) may contain the same HTML markup as the
  English file; translations are treated as trusted, so keep that markup intact.
- `presets` holds the **parameterized word lists**: each preset's label, emoji, title and
  `words` live in the JSON, so every language has its own translated words. The 12 shared
  keys are the same across languages, but a locale can add its own keys (for local
  holidays) and they appear as extra chips only for that language. Keys you don't define
  fall back to English. `words` can be as long or short as you like; accented letters are
  fine — normalization and filler letters are Unicode-aware.

The shipped locales include regional themes: Cinco de Mayo and Día de Muertos (es-419),
Reyes Magos, San Fermín and La Tomatina (es-ES), Carnaval and Dia da Independência
(pt-BR), Dia de Portugal, Santo António and São João (pt-PT), Fête des Lumières and Fête
de la Musique (fr), and Tag der Deutschen Einheit and Karneval (de).

`dir` is set on `<html>` from `meta.dir`, so a right-to-left language gets the correct
document direction from its one file (worth a quick visual check of the CSS as well).

## Adding a preset theme

Shared preset *identity* is language-neutral: the ordered key list lives in
`SHARED_PRESET_KEYS` in `src/app.js`, the colors live in `styles.css` under
`[data-theme="<key>"]`, and holiday dates live in `HOLIDAY_DATES` in `src/app.js`. To add
a shared theme, add its key to those places and add a `presets.<key>` entry to
`locales/en.json` (plus any other languages you want to translate it into).

For a theme that should appear in only one language, just add its key and content to that
locale's `presets` map — no code changes needed. If it's a holiday, add a date function to
`HOLIDAY_DATES` so it can be picked as the default on load, and add a color rule in
`styles.css` (or leave the key out and it inherits the default palette). Adding a language
never requires touching any of these.

## Notes on the generator

- Words are normalized to uppercase Unicode letters (spaces, apostrophes, hyphens, and
  periods are kept for display; matching ignores them) and deduplicated.
- Placement is stochastic: directions and start cells are chosen at random, longest words
  are placed first, and the whole grid is retried up to 30 times if a word can't fit.
- Overlap placement only allows a shared cell when the letters match.
- For large word lists the printed grid is shortened slightly and the word list gains
  columns and smaller type, so the whole puzzle stays on one page.
