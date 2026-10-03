/**
 * M3 SPA candidate probe (HANDOFF §9 M3; DR-0056). Windows CI only.
 *
 *   node harness/src/probes/spaProbe.ts --name <candidate> --dist <built dir> --out <json> [--paths /,/#/contacts]
 *     [--fixed-time 2026-10-05T09:00:00Z] [--repeat 2]
 *
 * Serves a candidate's production build from 127.0.0.1 (single-page fallback
 * to index.html), opens it in the pinned Chrome for Testing with the
 * screen-reader accessibility mode, blocks every request to another host and
 * records it (the "no external credentials" and "deterministic data"
 * criteria), and records console and page errors, the title, the accessibility
 * roles present and an ARIA snapshot for each path. With `--fixed-time` the
 * page clock is fixed before load (Playwright's clock API, as journey setup
 * will do); with `--repeat n` each path is loaded n times in fresh contexts
 * and the ARIA snapshots are compared (the "deterministic data" criterion).
 * Install and build times are measured by the workflow. Every result is
 * EXPLORATORY.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { parseArgs } from "node:util";

import { chromium } from "playwright";

const { values: args } = parseArgs({
  options: {
    name: { type: "string" },
    dist: { type: "string" },
    out: { type: "string" },
    paths: { type: "string", default: "/" },
    "fixed-time": { type: "string" },
    repeat: { type: "string", default: "1" },
  },
});
if (args.name === undefined || args.dist === undefined || args.out === undefined) throw new Error("--name, --dist and --out are required");
const root = resolve(args.dist);
const outPath = resolve(args.out);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".webmanifest": "application/manifest+json",
};

function serve(): Promise<{ base: string; close: () => void }> {
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/");
    let file = normalize(join(root, path));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end();
      return;
    }
    // Single-page fallback: unknown paths and directories get index.html.
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, "index.html");
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise((done) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      done({ base: `http://127.0.0.1:${String(port)}`, close: () => server.close() });
    });
  });
}

interface AxNode {
  role?: { value?: string };
  ignored?: boolean;
}

async function main(): Promise<void> {
  const { base, close } = await serve();
  const browser = await chromium.launch({ headless: true, chromiumSandbox: true, args: ["--force-renderer-accessibility=screen-reader"] });
  const external: string[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const pages: Record<string, unknown>[] = [];
  const repeat = Math.max(1, Number(args.repeat));
  try {
    for (const path of args.paths.split(",")) {
      const snapshots: string[] = [];
      let record: Record<string, unknown> = {};
      for (let r = 0; r < repeat; r++) {
        // A fresh context per load, so nothing carries over between loads.
        const context = await browser.newContext();
        await context.route("**/*", async (route) => {
          const url = route.request().url();
          if (url.startsWith(base) || url.startsWith("data:") || url.startsWith("blob:")) await route.continue();
          else {
            external.push(url);
            await route.abort();
          }
        });
        const page = await context.newPage();
        page.on("console", (m) => {
          if (m.type() === "error") consoleErrors.push(m.text().slice(0, 300));
        });
        page.on("pageerror", (e) => pageErrors.push(e.message.slice(0, 300)));
        if (args["fixed-time"] !== undefined) await page.clock.setFixedTime(args["fixed-time"]);
        await page.goto(`${base}${path}`, { waitUntil: "load", timeout: 60_000 });
        await sleep(3000);
        const cdp = await context.newCDPSession(page);
        const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as { nodes: AxNode[] };
        await cdp.detach();
        const roles: Record<string, number> = {};
        for (const n of nodes) {
          const role = n.role?.value;
          if (n.ignored !== true && role !== undefined) roles[role] = (roles[role] ?? 0) + 1;
        }
        const snapshot = await page.locator("body").ariaSnapshot({ timeout: 10_000 }).catch((e: unknown) => `ariaSnapshot failed: ${String(e)}`);
        snapshots.push(snapshot);
        if (r === 0) record = { path, url: page.url(), title: await page.title(), roles, ariaSnapshot: snapshot.slice(0, 20_000) };
        await context.close();
      }
      pages.push({ ...record, loads: repeat, identicalAcrossLoads: snapshots.every((s) => s === snapshots[0]) });
    }
  } finally {
    await browser.close();
    close();
  }
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify({ label: "EXPLORATORY", name: args.name, fixedTime: args["fixed-time"] ?? null, external, consoleErrors, pageErrors, pages }, null, 2)}\n`);
}

await main();
