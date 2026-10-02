# Lab notebook

Dated observations for the Accessibility Regression CI falsification spike. Decisions belong in `docs/DECISIONS.md`; post-freeze protocol changes belong in `protocol/AMENDMENTS.md`.

## Format

- **One entry per date**, newest last. Append only. A correction is a new entry that names the entry it corrects.
- **Every entry is labelled EXPLORATORY.** Nothing in this notebook is confirmatory evidence. Before the protocol freeze (M6) all work is exploratory (HANDOFF §4 rule 5). Observations recorded here are never re-labelled as confirmatory.
- **Each entry states:**

| Field | Content |
|---|---|
| Date | The date of the entry |
| Label | EXPLORATORY |
| Source | Desk research, a workflow run (run ID, label, `ImageVersion`), or an archived gate bundle (DR-0015) |
| Observation | What was seen, with numbers and intervals where there are counts (Wilson 95%) |
| Confidence | Observed, or inferred (and from what) |
| Affects | The decision records or open questions it bears on |

- **No test-split data.** Test-split items are never executed before the freeze (HANDOFF §4 rule 5), so no entry can contain test-split observations.
- **Public repository.** No secrets, customer data, interview notes or identifiable defect details (HANDOFF §4 rule 1).

---

## 2026-10-02: Desk research only; questions for M1a

**Label:** EXPLORATORY
**Source:** desk research, `docs/research/2026-10-02-phase0-feasibility.md` (DR-0029)
**Confidence:** inferred from source code, documentation and third-party CI logs. Nothing has been observed on a runner by this project.

**Observation.** Only desk research exists so far. No workflow has run on a GitHub-hosted Windows runner for this project. Every expectation below is a prediction to be tested, not a finding.

**Questions M1a must settle** (runner probes on `windows-2025` and `windows-2022`, DR-0025). The "desk-research expectation" column records the prediction now, so that M1a can confirm or refute it.

| # | Question | Desk-research expectation | Why it matters | Affects |
|---|---|---|---|---|
| 1 | **Audio endpoint and Audiosrv state.** How many audio endpoints exist, and is Audiosrv running, before and after the Scream 3.6 install? | No endpoint on the stock image; Audiosrv possibly stopped. Scream 3.6 installs in about 2 s on `windows-2025` (ARIA-AT precedent). `windows-2022` is unproven for 3.6. | The audio preflight (`audioOk`) marks runs INCONCLUSIVE without an endpoint and a running Audiosrv. | DR-0012, DR-0021 |
| 2 | **Which synth NVDA loads, with and without Scream.** Does eSpeak NG load as configured, and do index and done-speaking callbacks fire? | With Scream: eSpeak NG loads and fires callbacks. Without: eSpeak cannot open the device and NVDA falls back (eSpeak → silence), or synthesis completes with no real-time pacing. | Any synth fallback is INCONCLUSIVE (`SYNTH_FALLBACK`). Synth pacing determines when NVDA pushes queued speech, which shapes K7. | DR-0017, DR-0012 |
| 3 | **The injection marker and "Buffer load took".** With `[UIA] allowInChromium=3`, is `nvdaHelperRemote*.dll` loaded in `chrome.exe`, and does the NVDA log contain "Buffer load took" (plus the "Chromium window treated as non-UIA" line when the UIA debug category is on)? | Yes on x64 runners. NVDA's own Chrome system tests pass on both labels. | Without injection, NVDA uses out-of-process IA2 with no Chrome-side stub, and live-region speech (K1) is likely to be lost. The run is INCONCLUSIVE (`NVDA_INJECTION_MARKER`). | DR-0017, DR-0021 |
| 4 | **Foreground-lock behaviour.** Over 20 or more fresh Chrome launches, does `GetForegroundWindow()` equal the Chrome top-level window after launch and after NVDA starts? Which technique brings it forward reliably: `page.bringToFront()`, `SetForegroundWindow` after harness-injected input, or `AttachThreadInput`? | Sessions are interactive and x64 can take the foreground, but the foreground lock may block new windows. `@guidepup/setup` 0.29.1 no longer changes `ForegroundLockTimeout`. Alt-key tricks would be heard by NVDA. | Chrome suppresses focus events when its window lacks focus (K3–K5 signatures). OS-level keys go to the foreground window. A failure is INCONCLUSIVE (`FOREGROUND_HWND`). | DR-0024, DR-0019, DR-0021 |
| 5 | **CfT infobars.** Does Chrome for Testing 153.0.8010.12, launched by Playwright 1.63.0 with `chromiumSandbox: true`, show any infobar that NVDA announces or that fires a browser-UI EVENT_SYSTEM_ALERT? | No. Playwright passes `--disable-infobars`, which CfT honours for buttonless infobars, and the sandbox is on, so the `--no-sandbox` warning does not apply. ARIA-AT's branded-Chrome runs did announce an infobar alert on every foreground change. | An infobar announcement would add speech to every segment, and an alert on `Chrome_WidgetWin_1` would add a browser-UI event to B2. | DR-0007, DR-0019 |
| 6 | **Clock epochs.** Do Chrome TimeTicks share an epoch with `process.hrtime.bigint()` (Node) and `Stopwatch.GetTimestamp()` (C#)? Is `performance.now()` stepping at about 100 µs (QPC-based) rather than 1 ms or more? | Yes. All are QueryPerformanceCounter-based on a Hyper-V guest; `performance.now()` is clamped to 100 µs with jitter. | The CDP page-time mapping assumes a shared epoch. Low-resolution TimeTicks is INCONCLUSIVE (`CLOCK_LOW_RES_TIMETICKS`). | DR-0010, DR-0021 |
| 7 | **Page time origin.** Does CDP `NavigationStart` (from `Performance.getMetrics`) equal the page's time origin? Cross-check `NavigationStart + performance.now()` against a 16-ping minimum-RTT estimate (16 `performance.now()` evaluations bracketed by `process.hrtime.bigint()`, keeping the sample with the smallest round trip). | Yes. The window performance time origin is set from navigation start, so agreement should be within the 100 µs clamp plus half the minimum round trip. | D1 requires this verification once in M1a before page timestamps are trusted. Page-mapping uncertainty above 2 ms is INCONCLUSIVE (`CLOCK_PAGE_MAPPING`). | DR-0010 |
| 8 | **Display resolution and DPI.** What are the screen size (`GetSystemMetrics`), the DPI (`GetDpiForSystem`) and the headed Chrome window rectangle on each label? | Historically 1024×768. Playwright's default 1280×720 viewport would push a headed window partly off-screen. | Window geometry must be identical across runs and fit the screen. The result fixes the viewport and window-size settings. | DR-0007 |
| 9 | **First-launch virtual-buffer failure rate.** How often does NVDA create no virtual buffer for a freshly launched Chrome, and is run 1 on a VM worse than runs 2..N? | NVDA's CI documents occasional first-launch failures and works around them with a warm-up launch. With a fresh profile per run, every launch may behave like a first launch. | G1 allows at most 3 failures per canary and 5 pooled. A per-launch failure mode could consume that budget for reasons unrelated to the instrument. | DR-0021, DR-0013 |
| 10 | **Desktop session.** What integrity level (`whoami /groups`, Mandatory Level) and session ID do NVDA, Chrome, the listener and the input path each get on each label? Does a `SendInput` keystroke from the job shell reach a foregrounded Chrome? | Jobs run as runneradmin in an interactive session. The image sets `ConsentPromptBehaviorAdmin=0` but not `EnableLUA=0`, so the integrity level of job-launched processes is undocumented (inference, medium confidence). | UIPI blocks `SendInput` into higher-integrity windows and limits lower-integrity accessibility clients, so input or the listener could fail silently across a mismatch. | DR-0024, DR-0019 |

**Also recorded in M1a** (Proposed by Claude, not yet owner-approved):

| Item | Why | Affects |
|---|---|---|
| The Scream driver's signer certificate thumbprint, before anything is added to TrustedPublisher | env.lock moves from `pending-M1a` to `pinned` | DR-0012 |
| `ImageOS`, `ImageVersion` and the image name reported by each label | Manifest values and the label check | DR-0006 |
| Tap reception alongside Guidepup, and message-count parity between tap `speak` messages and NVDA log "Speaking" lines, plus the CPU and latency overhead of DEBUG logging | Validates the speech instrument before the canary runs | DR-0011 |

**Not probed:** title latency. D1 removes the `document.title` marker (DR-0010, DR-0025).
