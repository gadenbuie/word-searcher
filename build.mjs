/* Build the standalone app.js from src/app.js + every locales/*.json file.
 *
 * There is no language registry to maintain: drop a new <code>.json file into
 * locales/ and it becomes a selectable language on the next build. The JSON is
 * embedded in the bundle, so index.html still opens straight from disk with no
 * server and no fetch.
 */
import { build, context } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const localesDir = path.resolve("locales");
const entryPoints = [path.resolve("src/app.js")];
const outfile = path.resolve("app.js");

function localeFiles() {
  if (!fs.existsSync(localesDir)) return [];
  return fs.readdirSync(localesDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
}

/* A virtual module keeps the locale list out of src/app.js — one JSON file is
 * the only thing needed to add a language. */
const localesPlugin = {
  name: "locale-resources",
  setup(buildApi) {
    buildApi.onResolve({ filter: /^@locales$/ }, () => ({
      path: "@locales",
      namespace: "locales",
    }));
    buildApi.onLoad({ filter: /.*/, namespace: "locales" }, () => {
      const resources = {};
      for (const file of localeFiles()) {
        const code = file.slice(0, -".json".length);
        resources[code] = {
          translation: JSON.parse(fs.readFileSync(path.join(localesDir, file), "utf8")),
        };
      }
      return {
        contents: `export default ${JSON.stringify(resources)};`,
        loader: "js",
        watchFiles: localeFiles().map((file) => path.join(localesDir, file)),
      };
    });
  },
};

const options = {
  entryPoints,
  outfile,
  bundle: true,
  format: "iife",
  target: ["es2020"],
  charset: "utf8", // leave accents and emoji readable in the output
  minify: false, // keep the generated file inspectable; edit src/ + locales/
  legalComments: "none",
  plugins: [localesPlugin],
};

if (process.argv.includes("--watch")) {
  const ctx = await context(options);
  await ctx.watch();
  console.log("Watching src/ and locales/ — run the page from index.html as usual.");
} else {
  await build(options);
  const codes = localeFiles().map((file) => file.slice(0, -".json".length));
  console.log(`Built app.js with ${codes.length} languages: ${codes.join(", ")}`);
}
