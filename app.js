/* Word Search Maker — plain JS, no dependencies. */
"use strict";

const $ = (id) => document.getElementById(id);

const els = {
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
  wordCount: $("word-count"),
};

/* ---------- Presets ---------- */
const PRESETS = {
  thanksgiving: {
    label: "Thanksgiving", emoji: "🦃",
    title: "🦃 Happy Thanksgiving! 🥧",
    words: [
      "TURKEY", "STUFFING", "CRANBERRY", "PUMPKIN PIE", "GRAVY", "MAYFLOWER",
      "FAMILY", "FEAST", "HARVEST", "DRUMSTICK", "CORN", "YAM", "PIE", "ROLLS",
      "BREAD", "CASSEROLE", "STUFFED", "BASTING", "LEFTOVERS", "CARVING",
      "PARADE", "FOOTBALL", "MAIZE", "SQUASH", "BRINE", "BASTED", "GIBLETS",
      "THAW", "TABLECLOTH", "CENTERPIECE", "CORNUCOPIA", "GOBBLE GOBBLE",
    ],
  },
  christmas: {
    label: "Christmas", emoji: "🎄",
    title: "🎄 Merry Christmas! 🎅",
    words: [
      "SLEIGH", "REINDEER", "SNOWMAN", "MISTLETOE", "FIREPLACE", "CANDY CANE",
      "EGGNOG", "GINGERBREAD", "WREATH", "STOCKING", "TINSEL", "JINGLE BELLS",
      "SANTA CLAUS", "ELF", "CHRISTMAS TREE", "FROSTY", "NUTCRACKER",
      "SNOWFLAKE", "CAROLS", "FRUITCAKE",
    ],
  },
  "st-patricks": {
    label: "St. Patrick's", emoji: "☘️",
    title: "☘️ St. Patrick's Day 🍀",
    words: [
      "SHAMROCK", "CLOVER", "PARADE", "GREEN", "DUBLIN", "HARP", "BAGPIPE",
      "FESTIVAL", "MARCH", "IRISH", "PINS", "BAND", "RIVER", "LUCK", "GOLDEN",
      "WHISTLE", "DANCE", "CITY", "SPRING", "FLOAT", "POCKET", "HAT", "MUSIC",
      "CELEBRATION",
    ],
  },
  easter: {
    label: "Easter", emoji: "🐣",
    title: "🐣 Easter Egg Hunt 🐇",
    words: [
      "CHOCOLATE", "BASKET", "RABBIT", "EGG", "HUNT", "SPRING", "DAFFODIL",
      "BONNET", "PARADE", "CHICK", "MARZIPAN", "NEST", "PAINT", "BRUNCH",
      "HOLIDAY", "APRIL", "SUNSHINE", "BLOSSOM", "MEADOW", "PICNIC", "CROCUS",
      "HARE", "CANDY", "FAMILY",
    ],
  },
  halloween: {
    label: "Halloween", emoji: "🎃",
    title: "🎃 Halloween Night 👻",
    words: [
      "PUMPKIN", "COSTUME", "CANDY", "GHOST", "WITCH", "HAUNTED", "MASK",
      "TRICK OR TREAT", "LANTERN", "SKELETON", "BAT", "SPOOKY", "CHOCOLATE",
      "PARTY", "OCTOBER", "NIGHT", "CREEPY", "CARVE", "CANDY CORN", "DECORATION",
      "MONSTER", "PHANTOM", "GOBLIN", "SHADOWS",
    ],
  },
  "fourth-of-july": {
    label: "Fourth of July", emoji: "🎆",
    title: "🎆 Fourth of July 🎇",
    words: [
      "FIREWORKS", "BARBECUE", "PARADE", "FLAG", "PICNIC", "SPARKLER",
      "COOKOUT", "CELEBRATION", "JULY", "FOURTH", "FIRECRACKER", "BALLOON",
      "BAND", "LEMONADE", "WATERMELON", "LIBERTY", "EAGLE", "NATION",
      "FESTIVAL", "SPARKS", "NIGHT", "FAMILY", "FRIENDS", "HOLIDAY",
    ],
  },
  "bastille-day": {
    label: "Bastille Day", emoji: "🇫🇷",
    title: "🇫🇷 Bastille Day 🎆",
    words: [
      "PARIS", "BASTILLE", "FIREWORKS", "PARADE", "FLAG", "JULY", "FOURTEENTH",
      "CELEBRATION", "CONCERT", "STREET", "DANCE", "NATION", "HISTORY",
      "REVOLUTION", "BAND", "TOWER", "EIFFEL", "CITY", "LUMIERE", "SUMMER",
      "FESTIVAL", "FRANCE", "SQUARE", "TORCH",
    ],
  },
  oktoberfest: {
    label: "Oktoberfest", emoji: "🥨",
    title: "🥨 Oktoberfest 🍺",
    words: [
      "BAVARIA", "BRATWURST", "PRETZEL", "OCTOBER", "FESTIVAL", "LEDERHOSEN",
      "MUNICH", "MUSIC", "BAND", "TENT", "SAUSAGE", "BREAD", "CELEBRATION",
      "HARVEST", "DANCE", "STEIN", "CROWD", "GERMANY", "AUTUMN", "BEER",
      "ALPINE", "PARADE", "OOMPAH", "GARDEN",
    ],
  },
  fall: {
    label: "Fall", emoji: "🍂",
    title: "🍂 Fall Days 🍁",
    words: [
      "ACORN", "AUTUMN", "CIDER", "FOLIAGE", "GARDEN", "HARVEST", "SCARECROW",
      "NOVEMBER", "RAKE", "OCTOBER", "MAPLE", "PUMPKIN", "SWEATER", "WINDSWEPT",
      "GOURD", "HAYRIDE", "FALCON", "CORN MAZE", "LEAF PILE", "APPLE ORCHARD",
    ],
  },
  "soccer-worldcup": {
    label: "World Cup", emoji: "⚽",
    title: "⚽ World Cup 2026 — All 48 Teams 🏆",
    words: [
      // Group A–L, final draw (Dec 2025)
      "MEXICO", "SOUTH AFRICA", "SOUTH KOREA", "CZECHIA",
      "CANADA", "BOSNIA & HERZEGOVINA", "QATAR", "SWITZERLAND",
      "BRAZIL", "MOROCCO", "HAITI", "SCOTLAND",
      "UNITED STATES", "PARAGUAY", "AUSTRALIA", "TURKIYE",
      "GERMANY", "CURACAO", "IVORY COAST", "ECUADOR",
      "NETHERLANDS", "JAPAN", "SWEDEN", "TUNISIA",
      "BELGIUM", "EGYPT", "IRAN", "NEW ZEALAND",
      "SPAIN", "CABO VERDE", "SAUDI ARABIA", "URUGUAY",
      "FRANCE", "SENEGAL", "IRAQ", "NORWAY",
      "ARGENTINA", "ALGERIA", "AUSTRIA", "JORDAN",
      "PORTUGAL", "DR CONGO", "UZBEKISTAN", "COLOMBIA",
      "ENGLAND", "CROATIA", "GHANA", "PANAMA",
    ],
  },
  "soccer-europe": {
    label: "Europe", emoji: "⚽",
    title: "⚽ European Soccer 🏟️",
    words: [
      "PREMIER LEAGUE", "LA LIGA", "SERIE A", "BUNDESLIGA", "LIGUE 1", "ARSENAL",
      "LIVERPOOL", "REAL MADRID", "BARCELONA", "BAYERN MUNICH", "INTER MILAN",
      "AC MILAN", "PSG", "JUVENTUS", "MANCHESTER CITY", "TOTTENHAM", "CHELSEA",
      "ATLETICO MADRID", "NAPOLI", "AJAX",
    ],
  },
  "soccer-mls": {
    label: "MLS", emoji: "⚽",
    title: "⚽ Major League Soccer 🥅",
    words: [
      "INTER MIAMI", "LAFC", "LA GALAXY", "ATLANTA UNITED", "SEATTLE SOUNDERS",
      "PORTLAND TIMBERS", "AUSTIN FC", "NASHVILLE SC", "COLUMBUS CREW",
      "PHILADELPHIA UNION", "NEW YORK RED BULLS", "ORLANDO CITY", "FC CINCINNATI",
      "SPORTING KC", "MINNESOTA UNITED", "ST LOUIS CITY", "TORONTO FC",
      "VANCOUVER WHITECAPS", "CHARLOTTE FC", "SAN DIEGO FC",
    ],
  },
  custom: { label: "Custom", emoji: "✏️", title: "", words: [] },
};

/* Selecting a preset recolors the whole page; editing the words switches to Custom. */
let currentPreset = "custom";

function renderPresetChips() {
  els.presetChips.textContent = "";
  for (const [key, preset] of Object.entries(PRESETS)) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "preset-chip";
    chip.dataset.chipTheme = key;
    chip.dataset.preset = key;
    chip.textContent = `${preset.emoji} ${preset.label}`;
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
  const preset = PRESETS[name];
  if (!preset) return;
  currentPreset = name;
  document.documentElement.dataset.theme = name;
  for (const chip of els.presetChips.children) {
    chip.setAttribute("aria-pressed", String(chip.dataset.preset === name));
  }
  if (applyWords && preset.words.length) {
    els.title.value = preset.title;
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
const HOLIDAY_DATES = {
  thanksgiving: (y) => nthWeekday(y, 10, 4, 4),   // 4th Thursday of November
  christmas: (y) => new Date(y, 11, 25),
  "st-patricks": (y) => new Date(y, 2, 17),
  easter: easterSunday,
  halloween: (y) => new Date(y, 9, 31),
  "fourth-of-july": (y) => new Date(y, 6, 4),
  "bastille-day": (y) => new Date(y, 6, 14),
  oktoberfest: (y) => new Date(y, 8, 20),          // late-September opening
};

/** Closest upcoming holiday, or one that landed within the last three days. */
function closestHolidayPreset(today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let best = null, bestDiff = Infinity;
  for (const [key, dateFor] of Object.entries(HOLIDAY_DATES)) {
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
  if (requested && PRESETS[requested]) {
    setPreset(requested, { applyWords: true });
    return;
  }
  setPreset(closestHolidayPreset() || "thanksgiving", { applyWords: true });
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
    // Keep letters, spaces, apostrophes, hyphens, periods; everything else is a separator.
    const word = line.toUpperCase().replace(/[^A-Z .'\-]/g, "").trim().replace(/\s+/g, " ");
    const key = word.replace(/[^A-Z]/g, ""); // compare on letters only
    if (key.length >= 2 && !seen.has(key)) {
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
    for (let t = 0; t < 400 && !placed; t++) {
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

function fillBlanks(size, words) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) continue;
      if (els.fillStyle.value === "wordly" && words.length) {
        const w = words[Math.floor(Math.random() * words.length)].letters;
        grid[r][c] = w[Math.floor(Math.random() * w.length)];
      } else {
        grid[r][c] = LETTERS[Math.floor(Math.random() * 26)];
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
function renderGrid(container, letters, size) {
  container.style.setProperty("--cols", size);
  container.textContent = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = letters[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      container.appendChild(cell);
    }
  }
}

function renderAnswerKey(size) {
  renderGrid(els.answerGrid, grid, size);
  const marked = new Set();
  for (const p of placements) {
    for (let i = 0; i < p.word.letters.length; i++) {
      marked.add(`${p.row + p.dr * i},${p.col + p.dc * i}`);
    }
  }
  for (const cell of els.answerGrid.children) {
    if (marked.has(`${cell.dataset.r},${cell.dataset.c}`)) cell.classList.add("marked");
  }
}

function renderWordList() {
  els.wordList.textContent = "";
  for (const w of normalized) {
    const li = document.createElement("li");
    li.textContent = w.display;
    els.wordList.appendChild(li);
  }
  els.wordCount.textContent = normalized.length;
  fitWordList(normalized.length);
}

/* ---------- Generation ---------- */
function generate() {
  const words = cleanWords(els.words.value);
  if (!words.length) {
    showError("Add at least one word (2+ letters) to the list.");
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
    showError("Couldn't fit all words in this grid — try a larger grid size or fewer/shorter words.");
    return;
  }

  fillBlanks(size, words);
  normalized = words;
  clearError();

  els.puzzleTitle.textContent = els.title.value.trim() || "Word Search";
  renderGrid(els.grid, grid, size);
  renderWordList();
  els.puzzle.classList.remove("hidden");
  answerShown = false;
  els.answers.classList.add("hidden");
  els.reveal.textContent = "Show answer key";
}

function toggleAnswerKey() {
  answerShown = !answerShown;
  if (answerShown) renderAnswerKey(grid.length);
  els.answers.classList.toggle("hidden", !answerShown);
  els.reveal.textContent = answerShown ? "Hide answer key" : "Show answer key";
}

/* ---------- Events ---------- */
els.generate.addEventListener("click", generate);
els.regenerate.addEventListener("click", generate);
els.reveal.addEventListener("click", toggleAnswerKey);
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
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
});

/* ---------- Boot ---------- */
renderPresetChips();
seedFromUrl();
resizeWords();
generate();
