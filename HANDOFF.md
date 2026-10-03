# HANDOFF — Accessibility Regression CI · Falsification spike, Phase 0

**Version:** 1.8 (2026-10-03)
**For:** Claude Code
**Owner and reviewer:** Courtney
**Source of truth:** `docs/PRD-v0.3-technical-extract.md` in this repository, plus the full PRD v0.3 held privately by the owner (never committed, D5), as amended by §5 of this file. Where they conflict, this file wins; where this file is silent, the PRD wins.
**Authorised scope:** Milestones M0–M4. The owner approved Gate G2 on 2026-10-03, which unlocked M3 (DR-0055), merged M3 (PR #6) and authorised M4 on 2026-10-03 (DR-0065). M5–M7 are specified for context; Claude asks the owner before starting M5, and the Phase 1 proceed/stop decision stays on 27 November 2026 (DR-0003).

> **Owner setup is complete (2026-10-02):** the repository exists, this file is at its root, the §2 decisions are confirmed and recorded in `docs/DECISIONS.md`, and `gh` is authenticated against the repository. The full PRD stays with the owner and is never committed (DR-0014, D5). The repository settings in DR-0016 (D7) are the owner's to apply; Claude never requests admin scope.

---

## Changes in v1.8

v1.8 records the owner's approval of P23–P25, the M4 journey model (DR-0067; DR-0066). No owner items are pending. The v1.7 and earlier change logs below are kept as written.

| Section | What changed | Authority |
|---|---|---|
| Header | Version 1.8 | DR-0067 |
| §9 (M4) | Journey execution per leg (P23) and goal-based step outcomes (P24) | DR-0067; DR-0066 |
| §10.2 | `Strategy` gains `PRESS`; `AtStep` gains `key` for it (P25) | DR-0067; DR-0066 |

## Changes in v1.7

v1.7 records the owner's authorisation of M4 after merging M3 (DR-0065), and the M3 outcome (P14–P22; DR-0056 to DR-0064). No owner items are pending. The v1.6 and earlier change logs below are kept as written.

| Section | What changed | Authority |
|---|---|---|
| Header | Version 1.7; authorised scope M0–M4; ask before M5 | DR-0065 |
| §9 (M3) | M3 merged (PR #6): 79 regression patterns, 20 dev and 59 test; Prompt to Page set aside | DR-0057; DR-0064 |
| §12 | Current authorisation: M0–M4 | DR-0065 |

## Changes in v1.6

v1.6 records the owner's approvals at the G2 gate (DR-0055): G2 is accepted and M3 is unlocked; P12 (the B2 signature definitions) and P13 (which errors may be INCONCLUSIVE) are approved; P9 is final as tested. No owner items are pending. The v1.5 and earlier change logs below are kept as written.

| Section | What changed | Authority |
|---|---|---|
| Header | Version 1.6; authorised scope M0–M3 | DR-0055 |
| §7.4 | Errors: only setup errors before activation are INCONCLUSIVE; listener failures and errors after activation are failures | DR-0055 (P13); DR-0053 |
| §8.3 | P9 final as tested: same task or one rAF within one frame, 50 ms or more, REVIEW between | DR-0055; DR-0052 |
| §9 (M2) | G2 accepted | DR-0055 |
| §9.1 | B2 signature definitions (P12) | DR-0055; DR-0053 |
| §12 | Current authorisation: M0–M3 | DR-0055 |

## Changes in v1.5

v1.5 records the owner's approvals at the G1 gate (DR-0052): G1 is accepted and M1 merged; pending owner items P3, P7, P9, P10 and P11 are approved. No part of this file is now Proposed. The v1.4 and earlier change logs below are kept as written.

| Section | What changed | Authority |
|---|---|---|
| Header | Version 1.5 | DR-0052 |
| Changes in v1.2 (label legend) | No Proposed items remain in this file | DR-0052 |
| §7.2 (step 2) | The MSAA focus read is retried for up to 1 s, from M2 | DR-0052 (P10); DR-0051 |
| §8.2 | Listener event scope approved | DR-0052 (P3); DR-0019 |
| §8.3 | Post-load boundary for polite regions replaced by the observed one, provisionally | DR-0052 (P9); DR-0037 |
| §9 (M1) | G1 accepted | DR-0052 |
| §9.1 | Canary speech-matching rule added | DR-0052 (P11); DR-0048 |

## Changes in v1.4

v1.4 records the M1a results that change the execution model (DR-0047). The v1.3, v1.2 and v1.1 change logs below are kept as written.

| Section | What changed | Authority |
|---|---|---|
| Header | Version 1.4 | DR-0047 |
| §7.1 (audio) | Scream installed in both legs with an in-repository SetupAPI installer; the archive's unsigned `devcon.exe` is never run; M1a showed audio is required for eSpeak NG | DR-0047; DR-0040 |
| §9.2 | Skeleton runs `scream.ps1` in both legs and the local Guidepup CLI; prose records the pinned signature and the installer | DR-0047; DR-0009 |

## Changes in v1.3

v1.3 records the owner's approvals of 3 October 2026 (DR-0046): pending owner items P1, P2 and P4 are approved; the repository-safety test detects the remaining GitHub token families; and multi-agent orchestration is used only for gate reviews. The v1.2 and v1.1 change logs below are kept as written.

| Section | What changed | Authority |
|---|---|---|
| Header | Version 1.3 | DR-0046 |
| Changes in v1.2 (label legend) | Only P3 remains pending in this file | DR-0046 |
| §7.2 (step 2) | MSAA-only focus read in the NVDA-present leg approved (P4) | DR-0046; DR-0020; DR-0024 |
| §8.4 | Collectors in the NVDA-present leg approved (P4) | DR-0046; DR-0020 |
| §9.1 | Creation-time family membership as listed in DR-0013 approved (P1) | DR-0046; DR-0013 |
| §9.2 | `actions/setup-dotnet` approved and pinned (P2) | DR-0046; DR-0008 |
| §12 | Golden rule on cost: multi-agent orchestration only for gate reviews | DR-0046 |

## Changes in v1.2

v1.2 applies the owner's review of M0 (2 October 2026; recorded 2026-10-03). Decision records DR-0030 to DR-0045 are in `docs/DECISIONS.md`, and DR-0026 (schema v1.1) is now accepted with amendments. The owner approved every item of the M0 pull request's Proposed list, some with amendments (DR-0030); the amendments and the owner's new rulings are recorded in DR-0031 to DR-0045. Labels in this file:

| Label | Meaning |
|---|---|
| "approved by the owner 2026-10-02 (DR-0030)", or a specific record | The owner approved the part in the review of M0 |
| "Decided by Claude under DR-0045 (2026-10-03)" | Not a hard-rule-12 item; Claude decided it under the owner's delegation and logged it |
| "Proposed by Claude (not yet owner-approved)" | A hard-rule-12 item awaiting the owner; listed under "Pending owner items (hard rule 12)" in `docs/DECISIONS.md`. In v1.2 four appeared in this file (P1, P2, P3, P4); the owner approved P1, P2 and P4 on 2026-10-03 (DR-0046) and P3 at the G1 gate (DR-0052), so none remains; P12 and P13, added in M2, were approved at the G2 gate (DR-0055) |

Sections §1, §3 and §13 are unchanged. The v1.1 change log below is kept as written for v1.1, with a one-line historical note added at its top.

| Section | What changed | Authority |
|---|---|---|
| Header | Version 1.2 (2026-10-03) | Editorial |
| Changes in v1.2 | New section (this table). The label legend lists P4 as well as P1 to P3 | Editorial; DR-0020 (P4 pending) |
| Changes in v1.1 | One-line historical note added at its top: its labels were resolved by DR-0030, and the current status of every item is in `docs/DECISIONS.md`. The table is otherwise kept as written | Editorial; DR-0030 |
| §2 | Rows added: schedule (G1 report target 23 October 2026; M2 in parallel with M1) and escalation (hard-rule-12 items only; gate brief) | DR-0043; DR-0045 |
| §4 rule 5 | Note: execution is guarded too; from M4 the runner calls the wrapper `assertItemExecutable` (`harness/src/runner/splitGuard.ts`), which calls `assertSplitAllowed`, before executing any test-split item | DR-0034 |
| §4 rule 12 | Note: these items and security are the only ones brought to the owner; Claude decides and logs the rest | DR-0045 |
| §5 R3 | C uses the same evidence split as D (approved); legs combined at item level | DR-0030; DR-0031 |
| §5 R5 | The protocol hash covers `protocol/frozen-paths.txt`; the runner refuses test-split execution from M4 through the wrapper `assertItemExecutable` (`harness/src/runner/splitGuard.ts`), which calls `assertSplitAllowed` | DR-0033; DR-0034 |
| §5 R8 | C's NVDA-absent B2 evidence approved, so C and D differ only in trigger masking. Item-level leg combination (k of n per leg) replaces matching by item, side and repetition index; repetition indices are kept for traceability only | DR-0030; DR-0031 |
| §5 R9 | INCONCLUSIVE principle; pooled validity unit approved; per-canary INCONCLUSIVE rates with a flag above 10%; Phase 0 scope and the side-aware rule from M4, with a check covering both sides counted as failing on both (decided by Claude) and the covering FAIL rules going to the owner with the M5 oracles | DR-0032; DR-0030; DR-0038; DR-0035; DR-0045 |
| §5 R10 | Sentence added: the same bias makes ANNOUNCEMENT_DUPLICATED anti-conservative | DR-0042 |
| §6 | Note for M5: ANNOUNCEMENT_DUPLICATED is anti-conservative; duplicates need NVDA-log corroboration or route to REVIEW, and the choice goes to the owner at M5; wall-anchor bucketing is not enough for corroboration | DR-0042 (relates to DR-0022); DR-0039; DR-0045 |
| §7.1 | Browser-version assertion decided by Claude. eSpeak NG at NVDA's default rate (30 on a fresh configuration; the `nvda.ini` committed in M1 must not set an eSpeak rate; effective rate recorded per run), rate boost off, replacing the declared rate; new eSpeak NG rate bullet: a rate other than 30 is a reason to revisit, any change goes to the owner, and `SYNTH_FALLBACK` is unchanged. New Scream signature bullet: Authenticode status, signer and issuer; when Claude may pin the thumbprint; other results treated like the self-signed case (decided by Claude). Manifest fields: DR-0026 accepted with amendments | DR-0045 (DR-0007); DR-0041; DR-0040; DR-0026 |
| §7.2 | Placement and order of handover steps 3–6 decided by Claude. Note on step 2: in the NVDA-present leg, how platform focus is verified is pending owner item P4 (the proposal is an MSAA-only focus read, so that no UIA client registers) | DR-0045; DR-0020 (P4 pending); DR-0024 |
| §7.3 | Self-test method and interim Node wall anchor approved. New bullet: NVDA log bucketing via the wall anchor for parity and diagnostics only. `maxClockSkewMs` redefinition approved with DR-0026 | DR-0030; DR-0039; DR-0026 |
| §7.4 | Image-mismatch report decided by Claude. Audio check's leg approved. Post-block canary approved, with the INCONCLUSIVE principle; side-aware rule from M4 | DR-0045 (DR-0006); DR-0030; DR-0032; DR-0035 |
| §8.1 | Tap-versus-log parity may bucket log lines by segment through the wall anchor | DR-0039 |
| §8.2 | Hook and resolver thread split decided by Claude. Hook ranges, PID and window-class filtering and the browser-UI alert exclusion marked as pending owner item P3 | DR-0045 (DR-0019); DR-0030 (P3 pending) |
| §8.3 | `attachShadow` patch and `takeRecords` ordering approved. The insertion-to-content delay grading replaces the v1.0 same-batch flag and is the rule in force; a K6e contradiction of the window boundaries goes to the owner | DR-0030; DR-0037 |
| §8.4 | NVDA-present leg: which collectors run there and how platform focus is verified there are Proposed by Claude (not yet owner-approved; pending P4). The proposal: DOM timeline in both legs, WinEvent listener in that leg only for the on/off diagnostic, and an MSAA-only focus read so that no UIA client registers. Bullet added: K6 and K7 in both legs. C's evidence split approved; item-level combination | DR-0020 (P4 pending); DR-0024; DR-0036; DR-0030; DR-0031 |
| §9 (intro) | Gate brief added to the gate PR. "Then stop" clarified: work gated on a decision waits for the owner's gate decision, while M2 build work and the G2 runs continue in parallel after the G1 report. Schedule paragraph: G1 report target, M2 in parallel with M1 on its own branch, only G2 waits for G1, M1a after the M0 merge | DR-0045; DR-0043 |
| §9 M0 | Freeze guard bullet notes the frozen set | DR-0033 |
| §9 M1 | Image-identity and process-integrity probe items and the strict pilot approved. M1a records the Scream signature status, signer and issuer, and the effective eSpeak NG rate | DR-0030; DR-0040; DR-0041 |
| §9 G1 report | K6 and K7 speech outcomes from the NVDA-present leg, with the K6a rule on that leg; per-canary INCONCLUSIVE rates with intervals, for gating and record-only canaries, flagged above 10% with reason codes; Scream signature and effective eSpeak rate | DR-0036; DR-0038; DR-0040; DR-0041 |
| §9 G1 rule | Pooled validity unit approved; per-canary flag reported without changing the result | DR-0030; DR-0038 |
| §9 M2 and G2 | M2 built in parallel with M1; K6 and K7 B2 signatures in the NVDA-absent leg with delay grading, in M2 and the G2 report; per-canary INCONCLUSIVE rates with intervals and reason codes; G2 rule pooled, with the per-canary flag | DR-0043; DR-0036; DR-0037; DR-0038; DR-0030 |
| §9 M4, M5 and M6 | Notes: execution guard and side-aware validity before M4; item-level combination and the duplicate plan at M5; the frozen set at M6 | DR-0034; DR-0035; DR-0031; DR-0042; DR-0033 |
| §9.1 | K6 and K7 run in both legs; K6a and K6b B2 signature cells use the delay grading; K6a rule evaluated on the NVDA-present leg; the reading of "announced" approved; the creation-time family membership marked as pending owner item P1 | DR-0036; DR-0037; DR-0030 (P1 pending) |
| §9.2 | Scream step checks the archive's SHA-256 before anything is expanded, then writes the status, signer, issuer and thumbprint of the expanded `Scream.sys` to `artefacts/scream-signature.json` before any pin or signature check, then requires a pinned thumbprint and Authenticode status `Valid` and verifies all four against env.lock (skeleton and prose now agree on this order); the self-signed case (and any result other than a valid chain) and any separate `devcon` download go to the owner; `actions/setup-dotnet` marked as pending owner item P2 and blocked in code (env.lock status `pending-owner`; the env-lock cross-check requires every Action a workflow uses to be `pinned`); M2 workflow changes may land before G1; step names, script, input and install sequence decided by Claude | DR-0040; DR-0045 (DR-0012); DR-0030 (P2 pending); DR-0045 (DR-0008); DR-0043 |
| §10.1 | `protocol/frozen-paths.txt` added to the layout; the runner entry lists `validity.ts` and `splitGuard.ts` (`assertItemExecutable`) | DR-0033; DR-0034; DR-0035 |
| §10.2 | DR-0026 accepted with amendments (a) gate evidence carries `leg`, `preflight` and `segmentId`, (b) `Utterance.priority` required in nvda-present packages, (c) `validity.ts` Phase 0-scoped; the types are unchanged | DR-0026; DR-0030; DR-0035 |
| §10.3 | Freeze guard hashes the frozen set; execution guard added | DR-0033; DR-0034 |
| §11 | Escalation bullet; gate-report item 4 limited to hard-rule-12 items; gate brief, including items needed before a gate | DR-0045 |
| §12 | CLAUDE.md block: version; golden rules on NVDA log bucketing, the execution guard (`assertItemExecutable`), the INCONCLUSIVE principle, stopping to ask (now including security; these are the only items brought to the owner, and Claude decides and logs everything else) and the gate brief; `npm run protocol:hash` command; G1 target and parallel M2 in Current authorisation. The PR #1 auto-fix fence is not in CLAUDE.md (DR-0044) | DR-0039; DR-0034; DR-0032; DR-0045; DR-0033; DR-0043; DR-0044 |

---

## Changes in v1.1

Historical: kept as written for v1.1. Labels in it were resolved by the owner review of 2026-10-02 (DR-0030); the current status of every item is in docs/DECISIONS.md.

v1.1 applies the owner's decisions of 2026-10-02. Decision records are in `docs/DECISIONS.md`; DR-0010 to DR-0022 record owner decisions D1 to D13. Sections §1, §3, §4, §10.3 and §11 are unchanged. Text marked "Proposed by Claude (not yet owner-approved)" is not an owner decision. DR-0026 (schema v1.1) has status Proposed and awaits owner acceptance.

| Section | What changed | Authority |
|---|---|---|
| Header | Version line added. Source of truth is now the in-repository technical extract plus the full PRD held privately by the owner, as amended by §5. The owner-setup note is replaced by a completion note | DR-0014 (D5); DR-0001; DR-0016 (D7) |
| Changes in v1.1 | New section (this table) | Editorial |
| §2 | Proposed defaults replaced by confirmed values and their records; rows added for toolchain, Action pins and repository settings | DR-0001 to DR-0009; DR-0016 (D7); DR-0019 (D10); DR-0021 (D12) |
| §5 R3 | B2 evidence from the NVDA-absent leg, NVDA evidence from the NVDA-present leg | DR-0020 (D11) for D; C Proposed by Claude |
| §5 R4 | WinEvents primary and UIA diagnostic; accessibility mode locked with `=screen-reader`; NVDA channel pinned and verified; speech scope | DR-0019 (D10); DR-0017 (D8); DR-0011 (D2); DR-0022 (D13) |
| §5 R5 | Freeze guard on the test split; dev and test use in the M6 rule-model analysis | DR-0028; DR-0023 |
| §5 R7 | Phase 0 ceiling of 5% and pre-outcome INCONCLUSIVE; Wilson intervals and exploratory labels; commercial-protocol hash published separately | DR-0021 (D12); DR-0014 (D5) |
| §5 R8 (new) | Separate legs and how C and D combine evidence across them. Cross-leg matching key, and C's B2 leg, Proposed by Claude | DR-0020 (D11); DR-0006 |
| §5 R9 (new) | Validity: INCONCLUSIVE only from pre-outcome checks; at most 5% of attempts | DR-0021 (D12) |
| §5 R10 (new) | H2 scope and its bias | DR-0022 (D13) |
| §5 R11 (new) | PRD publication: technical extract only | DR-0014 (D5) |
| §5 R12 (new) | Evidence archive at each gate | DR-0015 (D6) |
| §6 | Note under the symptom table: interruption and ordering exclusions; queued-speech basis and its bias | DR-0022 (D13) |
| §7 | Prerequisites: Node 24.21.0 and the .NET 10 SDK replace "Node LTS" and Python. Inner loop: adapter input removed | DR-0007; DR-0019 (D10); DR-0011 (D2) |
| §7.1 | Playwright 1.63.0 with CfT 153.0.8010.12, `=screen-reader` and `chromiumSandbox: true`; NVDA 2026.2 via the Guidepup 0.35.0 manifest and `@guidepup/setup` 0.29.1; D8 configuration and DEBUG log; Scream 3.6 and the product-risk note; runner per §2; extended manifest. Browser-version assertion and the manifest's v1.1 field design Proposed by Claude | DR-0007; DR-0009; DR-0017 (D8); DR-0011 (D2); DR-0012 (D3); DR-0006; DR-0019 (D10); DR-0026 (Proposed) |
| §7.2 | Handover verifies `GetForegroundWindow` and platform focus, never DOM focus, in both legs; injection marker; relay tap attached before the segment; no keypress inside observation windows. Placement and order of handover steps 3–6 Proposed by Claude | DR-0024; DR-0017 (D8); DR-0011 (D2); DR-0013 (D4) |
| §7.3 | Replaced: QPC timebase; wall-clock reads banned in collectors; CDP page-time mapping; segment IDs; D1 INCONCLUSIVE limits. Self-test method, the `maxClockSkewMs` redefinition and the interim Node wall anchor Proposed by Claude | DR-0010 (D1); DR-0027; DR-0026 (Proposed) |
| §7.4 | Legs in one dispatch; INCONCLUSIVE only from pre-outcome checks. Post-block canary handling, the audio check's leg and the image-mismatch report Proposed by Claude | DR-0006; DR-0020 (D11); DR-0021 (D12) |
| §8.1 | Two-adapter evaluation replaced: Guidepup for lifecycle and input with capture off; relay tap; DEBUG-log parity; AT Driver cut (PRD §48 teardown); GPL add-on rule; D13 scope. Audio-duration paragraph removed | DR-0011 (D2); DR-0022 (D13) |
| §8.2 | C# on .NET 10; WinEvents primary, including `EVENT_SYSTEM_ALERT`, `EVENT_SYSTEM_FOREGROUND` and `EVENT_OBJECT_DESCRIPTIONCHANGE`; identity via MSAA and UIA property reads; UIA diagnostic only; QPC stamps. Hook and resolver thread split Proposed by Claude | DR-0019 (D10); DR-0024 |
| §8.3 | QPC mapping. Same-batch flag kept. Insertion-to-content delay grading that allows for Chrome's serialisation window, `attachShadow` patch and `takeRecords` ordering Proposed by Claude | DR-0010 (D1); Proposed by Claude; DR-0029 |
| §8.4 | Separate legs; invariance test dropped; 20-run on/off diagnostic; Arm B via `getFullAXTree` plus `ariaSnapshot`; axe in its own context; D's evidence sources. C's evidence split Proposed by Claude | DR-0020 (D11); DR-0018 (D9); DR-0024 |
| §9 (intro) | Evidence archived at each gate | DR-0015 (D6) |
| §9 M0 | Guard-test bullet added | DR-0016 (D7); DR-0027; DR-0014 (D5); DR-0015 (D6); DR-0028 |
| §9 M1 | Split into M1a probes, M1b canaries and speech instrument, M1c (cut) and M1d pilot plus G1 runs. Pilot, and the image-identity and process-integrity probe items, Proposed by Claude | DR-0025; DR-0011 (D2); DR-0021 (D12) |
| §9 G1 report | Recommended adapter removed; tap-versus-log parity, K6 and K7 record-only results including K6e, and the INCONCLUSIVE rate and reasons added | DR-0011 (D2); DR-0013 (D4); DR-0021 (D12) |
| §9 G1 rule | 98% and 90% thresholds replaced by the D12 count rule; AT Driver reopening condition. Pooled validity unit Proposed by Claude | DR-0021 (D12); DR-0011 (D2) |
| §9 M2 and G2 | B2 signatures in the NVDA-absent leg; on/off comparison is a diagnostic; clock statistics replace skew statistics; G2 rule has G1's structure | DR-0019 (D10); DR-0020 (D11); DR-0021 (D12); DR-0010 (D1) |
| §9 M3 and M6 | Notes: the K6a rule can prune the catalogue; freeze tag format; DR-0023 pre-registration | DR-0013 (D4); DR-0028; DR-0023 |
| §9.1 | Canary table rewritten: K1–K5 gating (K2 signature amended, K5 without title dependency); K6a, K6b, K6e, K7a and K7b record-only; canary rules; pre-registered K6a rule | DR-0013 (D4); DR-0010 (D1) |
| §9.2 | Skeleton rewritten to pass the workflow policy: `windows-2025`; leg-by-shard matrix in one dispatch; verified SHAs; Scream and NVDA steps in the NVDA-present leg; preflight; no adapter input; probe workflow noted. Step and script names and the Scream install sequence Proposed by Claude | DR-0006; DR-0008; DR-0009; DR-0012 (D3); DR-0016 (D7); DR-0020 (D11); DR-0025 |
| §10.1 | Technical extract replaces the PRD; `docs/research/`, `harness/src/clock/`, `harness/src/policy/` and `harness/test/policy/` added; adapter and listener comments updated | DR-0014 (D5); DR-0029; DR-0010 (D1); DR-0027; DR-0016 (D7); DR-0011 (D2); DR-0019 (D10) |
| §10.2 | One line added above the types; the types are unchanged | DR-0026 (Proposed); DR-0010 (D1) |
| §12 | CLAUDE.md block: new golden rules (including no admin scope), updated commands, archival note, stop dates in Current authorisation, `docs/research/` in Logs | DR-0027; DR-0014 (D5); DR-0015 (D6); DR-0013 (D4); DR-0021 (D12); DR-0011 (D2); DR-0016 (D7); DR-0003 |
| §13 | First session marked complete; reading list points to the privately held PRD | Status; DR-0014 (D5) |

---

## 1. Mission

Build the minimum research harness needed to answer, with evidence that would survive hostile review:

- **H1** — DOM-mutation and platform-event observation (Arm B2) detects meaningful regressions that axe plus accessibility-tree testing (Arm B) misses.
- **H2** — Real NVDA (Arm C) adds detections beyond B2 and/or removes B2 false FAILs, under defined combination rules.
- **H3** — A selective cascade (Arm D) retains most of C's valid detections at materially lower runtime.
- **H4** — NVDA execution reaches CI-grade reliability (known-answer success, INCONCLUSIVE and false-FAIL rates) and acceptable latency.

Commercial hypotheses are out of scope for this repository.

Phase 0 asks a narrower question first: **can each instrument measure what the comparison needs?** If not, the comparison is meaningless and the spike stops cheaply.

---

## 2. Decisions confirmed by the owner (2026-10-02)

| Decision | Confirmed value | Record |
|---|---|---|
| Repository | Public: https://github.com/digitalcourtney87/a11y-regression-spike, created on 2026-10-02 by Claude at the owner's request; M0 work on branch `m0-bootstrap` | DR-0001 |
| Licence | Apache-2.0 for the harness; GPL-2.0-or-later for any NVDA add-on code in `adapters/nvda-addon/` (none approved) | DR-0001 |
| Copyright holder | Courtney Allen Ventures Ltd. | DR-0002 |
| Time box and stop dates | G2 report by Friday 6 November 2026, otherwise stop and report. Friday 27 November 2026 is the proceed/stop decision on Phase 1 (M3–M7), re-planned from Phase 0's measured costs | DR-0003 |
| Owner review time | 3 hours per week; gate reviews within 3 working days | DR-0004 |
| Spend cap | Runners £0 (public repository, standard runners only); model spend capped at £150 for Phase 0 | DR-0005 |
| Windows image | `windows-2025` for gates (served by the `windows-2025-vs2026` image since June 2026); `windows-2022` as an M1a probe only; never `windows-latest`. Paired legs run within one dispatch so they share an image version | DR-0006 |
| Toolchain | Node 24.21.0 exact; TypeScript 6.0.3; Playwright 1.63.0 with its bundled Chrome for Testing 153.0.8010.12; listener on .NET 10 (SDK 10.0.401) | DR-0007; DR-0019 (D10) |
| Action pins | Every Action pinned to a full SHA (versions and SHAs in DR-0008 and `env/env.lock.json`); `guidepup/setup-action` is archived and not used | DR-0008; DR-0009 |
| Repository settings | The owner enables SHA pinning, read-only default workflow permissions, no Actions-created PRs, approval for all outside contributors' workflows, and protection on `main`; Claude does not request admin scope | DR-0016 (D7) |
| G1 and G2 thresholds | Replaced by the D12 rule in §9 (exploratory) | DR-0021 (D12) |
| Schedule (owner review, 2026-10-02) | G1 report target Friday 23 October 2026. The M2 listener and the NVDA-absent leg are built in parallel with M1; only the G2 report waits for G1 | DR-0043 |
| Escalation (owner review, 2026-10-02) | Only hard-rule-12 items go to the owner: what is measured, what counts as detection, cost and security. Claude decides and logs everything else. Each gate PR carries a one-page brief of at most 10 yes/no items, each with Claude's recommendation (§11) | DR-0045 |

---

## 3. Non-goals — do not build

GitHub App · hosted service · dashboard · authentication · billing · AI diagnosis agent · drift-monitoring or forward-compatibility features · JAWS, VoiceOver, TalkBack or Orca · mobile · anything that touches customer code or data · performance work beyond what the gates require.

---

## 4. Hard rules

1. **Public by default.** Never commit secrets, customer data, interview notes or identifiable defect details. Reconstructed defects carry anonymised provenance IDs only.
2. **No outward actions without approval.** Pushing branches and opening PRs in the owner-created repository is permitted. Never change repository visibility, push tags, create releases, publish packages or post anywhere public without explicit owner approval.
3. **Supply chain.** Pin every third-party Action to a full commit SHA with the version in a comment. Default to `permissions: contents: read`. No workflow may require secrets. Pass workflow inputs to scripts through `env:`; never interpolate `${{ }}` into `run:`.
4. **Runners.** Standard GitHub-hosted runners only. Never use larger runners: they are billed even on public repositories.
5. **Exploratory versus confirmatory.** Everything before the protocol freeze (M6) is exploratory and labelled as such. Test-split items must not be executed before the freeze; enforce this in code (§10.3). (v1.2: execution is guarded too; from M4 the runner calls the wrapper `assertItemExecutable` (`harness/src/runner/splitGuard.ts`), which calls `assertSplitAllowed`, before executing any test-split item, DR-0034.)
6. **No tuning on test data.** Oracles, the speech normaliser, trigger rules and thresholds are developed on the dev split only.
7. **Never hand-edit verdicts.** INCONCLUSIVE is never converted to PASS or FAIL manually.
8. **No silent strategy changes.** If a navigation strategy cannot reach its target, the step outcome is UNREACHABLE. Never fall back to another strategy.
9. **Prompt to Page fixtures.** Use de-branded exports only. Never commit restricted fonts (e.g. GDS Transport), the crown or other protected marks.
10. **Licence boundary.** Harness code must not import NVDA modules. Any NVDA add-on lives in `adapters/nvda-addon/` under GPL-2.0-or-later.
11. **Every run records its environment** (§7.1). A run without a valid environment manifest is INCONCLUSIVE.
12. **Stop and ask** whenever a choice would change what the experiment measures, what counts as detection, or the cost envelope. (v1.2: these items and security are the only ones brought to the owner; Claude decides and logs everything else in `docs/DECISIONS.md`, DR-0045.)

---

## 5. Review amendments adopted for this spike

- **R1 — Benign controls.** The corpus includes benign changes (refactors, copy edits, intentional accessibility improvements) at roughly 1:1 with regressions. False-FAIL rate is measured separately on benign items and on unchanged reruns.
- **R2 — Two-level taxonomy.** Detection is scored on user-facing **symptoms** with objective FAIL definitions (§6). Mechanisms (e.g. "live region inserted pre-populated") are diagnostic metadata, never the scoring unit. Duplicates, ordering and interruption either get objective definitions or are analysed separately as REVIEW-routing accuracy.
- **R3 — Combination rules.** C and D are each scored under **UNION** (FAIL if B2 or NVDA evidence FAILs) and **ADJUDICATED** (NVDA may downgrade a B2 FAIL to REVIEW when NVDA output is unchanged between base and candidate). For D, the B2 evidence comes from the NVDA-absent leg and the NVDA evidence from the NVDA-present leg (DR-0020, D11). C uses the same split, so C and D differ only in trigger masking (approved by the owner 2026-10-02; DR-0031). The legs are combined at item level (R8).
- **R4 — Instrument validation first.** Phase 0 validates the speech instrument (G1) and the event instruments (G2) before any comparison. MSAA and IA2 WinEvents are B2's primary channel; UIA events are recorded as a diagnostic only (DR-0019, D10). Lock Chrome's accessibility mode identically in every arm with `--force-renderer-accessibility=screen-reader` and log it (DR-0019, D10). Pin NVDA's channel to IA2 and verify it by preflight rather than assume it (DR-0017, D8). Speech is captured as what NVDA queues plus global cancels, with QPC receipt timestamps (DR-0011, D2); interruption and ordering stay outside C's primary scope unless the D2 add-on rule brings them in (R10; DR-0022, D13).
- **R5 — No leakage.** Split by `patternId` into dev and test (stratified, recorded seed). Trigger rules v1 are fixed in advance from PRD §14. Exploratory data never enters the confirmatory analysis. The scorer refuses the test split until the protocol hash matches the freeze tag (DR-0028). The hash covers every path listed in `protocol/frozen-paths.txt` (DR-0033), and from M4 the runner refuses to execute a test-split item on the same condition: before executing any test-split item it calls the wrapper `assertItemExecutable` (`harness/src/runner/splitGuard.ts`), which calls `assertSplitAllowed` (DR-0034). The M6 rule-model secondary analysis is fitted on the dev split only and evaluated on the test split (DR-0023).
- **R6 — Corpus realism.** Customer defects become reconstructed items with anonymised provenance. The realistic SPA must run natively on a Windows runner (no service containers, no external credentials).
- **R7 — Scoring hygiene.** INCONCLUSIVE counts as a miss in the primary analysis, and the protocol sets a ceiling on the INCONCLUSIVE rate. In Phase 0 the ceiling is 5% of attempts and INCONCLUSIVE comes only from pre-outcome checks (R9; DR-0021, D12). Report Wilson intervals throughout and label every Phase 0 result exploratory (DR-0021, D12). Hypotheses are H1–H4 above. The owner handles the commercial commit–reveal hash outside this repository, publishing a hash of the commercial protocol separately (DR-0014, D5).
- **R8 — Separate legs.** A, B and B2 run in an NVDA-absent leg, as the product would; C's NVDA evidence comes from an NVDA-present leg. Both legs run in one dispatch so they share an image version (DR-0006). D applies the triggers to the NVDA-absent B2 evidence and takes NVDA evidence from the NVDA-present leg. C_UNION and C_ADJUDICATED combine NVDA-absent B2 evidence with NVDA-present NVDA evidence, as D does, so C and D differ only in trigger masking (approved by the owner 2026-10-02; DR-0031). Legs are combined at item level: each leg derives its own per-item result from its own repetitions (k of n, §6), and C and D combine those per-item results. Repetition indices are kept for traceability only and are never paired across legs (DR-0031). The NVDA-presence invariance test is dropped; an NVDA on/off comparison of B2 is a 20-run diagnostic, not a G2 criterion (DR-0020, D11).
- **R9 — Validity.** INCONCLUSIVE is decided only by checks completed before the outcome is known: a valid environment manifest, the foreground HWND, the NVDA injection marker, audio, the active synth, the clock limits (§7.3) and the pre-canary. It is never decided by inspecting the outcome. Principle (DR-0032): a check may produce INCONCLUSIVE only if the thing being judged cannot cause it to fail. Validity requires INCONCLUSIVE in at most 5% of attempts, pooled across K1–K5 (pooling approved by the owner 2026-10-02, DR-0030). Gate reports also give each canary's INCONCLUSIVE rate, (attempts − valid) / attempts, and flag any canary above 10%; a flag is reported but does not change the gate result (DR-0038). Reason codes and limits live in `harness/src/runner/validity.ts` (DR-0021, D12). This rule is Phase 0-scoped: canaries are fixed pages, so it stands for Phase 0. From M4, when candidate builds can themselves steal the foreground, stall frames or crash NVDA, a side-aware rule replaces it (DR-0035; recorded now, implemented before M4): a check failing on both sides gives INCONCLUSIVE; failing on the candidate only is a finding (REVIEW unless a FAIL rule covers it); failing on the base only gives INCONCLUSIVE for that item. A check that covers both sides at once, such as the environment manifest, counts as failing on both sides (Decided by Claude under DR-0045 (2026-10-03); DR-0035). Which FAIL rules cover candidate-only failures is set with the M5 oracles; it decides what counts as detection, so it goes to the owner (hard rule 12).
- **R10 — H2 scope.** H2 is measured on what NVDA queues to speak plus global cancels, not on audio. ANNOUNCEMENT_INTERRUPTED and ANNOUNCEMENT_ORDER_BROKEN are excluded from the primary analysis unless the D2 add-on rule brings them in (§8.1). Known bias, to be stated in every report: queued-then-cancelled text counts as spoken, so C can credit speech a listener would not have heard; cancellations NVDA makes inside its speech manager never reach the relay (DR-0022, D13). The same bias makes ANNOUNCEMENT_DUPLICATED anti-conservative (§6 note; DR-0042).
- **R11 — PRD publication.** The repository holds only the technical protocol extract, `docs/PRD-v0.3-technical-extract.md` (hypotheses, arms, verdict rules, taxonomy, canaries, thresholds). The full PRD and all commercial content stay out of the repository: `docs/PRD-v0.3.md` is git-ignored and a repository-safety test fails if it would be committed. Never quote commercial content in any committed file (DR-0014, D5).
- **R12 — Evidence archive.** At each gate, archive evidence from the local machine with `gh run download`, so workflows stay `contents: read`. Store per-gate `tar.zst` bundles under 50 MB on the orphan branch `results`, each with a SHA-256 manifest of run IDs, image versions and pinned versions. Never include NVDA binaries. Since 2026-10-01 the 90-day retention limit for public repositories also deletes workflow runs, so archive before it expires (DR-0015, D6).

---

## 6. Scoring vocabulary

**Verdicts:** PASS · FAIL · REVIEW (non-blocking; needs human judgement) · INCONCLUSIVE (environment or evidence cannot determine an outcome).

**Detection (primary analysis):** a regression item produces FAIL with the correct **symptom**. REVIEW is not detection. INCONCLUSIVE is a miss.

**False FAIL:** a benign or unchanged item produces FAIL with any symptom.

**Symptoms (the scored unit):**

| Symptom | Objective FAIL definition (base versus candidate, same environment) |
|---|---|
| NAME_NOT_CONVEYED | Expected accessible name present in base, absent in candidate |
| ROLE_NOT_CONVEYED | Expected role present in base, absent or changed in candidate |
| STATE_NOT_CONVEYED | Expected state (expanded, checked, selected, required, invalid…) conveyed in base, not in candidate |
| ANNOUNCEMENT_MISSING | Expected announcement present in at least k of n base runs and absent in at least k of n candidate runs, with canaries passed |
| ANNOUNCEMENT_DUPLICATED | Same normalised announcement emitted at least twice within the observation window in candidate, once in base |
| ANNOUNCEMENT_ORDER_BROKEN | Journey declares an ordering expectation that holds in base and fails in candidate |
| ANNOUNCEMENT_INTERRUPTED | Expected announcement completes in base and is cancelled before modelled completion in candidate (only if R4 timing passes) |
| FOCUS_NOT_MOVED | Expected focus target reached in base, not in candidate |
| FOCUS_NOT_RESTORED | Focus returns to the invoking control in base, not in candidate |
| FOCUS_ESCAPES_DIALOG | Focus or virtual cursor stays within the modal in base, leaves it in candidate |
| KEYBOARD_TRAP | Candidate cannot leave a component by its documented keys; base can |
| NAV_TARGET_UNREACHABLE | Declared strategy reaches its target in base, UNREACHABLE in candidate |
| INTERACTION_FAILS_UNDER_AT | Declared AT interaction achieves its outcome in base, not in candidate (e.g. browse or focus-mode failure) |
| ROUTE_CHANGE_SILENT | Route change conveyed (focus or announcement) in base, nothing conveyed in candidate |
| JOURNEY_BLOCKED | Journey completes in base, cannot complete in candidate |

The protocol fixes the repetition parameters k and n. Exploratory defaults: n = 3 per side, n = 5 for absence-based symptoms, k = n.

**Note (v1.1; DR-0022, D13):** ANNOUNCEMENT_INTERRUPTED and ANNOUNCEMENT_ORDER_BROKEN are excluded from the primary analysis unless the D2 add-on rule brings them in (§8.1). Speech-based symptoms are measured on what NVDA queues to speak plus global cancels, not on audio; queued-then-cancelled text counts as spoken (R10).

**Note for M5 (v1.2; DR-0042):** DR-0022's bias analysis shows that ANNOUNCEMENT_DUPLICATED is anti-conservative: a queued copy that NVDA cancels before it is heard still counts as spoken, so the tap can report a duplicate that a listener would not hear. M5 plans for duplicates to need NVDA-log corroboration or to route to REVIEW. The choice between them, and what counts as corroboration, decide what counts as detection, so they go to the owner at M5 (hard rule 12). Wall-anchor bucketing of NVDA log lines is allowed only for parity counts and diagnostics (§7.3; DR-0039), so corroboration would need another join method or a further owner decision.

---

## 7. Execution model and environment

The local machine cannot run NVDA. All AT execution happens on GitHub-hosted Windows runners in the public repository.

**Prerequisites:** `gh` authenticated against the repository; Node 24.21.0 (pinned in `.nvmrc`); the .NET 10 SDK (10.0.401) only to build the listener locally, since CI installs it (DR-0007; DR-0019, D10).

**Inner loop:**

```bash
git push origin m1-nvda
gh workflow run phase0-nvda.yml --ref m1-nvda -f runs=50
gh run watch
gh run download <run-id> -D artefacts/<run-id>
npm run report:phase0 -- artefacts/<run-id>
```

Batch changes to minimise CI round trips. Keep everything that does not need Windows testable on Linux with unit tests.

### 7.1 Pinning and environment manifest

Exact pins live in `env/env.lock.json`; an entry marked `pending-M1a` is settled by the M1a probes.

- **Chrome:** Playwright 1.63.0 with its bundled Chrome for Testing 153.0.8010.12 (win64), passed as `executablePath`; assert the browser version at start-up and fail fast on a mismatch (Decided by Claude under DR-0045 (2026-10-03); DR-0007). Headed; fresh profile per run; `--force-renderer-accessibility=screen-reader` in every arm, logged with each run, so the accessibility mode is locked and identical whether or not NVDA and the listener are present; `chromiumSandbox: true` (DR-0007; DR-0019, D10).
- **NVDA:** NVDA 2026.2 from the Guidepup 0.35.0 manifest (asset `guidepup/nvda` 0.2.1-2026.2, sha256 `7df0ca3c1c9e8c6521bc7553486ca360ed6f0b4f9bdbd6603131e38b5c1497a1`), installed with the pinned `@guidepup/setup` 0.29.1 CLI, not `guidepup/setup-action`, which was archived on 2026-09-26 (DR-0009). Record NVDA's real version from the executable or its log, not from Guidepup. The relay certificate in this build is valid from 2026-06-28 to 2027-06-28, so the exact pin has a shelf life.
- **NVDA configuration (DR-0017, D8):** committed; locale en-GB; `[UIA] allowInChromium=3` (IA2); eSpeak NG bundled with NVDA at NVDA's default rate, rate boost off (DR-0041); say-all on page load off; speech viewer off. The NVDA log runs at DEBUG with `[debugLog]` speech, speechManager, events, UIA and synthDriver enabled (DR-0011, D2). Do not change the configuration without a decision record.
- **eSpeak NG rate (DR-0041):** on a fresh configuration, NVDA's default eSpeak NG rate is 30 on its 0–100 scale (NVDA release-2026.2 source). The `nvda.ini` committed in M1 must not set an eSpeak rate; the effective rate is read from the running synth and recorded in each run's manifest (`EnvManifest.synth.rate`), and `env/env.lock.json` records `nvda.synth` as eSpeak at `"nvda-default"` with rate boost off. The rate is revisited only if M1a gives a reason, such as an effective rate other than 30, and any change goes to the owner, because it changes what is observed (hard rule 12). A rate other than 30 is not a synth fallback, so `SYNTH_FALLBACK` is unchanged.
- **Audio (DR-0012, D3):** the Scream 3.6 virtual audio driver, pinned by SHA-256, with its signer certificate thumbprint verified before the certificate is added to TrustedPublisher; ephemeral hosted runners only. Installed in both legs with an in-repository SetupAPI installer, never the archive's unsigned `devcon.exe` (DR-0047). M1a showed it is required: without an audio device eSpeak NG cannot open audio and NVDA falls back to oneCore (lab notebook 2026-10-03). Product-risk note: requiring a kernel driver in customer CI is a hard sell.
- **Scream signature (DR-0040):** the install checks the driver's Authenticode signature status, not just the thumbprint, and records the signer and issuer. If M1a finds a valid chain and a signer consistent with the release, Claude pins the thumbprint without asking the owner. If the certificate is self-signed, DR-0012 states that authenticity rests on trust on first use, and Claude asks the owner before anything is added to TrustedPublisher. Any other result, such as an unsigned driver or a chain that fails for another reason, is treated like the self-signed case (Decided by Claude under DR-0045 (2026-10-03); DR-0040).
- **Runner image:** as §2 (`windows-2025` for gates; DR-0006).
- **Manifest per run:** harness commit, `ImageOS`, `ImageVersion`, image name, Windows build, Chrome version and flags, accessibility mode, sandbox setting, Playwright version, NVDA version and configuration hash, NVDA channel, active synth (name, voice, rate, rate boost), audio state (endpoint count, Audiosrv running, driver), adapter name and version, listener version, .NET version, Node version, locale. The v1.1 fields are defined in DR-0026, which the owner accepted with amendments on 2026-10-02 (§10.2).

### 7.2 Input and handover

Playwright establishes state only. AT-sensitive steps use OS-level input through the adapter (Guidepup with capture off, §8.1). Never call `page.keyboard` or `page.click` during an AT segment: DevTools-protocol input bypasses NVDA's keyboard hook. No keypress may fall inside any observation window, because NVDA cancels queued speech on almost every key (DR-0013, D4).

Playwright always enables CDP focus emulation, so DOM focus signals (`document.hasFocus()`, `focusin`, `visibilityState`) report "focused" even when Chrome is not the foreground window. The handover therefore verifies the real foreground window and platform focus, never DOM focus (DR-0024). It runs in both legs, because Chrome withholds platform focus events from a window that is not in the foreground.

Handover protocol:
1. Bring the browser window to the foreground and verify that `GetForegroundWindow()` returns Chrome's top-level HWND.
2. Move focus to the journey's declared anchor and verify platform focus on it (the listener's focus WinEvent or an MSAA/UIA focus read), not DOM focus. In the NVDA-present leg, platform focus is verified by an MSAA-only focus read, so that no UIA client registers (approved by the owner 2026-10-03, DR-0046; §8.4, DR-0020, DR-0024). From M2 the MSAA read is retried every 100 ms for up to 1 s before the check fails (approved by the owner 2026-10-03, P10; DR-0051, DR-0052).
3. In the NVDA-present leg, verify the D8 injection marker: `nvdaHelperRemote*.dll` loaded in `chrome.exe` and "Buffer load took" in the NVDA log (DR-0017).
4. Attach the relay tap (§8.1).
5. Wait for NVDA's virtual buffer to settle (a declared quiet window).
6. Issue the segment ID (§7.3) and begin the segment.

The checks in steps 3, 4 and 6 come from DR-0017 (D8), DR-0011 (D2) and DR-0010 (D1); their placement in the handover and the order of steps 3–6 were Decided by Claude under DR-0045 (2026-10-03). A failed check is a pre-outcome failure and makes the segment INCONCLUSIVE (R9).

### 7.3 Clock alignment (DR-0010, D1)

- **One timebase.** QueryPerformanceCounter (QPC) is the only timebase: every collector stamps QPC nanoseconds since boot, using `process.hrtime.bigint()` in Node (`harness/src/clock/qpc.ts`) and `Stopwatch.GetTimestamp()` in the C# listener. Native processes on one machine share QPC, so they need no offset estimate.
- **No wall-clock reads in collectors.** `Date.now()`, `performance.timeOrigin`, `new Date(`, `time.time()` and the .NET `DateTime`/`DateTimeOffset` `Now` and `UtcNow` properties are forbidden in collectors, adapters, the runner, the clock module and the listener; a policy test enforces this (DR-0027). Each process keeps one precise wall-clock anchor, a (QPC, wall time) pair, for human-readable times only (`harness/src/clock/wallAnchor.ts`; `WallAnchor.cs` in the listener). Until M2 the Node anchor is coarse on Windows (0 to about 15.6 ms), after which it adopts the listener's pair (approved by the owner 2026-10-02, DR-0030; DR-0010).
- **Page time.** Map `performance.now()` to QPC through CDP `Performance.getMetrics` (`Timestamp` and `NavigationStart`, both on Chrome's QPC-based TimeTicks): page time on the QPC base ≈ `NavigationStart` (seconds) + `performance.now()` (milliseconds) / 1000. Verify the mapping once in M1a against a 16-ping minimum-RTT estimate. Recompute it after every full navigation.
- **Joining logs.** Join the speech, platform-event, mutation and NVDA-log records by QPC and by the orchestrator-issued segment ID (`segmentId`). Measure latency from the canary events themselves.
- **NVDA log bucketing (DR-0039).** NVDA's log lines carry wall-clock times, not QPC. They may be bucketed into segments through the wall anchor for parity counts and diagnostics. That bucketing is never used for latency, ordering or validity.
- **INCONCLUSIVE only for:** native self-test disagreement (method approved by the owner 2026-10-02, DR-0030; DR-0010) > 0.5 ms; page-mapping uncertainty > 2 ms; drift > 1 ms within a segment; low-resolution TimeTicks in Chrome; a requestAnimationFrame gap > 100 ms. A value equal to its limit passes. The limits live in `harness/src/runner/validity.ts`.
- **`maxClockSkewMs`** in the evidence package (§10.2) records max(native self-test disagreement, page-mapping uncertainty). The owner approved this redefinition on 2026-10-02 as part of DR-0026, accepted with amendments (DR-0030).

### 7.4 Paired, counterbalanced runs

Base and candidate run in the same job on the same machine. Order is counterbalanced (ABBA, or randomised with a recorded seed). The NVDA-absent and NVDA-present legs (R8) run as jobs of one workflow dispatch, so they share an image version; record `ImageVersion` per job (DR-0006; DR-0020, D11) and report any mismatch within a dispatch (Decided by Claude under DR-0045 (2026-10-03); DR-0006). Known-answer canaries bracket every item block.

INCONCLUSIVE comes only from checks completed before the outcome is known (R9; DR-0021, D12): the environment manifest, the foreground HWND and platform focus, the pre-block canary and the §7.3 clock limits, plus the injection marker, the audio endpoint and the active synth in the NVDA-present leg (limiting the audio check to that leg was approved by the owner 2026-10-02, DR-0030). A failed pre-block canary makes the whole block INCONCLUSIVE. A failed post-block canary is reported with the block but does not convert outcomes already observed; the next block must pass its own pre-block canary. The owner approved this post-block handling on 2026-10-02: a post-block canary never converts observed outcomes (DR-0030, DR-0032). It follows the DR-0032 principle that a check may produce INCONCLUSIVE only if the thing being judged cannot cause it to fail; a post-block canary can fail because the block's own pages broke NVDA, so it cannot void outcomes. From M4 the side-aware validity rule applies (R9; DR-0035).

**Errors (P13; DR-0053, DR-0055).** Only a setup error before activation (browser launch, page load, process or window lookup) makes an attempt INCONCLUSIVE (`ENV_FAILURE`). A failure of the B2 listener (start, fewer hooks than ranges, ping, stop, not drained, or malformed output lines) and any error after activation count as failures, because the thing being judged may have caused them (DR-0032). Approved by the owner on 2026-10-03.

---

## 8. Instruments

### 8.1 Speech (Arm C) (DR-0011, D2)

Implement an `AtAdapter` interface with one Phase 0 implementation: Guidepup's NVDA integration for lifecycle and input. The adapter name enum in §10.2 keeps `"atdriver"` unchanged (DR-0026).

- **Guidepup 0.35.0 for provisioning, lifecycle and input only.** Start NVDA with `nvda.start({ capture: false })`, which switches Guidepup's capture off globally so it never injects its stop-speech Control key. Guidepup's own spoken-phrase log is never evidence.
- **Speech record: the relay tap.** A receive-only Apache-2.0 client of NVDA's built-in Remote Access relay (TLS on 127.0.0.1:6837, channel "guidepup") runs in a worker thread, attaches before each segment, and sends only `join` and `protocol_version`; anything else would reach NVDA. It frames messages by newline, stamps each on receipt with QPC, and records every queued speech sequence with its priority (`NORMAL`, `NEXT` or `NOW`) and every global cancel. The tap implements the wire protocol and never imports NVDA code.
- **Second record: NVDA's DEBUG log** (speech, speechManager, events, UIA, synthDriver; §7.1). Copy `%TEMP%\nvda.log` after every NVDA run and report message-count parity with the tap. Parity may bucket log lines by segment through the wall anchor (§7.3; DR-0039); that bucketing is never used for latency, ordering or validity.
- **AT Driver is cut for Phase 0.** M1c is cut and there are no AT Driver runs. The desk evaluation is recorded in DR-0011 as the PRD §48 teardown. Reopen only if the tap fails G1.
- **GPL add-on rule (G1).** Propose a minimal GPL NVDA add-on only if K7 shows drops or interruptions that the tap and the debug log cannot classify, and interruption or ordering is still wanted in H2. Owner approval is required before building it; it would live in `adapters/nvda-addon/`.
- **Scope (DR-0022, D13).** The tap records what NVDA queues to speak plus global cancels, not audio. Interruption and ordering symptoms stay out of the primary analysis unless the add-on rule brings them in (R10).

### 8.2 Platform events (Arm B2)

A separate listener process in C# on .NET 10 (`listener/`); .NET 8 and 9 leave support on 10 November 2026 (DR-0019, D10).

- **WinEvents are the primary channel.** Out-of-process `SetWinEventHook` hooks scoped to the Chrome browser process, across the MSAA and IA2 event IDs, including `EVENT_OBJECT_FOCUS`, `EVENT_OBJECT_NAMECHANGE`, `EVENT_OBJECT_DESCRIPTIONCHANGE`, `EVENT_OBJECT_LIVEREGIONCHANGED`, `EVENT_OBJECT_SHOW`, `EVENT_OBJECT_HIDE`, `EVENT_OBJECT_REORDER` and IA2 text insert and remove events, plus `EVENT_SYSTEM_ALERT` and `EVENT_SYSTEM_FOREGROUND` (DR-0024). The hook thread only stamps and enqueues; resolution runs on another thread (Decided by Claude under DR-0045 (2026-10-03); DR-0019). The exact hook ranges, the filtering by browser PID and window class, and the exclusion of browser-UI alerts by `hwndClass` were approved by the owner on 2026-10-03 (P3; DR-0019, DR-0052); the final ranges are confirmed from M2 data, and a change that adds or removes events goes back to the owner.
- **Identity through MSAA and UIA property reads:** role, name, `AutomationId`, `LiveSetting` and `AriaRole`. No IA2 `QueryService` and no proxy registration, so B2's output cannot depend on whether NVDA has injected into Chrome.
- **UIA events are diagnostic only.** UIA subscriptions are tagged as a separate, diagnostic channel and never form part of a B2 signature.
- **Timestamps:** QPC via `Stopwatch.GetTimestamp()` on callback entry (§7.3). JSONL output.

Rationale: NVDA reads Chrome through IA2 (pinned, D8), and Chrome raises MSAA and IA2 WinEvents regardless of which clients are listening, whereas its UIA events depend on client registration.

### 8.3 DOM mutation timeline (Arm B2)

A Playwright `addInitScript` installs a `MutationObserver` before page scripts run. Record:

- node insertions and removals, and text changes;
- attribute changes for `aria-*`, `role`, `hidden`, `inert` and `tabindex`;
- `focusin` and `focusout`, `pushState` and `popstate`, and `document.title` changes.

Patch `Element.prototype.attachShadow` before page scripts run so every shadow root is observed, and call `takeRecords()` inside the focus, history and title handlers before logging them so that records keep causal order. The owner approved these two techniques on 2026-10-02 (DR-0030; basis in DR-0029). Page times are mapped to QPC per §7.3 (DR-0010, D1). A `focusin` record is evidence of DOM focus only (§7.2).

**Insertion-to-content delay grading (DR-0037).** For every live region, record the delay in milliseconds from its insertion to its first non-empty content, and grade it against Chrome's accessibility serialisation window: after load, Chrome serialises non-immediate changes at most once per 150 ms (350 ms before load), so a region filled within that window can reach the platform as though it had been inserted populated. A region inserted with non-empty content is graded as a populated insertion; a fill within the window is graded as possibly indistinguishable from a populated insertion; a fill after the window is graded as a separate update (basis DR-0029). This grading replaces the v1.0 same-batch flag and is the rule in force now. K6e shows where the boundary falls on the runner; if its data contradict the 150 ms and 350 ms boundaries, the change goes to the owner (hard rule 12; DR-0037).

**Post-load boundary for polite regions (P9; DR-0052).** K6e in the M1d pilot and G1 contradicted the 150 ms post-load boundary for polite regions: same-frame fills were silent and fills from 50 ms were announced. For polite live regions filled after page load, a fill in the same frame (0 ms or one rAF) is graded as a populated insertion; a fill 50 ms or more after insertion is graded as a separate update; a fill between one frame and 50 ms (untested) routes to REVIEW. The 350 ms pre-load boundary and other region roles keep the grading above until tested. The owner approved this provisionally on 2026-10-03 (DR-0052). G2's NVDA-absent K6e signatures agreed with it, and the owner made it final as tested on 2026-10-03 (DR-0055): a fill in the same task, or in a `requestAnimationFrame` callback within one 60 Hz frame (1000/60 ms), is the same frame; every other fill under 50 ms routes to REVIEW (DR-0053).

### 8.4 Arms from separate legs (DR-0020, D11; DR-0018, D9)

- **NVDA-absent leg:** evidence for A, B and B2, as the product would run.
- **NVDA-present leg:** C's NVDA evidence. Which collectors run in this leg, and how platform focus is verified there, were approved by the owner on 2026-10-03 (P4; DR-0046), because they change which events are captured in the leg that produces C's evidence (hard rule 12; DR-0020): the in-page DOM timeline runs in both legs, because latency is measured from the canary events; the WinEvent listener runs in the NVDA-present leg only for the 20-run on/off diagnostic, not in G1 runs, because its UIA property reads register it as a UIA client; and platform focus in this leg is verified by an MSAA-only focus read, so that no UIA client registers (§7.2; DR-0024).
- **K6 and K7** run in both legs: speech outcomes from the NVDA-present leg, B2 signatures from the NVDA-absent leg (§9.1; DR-0036).
- The invariance test is dropped. An NVDA on/off comparison of B2 signatures is a 20-run diagnostic, not a G2 criterion.
- **Arm B evidence (D9):** Chrome's own accessibility tree via CDP `Accessibility.getFullAXTree`, including the live, atomic, relevant and busy properties, plus `ariaSnapshot` for structure. axe runs in its own browser context, never near an AT segment, because its Playwright helper opens a new tab that steals focus (DR-0024).

C_UNION and C_ADJUDICATED combine NVDA-absent B2 evidence with NVDA-present NVDA evidence, as D does, so C and D differ only in trigger masking (approved by the owner 2026-10-02; DR-0031). The combination is at item level: each leg derives its own per-item result from its own repetitions (k of n), and repetition indices are kept for traceability only, never paired across legs (R8; DR-0031). Arm D applies `protocol/triggers.v1.json` to the NVDA-absent B2 evidence and takes NVDA evidence for the triggered steps from the NVDA-present leg. D's runtime is estimated from the durations of triggered NVDA segments.

---

## 9. Milestones and gates

Develop each milestone on its own branch. At each gate, archive the evidence (R12), open a PR containing a report at `docs/gates/G<n>.md` (template in §11) and the one-page gate brief (§11; DR-0045), then stop. "Stop" means that work gated on that decision waits for the owner's gate decision: the G2 report waits for the G1 decision, and M3 onwards waits for G2. It does not pause other authorised work: after the G1 report, M2 build work and the G2 runs continue in parallel while the owner reviews G1 (DR-0043).

**Schedule (v1.2; DR-0043).** The G1 report target is Friday 23 October 2026. The M2 listener and the NVDA-absent leg are built in parallel with M1; only the G2 report waits for G1. The G2 stop date (Friday 6 November 2026) and the Phase 1 decision date (Friday 27 November 2026) are unchanged (DR-0003). Branches `m1-*` and `m2-*` may run in parallel; each milestone keeps its own branch. M1a starts after the owner merges the M0 pull request (DR-0045).

### M0 — Bootstrap

- Repository layout per §10.1; `CLAUDE.md` from §12; `docs/DECISIONS.md`, `docs/LAB_NOTEBOOK.md`, `protocol/AMENDMENTS.md`.
- TypeScript (strict), ESLint, Vitest; zod schemas mirroring §10.2, with tests.
- Linux CI (lint, typecheck, unit tests) with SHA-pinned actions and read-only permissions.
- `env/env.lock.json` stub and `.nvmrc`.
- Guard tests: workflow policy (DR-0016), clock policy (DR-0027), repository safety (DR-0014, DR-0015) and the protocol freeze guard (DR-0028; over the frozen set in `protocol/frozen-paths.txt` from v1.2, DR-0033).

**Acceptance:** CI green; schemas validate sample documents; zero secrets; every Action SHA-pinned.

### M1 — Speech instrument (Gate G1)

- **M1a — Runner probes** on both `windows-2025` and `windows-2022`, from a separate `phase0-probe.yml` (DR-0025). Probe items:
  - image name and version, `ImageOS` and Windows build (approved by the owner 2026-10-02, DR-0030; LAB_NOTEBOOK 2026-10-02);
  - audio endpoints and the Audiosrv state, before and after the Scream install, and the Scream driver's Authenticode signature status, signer, issuer and signer thumbprint (DR-0040);
  - process integrity levels and session for NVDA, Chrome, the listener and the input path (approved by the owner 2026-10-02, DR-0030; LAB_NOTEBOOK 2026-10-02);
  - screen resolution and DPI;
  - foreground handover over repeated fresh-profile Chrome launches (`GetForegroundWindow` against Chrome's HWND);
  - first-launch failures in which NVDA creates no virtual buffer;
  - whether Chrome for Testing shows an infobar that NVDA reads or that takes focus;
  - the synth NVDA actually loads, its effective eSpeak NG rate (DR-0041), and the NVDA channel;
  - Chrome's TimeTicks resolution (`performance.now()` step histogram) and the native QPC self-test.

  Also in M1a: the D1 page-mapping verification (CDP `Performance.getMetrics` against a 16-ping minimum-RTT estimate; DR-0010), and a dry run of the D3 and D8 preflight checks (DR-0012, DR-0017). There is no title-latency probe.
- **M1b — Canaries and the speech instrument:** canary fixtures K1–K5, K6a, K6b, K6e, K7a and K7b (§9.1); the `AtAdapter` interface with the Guidepup lifecycle and input adapter; the relay tap; tap-versus-log parity; `npm run report:phase0`; workflow `phase0-nvda.yml` (skeleton in §9.2).
- **M1c — AT Driver adapter: CUT** (DR-0011, D2).
- **M1d — Strict pilot, then the G1 runs.** A pilot with retries off classifies failures (handover, input, NVDA, capture) before the gate runs; the pilot was approved by the owner on 2026-10-02 (DR-0030). The G1 runs follow, on `windows-2025` per the G1 rule below.

**G1 report must include:**
- per-canary success rates with Wilson 95% intervals;
- the capture-latency distribution;
- whether timestamps and cancellations are visible;
- tap-versus-log parity (message counts per run);
- a failure taxonomy (NVDA start, focus loss, capture gaps);
- the pinned versions;
- the K6 and K7 record-only speech outcomes from the NVDA-present leg, including K6e, with the K6a rule evaluated on that leg (DR-0036);
- the INCONCLUSIVE rate and its reasons;
- per-canary INCONCLUSIVE rates with Wilson intervals, for gating and record-only canaries, flagging any canary above 10% with the reason codes behind each flag (DR-0038);
- the Scream signature status, signer and issuer, and the effective eSpeak NG rate, from M1a (DR-0040, DR-0041).

**G1 rule (exploratory; DR-0021, D12), replacing the v1.0 thresholds:** on `windows-2025`, retries off, at least 50 valid runs per gating canary (K1–K5). G1 passes when pooled K1–K5 failures are at most 5 in 250, no single canary has more than 3 failures, and INCONCLUSIVE is at most 5% of attempts (R9; pooled across K1–K5, approved by the owner 2026-10-02, DR-0030). A canary whose INCONCLUSIVE rate exceeds 10% is flagged in the report but does not change the result (DR-0038). Report Wilson intervals throughout and label every result exploratory. K6 and K7 never decide G1. A G1 failure of the relay tap is the only condition for reopening AT Driver (DR-0011).

**G1 outcome (DR-0052).** The owner accepted G1 on 2026-10-03 (`docs/gates/G1.md`): 252 valid runs of K1–K5 with 0 failures and INCONCLUSIVE 0.4%, with the K2 top-up of DR-0050. M1 is merged.

### M2 — Event instruments (Gate G2)

- Platform-event listener (§8.2), mutation timeline (§8.3) and clock alignment (§7.3), integrated with the canary runs. (v1.2: the listener and the NVDA-absent leg are built in parallel with M1; only the G2 report waits for G1, DR-0043.)
- The expected B2 signature for each gating canary (K1–K5), verified in the NVDA-absent leg across at least 50 valid runs (DR-0019, D10; DR-0020, D11).
- An NVDA on/off comparison of B2 signatures as a 20-run diagnostic, not a G2 criterion (DR-0020, D11).
- The K6 and K7 B2 signatures, recorded in the NVDA-absent leg (DR-0036), with K6 graded by insertion-to-content delay (§8.3; DR-0037).

**G2 report must include:**
- signature match rates with intervals;
- which channel NVDA consumed (the D8 preflight result);
- clock statistics (native self-test disagreement, page-mapping uncertainty, drift within segments, rAF gaps);
- whether interruption and queueing stay in C's scope (R4, R10);
- the NVDA on/off diagnostic;
- the K6 and K7 B2 signatures from the NVDA-absent leg, with K6 graded by insertion-to-content delay (DR-0036, DR-0037);
- the INCONCLUSIVE rate and its reasons;
- per-canary INCONCLUSIVE rates with Wilson intervals, flagging any canary above 10% with the reason codes behind each flag (DR-0038);
- an updated risk list and a recommendation on M3.

**G2 rule (exploratory; DR-0021, D12), replacing the v1.0 threshold:** the same structure as G1, applied to B2 signature matches for K1–K5 in the NVDA-absent leg: at least 50 valid runs per canary, pooled failures at most 5 in 250, no single canary with more than 3, and INCONCLUSIVE at most 5% of attempts, pooled across K1–K5 (DR-0030); per-canary flags above 10% are reported without changing the result (DR-0038).

**G2 outcome (DR-0055).** The owner accepted G2 on 2026-10-03 (`docs/gates/G2.md`): 260 valid NVDA-absent runs of K1–K5 with 0 signature failures and INCONCLUSIVE 0%. M2 is merged and M3 is unlocked.

### M3–M7 — M3 merged (PR #6) and M4 authorised (DR-0065); ask the owner before M5

- **M3 — Corpus scaffolding (dev split only).**
  - Select the SPA after evaluating at least three candidates against these criteria: runs natively on Windows via Node; no external credentials; permissive licence; client-side routing; form validation; a dialog; a status update; at least one composite widget; deterministic data; builds in under five minutes.
  - Integrate de-branded Prompt to Page exports.
  - Build mutation tooling for both regressions and benign changes.
  - Mine open-source regressions from mature component libraries and applications: genuine break and fix commits, both buildable, licence recorded.
  - Assign the split by `patternId`.
  - (v1.1: the pre-registered K6a rule in §9.1 can remove the creation-time regression family from the catalogue; DR-0013.)
  - (v1.7: M3 merged in PR #6. The corpus holds 79 regression patterns, 20 dev and 59 test: 68 in two SPA contexts, Atomic CRM and react-admin "simple", and 11 verified mined pairs, with 40 dev items including benign twins. Prompt to Page exports were set aside (P18). P14–P22; DR-0056 to DR-0064.)
- **M4 — Journeys and runner.** Goal-based steps with outcomes REACHED, PATH_CHANGED, UNREACHABLE and ENV_FAILURE; paired, counterbalanced execution; evidence packages uploaded as artefacts. (v1.8, approved by the owner 2026-10-03, DR-0067: in the NVDA-absent leg, focus strategies and actions use Playwright input on the focused element and browse strategies move a simulated virtual cursor over Chrome's accessibility tree with NVDA's quick-navigation role sets (P23). A goal-based step repeats its strategy up to `maxAttempts`, with the goal checked by the MSAA focus read or NVDA's speech in the NVDA-present leg and by the accessibility-tree node in the NVDA-absent leg. Its outcome is REACHED, UNREACHABLE (the journey stops, with no fallback), PATH_CHANGED (reached at a different attempt count from the base side's most common count in the same leg; REVIEW in M5) or ENV_FAILURE (P24). A PRESS step sends one documented key (P25).) (v1.2: the runner calls `assertItemExecutable`, which calls `assertSplitAllowed`, before executing any test-split item, DR-0034; the side-aware validity rule (R9) is implemented before M4, DR-0035.)
- **M5 — Oracles and scoring (dev split only).** Rules per arm (A, B, B2, and C and D under both UNION and ADJUDICATED); the scorer and statistics in §10.3; a dev report; a power table. (v1.2: C and D combine legs at item level, DR-0031; ANNOUNCEMENT_DUPLICATED needs NVDA-log corroboration or routes to REVIEW, §6 note, DR-0042.)
- **M6 — Freeze (Gate G3).** Complete `protocol/PROTOCOL.md` and compute the SHA-256 of `protocol/`. The owner reviews, tags and publishes. The scorer refuses to score the test split unless the protocol hash matches the tagged freeze. (v1.1: the freeze tag format is defined in DR-0028; pre-register the rule-model secondary analysis in DR-0023. v1.2: the protocol hash covers every path listed in `protocol/frozen-paths.txt`, not `protocol/` alone, DR-0033.)
- **M7 — Confirmatory run and soak (Gate G4).** Run the test split and a soak test sized per §10.3, then draft the results report, including negative findings.

### 9.1 Known-answer canaries (`fixtures/canaries/`)

Rewritten in v1.1 per DR-0013 (D4). The NVDA outcome is scored in G1 (NVDA-present leg); the B2 signature is scored in G2 (NVDA-absent leg). K6 and K7 run in both legs: their speech outcomes come from the NVDA-present leg and their B2 signatures from the NVDA-absent leg (v1.2; DR-0036).

| ID | Status | Behaviour | Expected NVDA outcome | Expected B2 signature |
|---|---|---|---|---|
| K1 | Gating | Polite live region present and empty at load; text inserted 500 ms after activation | Utterance containing the text within 3 s | Text mutation inside the live region; live-region or text events |
| K2 | Gating | `role="alert"` content update | Utterance containing the text | `EVENT_OBJECT_LIVEREGIONCHANGED` plus IA2 `TEXT_INSERTED` on the alert (not `EVENT_SYSTEM_ALERT`) |
| K3 | Gating | Programmatic focus moved to a named button | Name and role conveyed | `focusin`; focus WinEvent |
| K4 | Gating | Dialog opens with `aria-labelledby`; focus moves to its first control | Dialog name conveyed | Dialog inserted or shown; focus events |
| K5 | Gating | `pushState` route change; focus moves to `h1`; title updated | `h1` text conveyed | History event; focus events. No title dependency |
| K6a | Record only; 20 runs per variant | Populated region inserted, in three variants: `aria-live="polite"`, `role="status"` and `aria-live="assertive"` | Not announced | Insertion, graded by insertion-to-content delay (§8.3; DR-0037) |
| K6b | Record only; 20 runs | Populated `role="alert"` inserted | Announced at NOW priority | Insertion, graded by insertion-to-content delay (§8.3; DR-0037) |
| K6e | Exploratory; 10 runs per delay | Region inserted empty, then filled after 0 ms, one rAF, 50, 100, 150, 250 and 500 ms | Not pre-declared; recorded per delay | Insertion, then text mutation; recorded per delay |
| K7a | Record only; 20 runs | Timer-driven polite update, then programmatic focus to a button | Polite text, then the button; no cancel | Mutation followed by focus events |
| K7b | Record only; 20 runs | As K7a, but focus moves into a text input from browse mode | Cancel | Mutation followed by focus events |

K6 and K7 are not pass/fail canaries. They test premises the corpus depends on.

**Canary rules (DR-0013, D4):**
- K1–K5 are the gating canaries; K6 and K7 are record-only at 20 runs each, and K6e runs 10 times per delay, in each leg (DR-0036).
- Live regions carry an `id` but no accessible name.
- Fill delays are over 350 ms, except in the K6e sweep, which tests shorter delays on purpose.
- No keypress inside any observation window; K7 is triggered by a timer, not a key.
- K5 does not depend on the title; latency is measured from the canary events themselves (DR-0010, D1).
- B2 signatures (P12; DR-0053, DR-0055): a platform event is attributed by UIA AutomationId (the DOM id), and only when it has none by MSAA name, UIA AriaRole or MSAA role; LiveSetting is not an identity; events on the browser frame window are excluded (P3). The required components per gating canary, the K6 and K7 record-only traces and the "same frame" rule are as listed in DR-0053.
- Speech matching (P11; DR-0048, DR-0052): an utterance contains the expected text when its lower-cased letters and digits contain the expected text's, because NVDA's speech dictionaries rewrite text before it is queued ("K1" becomes "K 1"); K3 needs the name immediately followed by the role.

**Pre-registered K6a rule (DR-0013, D4):** if any K6a variant is announced in more than 1 of 20 runs, the creation-time regression family leaves the M3 catalogue. The rule is evaluated on the NVDA-present leg (v1.2; DR-0036). "Announced" means the tap records a `speak` message containing the region's text within the observation window (DR-0013's reading, approved by the owner 2026-10-02, DR-0030). Which mechanisms belong to the creation-time regression family, and which are not affected, is as listed in DR-0013 (P1, approved by the owner 2026-10-03, DR-0046), fixed before any K6a data exist.

### 9.2 Workflow skeleton (`.github/workflows/phase0-nvda.yml`)

```yaml
name: phase0-nvda
on:
  workflow_dispatch:
    inputs:
      runs:
        type: string
        default: "50"
      canaries:
        type: string
        default: "K1,K2,K3,K4,K5"
permissions:
  contents: read
concurrency:
  group: phase0-${{ github.ref }}
  cancel-in-progress: false
jobs:
  canaries:
    runs-on: windows-2025 # gates; change only via DECISIONS.md (DR-0006)
    timeout-minutes: 90
    strategy:
      fail-fast: false
      matrix:
        leg: [nvda-absent, nvda-present] # one dispatch, so both legs share an image version
        shard: [1, 2, 3, 4, 5]
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - name: Install Scream 3.6 virtual audio (D3, DR-0040, DR-0047)
        shell: pwsh # both legs (DR-0047); checks SHA-256, records then verifies the signature, trusts, installs
        run: ./harness/src/probes/scream.ps1 -Lock env/env.lock.json -OutDir artefacts/scream
      - name: Install NVDA 2026.2 with the pinned Guidepup CLI (D2)
        if: matrix.leg == 'nvda-present'
        run: npx --no-install guidepup install
      - name: Preflight (D3, D8, D12)
        env:
          LEG: ${{ matrix.leg }}
        run: npm run phase0:preflight -- --leg "$env:LEG"
      - name: Run canaries
        env:
          LEG: ${{ matrix.leg }}
          RUNS: ${{ inputs.runs }}
          CANARIES: ${{ inputs.canaries }}
          SHARD: ${{ matrix.shard }}
        run: npm run phase0:canaries -- --leg "$env:LEG" --runs "$env:RUNS" --canaries "$env:CANARIES" --shard "$env:SHARD/5"
      - uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        if: always()
        with:
          name: phase0-${{ matrix.leg }}-shard${{ matrix.shard }}
          path: artefacts/
          retention-days: 30
```

The SHAs are recorded in DR-0008 and `env/env.lock.json`; the workflow-policy tests check every workflow against rules W1–W8 and against those SHAs (DR-0016). `@guidepup/guidepup` 0.35.0 and `@guidepup/setup` 0.29.1 are pinned exactly in `package.json` (since M1a), and the step runs the local CLI with `npx --no-install`, because the setup CLI reads the NVDA manifest (and its sha256) from the installed `@guidepup/guidepup` (DR-0009). The Scream step runs `harness/src/probes/scream.ps1` in both legs (DR-0047). M1a pinned the signature (status `Valid`, signer, issuer and thumbprint; DR-0040, DR-0047). The archive's bundled `devcon.exe` is unsigned and is never run: the script creates the device with an in-repository SetupAPI installer that makes the same calls as `devcon install` (DR-0047). The step checks the archive's SHA-256 first, before anything is expanded; a mismatch fails the step and logs the digest it found. It then reads the expanded `Scream.sys` with `Get-AuthenticodeSignature` and writes its status, signer, issuer and thumbprint to `artefacts/scream-signature.json` before any pin or signature check, so a failed check still leaves evidence; the leg's upload step runs `if: always()`, so the record is kept. Only then does it compare: before the certificate is added to TrustedPublisher, it requires the signer thumbprint to be pinned in env.lock, requires the status to equal `Valid` and verifies the status, signer, issuer and thumbprint against `env/env.lock.json`, failing on any mismatch; env.lock refuses a pinned thumbprint until the other three are pinned (DR-0040). Any future result other than the pinned valid signature fails the step before anything is trusted (DR-0040). M2 adds `actions/setup-dotnet` (v6.0.0, SHA in DR-0008) with SDK 10.0.401 to build the listener; the owner approved this Action on 2026-10-03 (P2; DR-0046), and `env/env.lock.json` now gives it the status `pinned`. The env-lock cross-check test still requires every Action that a workflow uses to have the status `pinned`, so any future `pending-owner` Action fails CI until the owner approves it (DR-0008). Because M2 is built in parallel with M1 (DR-0043), the M2 workflow changes may land and run before G1. M1a uses a separate `.github/workflows/phase0-probe.yml`, the only workflow in which `windows-2022` may appear (DR-0025). Step names, the `phase0:preflight` script, the `canaries` input and the Scream install sequence (DR-0012) were Decided by Claude under DR-0045 (2026-10-03); the signature check in that sequence is the owner's (DR-0040).

---

## 10. Repository and contracts

### 10.1 Layout

```
.
├── CLAUDE.md
├── HANDOFF.md
├── docs/
│   ├── PRD-v0.3-technical-extract.md   # the full PRD is never committed (D5)
│   ├── DECISIONS.md
│   ├── LAB_NOTEBOOK.md
│   ├── research/          # desk research with evidence (DR-0029)
│   └── gates/
├── protocol/              # frozen at M6; hashed
│   ├── frozen-paths.txt   # every path the protocol hash covers (DR-0033)
│   ├── PROTOCOL.md
│   ├── AMENDMENTS.md
│   ├── triggers.v1.json
│   └── oracles/
├── harness/src/
│   ├── runner/            # journeys, pairing, counterbalancing, handover, validity, split guard
│   │   ├── validity.ts    # Phase 0 reason codes and limits (DR-0021; Phase 0-scoped, DR-0035)
│   │   └── splitGuard.ts  # assertItemExecutable, which calls assertSplitAllowed (DR-0034)
│   ├── collectors/        # axe, ARIA snapshot, AX tree, mutations, platform-event client, speech
│   ├── adapters/          # AtAdapter, guidepup (no atdriver in Phase 0, D2)
│   ├── oracles/           # evidence to verdict, per arm
│   ├── score/             # detection, false FAIL, intervals, bootstrap
│   ├── schema/            # zod schemas mirroring §10.2
│   ├── clock/             # QPC and the per-process wall-clock anchor (D1)
│   └── policy/            # workflow, clock and env-lock policies
├── harness/test/policy/   # guard tests: workflows, clock, repository safety
├── listener/              # Windows platform-event listener (C#, .NET 10; D10)
├── adapters/nvda-addon/   # only if approved; GPL-2.0-or-later
├── fixtures/{canaries,p2p,spa}/
├── corpus/{items,patches}/
├── journeys/
├── env/env.lock.json
└── .github/workflows/
```

### 10.2 Data contracts (`harness/src/schema/types.ts`; mirror in zod)

v1.1 additive fields, time semantics and the redefinition of `maxClockSkewMs` are defined in DR-0026, which the owner accepted with amendments on 2026-10-02: (a) gate evidence must carry `leg`, `preflight` and a `segmentId` on every step, enforced by the runner, which validates every gate package against `GateEvidencePackageSchema`; (b) `Utterance.priority` is required in nvda-present packages; (c) `harness/src/runner/validity.ts` is Phase 0-scoped (R9; DR-0035). All times are QPC nanoseconds since boot (D1). The types below are unchanged from v1.0.

```ts
export type Verdict = "PASS" | "FAIL" | "REVIEW" | "INCONCLUSIVE";

export type Symptom =
  | "NAME_NOT_CONVEYED" | "ROLE_NOT_CONVEYED" | "STATE_NOT_CONVEYED"
  | "ANNOUNCEMENT_MISSING" | "ANNOUNCEMENT_DUPLICATED" | "ANNOUNCEMENT_ORDER_BROKEN"
  | "ANNOUNCEMENT_INTERRUPTED" | "FOCUS_NOT_MOVED" | "FOCUS_NOT_RESTORED"
  | "FOCUS_ESCAPES_DIALOG" | "KEYBOARD_TRAP" | "NAV_TARGET_UNREACHABLE"
  | "INTERACTION_FAILS_UNDER_AT" | "ROUTE_CHANGE_SILENT" | "JOURNEY_BLOCKED";

export type BenignType =
  | "WRAPPER_ELEMENT" | "CLASS_RENAME" | "CSS_ONLY" | "COPY_EDIT"
  | "A11Y_IMPROVEMENT" | "EQUIVALENT_REFACTOR" | "TIMING_WITHIN_TOLERANCE";

export type Arm =
  | "A" | "B" | "B2"
  | "C_UNION" | "C_ADJUDICATED"
  | "D_UNION" | "D_ADJUDICATED";

export type Strategy =
  | "TAB" | "SHIFT_TAB" | "NEXT_HEADING" | "NEXT_FORM_FIELD" | "NEXT_BUTTON"
  | "NEXT_LANDMARK" | "BROWSE_NEXT" | "ACTIVATE" | "TYPE" | "READ_CURRENT"
  | "PRESS";                    // v1.8: one documented key (P25; DR-0067)

export interface Expectation {
  type: "announcementContains" | "focusOn" | "stateIs" | "orderBefore";
  value: string;
  before?: string;              // orderBefore only
}

export interface AtStep {
  kind: "at";
  id: string;
  strategy: Strategy;
  until?: { name?: string; role?: string; maxAttempts: number }; // goal-based and bounded
  text?: string;                // TYPE only
  key?: "Escape" | "Space" | "Enter" | "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Home" | "End"; // PRESS only (v1.8; P25)
  observeMs: number;            // observation window after the action
  expectations: Expectation[];
  manualTriggers?: string[];    // owner overrides; automatic triggers come from triggers.v1.json
}

export interface SetupStep {
  kind: "setup";
  id: string;
  fn: string;                   // named Playwright setup function; never used inside AT segments
}

export interface Journey {
  id: string;
  version: string;
  app: string;
  entryUrl: string;
  anchor: string;               // declared handover focus anchor (selector)
  steps: Array<AtStep | SetupStep>;
}

export type Expected =
  | { kind: "regression"; symptom: Symptom; mechanism: string } // mechanism is metadata only
  | { kind: "benign"; benignType: BenignType }
  | { kind: "unchanged" };

export interface CorpusItem {
  id: string;
  patternId: string;            // independence cluster: unit for the split and the bootstrap
  split: "dev" | "test";
  source: "seeded" | "oss-history" | "reconstructed";
  app: string;
  journeyId: string;
  base: { ref: string };
  candidate: { ref?: string; patch?: string };
  expected: Expected;
  repetitions?: number;
  provenance: { origin: string; licence?: string; url?: string }; // anonymised for reconstructed items
}

export interface EnvManifest {
  harnessCommit: string;
  imageOS: string;
  imageVersion: string;
  windowsBuild: string;
  chromeVersion: string;
  chromeFlags: string[];
  nvdaVersion?: string;
  nvdaConfigHash?: string;
  adapter?: { name: "guidepup" | "atdriver"; version: string };
  listenerVersion: string;
  nodeVersion: string;
  locale: string;
}

export interface Utterance {
  text: string;
  t: number;
  cancelledAt?: number;
}

export interface PlatformEvent {
  t: number;
  channel: "MSAA" | "IA2" | "UIA";
  event: string;
  role?: string;
  name?: string;
  text?: string;
}

export interface StepEvidence {
  stepId: string;
  startedAt: number;
  endedAt: number;
  outcome: "REACHED" | "PATH_CHANGED" | "UNREACHABLE" | "ENV_FAILURE";
  axe?: unknown;
  ariaSnapshot?: string;
  axTree?: unknown;
  mutations?: unknown[];
  platformEvents?: PlatformEvent[];
  speech?: Utterance[];
  focusTrace?: Array<{ t: number; target: string }>;
}

export interface EvidencePackage {
  itemId: string;
  side: "base" | "candidate";
  repetition: number;
  orderIndex: number;           // position in the counterbalanced sequence
  env: EnvManifest;
  canaries: { pre: boolean; post: boolean };
  maxClockSkewMs: number;
  steps: StepEvidence[];
}

export interface ArmVerdict {
  itemId: string;
  arm: Arm;
  verdict: Verdict;
  symptom?: Symptom;
  ruleIds: string[];            // oracle rules that fired
}
```

### 10.3 Statistics the scorer must implement (with unit tests)

- **Proportions:** Wilson 95% intervals.
- **Paired arm comparisons on the same items:** report discordant counts in both directions; exact McNemar as a secondary test.
- **Clustering:** items sharing a `patternId` are not independent. Headline intervals use a pattern-level bootstrap (10,000 resamples, recorded seed).
- **Reliability:** zero failures in N runs gives a 95% upper bound of about 3/N; with failures, use Clopper–Pearson. Demonstrating a rate of 0.5% or less therefore needs about 600 clean runs.
- **Sample size:** n ≈ z² · p(1 − p) / d². For example, p = 0.15 and d = 0.08 give about 77 independent regression patterns in the test split. Produce a power table at M5 from dev estimates.
- **Weighting:** primary analysis is uniform by symptom; secondary uses an owner-supplied weights file whose hash is frozen with the protocol.
- **INCONCLUSIVE:** counts as a miss; report its rate per arm.
- **Freeze guard:** `npm run score -- --split test` must exit non-zero unless the hash of `protocol/` equals the hash recorded in the freeze tag. (v1.2: the hash covers every path listed in `protocol/frozen-paths.txt`: `protocol/`, `corpus/`, `journeys/`, `fixtures/`, `harness/src/`, `listener/`, `env/env.lock.json`, `package.json`, `package-lock.json`, `.nvmrc` and `.github/workflows/`. Because the list lives in `protocol/`, changing it changes the hash. `npm run protocol:hash` prints the `protocol-sha256` line for the freeze tag. DR-0033.)
- **Execution guard (v1.2; DR-0034):** hard rule 5 covers execution, not just scoring. From M4 the runner calls `assertItemExecutable` (`harness/src/runner/splitGuard.ts`), which calls `assertSplitAllowed`, before executing any test-split item; a refusal names the item and the reason.

---

## 11. Working conventions

- **`docs/DECISIONS.md`** (lightweight decision records): date, context, options considered, decision, consequences.
- **`docs/LAB_NOTEBOOK.md`:** dated observations, each labelled EXPLORATORY.
- **`protocol/AMENDMENTS.md`:** any post-freeze change with its justification; report both the original and the amended analyses.
- Keep raw evidence for failed runs; the failure taxonomy depends on it.
- Conventional commits; one branch per milestone; the owner merges at gates.
- **Escalation (v1.2; DR-0045).** Only hard-rule-12 items go to the owner: what is measured, what counts as detection, cost and security. Claude decides everything else and logs it in `docs/DECISIONS.md` ("Decided by Claude under DR-0045"). Pending hard-rule-12 items are listed at the top of `docs/DECISIONS.md` for the next gate brief.
- **Gate report template** (formal and concise; tables for results):
  1. Summary and recommendation (proceed, remediate or stop).
  2. Results with intervals.
  3. Failure taxonomy.
  4. Decisions needed from the owner (hard-rule-12 items only; v1.2).
  5. Risks and scope changes.
  6. Exact commands to reproduce.
- **Gate brief (v1.2; DR-0045).** At each gate, a one-page brief accompanies the gate report in the gate PR: at most 10 yes/no items, each with Claude's recommendation. Only hard-rule-12 items appear in it. An item needed before a gate is put to the owner when it is first needed, in the same yes/no form with a recommendation; items not needed before the next gate wait for its brief.

---

## 12. CLAUDE.md — create in M0 with this content

~~~markdown
# CLAUDE.md — Accessibility Regression CI falsification spike

This is a research harness, not a product. It measures whether event observation and real NVDA detect accessibility regressions that axe and accessibility-tree testing miss. Owner: Courtney. Full brief: HANDOFF.md (v1.6). Protocol extract: docs/PRD-v0.3-technical-extract.md (the full PRD is held privately by the owner).

## Golden rules
- Public repository: no secrets, customer data, interview notes or identifiable defects.
- The full PRD and all commercial content are never committed; docs/PRD-v0.3.md stays git-ignored (D5, DR-0014).
- NVDA binaries are never committed, uploaded or included in evidence bundles (D6, DR-0015).
- No outward actions (visibility changes, tags, releases, publishing) without owner approval.
- Never request admin scope; repository settings are the owner's to apply (D7, DR-0016).
- Actions pinned to full SHAs; read-only permissions by default; inputs passed via env, never interpolated into run.
- Standard GitHub-hosted runners only.
- QPC is the only timebase: process.hrtime.bigint() in Node, Stopwatch.GetTimestamp() in C#. No wall-clock reads in collectors; only the per-process wall-clock anchor may read the wall clock (DR-0027).
- NVDA log lines may be bucketed into segments via the wall anchor only for parity counts and diagnostics, never for latency, ordering or validity (DR-0039).
- Exploratory until the protocol freeze; never execute or score the test split before it. From M4, call assertItemExecutable before executing any test-split item (DR-0034).
- Never tune oracles, triggers or thresholds on test data. Never hand-edit verdicts.
- INCONCLUSIVE comes only from checks completed before the outcome is known (D12, DR-0021). A check may produce INCONCLUSIVE only if the thing being judged cannot cause it to fail (DR-0032).
- Never switch navigation strategy on failure; report UNREACHABLE.
- No page.keyboard or page.click inside AT segments, and no keypress inside any observation window (D4, DR-0013).
- AT Driver is not used in Phase 0 (D2, DR-0011). Guidepup provides NVDA lifecycle and input only, with capture off; speech comes from the relay tap.
- Harness never imports NVDA code; NVDA add-on code is GPL and lives in adapters/nvda-addon/.
- Prompt to Page fixtures: de-branded only; no restricted fonts or protected marks.
- Stop and ask when a choice changes what is measured, what counts as detection, cost or security (hard rule 12); these are the only items brought to the owner. Decide and log everything else in docs/DECISIONS.md (DR-0045).
- Cost (DR-0046): use multi-agent orchestration only for gate reviews; work single-agent between gates, flag token-heavy work before running it, and estimate model spend in each gate report.
- At each gate, put a one-page brief in the gate PR alongside the report: at most 10 yes/no items, each with your recommendation (DR-0045).

## Commands
- npm run lint
- npm run typecheck
- npm test
- npm run protocol:hash (prints the protocol-sha256 line over the frozen set in protocol/frozen-paths.txt; DR-0033)
- gh workflow run phase0-nvda.yml --ref <branch> -f runs=50 (from M1)
- gh run watch
- gh run download <run-id> -D artefacts/<run-id>
- npm run report:phase0 -- artefacts/<run-id> (available from M1)
- npm run phase0:canaries -- --leg <nvda-absent|nvda-present> --runs <n> (available from M1; Windows CI only)
- npm run score -- --split dev (reports "not implemented" until M5)
- Archive at each gate (D6): gh run download the gate's runs on this machine, then commit a per-gate tar.zst bundle under 50 MB, with a SHA-256 manifest of run IDs, image versions and pinned versions, to the orphan results branch. Never include NVDA binaries.

## Current authorisation
M0–M4. The owner approved Gate G2 on 2026-10-03, which unlocked M3 (DR-0055), merged M3 and authorised M4 on 2026-10-03 (DR-0065). M5 onwards is not authorised: ask the owner before starting M5. The Phase 1 proceed/stop decision stays on Fri 27 Nov 2026, re-planned from Phase 0's measured costs (DR-0003).

## Logs
- docs/DECISIONS.md — decisions
- docs/LAB_NOTEBOOK.md — exploratory observations
- protocol/AMENDMENTS.md — post-freeze changes
- docs/research/ — desk research with evidence
~~~

---

## 13. First session

**Status: complete (2026-10-02).** The owner answered the first-session reply on 2026-10-02; the decisions are recorded in `docs/DECISIONS.md`, and M0 is in progress on `m0-bootstrap`.

1. Read this file and the full PRD v0.3 (held privately by the owner at the git-ignored local path `docs/PRD-v0.3.md`; never committed, D5).
2. Reply with:
   - your plan for M0–M2, including the expected number of CI round trips;
   - any §2 decisions still unresolved;
   - the three risks you consider most likely to stop the spike at G1 or G2.
3. Wait for approval, then execute M0.

## Definition of done for this handoff

`docs/gates/G2.md` delivered with a recommendation, and every Phase 0 claim reproducible from recorded artefacts with one command.
