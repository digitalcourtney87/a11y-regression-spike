/**
 * Reproduction check for a mined open-source regression (DR-0062, DR-0063).
 * Windows CI only.
 *
 *   node harness/src/probes/ossCheck.ts --dist <built fixture> --check <fixture>/check.mjs --version <v> --out <json>
 *
 * Serves the fixture's production build from 127.0.0.1 with every other host
 * blocked, opens it in the pinned Chrome with the screen-reader accessibility
 * mode, and runs the fixture's `check.mjs`. A check is written from the
 * issue's own description, never from an arm's oracle, and returns
 * `{ pointer, keyboard }`: whether the correct behaviour holds when the
 * scenario is driven as the issue describes, and when it is driven from the
 * keyboard (journeys use OS-level keys, so a pair enters the corpus only if
 * the keyboard path reproduces). Every result is EXPLORATORY.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import { chromium } from "playwright";
import type { Page } from "playwright";

const { values: args } = parseArgs({
  options: { dist: { type: "string" }, check: { type: "string" }, version: { type: "string" }, out: { type: "string" } },
});
if (args.dist === undefined || args.check === undefined || args.version === undefined || args.out === undefined) throw new Error("--dist, --check, --version and --out are required");
const root = resolve(args.dist);
const checkPath = resolve(args.check);
const version = args.version;
const outPath = resolve(args.out);

const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

/** One scenario's result: whether the correct (pre-regression) behaviour holds. */
export interface Outcome {
  holds: boolean;
  detail: string;
}

export interface CheckResult {
  pointer: Outcome;
  keyboard: Outcome | null;
}

type Check = (ctx: { page: Page; base: string; fresh: () => Promise<Page> }) => Promise<CheckResult>;

async function main(): Promise<void> {
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/");
    let file = normalize(join(root, path));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, "index.html");
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}/`;
  const browser = await chromium.launch({ headless: true, chromiumSandbox: true, args: ["--force-renderer-accessibility=screen-reader"] });
  const external: string[] = [];
  const pageErrors: string[] = [];
  let result: CheckResult | { error: string };
  try {
    const fresh = async (): Promise<Page> => {
      const context = await browser.newContext();
      await context.route("**/*", async (route) => {
        const url = route.request().url();
        if (url.startsWith(base)) await route.continue();
        else {
          external.push(url);
          await route.abort();
        }
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => pageErrors.push(e.message.slice(0, 300)));
      await page.goto(base, { waitUntil: "load" });
      await page.waitForTimeout(500);
      return page;
    };
    const mod = (await import(pathToFileURL(checkPath).href)) as { default: Check };
    result = await mod.default({ page: await fresh(), base, fresh });
  } catch (error) {
    result = { error: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
  } finally {
    await browser.close();
    server.close();
  }
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify({ label: "EXPLORATORY", version, result, external, pageErrors }, null, 2)}\n`);
}

await main();
