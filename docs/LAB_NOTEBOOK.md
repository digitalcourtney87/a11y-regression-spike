# Lab notebook

Dated observations for the Accessibility Regression CI falsification spike. Decisions belong in `docs/DECISIONS.md`; post-freeze changes to the frozen set (the paths in `protocol/frozen-paths.txt`, DR-0033) belong in `protocol/AMENDMENTS.md`.

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

## 2026-10-03: Addendum after owner review

**Label:** EXPLORATORY
**Source:** the owner's review of M0 of 2 October 2026, recorded as DR-0030 to DR-0045; NVDA release-2026.2 source, read for the eSpeak NG default rate (DR-0041); pending owner items P4 and P6 in `docs/DECISIONS.md`
**Confidence:** no runner observation. The expected rate is inferred from NVDA source; nothing has been observed on a runner by this project.

**Observation.** No workflow has yet run on a GitHub-hosted Windows runner for this project. The owner's review adds three questions for M1a (11–13). Two pending owner items in `docs/DECISIONS.md` need M1a data before they go to the owner (14 for P6; 15 for P4). Questions 1–10 of the 2026-10-02 entry stand.

| # | Question | Desk-research expectation | Why it matters | Affects |
|---|---|---|---|---|
| 11 | **Scream Authenticode signature.** For the Scream 3.6 driver files, what is the Authenticode signature status, who is the signer and who is the issuer, and what is the signer certificate thumbprint? Does the chain validate, or is the certificate self-signed? Where does `devcon` come from: the runner image or the pinned Scream archive? | Not established by desk research. ARIA-AT's recipe adds the signer certificate to TrustedPublisher before `devcon install`, which avoids an installation prompt but says nothing about whether the chain validates. Later Scream releases are reported to hang at `devcon` unless a self-signed certificate is trusted first (DR-0012), so a self-signed result for 3.6 is possible (inference, low confidence). | Chain valid and signer consistent with the release: Claude pins the thumbprint without asking. Self-signed or any other result: DR-0012 states that authenticity rests on trust on first use, nothing is added to TrustedPublisher, and the owner is asked. A separate `devcon` download would be a new hard-rule-12 security item. | DR-0040, DR-0012 |
| 12 | **Effective eSpeak NG rate.** With a committed `nvda.ini` that sets no eSpeak rate, what rate and rate-boost setting does the running synth report? Does any inherited configuration (for example in the Guidepup build) already hold an eSpeak section? | 30 on NVDA's 0–100 scale, rate boost off, on a fresh eSpeak configuration section (NVDA release-2026.2 `espeak.py:216` and `:388`; `synthDriverHandler.py:365-385`). The Guidepup build's own configuration pins oneCore with rate 100 and rate boost on (DR-0017); whether it also carries an eSpeak section is not known. | D8's declared rate is NVDA's default (DR-0041), and the effective rate is recorded in every run's manifest. A value other than 30 is a reason to bring the rate back to the owner. Speech rate sets synth pacing, which shapes when NVDA pushes queued speech (K7). | DR-0041, DR-0017 |
| 13 | **K6 and K7 in both legs.** How long does one canary attempt take in each leg (handover, observation window, teardown)? Does that leave room for 190 record-only runs per leg (380 in all) alongside the gating runs, within the 6 h job limit and the 23 Oct G1 target? | Not estimated by desk research. | K6 and K7 now run in both legs: speech outcomes from the NVDA-present leg, B2 signatures from the NVDA-absent leg; the K6a rule is read on the NVDA-present leg. The result sizes the run plan and feeds the G2 cost table (DR-0003). | DR-0036, DR-0043, DR-0003 |
| 14 | **D1 clock-check computations.** What values do Claude's working definitions of page-mapping uncertainty, segment drift, low-resolution TimeTicks and the rAF gap give on each label, with Chrome in the foreground, with and without NVDA running? Does the in-page `requestAnimationFrame` heartbeat show gaps over 100 ms that the canary page did not cause? | Page-mapping uncertainty within the 100 µs clamp plus half the minimum round trip (question 7); segment drift close to zero, because every clock involved is QPC-based (question 6; inference); `performance.now()` steps of about 100 µs (question 6). rAF gaps on the runner are not estimated by desk research. | These computations decide when an attempt is INCONCLUSIVE. Their final form is fixed from M1a data and goes to the owner before any G1 run (pending owner item P6). | DR-0010, DR-0021 |
| 15 | **Platform focus in the NVDA-present leg.** With NVDA running and no WinEvent listener, does an MSAA-only focus read (`accFocus` through `AccessibleObjectFromWindow` on Chrome's window) identify the declared anchor after the handover, over 20 or more fresh launches, without registering a UIA client? | Not established by desk research. AXMode is locked with `--force-renderer-accessibility=screen-reader` (DR-0019), so the read should not change Chrome's accessibility mode (inference). | Pending owner item P4 proposes this read for the handover's platform-focus check in the NVDA-present leg, so that the leg producing C's evidence has no UIA client. A failed check is INCONCLUSIVE with `FOREGROUND_HWND`. | DR-0020, DR-0024, DR-0021 |

**Status of the 2026-10-02 "Also recorded in M1a" items.** That table was labelled "Proposed by Claude, not yet owner-approved". This entry records how DR-0030 resolved it; the 2026-10-02 entry itself is unchanged.

| Item (2026-10-02) | Status after the owner's review |
|---|---|
| The Scream driver's signer certificate thumbprint | Extended by DR-0040: the Authenticode status, signer and issuer are recorded too (question 11) |
| `ImageOS`, `ImageVersion` and the image name for each label | Approved by the owner 2026-10-02 (DR-0030, PR #1 item 10) |
| Tap reception alongside Guidepup; tap-versus-log message-count parity; the overhead of DEBUG logging | Parity is required by D2 (DR-0011), and per-segment parity may use wall-anchor bucketing (DR-0039). The tap-reception check and the overhead measurement are decided by Claude under DR-0045 (2026-10-03) |

### M1a runner probes (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** `phase0-probe.yml` runs [37111758115](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37111758115) (failed: the Scream step looked for an `x64` folder that the archive does not have), [37111906022](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37111906022) (no audio driver) and [37112285497](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37112285497) (Scream installed). Images: `windows-2025` = `win25-vs2026` 20260925.250.1, Windows Server 2025 build 26100.33438; `windows-2022` = `win22` 20260927.320.1, Windows Server 2022 build 20348.5622. Each run: 10 fresh-profile Chrome launches without NVDA, then 10 with NVDA, per label. Artefacts are kept locally until the G1 archive (DR-0015).
**Confidence:** observed, except where a row says inferred. Counts are small (10 per leg per label per run), so they bound gross failure rates only: 20 of 20 successes gives a Wilson 95% interval of 83.9–100%.

| # | Question | Observation | Affects |
|---|---|---|---|
| 1, 11 | Audio, and the Scream signature | No sound device or audio endpoint on either image. Audio services run on `windows-2025` (automatic) and are stopped on `windows-2022` (manual). Scream 3.6's archive matches the pinned SHA-256. `Scream.sys` and `scream.cat` are Authenticode `Valid`, signed by Tom Kistner (the release author, GitHub user `duncanthrax`) through Sectigo RSA Code Signing CA, chaining to USERTrust RSA Certification Authority. Not self-signed; timestamped by Symantec; the signer certificate expired on 2023-07-06 and validates through the timestamp, as the 3.6 release notes say. The driver is x64. The archive's bundled `devcon.exe` is **not signed**. After installing with the in-repository SetupAPI installer (DR-0047): "Scream (WDM)" and the endpoint "Speakers (Scream (WDM))", both OK, on both images. | DR-0040, DR-0047, DR-0012 |
| 2, 12 | Synth and effective eSpeak rate | Without an audio device, eSpeak NG fails to open audio and NVDA falls back to oneCore ("Couldn't open specified or default audio device"), which D8 makes INCONCLUSIVE. With Scream, NVDA loads `espeak` with no audio errors. The saved session configuration has `[speech] [[espeak]] rate = 30`, with rate boost absent (the driver default, off). Speech carries `LangChangeCommand('en_GB')`. | DR-0041, DR-0017 |
| 3 | Injection marker | `nvdaHelperRemote.dll` is loaded in Chrome's browser process in 40 of 40 NVDA-present launches (two runs, two labels); never in sandboxed renderers, as expected. "Buffer load took" appears in 40 of 40, 3.1 to 4.2 s after launch, including page load. | DR-0017 |
| 4 | Foreground handover | `SetForegroundWindow` alone made Chrome the foreground window in 80 of 80 launches (both legs, both labels, two runs); no Alt keypress was needed. `ForegroundLockTimeout` reads 2147483647 through `SystemParametersInfo` on `windows-2025` and 200000 on `windows-2022` (the registry holds 200000 on both); it made no difference. | DR-0024 |
| 5 | CfT infobars | No speech mentioning an infobar or alert in any NVDA-present launch. Screenshots of the first launch per leg are in the artefacts. | DR-0007 |
| 6, 14 | Clocks (D1) | QPC at 10 MHz, high resolution, on both labels. Native self-test (Node against a PowerShell helper over a pipe, 50 pings): every reading inside its bracket; offset 60–97 µs with uncertainty 133–212 µs (limit 0.5 ms). CDP `Timestamp` against Node's QPC: offset within ±25 µs (uncertainty up to 368 µs), so Chrome TimeTicks and `process.hrtime.bigint()` share an epoch. `performance.now()` steps are 0.1 ms in every launch (high resolution). | DR-0010, P6 |
| 7, 14 | Page mapping (D1) | `NavigationStart + performance.now()` against a 16-ping minimum-RTT bracket: worst \|offset\| + uncertainty 441–656 µs per run and label (limit 2 ms). | DR-0010, P6 |
| 8 | Display | 1024 × 768 at 96 DPI; interactive input desktop; session 2. | DR-0025 |
| 9 | First-launch virtual buffer | No launch without a virtual buffer in 40 NVDA-present fresh-profile launches. | DR-0021 |
| 10 | Integrity and session | Node, the helper, Chrome's browser process and NVDA all run at high integrity in session 2, so window-message isolation between integrity levels cannot block input or reads. | DR-0024 |
| 14 | rAF gaps | Largest rAF gap per launch mostly 15.7 ms; at most 46.9 ms (one launch); none over 100 ms. | DR-0010, P6 |
| 15 | MSAA-only focus read | Identified the anchor ("Probe anchor", push button) in 80 of 80 launches, with and without NVDA, with no UIA client. | DR-0020, DR-0024 |

**Design inputs for M1b (observed).**
- NVDA speaks at startup (the runner console window, then "Connected as controlled computer" when a relay client joins). The relay tap must attach, and these must pass, before an observation window opens; a declared quiet window after attaching covers it.
- NVDA's relay logs one "Error accepting connection" (TLS) at startup, consistent with Guidepup's TCP readiness check on the relay port (inferred).
- Not yet measured: segment drift within a segment, DEBUG-logging overhead, and canary durations in each leg (question 13). These need canary segments and come from the M1b pilot.

### M1b smoke run and M1d strict pilot (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** `phase0-nvda.yml` runs [37114407343](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37114407343) (smoke: K1–K5 twice each, one shard) and [37114709402](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37114709402) (strict pilot, retries off: K1–K5 ten times each, plus K6b, K6e and K7 at their D4 counts; 10 shards; seed 20261004), `windows-2025`, NVDA-present leg. K6a was excluded so the pre-registered rule has a single look, in the G1 run (DR-0048).
**Confidence:** observed. Wilson 95% intervals in brackets.

| Observation | Result |
|---|---|
| Speech text | NVDA's speech dictionaries rewrite text before it is queued: "K1" arrives as "K 1". The smoke run scored its 10 conveyed canaries as FAIL for this reason alone; matching on letters and digits fixes it (DR-0048). Re-scored, all 10 pass, 557–636 ms after activation |
| Gating canaries (pilot) | K1–K5: 50 of 50 attempts valid, 0 failures [each canary 10/10 passes: 72.2–100%]. INCONCLUSIVE 0% |
| Latency, DOM update to tap receipt | About 57–80 ms for live-region updates (K1, K2) and 100–150 ms for focus moves (K3–K5); the update runs 500 ms after activation |
| Priorities | K1 polite update NORMAL; K2 alert update NEXT; K6b populated alert inserted NOW (20/20) |
| K4 | The dialog name is queued twice per attempt ("K 4 settings dialog dialog" before and after the first control), a duplicate that bears on DR-0042 |
| K6b | Announced 20 of 20 [83.9–100%], at NOW priority, as D4 expected |
| K6e | Not announced when the fill lands in the same frame (0 ms: 0/10; one rAF: 0/10) [0–27.8%]; announced at every delay from 50 ms (50, 100, 150, 250, 500 ms: each 10/10) [72.2–100%]. The boundary lies between one frame and 50 ms, not at the 150 ms or 350 ms serialisation window DR-0037's grading assumes |
| K7a | Polite text queued, then the button, no cancel after the update: 20 of 20 [83.9–100%] |
| K7b | Polite text queued, then a cancel after focus entered the text field: 20 of 20. The tap counts the cancelled text as queued, which is the bias DR-0022 records |
| Validity | No INCONCLUSIVE reasons; no errors; every evidence package valid |
| Clocks (D1) | Native self-test disagreement 0 ms; page-mapping uncertainty 0.1 ms; segment drift at most 0.16 ms; rAF gap at most 31.2 ms; no low-resolution TimeTicks |
| Parity (D2) | Run level: tap 127–136 against log 127–138, the log ahead by 0–2. The extra entries are NVDA's startup speech about the runner console, queued after the tap was asked to attach but before the relay confirmed its join, so the tap could not receive them. The parity window now starts at the join confirmation, and parity is also counted per segment (DR-0039) |

**Bearing on open items.** P6 now has its M1b data (segment drift and the other three checks, all far inside the D1 limits). The K6e result triggers DR-0037's conditional owner question about the grading boundaries; it matters for B2 signatures (G2) and the M3 catalogue, not for G1.

### G1 runs (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** `phase0-nvda.yml` runs [37115887572](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37115887572) (G1: K1–K5 50 times each and every record-only canary, 10 shards, seed 20261005) and [37116418050](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37116418050) (K2 top-up, 3 attempts, seed 20261006), commit `f81bcd7`, image `win25-vs2026` 20260925.250.1, NVDA-present leg. Archived as `g1/g1-evidence.tar.zst` on the `results` branch (DR-0050).
**Confidence:** observed. Full tables in `docs/gates/G1.md`.

| Observation | Result |
|---|---|
| Gating canaries | 253 attempts, 252 valid, 0 failures; each canary 100% among valid (Wilson lower bounds 92.9–93.1%) |
| INCONCLUSIVE | 2 of 443 attempts, both `FOREGROUND_HWND`: Chrome in the foreground, but the MSAA read 300 ms after DOM focus still returned the document |
| Latency (DOM update to tap) | Live-region updates: median 57–61 ms, maximum 92 ms. Focus moves: median 106–127 ms, maximum 159 ms |
| K6a | 0 of 20 in each variant: the pre-registered rule is not triggered |
| K6b, K6e, K7 | As in the pilot: K6b NOW 20 of 20; K6e silent for same-frame fills (0 of 19) and announced from 50 ms (50 of 50); K7a no cancel 20 of 20; K7b cancel 20 of 20 |
| Parity | Per segment exact (553 against 553 over 443 segments); per run equal in 8 of 11 runs, the log one ahead in 3 (inferred: speech at the run window's start, within the Node wall anchor's resolution of the join) |
| Clocks | Native self-test 0 ms; page mapping 0.1 ms; drift at most 0.19 ms; rAF gap at most 31.3 ms |

### Corrections after the G1 gate review (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** the G1 gate review of 2026-10-03, which recomputed every figure from the raw evidence; probe run [37114407991](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37114407991), which was missing from the M1 tally.
**Affects:** DR-0021 (G1), DR-0037 (P9), DR-0048 (P11), DR-0050, DR-0051 (P10), DR-0042, DR-0022.

This entry corrects the "M1b smoke run and M1d strict pilot" and "G1 runs" sections above; those sections stay as written.

| Corrected text | Correction |
|---|---|
| M1b section, "Latency, DOM update to tap receipt" row | Those ranges were the smoke run's. The pilot, as an upper bound (key dispatch to tap receipt, minus the page's activation-to-update delay; it includes key delivery), gave: live-region updates (K1, K2) median 55–57 ms, range 35–75 ms; focus moves (K3–K5) median 99–120 ms, range 62–157 ms |
| M1b section, K6e row: "not at the 150 ms or 350 ms serialisation window" | Only polite regions filled after page load were tested, so the data contradict DR-0037's 150 ms post-load boundary only. The 350 ms pre-load boundary and other roles were not tested (P9) |
| M1b section, K7b row: "counts the cancelled text as queued" | It counts the cancelled text as spoken (D13, DR-0022) |
| G1 section, "Latency (DOM update to tap)" row | It is an upper bound, not DOM-to-tap latency, and the K2 figure left out the top-up. Corrected (252 valid passing runs, from `report:phase0`): live-region updates median 56.5–60.8 ms, maximum 91.2 ms; focus moves median 101.4–123.7 ms, maximum 154.5 ms. The page-to-QPC mapping needed for P4's DOM-mutation latency is recorded per attempt from M2 onwards |
| G1 section, counts without intervals | INCONCLUSIVE 2 of 443 (0.1–1.6%); K6a 0 of 20 per variant (0–16.1%); K6e same-frame fills 0 of 19 (0–16.8%); fills from 50 ms 50 of 50 (92.9–100%) |
| M1 tally | Probe run 37114407991 (push-triggered by commit 8992346, both labels, success) repeated the M1a probes: every check 10 of 10 per leg per label, eSpeak NG loaded at rate 30, Scream installed. It is now in the G1 archive |

### M2 listener smoke run and pilot (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** `phase0-nvda.yml` runs [37119067877](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37119067877) (smoke: NVDA-absent leg, K1–K5 twice each, one shard, seed 20261010, commit `8e7bce1`) and [37119295670](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37119295670) (pilot: both legs, K1–K5 twice each and every record-only canary, 10 shards per leg, seed 20261011, commit `a34782d`), image `win25-vs2026` 20260925.250.1 in every job.
**Affects:** DR-0053 (P12), DR-0019 (P3 final ranges), DR-0037 and P9 (DR-0052), DR-0041, DR-0046 (P4 latency).
**Confidence:** observed, except where marked inferred. Small samples: the gating canaries ran twice per leg in each run.

| Observation | Result |
|---|---|
| Listener health | All 6 hook ranges installed in every job; UIA self-check validated in 210 of 210 attempts; no attempt without events; no malformed lines |
| Identity | Chrome exposes each DOM id as the UIA AutomationId; every platform signature component matched through it |
| K1–K5 B2 signatures (NVDA-absent) | 14 of 14 attempts matched across both runs; EVENT_SYSTEM_ALERT never fired for K2's content update (0 of 4) |
| DOM change to WinEvent | Pilot medians 8.7–12.1 ms, maximum 12.8 ms; smoke 7.8–20.0 ms |
| K6 platform signatures | Populated insertions (K6a, K6e at 0 ms and one rAF): EVENT_OBJECT_SHOW only, no live-region or text event on the region (0 of 80). Fills from 50 ms: SHOW, then REORDER, IA2 TEXT_INSERTED and LIVEREGIONCHANGED on the region (50 of 50). K6b: EVENT_SYSTEM_ALERT and SHOW (20 of 20) |
| P9 against B2 | The NVDA-absent B2 signatures agree with NVDA's speech and with P9's boundary: one-rAF fills (DOM delay 5–10 ms) look like populated insertions on the platform; fills from 50 ms reach it as separate updates |
| K7 order | Polite update before the focus move in the DOM and on the platform, 20 of 20 for each of K7a and K7b |
| NVDA-present leg (speech) | As in G1: K1–K5 10 of 10; K6a 0 of 60; K6b NOW 20 of 20; K6e silent at 0 ms and one rAF (0 of 20), announced from 50 ms (50 of 50); K7b cancel 20 of 20. Parity per segment exact (166 against 166) |
| P4 latency (DOM change to tap) | Pilot medians: K1 33.5 ms, K2 24.4 ms, K3 68.3 ms, K4 95.0 ms, K5 71.5 ms (n = 2 each) |
| eSpeak NG | Effective rate 30, rate boost off, recorded in each of the 10 NVDA runs (DR-0041) |
| P10 retry | 1 of 410 attempts needed more than one focus read: NVDA-present leg, K6e:raf, anchor returned on the fifth read (about 400 ms after the first). Under G1's single read it would have been INCONCLUSIVE; with P10 it is valid |
| Clocks | Native self-test 0 ms for both native collectors; page mapping 0.1 ms; drift at most 0.19 ms; rAF gap at most 46.9 ms |
| Listener build | The executable's SHA-256 is identical across jobs of one run but differs between commits with the same listener source (inferred: the SDK embeds the source revision); the hash identifies a build, not the source |

### G2 run and NVDA on/off diagnostic (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** `phase0-nvda.yml` runs [37119632093](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37119632093) (G2: NVDA-absent leg, K1–K5 52 times each and every record-only canary, 10 shards, seed 20261012) and [37119638620](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37119638620) (diagnostic: both legs, K1–K5 20 times each, listener in the NVDA-present leg, seed 20261013), commit `14fd612`, image `win25-vs2026` 20260925.250.1 in every job. Archived as `g2/g2-evidence.tar.zst` on the `results` branch (DR-0054).
**Affects:** DR-0053 (P12), DR-0037 and P9 (DR-0052), DR-0019 (P3), DR-0020 (diagnostic).
**Confidence:** observed, except where marked inferred. Full tables in `docs/gates/G2.md`.

| Observation | Result |
|---|---|
| Gating B2 signatures | 260 attempts, 260 valid, 0 failures; each canary 52 of 52 (Wilson lower bound 93.1%); every platform component matched by AutomationId |
| DOM change to WinEvent | Medians 9.8–11.6 ms; maximum 14.7 ms |
| K6 and K7 | As in the pilot: K6a and the same-frame K6e fills show only SHOW (0 of 80 with a separate update); K6b shows SHOW and EVENT_SYSTEM_ALERT (20 of 20, no separate update); fills from 50 ms give a separate update (50 of 50); the K7 update precedes the focus move in both channels (40 of 40) |
| Chrome's serialisation window | Pilot and G2 combined (n = 20 per delay): the region's SHOW arrived 9–11 ms after the DOM insertion; the fill's TEXT_INSERTED arrived at a median 165–166 ms for fills at 50, 100 and 150 ms, and about 10 ms after the fill for 250 and 500 ms. The window delays a follow-up change rather than merging it with the insertion (inferred mechanism) |
| On/off diagnostic | Matches 99 of 99 with NVDA absent (one K5 attempt INCONCLUSIVE, rAF gap 125 ms) and 100 of 100 with NVDA present; the signature events are the same. The only systematic window difference is a STATECHANGE on the activating button in the NVDA-absent leg, inferred to be the pressed state from Playwright's click |
| Speech with the listener present | NVDA conveyed all 100 gating attempts; per-segment parity exact (160 against 160) |
| Clocks (G2 run) | Native self-test 0 ms for both collectors; page mapping 0.1 ms; drift median 0.04 ms, maximum 0.17 ms; rAF gap median 15.8 ms, maximum 47.0 ms |
| P10 | 2 of 450 G2 attempts needed four reads; both valid |

### Corrections after the G2 gate review, and the verification run (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** the G2 gate review of 2026-10-03, which recomputed the figures from the raw evidence (50 findings confirmed); `phase0-nvda.yml` run [37122536874](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37122536874) (verification of the gate-review code: both legs, K1–K5 once, K6e one rAF and 50 ms, K7a, seed 20261014, commit `3076d67`).
**Affects:** DR-0053 (P12, P13), DR-0054, DR-0037 and P9 (DR-0052), DR-0041.

This entry corrects the "M2 listener smoke run and pilot" and "G2 run and NVDA on/off diagnostic" sections above; those sections stay as written.

| Corrected text | Correction |
|---|---|
| Smoke and pilot, "K1–K5 B2 signatures": "14 of 14" | 20 of 20 (smoke 10, pilot 10) |
| Smoke and pilot, "DOM change to WinEvent": "smoke 7.8–20.0 ms" | Smoke medians 7.8–16.2 ms, maximum 20.0 ms |
| Smoke and pilot, K6 row: "SHOW, then REORDER, IA2 TEXT_INSERTED and LIVEREGIONCHANGED" | SHOW at the insertion; at the fill, IA2 TEXT_INSERTED, then REORDER and LIVEREGIONCHANGED |
| Smoke and pilot, "eSpeak NG": "rate 30 … recorded in each of the 10 NVDA runs" | What was read is a session `nvda.ini` with no `[[espeak]]` section; 30 with rate boost off is NVDA's default (DR-0041), not a value read |
| G2 entry, "K6 and K7": "the K7 update precedes the focus move in both channels (40 of 40)" | In the DOM the order is fixed by the canary's construction. On the platform IA2 TEXT_INSERTED preceded EVENT_OBJECT_FOCUS (40 of 40) but LIVEREGIONCHANGED followed it (40 of 40), all within about 0.6 ms in one batch |
| G2 entry, "Chrome's serialisation window": "the region's SHOW arrived 9–11 ms after the DOM insertion" | Medians 8.8–11.4 ms, per-attempt range 5.1–13.8 ms (pilot and G2) |
| G2 entry, on/off diagnostic: "The only systematic window difference is a STATECHANGE on the activating button" | Two, both NVDA-absent only: STATECHANGE on the "Start canary" button in every attempt, and STATECHANGE on `main` in every K5 attempt. Both are inferred pointer-state effects of Playwright's click, so the diagnostic changes NVDA presence and activation together |
| Both entries, identity: "every platform signature component matched through AutomationId" | True for gating components. In K6e region traces the LiveSetting fallback attributed each fill's text node to the region (100 times); LiveSetting is no longer an identity (DR-0053) |
| Both entries, hooks | Hook counts were recorded per job (the probe against Node), not per attempt; per-attempt readiness lines are recorded from the gate-review fix |

**Verification run (gate-review code).** All 6 jobs succeeded on image `win25-vs2026` 20260925.250.1. NVDA-absent leg:
- listener 0.3.0 ready, its readiness line recorded, and drained in 45 of 45 attempts;
- the wall anchor was adopted from the listener in every NVDA-absent job;
- timeline version 2 in every attempt;
- one-rAF fills were tagged as rAF fills and graded populated insertions (10 of 10); 50 ms timer fills were untagged and graded separate updates (10 of 10);
- every gating signature matched (5 of 5).

NVDA-present leg (G1-type, no listener): K1–K5 conveyed (5 of 5), K6e one rAF silent (0 of 10), 50 ms announced (10 of 10), K7a 20 of 20. Re-scoring every earlier M2 run with this code changed no gating verdict and no record-only trace.

### Follow-up verification after the G2 merge (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** `phase0-nvda.yml` run [37125153236](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37125153236): both legs, K1–K5 twice each, one shard per leg, seed 20261015, commit `8e31c00`, image `win25-vs2026` 20260925.250.1. Archived as `g2/g2-followup-evidence.tar.zst` on the `results` branch (SHA-256 `36b75dd1…a36cf5`).
**Affects:** DR-0055 (follow-up fixes; P13's malformed-line rule).
**Confidence:** observed; a small check, not a gate sample.

| Observation | Result |
|---|---|
| Listener 0.3.1 | Ready, drained and 0 malformed lines in 10 of 10 NVDA-absent attempts; wall anchor adopted from the listener |
| Child identity | K4's focus event resolved to `dialog-first` in 2 of 2, as before the resolver change |
| Timeline version 3 | Recorded in all 20 attempts; no canary uses shadow DOM, so the shadow-root focus path is covered by unit tests only |
| B2 signatures | 10 of 10 matched; every platform component by AutomationId |
| NVDA-present leg (speech) | K1–K5 conveyed in 10 of 10 |
| Re-scoring the five earlier M2 runs | No verdict, grade or order changed; the record-only table gains the "No B2 trace" column (0 everywhere) |

### M3: corpus SPAs and the first dev items (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** `m3-spa-probe.yml` run [37126215365](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37126215365) (candidates); `m3-spa-build.yml` runs [37129009688](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37129009688) (Atomic CRM vendored), [37129580999](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37129580999) (both apps) and [37130160420](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37130160420) (both apps and the 17 dev patches); image `win25-vs2026` 20260925.250.1.
**Affects:** DR-0056 to DR-0060 (P14–P19).
**Confidence:** observed.

| Observation | Result |
|---|---|
| Candidates, offline | Atomic CRM (as shipped): 83 requests to `marmelab.com` (logos, avatars, telemetry), no page error. react-admin simple: 2 (telemetry, Google fonts), no page error. TanStack kitchen sink: its data request to `jsonplaceholder.typicode.com` fails offline |
| Vendored and integrated | Atomic CRM: install 23–32 s, build 9 s; react-admin simple: install 30 s, build 2 s. Both: no outside request, no console error, and identical ARIA snapshots across two fresh loads at a fixed clock on every path probed (4 and 3 paths) |
| Atomic CRM build | The first build failed: the app imports `CHANGELOG.md` as text for its changelog page; vendored afterwards |
| react-admin lockfile | Generated in CI: 284 packages, all from `registry.npmjs.org`, every one with an integrity hash; react-admin 5.15.4, MUI 5.18.0, React 18.3.1 |
| Dev patches | 17 of 17 apply, build and load offline with no page error, and revert cleanly |
| Open-source survey | Title-only search of 12 libraries: about 15 plausible accessibility regressions (`docs/research/2026-10-03-oss-regression-survey.md`) |

### M3: reproducing mined open-source pairs (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** `m3-oss-repro.yml` runs [37131615681](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37131615681), [37132740948](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37132740948), [37133618945](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37133618945) and [37134051657](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37134051657).
**Affects:** DR-0063 (P21, P22).
**Confidence:** observed.

| Observation | Result |
|---|---|
| First run | 1 of 12 fixtures reproduced cleanly (bootstrap-35496). Most fixtures did not set up the issue's scenario: a click that never reached the control, a selector the library overwrote (`useRole` replaces the reference's `id`), or a missing precondition (a user tick before a programmatic change; state that changes after mount) |
| Install date | One shared `--before` date per fixture made react-aria-components 1.10.0 fail to build (a missing export from a later `@react-aria/utils`); each release now installs as of its own publish date plus one day |
| Verified | 11 pairs reproduce on both paths; every fixed release tested holds again |
| Not reproduced | rac-8298 in three fixtures; floating-2874 holds on the keyboard path (pointer-only by its mechanism) |
| Outside requests | None, except carbon-7253 (2 font requests from the Carbon CSS, blocked, no page error) |
| After the split (run [37134734243](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37134734243)) | Only the 3 dev fixtures ran. Each pair reproduced a third time, and the three benign twins (wrapper-added, css-only, css-only) kept the checked behaviour on both paths |

### M4: journeys and the first full item run (appended 2026-10-03)

**Label:** EXPLORATORY
**Source:** `m4-items.yml` journey rounds 37139054732, 37139594634, 37140040580, 37140786020 and 37141599755; smoke runs 37142093929 and 37142491385; full run [37143043955](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37143043955); re-run [37145610510](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37145610510).
**Affects:** DR-0066 to DR-0073 (P23–P26).
**Confidence:** observed.

| Observation | Result |
|---|---|
| Playwright's clock API | Also fakes `performance.now()` and rAF: every Atomic CRM attempt was INCONCLUSIVE (low-resolution TimeTicks), and Radix's focus restoration after Escape failed. A Date-only shim fixed both |
| NVDA browse mode (base builds) | A list item is one line ("bullet Ana graphic busy"); "/" is spoken "slash"; Enter clicks a menu trigger, so the menu, not its first item, takes focus; the first Escape in a menu leaves focus mode without reaching the page; focus mode persists after a form; after an in-app navigation the cursor is at the bottom; Space on a focused drag handle clicks it. The last of these opened a deal and archived it |
| NVDA and the keyboard drag (with focus mode) | "You have lifted an item in position 1", "You have moved the item from position 1 in list opportunity to list proposal-sent…", "You have dropped the item…" |
| Mined pairs, raw evidence | fluent-35927: NVDA says "graphic available" on the candidate against "graphic busy" on the base; rac-8697: the candidate's link never opens; carbon-19563: the candidate's checkbox stays checked after the clear |
| Full run | 112 blocks, 0 INCONCLUSIVE; 736 attempts, all packages valid; all canaries passed; all base journeys complete; no PATH_CHANGED on any benign twin or unchanged control |
| Imprecise goal | A name-only goal ("Comments") matched a table header after the hidden menu; with its role, the candidate is UNREACHABLE in both legs |

