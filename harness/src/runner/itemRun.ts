/**
 * Item runner (`npm run m4:items`; HANDOFF §9 M4; DR-0066, DR-0067). Windows
 * only. One invocation is one job: one app, one leg.
 *
 *   node harness/src/runner/itemRun.ts --leg <nvda-absent|nvda-present> --app <app> --builds <dir> --out <dir>
 *     [--items id,id] [--sides both|base] [--reps n] [--shard i/N] [--no-canaries] [--no-axe]
 *
 * With `--shard i/N` the job runs every Nth of the app's selected items,
 * starting with the i-th (items sorted by id), so long blocks fit the job
 * time limit.
 *
 * Builds are read from `<builds>/<app key>/base` (the base side) and
 * `<builds>/<app key>/<item id>` (each candidate); an unchanged control's
 * candidate is the base build. The app key is the app with "/" replaced by
 * "-". Each build is served from 127.0.0.1 and every other host is blocked.
 *
 * Per item, in this leg (DR-0066):
 * 1. `assertItemExecutable` (DR-0034); test-split items never run here.
 * 2. A pre-block canary (K1), then the attempts in ABBA order (order.ts),
 *    then a post-block canary (K1). The post-block canary never converts
 *    outcomes (DR-0032).
 * 3. Each attempt: a fresh-profile Chrome with the locked accessibility mode;
 *    the DOM timeline in both legs; the B2 listener in the NVDA-absent leg
 *    (P4); the handover of HANDOFF §7.2 on the journey's anchor; the clock
 *    checks; then the journey. Each AT step is one segment: its action, or
 *    its goal-seeking attempts (P24), then its observation window with no
 *    input. At the end of each step the ARIA snapshot and the pruned
 *    accessibility tree are taken (Arm B).
 * 4. NVDA-present leg: AT steps go through NVDA as OS-level keys; speech is
 *    the relay tap. NVDA-absent leg: focus strategies and actions use
 *    Playwright input on the focused element, and browse strategies move the
 *    simulated virtual cursor (P23). axe then runs in its own browser context,
 *    replaying the journey with Playwright and analysing after each AT step
 *    (Arm A; DR-0024).
 * 5. After the block: PATH_CHANGED against the base side's most common
 *    attempt count per step (P24), evidence packages, and side-aware
 *    validity (itemValidity.ts; DR-0035).
 *
 * Output: `<out>/blocks/<item>.json.gz` (every attempt's raw record and
 * package) and `<out>/blocks-<job>.jsonl` (one summary line per item).
 * Every result is EXPLORATORY.
 */
import { createHash } from "node:crypto";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { createRequire } from "node:module";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { parseArgs } from "node:util";
import { gzipSync } from "node:zlib";

import { resolveSessionUserConfigPath } from "@guidepup/guidepup/lib/windows/NVDA/config/resolveSessionUserConfigPath.js";
import { quit as quitNvda } from "@guidepup/guidepup/lib/windows/NVDA/quit.js";
import { chromium } from "playwright";
import type { Browser, BrowserContext, CDPSession, Page } from "playwright";

import { GuidepupNvdaAdapter } from "../adapters/atAdapter.ts";
import { NVDA_SETTINGS } from "../adapters/nvda-settings.ts";
import { RelayTap } from "../adapters/relayTap.ts";
import type { TapEvent } from "../adapters/relayTap.ts";
import { adoptWallAnchor, captureWallAnchor } from "../clock/wallAnchor.ts";
import { qpcNowNs } from "../clock/qpc.ts";
import { LISTENER_EXE, ListenerProcess, toPlatformEvent } from "../collectors/listener.ts";
import type { ListenerEvent, ListenerReady } from "../collectors/listener.ts";
import { TIMELINE_DRAIN_SCRIPT, TIMELINE_INIT_SCRIPT, TIMELINE_VERSION } from "../collectors/mutationTimeline.ts";
import type { MappedTimelineEntry, TimelineEntry } from "../collectors/mutationTimeline.ts";
import { nvdaVersionFromLog, readEspeakSettings, scanNvdaLog } from "../probes/analysis.ts";
import type { EspeakSettings } from "../probes/analysis.ts";
import { WinHelper } from "../probes/winhelper.ts";
import { CorpusItemSchema, EnvManifestSchema, GateEvidencePackageSchema } from "../schema/schemas.ts";
import type { AtStep, CorpusItem, EnvManifest, GateEvidencePackage, Journey, Leg, Preflight, PressKey } from "../schema/types.ts";
import { flattenAxTree, pruneAxTree } from "./axTree.ts";
import type { AxNode, CdpAxNode } from "./axTree.ts";
import { evaluateGatingB2 } from "./b2Signature.ts";
import { GATING_SPECS } from "./canaries.ts";
import { LONG_WORK_INIT_SCRIPT, LONG_WORK_READ_SCRIPT, nativeSelfTest, pageClock, pageToQpcNs, RAF_GAPS_START_SCRIPT, RAF_PEEK_SCRIPT, RAF_READ_SCRIPT, segmentDriftMs, uncoveredGapMs } from "./clockChecks.ts";
import { goalOutcome, modalCount, nameMatches, nodeMatchesGoal, speechMatchesGoal } from "./goals.ts";
import { itemValidity } from "./itemValidity.ts";
import type { AttemptReason, Side } from "./itemValidity.ts";
import { checkJourneys } from "./journeys.ts";
import { abbaOrder, repetitionsFor } from "./order.ts";
import { evaluateAttempt } from "./outcome.ts";
import { SETUP_NAMES, SETUPS } from "./setups.ts";
import { assertItemExecutable } from "./splitGuard.ts";
import { inconclusiveReasons } from "./validity.ts";
import { indexOfBackend, lineAt, nextIndex } from "./virtualCursor.ts";

const EXPECTED_CHROME = "153.0.8010.12";
const CHROME_FLAGS = ["--force-renderer-accessibility=screen-reader"];
const PINGS = 16;
const SETTLE_MS = 1500;
const FOCUS_FIRST_READ_MS = 300;
const FOCUS_RETRY_MS = 100;
const FOCUS_RETRY_FOR_MS = 1000;
const ESPEAK_DEFAULT_RATE = 30;
/** Wait after each goal-seeking attempt before checking the goal: longer with NVDA, which must speak first. */
const ATTEMPT_SETTLE_MS = { "nvda-absent": 300, "nvda-present": 900 } as const;
/** Gives each document an id when it is created, so a full navigation can be told from a same-document one (DR-0074). */
const DOC_ID_SCRIPT = "window.__a11yDoc = crypto.randomUUID();";
const DOC_ID_READ = "window.__a11yDoc ?? null";

/** The page clock for apps whose data depend on today's date (P14), as epoch milliseconds (2026-10-05T09:00:00Z). */
const FIXED_TIME_MS: Record<string, number> = { "atomic-crm": 1_791_190_800_000 };

/**
 * Fixes the page's Date only (P14; DR-0069): it starts at the fixed instant and advances with
 * performance.now(). Playwright's clock API is not used, because it also fakes performance.now()
 * and requestAnimationFrame, which the D1 clock checks and the DOM timeline rely on. Built
 * without the tokens the clock policy forbids, since it runs in the page, not in a collector.
 */
function dateShim(startMs: number): string {
  return `(() => {
  const Real = globalThis.Date;
  const t0 = performance.now();
  const current = () => ${String(startMs)} + (performance.now() - t0);
  function Shim(...a) {
    if (!new.target) return Reflect.construct(Real, [current()]).toString();
    return Reflect.construct(Real, a.length === 0 ? [current()] : a, new.target);
  }
  Shim.prototype = Real.prototype;
  Shim.now = current;
  Shim.parse = Real.parse;
  Shim.UTC = Real.UTC;
  globalThis.Date = Shim;
})();`;
}
const CANARY_ANCHOR = "Start canary";

const { values: args } = parseArgs({
  options: {
    leg: { type: "string", default: "nvda-absent" },
    app: { type: "string" },
    builds: { type: "string", default: "builds" },
    out: { type: "string", default: "artefacts/items" },
    items: { type: "string", default: "" },
    sides: { type: "string", default: "both" },
    reps: { type: "string", default: "" },
    shard: { type: "string", default: "1/1" },
    env: { type: "string", default: "artefacts/env.json" },
    listener: { type: "string", default: LISTENER_EXE },
    "no-canaries": { type: "boolean", default: false },
    "no-axe": { type: "boolean", default: false },
  },
});

const legArg = args.leg;
if (legArg !== "nvda-present" && legArg !== "nvda-absent") throw new Error(`--leg must be nvda-present or nvda-absent, not ${legArg}`);
const leg: Leg = legArg;
if (args.app === undefined) throw new Error("--app is required");
const app: string = args.app;
if (args.sides !== "both" && args.sides !== "base") throw new Error("--sides must be both or base");
const repoRoot = resolve(import.meta.dirname, "../../..");
const outDir = resolve(args.out);
const appKey = app.replace("/", "-");
const shardParts = args.shard.split("/").map(Number);
const shardIndex: number = shardParts[0] ?? Number.NaN;
const shardCount: number = shardParts[1] ?? Number.NaN;
if (!Number.isInteger(shardIndex) || !Number.isInteger(shardCount) || shardIndex < 1 || shardIndex > shardCount) throw new Error(`--shard must be i/N with 1 <= i <= N, not ${args.shard}`);
const jobId = `${appKey}-${leg}-${String(shardIndex)}of${String(shardCount)}`;
const useListener = leg === "nvda-absent";
const runAxe = leg === "nvda-absent" && !args["no-axe"];
const listenerTmp = useListener ? mkdtempSync(join(tmpdir(), "a11y-listener-")) : null;
const axeSource = readFileSync(join(repoRoot, "node_modules/axe-core/axe.min.js"), "utf8");

type Json = Record<string, unknown>;

function errorText(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function packageVersion(name: string): string {
  const require = createRequire(import.meta.url);
  return (require(`${name}/package.json`) as { version: string }).version;
}

// ---------------------------------------------------------------------------
// Serving builds
// ---------------------------------------------------------------------------

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

const servers = new Map<string, { base: string; server: Server }>();

/** Serves a build directory from its own 127.0.0.1 port, with single-page fallback to index.html. */
async function serveDir(dir: string): Promise<string> {
  const existing = servers.get(dir);
  if (existing !== undefined) return existing.base;
  const root = resolve(dir);
  if (!existsSync(join(root, "index.html")) && !existsSync(join(root, "canary.html"))) throw new Error(`no build at ${root}`);
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/");
    let file = normalize(join(root, path));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) file = existsSync(join(root, "index.html")) ? join(root, "index.html") : join(root, "canary.html");
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
  servers.set(dir, { base, server });
  return base;
}

function buildDir(item: CorpusItem, side: Side): string {
  const key = side === "base" || item.expected.kind === "unchanged" ? "base" : item.id;
  return join(resolve(args.builds), appKey, key);
}

async function newContext(browser: Browser, base: string, external: string[]): Promise<BrowserContext> {
  const context = await browser.newContext();
  const fixed = FIXED_TIME_MS[app];
  if (fixed !== undefined) await context.addInitScript(dateShim(fixed));
  await context.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith(base) || url.startsWith("data:") || url.startsWith("blob:")) await route.continue();
    else {
      external.push(url);
      await route.abort();
    }
  });
  return context;
}

async function openPage(context: BrowserContext, url: string, errors: string[]): Promise<Page> {
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 300)));
  await page.goto(url, { waitUntil: "load" });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(1000);
  return page;
}

// ---------------------------------------------------------------------------
// The accessibility tree and focus, through CDP
// ---------------------------------------------------------------------------

const DEEP_ACTIVE = "(() => { let a = document.activeElement; while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement; return a; })()";

async function fullTree(cdp: CDPSession): Promise<AxNode[]> {
  const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as { nodes: CdpAxNode[] };
  return pruneAxTree(nodes);
}

/** The accessibility node of the deep active element (its name, role and backend id), or null. */
async function focusedNode(cdp: CDPSession): Promise<{ name: string; role: string; backendId?: number } | null> {
  const { result } = (await cdp.send("Runtime.evaluate", { expression: DEEP_ACTIVE })) as { result: { objectId?: string } };
  if (result.objectId === undefined) return null;
  const { nodes } = (await cdp.send("Accessibility.getPartialAXTree", { objectId: result.objectId, fetchRelatives: false })) as { nodes: CdpAxNode[] };
  const node = pruneAxTree(nodes)[0];
  await cdp.send("Runtime.releaseObject", { objectId: result.objectId }).catch(() => undefined);
  return node === undefined ? null : { name: node.name, role: node.role, ...(node.backendId === undefined ? {} : { backendId: node.backendId }) };
}

/** The anchor's accessible name, from Chrome's accessibility tree (the handover compares it with the MSAA focus read). */
async function anchorName(cdp: CDPSession, selector: string): Promise<string> {
  const { result } = (await cdp.send("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(selector)})` })) as { result: { objectId?: string } };
  if (result.objectId === undefined) throw new Error(`anchor ${selector} not found`);
  try {
    const { nodes } = (await cdp.send("Accessibility.getPartialAXTree", { objectId: result.objectId, fetchRelatives: false })) as { nodes: CdpAxNode[] };
    return pruneAxTree(nodes)[0]?.name ?? "";
  } finally {
    await cdp.send("Runtime.releaseObject", { objectId: result.objectId }).catch(() => undefined);
  }
}

async function clickBackend(cdp: CDPSession, backendId: number): Promise<void> {
  const { object } = (await cdp.send("DOM.resolveNode", { backendNodeId: backendId })) as { object: { objectId?: string } };
  if (object.objectId === undefined) throw new Error("cursor node is not in the DOM");
  // The browse cursor's default action, as NVDA's Enter performs it in browse mode: a click without pointer events.
  await cdp.send("Runtime.callFunctionOn", { objectId: object.objectId, functionDeclaration: "function () { (this.nodeType === 1 ? this : this.parentElement).click(); }" });
}

// ---------------------------------------------------------------------------
// NVDA
// ---------------------------------------------------------------------------

interface NvdaRun {
  adapter: GuidepupNvdaAdapter;
  tap: RelayTap;
  logPath: string;
  synthOk: boolean;
  nvdaVersion: string | null;
  espeak: EspeakSettings | { error: string };
}

async function startNvda(): Promise<NvdaRun> {
  const adapter = new GuidepupNvdaAdapter();
  const logPath = join(process.env.TEMP ?? tmpdir(), "nvda.log");
  await adapter.start();
  const tap = await RelayTap.attach({ caPath: adapter.relayCaPath() });
  await sleep(2000);
  const log = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
  const scan = scanNvdaLog(log);
  const synthOk = scan.synthsLoaded.length > 0 && scan.synthsLoaded.every((s) => s === "espeak") && scan.audioErrors.length === 0;
  const ini = join(resolveSessionUserConfigPath(), "nvda.ini");
  const espeak = existsSync(ini) ? readEspeakSettings(readFileSync(ini, "utf8")) : { error: `no session nvda.ini at ${ini}` };
  return { adapter, tap, logPath, synthOk, nvdaVersion: nvdaVersionFromLog(log), espeak };
}

async function waitForBufferLoad(path: string, offset: number, timeoutMs: number): Promise<boolean> {
  const deadline = qpcNowNs() + timeoutMs * 1e6;
  while (qpcNowNs() < deadline) {
    const text = existsSync(path) ? readFileSync(path).subarray(offset).toString("utf8") : "";
    if (scanNvdaLog(text).bufferLoads > 0) return true;
    await sleep(200);
  }
  return false;
}

const NVDA_KEYS: Record<Exclude<AtStep["strategy"], "TYPE" | "PRESS" | "READ_CURRENT" | "FOCUS_MODE_TOGGLE">, string> = {
  TAB: "Tab",
  SHIFT_TAB: "Shift+Tab",
  NEXT_HEADING: "h",
  NEXT_FORM_FIELD: "f",
  NEXT_BUTTON: "b",
  NEXT_LANDMARK: "d",
  BROWSE_NEXT: "ArrowDown",
  ACTIVATE: "Enter",
  DOCUMENT_TOP: "Control+Home",
};

/** Playwright key names for PRESS (P25). */
const PLAYWRIGHT_KEYS: Record<PressKey, string> = {
  Escape: "Escape",
  Space: " ",
  Enter: "Enter",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  Home: "Home",
  End: "End",
};

const BROWSE: ReadonlySet<string> = new Set(["NEXT_HEADING", "NEXT_FORM_FIELD", "NEXT_BUTTON", "NEXT_LANDMARK", "BROWSE_NEXT", "READ_CURRENT"]);

// ---------------------------------------------------------------------------
// Environment and manifest
// ---------------------------------------------------------------------------

interface EnvSnapshot {
  imageOS?: string;
  imageVersion?: string;
  windows?: { currentBuild?: string; ubr?: number };
  audio?: { endpoints?: unknown; services?: unknown };
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value === null || value === undefined ? [] : [value];
}

function audioState(env: EnvSnapshot): { endpointCount: number; audiosrvRunning: boolean; driver?: string } {
  const endpoints = asArray(env.audio?.endpoints).filter((e) => (e as { status?: string }).status === "OK");
  const services = asArray(env.audio?.services) as { name?: string; status?: string }[];
  const driver = (endpoints[0] as { name?: string } | undefined)?.name;
  return { endpointCount: endpoints.length, audiosrvRunning: services.some((s) => s.name === "Audiosrv" && s.status === "Running"), ...(driver === undefined ? {} : { driver }) };
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

interface Runtime {
  page: Page;
  cdp: CDPSession;
  helper: WinHelper;
  hwnd: number;
  nvda: NvdaRun | null;
  /** The simulated virtual cursor's node (NVDA-absent leg; P23). */
  cursor: { backendId?: number };
  /** The focused node when last read, so the cursor can follow focus as NVDA's browse cursor does. */
  focusBackend?: number;
  /** Set by DOCUMENT_TOP: the next browse step starts before the first line (P26). */
  cursorAtTop?: boolean;
}

/** Moves the simulated cursor to the focused node whenever focus has moved since it was last read. */
async function followFocus(rt: Runtime): Promise<{ backendId?: number } | null> {
  const f = await focusedNode(rt.cdp);
  if (f?.backendId !== rt.focusBackend) {
    rt.focusBackend = f?.backendId;
    rt.cursor = f?.backendId === undefined ? {} : { backendId: f.backendId };
    rt.cursorAtTop = false;
  }
  return f;
}

interface GoalTrace {
  attempt: number;
  node?: { name: string; role: string } | null;
  /** The whole line under the simulated cursor, for line strategies (NVDA-absent leg). */
  line?: { name: string; role: string }[];
  speech?: string[];
}

interface StepRun {
  stepId: string;
  kind: "at" | "setup";
  segmentId?: string;
  startedAt?: number;
  observeFrom?: number;
  endedAt?: number;
  strategy?: AtStep["strategy"];
  goalBased?: boolean;
  /** The attempt that met the goal; null when it was not met. */
  reachedAt?: number | null;
  outcome?: "REACHED" | "PATH_CHANGED" | "UNREACHABLE" | "ENV_FAILURE";
  goalTrace?: GoalTrace[];
  focusAtEnd?: { name: string; role: string } | null;
  ariaSnapshot?: string;
  axTree?: AxNode[];
  error?: string;
}

/** One AT action, in this leg (P23, P25). In the NVDA-absent leg a browse action also records the cursor's node for the goal check. */
async function act(rt: Runtime, step: AtStep, absent: boolean): Promise<void> {
  const { page, cdp } = rt;
  if (!absent) {
    if (rt.nvda === null) throw new Error("no NVDA in the NVDA-present leg");
    if (step.strategy === "TYPE") for (const ch of step.text ?? "") await rt.nvda.adapter.press(ch === " " ? "Space" : ch);
    else if (step.strategy === "PRESS") await rt.nvda.adapter.press(step.key ?? "");
    else if (step.strategy === "READ_CURRENT") await rt.nvda.adapter.readCurrent();
    else if (step.strategy === "FOCUS_MODE_TOGGLE") await rt.nvda.adapter.toggleFocusMode();
    else await rt.nvda.adapter.press(NVDA_KEYS[step.strategy]);
    return;
  }
  // Focus may have moved since the last action (the page's own doing); the cursor follows it.
  const focused = await followFocus(rt);
  switch (step.strategy) {
    case "TAB":
    case "SHIFT_TAB":
      await page.keyboard.press(step.strategy === "TAB" ? "Tab" : "Shift+Tab");
      await followFocus(rt);
      return;
    case "ACTIVATE":
      if (rt.cursor.backendId !== undefined && rt.cursor.backendId !== focused?.backendId) await clickBackend(cdp, rt.cursor.backendId);
      else await page.keyboard.press("Enter");
      await followFocus(rt);
      return;
    case "TYPE":
      await page.keyboard.type(step.text ?? "");
      await followFocus(rt);
      return;
    case "PRESS":
      await page.keyboard.press(PLAYWRIGHT_KEYS[step.key ?? "Enter"]);
      await followFocus(rt);
      return;
    // P26: NVDA's mode switch has no counterpart without NVDA; the top of the document puts the
    // simulated cursor before the first line, as Control+Home puts NVDA's browse cursor.
    case "FOCUS_MODE_TOGGLE":
      return;
    case "DOCUMENT_TOP":
      rt.cursor = {};
      rt.cursorAtTop = true;
      return;
    default: {
      const flat = flattenAxTree(await fullTree(cdp));
      let from = rt.cursorAtTop === true ? -1 : indexOfBackend(flat, rt.cursor.backendId);
      if (from < 0 && rt.cursorAtTop !== true) from = indexOfBackend(flat, focused?.backendId);
      rt.cursorAtTop = false;
      const idx = nextIndex(flat, from, step.strategy);
      const node = idx === null ? undefined : flat[idx];
      if (node?.backendId !== undefined) rt.cursor = { backendId: node.backendId };
      // Line strategies read the whole line; quick navigation reads the node it lands on.
      const line = idx === null ? [] : step.strategy === "BROWSE_NEXT" || step.strategy === "READ_CURRENT" ? lineAt(flat, idx).flatMap((i) => (flat[i] === undefined ? [] : [flat[i]])) : node === undefined ? [] : [node];
      cursorLine.set(rt, line);
    }
  }
}

/** The nodes under the simulated cursor after the last browse action (NVDA-absent leg): one node, or one line. */
const cursorLine = new WeakMap<Runtime, AxNode[]>();

async function goalTarget(rt: Runtime, step: AtStep, absent: boolean, since: number): Promise<GoalTrace> {
  if (absent) {
    if (BROWSE.has(step.strategy)) {
      const line = cursorLine.get(rt) ?? [];
      return { attempt: 0, node: line[0] === undefined ? null : { name: line[0].name, role: line[0].role }, line: line.map((x) => ({ name: x.name, role: x.role })) };
    }
    const f = await focusedNode(rt.cdp);
    return { attempt: 0, node: f === null ? null : { name: f.name, role: f.role } };
  }
  if (!BROWSE.has(step.strategy)) {
    const m = await rt.helper.msaaFocus(rt.hwnd);
    return { attempt: 0, node: { name: m.name ?? "", role: m.roleText ?? "" } };
  }
  const speech = (rt.nvda?.tap.between(since, qpcNowNs()) ?? []).filter((e): e is Extract<TapEvent, { kind: "speak" }> => e.kind === "speak").map((e) => e.text);
  return { attempt: 0, speech };
}

/** One AT step. `afterAction` runs after each action, before the goal check (the timeline drain and rAF reading; DR-0074). */
async function runAtStep(rt: Runtime, step: AtStep, segmentId: string, absent: boolean, afterAction: () => Promise<void>): Promise<StepRun> {
  const run: StepRun = { stepId: step.id, kind: "at", segmentId, strategy: step.strategy, goalBased: step.until !== undefined, startedAt: qpcNowNs(), goalTrace: [] };
  const goal = step.until;
  const attempts = goal?.maxAttempts ?? 1;
  run.reachedAt = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const since = qpcNowNs();
    await act(rt, step, absent);
    await sleep(ATTEMPT_SETTLE_MS[leg]);
    await afterAction();
    if (goal === undefined) {
      run.reachedAt = 1;
      break;
    }
    const target = { ...(await goalTarget(rt, step, absent, since)), attempt };
    run.goalTrace?.push(target);
    const met = target.speech !== undefined ? speechMatchesGoal(target.speech, goal) : target.line !== undefined ? target.line.some((x) => nodeMatchesGoal(x, goal)) : target.node != null && nodeMatchesGoal(target.node, goal);
    if (met) {
      run.reachedAt = attempt;
      break;
    }
  }
  // The observation window: no input of any kind (D4).
  run.observeFrom = qpcNowNs();
  await sleep(step.observeMs);
  run.endedAt = qpcNowNs();
  run.outcome = run.reachedAt === null ? "UNREACHABLE" : "REACHED";
  if (absent) {
    const f = await focusedNode(rt.cdp);
    run.focusAtEnd = f === null ? null : { name: f.name, role: f.role };
  } else {
    const m = await rt.helper.msaaFocus(rt.hwnd);
    run.focusAtEnd = { name: m.name ?? "", role: m.roleText ?? "" };
  }
  run.ariaSnapshot = await rt.page.locator("body").ariaSnapshot().catch((e: unknown) => `error: ${errorText(e)}`);
  run.axTree = await fullTree(rt.cdp);
  return run;
}

// ---------------------------------------------------------------------------
// Arm A: axe in its own browser context (DR-0024)
// ---------------------------------------------------------------------------

interface AxeSummary {
  violations: { id: string; impact: string | null; targets: string[] }[];
  incomplete: { id: string; targets: string[] }[];
  error?: string;
}

interface AxeResultLike {
  violations: { id: string; impact?: string | null; nodes: { target: unknown[] }[] }[];
  incomplete: { id: string; nodes: { target: unknown[] }[] }[];
}

async function analyse(page: Page): Promise<AxeSummary> {
  await page.evaluate(axeSource);
  const r = await page.evaluate<AxeResultLike>(`axe.run(document, { resultTypes: ["violations", "incomplete"] })`);
  const targets = (nodes: { target: unknown[] }[]): string[] => nodes.map((n) => n.target.map(String).join(" "));
  return {
    violations: r.violations.map((v) => ({ id: v.id, impact: v.impact ?? null, targets: targets(v.nodes) })),
    incomplete: r.incomplete.map((v) => ({ id: v.id, targets: targets(v.nodes) })),
  };
}

async function axePass(browser: Browser, base: string, journey: Journey): Promise<Map<string, AxeSummary>> {
  const out = new Map<string, AxeSummary>();
  const external: string[] = [];
  const errors: string[] = [];
  const context = await newContext(browser, base, external);
  try {
    const page = await openPage(context, base + journey.entryUrl, errors);
    const cdp = await context.newCDPSession(page);
    const rt: Runtime = { page, cdp, helper: undefined as unknown as WinHelper, hwnd: 0, nvda: null, cursor: {} };
    const firstAt = journey.steps.findIndex((s) => s.kind === "at");
    for (const step of journey.steps.slice(0, firstAt)) if (step.kind === "setup") await SETUPS[step.fn]?.(page);
    if (journey.anchor !== "body") await page.locator(journey.anchor).first().focus();
    await followFocus(rt);
    for (const step of journey.steps.slice(firstAt)) {
      if (step.kind === "setup") {
        await SETUPS[step.fn]?.(page);
        continue;
      }
      const goal = step.until;
      let met = goal === undefined;
      for (let attempt = 1; attempt <= (goal?.maxAttempts ?? 1); attempt++) {
        await act(rt, step, true);
        await sleep(ATTEMPT_SETTLE_MS["nvda-absent"]);
        if (goal === undefined) break;
        const t = await goalTarget(rt, step, true, 0);
        if (t.line !== undefined ? t.line.some((x) => nodeMatchesGoal(x, goal)) : t.node != null && nodeMatchesGoal(t.node, goal)) {
          met = true;
          break;
        }
      }
      await sleep(step.observeMs);
      out.set(step.id, await analyse(page).catch((e: unknown) => ({ violations: [], incomplete: [], error: errorText(e) })));
      if (!met) break;
    }
  } finally {
    await context.close();
  }
  return out;
}

// ---------------------------------------------------------------------------
// The K1 known-answer canary bracketing each block (HANDOFF §7.4; DR-0066)
// ---------------------------------------------------------------------------

async function runK1(ctx: JobContext): Promise<Json> {
  const spec = GATING_SPECS.find((s) => s.canary === "K1");
  if (spec === undefined) throw new Error("no K1 spec");
  const record: Json = { canary: "K1" };
  let browser: Browser | undefined;
  let listener: ListenerProcess | undefined;
  try {
    const base = await serveDir(join(repoRoot, "fixtures/canaries"));
    browser = await chromium.launch({ headless: false, chromiumSandbox: true, args: CHROME_FLAGS });
    const context = await browser.newContext();
    await context.addInitScript(TIMELINE_INIT_SCRIPT);
    const page = await context.newPage();
    await page.goto(`${base}/canary.html${spec.query}`);
    const cdpB = await browser.newBrowserCDPSession();
    const { processInfo } = (await cdpB.send("SystemInfo.getProcessInfo")) as { processInfo: { type: string; id: number }[] };
    await cdpB.detach();
    const pid = processInfo.find((p) => p.type === "browser")?.id;
    if (pid === undefined) throw new Error("no browser process");
    const win = (await ctx.helper.windowsForPid(pid)).find((w) => w.class === "Chrome_WidgetWin_1");
    if (win === undefined) throw new Error("no Chrome window");
    if (listenerTmp !== null) {
      listener = await ListenerProcess.start({ exe: args.listener, pid, outPath: join(listenerTmp, `k1-${String(qpcNowNs())}.jsonl`) });
      const ready = listener.ready;
      if (ready !== null && ready.hooks !== ready.ranges) record.listenerFailure = `hooks installed ${String(ready.hooks)} of ${String(ready.ranges)}`;
    }
    await ctx.helper.activate(win.hwnd);
    await page.locator("#start").focus();
    await sleep(FOCUS_FIRST_READ_MS);
    // P10 (DR-0051): retry the MSAA read every 100 ms, within 1 s of the first read, as the canary runner does.
    const retryUntil = qpcNowNs() + FOCUS_RETRY_FOR_MS * 1e6;
    let msaa = await ctx.helper.msaaFocus(win.hwnd);
    let focusReads = 1;
    while (msaa.name !== CANARY_ANCHOR && qpcNowNs() + FOCUS_RETRY_MS * 1e6 <= retryUntil) {
      await sleep(FOCUS_RETRY_MS);
      msaa = await ctx.helper.msaaFocus(win.hwnd);
      focusReads++;
    }
    record.focusOk = msaa.name === CANARY_ANCHOR;
    record.focusReads = focusReads;
    const clock = await pageClock(page, PINGS, false);
    await sleep(SETTLE_MS);
    const activationT = qpcNowNs();
    if (ctx.nvda !== null) await ctx.nvda.adapter.press("Enter");
    else await page.locator("#start").click();
    await sleep(spec.observeMs);
    const endT = qpcNowNs();
    if (ctx.nvda !== null) {
      const outcome = evaluateAttempt(spec, ctx.nvda.tap.between(activationT, endT), activationT);
      record.outcome = outcome;
      record.ok = record.focusOk === true && outcome.kind === "gating" && outcome.verdict === "PASS";
    } else {
      const timeline: MappedTimelineEntry[] = (await page.evaluate<TimelineEntry[]>(TIMELINE_DRAIN_SCRIPT)).map((e) => ({ ...e, tQpc: pageToQpcNs(e.t, clock) }));
      const drained = listener === undefined ? null : await listener.stop();
      listener = undefined;
      // An incomplete collector fails the canary even when its surviving events match (DR-0074).
      if (drained !== null && !drained.drained) record.listenerFailure ??= `not drained (${String(drained.remaining)} events still queued)`;
      else if (drained !== null && drained.malformed > 0) record.listenerFailure ??= `${String(drained.malformed)} malformed output lines`;
      const b2 = drained === null ? null : evaluateGatingB2("K1", drained.events, timeline, { activationT, endT });
      record.b2 = b2;
      record.ok = record.focusOk === true && record.listenerFailure === undefined && b2?.verdict === "PASS";
    }
  } catch (error) {
    record.ok = false;
    record.error = errorText(error);
  } finally {
    listener?.kill();
    await browser?.close();
  }
  return record;
}

// ---------------------------------------------------------------------------
// Attempts and blocks
// ---------------------------------------------------------------------------

interface JobContext {
  helper: WinHelper;
  manifest: EnvManifest;
  manifestValid: boolean;
  audio: { endpointCount: number; audiosrvRunning: boolean };
  nvda: NvdaRun | null;
}

interface AttemptRecord extends Json {
  side: Side;
  orderIndex: number;
  repetition: number;
  reasons: AttemptReason[];
  steps: StepRun[];
}

async function runAttempt(item: CorpusItem, journey: Journey, side: Side, orderIndex: number, repetition: number, preCanaryOk: boolean, ctx: JobContext): Promise<AttemptRecord> {
  const record: AttemptRecord = { itemId: item.id, side, orderIndex, repetition, leg, reasons: [], steps: [] };
  let browser: Browser | undefined;
  let listener: ListenerProcess | undefined;
  const failure: { listener: string | null } = { listener: null };
  let preActivation: AttemptReason[] | null = null;
  const external: string[] = [];
  const pageErrors: string[] = [];
  try {
    const base = await serveDir(buildDir(item, side));
    const logOffset = ctx.nvda !== null && existsSync(ctx.nvda.logPath) ? statSync(ctx.nvda.logPath).size : 0;
    browser = await chromium.launch({ headless: false, chromiumSandbox: true, args: CHROME_FLAGS });
    const chromeVersion = browser.version();
    const context = await newContext(browser, base, external);
    await context.addInitScript(DOC_ID_SCRIPT);
    await context.addInitScript(LONG_WORK_INIT_SCRIPT);
    await context.addInitScript(TIMELINE_INIT_SCRIPT);
    const page = await openPage(context, base + journey.entryUrl, pageErrors);
    const cdp = await context.newCDPSession(page);
    const firstAt = journey.steps.findIndex((s) => s.kind === "at");
    // Setup before the handover establishes the journey's starting state (Playwright only).
    for (const step of journey.steps.slice(0, firstAt)) {
      if (step.kind !== "setup") continue;
      const fn = SETUPS[step.fn];
      if (fn === undefined) throw new Error(`unknown setup ${step.fn}`);
      await fn(page);
      record.steps.push({ stepId: step.id, kind: "setup" });
    }
    const cdpB = await browser.newBrowserCDPSession();
    const { processInfo } = (await cdpB.send("SystemInfo.getProcessInfo")) as { processInfo: { type: string; id: number }[] };
    await cdpB.detach();
    const browserPid = processInfo.find((p) => p.type === "browser")?.id;
    if (browserPid === undefined) throw new Error("no browser process");
    const win = (await ctx.helper.windowsForPid(browserPid)).find((w) => w.class === "Chrome_WidgetWin_1");
    if (win === undefined) throw new Error("no Chrome window");
    if (listenerTmp !== null) {
      try {
        listener = await ListenerProcess.start({ exe: args.listener, pid: browserPid, outPath: join(listenerTmp, `${item.id}-${String(orderIndex)}.jsonl`) });
        const ready = listener.ready;
        if (ready !== null && ready.hooks !== ready.ranges) {
          failure.listener = `hooks installed ${String(ready.hooks)} of ${String(ready.ranges)}`;
          listener.kill();
          listener = undefined;
        }
      } catch (error) {
        failure.listener = `start: ${errorText(error)}`;
      }
    }

    // Handover (HANDOFF §7.2) on the journey's anchor.
    await ctx.helper.activate(win.hwnd);
    const foregroundOk = (await ctx.helper.foreground()).hwnd === win.hwnd;
    // The anchor "body" stands for the document, for pages with nothing focusable: no DOM focus call, and the
    // platform focus read must name the document (its title).
    if (journey.anchor !== "body") await page.locator(journey.anchor).first().focus();
    const wanted = journey.anchor === "body" ? await page.title() : await anchorName(cdp, journey.anchor);
    await sleep(FOCUS_FIRST_READ_MS);
    const retryUntil = qpcNowNs() + FOCUS_RETRY_FOR_MS * 1e6;
    let msaa = await ctx.helper.msaaFocus(win.hwnd);
    let focusReads = 1;
    const focusMatches = (): boolean => wanted !== "" && nameMatches(wanted, msaa.name ?? "") && nameMatches(msaa.name ?? "", wanted);
    while (!focusMatches() && qpcNowNs() + FOCUS_RETRY_MS * 1e6 <= retryUntil) {
      await sleep(FOCUS_RETRY_MS);
      msaa = await ctx.helper.msaaFocus(win.hwnd);
      focusReads++;
    }
    Object.assign(record, { anchor: { selector: journey.anchor, name: wanted }, msaa, focusReads });
    let injectionMarkerOk: boolean | undefined;
    if (ctx.nvda !== null) {
      const modules = await ctx.helper.modules(browserPid, "nvdaHelperRemote");
      const bufferLoaded = await waitForBufferLoad(ctx.nvda.logPath, logOffset, 10_000);
      injectionMarkerOk = (modules.modules?.length ?? 0) > 0 && bufferLoaded;
      record.injection = { modules: modules.modules ?? [], bufferLoaded };
    }
    const helperNative = await nativeSelfTest(ctx.helper, PINGS);
    let listenerNative: { disagreementMs: number } | null = null;
    if (listener !== undefined) {
      try {
        listenerNative = await nativeSelfTest(listener, PINGS);
      } catch (error) {
        failure.listener ??= `ping: ${errorText(error)}`;
      }
    }
    const native = Math.max(helperNative.disagreementMs, listenerNative?.disagreementMs ?? 0);
    const clockStart = await pageClock(page, PINGS, true);
    await page.evaluate(RAF_GAPS_START_SCRIPT);
    await sleep(SETTLE_MS);
    // One page clock per document (HANDOFF §7.3: recompute the mapping after every full navigation;
    // DR-0074). A document is identified by the id DOC_ID_SCRIPT gives it, so a same-document
    // navigation (a hash route) keeps its clock and rAF heartbeat. The timeline is drained, and the
    // rAF heartbeat read, before each AT step's first action and after each action, so a full
    // navigation loses at most the entries of the one action that caused it; drift is read at each
    // step's start and end. A document a navigation replaced before any drift reading is counted
    // as unmeasured, never as a failure (the page may have caused the navigation, DR-0032).
    // P27 (DR-0076): each document keeps its frame gaps and its own long work; only the part of a gap
    // that the work does not cover counts towards CLOCK_RAF_GAP.
    interface DocClock { index: number; id: string | null; clock: typeof clockStart; driftMs: number; rafGapMs: number; measured: boolean; gaps: [number, number][]; work: [number, number][] }
    const docIdNow = async (): Promise<string | null> => (await page.evaluate<string | null>(DOC_ID_READ).catch(() => null)) ?? null;
    let doc: DocClock = { index: 0, id: await docIdNow(), clock: clockStart, driftMs: 0, rafGapMs: 0, measured: false, gaps: [], work: [] };
    const docs: DocClock[] = [doc];
    const timeline: MappedTimelineEntry[] = [];
    const drain = async (): Promise<void> => {
      const current = doc;
      timeline.push(...(await page.evaluate<TimelineEntry[]>(TIMELINE_DRAIN_SCRIPT)).map((e) => ({ ...e, tQpc: pageToQpcNs(e.t, current.clock), doc: current.index })));
    };
    const sync = async (withDrift: boolean): Promise<void> => {
      const id = await docIdNow();
      if (id !== null && id !== doc.id) {
        // A new document: the old one is gone with its last readings; this one gets its own clock.
        await page.waitForLoadState("load").catch(() => undefined);
        const clock = await pageClock(page, PINGS, true);
        await page.evaluate(RAF_GAPS_START_SCRIPT);
        doc = { index: doc.index + 1, id, clock, driftMs: 0, rafGapMs: 0, measured: false, gaps: [], work: [] };
        docs.push(doc);
      }
      await drain();
      const r = await page.evaluate<{ maxGapMs: number | null; gaps?: [number, number][] } | null>(RAF_PEEK_SCRIPT);
      doc.rafGapMs = Math.max(doc.rafGapMs, r?.maxGapMs ?? Number.POSITIVE_INFINITY);
      if (r === null) doc.gaps = [[0, Number.POSITIVE_INFINITY]];
      else doc.gaps = r.gaps ?? [];
      doc.work = await page.evaluate<[number, number][]>(LONG_WORK_READ_SCRIPT).catch(() => doc.work);
      if (withDrift) {
        doc.driftMs = Math.max(doc.driftMs, await segmentDriftMs(page, doc.clock, 8));
        doc.measured = true;
      }
    };
    const worst = (f: (d: DocClock) => number): number => Math.max(...docs.map(f));
    const buildPreflight = (drift: number, rafGap: number): Preflight => ({
      foregroundHwndOk: foregroundOk && focusMatches(),
      preCanaryOk,
      manifestValid: ctx.manifestValid && chromeVersion === EXPECTED_CHROME,
      clock: { nativeSelfTestDisagreementMs: native, pageMappingUncertaintyMs: worst((d) => d.clock.uncertaintyMs), segmentDriftMs: drift, timeTicksHighResolution: docs.every((d) => d.clock.highResolution === true), maxRafGapMs: rafGap },
      ...(ctx.nvda === null ? {} : { injectionMarkerOk: injectionMarkerOk === true, audioOk: ctx.audio.endpointCount >= 1 && ctx.audio.audiosrvRunning, synthOk: ctx.nvda.synthOk }),
    });
    preActivation = inconclusiveReasons(buildPreflight(0, 0), leg);

    // The journey: one segment per AT step (P24).
    const focused = await focusedNode(cdp);
    const rt: Runtime = { page, cdp, helper: ctx.helper, hwnd: win.hwnd, nvda: ctx.nvda, cursor: focused?.backendId === undefined ? {} : { backendId: focused.backendId }, ...(focused?.backendId === undefined ? {} : { focusBackend: focused.backendId }) };
    const notRun: string[] = [];
    let stopped = false;
    let envFailure: string | null = null;
    for (const step of journey.steps.slice(firstAt)) {
      if (stopped) {
        notRun.push(step.id);
        continue;
      }
      if (step.kind === "setup") {
        try {
          const fn = SETUPS[step.fn];
          if (fn === undefined) throw new Error(`unknown setup ${step.fn}`);
          await fn(page);
          record.steps.push({ stepId: step.id, kind: "setup" });
        } catch (error) {
          envFailure = errorText(error);
          record.steps.push({ stepId: step.id, kind: "setup", error: envFailure });
        }
        continue;
      }
      const segmentId = `${jobId}-${item.id}-${String(orderIndex)}-${step.id}`;
      if (envFailure !== null) {
        record.steps.push({ stepId: step.id, kind: "at", segmentId, strategy: step.strategy, outcome: "ENV_FAILURE", error: envFailure, startedAt: qpcNowNs(), endedAt: qpcNowNs() });
        stopped = true;
        continue;
      }
      await sync(true);
      const run = await runAtStep(rt, step, segmentId, leg === "nvda-absent", () => sync(false));
      record.steps.push(run);
      await sync(true);
      if (run.outcome === "UNREACHABLE") stopped = true;
    }
    record.notRun = notRun;

    await sync(true);
    const raf = await page.evaluate<{ maxGapMs: number | null; frames: number }>(RAF_READ_SCRIPT);
    doc.rafGapMs = Math.max(doc.rafGapMs, raf.maxGapMs ?? Number.POSITIVE_INFINITY);
    const driftMs = worst((d) => d.driftMs);
    // The gap judged is the uncovered one (P27); the raw largest gap is kept for the record.
    const rawRafGapMs = worst((d) => d.rafGapMs);
    const rafGapMs = worst((d) => uncoveredGapMs(d.gaps, d.work));
    let events: ListenerEvent[] | null = null;
    if (listener !== undefined) {
      try {
        const drained = await listener.stop();
        if (!drained.drained) failure.listener ??= `not drained (${String(drained.remaining)} events still queued)`;
        else if (drained.malformed > 0) failure.listener ??= `${String(drained.malformed)} malformed output lines`;
        else events = drained.events;
      } catch (error) {
        failure.listener ??= `stop: ${errorText(error)}`;
      }
      listener = undefined;
    }
    record.reasons = inconclusiveReasons(buildPreflight(driftMs, rafGapMs), leg);
    const axe = runAxe ? await axePass(browser, base, journey).catch((e: unknown) => new Map([["error", { violations: [], incomplete: [], error: errorText(e) }]])) : null;
    Object.assign(record, {
      chromeVersion,
      timeline,
      timelineVersion: TIMELINE_VERSION,
      listenerEvents: events,
      ...(failure.listener === null ? {} : { listenerFailure: failure.listener }),
      // B2's platform events are complete only when the listener ran without failure (P13: a listener
      // failure is a failure of the instrument, never INCONCLUSIVE; DR-0074).
      b2Evidence: listenerTmp === null ? "not-in-leg" : events === null ? "missing" : "complete",
      clock: { native, driftMs, rafGapMs, rawRafGapMs, raf, unmeasuredDocuments: docs.filter((d) => !d.measured).length, documents: docs.map((d) => ({ index: d.index, measured: d.measured, uncertaintyMs: d.clock.uncertaintyMs, highResolution: d.clock.highResolution, driftMs: d.driftMs, rawRafGapMs: d.rafGapMs, uncoveredRafGapMs: uncoveredGapMs(d.gaps, d.work), gaps: d.gaps, longWork: d.work, navigationStartS: d.clock.navigationStartS, mappingOffsetNs: d.clock.mappingOffsetNs })) },
      preflight: buildPreflight(driftMs, rafGapMs),
      maxClockSkewMs: Math.max(native, worst((d) => d.clock.uncertaintyMs)),
      speechEvents: ctx.nvda === null ? null : ctx.nvda.tap.between(record.steps.find((s) => s.startedAt !== undefined)?.startedAt ?? 0, qpcNowNs()),
      axe: axe === null ? null : Object.fromEntries(axe),
    });
  } catch (error) {
    record.error = errorText(error);
    // A setup error before activation is an ENV_FAILURE of this side (P13; DR-0066). After
    // activation, validity rests on the checks completed before it (DR-0032).
    record.reasons = preActivation ?? ["ENV_FAILURE"];
    if (preActivation !== null) record.errorAfterActivation = true;
    if (failure.listener !== null) record.listenerFailure = failure.listener;
    record.b2Evidence = listenerTmp === null ? "not-in-leg" : "missing";
  } finally {
    listener?.kill();
    await browser?.close();
  }
  Object.assign(record, { external, pageErrors });
  return record;
}

function packageFor(item: CorpusItem, rec: AttemptRecord, manifest: EnvManifest, canaries: { pre: boolean; post: boolean }): GateEvidencePackage | null {
  if (rec.preflight === undefined) return null;
  const timeline = (rec.timeline ?? []) as MappedTimelineEntry[];
  const events = (rec.listenerEvents ?? null) as ListenerEvent[] | null;
  const speech = (rec.speechEvents ?? null) as TapEvent[] | null;
  const axe = (rec.axe ?? null) as Record<string, unknown> | null;
  const steps = rec.steps.filter((s): s is StepRun & Required<Pick<StepRun, "segmentId" | "startedAt" | "endedAt" | "outcome">> => s.kind === "at" && s.segmentId !== undefined && s.startedAt !== undefined && s.endedAt !== undefined && s.outcome !== undefined);
  return {
    itemId: item.id,
    side: rec.side,
    repetition: rec.repetition,
    orderIndex: rec.orderIndex,
    env: { ...manifest, chromeVersion: typeof rec.chromeVersion === "string" ? rec.chromeVersion : manifest.chromeVersion },
    canaries,
    maxClockSkewMs: typeof rec.maxClockSkewMs === "number" ? rec.maxClockSkewMs : 0,
    leg,
    preflight: rec.preflight as Preflight,
    steps: steps.map((s) => {
      const inWindow = (t: number): boolean => t >= s.startedAt && t <= s.endedAt;
      const speaks = (speech ?? []).filter((e): e is Extract<TapEvent, { kind: "speak" }> => e.kind === "speak" && inWindow(e.t));
      return {
        stepId: s.stepId,
        segmentId: s.segmentId,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        outcome: s.outcome,
        ...(axe === null ? {} : { axe: axe[s.stepId] ?? null }),
        ...(s.ariaSnapshot === undefined ? {} : { ariaSnapshot: s.ariaSnapshot }),
        ...(s.axTree === undefined ? {} : { axTree: s.axTree }),
        mutations: timeline.filter((e) => inWindow(e.tQpc)),
        ...(events === null ? {} : { platformEvents: events.filter((e) => inWindow(e.t)).map(toPlatformEvent) }),
        ...(speech === null ? {} : { speech: speaks.map((e) => ({ text: e.text, t: e.t, ...(e.priority === null ? {} : { priority: e.priority }) })), speechCancels: speech.filter((e) => e.kind === "cancel" && inWindow(e.t)).map((e) => ({ t: e.t })) }),
        focusTrace: [
          ...timeline.filter((e) => e.kind === "focusin" && inWindow(e.tQpc)).map((e) => ({ t: e.tQpc, target: e.target })),
          ...(s.focusAtEnd == null ? [] : [{ t: s.endedAt, target: `${s.focusAtEnd.role}|${s.focusAtEnd.name}` }]),
        ],
      };
    }),
  };
}

async function runBlock(item: CorpusItem, journey: Journey, corpus: readonly CorpusItem[], ctx: JobContext): Promise<Json> {
  const decision = assertItemExecutable(item);
  const n = args.reps === "" ? repetitionsFor(item, corpus) : Number(args.reps);
  const order: Side[] = args.sides === "base" ? Array.from({ length: n }, () => "base" as const) : abbaOrder(n);
  const pre = args["no-canaries"] ? null : await runK1(ctx);
  // A skipped canary is not a passed one: the attempts then fail the pre-canary check (R9; DR-0074).
  const preOk = pre !== null && pre.ok === true;
  const attempts: AttemptRecord[] = [];
  const reps: Record<Side, number> = { base: 0, candidate: 0 };
  for (const [i, side] of order.entries()) {
    reps[side] += 1;
    attempts.push(await runAttempt(item, journey, side, i, reps[side], preOk, ctx));
  }
  const post = args["no-canaries"] ? null : await runK1(ctx);
  // PATH_CHANGED against the base side's most common attempt count, per step (P24).
  for (const step of journey.steps) {
    if (step.kind !== "at" || step.until === undefined) continue;
    const baseModal = modalCount(attempts.filter((a) => a.side === "base").map((a) => a.steps.find((s) => s.stepId === step.id)?.reachedAt ?? null));
    for (const a of attempts) {
      const s = a.steps.find((x) => x.stepId === step.id);
      if (s !== undefined && s.outcome !== "ENV_FAILURE" && s.reachedAt !== undefined) s.outcome = goalOutcome(s.reachedAt, baseModal);
    }
  }
  const canaries = { pre: preOk, post: post !== null && post.ok === true };
  const packages = attempts.map((a) => packageFor(item, a, ctx.manifest, canaries));
  const validations = packages.map((p) => (p === null ? null : GateEvidencePackageSchema.safeParse(p)));
  const validity = itemValidity(attempts.map((a) => ({ side: a.side, reasons: a.reasons })));
  const block = { label: "EXPLORATORY", jobId, item, journeyId: journey.id, leg, n, order, split: decision.split, pre, post, validity, attempts, packages, canariesSkipped: args["no-canaries"], packageErrors: validations.map((v) => (v === null ? ["no evidence package: the attempt failed before its preflight"] : v.success ? null : v.error.issues.slice(0, 10).map((i) => `${i.path.join(".")}: ${i.message}`))) };
  mkdirSync(join(outDir, "blocks"), { recursive: true });
  writeFileSync(join(outDir, "blocks", `${item.id}.json.gz`), gzipSync(JSON.stringify(block)));
  const summary = {
    itemId: item.id,
    journeyId: journey.id,
    leg,
    n,
    pre: pre?.ok ?? null,
    post: post?.ok ?? null,
    validity,
    attempts: attempts.map((a) => ({ side: a.side, orderIndex: a.orderIndex, reasons: a.reasons, error: a.error ?? null, steps: a.steps.filter((s) => s.kind === "at").map((s) => ({ id: s.stepId, outcome: s.outcome ?? null, reachedAt: s.reachedAt ?? null, focusAtEnd: s.focusAtEnd ?? null, goalTrace: s.goalTrace ?? [] })), notRun: a.notRun ?? [], b2Evidence: a.b2Evidence ?? null, listenerFailure: a.listenerFailure ?? null, pageErrors: a.pageErrors, external: (a.external as string[] | undefined)?.length ?? 0 })),
    packagesValid: validations.every((v) => v?.success === true),
  };
  appendFileSync(join(outDir, `blocks-${jobId}.jsonl`), `${JSON.stringify(summary)}\n`);
  return summary;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function readCorpus(): CorpusItem[] {
  const dir = join(repoRoot, "corpus/items");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.includes(" 2."))
    .sort()
    .map((f) => CorpusItemSchema.parse(JSON.parse(readFileSync(join(dir, f), "utf8"))));
}

function readJourneyFiles(): Map<string, unknown> {
  const dir = join(repoRoot, "journeys");
  const files = new Map<string, unknown>();
  if (!existsSync(dir)) return files;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json") && !x.includes(" 2.")).sort()) files.set(f, JSON.parse(readFileSync(join(dir, f), "utf8")) as unknown);
  return files;
}

async function main(): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  const summary: Json = { label: "EXPLORATORY", jobId, app, leg, startedQpcNs: qpcNowNs() };
  const corpus = readCorpus();
  const wantedIds = args.items === "" ? null : new Set(args.items.split(",").map((s) => s.trim()));
  // Dev items only: test-split items are not executed before the freeze (hard rule 5); the guard below is the backstop.
  const items = corpus.filter((i) => i.app === app && i.split === "dev" && (wantedIds === null || wantedIds.has(i.id))).filter((_, k) => k % shardCount === shardIndex - 1);
  const { journeys, errors } = checkJourneys(readJourneyFiles(), items, SETUP_NAMES);
  if (errors.length > 0) throw new Error(`journeys: ${errors.join("; ")}`);
  const env = (existsSync(args.env) ? JSON.parse(readFileSync(args.env, "utf8")) : {}) as EnvSnapshot;
  const audio = audioState(env);
  const helper = await WinHelper.start();
  let nvda: NvdaRun | null = null;
  try {
    let listenerReady: ListenerReady | null = null;
    if (listenerTmp !== null) {
      const probe = await ListenerProcess.start({ exe: args.listener, pid: process.pid, outPath: join(listenerTmp, "probe.jsonl") });
      listenerReady = probe.ready;
      await probe.stop();
      if (listenerReady !== null) adoptWallAnchor({ qpcNs: listenerReady.anchorQpcNs, wallIso: listenerReady.anchorWall });
    }
    summary.wallAnchor = { ...captureWallAnchor(), source: listenerReady === null ? "node" : "listener" };
    if (leg === "nvda-present") nvda = await startNvda();
    const rate = nvda === null || "error" in nvda.espeak ? null : (nvda.espeak.rate ?? ESPEAK_DEFAULT_RATE);
    const manifest: EnvManifest = {
      harnessCommit: process.env.GITHUB_SHA ?? "local",
      imageOS: env.imageOS ?? "unknown",
      imageVersion: env.imageVersion ?? "unknown",
      windowsBuild: `${env.windows?.currentBuild ?? "?"}.${String(env.windows?.ubr ?? "?")}`,
      chromeVersion: EXPECTED_CHROME,
      chromeFlags: CHROME_FLAGS,
      listenerVersion: listenerReady === null ? "not run in this leg (P4)" : `${listenerReady.version} (sha256 ${createHash("sha256").update(readFileSync(resolve(args.listener))).digest("hex")})`,
      ...(listenerReady?.runtime === undefined ? {} : { dotnetVersion: listenerReady.runtime }),
      nodeVersion: process.version,
      locale: "en-GB",
      playwrightVersion: packageVersion("playwright"),
      chromeSandbox: true,
      axMode: "screen-reader",
      audio,
      ...(nvda === null
        ? {}
        : {
            nvdaVersion: nvda.nvdaVersion ?? "unknown",
            nvdaConfigHash: sha256(JSON.stringify(NVDA_SETTINGS)),
            adapter: { name: "guidepup" as const, version: `${packageVersion("@guidepup/guidepup")} (NVDA asset ${nvda.adapter.assetVersion})` },
            nvdaChannel: "IA2" as const,
            synth: { name: "espeak", ...(rate === null ? {} : { rate }), ...("error" in nvda.espeak ? {} : { rateBoost: nvda.espeak.rateBoost ?? false }) },
          }),
    };
    const manifestValid = EnvManifestSchema.safeParse(manifest).success;
    Object.assign(summary, { manifest, manifestValid, items: items.map((i) => i.id), axeCore: packageVersion("axe-core") });
    const ctx: JobContext = { helper, manifest, manifestValid, audio, nvda };
    const blocks: Json[] = [];
    for (const item of items) {
      const journey = journeys.get(item.journeyId);
      if (journey === undefined) continue;
      blocks.push(await runBlock(item, journey, corpus, ctx));
    }
    summary.blocks = blocks.map((b) => ({ itemId: b.itemId, validity: b.validity, packagesValid: b.packagesValid }));
    if (nvda !== null) {
      await nvda.tap.detach();
      try {
        quitNvda();
        await sleep(3000);
      } catch (error) {
        summary.nvdaQuitError = errorText(error);
      }
      if (existsSync(nvda.logPath)) copyFileSync(nvda.logPath, join(outDir, `nvda-${jobId}.log`));
      try {
        await nvda.adapter.stop();
      } catch (error) {
        summary.nvdaStopError = errorText(error);
      }
    }
  } catch (error) {
    summary.fatal = errorText(error);
    process.exitCode = 1;
  } finally {
    summary.endedQpcNs = qpcNowNs();
    writeFileSync(join(outDir, `summary-${jobId}.json`), `${JSON.stringify(summary, null, 2)}\n`);
    for (const { server } of servers.values()) server.close();
    helper.stop();
  }
}

await main();
