/**
 * M1a runner probes (DR-0025 M1a runner probes; HANDOFF §9 M1a; lab notebook
 * questions 1–15). Windows only; run by .github/workflows/phase0-probe.yml.
 *
 * Measures, for fresh-profile Chrome for Testing launches with and without
 * NVDA:
 * - the foreground handover (which method makes Chrome the foreground window);
 * - the MSAA-only focus read on the declared anchor (P4, DR-0046);
 * - the D1 page-time mapping, TimeTicks resolution and rAF gaps (DR-0010);
 * - with NVDA: the injection marker, virtual-buffer loads per launch, the
 *   loaded synth, infobar speech and the effective eSpeak rate (D8, DR-0041).
 *
 * Everything here is EXPLORATORY measurement. Results are written to
 * `<out>/m1a-results.json` even when a probe fails.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { parseArgs } from "node:util";

import { nvda } from "@guidepup/guidepup";
import { resolveSessionUserConfigPath } from "@guidepup/guidepup/lib/windows/NVDA/config/resolveSessionUserConfigPath.js";
import { quit as quitNvda } from "@guidepup/guidepup/lib/windows/NVDA/quit.js";
import { chromium } from "playwright";
import type { Page } from "playwright";

import { probeSettings } from "../adapters/nvda-settings.ts";
import { qpcNowNs } from "../clock/qpc.ts";
import { minRttEstimate, readEspeakSettings, scanNvdaLog, stepSummary, ticksToNs } from "./analysis.ts";
import type { BracketSample } from "./analysis.ts";
import { WinHelper } from "./winhelper.ts";
import type { WindowInfo } from "./winhelper.ts";

const EXPECTED_CHROME = "153.0.8010.12";
const CHROME_FLAGS = ["--force-renderer-accessibility=screen-reader"];
const ANCHOR_NAME = "Probe anchor";

const { values: args } = parseArgs({
  options: {
    out: { type: "string", default: "artefacts/m1a" },
    label: { type: "string", default: "unknown" },
    launches: { type: "string", default: "10" },
    nvda: { type: "boolean", default: true },
  },
});
const outDir = resolve(args.out);
const launches = Number(args.launches);

type Json = Record<string, unknown>;
const results: Json = { label: args.label, startedQpcNs: qpcNowNs(), expectedChrome: EXPECTED_CHROME, chromeFlags: CHROME_FLAGS };

function errorText(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

function write(): void {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "m1a-results.json"), `${JSON.stringify(results, null, 2)}\n`);
}

async function servePage(): Promise<{ url: string; close: () => void }> {
  const html = readFileSync(resolve(import.meta.dirname, "page", "probe.html"));
  const server = createServer((_req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const { port } = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${String(port)}/`, close: () => server.close() };
}

/** Native QPC self-test: Node against the helper process over a pipe (D1). */
async function qpcSelfTest(helper: WinHelper, count: number): Promise<Json> {
  const samples: BracketSample[] = [];
  let frequency = 0;
  let highResolution = false;
  for (let i = 0; i < count; i++) {
    const t0 = qpcNowNs();
    const sample = await helper.qpc();
    const t1 = qpcNowNs();
    frequency = sample.frequency;
    highResolution = sample.highResolution;
    samples.push({ t0, t1, value: ticksToNs(sample.ticks, sample.frequency) });
  }
  return {
    frequency,
    highResolution,
    estimate: minRttEstimate(samples),
    allWithinBracket: samples.every((s) => s.value >= s.t0 && s.value <= s.t1),
  };
}

function metric(metrics: { name: string; value: number }[], name: string): number {
  const found = metrics.find((m) => m.name === name);
  if (found === undefined) throw new Error(`CDP Performance.getMetrics has no ${name}`);
  return found.value;
}

/** D1 page-time checks: CDP TimeTicks against hrtime, the page mapping, steps and rAF gaps. */
async function pageClock(page: Page): Promise<Json> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  const timestampSamples: BracketSample[] = [];
  let navigationStartS = Number.NaN;
  for (let i = 0; i < 16; i++) {
    const t0 = qpcNowNs();
    const { metrics } = await cdp.send("Performance.getMetrics");
    const t1 = qpcNowNs();
    navigationStartS = metric(metrics, "NavigationStart");
    timestampSamples.push({ t0, t1, value: Math.round(metric(metrics, "Timestamp") * 1e9) });
  }
  const mappingSamples: BracketSample[] = [];
  for (let i = 0; i < 16; i++) {
    const t0 = qpcNowNs();
    const now = await page.evaluate<number>("performance.now()");
    const t1 = qpcNowNs();
    mappingSamples.push({ t0, t1, value: Math.round(navigationStartS * 1e9 + now * 1e6) });
  }
  const steps = await page.evaluate<number[]>("window.__probe.steps(200)");
  const raf = await page.evaluate<{ maxGapMs: number; frames: number }>("window.__probe.raf(2000)");
  await cdp.detach();
  return {
    navigationStartS,
    cdpTimestampVsHrtime: minRttEstimate(timestampSamples),
    pageMapping: minRttEstimate(mappingSamples),
    steps: stepSummary(steps),
    raf,
  };
}

function pickBrowserWindow(windows: WindowInfo[]): WindowInfo | undefined {
  return windows.find((w) => w.class === "Chrome_WidgetWin_1" && w.title !== "") ?? windows.find((w) => w.class === "Chrome_WidgetWin_1");
}

interface LaunchOptions {
  helper: WinHelper;
  url: string;
  index: number;
  leg: "nvda-absent" | "nvda-present";
  logPath?: string;
}

function logLength(path: string | undefined): number {
  return path !== undefined && existsSync(path) ? statSync(path).size : 0;
}

function logSince(path: string | undefined, offset: number): string {
  if (path === undefined || !existsSync(path)) return "";
  return readFileSync(path).subarray(offset).toString("utf8");
}

/** One fresh-profile Chrome launch with all per-launch checks. */
async function probeLaunch(options: LaunchOptions): Promise<Json> {
  const { helper, url, index, leg, logPath } = options;
  const record: Json = { index, leg };
  const logOffset = logLength(logPath);
  const launchedQpcNs = qpcNowNs();
  const browser = await chromium.launch({ headless: false, chromiumSandbox: true, args: CHROME_FLAGS });
  try {
    record.chromeVersion = browser.version();
    record.chromeVersionOk = browser.version() === EXPECTED_CHROME;
    const page = await browser.newPage();
    await page.goto(url);
    const cdp = await browser.newBrowserCDPSession();
    const { processInfo } = (await cdp.send("SystemInfo.getProcessInfo")) as { processInfo: { type: string; id: number }[] };
    await cdp.detach();
    record.chromeProcesses = processInfo.map((p) => ({ type: p.type, pid: p.id }));
    const browserPid = processInfo.find((p) => p.type === "browser")?.id;
    if (browserPid === undefined) throw new Error("no browser process in SystemInfo.getProcessInfo");
    const win = pickBrowserWindow(await helper.windowsForPid(browserPid));
    if (win === undefined) throw new Error(`no visible Chrome_WidgetWin_1 window for browser pid ${String(browserPid)}`);
    record.window = win;
    record.foregroundBefore = await helper.foreground();
    record.activation = await helper.activate(win.hwnd);
    record.foregroundOk = (await helper.foreground()).hwnd === win.hwnd;
    await page.locator("#anchor").focus();
    await sleep(500);
    const msaa = await helper.msaaFocus(win.hwnd);
    record.msaaFocus = msaa;
    record.msaaFocusOk = msaa.name === ANCHOR_NAME;
    if (index === 1) record.screenshot = await helper.screenshot(join(outDir, `screen-${leg}-${String(index)}.png`));
    record.clock = await pageClock(page);
    record.browserProcess = await helper.processInfo(browserPid);
    if (leg === "nvda-present") {
      const deadline = qpcNowNs() + 10_000_000_000;
      let scan = scanNvdaLog(logSince(logPath, logOffset));
      while (scan.bufferLoads === 0 && qpcNowNs() < deadline) {
        await sleep(250);
        scan = scanNvdaLog(logSince(logPath, logOffset));
      }
      record.bufferLoaded = scan.bufferLoads > 0;
      record.bufferLoadAfterMs = scan.bufferLoads > 0 ? (qpcNowNs() - launchedQpcNs) / 1e6 : null;
      record.logScan = scan;
      const injected: Json[] = [];
      for (const p of processInfo) injected.push({ type: p.type, ...(await helper.modules(p.id, "nvdaHelperRemote")) });
      record.injection = injected;
      record.injectionMarkerOk = injected.some((m) => Array.isArray(m.modules) && m.modules.length > 0);
    }
  } catch (error) {
    record.error = errorText(error);
  } finally {
    await browser.close();
  }
  return record;
}

async function runLeg(leg: "nvda-absent" | "nvda-present", helper: WinHelper, url: string, logPath?: string): Promise<Json[]> {
  const records: Json[] = [];
  for (let i = 1; i <= launches; i++) {
    const record = await probeLaunch({ helper, url, index: i, leg, ...(logPath === undefined ? {} : { logPath }) });
    records.push(record);
    results[leg] = records;
    write();
  }
  return records;
}

function summarise(records: Json[]): Json {
  const count = (key: string): number => records.filter((r) => r[key] === true).length;
  return {
    launches: records.length,
    errors: records.filter((r) => r.error !== undefined).length,
    foregroundOk: count("foregroundOk"),
    msaaFocusOk: count("msaaFocusOk"),
    chromeVersionOk: count("chromeVersionOk"),
    bufferLoaded: count("bufferLoaded"),
    injectionMarkerOk: count("injectionMarkerOk"),
    activationMethods: records.map((r) => (r.activation as { method?: unknown } | undefined)?.method ?? null),
  };
}

async function waitForExit(helper: WinHelper, name: string, timeoutMs: number): Promise<boolean> {
  const deadline = qpcNowNs() + timeoutMs * 1e6;
  while (qpcNowNs() < deadline) {
    if ((await helper.pidsByName(name)).length === 0) return true;
    await sleep(250);
  }
  return false;
}

async function nvdaLeg(helper: WinHelper, url: string): Promise<void> {
  const tempDir = process.env.TEMP ?? tmpdir();
  const logPath = join(tempDir, "nvda.log");
  results.nvdaLogPath = logPath;
  await nvda.start({ capture: false, settings: probeSettings() });
  try {
    const pids = await helper.pidsByName("nvda");
    results.nvdaProcesses = await Promise.all(pids.map((pid) => helper.processInfo(pid)));
    await sleep(2000);
    results["nvda-present-summary"] = summarise(await runLeg("nvda-present", helper, url, logPath));
  } finally {
    // Quit NVDA ourselves first, so that the session nvda.ini it saves on exit
    // can be read before Guidepup's stop() deletes it (DR-0041).
    try {
      quitNvda();
      results.nvdaExited = await waitForExit(helper, "nvda", 20_000);
      const ini = join(resolveSessionUserConfigPath(), "nvda.ini");
      if (existsSync(ini)) {
        copyFileSync(ini, join(outDir, "nvda-session.ini"));
        results.espeak = readEspeakSettings(readFileSync(ini, "utf8"));
      } else {
        results.espeak = { error: `no session nvda.ini at ${ini}` };
      }
    } catch (error) {
      results.nvdaQuitError = errorText(error);
    }
    try {
      await nvda.stop();
    } catch (error) {
      results.nvdaStopError = errorText(error);
    }
    const logs = existsSync(tempDir) ? readdirSync(tempDir).filter((f) => /^nvda.*\.log$/i.test(f)) : [];
    for (const file of logs) copyFileSync(join(tempDir, file), join(outDir, file));
    results.nvdaLogs = logs;
    if (existsSync(logPath)) results.nvdaLogScan = scanNvdaLog(readFileSync(logPath, "utf8"));
  }
}

async function main(): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  const helper = await WinHelper.start();
  const page = await servePage();
  try {
    results.display = await helper.display();
    results.processes = {
      node: await helper.processInfo(process.pid),
      helper: helper.pid === undefined ? null : await helper.processInfo(helper.pid),
    };
    results.qpcSelfTest = await qpcSelfTest(helper, 50);
    write();
    results["nvda-absent-summary"] = summarise(await runLeg("nvda-absent", helper, page.url));
    write();
    if (args.nvda) await nvdaLeg(helper, page.url);
  } catch (error) {
    results.fatal = errorText(error);
    process.exitCode = 1;
  } finally {
    results.endedQpcNs = qpcNowNs();
    write();
    page.close();
    helper.stop();
  }
}

await main();
