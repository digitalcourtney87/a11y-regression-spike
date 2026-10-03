/**
 * Canary runner (`npm run phase0:canaries`; HANDOFF §9 M1b and §9.2). Windows
 * only. One invocation is one job: one leg, one shard of the plan.
 *
 * NVDA-present leg, per job: start NVDA with the D8 settings (capture off),
 * attach the relay tap for the whole NVDA run (so it is attached before every
 * segment, and tap-versus-log parity covers the run, D2), then for each
 * attempt:
 * 1. launch a fresh-profile Chrome for Testing and load the canary page;
 * 2. handover: foreground Chrome, DOM-focus the anchor in setup, verify
 *    platform focus with the MSAA-only read (P4, DR-0046), check the injection
 *    marker and the virtual buffer (D8);
 * 3. clock checks (D1) and a settle period;
 * 4. segment: press Enter through NVDA (OS-level input), observe, stop;
 * 5. finish the clock checks, decide validity from pre-outcome checks only
 *    (D12), score the outcome from the tap (D13), and write a gate evidence
 *    package (DR-0026 amendment a) as one JSON line.
 *
 * The NVDA-absent leg runs the same page and checks without NVDA or the tap;
 * its B2 signatures come with the M2 listener.
 *
 * Every Phase 0 result is EXPLORATORY.
 */
import { createHash } from "node:crypto";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { parseArgs } from "node:util";

import { resolveSessionUserConfigPath } from "@guidepup/guidepup/lib/windows/NVDA/config/resolveSessionUserConfigPath.js";
import { quit as quitNvda } from "@guidepup/guidepup/lib/windows/NVDA/quit.js";
import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

import { GuidepupNvdaAdapter } from "../adapters/atAdapter.ts";
import { NVDA_SETTINGS } from "../adapters/nvda-settings.ts";
import { RelayTap } from "../adapters/relayTap.ts";
import type { TapEvent } from "../adapters/relayTap.ts";
import { captureWallAnchor, qpcToWallIso } from "../clock/wallAnchor.ts";
import { qpcNowNs } from "../clock/qpc.ts";
import { countSpeakingBetween, isoTimeOfDay, nvdaVersionFromLog, scanNvdaLog } from "../probes/analysis.ts";
import { WinHelper } from "../probes/winhelper.ts";
import { EnvManifestSchema, GateEvidencePackageSchema } from "../schema/schemas.ts";
import type { EnvManifest, GateEvidencePackage, Leg, Preflight } from "../schema/types.ts";
import { buildPlan, shardOf } from "./canaries.ts";
import type { PlannedAttempt } from "./canaries.ts";
import { nativeSelfTest, pageClock, RAF_READ_SCRIPT, RAF_START_SCRIPT, segmentDriftMs } from "./clockChecks.ts";
import { evaluateAttempt } from "./outcome.ts";
import { inconclusiveReasons } from "./validity.ts";

const EXPECTED_CHROME = "153.0.8010.12";
const CHROME_FLAGS = ["--force-renderer-accessibility=screen-reader"];
const ANCHOR_NAME = "Start canary";
const SETTLE_MS = 1500;
const PINGS = 16;

const { values: args } = parseArgs({
  options: {
    leg: { type: "string", default: "nvda-present" },
    runs: { type: "string", default: "1" },
    canaries: { type: "string", default: "all" },
    "record-only": { type: "boolean", default: false },
    shard: { type: "string", default: "1/1" },
    seed: { type: "string", default: "20261003" },
    out: { type: "string", default: "artefacts/canaries" },
    env: { type: "string", default: "artefacts/env.json" },
  },
});

const legArg = args.leg;
if (legArg !== "nvda-present" && legArg !== "nvda-absent") throw new Error(`--leg must be nvda-present or nvda-absent, not ${legArg}`);
const leg: Leg = legArg;
const [shardText, shardsText] = args.shard.split("/");
const shard = Number(shardText);
const shards = Number(shardsText);
const outDir = resolve(args.out);
const jobId = `${leg}-${String(shard)}of${String(shards)}`;
const attemptsPath = join(outDir, `attempts-${jobId}.jsonl`);
const only = args.canaries === "all" ? [] : args.canaries.split(",").map((s) => s.trim()).filter((s) => s !== "");
const plan = buildPlan({ gatingRuns: Number(args.runs), recordOnly: args["record-only"], only, seed: Number(args.seed) });
const mine = shardOf(plan, shard, shards);

type Json = Record<string, unknown>;
const summary: Json = { jobId, leg, shard, shards, seed: Number(args.seed), planned: plan.length, attempts: mine.length, startedQpcNs: qpcNowNs() };

function errorText(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

function writeSummary(): void {
  writeFileSync(join(outDir, `summary-${jobId}.json`), `${JSON.stringify(summary, null, 2)}\n`);
}

const CONTENT_TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

async function serveCanaries(): Promise<{ base: string; close: () => void }> {
  const root = resolve(import.meta.dirname, "../../../fixtures/canaries");
  const server = createServer((req, res) => {
    const path = (req.url ?? "/").split("?")[0] ?? "/";
    const file = join(root, path === "/" ? "canary.html" : path.replace(/^\/+/, ""));
    if (!file.startsWith(root) || !existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "content-type": CONTENT_TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const { port } = server.address() as AddressInfo;
  return { base: `http://127.0.0.1:${String(port)}/canary.html`, close: () => server.close() };
}

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

function packageVersion(name: string): string {
  const require = createRequire(import.meta.url);
  return (require(`${name}/package.json`) as { version: string }).version;
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

interface NvdaRun {
  adapter: GuidepupNvdaAdapter;
  tap: RelayTap;
  logPath: string;
  synthOk: boolean;
  nvdaVersion: string | null;
}

async function startNvda(): Promise<NvdaRun> {
  const adapter = new GuidepupNvdaAdapter();
  const logPath = join(process.env.TEMP ?? tmpdir(), "nvda.log");
  await adapter.start();
  const tap = await RelayTap.attach({ caPath: adapter.relayCaPath() });
  await sleep(2000);
  const log = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
  const scan = scanNvdaLog(log);
  // D8: the declared synth is active, with no fallback.
  const synthOk = scan.synthsLoaded.length > 0 && scan.synthsLoaded.every((s) => s === "espeak") && scan.audioErrors.length === 0;
  return { adapter, tap, logPath, synthOk, nvdaVersion: nvdaVersionFromLog(log) };
}

function logSince(path: string, offset: number): string {
  return existsSync(path) ? readFileSync(path).subarray(offset).toString("utf8") : "";
}

async function waitForBufferLoad(path: string, offset: number, timeoutMs: number): Promise<boolean> {
  const deadline = qpcNowNs() + timeoutMs * 1e6;
  while (qpcNowNs() < deadline) {
    if (scanNvdaLog(logSince(path, offset)).bufferLoads > 0) return true;
    await sleep(200);
  }
  return false;
}

interface AttemptContext {
  helper: WinHelper;
  base: string;
  manifest: EnvManifest;
  manifestValid: boolean;
  audio: { endpointCount: number; audiosrvRunning: boolean };
  nvdaRun: NvdaRun | null;
}

async function runAttempt(attempt: PlannedAttempt, ctx: AttemptContext): Promise<Json> {
  const { spec } = attempt;
  const record: Json = { jobId, index: attempt.index, itemId: spec.itemId, canary: spec.canary, repetition: attempt.repetition, gating: spec.gating, leg };
  let browser: Browser | undefined;
  try {
    const logOffset = ctx.nvdaRun !== null && existsSync(ctx.nvdaRun.logPath) ? statSync(ctx.nvdaRun.logPath).size : 0;
    browser = await chromium.launch({ headless: false, chromiumSandbox: true, args: CHROME_FLAGS });
    const chromeVersion = browser.version();
    const page: Page = await browser.newPage();
    await page.goto(`${ctx.base}${spec.query}`);
    const cdp = await browser.newBrowserCDPSession();
    const { processInfo } = (await cdp.send("SystemInfo.getProcessInfo")) as { processInfo: { type: string; id: number }[] };
    await cdp.detach();
    const browserPid = processInfo.find((p) => p.type === "browser")?.id;
    if (browserPid === undefined) throw new Error("no browser process");
    const win = (await ctx.helper.windowsForPid(browserPid)).find((w) => w.class === "Chrome_WidgetWin_1");
    if (win === undefined) throw new Error("no Chrome window");

    // Handover (HANDOFF §7.2).
    const activation = await ctx.helper.activate(win.hwnd);
    const foregroundOk = (await ctx.helper.foreground()).hwnd === win.hwnd;
    // Diagnostic only (DR-0048): the anchor's focus announcement before
    // activation is kept so that a pre-canary based on it can be computed later.
    const anchorFrom = qpcNowNs();
    await page.locator("#start").focus();
    await sleep(300);
    const msaa = await ctx.helper.msaaFocus(win.hwnd);
    const focusOk = msaa.name === ANCHOR_NAME;
    let injectionMarkerOk: boolean | undefined;
    if (ctx.nvdaRun !== null) {
      const modules = await ctx.helper.modules(browserPid, "nvdaHelperRemote");
      const bufferLoaded = await waitForBufferLoad(ctx.nvdaRun.logPath, logOffset, 10_000);
      injectionMarkerOk = (modules.modules?.length ?? 0) > 0 && bufferLoaded;
      record.injection = { modules: modules.modules ?? [], bufferLoaded };
    }

    // Clock checks before the segment (D1).
    const native = await nativeSelfTest(ctx.helper, PINGS);
    const clockStart = await pageClock(page, PINGS, true);
    await page.evaluate(RAF_START_SCRIPT);
    await sleep(SETTLE_MS);

    // Segment.
    const segmentId = `${jobId}-${String(attempt.index)}`;
    const activationT = qpcNowNs();
    if (ctx.nvdaRun !== null) await ctx.nvdaRun.adapter.press("Enter");
    else await page.locator("#start").click();
    await sleep(spec.observeMs);
    const endT = qpcNowNs();

    // After the window: finish the clock checks; read diagnostics.
    const raf = await page.evaluate<{ maxGapMs: number | null; frames: number }>(RAF_READ_SCRIPT);
    const driftMs = await segmentDriftMs(page, clockStart, 8);
    const pageLog = await page.evaluate<unknown>("window.__canary");

    const preflight: Preflight = {
      foregroundHwndOk: foregroundOk && focusOk,
      // Phase 0 canary runs: each canary is itself the known-answer check, so no
      // separate pre-canary can absorb an instrument failure (DR-0048).
      preCanaryOk: true,
      manifestValid: ctx.manifestValid && chromeVersion === EXPECTED_CHROME,
      clock: {
        nativeSelfTestDisagreementMs: native.disagreementMs,
        pageMappingUncertaintyMs: clockStart.uncertaintyMs,
        segmentDriftMs: driftMs,
        timeTicksHighResolution: clockStart.highResolution === true,
        maxRafGapMs: raf.maxGapMs ?? Number.POSITIVE_INFINITY,
      },
      ...(ctx.nvdaRun === null
        ? {}
        : {
            injectionMarkerOk: injectionMarkerOk === true,
            audioOk: ctx.audio.endpointCount >= 1 && ctx.audio.audiosrvRunning,
            synthOk: ctx.nvdaRun.synthOk,
          }),
    };
    const reasons = inconclusiveReasons(preflight, leg);
    record.anchorSpeech =
      ctx.nvdaRun === null
        ? null
        : ctx.nvdaRun.tap
            .between(anchorFrom, activationT)
            .filter((e) => e.kind === "speak" && e.text.toLowerCase().includes(ANCHOR_NAME.toLowerCase()))
            .map((e) => ({ atMs: (e.t - activationT) / 1e6, text: e.kind === "speak" ? e.text : "" }));
    const events: TapEvent[] = ctx.nvdaRun === null ? [] : ctx.nvdaRun.tap.between(activationT, endT);
    const outcome = ctx.nvdaRun === null ? null : evaluateAttempt(spec, events, activationT);
    const speaks = events.filter((e): e is Extract<TapEvent, { kind: "speak" }> => e.kind === "speak");
    const pkg: GateEvidencePackage = {
      itemId: spec.itemId,
      side: "base",
      repetition: attempt.repetition,
      orderIndex: attempt.index,
      env: { ...ctx.manifest, chromeVersion },
      canaries: { pre: true, post: true },
      maxClockSkewMs: Math.max(native.disagreementMs, clockStart.uncertaintyMs),
      leg,
      preflight,
      steps: [
        {
          stepId: "activate",
          segmentId,
          startedAt: activationT,
          endedAt: endT,
          outcome: "REACHED",
          ...(ctx.nvdaRun === null
            ? {}
            : {
                speech: speaks.map((s) => ({ text: s.text, t: s.t, ...(s.priority === null ? {} : { priority: s.priority }) })),
                speechCancels: events.filter((e) => e.kind === "cancel").map((e) => ({ t: e.t })),
              }),
        },
      ],
    };
    const validation = GateEvidencePackageSchema.safeParse(pkg);
    Object.assign(record, {
      segmentId,
      valid: reasons.length === 0,
      inconclusiveReasons: reasons,
      outcome,
      activation,
      msaa,
      clock: { native: native.disagreementMs, mappingUncertaintyMs: clockStart.uncertaintyMs, driftMs, highResolution: clockStart.highResolution, raf },
      // Page time to QPC (D1): page QPC ns ≈ navigationStartS × 1e9 + performance.now() × 1e6 + mappingOffsetNs correction.
      // Recorded so that DOM-mutation latency (P4) can be computed from the page log (from M2 onwards).
      pageMapping: { navigationStartS: clockStart.navigationStartS, mappingOffsetNs: clockStart.mappingOffsetNs },
      page: pageLog,
      packageValid: validation.success,
      ...(validation.success ? {} : { packageErrors: validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }),
      package: pkg,
    });
  } catch (error) {
    record.error = errorText(error);
    record.valid = false;
    record.inconclusiveReasons = ["ENV_FAILURE"];
  } finally {
    await browser?.close();
  }
  return record;
}

async function main(): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  const env = (existsSync(args.env) ? JSON.parse(readFileSync(args.env, "utf8")) : {}) as EnvSnapshot;
  const audio = audioState(env);
  const helper = await WinHelper.start();
  const server = await serveCanaries();
  let nvdaRun: NvdaRun | null = null;
  try {
    if (leg === "nvda-present") nvdaRun = await startNvda();
    const manifest: EnvManifest = {
      harnessCommit: process.env.GITHUB_SHA ?? "local",
      imageOS: env.imageOS ?? "unknown",
      imageVersion: env.imageVersion ?? "unknown",
      windowsBuild: `${env.windows?.currentBuild ?? "?"}.${String(env.windows?.ubr ?? "?")}`,
      chromeVersion: EXPECTED_CHROME,
      chromeFlags: CHROME_FLAGS,
      listenerVersion: "none (M2)",
      nodeVersion: process.version,
      locale: "en-GB",
      playwrightVersion: packageVersion("playwright"),
      chromeSandbox: true,
      axMode: "screen-reader",
      audio,
      ...(nvdaRun === null
        ? {}
        : {
            nvdaVersion: nvdaRun.nvdaVersion ?? "unknown",
            nvdaConfigHash: sha256(JSON.stringify(NVDA_SETTINGS)),
            adapter: { name: "guidepup" as const, version: `${packageVersion("@guidepup/guidepup")} (NVDA asset ${nvdaRun.adapter.assetVersion})` },
            nvdaChannel: "IA2" as const,
            synth: { name: "espeak" },
          }),
    };
    const manifestValid = EnvManifestSchema.safeParse(manifest).success;
    Object.assign(summary, { manifest, manifestValid, synthOk: nvdaRun?.synthOk ?? null, audio });
    writeSummary();
    // Parity windows start at the relay's join confirmation, not at the attach
    // call: speech queued before the join never reaches the tap.
    const tapAttachWall = nvdaRun === null ? null : qpcToWallIso(nvdaRun.tap.joinedQpcNs ?? nvdaRun.tap.attachedQpcNs, captureWallAnchor());
    const segments: { index: number; from: string; to: string; tap: number }[] = [];
    for (const attempt of mine) {
      const record = await runAttempt(attempt, { helper, base: server.base, manifest, manifestValid, audio, nvdaRun });
      appendFileSync(attemptsPath, `${JSON.stringify(record)}\n`);
      const step = (record.package as GateEvidencePackage | undefined)?.steps[0];
      if (nvdaRun !== null && step !== undefined) {
        segments.push({ index: attempt.index, from: qpcToWallIso(step.startedAt, captureWallAnchor()), to: qpcToWallIso(step.endedAt, captureWallAnchor()), tap: step.speech?.length ?? 0 });
      }
    }
    if (nvdaRun !== null) {
      const endWall = qpcToWallIso(qpcNowNs(), captureWallAnchor());
      const tapSpeaks = nvdaRun.tap.events().filter((e) => e.kind === "speak").length;
      await nvdaRun.tap.detach();
      try {
        quitNvda();
        await sleep(3000);
      } catch (error) {
        summary.nvdaQuitError = errorText(error);
      }
      const log = existsSync(nvdaRun.logPath) ? readFileSync(nvdaRun.logPath, "utf8") : "";
      if (existsSync(nvdaRun.logPath)) copyFileSync(nvdaRun.logPath, join(outDir, `nvda-${jobId}.log`));
      // D2 parity for the NVDA run, bucketed by the wall anchor (DR-0039).
      const logSpeaks = tapAttachWall === null ? 0 : countSpeakingBetween(log, isoTimeOfDay(tapAttachWall), isoTimeOfDay(endWall));
      summary.parity = { tapSpeakMessages: tapSpeaks, logSpeakingEntries: logSpeaks, difference: tapSpeaks - logSpeaks, window: [tapAttachWall, endWall] };
      // Per-segment parity over each attempt's observation window (DR-0039: parity and diagnostics only).
      const segmentParity = segments.map((s) => {
        const log_ = countSpeakingBetween(log, isoTimeOfDay(s.from), isoTimeOfDay(s.to));
        return { index: s.index, tap: s.tap, log: log_, difference: s.tap - log_ };
      });
      summary.segmentParity = {
        segments: segmentParity.length,
        tap: segmentParity.reduce((n, s) => n + s.tap, 0),
        log: segmentParity.reduce((n, s) => n + s.log, 0),
        mismatched: segmentParity.filter((s) => s.difference !== 0),
      };
      summary.sessionConfig = existsSync(join(resolveSessionUserConfigPath(), "nvda.ini"));
      try {
        await nvdaRun.adapter.stop();
      } catch (error) {
        summary.nvdaStopError = errorText(error);
      }
    }
  } catch (error) {
    summary.fatal = errorText(error);
    process.exitCode = 1;
  } finally {
    summary.endedQpcNs = qpcNowNs();
    writeSummary();
    server.close();
    helper.stop();
  }
}

await main();
