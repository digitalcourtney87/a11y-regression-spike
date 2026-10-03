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
 * The NVDA-absent leg runs the same page and checks without NVDA or the tap,
 * with the B2 listener (DR-0019) started for each attempt's browser process;
 * its B2 signatures are scored for G2 (HANDOFF §9 M2). The DOM mutation
 * timeline runs in both legs (P4, DR-0046). The listener runs in the
 * NVDA-present leg only with --with-listener, for the 20-run on/off
 * diagnostic, never in G1 runs (DR-0020, P4).
 *
 * The handover's MSAA focus read is retried every 100 ms for up to 1 s
 * (P10; DR-0051, DR-0052).
 *
 * Every Phase 0 result is EXPLORATORY.
 */
import { createHash } from "node:crypto";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import type { AddressInfo } from "node:net";
import { mkdtempSync } from "node:fs";
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
import { adoptWallAnchor, captureWallAnchor, qpcToWallIso } from "../clock/wallAnchor.ts";
import { qpcNowNs } from "../clock/qpc.ts";
import { LISTENER_EXE, ListenerProcess, toPlatformEvent } from "../collectors/listener.ts";
import type { ListenerEvent, ListenerReady } from "../collectors/listener.ts";
import { TIMELINE_DRAIN_SCRIPT, TIMELINE_INIT_SCRIPT, TIMELINE_VERSION } from "../collectors/mutationTimeline.ts";
import type { MappedTimelineEntry, TimelineEntry } from "../collectors/mutationTimeline.ts";
import { countSpeakingBetween, isoTimeOfDay, nvdaVersionFromLog, readEspeakSettings, scanNvdaLog } from "../probes/analysis.ts";
import type { EspeakSettings } from "../probes/analysis.ts";
import { WinHelper } from "../probes/winhelper.ts";
import { EnvManifestSchema, GateEvidencePackageSchema } from "../schema/schemas.ts";
import type { EnvManifest, GateEvidencePackage, Leg, Preflight } from "../schema/types.ts";
import { buildPlan, shardOf } from "./canaries.ts";
import type { PlannedAttempt } from "./canaries.ts";
import { evaluateGatingB2, evaluateRecordB2, gatingComponents } from "./b2Signature.ts";
import { nativeSelfTest, pageClock, pageToQpcNs, RAF_READ_SCRIPT, RAF_START_SCRIPT, segmentDriftMs } from "./clockChecks.ts";
import { evaluateAttempt } from "./outcome.ts";
import { inconclusiveReasons } from "./validity.ts";

const EXPECTED_CHROME = "153.0.8010.12";
const CHROME_FLAGS = ["--force-renderer-accessibility=screen-reader"];
const ANCHOR_NAME = "Start canary";
const SETTLE_MS = 1500;
const PINGS = 16;
/** P10 (DR-0051): first focus read 300 ms after DOM focus, then every 100 ms for up to 1 s. */
const FOCUS_FIRST_READ_MS = 300;
const FOCUS_RETRY_MS = 100;
const FOCUS_RETRY_FOR_MS = 1000;
/** eSpeak NG's rate when nvda.ini has no [[espeak]] section (DR-0041). */
const ESPEAK_DEFAULT_RATE = 30;

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
    listener: { type: "string", default: LISTENER_EXE },
    "with-listener": { type: "boolean", default: false },
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
// B2 instrument: always in the NVDA-absent leg; in the NVDA-present leg only for the on/off diagnostic (P4).
const useListener = leg === "nvda-absent" || args["with-listener"];
const diagnostic = leg === "nvda-present" && args["with-listener"] ? "b2-onoff" : null;
const listenerTmp = useListener ? mkdtempSync(join(tmpdir(), "a11y-listener-")) : null;

type Json = Record<string, unknown>;
const summary: Json = { jobId, leg, shard, shards, seed: Number(args.seed), planned: plan.length, attempts: mine.length, listener: useListener, diagnostic, startedQpcNs: qpcNowNs() };

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

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function rateFields(espeak: EspeakSettings | { error: string }): { rate?: number; rateBoost?: boolean } {
  const rate = effectiveRate(espeak);
  // NVDA's default for rate boost is off (DR-0041).
  const boost = "error" in espeak ? null : (espeak.rateBoost ?? false);
  return { ...(rate === null ? {} : { rate }), ...(boost === null ? {} : { rateBoost: boost }) };
}

interface NvdaRun {
  adapter: GuidepupNvdaAdapter;
  tap: RelayTap;
  logPath: string;
  synthOk: boolean;
  nvdaVersion: string | null;
  /** The session nvda.ini's eSpeak settings, read once per NVDA run (DR-0041). */
  espeak: EspeakSettings | { error: string };
}

function readSessionEspeak(): EspeakSettings | { error: string } {
  const ini = join(resolveSessionUserConfigPath(), "nvda.ini");
  return existsSync(ini) ? readEspeakSettings(readFileSync(ini, "utf8")) : { error: `no session nvda.ini at ${ini}` };
}

/** The effective eSpeak NG rate: the configured one, or the default when nvda.ini sets none (DR-0041). */
function effectiveRate(espeak: EspeakSettings | { error: string }): number | null {
  if ("error" in espeak) return null;
  return espeak.rate ?? ESPEAK_DEFAULT_RATE;
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
  return { adapter, tap, logPath, synthOk, nvdaVersion: nvdaVersionFromLog(log), espeak: readSessionEspeak() };
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
  const record: Json = { jobId, index: attempt.index, itemId: spec.itemId, canary: spec.canary, repetition: attempt.repetition, gating: spec.gating, leg, ...(diagnostic === null ? {} : { diagnostic }) };
  let browser: Browser | undefined;
  let listener: ListenerProcess | undefined;
  // Set by failListener, which is called from several places (a holder, so
  // the type checker does not narrow it to its initial value).
  const failure: { listener: string | null } = { listener: null };
  let activatedAt: number | null = null;
  let preActivationReasons: string[] | null = null;
  const failListener = (why: string): void => {
    failure.listener ??= why;
    listener?.kill();
    listener = undefined;
  };
  try {
    const logOffset = ctx.nvdaRun !== null && existsSync(ctx.nvdaRun.logPath) ? statSync(ctx.nvdaRun.logPath).size : 0;
    browser = await chromium.launch({ headless: false, chromiumSandbox: true, args: CHROME_FLAGS });
    const chromeVersion = browser.version();
    const context = await browser.newContext();
    // DOM mutation timeline (HANDOFF §8.3), installed before page scripts run, in both legs (P4).
    await context.addInitScript(TIMELINE_INIT_SCRIPT);
    const page: Page = await context.newPage();
    await page.goto(`${ctx.base}${spec.query}`);
    const cdp = await browser.newBrowserCDPSession();
    const { processInfo } = (await cdp.send("SystemInfo.getProcessInfo")) as { processInfo: { type: string; id: number }[] };
    await cdp.detach();
    const browserPid = processInfo.find((p) => p.type === "browser")?.id;
    if (browserPid === undefined) throw new Error("no browser process");
    const win = (await ctx.helper.windowsForPid(browserPid)).find((w) => w.class === "Chrome_WidgetWin_1");
    if (win === undefined) throw new Error("no Chrome window");
    // B2 listener for this browser process, started before the handover (DR-0019).
    // The listener is the instrument G2 judges, so its failures never make an
    // attempt INCONCLUSIVE (DR-0032): the attempt continues without it and its
    // B2 outcome is null, which the G2 report counts as a failure.
    if (listenerTmp !== null) {
      try {
        listener = await ListenerProcess.start({ exe: args.listener, pid: browserPid, outPath: join(listenerTmp, `${jobId}-${String(attempt.index)}.jsonl`) });
        record.listenerReady = listener.ready;
        const ready = listener.ready;
        if (ready !== null && ready.hooks !== ready.ranges) failListener(`hooks installed ${String(ready.hooks)} of ${String(ready.ranges)}`);
      } catch (error) {
        failListener(`start: ${errorText(error)}`);
      }
    }

    // Handover (HANDOFF §7.2).
    const activation = await ctx.helper.activate(win.hwnd);
    const foregroundOk = (await ctx.helper.foreground()).hwnd === win.hwnd;
    // Diagnostic only (DR-0048): the anchor's focus announcement before
    // activation is kept so that a pre-canary based on it can be computed later.
    const anchorFrom = qpcNowNs();
    await page.locator("#start").focus();
    await sleep(FOCUS_FIRST_READ_MS);
    // P10 (DR-0051): retry the MSAA read every 100 ms, within 1 s of the first read, before ruling.
    const retryUntil = qpcNowNs() + FOCUS_RETRY_FOR_MS * 1e6;
    let msaa = await ctx.helper.msaaFocus(win.hwnd);
    let focusReads = 1;
    while (msaa.name !== ANCHOR_NAME && qpcNowNs() + FOCUS_RETRY_MS * 1e6 <= retryUntil) {
      await sleep(FOCUS_RETRY_MS);
      msaa = await ctx.helper.msaaFocus(win.hwnd);
      focusReads++;
    }
    const focusOk = msaa.name === ANCHOR_NAME;
    record.focusReads = focusReads;
    let injectionMarkerOk: boolean | undefined;
    if (ctx.nvdaRun !== null) {
      const modules = await ctx.helper.modules(browserPid, "nvdaHelperRemote");
      const bufferLoaded = await waitForBufferLoad(ctx.nvdaRun.logPath, logOffset, 10_000);
      injectionMarkerOk = (modules.modules?.length ?? 0) > 0 && bufferLoaded;
      record.injection = { modules: modules.modules ?? [], bufferLoaded };
    }

    // Clock checks before the segment (D1). The native self-test pings each
    // native collector (DR-0010): the Windows helper and, when it runs, the listener.
    const helperNative = await nativeSelfTest(ctx.helper, PINGS);
    let listenerNative: { disagreementMs: number } | null = null;
    if (listener !== undefined) {
      try {
        listenerNative = await nativeSelfTest(listener, PINGS);
      } catch (error) {
        failListener(`ping: ${errorText(error)}`);
      }
    }
    const native = { disagreementMs: Math.max(helperNative.disagreementMs, listenerNative?.disagreementMs ?? 0) };
    const clockStart = await pageClock(page, PINGS, true);
    await page.evaluate(RAF_START_SCRIPT);
    await sleep(SETTLE_MS);

    const buildPreflight = (segmentDrift: number, maxRafGapMs: number): Preflight => ({
      foregroundHwndOk: foregroundOk && focusOk,
      // Phase 0 canary runs: each canary is itself the known-answer check, so no
      // separate pre-canary can absorb an instrument failure (DR-0048).
      preCanaryOk: true,
      manifestValid: ctx.manifestValid && chromeVersion === EXPECTED_CHROME,
      clock: {
        nativeSelfTestDisagreementMs: native.disagreementMs,
        pageMappingUncertaintyMs: clockStart.uncertaintyMs,
        segmentDriftMs: segmentDrift,
        timeTicksHighResolution: clockStart.highResolution === true,
        maxRafGapMs,
      },
      ...(ctx.nvdaRun === null
        ? {}
        : {
            injectionMarkerOk: injectionMarkerOk === true,
            audioOk: ctx.audio.endpointCount >= 1 && ctx.audio.audiosrvRunning,
            synthOk: ctx.nvdaRun.synthOk,
          }),
    });
    // The checks completed before activation; drift and the rAF gap are finished after the window.
    preActivationReasons = inconclusiveReasons(buildPreflight(0, 0), leg);

    // Segment.
    const segmentId = `${jobId}-${String(attempt.index)}`;
    const activationT = qpcNowNs();
    activatedAt = activationT;
    if (ctx.nvdaRun !== null) await ctx.nvdaRun.adapter.press("Enter");
    else await page.locator("#start").click();
    await sleep(spec.observeMs);
    const endT = qpcNowNs();

    // After the window: finish the clock checks; read diagnostics.
    const raf = await page.evaluate<{ maxGapMs: number | null; frames: number }>(RAF_READ_SCRIPT);
    const driftMs = await segmentDriftMs(page, clockStart, 8);
    const pageLog = await page.evaluate<unknown>("window.__canary");
    const timeline: MappedTimelineEntry[] = (await page.evaluate<TimelineEntry[]>(TIMELINE_DRAIN_SCRIPT)).map((e) => ({ ...e, tQpc: pageToQpcNs(e.t, clockStart) }));
    let drained: Awaited<ReturnType<ListenerProcess["stop"]>> | null = null;
    if (listener !== undefined) {
      try {
        drained = await listener.stop();
        if (!drained.drained) failListener(`not drained (${String(drained.remaining)} events still queued)`);
        // A malformed line is a lost event, so the trace is incomplete (P13, DR-0055).
        else if (drained.malformed > 0) failListener(`${String(drained.malformed)} malformed output lines`);
      } catch (error) {
        failListener(`stop: ${errorText(error)}`);
      }
      listener = undefined;
    }
    const platformEvents: ListenerEvent[] = drained?.events ?? [];
    const window_ = { activationT, endT };
    const inWindow = (tq: number): boolean => tq >= activationT && tq <= endT;
    const options = { timelineVersion: TIMELINE_VERSION };
    const b2 =
      listenerTmp === null || failure.listener !== null || drained === null
        ? null
        : spec.gating
          ? evaluateGatingB2(spec.canary, platformEvents, timeline, window_)
          : evaluateRecordB2(spec, platformEvents, timeline, window_, options);
    if (failure.listener !== null) record.listenerFailure = failure.listener;
    // The canary's own DOM change (first DOM component of its signature), ms after
    // activation: the start of P4's DOM-mutation-to-tap latency (DR-0046).
    const domAt = spec.gating ? gatingComponents(spec.canary, [], timeline, window_).filter((c) => c.channel === "dom" && c.found && c.atMs !== undefined).map((c) => c.atMs as number) : [];
    record.domChangeAtMs = domAt.length === 0 ? null : Math.min(...domAt);

    const preflight = buildPreflight(driftMs, raf.maxGapMs ?? Number.POSITIVE_INFINITY);
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
          mutations: timeline.filter((e) => inWindow(e.tQpc)),
          ...(drained === null ? {} : { platformEvents: platformEvents.filter((e) => inWindow(e.t)).map(toPlatformEvent) }),
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
      b2,
      activation,
      msaa,
      clock: {
        native: native.disagreementMs,
        nativeByCollector: { winhelper: helperNative.disagreementMs, listener: listenerNative?.disagreementMs ?? null },
        mappingUncertaintyMs: clockStart.uncertaintyMs,
        driftMs,
        highResolution: clockStart.highResolution,
        raf,
      },
      // Every listener event of the attempt, and the whole DOM timeline, for offline re-analysis.
      ...(drained === null ? {} : { listener: { events: platformEvents, malformed: drained.malformed, uia: drained.uia, drained: drained.drained, remaining: drained.remaining, stderr: drained.stderr } }),
      timeline,
      // Page time to QPC (D1): page QPC ns ≈ navigationStartS × 1e9 + performance.now() × 1e6 − mappingOffsetNs
      // (pageToQpcNs). The half-RTT of the mapping samples is a diagnostic of the applied mapping.
      pageMapping: { navigationStartS: clockStart.navigationStartS, mappingOffsetNs: clockStart.mappingOffsetNs, mappingHalfRttNs: clockStart.mappingHalfRttNs },
      timelineVersion: TIMELINE_VERSION,
      page: pageLog,
      packageValid: validation.success,
      ...(validation.success ? {} : { packageErrors: validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }),
      package: pkg,
    });
  } catch (error) {
    record.error = errorText(error);
    if (activatedAt === null || preActivationReasons === null) {
      // Setup failed before activation, before any outcome existed (D12).
      record.valid = false;
      record.inconclusiveReasons = ["ENV_FAILURE"];
    } else {
      // After activation an error may come from the thing being judged, so it
      // can never make the attempt INCONCLUSIVE (DR-0032): validity rests on the
      // checks completed before activation, and the missing outcome counts as a failure.
      record.valid = preActivationReasons.length === 0;
      record.inconclusiveReasons = preActivationReasons;
      record.outcome = null;
      record.b2 = null;
      record.errorAfterActivation = true;
    }
    if (failure.listener !== null) record.listenerFailure = failure.listener;
  } finally {
    listener?.kill();
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
    // Fail fast if the listener cannot start: probe it once against this process.
    let listenerReady: ListenerReady | null = null;
    if (listenerTmp !== null) {
      const probe = await ListenerProcess.start({ exe: args.listener, pid: process.pid, outPath: join(listenerTmp, "probe.jsonl") });
      listenerReady = probe.ready;
      await probe.stop();
      summary.listenerProbe = listenerReady;
      // From M2 the Node process adopts the listener's precise (QPC, wall) pair
      // (DR-0010, DR-0030). In G1-type NVDA-present jobs no listener runs (P4),
      // so the coarse Node anchor stays; it labels times and buckets parity only.
      if (listenerReady !== null) adoptWallAnchor({ qpcNs: listenerReady.anchorQpcNs, wallIso: listenerReady.anchorWall });
    }
    summary.wallAnchor = { ...captureWallAnchor(), source: listenerReady === null ? "node" : "listener" };
    if (leg === "nvda-present") nvdaRun = await startNvda();
    const manifest: EnvManifest = {
      harnessCommit: process.env.GITHUB_SHA ?? "local",
      imageOS: env.imageOS ?? "unknown",
      imageVersion: env.imageVersion ?? "unknown",
      windowsBuild: `${env.windows?.currentBuild ?? "?"}.${String(env.windows?.ubr ?? "?")}`,
      chromeVersion: EXPECTED_CHROME,
      chromeFlags: CHROME_FLAGS,
      listenerVersion: listenerReady === null ? "not run in this leg (P4)" : `${listenerReady.version} (sha256 ${sha256File(resolve(args.listener))})`,
      ...(listenerReady?.runtime === undefined ? {} : { dotnetVersion: listenerReady.runtime }),
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
            synth: { name: "espeak", ...rateFields(nvdaRun.espeak) },
          }),
    };
    const manifestValid = EnvManifestSchema.safeParse(manifest).success;
    Object.assign(summary, { manifest, manifestValid, synthOk: nvdaRun?.synthOk ?? null, audio, espeak: nvdaRun?.espeak ?? null, espeakEffectiveRate: nvdaRun === null ? null : effectiveRate(nvdaRun.espeak) });
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
