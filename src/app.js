/* Word Search Maker — source for the generated, standalone app.js.
 *
 * Edit this file or any locales/<code>.json file, then run `npm run build`.
 * Language-neutral structure (preset keys, theme colors, holiday dates) lives
 * here; every word and every visible string lives in the locale JSON files.
 */
import i18next from "i18next";
import resources from "@locales";

const $ = (id) => document.getElementById(id);

const els = {
  language: $("language"),
  title: $("title"),
  presetChips: $("preset-chips"),
  words: $("words"),
  error: $("error"),
  vertical: $("vertical"),
  diagonals: $("diagonals"),
  backwards: $("backwards"),
  overlaps: $("overlaps"),
  fillStyle: $("fill-style"),
  gridSize: $("grid-size"),
  generate: $("generate"),
  print: $("print"),
  reveal: $("reveal"),
  regenerate: $("regenerate"),
  puzzle: $("puzzle"),
  answers: $("answers"),
  puzzleTitle: $("puzzle-title"),
  grid: $("grid"),
  answerGrid: $("answer-grid"),
  wordbox: $("wordbox"),
  wordList: $("word-list"),
  findLabel: $("find-label"),
  status: $("status"),
  answerSummary: $("answer-summary"),
};

const t = (key, options) => i18next.t(key, options);

/* ---------- Presets ----------
 * SHARED_PRESET_KEYS appear in every language. A locale can add its own keys to
 * its `presets` map (a local holiday, say) and they show up automatically for
 * that language only — no code changes. Custom is always last. */
const SHARED_PRESET_KEYS = [
  "thanksgiving", "christmas", "st-patricks", "easter", "halloween",
  "fourth-of-july", "bastille-day", "oktoberfest", "fall",
  "soccer-worldcup", "soccer-europe", "soccer-mls",
];

function presetKeysFor(lng = i18next.language) {
  const own = Object.keys((resources[lng] || resources.en).translation.presets || {})
    .filter((key) => key !== "custom" && !SHARED_PRESET_KEYS.includes(key));
  return [...SHARED_PRESET_KEYS, ...own, "custom"];
}

/** Localized preset content, with English filling in anything a locale omits. */
function localizedPresets() {
  const fallback = (resources.en.translation.presets) || {};
  const active = (resources[i18next.language] || resources.en).translation.presets || {};
  const merged = {};
  for (const key of presetKeysFor()) {
    merged[key] = { ...(fallback[key] || {}), ...(active[key] || {}) };
  }
  return merged;
}

/* Selecting a preset recolors the whole page; editing the words switches to Custom. */
let currentPreset = "custom";

function renderPresetChips() {
  const presets = localizedPresets();
  els.presetChips.textContent = "";
  for (const key of presetKeysFor()) {
    const preset = presets[key];
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "preset-chip";
    chip.dataset.chipTheme = key;
    chip.dataset.preset = key;
    chip.textContent = [preset.emoji, preset.label].filter(Boolean).join(" ");
    chip.setAttribute("aria-pressed", String(key === currentPreset));
    chip.addEventListener("click", () => {
      if (key === currentPreset) {
        generate(); // clicking the active chip again is a quick shuffle
      } else {
        setPreset(key, { applyWords: true, regenerate: true });
      }
    });
    els.presetChips.appendChild(chip);
  }
}

function setPreset(name, { applyWords = false, regenerate = false } = {}) {
  const preset = localizedPresets()[name];
  if (!preset) return;
  currentPreset = name;
  document.documentElement.dataset.theme = name;
  for (const chip of els.presetChips.children) {
    chip.setAttribute("aria-pressed", String(chip.dataset.preset === name));
  }
  if (applyWords && preset.words && preset.words.length) {
    els.title.value = preset.title || "";
    els.words.value = preset.words.join("\n");
    clearError();
    resizeWords();
  }
  if (regenerate) generate();
}

/* ---------- Holiday dates ---------- */
function nthWeekday(year, month, weekday, n) {
  const first = new Date(year, month, 1);
  return new Date(year, month, 1 + (weekday - first.getDay() + 7) % 7 + (n - 1) * 7);
}
function easterSunday(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  return new Date(year, month - 1, ((h + l - 7 * m + 114) % 31) + 1);
}
function shiftDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
function lastWeekday(year, month, weekday) {
  const last = new Date(year, month + 1, 0);
  return new Date(year, month, last.getDate() - (last.getDay() - weekday + 7) % 7);
}
const HOLIDAY_DATES = {
  thanksgiving: (y) => nthWeekday(y, 10, 4, 4),   // 4th Thursday of November
  christmas: (y) => new Date(y, 11, 25),
  "st-patricks": (y) => new Date(y, 2, 17),
  easter: easterSunday,
  halloween: (y) => new Date(y, 9, 31),
  "fourth-of-july": (y) => new Date(y, 6, 4),
  "bastille-day": (y) => new Date(y, 6, 14),
  oktoberfest: (y) => new Date(y, 8, 20),          // late-September opening
  // Locale-specific holidays; only considered when that language is active.
  valentines: (y) => new Date(y, 1, 14),
  "cinco-de-mayo": (y) => new Date(y, 4, 5),
  "day-of-the-dead": (y) => new Date(y, 10, 2),
  carnaval: (y) => shiftDays(easterSunday(y), -49),
  "three-kings": (y) => new Date(y, 0, 6),
  "semana-santa": (y) => shiftDays(easterSunday(y), -7),
  "san-fermin": (y) => new Date(y, 6, 7),
  tomatina: (y) => lastWeekday(y, 7, 3),          // last Wednesday of August
  "dia-da-independencia": (y) => new Date(y, 8, 7),
  "dia-de-portugal": (y) => new Date(y, 5, 10),
  "santo-antonio": (y) => new Date(y, 5, 13),
  "sao-joao": (y) => new Date(y, 5, 24),
  "fete-des-lumieres": (y) => new Date(y, 11, 8),
  "fete-de-la-musique": (y) => new Date(y, 5, 21),
  "tag-der-deutschen-einheit": (y) => new Date(y, 9, 3),
  karneval: (y) => shiftDays(easterSunday(y), -49),
};

/** Closest upcoming holiday, or one that landed within the last three days. */
function closestHolidayPreset(today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const active = new Set(presetKeysFor().filter((key) => key !== "custom"));
  let best = null, bestDiff = Infinity;
  for (const [key, dateFor] of Object.entries(HOLIDAY_DATES)) {
    if (!active.has(key)) continue;
    for (const year of [start.getFullYear(), start.getFullYear() + 1]) {
      const days = Math.round((dateFor(year) - start) / 86400000);
      if (days >= -3 && days < bestDiff) { bestDiff = days; best = key; }
    }
  }
  return best;
}

/* Seed from ?theme=<preset> (or ?preset=) if present; otherwise the nearest holiday. */
function seedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("theme") || params.get("preset");
  if (requested && presetKeysFor().includes(requested)) {
    setPreset(requested, { applyWords: true });
    return;
  }
  setPreset(closestHolidayPreset() || "thanksgiving", { applyWords: true });
}

/* ---------- i18n ---------- */
const STORAGE_KEY = "wordSearchLanguage";

function storedLanguage() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function rememberLanguage(lng) {
  try { localStorage.setItem(STORAGE_KEY, lng); } catch { /* private mode */ }
}

/** Keep the URL shareable and in sync with the selected language. */
function syncLanguageToUrl(lng) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lng);
    window.history.replaceState(null, "", url.href);
  } catch { /* restricted history — the in-memory language still works */ }
}

function availableLanguages() {
  return Object.keys(resources).sort((a, b) => {
    if (a === "en") return -1;
    if (b === "en") return 1;
    return a.localeCompare(b);
  });
}

/** Accept exact codes and language-only aliases (e.g. es -> es-419, pt -> pt-BR). */
function resolveLanguageCode(code) {
  if (!code) return null;
  if (resources[code]) return code;
  const base = code.split("-")[0];
  return availableLanguages().find((candidate) => candidate.split("-")[0] === base) || null;
}

function detectInitialLanguage() {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  const fromUrlResolved = resolveLanguageCode(fromUrl);
  if (fromUrlResolved) return fromUrlResolved;
  const saved = resolveLanguageCode(storedLanguage());
  if (saved) return saved;
  for (const candidate of navigator.languages || [navigator.language]) {
    const resolved = resolveLanguageCode(candidate);
    if (resolved) return resolved;
  }
  return "en";
}

function renderLanguageOptions() {
  els.language.textContent = "";
  for (const code of availableLanguages()) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = (resources[code].translation.meta || {}).name || code;
    els.language.appendChild(option);
  }
}

/** Push the active language into the DOM. Everything visible goes through here. */
let lastWordCount = 0;
function applyTranslations() {
  document.documentElement.lang = i18next.language;
  document.documentElement.dir = t("meta.dir") === "rtl" ? "rtl" : "ltr";
  document.title = t("ui.pageTitle");

  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of document.querySelectorAll("[data-i18n-html]")) {
    const key = node.dataset.i18nHtml;
    node.innerHTML = key === "ui.findLabel" ? t(key, { count: lastWordCount }) : t(key);
  }
  for (const node of document.querySelectorAll("[data-i18n-placeholder]")) {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  }
  for (const node of document.querySelectorAll("[data-i18n-aria]")) {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  }

  els.language.value = i18next.language;
  renderPresetChips(); // chip labels are localized too
}

async function changeLanguage(lng) {
  if (!resources[lng] || lng === i18next.language) return;
  await i18next.changeLanguage(lng);
  rememberLanguage(lng);
  syncLanguageToUrl(lng);
  applyTranslations();
  // Keep the selected theme, but swap its title and words into the new language.
  // Locale-only themes don't exist elsewhere, so fall back to a shared one.
  if (currentPreset !== "custom") {
    if (!presetKeysFor().includes(currentPreset)) {
      currentPreset = closestHolidayPreset() || "thanksgiving";
    }
    setPreset(currentPreset, { applyWords: true });
  }
  generate();
}

/* ---------- State ---------- */
let grid = [];          // 2D array of letters
let placements = [];    // { word, row, col, dr, dc }
let normalized = [];    // cleaned words actually placed
let answerShown = false;

const DIRS = [
  [0, 1],   // →
  [0, -1],  // ← (backwards)
  [1, 0],   // ↓
  [-1, 0],  // ↑ (backwards vertical)
  [1, 1],   // ↘
  [1, -1],  // ↙
  [-1, 1],  // ↗ (backwards diagonal)
  [-1, -1], // ↖ (backwards diagonal)
];

/* ---------- Helpers ---------- */
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIRECTION_KEYS = {
  "0,1": "ui.dirRight", "0,-1": "ui.dirLeft", "1,0": "ui.dirDown", "-1,0": "ui.dirUp",
  "1,1": "ui.dirDownRight", "1,-1": "ui.dirDownLeft",
  "-1,1": "ui.dirUpRight", "-1,-1": "ui.dirUpLeft",
};

/** Announce changes to screen readers via the polite live region. */
function announce(message) {
  els.status.textContent = "";
  window.setTimeout(() => { els.status.textContent = message; }, 30);
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = false;
}
function clearError() {
  els.error.hidden = true;
  els.error.textContent = "";
}

function resizeWords() {
  els.words.style.height = "auto";
  els.words.style.height = Math.min(els.words.scrollHeight, 420) + "px";
}

function cleanWords(raw) {
  const seen = new Set();
  const out = [];
  for (const line of raw.split("\n")) {
    // Keep letters (including accented ones), spaces, apostrophes, hyphens and
    // periods; everything else is a separator. Matching ignores punctuation.
    const word = line.toUpperCase().replace(/[^\p{L} .'\-]/gu, "").trim().replace(/\s+/g, " ");
    const key = word.replace(/[^\p{L}]/gu, "");
    if ([...key].length >= 2 && !seen.has(key)) {
      seen.add(key);
      out.push({ display: word, letters: key });
    }
  }
  return out;
}

function buildDirections(opts) {
  const dirs = [];
  dirs.push([0, 1]);                                  // horizontal always
  if (opts.vertical) dirs.push([1, 0]);               // down
  if (opts.diagonals) dirs.push([1, 1]);              // ↘
  if (opts.backwards) {
    dirs.push([0, -1]);
    if (opts.vertical) dirs.push([-1, 0]);
    if (opts.diagonals) { dirs.push([1, -1]); dirs.push([-1, 1]); dirs.push([-1, -1]); }
  }
  return dirs;
}

function fits(word, row, col, dr, dc, size, allowOverlap) {
  const cells = [];
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i, c = col + dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return null;
    const existing = grid[r][c];
    if (existing && (!allowOverlap || existing !== word[i])) return null;
    cells.push([r, c]);
  }
  return cells;
}

/** Try to place every word. Returns null on failure so caller can retry with a fresh grid. */
function attemptPlace(words, size, opts) {
  grid = Array.from({ length: size }, () => Array(size).fill(""));
  placements = [];
  const dirs = buildDirections(opts);
  // Longest words first — they are the hardest to place.
  const sorted = [...words].sort((a, b) => b.letters.length - a.letters.length);

  for (const w of sorted) {
    let placed = false;
    // Bounded tries per word keeps things fast; remaining spots become filler anyway.
    for (let attempt = 0; attempt < 400 && !placed; attempt++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const cells = fits(w.letters, row, col, dr, dc, size, opts.overlaps);
      if (cells) {
        for (let i = 0; i < w.letters.length; i++) grid[cells[i][0]][cells[i][1]] = w.letters[i];
        placements.push({ word: w, row, col, dr, dc });
        placed = true;
      }
    }
    if (!placed) return null;
  }
  return true;
}

/** A–Z plus every letter used by the active words, so accented fillers match. */
function fillerPool(words) {
  const pool = new Set(LETTERS);
  for (const w of words) for (const ch of w.letters) pool.add(ch);
  return [...pool];
}

function fillBlanks(size, words) {
  const pool = fillerPool(words);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) continue;
      if (els.fillStyle.value === "wordly" && words.length) {
        const w = words[Math.floor(Math.random() * words.length)].letters;
        grid[r][c] = w[Math.floor(Math.random() * w.length)];
      } else {
        grid[r][c] = pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }
}

function pickSize(words, opts) {
  const chosen = els.gridSize.value;
  if (chosen !== "auto") return parseInt(chosen, 10);
  const longest = Math.max(...words.map((w) => w.letters.length));
  // Target enough empty cells that placement succeeds without feeling sparse.
  const totalLetters = words.reduce((n, w) => n + w.letters.length, 0);
  let size = Math.ceil(Math.sqrt(totalLetters * 2.2));
  size = Math.max(size, longest + 1, 8);
  size = Math.min(size, 24);
  return Math.max(size, Math.min(24, Math.ceil((size + longest) / 2)));
}

/** Fit the word list on the printed page: more columns and smaller type as it grows. */
function fitWordList(count) {
  const cols = count >= 56 ? 6 : count >= 36 ? 5 : 4;
  const rows = Math.ceil(count / cols);
  // A full-width square grid leaves too little room for a long word list, so
  // large lists get a slightly shorter grid. Convert the remaining budget to
  // a per-row font size so everything stays on one printed page.
  document.documentElement.style.setProperty("--print-grid", count >= 28 ? "6.9in" : "7.5in");
  const printPt = Math.max(6, Math.min(9.5, 108 / (rows * 1.2)));
  const screenRem = Math.max(0.78, Math.min(1, 1 - Math.max(0, count - 20) * 0.012));
  els.wordbox.style.setProperty("--word-cols", cols);
  els.wordbox.style.setProperty("--word-font-print", printPt.toFixed(2) + "pt");
  els.wordbox.style.setProperty("--word-font-screen", screenRem.toFixed(3) + "rem");
}

/* ---------- Rendering ---------- */
function renderGrid(container, letters, size, label) {
  container.style.setProperty("--cols", size);
  container.setAttribute("aria-label", t("ui.gridSizeAria", { label, rows: size, columns: size }));
  container.textContent = "";
  const body = document.createElement("tbody");
  for (let r = 0; r < size; r++) {
    const row = document.createElement("tr");
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("td");
      cell.className = "cell";
      cell.textContent = letters[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      row.appendChild(cell);
    }
    body.appendChild(row);
  }
  container.appendChild(body);
}

function renderAnswerKey(size) {
  renderGrid(els.answerGrid, grid, size, t("ui.answerGridAria"));
  const marked = new Set();
  for (const p of placements) {
    for (let i = 0; i < p.word.letters.length; i++) {
      marked.add(`${p.row + p.dr * i},${p.col + p.dc * i}`);
    }
  }
  for (const cell of els.answerGrid.querySelectorAll("td.cell")) {
    if (!marked.has(`${cell.dataset.r},${cell.dataset.c}`)) continue;
    cell.classList.add("marked");
    // The highlight is also conveyed in text, not by color alone.
    cell.setAttribute("aria-label", [
      cell.textContent,
      `${t("ui.row")} ${Number(cell.dataset.r) + 1}`,
      `${t("ui.column")} ${Number(cell.dataset.c) + 1}`,
      t("ui.partOfWord"),
    ].join(", "));
  }
  els.answerSummary.textContent = t("ui.wordLocations") + placements.map((p) =>
    `${p.word.display}: ${t("ui.row")} ${p.row + 1}, ${t("ui.column")} ${p.col + 1}, ` +
    `${t("ui.reading")} ${t(DIRECTION_KEYS[`${p.dr},${p.dc}`] || "ui.alongGrid")}`).join(". ") + ".";
}

function renderWordList() {
  els.wordList.textContent = "";
  for (const w of normalized) {
    const li = document.createElement("li");
    li.textContent = w.display;
    els.wordList.appendChild(li);
  }
  lastWordCount = normalized.length;
  // applyTranslations() rebuilds this markup, so always re-query the counter.
  const counter = $("word-count");
  if (counter) counter.textContent = lastWordCount;
  fitWordList(lastWordCount);
}

/* ---------- Generation ---------- */
function generate(options = {}) {
  const doAnnounce = options.announce !== false;
  const words = cleanWords(els.words.value);
  if (!words.length) {
    showError(t("ui.errorNoWords"));
    return;
  }
  const opts = {
    vertical: els.vertical.checked,
    diagonals: els.diagonals.checked,
    backwards: els.backwards.checked,
    overlaps: els.overlaps.checked,
  };

  const size = pickSize(words, opts);
  // Retry with fresh randomness — placement is stochastic, so a couple of
  // attempts virtually always succeeds.
  let ok = null;
  for (let attempt = 0; attempt < 30 && !ok; attempt++) ok = attemptPlace(words, size, opts);
  if (!ok) {
    showError(t("ui.errorNoFit"));
    return;
  }

  fillBlanks(size, words);
  normalized = words;
  clearError();

  els.puzzleTitle.textContent = els.title.value.trim() || t("ui.puzzleTitleDefault");
  renderGrid(els.grid, grid, size, t("ui.gridAria"));
  renderWordList();
  els.puzzle.classList.remove("hidden");
  answerShown = false;
  els.answers.classList.add("hidden");
  els.reveal.textContent = t("ui.reveal");
  if (doAnnounce) announce(t("ui.announceReady", { count: normalized.length, size }));
}

function toggleAnswerKey() {
  answerShown = !answerShown;
  if (answerShown) renderAnswerKey(grid.length);
  els.answers.classList.toggle("hidden", !answerShown);
  els.reveal.textContent = answerShown ? t("ui.hide") : t("ui.reveal");
  announce(answerShown ? t("ui.announceAnswersShown") : t("ui.announceAnswersHidden"));
}

/* ---------- Events ---------- */
els.generate.addEventListener("click", generate);
els.regenerate.addEventListener("click", generate);
els.reveal.addEventListener("click", toggleAnswerKey);
els.language.addEventListener("change", (event) => { changeLanguage(event.target.value); });
els.print.addEventListener("click", () => {
  if (els.puzzle.classList.contains("hidden")) generate();
  window.print();
});
els.words.addEventListener("input", () => {
  // Manual edits switch to Custom so a preset isn't silently overwritten.
  if (currentPreset !== "custom") setPreset("custom");
  resizeWords();
  clearError();
});

// Cmd/Ctrl+Enter generates from anywhere on the page.
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") generate();
});

/* ---------- Boot ---------- */
i18next.init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // translations are local, trusted markup
  returnEmptyString: false,
});
syncLanguageToUrl(i18next.language);
renderLanguageOptions();
applyTranslations();
seedFromUrl();
resizeWords();
generate({ announce: false });
