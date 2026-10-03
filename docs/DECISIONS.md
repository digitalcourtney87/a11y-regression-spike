# Decision records

Lightweight decision records for the Accessibility Regression CI falsification spike, Phase 0. Everything before the protocol freeze (M6) is **exploratory**.

## Format

Each record follows HANDOFF §11: **date, context, options considered, decision, consequences**.

| Status | Meaning |
|---|---|
| Accepted | In force. |
| Accepted with amendments | In force as amended by the owner. The record lists the amendments and their date. |
| Superseded | Replaced by a later record, which it names. The decision text is kept unchanged. |
| Proposed | Drafted by Claude; not in force until the owner accepts it. |

Conventions:

- **Owner's wording is verbatim.** Under "Decision", the owner's words are quoted in a blockquote. For DR-0001 to DR-0029 the source is the owner decisions of 2 October 2026 (the open §2 items, D1–D13, and the "approved as proposed" items) unless a record names another owner-authored source, such as HANDOFF v1.0. For DR-0030 onwards the source is the owner's review of M0 of 2 October 2026 (recorded 2026-10-03).
- **Gap-filling is labelled.** Anything Claude supplied that the owner did not decide carries one of the labels below. From 2026-10-03 Claude decides and logs everything except hard-rule-12 items (DR-0045); only those keep the Proposed label, and they are also listed under "Pending owner items (hard rule 12)" after the index.

| Label | Meaning |
|---|---|
| **Proposed by Claude (not yet owner-approved)** | A hard-rule-12 item (what is measured, what counts as detection, cost or security) awaiting the owner. Not in force. |
| **Approved by the owner 2026-10-02 (DR-0030)** | Proposed in PR #1 and approved in the owner's review, explicitly or as "not mentioned". Where a later record changes it, that record is named too. |
| **Decided by Claude under DR-0045 (2026-10-03)** | Not a hard-rule-12 item. Decided and logged by Claude under the owner's delegation. |
| **Superseded by DR-00xx** | The part is replaced by the named record. Its text is kept. |
| **Amended by DR-00xx (2026-10-02)** (header row) | The record's decision stands; the named record changes part of it or of its consequences. |

- **Evidence.** Context and options come from the desk research in `docs/research/2026-10-02-phase0-feasibility.md` (DR-0029) and from Claude's first-session proposals of 2 October 2026. Where the researcher and the verifier disagree, the verifier's correction is used.
- **HANDOFF references.** DR-0001 to DR-0029 cite HANDOFF v1.1, which keeps the v1.0 numbering. DR-0030 onwards cite HANDOFF v1.2.
- **No commercial content.** The PRD's commercial content is out of scope for this repository and is not summarised here (DR-0014).
- **Changes.** The decision of an Accepted record is never edited. A change is a new record that supersedes or amends it. An amended record gains an "Amended by" header row, and a replaced part is marked "Superseded by DR-00xx" with its text kept. The one in-place change allowed is a status change on owner acceptance, as for DR-0026.

## Index

"Proposed parts" gives the state after the owner's review (DR-0030): "No" (the record never had any), "Resolved" (every part relabelled per DR-0030), or the pending owner items still open.

| ID | Title | Status | Date | Owner label | Amended by | Proposed parts |
|---|---|---|---|---|---|---|
| [DR-0001](#dr-0001-repository-visibility-and-licence) | Repository, visibility and licence | Accepted | 2026-10-02 | §2 Repository, Licence (HANDOFF defaults) | — | No |
| [DR-0002](#dr-0002-copyright-holder) | Copyright holder | Accepted | 2026-10-02 | §2 Copyright holder | — | No |
| [DR-0003](#dr-0003-time-box-and-stop-dates) | Time box and stop dates | Accepted | 2026-10-02 | §2 Stop dates | DR-0043 | Resolved |
| [DR-0004](#dr-0004-owner-review-cadence) | Owner review cadence | Accepted | 2026-10-02 | §2 Owner review | DR-0043, DR-0045 | Resolved |
| [DR-0005](#dr-0005-spend) | Spend | Accepted | 2026-10-02 | §2 Spend | — | Resolved (P7, DR-0052) |
| [DR-0006](#dr-0006-runner-images) | Runner images | Accepted | 2026-10-02 | §2 Runner | — | Resolved |
| [DR-0007](#dr-0007-toolchain-pins) | Toolchain pins | Accepted | 2026-10-02 | Approved as proposed (toolchain) | — | Resolved |
| [DR-0008](#dr-0008-github-action-pins) | GitHub Action pins | Accepted | 2026-10-02 | HANDOFF hard rule 3, §9.2 | DR-0046 | Resolved (DR-0046) |
| [DR-0009](#dr-0009-nvda-provisioning-via-guidepup-setup-action-archived) | NVDA provisioning via Guidepup (setup-action archived) | Accepted | 2026-10-02 | D2 (provisioning) | — | Resolved |
| [DR-0010](#dr-0010-d1-clock-alignment) | D1 Clock alignment | Accepted | 2026-10-02 | D1 | DR-0039, DR-0049 | Resolved (DR-0049) |
| [DR-0011](#dr-0011-d2-speech-capture-incl-prd-48-at-driver-teardown) | D2 Speech capture (incl. PRD §48 AT Driver teardown) | Accepted | 2026-10-02 | D2 | DR-0039 | Resolved |
| [DR-0012](#dr-0012-d3-virtual-audio) | D3 Virtual audio | Accepted | 2026-10-02 | D3 | DR-0040, DR-0047 | Resolved |
| [DR-0013](#dr-0013-d4-canaries-incl-pre-registered-k6a-rule) | D4 Canaries (incl. pre-registered K6a rule) | Accepted | 2026-10-02 | D4 | DR-0036, DR-0037, DR-0046 | Resolved (DR-0046) |
| [DR-0014](#dr-0014-d5-prd-publication) | D5 PRD publication | Accepted | 2026-10-02 | D5 | — | Resolved |
| [DR-0015](#dr-0015-d6-evidence-archive) | D6 Evidence archive | Accepted | 2026-10-02 | D6 | — | Resolved |
| [DR-0016](#dr-0016-d7-sha-pinning-and-repository-settings) | D7 SHA pinning and repository settings | Accepted | 2026-10-02 | D7 | — | Resolved |
| [DR-0017](#dr-0017-d8-nvda-channel-and-voice) | D8 NVDA channel and voice | Accepted | 2026-10-02 | D8 | DR-0041 | Resolved |
| [DR-0018](#dr-0018-d9-arm-b-evidence) | D9 Arm B evidence | Accepted | 2026-10-02 | D9 | — | No |
| [DR-0019](#dr-0019-d10-b2-scope-and-listener) | D10 B2 scope and listener | Accepted | 2026-10-02 | D10 | DR-0037, DR-0046, DR-0052 | Resolved (P2, DR-0046; P3, DR-0052) |
| [DR-0020](#dr-0020-d11-separate-legs) | D11 Separate legs | Accepted | 2026-10-02 | D11 | DR-0031, DR-0046 | Resolved (DR-0046) |
| [DR-0021](#dr-0021-d12-gates-and-validity) | D12 Gates and validity | Accepted | 2026-10-02 | D12 | DR-0032, DR-0035, DR-0038 | Resolved |
| [DR-0022](#dr-0022-d13-h2-scope) | D13 H2 scope | Accepted | 2026-10-02 | D13 | — (related: DR-0042) | Resolved |
| [DR-0023](#dr-0023-m6-pre-registration-rule-model-secondary-analysis) | M6 pre-registration: rule-model secondary analysis | Accepted | 2026-10-02 | Pre-register at M6 | — | No |
| [DR-0024](#dr-0024-smaller-fixes-approved-as-proposed) | Smaller fixes (approved as proposed) | Accepted | 2026-10-02 | Approved as proposed (smaller fixes) | — | No |
| [DR-0025](#dr-0025-m1a-runner-probes) | M1a runner probes | Accepted | 2026-10-02 | Approved as proposed (M1a probes) | DR-0040, DR-0041 | Resolved |
| [DR-0026](#dr-0026-schema-v11-additions) | Schema v1.1 additions | Accepted with amendments (owner review 2026-10-02) | 2026-10-02 | Owner review 2026-10-02, key item 3 (implements D1–D4, D8, D10–D13) | Amendments (a)–(c) in the record; DR-0035, DR-0038 | Resolved |
| [DR-0027](#dr-0027-collector-clock-rule-enforcement) | Collector clock rule enforcement | Accepted | 2026-10-02 | D1 (clock test) | — | Resolved |
| [DR-0028](#dr-0028-protocol-freeze-guard) | Protocol freeze guard | Accepted | 2026-10-02 | HANDOFF §10.3 | DR-0033, DR-0034 | Resolved |
| [DR-0029](#dr-0029-desk-research-basis-2026-10-02) | Desk research basis (2026-10-02) | Accepted | 2026-10-02 | None (provenance) | — | No |
| [DR-0030](#dr-0030-owner-review-of-m0-approvals) | Owner review of M0: approvals | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02 (opening line, key items 1–3, other rulings) | — | No |
| [DR-0031](#dr-0031-item-level-leg-combination-for-c-and-d-amends-dr-0020) | Item-level leg combination for C and D (amends DR-0020) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, key item 1 | — | No |
| [DR-0032](#dr-0032-inconclusive-principle-and-the-post-block-canary-amends-dr-0021) | INCONCLUSIVE principle and the post-block canary (amends DR-0021) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, key item 2 | — | No |
| [DR-0033](#dr-0033-freeze-scope-protocolfrozen-pathstxt-amends-dr-0028) | Freeze scope: protocol/frozen-paths.txt (amends DR-0028) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, gaps item 4 | — | No |
| [DR-0034](#dr-0034-execution-guard-for-the-test-split-hard-rule-5) | Execution guard for the test split (hard rule 5) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, gaps item 5 | — | No |
| [DR-0035](#dr-0035-side-aware-validity-from-m4-validityts-is-phase-0-scoped-record-now-implement-before-m4) | Side-aware validity from M4; validity.ts is Phase 0-scoped (record now, implement before M4) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, item 6 and key item 3 (c) | — | No |
| [DR-0036](#dr-0036-k6-and-k7-in-both-legs-k6a-rule-on-the-nvda-present-leg-amends-dr-0013) | K6 and K7 in both legs; K6a rule on the NVDA-present leg (amends DR-0013) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, other rulings | — | No |
| [DR-0037](#dr-0037-k6-insertion-to-content-delay-grading-replaces-the-same-batch-flag-amends-dr-0013-dr-0019-handoff-83) | K6 insertion-to-content delay grading replaces the same-batch flag (amends DR-0013, DR-0019, HANDOFF §8.3) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, other rulings | DR-0052, DR-0055 | Resolved (P9 final, DR-0055) |
| [DR-0038](#dr-0038-per-canary-inconclusive-reporting-amends-dr-0021) | Per-canary INCONCLUSIVE reporting (amends DR-0021) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, other rulings | — | No |
| [DR-0039](#dr-0039-nvda-log-bucketing-via-the-wall-anchor-amends-dr-0010-dr-0011) | NVDA log bucketing via the wall anchor (amends DR-0010, DR-0011) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, other rulings | — | No |
| [DR-0040](#dr-0040-scream-authenticode-verification-amends-dr-0012) | Scream Authenticode verification (amends DR-0012) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, other rulings | — | No |
| [DR-0041](#dr-0041-espeak-ng-at-nvdas-default-rate-amends-dr-0017) | eSpeak NG at NVDA's default rate (amends DR-0017) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, other rulings | — | No |
| [DR-0042](#dr-0042-m5-planning-note-announcement_duplicated-is-anti-conservative-relates-to-dr-0022) | M5 planning note: ANNOUNCEMENT_DUPLICATED is anti-conservative (relates to DR-0022) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, other rulings | — | No |
| [DR-0043](#dr-0043-schedule-g1-target-23-oct-2026-m2-in-parallel-with-m1-amends-dr-0003) | Schedule: G1 target 23 Oct 2026; M2 in parallel with M1 (amends DR-0003) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, schedule | — | No |
| [DR-0044](#dr-0044-auto-fix-fence-for-pr-1) | Auto-fix fence for PR #1 | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, auto-fix | — | No |
| [DR-0045](#dr-0045-escalation-and-gate-brief-process-owner-delegation) | Escalation and gate-brief process (owner delegation) | Accepted | 2026-10-02 (recorded 2026-10-03) | Owner review 2026-10-02, process | DR-0046 | No |
| [DR-0046](#dr-0046-owner-approvals-of-2026-10-03) | Owner approvals of 2026-10-03 | Accepted | 2026-10-03 | Owner reply 2026-10-03 | — | No |
| [DR-0047](#dr-0047-scream-pinned-from-m1a-in-repository-installer-both-legs) | Scream pinned from M1a; in-repository installer; both legs | Accepted | 2026-10-03 | Decided by Claude under DR-0040 and DR-0045 | — | No |
| [DR-0048](#dr-0048-m1b-canary-run-design) | M1b canary-run design | Accepted | 2026-10-03 | Decided by Claude under DR-0045 | DR-0049, DR-0052 | Resolved (P11, DR-0052) |
| [DR-0049](#dr-0049-owner-approvals-of-p6-and-p8) | Owner approvals of P6 and P8 | Accepted | 2026-10-03 | Owner reply 2026-10-03 | — | No |
| [DR-0050](#dr-0050-g1-top-up-and-evidence-archive) | G1 top-up and evidence archive | Accepted | 2026-10-03 | Decided by Claude under DR-0045 | — | No |
| [DR-0051](#dr-0051-handover-focus-read-retry) | Handover focus-read retry | Accepted | 2026-10-03 | P10, approved by the owner 2026-10-03 (DR-0052) | — | Resolved (P10, DR-0052) |
| [DR-0052](#dr-0052-owner-approvals-at-the-g1-gate) | Owner approvals at the G1 gate | Accepted | 2026-10-03 | Owner reply 2026-10-03 | — | No |
| [DR-0053](#dr-0053-m2-build-listener-integration-and-b2-signatures) | M2 build: listener integration and B2 signatures | Accepted | 2026-10-03 | Decided by Claude under DR-0045; P12 and P13 approved by the owner (DR-0055) | DR-0055 | Resolved (P12, P13, DR-0055) |
| [DR-0054](#dr-0054-g2-runs-diagnostic-and-evidence-archive) | G2 runs, diagnostic and evidence archive | Accepted | 2026-10-03 | Decided by Claude under DR-0045 | — | No |
| [DR-0055](#dr-0055-owner-approvals-at-the-g2-gate) | Owner approvals at the G2 gate | Accepted | 2026-10-03 | Owner reply 2026-10-03 | — | No |
| [DR-0056](#dr-0056-m3-start-spa-evaluation-corpus-scaffolding-and-the-corpus-plan) | M3 start: SPA evaluation, corpus scaffolding and the corpus plan | Accepted | 2026-10-03 | Decided by Claude under DR-0045; P14–P17 approved, P18 skipped (DR-0057) | DR-0057 | Resolved (DR-0057) |
| [DR-0057](#dr-0057-owner-approvals-for-the-m3-corpus) | Owner approvals for the M3 corpus | Accepted | 2026-10-03 | Owner reply 2026-10-03 | — | No |
| [DR-0058](#dr-0058-m3-spa-integrated-tooling-and-the-pattern-count) | M3: SPA integrated, tooling, and the pattern count | Accepted | 2026-10-03 | Decided by Claude under DR-0045; P19 approved (DR-0059) | DR-0059 | Resolved (DR-0059) |
| [DR-0059](#dr-0059-a-second-spa-and-the-dev-split-specs) | A second SPA, and the dev-split specs | Accepted | 2026-10-03 | Owner reply 2026-10-03; Decided by Claude under DR-0045 | — | No |

## Pending owner items (hard rule 12)

Rows here were hard-rule-12 items carrying **Proposed by Claude (not yet owner-approved)** until the owner ruled. Each is a hard-rule-12 item under DR-0045 (what is measured, what counts as detection, cost or security), so Claude has not decided it. They go in the next gate brief. An item needed before the G1 brief is put to the owner when it is first needed, as a yes/no question with Claude's recommendation (DR-0045).

P5 is no longer pending: it was resolved on 2026-10-03 (decided by Claude under DR-0045; see its row and DR-0007). Its row stays so that the P-numbers do not change. P1, P2 and P4 were approved by the owner on 2026-10-03 (DR-0046); their rows also stay. P6 and P8 were approved by the owner on 2026-10-03 (DR-0049). P3, P7, P9, P10 and P11 (P9 to P11 added on 2026-10-03 after the G1 gate review) were approved by the owner at the G1 gate on 2026-10-03 (DR-0052). P12, P13 and making P9 final were approved by the owner at the G2 gate on 2026-10-03 (DR-0055). P14–P17 were approved and P18 was set aside on 2026-10-03 (DR-0057). P19 was approved on 2026-10-03 (DR-0059). No items are pending.

| # | Item | Record | Category | Needed by | Claude's recommendation |
|---|---|---|---|---|---|
| P1 | **Resolved (approved by the owner 2026-10-03, DR-0046).** Membership of the creation-time regression family, and the mechanisms not affected, in the reading of the pre-registered K6a rule | DR-0013 | What is measured (what leaves the M3 catalogue if the rule triggers) | No longer pending | Approved as recommended |
| P2 | **Resolved (approved by the owner 2026-10-03, DR-0046).** `actions/setup-dotnet` v6.0.0 (`a98b56852c35b8e3190ac28c8c2271da59106c68`) to install the .NET 10 SDK for the listener build | DR-0008, DR-0019 | Security (a new third-party Action) | No longer pending | Approved as recommended |
| P3 | **Resolved (approved by the owner 2026-10-03, DR-0052).** Listener event scope: hook ranges (EVENT_OBJECT_LOCATIONCHANGE excluded), filtering by browser PID and window class, and browser-UI alerts excluded by `hwndClass` | DR-0019 | What is measured (which platform events B2 observes) | No longer pending | Approved as recommended |
| P4 | **Resolved (approved by the owner 2026-10-03, DR-0046).** Collectors in the NVDA-present leg, and how platform focus is verified there. Proposal: the WinEvent listener runs in that leg only for the 20-run on/off diagnostic, not in G1 runs; the in-page DOM timeline runs in both legs; G1 capture latency is measured from DOM mutation (page QPC) to tap receipt; platform focus in that leg is verified by an MSAA-only focus read (`accFocus` on Chrome's window), with no UIA client | DR-0020 (affects DR-0010 and DR-0024) | What is measured (which events are captured in the leg that produces C's evidence) | No longer pending | Approved as recommended |
| P5 | **Resolved (decided by Claude under DR-0045, 2026-10-03).** The `yaml` 2.9.1 dev dependency, used by the workflow policy test to parse workflow files | DR-0007 | Listed on 2026-10-03 as security (third-party code that runs in CI; no owner-authored text names it) | No longer pending | Decided, not asked: the package is dev-only and has no dependencies of its own. It is exactly pinned, with a sha512 integrity hash in `package-lock.json`, and carries the ISC licence. It runs only in the Linux CI job (`ci.yml`), under `contents: read` with no secrets, and it parses only this repository's workflow files. It exists to enforce hard rule 3 (supply chain): the workflow policy test uses it to check Action pins, permissions, secrets and input handling |
| P6 | **Resolved (approved by the owner 2026-10-03, DR-0049).** Final computation of four D1 checks: page-mapping uncertainty, segment drift, low-resolution TimeTicks and the rAF gap (including the in-page `requestAnimationFrame` heartbeat), fixed from M1a data | DR-0010 | What is measured (they decide when an attempt is INCONCLUSIVE) | No longer pending | Approved as recommended |
| P7 | **Resolved (approved by the owner 2026-10-03, DR-0052).** The owner monitors the £150 model-spend cap, because Claude cannot meter its own spend | DR-0005 | Cost (who watches the cost envelope) | No longer pending | Approved as recommended |
| P8 | **Resolved (approved by the owner 2026-10-03, DR-0049).** In Phase 0 canary runs, the pre-canary check is not applicable: each canary is itself the known-answer check, so `preCanaryOk` is always true and a capture failure counts as a canary failure, not INCONCLUSIVE. The anchor's focus announcement before activation is recorded per attempt, so the alternative (using it as the pre-canary) can be computed from the data | DR-0048 | What counts as INCONCLUSIVE (it decides whether an instrument failure can be absorbed as INCONCLUSIVE in G1) | No longer pending | Approved as recommended |
| P9 | **Resolved: approved provisionally by the owner 2026-10-03 (DR-0052) and made final as tested at the G2 gate (DR-0055); a same-frame fill is one in the same task or in a rAF callback within one 60 Hz frame (DR-0053).** For polite live regions filled after page load, replace DR-0037's 150 ms grading boundary with the observed one: a fill in the same frame (0 ms or one rAF) counts as a populated insertion; a fill 50 ms or more after insertion counts as a fill; between one frame and 50 ms (untested) routes to REVIEW. The 350 ms pre-load boundary and other region roles keep DR-0037's grading until tested; the boundary is confirmed against M2's NVDA-absent K6e signatures before G2 | DR-0037 (triggered by the M1d pilot and G1; lab notebook 2026-10-03) | What counts as detection (B2 signatures and the M3 catalogue) | No longer pending | Approved as recommended |
| P10 | **Resolved (approved by the owner 2026-10-03, DR-0052).** the handover's platform-focus check retries the MSAA focus read for up to 1 s before ruling `FOREGROUND_HWND`, from M2 onwards; G1 is unchanged | DR-0051 | What counts as INCONCLUSIVE (a pre-outcome check's timing) | No longer pending | Approved as recommended |
| P11 | **Resolved (approved by the owner 2026-10-03, DR-0052).** ratify the canary speech-matching rule of DR-0048 (letters-and-digits containment; K3 needs the name immediately followed by the role) | DR-0048 | What counts as detection (canary outcomes; G1's result rests on it) | No longer pending | Approved as recommended |
| P12 | **Resolved (approved by the owner 2026-10-03, DR-0055).** the operational B2 signatures of DR-0053 as narrowed by the G2 gate review: identity by AutomationId, with name, AriaRole or MSAA role only for events without one, no LiveSetting, and browser-frame events excluded (P3); the gating components for K1–K5 (K4 including SHOW on the dialog); the record-only traces for K6 and K7 ("separate update"; K7 order per event type); and "same frame" as the same task or a rAF fill within one 60 Hz frame, with other fills under 50 ms routed to REVIEW (timeline version 2; version 1 records keep the pre-registered one-frame threshold). Every listener event and the whole DOM timeline are kept per attempt, so another reading can be re-scored without new runs | DR-0053 | What counts as detection (G2's result rests on it) | No longer pending | Approved as recommended |
| P13 | **Resolved (approved by the owner 2026-10-03, DR-0055).** only a setup error before activation (browser launch, page load, process or window lookup) makes an attempt INCONCLUSIVE (`ENV_FAILURE`); a failure of the B2 listener (start, fewer hooks than ranges, ping, stop, not drained) or any error after activation counts as a failure. Implemented in the G2 gate-review fix; `ENV_FAILURE` for setup errors has been in the runner since M1 without an owner decision | DR-0053 | What counts as INCONCLUSIVE (D12, DR-0032) | No longer pending | Approved as recommended |
| P14 | **Resolved (approved by the owner 2026-10-03, DR-0057).** the M3 SPA is Atomic CRM's demo build (`marmelab/atomic-crm` at `b23289b`, MIT), with `faker` seeded, the clock fixed in journey setup, telemetry off and remote images replaced by local ones | DR-0056; `docs/research/2026-10-03-spa-candidates.md` | What is measured (the application the seeded regressions live in) | No longer pending | Approved as recommended |
| P15 | **Resolved (approved by the owner 2026-10-03, DR-0057).** corpus sizes and split: 110 regression patterns (33 dev, 77 test), benign patterns about 1:1 in each split, one unchanged control per journey, test fraction 0.7 stratified by pattern stratum with seed 20261004; M3 builds the dev split only, and test patterns are built after M5's power table, before the freeze | DR-0056; corpus plan §3 | What is measured (sample sizes and the confirmatory split) | No longer pending | Approved as recommended |
| P16 | **Resolved (approved by the owner 2026-10-03, DR-0057).** the regression catalogue (37 mechanisms across the 13 primary-analysis symptoms, creation-time family kept) and the benign catalogue (operators per BenignType) of the corpus plan | DR-0056; corpus plan §4–§5 | What is measured (which regressions and benign changes the corpus holds) | No longer pending | Approved as recommended |
| P17 | **Resolved (approved by the owner 2026-10-03, DR-0057).** vendor about 3 MB of Atomic CRM's source at the pinned commit into `fixtures/spa/atomic-crm/` (agent instruction files excluded), and install its locked dependency tree in CI with install scripts off, `contents: read`, no secrets and a separate npm cache | DR-0056 | Security (third-party code in the repository and in CI) | No longer pending | Approved as recommended |
| P18 | **Resolved (owner reply 2026-10-03, DR-0057): Prompt to Page exports are skipped for now; no customer defects were offered, so there are no reconstructed items for now.** the owner supplies 5–8 de-branded Prompt to Page exports (static HTML, no restricted fonts or protected marks) for seeded items, and any customer defects to reconstruct with anonymised provenance | DR-0056; corpus plan §2 | What is measured (sources in the corpus) | No longer pending | Not adopted for now |
| P19 | **Resolved (approved by the owner 2026-10-03, DR-0059).** to close the expected shortfall against P15's 110 regression patterns (about 57–67 reachable from the SPA and mined pairs), add react-admin's "simple" example (MIT; evaluated in DR-0056, meets every criterion) as a second SPA context: vendor about 1 MB of its source at the pinned commit, generate its lockfile in CI, and install it in CI under the P17 safeguards. The achievable count is reported again before the split | DR-0058; `docs/research/2026-10-03-oss-regression-survey.md` | What is measured (sample size and the independence of patterns); security (more third-party code) | No longer pending | Approved as recommended |

Other hard-rule-12 questions are conditional and arise only if M1a or a later milestone triggers them: a self-signed or otherwise unverifiable Scream signature (DR-0040), a separate download for `devcon` (DR-0012), a relay certificate other than the one in the pinned NVDA asset, which would need another trust source for the tap (DR-0009), an effective eSpeak NG rate other than 30 or another reason to change it (DR-0041), a change to any G1 or G2 criterion from M2 data (DR-0013), the FAIL rules that cover candidate-only check failures (DR-0035), the M5 handling of duplicates (DR-0042), and the final BenignType descriptions at the M6 freeze review (DR-0030).

---

## DR-0001 Repository, visibility and licence

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Owner label | §2 Repository, Licence (HANDOFF v1.0 defaults, not reopened on 2 October) |
| HANDOFF v1.1 | §2, §4 (rules 1, 10), §10.1 |

**Context.** HANDOFF v1.0 §2 proposed a public repository and a split licence. Public repositories get standard GitHub-hosted runners free of charge and support pre-registration. NVDA is GPL-2.0-or-later, so the licence boundary has to be clean from the first commit. The owner's decisions of 2 October listed the open §2 items; repository and licence were not among them, so the HANDOFF defaults stand.

**Options considered.** None beyond the HANDOFF defaults. One deviation from the default wording: the owner asked Claude to create the repository rather than creating it personally.

**Decision.** HANDOFF v1.0 §2 (owner-authored):

> Repository | Public, created by the owner (e.g. `a11y-regression-spike`)
>
> Licence | Apache-2.0 for the harness; GPL-2.0-or-later for any NVDA add-on code in `adapters/nvda-addon/`

The owner's request on 2 October 2026:

> Please save it as a doc (.md) and create the github repo for me

**Consequences.**

| Item | Value |
|---|---|
| Repository | https://github.com/digitalcourtney87/a11y-regression-spike, public. Created empty by Claude on 2026-10-02 at the owner's request. |
| `main` | Initial commit `4efae35` (LICENSE, NOTICE, README, .gitignore). |
| M0 work | Branch `m0-bootstrap`. The owner merges at gates. |
| Harness licence | Apache-2.0 (LICENSE, NOTICE). |
| GPL boundary | GPL-2.0-or-later only in `adapters/nvda-addon/`, and only if an add-on is ever approved (DR-0011 add-on rule). The directory does not exist and is not created without approval. |

- The harness never imports NVDA modules. It talks to NVDA only as a separate process, over NVDA's local relay socket (DR-0009, DR-0011).
- NVDA binaries are never committed or archived (DR-0015). The repository safety test rejects `nvda/`, `*.nvda-addon`, `nvda*.exe` and `*.dll` in committed files.
- Third-party code keeps its own licence and is not copied across the boundary. Guidepup is MIT. Scream is MS-PL and is downloaded at CI time, not redistributed (DR-0012). The PAC NVDA add-on (AT Driver) is GPL-2.0 and is not reused (DR-0011).

## DR-0002 Copyright holder

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Owner label | §2 Copyright holder |
| HANDOFF v1.1 | §2 |

**Context.** HANDOFF v1.0 §2 left the copyright holder as "[owner to confirm]". It is needed in LICENSE and NOTICE.

**Options considered.** Not applicable: the owner supplied the value.

**Decision.**

> Copyright holder: Courtney Allen Ventures Ltd.

**Consequences.**

- NOTICE reads "Copyright 2026 Courtney Allen Ventures Ltd." (present in `4efae35`).
- Any future attribution in source headers or the README uses the same holder.

## DR-0003 Time box and stop dates

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; label updated inline |
| Owner label | §2 Stop dates |
| Amended by | DR-0043 (2026-10-02): G1 report target Fri 23 Oct 2026; M2 built in parallel with M1; only the G2 report waits for G1. The stop dates are unchanged. |
| HANDOFF v1.1 | §2, §9, §12 (CLAUDE.md "Current authorisation") |

**Context.** HANDOFF v1.0 §2 proposed "8 weeks to decision; stop date [DATE]". PRD §54 requires the investigation to stay bounded, with a stop date defined before the spike starts. Claude's first-session reply noted that 8 weeks from 2 October is 27 November.

**Options considered.**

| Option | Source | Outcome |
|---|---|---|
| A single stop date of 27 Nov 2026 (8 weeks) | Claude's first-session reply | Replaced by a two-stage schedule |
| G2 by 6 Nov 2026; Phase 1 decision on 27 Nov 2026 | Owner | Adopted |

**Decision.**

> Stop dates: G2 report by Fri 6 Nov 2026, otherwise stop and report. Fri 27 Nov 2026 is the proceed/stop decision on Phase 1 (M3–M7), re-planned from Phase 0's measured costs.

**Consequences.**

- Phase 0 (M0–M2) runs from 2 Oct to 6 Nov 2026, five weeks. If the G2 report is not delivered by Fri 6 Nov 2026, Claude stops and reports the state reached.
- On Fri 27 Nov 2026 the owner decides whether Phase 1 (M3–M7) proceeds. Phase 1 is re-planned from Phase 0's measured costs.
- **Decided by Claude under DR-0045 (2026-10-03):** the G2 report includes a cost table to support that re-plan: CI round trips, Windows job-minutes, runtime per canary run per leg, INCONCLUSIVE rate, and model spend to date.
- Dates that fall inside or near the window:

| Date | Event | Effect |
|---|---|---|
| 2026-10-20 | Node 24 enters maintenance | None; the pin stays at 24.21.0 (DR-0007) |
| 2026-10-23 | G1 report target (DR-0043) | Added by the owner's review |
| 2026-10-28 | Node 26 becomes LTS | None; no upgrade mid-phase (DR-0007) |
| 2026-11-10 | .NET 8 and 9 leave support | Reason for .NET 10 (DR-0019) |
| about 2027-05-29 | Guidepup relay certificate expected to stop working | Outside Phase 0 and the Phase 1 decision (DR-0009) |
| 90 days after each run | Workflow runs and artefacts deleted | Archive at each gate (DR-0015) |

## DR-0004 Owner review cadence

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; label updated inline |
| Owner label | §2 Owner review |
| Amended by | DR-0043 (2026-10-02): the owner set the G1 target date. DR-0045 (2026-10-02): only hard-rule-12 items go to the owner, with a one-page brief at each gate. The review time and the 3-working-day gate review are unchanged. |
| HANDOFF v1.1 | §2, §9 (gates) |

**Context.** HANDOFF v1.0 §2 proposed "[N] hours per week; gate reviews within 3 working days".

**Options considered.** Not applicable: the owner supplied the values.

**Decision.**

> Owner review: 3 hours/week; gate reviews within 3 working days.

**Consequences.**

- At each gate Claude opens a PR with `docs/gates/G<n>.md` (HANDOFF §11 template) and stops. The review window is up to 3 working days from the PR.
- The G1 report must leave room for a review of up to 3 working days and for all of M2 before 6 Nov 2026 (DR-0003). Claude will propose a G1 target date in the M1 plan. **Superseded by DR-0043:** the owner set the G1 report target, Fri 23 Oct 2026.
- **Superseded by DR-0045 (2026-10-02):** decisions needed between gates are batched into one consolidated list per week, so they fit inside 3 hours.

## DR-0005 Spend

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved: P7 approved by the owner 2026-10-03 (DR-0052); the rest resolved by DR-0030 |
| Owner label | §2 Spend |
| HANDOFF v1.1 | §2, §4 (rule 4) |

**Context.** HANDOFF v1.0 §2 proposed "£[X] for model usage; runners £0" (PRD §54). Standard GitHub-hosted runners are free for public repositories. Larger runners are billed even on public repositories.

**Options considered.** Not applicable: the owner supplied the values.

**Decision.**

> Spend: runners £0 (public repo, standard runners only); model spend capped at £150 for Phase 0.

**Consequences.**

- Standard GitHub-hosted runners only. The workflow policy test (rule W6, DR-0006) rejects every runner label outside the allowlist, so larger and self-hosted runners cannot be selected.
- Free-plan limits fit the study: 4 vCPU and 16 GB per Windows runner, 20 concurrent jobs, 6 h per job, 256 jobs per matrix.
- No paid services and no package publishing.
- **Decided by Claude under DR-0045 (2026-10-03):** Claude flags token-heavy work, such as multi-agent research or verification passes, before running it, and gives a spend estimate in each gate report.
- **Approved by the owner 2026-10-03 (P7; DR-0052):** Claude cannot meter its own model spend exactly, so the owner monitors the £150 cap. Claude's estimates in each gate report support it.

## DR-0006 Runner images

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; labels updated inline |
| Owner label | §2 Runner |
| HANDOFF v1.1 | §2, §7.1, §9.2 |

**Context.**

- HANDOFF v1.0 requires an explicit label, never `windows-latest`. The §9.2 skeleton used `windows-2022`.
- Desk research (runners dimension) found that `windows-2025` has served the "windows-2025-vs2026" image (Windows Server 2025 with Visual Studio 2026) since 8–15 June 2026. GitHub calls that image name a temporary label.
- `windows-2022` is GA, and no deprecation is announced.
- ARIA-AT's NVDA pipeline and the Scream install are proven on `windows-2025`. NVDA's own CI covers both labels.
- Arm64 runners are unusable: there is no Chrome for Testing win-arm64 build, and processes cannot take the foreground.

**Options considered.**

| Option | Source | Outcome |
|---|---|---|
| `windows-2022` for everything | HANDOFF v1.0 §9.2 skeleton | Rejected for gates; kept as an M1a probe |
| `windows-2025` for gates; probe both labels in M1 | Claude's first-session reply | Adopted, with paired legs added |
| Gates on both labels | Verifier note (runners) | Not adopted: doubles the gate runs to about 1,000 |
| `windows-latest` or `windows-2025-vs2026` | n/a | Excluded: moving or temporary labels |

**Decision.**

> Runner: windows-2025 for gates; windows-2022 as an M1a probe only. Run paired legs within one dispatch so they share an image version.

**Consequences.**

| Use | Label |
|---|---|
| G1 and G2 runs | `windows-2025` |
| M1a probe only (DR-0025) | `windows-2022` |
| Linux CI (lint, typecheck, unit tests) | `ubuntu-24.04`: **Decided by Claude under DR-0045 (2026-10-03)**. The owner did not name a Linux label; an explicit LTS label follows the "never `*-latest`" rule. |

- Workflow policy rule W6 allows exactly `ubuntu-24.04` and `windows-2025`, plus `windows-2022` only in a workflow file whose name contains "probe".
- The NVDA-absent and NVDA-present legs (DR-0020) run within one workflow dispatch.
- Weekly image rollouts can still put jobs in one dispatch on different image versions. Every run records `ImageOS`, `ImageVersion` and the image name in its environment manifest (`imageName`, DR-0026).
- **Decided by Claude under DR-0045 (2026-10-03):** each job checks that its image matches the expected label and fails fast if not. Reports flag pairs whose legs ran on different image versions.
- HANDOFF §9.2: `runs-on` becomes `windows-2025`.

## DR-0007 Toolchain pins

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved: by DR-0030, and the `yaml` dev dependency (P5) by Claude under DR-0045 (2026-10-03); labels updated inline |
| Owner label | Approved as proposed (toolchain) |
| HANDOFF v1.1 | §7 (prerequisites), §7.1, §9 (M0) |

**Context.**

- **Chrome for Testing (CfT).** Stable is 154.0.8037.92, but no released Playwright has been tested against it; Playwright 1.64 (Chromium 155) is not out. Playwright 1.63.0 bundles CfT 153.0.8010.12 for win64 and was released alongside Chrome 153.
- **TypeScript.** 7.0.2 is the latest release, but typescript-eslint 8.71.0 requires TypeScript below 6.1.0.
- **Node.** Node 24.21.0 is Active LTS and enters maintenance on 2026-10-20. Node 26 becomes LTS on 2026-10-28, so `lts/*` would switch to 26 in the middle of Phase 0.

**Options considered.**

| Question | Options | Outcome |
|---|---|---|
| Chrome | CfT 154.0.8037.92 (current Stable; untested pairing) or CfT 153.0.8010.12 (Playwright 1.63.0's bundled build) | 153.0.8010.12 |
| TypeScript | 7.0.2 (breaks typescript-eslint) or 6.0.3 | 6.0.3 |
| Node | `lts/*`, 26.x, or 24.21.0 exact | 24.21.0 exact |

**Decision.**

> Playwright 1.63.0 with CfT 153.0.8010.12; TypeScript 6.0.3; Node 24.21.0 exact.

**Consequences.**

- `.nvmrc` holds `24.21.0`. CI uses `actions/setup-node` with `node-version-file: .nvmrc`. `env/env.lock.json` records Node, TypeScript, Playwright and CfT.
- Playwright and CfT are upgraded only as a pair, and only between phases.
- **Decided by Claude under DR-0045 (2026-10-03):** implementation choices made in M0, except the `yaml` pin, which the next bullet covers. The packages are the dev toolchain HANDOFF §9 M0 names (TypeScript, ESLint, Vitest, zod) and their companions: typescript-eslint, which the owner-approved smaller fixes name (DR-0024); @eslint/js, published by the ESLint project; and @types/node, type declarations that do not execute. They are dev-only, exactly pinned, and run in CI with a read-only token and no secrets (DR-0030).
- **Decided by Claude under DR-0045 (2026-10-03); resolves P5:** the `yaml` 2.9.1 dev dependency, which the workflow policy test uses to parse workflow files. It already runs in M0 CI. On 2026-10-03 it was first listed as pending owner item P5, because no owner-authored text names it and DR-0045's security category covers new third-party code that runs in CI. It was then resolved without escalation, for these reasons:
  - it is dev-only and has no dependencies of its own;
  - it is exactly pinned, with a sha512 integrity hash in `package-lock.json`, and carries the ISC licence;
  - it runs only in the Linux CI job (`ci.yml`), under `contents: read` with no secrets, and parses only this repository's workflow files;
  - it exists to enforce hard rule 3 (supply chain): the workflow policy test uses it to check Action pins, permissions, secrets and input handling.

| Item | Choice |
|---|---|
| Build | None. Node runs `.ts` directly through its native type stripping. `tsconfig.json`: strict, `noUncheckedIndexedAccess`, `erasableSyntaxOnly` (no enums, namespaces or parameter properties), `verbatimModuleSyntax`, `allowImportingTsExtensions` (relative imports end in `.ts`). ESM (`"type": "module"`). |
| Exact pins | zod 4.6.5, vitest 5.0.3, eslint 10.11.0, typescript-eslint 8.71.0, @eslint/js 10.0.1, yaml 2.9.1 (P5, decided by Claude under DR-0045, 2026-10-03), @types/node 24.19.1 (plus typescript 6.0.3). |
| Lockfile | `package-lock.json` committed; CI runs `npm ci`. |
| Local machine | The owner's machine runs Node 26; CI runs 24.21.0. `package.json` declares `engines.node >=24.21.0`. CI is authoritative. |
| Browser check (M1) | At launch, assert `browser.version() === "153.0.8010.12"` and fail fast on a mismatch. |

## DR-0008 GitHub Action pins

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Amended by | DR-0046 (2026-10-03): `actions/setup-dotnet` approved (P2); its env.lock status is `pinned` |
| Proposed parts | One pending owner item (P2, `actions/setup-dotnet`), marked inline; the rest resolved by DR-0030 |
| Owner label | HANDOFF hard rule 3, §9.2 |
| HANDOFF v1.1 | §4 (rule 3), §9.2 |

**Context.** HANDOFF hard rule 3 requires every third-party Action to be pinned to a full commit SHA, and §9.2 requires the SHAs to be resolved with `gh api` and recorded here.

**Options considered.** Pinning is mandatory. The only choice was which release of each action to pin.

**Decision.** HANDOFF v1.0 (owner-authored):

> Pin every third-party Action to a full commit SHA with the version in a comment.

> Resolve every `<FULL_SHA>` with `gh api` and record it in `docs/DECISIONS.md`.

**Resolved pins (2026-10-02).**

| Action | Version | Commit SHA | Tag type | Used by |
|---|---|---|---|---|
| actions/checkout | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | lightweight | `ci.yml` (M0); NVDA workflows (M1+) |
| actions/setup-node | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` | lightweight | `ci.yml` (M0); NVDA workflows (M1+) |
| actions/upload-artifact | v7.0.1 | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | lightweight | NVDA workflows (M1+) |
| actions/setup-dotnet | v6.0.0 | `a98b56852c35b8e3190ac28c8c2271da59106c68` | lightweight | Listener build (M2, DR-0019), once the owner approves P2; until then env.lock marks it `pending-owner` and no workflow may use it |

**How they were resolved.**

1. `gh api repos/<owner>/<repo>/releases/latest` gave the latest release tag.
2. `gh api repos/<owner>/<repo>/git/ref/tags/<tag>` returned `object.type` = `commit` for all four, so the tags are lightweight and `object.sha` is the commit SHA. An annotated tag would need one more step (`git/tags/<sha>`); none of these needed it.
3. The decisions writer re-ran step 2 for all four on 2026-10-02 and got the same SHAs.

**Consequences.**

- Every `uses:` line carries the full SHA and a trailing `# v<semver>` comment. Workflow policy rule W1 enforces this.
- `env/env.lock.json` records the same four pins. A test fails if any workflow uses a SHA that differs from env.lock.
- **Decided by Claude under DR-0045 (2026-10-03):** pending owner item P2 is enforced in code, not only by procedure. `env/env.lock.json` gives `actions/setup-dotnet` the status `pending-owner`, and the env.lock schema (`harness/src/policy/envLock.ts`) requires a `pending-owner` pin's note to name its pending owner item (here P2). The env.lock cross-check test (`harness/test/policy/envLock.test.ts`) requires every action that a workflow or local action uses to have the status `pinned`. No workflow could use `actions/setup-dotnet` until the owner approved P2 and its env.lock status became `pinned`. This only restricts. The owner approved P2 on 2026-10-03 (DR-0046), so `actions/setup-dotnet` is now `pinned`; the mechanism stays for any future `pending-owner` Action.
- Not used: `guidepup/setup-action`, which was archived on 2026-09-26 (DR-0009).
- The desk research also resolved `actions/setup-python` v7.0.0, `actions/download-artifact` v8.0.1 and `actions/cache` v6.1.0. None is adopted. Adopting any action needs a new row here and in env.lock.
- Relevant behaviour: checkout v7 refuses fork-PR checkouts under `pull_request_target` and `workflow_run`, and policy rule W5 forbids both triggers anyway. Every checkout sets `persist-credentials: false` (W8).
- Pinning the latest release of each action as of 2026-10-02:
  - **Decided by Claude under DR-0045 (2026-10-03)** for `actions/checkout`, `actions/setup-node` and `actions/upload-artifact`. The owner-authored HANDOFF v1.0 skeleton already names these three, so the version choice adds no new third-party code.
  - `actions/setup-dotnet`: approved by the owner on 2026-10-03 (P2, a security item under DR-0045; DR-0046).
- Not adopted in Phase 0: `actions/cache`, which the NVDA cache in DR-0009 would have needed (DR-0030).

## DR-0009 NVDA provisioning via Guidepup (setup-action archived)

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; labels updated inline |
| Owner label | D2 (provisioning) |
| HANDOFF v1.1 | §7.1, §8.1, §9.2 |

**Context.**

- The HANDOFF §9.2 skeleton uses `guidepup/setup-action`. That repository was archived on 2026-09-26 (re-checked with `gh api` on 2026-10-02: `archived: true`).
- Its last release, 0.21.0, bundles @guidepup/setup 0.23.0. That installs NVDA 2026.1.1 using an older registry-based scheme.
- Guidepup 0.29 and later find NVDA in a manifest-driven cache (`%LOCALAPPDATA%\guidepup\nvda\all\<asset version>\extracted\nvda.exe`). With setup-action plus Guidepup 0.35, `nvda.start()` would throw `ERR_NVDA_NOT_INSTALLED`.
- The supported path is the pinned setup CLI, which reads the pinned Guidepup package's manifest.

**Options considered.**

| Option | Outcome |
|---|---|
| `guidepup/setup-action` 0.21.0 with an older Guidepup (NVDA 2026.1.1) | Rejected: archived and unsupported |
| `npx @guidepup/setup@0.29.1 install` with `@guidepup/guidepup` pinned exactly | Adopted |
| Portable NVDA built from the official installer, with a committed config | Not needed while a Guidepup-published NVDA build is used |

**Decision.** (D2, first bullet; the full D2 decision is in DR-0011.)

> Guidepup 0.35.0 for provisioning, lifecycle and input only, started with nvda.start({capture:false}).

**Pins.**

| Component | Pin | Notes |
|---|---|---|
| @guidepup/guidepup | 0.35.0 | MIT. Tag 0.35.0 → `d5c9d8059954f214b82689dffcb5866a9b55fe6c`. Its `manifest.json` selects the NVDA asset. |
| NVDA asset | guidepup/nvda `0.2.1-2026.2` (NVDA 2026.2) | `guidepup-nvda-0.2.1-2026.2.zip`, 105,770,260 bytes, sha256 `7df0ca3c1c9e8c6521bc7553486ca360ed6f0b4f9bdbd6603131e38b5c1497a1`. The setup CLI verifies the checksum. |
| @guidepup/setup | 0.29.1 | MIT. The CLI that installs the asset: `npx @guidepup/setup@0.29.1 install`. **Decided by Claude under DR-0045 (2026-10-03):** this pin and this install path. They follow from D2, because setup-action cannot provision Guidepup 0.35.0. The archived setup-action in the owner-authored v1.0 skeleton bundled `@guidepup/setup` 0.23.0, so this is a version change of a component already in the plan, from the same publisher, and the asset it fetches is checksum-verified. |
| NVDA Remote Access relay | TLS on 127.0.0.1:6837, channel `guidepup` | Built into NVDA since 2025.1. Guidepup and the harness tap (DR-0011) both connect as leaders. |

- NVDA 2026.2 is the only NVDA build published for Guidepup 0.34 and 0.35, and it is NVDA's latest stable release (2026-08-31). Guidepup's `NVDA.version` returns the asset string, so the real NVDA version is read separately, from `nvda.exe` or the NVDA log.

**Relay-certificate shelf life.**

- The relay certificate in the Guidepup build is valid from 2026-06-28 to 2027-06-28.
- NVDA regenerates its relay certificate once 30 days or fewer remain, which is from about 2027-05-29. Guidepup trusts only the CA in the extracted build. From about that date, a pinned Guidepup 0.35.0 with NVDA 0.2.1-2026.2 is expected to fail with `ERR_NVDA_CANNOT_CONNECT`.
- This is inferred from source and has not been tested. Exact pinning therefore has a shelf life. Phase 0 (to 6 Nov 2026) and the Phase 1 decision (27 Nov 2026) fall well inside it. Any work after about May 2027 must re-pin or patch.
- **Decided by Claude under DR-0045 (2026-10-03):** the harness tap verifies the relay's certificate against the CA in the pinned, checksum-verified NVDA asset, the same trust anchor Guidepup 0.35.0 uses for the same relay. It adds no trust beyond what the owner-approved Guidepup (D2) already places in that CA, and nothing is added to any certificate store, so it is not a new trust step under DR-0045's security test. If the relay presents any other certificate, the tap refuses to connect. Reading the CA or fingerprint from NVDA's session directory after each NVDA start, as first proposed, is **not adopted in Phase 0**: it would be a new trust step (a security item under DR-0045), and it would not extend the shelf life, because Guidepup itself trusts only the CA in the extracted build.

**Consequences.**

- The HANDOFF §9.2 setup-action step is replaced by `npm ci` (with Guidepup pinned exactly) followed by `npx @guidepup/setup@0.29.1 install`. @guidepup/guidepup and @guidepup/setup are added to `package.json` in M1.
- `env/env.lock.json` records `guidepup` 0.35.0, `guidepupSetup` 0.29.1, and `nvda` {version 2026.2, guidepupAsset 0.2.1-2026.2, sha256}, all with status `pinned`.
- **Decided by Claude under DR-0045 (2026-10-03):** operating notes from the desk research, with the outcome of each.

| Note | Reason | Outcome |
|---|---|---|
| Cache `%LOCALAPPDATA%\guidepup`, keyed on the manifest sha256 | Saves about 10–15 s and 105 MB per job. Needs `actions/cache`, which is not yet pinned (DR-0008). | Not adopted in Phase 0: it would add a new Action pin, a security item under DR-0045. The cost is about 10–15 s per NVDA job. |
| Keep the cache root path free of spaces | Guidepup spawns NVDA with `shell: true` and unquoted paths. | Adopted for the Guidepup install root, cache or not |
| Run NVDA only on ephemeral hosted runners | NVDA's self-hosted relay binds all interfaces, and the Guidepup build uses a public password and a private key committed to a public repo. The risk is negligible on hosted runners but real on a developer machine. A README note is requested (outside this writer's files). | Adopted: it only restricts exposure, and matches D3's rule for the same runners |

- NVDA (GPL-2.0-or-later) is downloaded at CI time, runs as a separate process, and never appears in artefacts or archives (DR-0015).

## DR-0010 D1 Clock alignment

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved: P6 approved by the owner on 2026-10-03 (DR-0049); the rest resolved by DR-0030 |
| Owner label | D1 |
| Amended by | DR-0039 (2026-10-02): NVDA log lines may be bucketed into segments via the wall anchor for parity counts and diagnostics, never for latency, ordering or validity |
| HANDOFF v1.1 | §7.3 (rewritten), §8.3, §9 (M2 and the G2 report), §10.2 |

**Context.**

- HANDOFF v1.0 §7.3 had every collector use the system precise wall clock. A `document.title` nonce pulse at each segment boundary estimated offsets, and a segment with skew over 20 ms was INCONCLUSIVE. The desk research (timing, events, premises and playwright dimensions, with verifier corrections) found this cannot work.
- **No title event.** On Windows, Chrome fires no accessibility event for a `document.title` change: the root's name change is suppressed and DOCUMENT_TITLE_CHANGED is unused on that platform. The only observable signal is the top-level window caption NAMECHANGE, which is coalesced on a timer of up to 200 ms.
- **Pipeline latency, not skew.** Every collector on one runner reads the same OS clocks, so real inter-process skew is close to zero. The pulse would mostly measure Chrome's accessibility pipeline latency, which includes Blink's batching of non-immediate updates, at most once per 150 ms after load.
- **Coarse clocks.** Node's `Date.now()` and `performance.timeOrigin` are anchored to the coarse Windows clock (about 15.6 ms). So are Python 3.12's `time.time()` and `time.monotonic()`.
- **QPC is shared.** QueryPerformanceCounter (QPC) is consistent across processes on one machine. Chrome uses QPC-based TimeTicks on Hyper-V guests.
- **Page time.** `performance.now()` is TimeTicks clamped to 100 µs. CDP `Performance.getMetrics` exposes `Timestamp` and `NavigationStart` on the TimeTicks base, so page time can be mapped to QPC without a round-trip term.
- **Consequence.** Under §7.3 as written, most segments would be INCONCLUSIVE for reasons unrelated to clocks.

**Options considered.**

| Option | Source | Outcome |
|---|---|---|
| §7.3 as written: wall clock, title pulse, 20 ms skew rule | HANDOFF v1.0 | Rejected (see context) |
| Read the title nonce from the document object's NAMECHANGE | Playwright researcher | Refuted by the verifier: Chrome never fires that event on Windows |
| One precise system clock everywhere; INCONCLUSIVE only if alignment uncertainty exceeds 2 ms; title change kept as a join marker and latency measure | Claude's first-session proposal | Approved with changes |
| QPC as the only timebase; page mapping by a 16-ping minimum-RTT estimate; limits of 0.5 ms (native), 2 ms (page) and 1 ms (drift), plus low-resolution TimeTicks and rAF stalls | Timing researcher | Basis of the owner's limits |
| Page mapping from CDP `Performance.getMetrics` (`Timestamp`, `NavigationStart`) | Timing verifier | Adopted, verified once against the 16-ping estimate |

**Decision.**

> - QPC is the only timebase: process.hrtime.bigint() in Node, Stopwatch.GetTimestamp() in C#. Add a test forbidding Date.now(), performance.timeOrigin and time.time() in collectors. Keep one precise wall-clock anchor per process for human-readable times only.
> - Page time: map performance.now() to QPC via CDP Performance.getMetrics (Timestamp, NavigationStart). Verify once in M1a against a 16-ping minimum-RTT estimate. Recompute after every full navigation.
> - INCONCLUSIVE only for: native self-test disagreement > 0.5 ms; page-mapping uncertainty > 2 ms; drift > 1 ms within a segment; low-resolution TimeTicks; rAF gap > 100 ms.
> - Remove the document.title marker entirely. Join logs by QPC and orchestrator-issued segment IDs. Measure latency from the canary events themselves.

**Consequences.**

- **Timebase.** Every timestamp is QPC nanoseconds since boot.
  - Node: `harness/src/clock/qpc.ts` `qpcNowNs()` wraps `process.hrtime.bigint()` and throws if the value is not a safe integer. 2^53 ns is about 104 days of uptime, far beyond an ephemeral runner's life.
  - C#: `Stopwatch.GetTimestamp()`, converted to nanoseconds.
- **Wall anchor.** One per process: `harness/src/clock/wallAnchor.ts` `captureWallAnchor()` returns `{ qpcNs, wallIso }`, and the listener has an equivalent `WallAnchor.cs`. These are the only harness files allowed to read the wall clock. They are used for human-readable times only, never for measurement, alignment or validity. **Approved by the owner 2026-10-02 (DR-0030):** the Node anchor reads `Date.now()`, which on Windows can trail UTC by 0 to about 15.6 ms, so it falls short of D1's "precise" until M2; from M2 the Node process adopts the (QPC, wall) pair measured by the listener's `WallAnchor.cs`. Because the anchor only labels times for humans, this does not affect any measurement.
- **Enforcement.** The owner's test is implemented as the clock policy (DR-0027).
- **Page time.** Page QPC is approximately `NavigationStart + performance.now()`, using CDP `Performance.getMetrics`. It is recomputed after every full navigation; `pushState` keeps the time origin. M1a verifies two things against a 16-ping minimum-RTT estimate (LAB_NOTEBOOK): whether `NavigationStart` equals the page time origin, and whether Chrome TimeTicks share an epoch with `process.hrtime.bigint()` and `Stopwatch`.
- **Validity limits.** `harness/src/runner/validity.ts` exports `CLOCK_LIMITS = { nativeSelfTestDisagreementMs: 0.5, pageMappingUncertaintyMs: 2, segmentDriftMs: 1, maxRafGapMs: 100 }`, plus a flag for low-resolution TimeTicks. Following the owner's ">", a value strictly greater than its limit is INCONCLUSIVE and a value equal to the limit passes (DR-0021, DR-0026).
- **`maxClockSkewMs` redefined.** **Approved by the owner 2026-10-02 (DR-0030; DR-0026 accepted with amendments):** the field stays required, but it now means `max(nativeSelfTestDisagreementMs, pageMappingUncertaintyMs)`, derived from the D1 limits. It is no longer a title-pulse skew. D1 itself does not mention the field.
- **Title marker removed.** No title nonce is emitted and no check uses one. The DOM timeline still records title mutations as ordinary DOM data, because K5 changes the title. The M1a title-latency probe is dropped (DR-0025).
- **Joins.** Logs are joined by QPC and by `StepEvidence.segmentId`, which the orchestrator issues. Latency is measured from the canary events themselves, for example DOM mutation (page QPC) → WinEvent receipt → tap receipt. Pending owner item P4 (DR-0020): under Claude's proposal no WinEvent listener runs in G1 NVDA-present runs, so G1 would measure DOM-to-tap latency only (DOM mutation, page QPC → tap receipt), and the WinEvent step would apply only where the listener runs. Until the owner decides P4, the platform-focus method in the NVDA-present leg is open (DR-0024).
- **Speech tap.** It stamps on receipt in a worker thread, so Playwright's event loop cannot delay the stamps (DR-0011).
- How each quantity is computed. These definitions are to be finalised from M1a data. The status of each row follows DR-0030.

| Quantity | Method | Status |
|---|---|---|
| Native self-test disagreement | Named-pipe ping-pong between the Node orchestrator and each native collector, both sides stamping QPC. Disagreement is the largest offset estimate beyond zero. | **Approved by the owner 2026-10-02 (DR-0030)** |
| Page-mapping uncertainty | How far the CDP `Timestamp` falls outside an `hrtime` bracket around the `getMetrics` call, plus the 100 µs clamp. Cross-checked against the 16-ping estimate in M1a. | Approved by the owner 2026-10-03 (P6; DR-0049) |
| Segment drift | Change in the page mapping between the start and the end of a segment. | Approved by the owner 2026-10-03 (P6; DR-0049) |
| Low-resolution TimeTicks | Histogram of `performance.now()` steps: about 100 µs steps means QPC; steps of 1 ms or more means low resolution. | Approved by the owner 2026-10-03 (P6; DR-0049) |
| rAF gap | Largest gap in an in-page `requestAnimationFrame` heartbeat during the segment. | Approved by the owner 2026-10-03 (P6; DR-0049) |
| NVDA log parity | Computed from message counts per NVDA run, as D2 requires: tap `speak` messages against the log's "Speaking" lines (DR-0011). NVDA log wall times are display-only and never used to order or align evidence. Any finer join of log lines (per segment or per line) would need the wall anchor or in-log markers for alignment, which goes beyond D1's "human-readable times only", so it would need an owner decision first. | **Superseded in part by DR-0039:** the owner allows bucketing log lines into segments via the wall anchor for parity counts and diagnostics, never for latency, ordering or validity. Per-run parity stays. |

## DR-0011 D2 Speech capture (incl. PRD §48 AT Driver teardown)

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; labels updated inline |
| Owner label | D2 |
| Amended by | DR-0039 (2026-10-02): tap-versus-log parity may also be counted per segment by bucketing log lines via the wall anchor; never for latency, ordering or validity |
| HANDOFF v1.1 | §5 (R4), §8.1 (rewritten), §9 (M1: M1c removed; G1 report contents), §9.2, §12 (CLAUDE.md commands) |

**Context.**

- HANDOFF v1.0 §8.1 asked for two adapters, Guidepup and the W3C ARIA-AT NVDA AT Driver, each scored on six criteria. If neither exposed timestamps and cancellation, the owner would choose between a minimal GPL add-on and dropping interruption and queueing from C's scope.
- **Guidepup's own capture distorts results.** It records no timestamps and surfaces no cancels. It keeps speech only inside a command window; the default mode keeps just the first speak message. It presses Control (NVDA's stop-speech key) before every captured command.
- **The relay carries everything NVDA queues.** Guidepup talks to NVDA over NVDA's built-in Remote Access relay. That relay sends every queued speech sequence (with its priority) and every global cancel to every connected leader. A harness-owned, receive-only Apache-2.0 client can therefore record all of it with receipt timestamps, without NVDA code.
- **AT Driver fails two criteria by design** (see the teardown below).

**Options considered.**

| Option | Source | Outcome |
|---|---|---|
| (a) Guidepup native capture | HANDOFF v1.0 §8.1 | Rejected as the instrument. Its limits are documented in the teardown table. |
| (b) Guidepup for provisioning, lifecycle and input, plus a harness relay tap for speech | Claude's first-session proposal; guidepup research | Adopted |
| (c) AT Driver adapter (M1c) on NVDA 2025.3.3, with the version confound labelled | Claude's first-session proposal | Cut. No AT Driver runs in Phase 0. |
| (d) Build a minimal GPL add-on now | HANDOFF v1.0 §8.1 fallback | Deferred under the owner's add-on rule |
| (e) NVDA's own DEBUG log | Guidepup, timing and premises research | Adopted as a second record |

**Decision.**

> - Guidepup 0.35.0 for provisioning, lifecycle and input only, started with nvda.start({capture:false}). Speech comes from our receive-only Apache-2.0 relay tap, run in a worker thread and attached before each segment.
> - Second record: NVDA log at DEBUG (speech, speechManager, events, UIA, synthDriver). Copy %TEMP%\nvda.log after every NVDA run and report message-count parity with the tap.
> - Cut M1c. No AT Driver runs in Phase 0. Record the desk evaluation in DECISIONS.md as the PRD §48 teardown. Reopen only if the tap fails G1.
> - GPL add-on rule for G1: propose it only if K7 shows drops or interruptions that the tap and debug log cannot classify, AND we still want interruption or ordering in H2. Owner approval required.

**Consequences.**

- **Instrument.** Guidepup 0.35.0 (DR-0009), started with `nvda.start({capture:false})`, which turns capture off globally so no stop-speech Control presses are injected. Speech comes from the tap.
- **The tap.** It connects over TLS to 127.0.0.1:6837 and joins channel `guidepup`.
  - It is receive-only: it sends only `join` and `protocol_version`, because the relay forwards anything else to NVDA's follower and to Guidepup.
  - It frames messages by newline and counts parse failures; Guidepup's own client parses each TLS chunk and silently drops split or merged messages.
  - It runs in a worker thread and stamps QPC on receipt.
  - It is attached before each segment, because a leader joining or leaving makes NVDA play wave cues.
- **What the tap records.**

| Message | Recorded as |
|---|---|
| `speak` (sequence and priority) | `Utterance` with `priority` NORMAL, NEXT or NOW (DR-0026) |
| `cancel` (global `cancelSpeech`) | `StepEvidence.speechCancels[]` (DR-0026) |
| Guidepup's outbound `key` messages | Key dispatch timestamps on the shared clock |

- **Blind spots.** The stream holds what NVDA queued, not what was voiced (DR-0022).
  - Spri.NOW interruptions call the synth's `cancel()` directly and send no message.
  - Stale focus speech removed inside NVDA's speech manager sends no message.
  - Repeated cancels are suppressed until new speech is queued.
  - Nothing is sent when speech mode is not "talk".
  - NEXT-priority preemption can be inferred from the priority field.
- **Second record.** NVDA's log at DEBUG level, with the categories speech, speechManager, events, UIA and synthDriver.
  - The Guidepup build ships with logging off, so the level is set through Guidepup's start settings.
  - NVDA renames `nvda.log` to `nvda-old.log` at each start, so `%TEMP%\nvda.log` is copied after every NVDA run.
  - Each run reports message-count parity: tap `speak` messages against the log's "Speaking" lines.
  - **Decided by Claude under DR-0045 (2026-10-03):** M1a measures the CPU and latency overhead of DEBUG logging on NVDA's main thread. It is a diagnostic inside M1a's existing jobs.
- **Input.** OS-level, through NVDA's `SendInput` (Guidepup key commands over the relay). Never `page.keyboard` or `page.click` in an AT segment. Avoid Guidepup's `type()`, which uses one `cscript` SendKeys process per character. Every key NVDA processes cancels speech by default, so no keypress occurs inside an observation window (DR-0013).
- **Scope removed.** M1c (estimated at 4–10 CI round trips) is removed from M1 and from the workflow skeleton. The schema keeps the `"atdriver"` adapter name for compatibility with §10.2 (DR-0026).

### PRD §48 teardown: W3C AT Driver (desk evaluation)

PRD §48 calls for a hands-on evaluation of several tools, W3C AT Driver among them, before implementation. The owner directed that this desk evaluation be recorded as that teardown for Phase 0. It rests on source reading and on third-party CI logs (DR-0029), not on runs by this project. Only technical criteria are recorded here.

**What "AT Driver" means here.**

| Component | State on 2026-10-02 |
|---|---|
| Specification `w3c/at-driver` | Editor's Draft, on the Recommendation track (Browser Testing and Tools WG); commit `7156eec` (2026-09-04) |
| NVDA implementation: Prime-Access-Consulting `nvda-at-automation` (NVDA add-on plus Go server) | HEAD `f0caacb` (2025-12-15); no tags or releases; add-on code unchanged since 2023-12 apart from manifest bumps |
| `w3c/aria-at-automation-driver` (SAPI voice) | Archived 2024-06-24; not a candidate |

**Adapter criteria (HANDOFF §8.1).** Ratings are from the desk research, with the verifiers' corrections applied. "n/5" scores are the researchers'.

| Criterion | Guidepup native capture | Guidepup + harness relay tap | AT Driver (PAC nvda-at-automation add-on) |
|---|---|---|---|
| Completeness | **Partial (2/5).** Keeps speech only inside a command window. The default mode keeps only the first speak message; full mode stops after 1 s of silence. Drops speech between commands, priority and non-string items. Parses each TLS chunk without newline framing, so split or merged messages can be lost silently. | **Likely 4/5 (inferred; not yet run).** Everything NVDA queues through `SpeechManager.speak`, with priority. Excludes speech when speech mode is not "talk" and anything removed inside the speech manager. This is queued speech, not confirmed audio. | **Partial (3/5).** Captures plain-text strings at the synth's `speak()`. Splits one sequence into several events; drops commands and priority; replays the backlog on connect; newline framing risk. The verifier added that only utterances actually pushed to the synth are seen, so text cancelled while still queued is missed and text cut off mid-utterance is captured in full. It under-reports relative to what was heard, while the tap over-reports. |
| Per-utterance timestamps | **No (1/5).** None in the API, and the client is a private field. | **Yes, receipt time** on QPC in a worker thread. Lag after queueing is estimated at tens of ms. The verifier notes this is an upper bound on transport lag, not a measured error. | **No (1/5).** Nothing in the spec's data model, the add-on or the Go server. Only harness arrival time is possible (key press to receipt: p50 45 ms, p90 102 ms, including NVDA processing). |
| Cancel visibility | **No** in the API; cancels are handled internally. Capture mode presses Control before every command, so most observed cancels are Guidepup's own. | **Partial.** Global `cancelSpeech` is visible. NOW-priority interrupts and silent removal of stale focus speech are invisible. Repeat cancels are suppressed until new speech is queued. Priority makes NEXT preemption inferable. The NVDA DEBUG log is the second record. | **No (1/5).** The capture synth does not override `cancel()`, and the spec has no such event (w3c/at-driver#94, open). |
| OS-level input | **Yes (4/5).** NVDA calls `SendInput`, and NVDA's keyboard hook processes injected keys (`handleInjectedKeys` defaults to true). No delivery acknowledgement. Avoid `type()`. | **As native (4/5)**, with capture off globally. The tap also receives Guidepup's outbound key messages, which gives dispatch timestamps. | **Partial (2/5).** Keys are emulated inside NVDA (`emulateGesture`), driven from the add-on's HTTP thread. Unbound keys go through `keybd_event` inside `ignoreInjection()`, bypassing NVDA's keyboard hook. Verifier: bound gestures are queued to NVDA's main thread, so the HTTP 200 arrives before execution. Failures do appear in `nvda.log` as stdout warnings. |
| Version pinning | **Yes (4/5).** The exact Guidepup version selects the NVDA asset by manifest and sha256. | **As native (4/5)**, plus the tap pinned in-repo. The relay protocol is not a stable public API, so it must be re-validated on any NVDA change. Relay-certificate shelf life (DR-0009). | **Good (4/5) in principle**: by commit SHA (no tags). But the add-on is incompatible with NVDA 2026.x, so it needs NVDA 2025.2 or 2025.3.3. Bocoup's prebuilt zips are hand-built with baked config. Verifier: the official NVDA 2025.2 release has no GitHub asset, so a GitHub sha256 digest exists only for 2025.3.3 (and 2026.2). |
| CI setup reliability | **Good (4/5) on the evidence available.** One CLI step with a checksum. Verifier re-tally of Guidepup CI: 121 passed and 3 flaky out of 124 Chromium executions, all in one `type()` test; one root cause is unknown. Maintainers run with `retries: 5` and lenient assertions. | **Not rated separately.** It inherits Guidepup's setup, plus an untested tap. Whether a second leader works reliably on a runner can only be settled empirically. | **Good (4/5).** Proven on hosted `windows-2022` and `windows-2025` (ARIA-AT); NVDA ready in about 7 s; jobs about 96% successful (370/384 dev, 29/32 main). Verifier: 5 of 7 consistency reports reached 98% or more, mostly on NVDA 2024.4.1, measured per test × run. Needs a virtual audio device: its capture synth subclasses eSpeak and cannot load without one. |

**Why AT Driver was cut.**

1. **No timestamps.** The spec's only output event carries text only, and neither the add-on nor the Go server adds a time.
2. **No cancel events.** The capture synth does not override `cancel()`, and the spec issue on interruptions (w3c/at-driver#94) is open. K7 and any interruption claim would be unmeasurable.
3. **Input injected inside NVDA, not through its keyboard hook.** Unbound keys bypass the hook entirely. That is not the OS-level input path HANDOFF §7.2 requires, and a dropped gesture looks exactly like missed speech.
4. **Incompatible with NVDA 2026.x.** The add-on's manifest is last tested against 2025.2, while NVDA 2026.1 and later only accept add-ons tested against 2026.1 or later. Running it would need NVDA 2025.x while the Guidepup path runs 2026.2. That confounds adapter with NVDA version (and with Python 3.11 against 3.13, and 32-bit against 64-bit).
5. **Needs an audio device.** The capture synth subclasses eSpeak, which opens the audio device when it loads. Without an endpoint, NVDA falls back to another synth and AT Driver captures nothing.
6. **Upstream timestamp work has stalled.** The ARIA-AT community group minutes of 2025-09-08 said a timestamp for speech events would be specified, but 13 months later there is no PR or spec text. Waiting for the spec is not a plan.

Its strength is recorded too. ARIA-AT's CI is the most proven recipe for running NVDA on hosted runners, and the Scream audio install adopted in DR-0012 comes from it.

**Reopening condition.** AT Driver is reconsidered only if the tap fails G1. Reopening needs a new decision record. It would also need NVDA 2025.x (or a manifest bump plus validation for 2026.x) and an explicit label for the NVDA-version confound.

**GPL add-on rule.**

- The add-on is proposed to the owner only if both conditions hold: K7 shows drops or interruptions that the tap and the debug log cannot classify, **and** interruption or ordering is still wanted in H2. Building it needs owner approval (HANDOFF §4 rule 12 and §8.1).
- **Decided by Claude under DR-0045 (2026-10-03), as the form any proposal would take:** if it is ever approved, its form would be as follows. Building the add-on still needs owner approval under the rule above.

| Aspect | Proposal |
|---|---|
| Location and licence | `adapters/nvda-addon/`, GPL-2.0-or-later (DR-0001) |
| Origin | Written from scratch. The PAC add-on is GPL-2.0 without "or later" and contains an Apache-2.0 Selenium fragment, so none of it is copied. |
| Design | A global plugin on `pre_speechQueued`, `pre_synthSpeak`, `speechCanceled` and `pre_speechCanceled`, `synthIndexReached` and `synthDoneSpeaking`, stamped with `perf_counter_ns` (QPC). A wrapper around the active synth's `cancel()` would expose NOW-priority interrupts. It streams over a local socket. |
| Boundary | The harness never imports it. |

## DR-0012 D3 Virtual audio

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; labels updated inline |
| Owner label | D3 |
| Amended by | DR-0040 (2026-10-02): M1a checks the Authenticode signature status, not just the thumbprint, and records signer and issuer. If the driver proves self-signed, a statement is added to this record that authenticity rests on trust on first use, and the owner is asked. DR-0047 (2026-10-03): signature pinned from M1a; installed in both legs with an in-repository SetupAPI installer, never the archive's unsigned `devcon.exe`. |
| HANDOFF v1.1 | §7.1, §8.1, §9.2 (install step) |

**Context.**

- GitHub-hosted Windows images have no audio device, and the runner-images maintainers do not pre-install virtual hardware. NVDA's audio path assumes one.
- eSpeak opens the device when it loads. oneCore opens it on first speech and can stall. The silence synth sends no index or done notifications.
- NVDA pushes the next utterance only when the synth reports end of utterance. Without a real-time synth, queueing, cancel and NOW-resume behaviour (K7) describe an artefact rather than what users hear.
- The tap captures upstream of the synth, so text and cancel visibility do not depend on audio. Queue realism and the synth choice (DR-0017) do.
- ARIA-AT's NVDA workflow on `windows-2025` installs Scream 3.6 "to avoid exceptions later". On image `windows-2025-vs2026` 20260824.214.3 it logged "Drivers installed successfully." after a step of about 2 s.

**Options considered.**

| Option | Outcome |
|---|---|
| Stock runner, no audio device | Rejected: synth stall or fallback; queue timing not realistic |
| Scream 3.6 with its own signer certificate in TrustedPublisher (ARIA-AT recipe) | Proposed by Claude in the first session; adopted |
| Scream 3.8 or 4.0 | Rejected: devcon hangs on `windows-2022` without a self-signed certificate (runner-images#2528, scream#215) |
| VB-Cable | Not pursued; no CI precedent found |
| GPL capture voice that simulates pacing | Not pursued; GPL code and no real synth |
| Drop queueing and interruption claims | Partly adopted for H2 (DR-0022), but audio is still needed for a realistic synth and queue |

**Decision.**

> - Scream 3.6 (proven on windows-2025), pinned by SHA-256. Verify the signer certificate thumbprint before adding it to TrustedPublisher. Ephemeral hosted runners only.
> - Preflight: at least one audio endpoint and Audiosrv running, otherwise INCONCLUSIVE.
> - Add a product-risk note: requiring a kernel driver in customer CI is a hard sell.

**Pin.**

| Field | Value |
|---|---|
| Version | Scream 3.6 (MS-PL) |
| URL | https://github.com/duncanthrax/scream/releases/download/3.6/Scream3.6.zip |
| Size | 514,388 bytes |
| SHA-256 | `25ea5e778b4e6995a98d448b9b5f6d321f681663f1aeeec69d8e63183d008b19` |
| Signer thumbprint | `null`, status `pending-M1a` in `env/env.lock.json` |

DR-0040 adds `signatureStatus`, `signer` and `issuer` to the `scream` entry in `env/env.lock.json`, each `null` with status `pending-M1a` until M1a records them.

**Trust on first use (TOFU).** GitHub publishes no digest for this 2020 release asset. Claude downloaded `Scream3.6.zip` from the GitHub release on 2026-10-02 and computed the SHA-256 above. The hash proves later downloads match what was fetched that day; it does not prove the file is authentic. Authenticity rests on the driver signature. M1a records the signer certificate thumbprint of the driver before anything is added to TrustedPublisher. The thumbprint entry in env.lock then moves from `pending-M1a` to `pinned`. **Superseded in part by DR-0040:** M1a checks the Authenticode signature status and records signer and issuer as well as the thumbprint. Claude pins the thumbprint without asking only if the chain is valid and the signer is consistent with the release; otherwise the owner is asked.

**Product-risk note** (owner's instruction): requiring a kernel driver in customer CI is a hard sell. Phase 0 uses one to make NVDA's queueing realistic on hosted runners. Any later product design that depends on it carries that adoption risk. Gate reports should therefore say whether a finding depends on the virtual audio device.

**Consequences.**

- **Decided by Claude under DR-0045 (2026-10-03), as implementing D3; step 4 amended by DR-0040:** the install sequence, following ARIA-AT's recipe.
  1. Start the audio services.
  2. Download the pinned URL and verify its SHA-256.
  3. Extract the archive.
  4. Read the driver's signer certificate thumbprint and compare it with the value recorded in M1a. Fail on a mismatch. **Superseded by DR-0040:** check the Authenticode signature status, signer, issuer and thumbprint against env.lock, and fail on any mismatch.
  5. Add the certificate to `LocalMachine\TrustedPublisher`.
  6. Run `devcon install` on the Scream INF.

  M1a records where `devcon` comes from. If it is neither on the runner image nor in the pinned Scream archive, fetching it is a new download and a hard-rule-12 security item (DR-0045).
- Ephemeral GitHub-hosted runners only: never a developer machine, never a self-hosted runner.
- **Preflight `audioOk`.** At least one audio endpoint and Audiosrv running; otherwise the run is INCONCLUSIVE with code `AUDIO` (DR-0021). The manifest records `audio: { endpointCount, audiosrvRunning, driver }` (DR-0026). **Approved by the owner 2026-10-02 (DR-0030):** the check applies to the nvda-present leg only, because only that leg needs a synth and audio path. D3 names no leg (DR-0021).
- Scream is downloaded at CI time and never redistributed or archived (DR-0015).
- M1a probes `windows-2022` as well. If Scream 3.6 does not install there, that affects only the probe, not the gates (DR-0006).

## DR-0013 D4 Canaries (incl. pre-registered K6a rule)

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | One pending owner item (P1, the creation-time regression family), marked inline; the rest resolved by DR-0030 |
| Owner label | D4 |
| Amended by | DR-0036 (2026-10-02): K6 and K7 run in both legs; the K6a rule is evaluated on the NVDA-present leg. DR-0037 (2026-10-02): the insertion-to-content delay grading replaces the same-batch flag, so "flagged" in the K6a and K6b B2 signatures now refers to that grading. DR-0046 (2026-10-03): the creation-time family membership as listed here is approved (P1). |
| HANDOFF v1.1 | §9 (M1, M2 run counts), §9.1 (rewritten) |

**Context.** HANDOFF v1.0 §9.1 defined K1–K7. The desk research (premises, events and timing dimensions) found some premises partly wrong.

- **K6 holds only for non-alert regions.** Polite and status regions inserted already populated are not announced, which NV Access states is by design (nvaccess/nvda#14591). An inserted, populated `role="alert"` **is** announced, at NOW priority.
- **K2's signature was wrong.** An existing alert receiving content produces EVENT_OBJECT_LIVEREGIONCHANGED plus IA2 TEXT_INSERTED, not EVENT_SYSTEM_ALERT.
- **Keys cancel speech.** Every key NVDA processes cancels speech by default, so K7 cannot be key-triggered.
- **Batching hides short fills.** Blink sends non-focus accessibility updates at most once per 150 ms (350 ms before load). An "insert empty, then fill" within that window looks identical to "inserted already populated".
- **K7 has two outcomes.** NVDA does not cancel on a programmatic focus move to a button: the polite text is queued first. It does cancel when focus moves from browse mode into an edit field.
- **Named regions duplicate speech.** A named live region also has its name spoken on every LIVEREGIONCHANGED.

**Options considered.**

| Option | Source | Outcome |
|---|---|---|
| K1–K7 as in HANDOFF v1.0 | HANDOFF v1.0 | Replaced |
| Split K6 into K6a (polite or status, silent) and K6b (alert, announced); K2 expects LIVEREGIONCHANGED; K7 timer-triggered; K5 without title dependency; unnamed regions; fill delays over 350 ms | Claude's first-session proposal | Approved, with additions |
| K6a with three variants; K7a/K7b split; K6e fill-delay sweep; gating set K1–K5; pre-registered K6a rule | Owner; each addition matches a recommendation in the premises research | Adopted |

**Decision.**

> - K6a (expected silent): populated region inserted as aria-live=polite, as role=status, and as aria-live=assertive.
> - K6b (expected announced at NOW priority): populated role=alert inserted.
> - K7a: timer-driven polite update, then programmatic focus to a button. Expected: polite text, then the button, no cancel.
> - K7b: same, but focus moves into a text input from browse mode. Expected: cancel.
> - K6e (exploratory): insert empty, fill after 0 ms, one rAF, 50, 100, 150, 250 and 500 ms; 10 runs per delay.
> - Your edits stand: K2 expects LIVEREGIONCHANGED plus TEXT_INSERTED; K5 has no title dependency; live regions carry an id but no accessible name; fill delays over 350 ms; no keypress inside any observation window.
> - Gating canaries: K1–K5. K6 and K7 are record-only at 20 runs each.
> - Pre-register: if any K6a variant is announced in more than 1 of 20 runs, the creation-time regression family leaves the M3 catalogue.

**Canary set (Phase 0).** The expected outcomes and B2 signatures below are those of HANDOFF v1.1 §9.1. The owner decided the K6a, K6b, K7a and K7b outcomes, the K6e sweep, the K2 signature and K5's lack of a title dependency (D4). The other outcome and signature cells carry HANDOFF v1.0 §9.1 (owner-authored) forward, with the v1.0 K6 and K7 family signatures applied to each variant; the K6e signature is HANDOFF v1.1's description of what is recorded, not a criterion. **The G1 and G2 criteria are these HANDOFF §9.1 outcomes and signatures until M2 confirms the signatures on the runner;** any change to them needs a new record.

| ID | Behaviour | Expected NVDA outcome (tap) | Expected B2 signature | Role | Runs |
|---|---|---|---|---|---|
| K1 | Polite live region present and empty at load; text inserted 500 ms after activation | Utterance containing the text within 3 s | Text mutation inside the live region; live-region or text events | Gating | 50 valid |
| K2 | Existing `role="alert"` receives content | Utterance containing the text | EVENT_OBJECT_LIVEREGIONCHANGED plus IA2 TEXT_INSERTED on the alert; not EVENT_SYSTEM_ALERT | Gating | 50 valid |
| K3 | Programmatic focus to a named button | Name and role conveyed | `focusin`; focus WinEvent | Gating | 50 valid |
| K4 | Dialog with `aria-labelledby` opens; focus moves to its first control | Dialog name conveyed | Dialog inserted or shown; focus events | Gating | 50 valid |
| K5 | `pushState` route change; focus moves to `h1`; title updated | `h1` text conveyed | History event; focus events. No title dependency | Gating | 50 valid |
| K6a | Populated region inserted as `aria-live=polite`, as `role=status`, and as `aria-live=assertive` (3 variants) | Silent | Insertion with non-empty content flagged | Record-only | 20 per variant |
| K6b | Populated `role="alert"` inserted | Announced at NOW priority | Insertion with non-empty content flagged | Record-only | 20 |
| K6e | Region inserted empty; filled after 0 ms, one rAF, 50, 100, 150, 250 and 500 ms | Not pre-declared; recorded per delay | Insertion, then text mutation; recorded per delay | Record-only (exploratory) | 10 per delay (70) |
| K7a | Timer-driven polite update, then programmatic focus to a button | Polite text, then the button, no cancel | Mutation followed by focus events | Record-only | 20 |
| K7b | As K7a, but focus moves into a text input from browse mode | Cancel | Mutation followed by focus events | Record-only | 20 |

- **Priority.** The tap records each utterance's priority (DR-0011, DR-0026). Priority is part of an expected outcome only for K6b ("announced at NOW priority", the owner's D4). For K1–K5 it is recorded, not scored.

**Desk-research predictions (DR-0029), decided by Claude under DR-0045 (2026-10-03) as predictions only; signatures fixed in M2.** These come from Chromium source and Chromium's own Windows event-dump tests. They are not gate criteria. M2 checks them in the NVDA-absent leg (DR-0020), and any signature change they lead to is made by a new record.

| ID | Predicted platform events | Predicted priority (recorded, not scored) |
|---|---|---|
| K1 | IA2 TEXT_INSERTED, SHOW, REORDER and EVENT_OBJECT_LIVEREGIONCHANGED on or under the region. Whether the empty region is in the tree (event on the root or on its parent) is open. | NORMAL |
| K2 | EVENT_OBJECT_LIVEREGIONCHANGED plus IA2 TEXT_INSERTED on the alert; no EVENT_SYSTEM_ALERT. Spoken without an "alert" prefix. | NEXT |
| K3 | EVENT_OBJECT_FOCUS on the button (requires Chrome in the foreground) | — |
| K4 | SHOW on the dialog, then FOCUS | — |
| K5 | FOCUS on the `h1`; no accessibility event for `pushState`. The caption NAMECHANGE is optional and delayed. | — |
| K6a | SHOW on the region root; REORDER and TEXT_INSERTED on the (non-live) parent; no LIVEREGIONCHANGED | — |
| K6b | EVENT_SYSTEM_ALERT | (NOW is the owner's expected outcome, above) |
| K6e | Whether LIVEREGIONCHANGED appears, per delay | — |
| K7a | Mutation and focus, usually in one batch; Chrome fires FOCUS before LIVEREGIONCHANGED within a batch | — |
| K7b | As K7a | — |

**Design rules for all canary pages.**

- Live regions carry an `id` but no accessible name.
- Fill delays are over 350 ms wherever an announcement is expected. K6e deliberately sweeps shorter delays.
- No keypress occurs inside any observation window. K7 is timer-triggered.
- **Decided by Claude under DR-0045 (2026-10-03):** K2 is matched on text only; no "alert" prefix is expected or required. This applies K2's expected outcome as written ("Utterance containing the text") and changes no criterion.
- K5 does not depend on the title.

**Pre-registered K6a rule.**

- Recorded now, before M3 and before any K6a data exist. Applied when the G1 data are available.
- How the rule is read. The status of each term follows DR-0030.

| Term | Reading | Status |
|---|---|---|
| Trigger | Any one K6a variant (polite, status or assertive) announced in 2 or more of its 20 runs | **Decided by Claude under DR-0045 (2026-10-03):** restates the owner's "more than 1 of 20" |
| Announced | The tap records a `speak` message containing the region's text within the observation window | **Approved by the owner 2026-10-02 (DR-0030)**; amended by DR-0036: evaluated on the NVDA-present leg |
| Creation-time regression family | Mechanisms that rely on content present at region creation being silent: a conditionally rendered, populated toast or status message; unhiding a populated region with `display:none` or the `hidden` attribute; re-mounting or re-keying the region element on each update; filling a region within the same accessibility snapshot as its insertion; downgrading a conditionally rendered message from `role=alert` to `role=status`; switching `aria-live` from off to polite on an already-populated node | Approved by the owner 2026-10-03 (P1; DR-0046) |
| Not affected | Mechanisms that do not depend on K6 stay eligible: `aria-busy` left true; an `aria-hidden` or `inert` ancestor; `aria-live=off` descendants; `aria-relevant` exclusions; focus moving into an edit field and cancelling speech (K7b); loss of foreground | Approved by the owner 2026-10-03 (P1; DR-0046) |

**Consequences.**

- Gates are computed on K1–K5 only (DR-0021). K6 and K7 are reported, with Wilson intervals, as exploratory observations.
- The schema exports `CanaryId`, `GATING_CANARIES` (K1–K5) and `RECORD_ONLY_CANARIES` (K6a, K6b, K6e, K7a, K7b) (DR-0026).
- Run volume: 250 valid gating runs per gate leg (plus up to 5% INCONCLUSIVE), and 190 record-only runs (K6a 60, K6b 20, K6e 70, K7a 20, K7b 20) in each leg in which they run. The legs for K6 and K7 are not yet decided. **Superseded by DR-0036:** K6 and K7 run in both legs (speech outcomes from the NVDA-present leg, B2 signatures from the NVDA-absent leg), so 190 record-only runs per leg, 380 in all.
- K7 results feed the GPL add-on rule (DR-0011) and the H2 scope (DR-0022).

## DR-0014 D5 PRD publication

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030 (the digest-only tripwire); label updated inline |
| Owner label | D5 |
| HANDOFF v1.1 | Header ("Source of truth"), §5 (R7), §10.1, §12 (CLAUDE.md) |

**Context.** The PRD (v0.3) contains commercial and product content across many sections, not only §43–45 and §51. Only material in the six categories D5 names (hypotheses, arms, verdict rules, taxonomy, canaries, thresholds) may be drawn from it, and §48 may be cited only for its technical evaluation criteria. Publishing the PRD unedited in a public repository would reveal that content before the owner's commit–reveal. HANDOFF v1.0 §5 R7 already places the commercial hash outside this repository.

**Options considered** (Claude's message of 2 October 2026):

| Option | Description |
|---|---|
| (a) | Publish the PRD as is. |
| (b) | Publish a copy with the commercial sections removed, and keep the full version locally, untracked by git. |
| (c) | Keep the PRD out of the repository entirely. |

**Decision.**

> - Commit a technical protocol extract only: hypotheses, arms, verdict rules, taxonomy, canaries, thresholds.
> - The full PRD and all commercial content stay out of the repository. I will publish a hash of the commercial protocol separately.
> - Map this to whichever of your options matches.

**Mapping.** This is option **(b)**, in a narrower form. The committed copy is a technical extract (hypotheses, arms, verdict rules, taxonomy, canaries, thresholds) rather than the whole PRD minus the commercial sections, and the full version stays local and untracked.

**Consequences.**

| Item | Rule |
|---|---|
| In-repo reference | `docs/PRD-v0.3-technical-extract.md` (committed) |
| Full PRD | Kept locally at `docs/PRD-v0.3.md`, gitignored, never committed |
| Commercial protocol | The owner publishes its hash separately, outside this repository |

- Enforcement:
  - The `.gitignore` entry for `docs/PRD-v0.3.md`.
  - The repository safety test fails if `docs/PRD-v0.3.md` appears among the files git would commit.
  - A commercial-content tripwire in the same test fails if any committed file contains a set of commercial phrases. The repository holds only SHA-256 digests of the phrases (`harness/src/policy/tripwire.ts`), and the owner keeps the plain-text list privately; short phrases can be recovered from digests by dictionary search, so this keeps the list from casual readers rather than making it secret (approved by the owner 2026-10-02, DR-0030).
- Writers never quote or summarise commercial content in any repository file. Where it must be mentioned, it is called "commercial content".
- HANDOFF references to `docs/PRD-v0.3.md` mean the local copy. The in-repo reference is the extract.

## DR-0015 D6 Evidence archive

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; label updated inline |
| Owner label | D6 |
| HANDOFF v1.1 | §7 (inner loop), §9 (gate deliverables), §11 |

**Context.** From 1 October 2026, the retention limit for public repositories (at most 90 days) also deletes workflow runs, checks and commit statuses, not only artefacts and logs. G1 and G2 evidence would therefore disappear. HANDOFF hard rule 2 forbids releases and tag pushes without approval. HANDOFF's definition of done requires every Phase 0 claim to be reproducible from recorded artefacts with one command.

**Options considered.**

| Option | Outcome |
|---|---|
| GitHub Release assets | Rejected: needs a release and a tag, and write permission |
| A workflow commits bundles to the repository | Rejected: workflows would need `contents: write` |
| Compressed bundles with a SHA-256 manifest on a `results` branch, no releases | Claude's first-session proposal; approved with changes |

**Decision.**

> - Orphan branch `results`.
> - Archive from the local machine with gh run download at each gate, so workflows stay contents: read.
> - Per-gate tar.zst bundles under 50 MB, with a SHA-256 manifest of run IDs, image versions and pinned versions.
> - Never include NVDA binaries.

**Consequences.**

- `results` is an orphan branch with no shared history with `main`, and it is never merged into `main`. Pushing it is a branch push, which hard rule 2 permits.
- At each gate, Claude runs `gh run download <run-id> -D artefacts/<run-id>` locally (`artefacts/` is gitignored), then builds the bundle and manifest and commits them to `results`.
- Every workflow keeps `permissions: contents: read` (policy rule W2). No workflow writes to the repository.
- Each bundle is a `tar.zst` under 50 MB. Its SHA-256 manifest lists run IDs, image versions (`ImageOS`, `ImageVersion`, image name) and pinned versions (the env.lock contents).
- NVDA binaries are never included, to avoid redistributing GPL binaries and to keep bundles small.
- Artefacts must be downloaded before their retention expires. The HANDOFF skeleton uses `retention-days: 30`, and the public-repository maximum is 90. Run IDs and log URLs in the manifest will eventually stop resolving; the bundle is the evidence of record.
- **Decided by Claude under DR-0045 (2026-10-03):** these implement D6; the binary exclusion only restricts.

| Item | Proposal |
|---|---|
| Layout | One directory per gate on `results`: `G1/`, `G2/` |
| Manifest | Also records each bundle's own SHA-256 and the harness commit |
| Binary exclusion | The bundling script refuses any `*.exe`, `*.dll`, `*.nvda-addon` or `nvda/` path |
| Size | If a gate's evidence exceeds 50 MB, split it into several bundles each under 50 MB rather than drop evidence. Any reduction is recorded in the manifest. |
| Reproduction | `npm run report:phase0 -- <extracted bundle>` reproduces every gate claim |

## DR-0016 D7 SHA pinning and repository settings

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030 (the W1 and W4 extensions); label updated inline |
| Owner label | D7 |
| HANDOFF v1.1 | §4 (rules 2, 3) |

**Context.** GitHub can require every Action to be pinned to a full commit SHA, which enforces hard rule 3 at repository level. On 2 October it was off. Claude's first session also observed that the workflow token was already read-only by default and that workflows could not approve pull requests. Claude offered to switch the setting on or leave it to the owner.

**Options considered.** Claude changes the settings (needs admin scope), or the owner changes them.

**Decision.**

> - I will enable it myself, plus: read-only default workflow permissions, no Actions-created PRs, approval for all outside contributors' workflows, and protection on main.
> - Do not request admin scope.

**Consequences.** These are owner actions. Claude requests no admin scope and does not change or audit repository settings.

| Setting (owner action) | State recorded here |
|---|---|
| Require Actions pinned to a full-length commit SHA | Owner to enable; not verified by Claude |
| Default workflow permissions: read-only | Owner to enable; not verified by Claude |
| GitHub Actions cannot create (or approve) pull requests | Owner to enable; not verified by Claude |
| Approval required for workflows from all outside contributors | Owner to enable; not verified by Claude |
| Branch protection on `main` | Owner to enable; not verified by Claude |

- The in-repository workflow policy (W1–W8) and the env.lock consistency test enforce pinning and read-only permissions independently of these settings.
- **Approved by the owner 2026-10-02 (DR-0030):** two extensions to the workflow policy beyond the M0 specification. W1 also forbids `..` in local `uses:` paths and checks the steps of local composite actions. W4 also forbids secrets reached through expressions and `if:` values, `github.token`, `github['token']`, a computed index into `github`, and passing the whole `github` context. Both are listed in the rule table in `harness/src/policy/workflowPolicy.ts`.

## DR-0017 D8 NVDA channel and voice

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; labels updated inline |
| Owner label | D8 |
| Amended by | DR-0041 (2026-10-02): the declared rate is NVDA's default rate for eSpeak NG (30 on a fresh configuration), rate boost off; the `nvda.ini` committed in M1 must not set an eSpeak rate |
| HANDOFF v1.1 | §7.1, §8.1, §8.2 |

**Context.**

- **Channel.** NVDA's Chromium channel is set by `[UIA] allowInChromium`: 0 is the default (resolved to "only when necessary"), 1 is only when necessary, 2 is UIA, 3 is No (IA2). Under "only when necessary", NVDA uses IA2 when it can inject into Chrome and silently falls back to UIA otherwise. Under UIA, generic live regions with no name would likely be silent, so K1 would fail for reasons unrelated to the canary.
- **Injection.** With value 3, a failed injection leaves NVDA on out-of-process IA2 with no Chrome-side stub. A positive injection marker is therefore needed. "Buffer load took" needs a remotely created virtual buffer.
- **Synth.** The Guidepup build pins oneCore with voice en-GB GeorgeM, rate 100 and rate boost on (6×). That voice is likely absent on Server images. NVDA's fallback order is oneCore → eSpeak → silence, and oneCore can stall without an audio device.
- **Noise.** The Guidepup build also opens the Speech Viewer at startup, and NVDA's default reads the page on load, both of which add noise.

**Options considered.**

| Question | Options | Outcome |
|---|---|---|
| Channel | Default (`0`, silent fallback); `2` (UIA); `3` (IA2) | `3`, with an injection preflight |
| Synth | oneCore (Guidepup default); eSpeak NG (bundled); silence; a custom GPL capture synth | eSpeak NG |

**Decision.**

> - [UIA] allowInChromium=3. Preflight requires nvdaHelperRemote\*.dll loaded in chrome.exe and "Buffer load took" in the log, otherwise INCONCLUSIVE.
> - Synth: eSpeak NG bundled with NVDA, declared rate, rate boost off, say-all on page load off, speech viewer off. Record the active synth; any fallback is INCONCLUSIVE.

**Consequences.**

- **Committed NVDA configuration**, passed through Guidepup's start settings:

| Setting | Value |
|---|---|
| `[UIA] allowInChromium` | `3` |
| Synth | eSpeak NG |
| Rate (added by DR-0041) | Not set; NVDA's default for eSpeak NG applies (30 on a fresh configuration). The effective rate is recorded per run. |
| Rate boost | Off |
| Say-all on page load (`autoSayAllOnPageLoad`) | Off |
| Speech Viewer at startup (`showSpeechViewerAtStartup`) | Off |
| Logging | DEBUG with the D2 categories (DR-0011) |

- **Superseded by DR-0041 (2026-10-02):** the numeric rate. It is declared in the committed configuration and in env.lock before G1, proposed from M1a observations. (DR-0041: NVDA's default rate for eSpeak NG, rate boost off; the rate comes back to the owner only if M1a gives a reason.)
- **Decided by Claude under DR-0045 (2026-10-03):** "Report dynamic content changes" stays at NVDA's default (on). No NVDA setting changes; NVDA's defaults stand unless the owner decides otherwise.
- **Injection preflight `injectionMarkerOk`.** `nvdaHelperRemote*.dll` is loaded in `chrome.exe` (module list) **and** "Buffer load took" appears in the NVDA log. Otherwise the run is INCONCLUSIVE with code `NVDA_INJECTION_MARKER`.
- **Synth record `synthOk`.** The active synth is read from the NVDA log (synthDriver category) and recorded in `EnvManifest.synth` (name, voice, rate, rateBoost). Any fallback is INCONCLUSIVE with code `SYNTH_FALLBACK`.
- `EnvManifest.nvdaChannel` records `"IA2"` (DR-0026).
- For the nvda-present leg, a missing check counts as failed (DR-0021).
- HANDOFF §7.1 previously asked only to record the "Use UI Automation to access … Chromium based browsers" setting. It is now pinned to No (`3`).

## DR-0018 D9 Arm B evidence

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Owner label | D9 |
| HANDOFF v1.1 | §8.4, §10.1 (collectors) |

**Context.**

- Playwright removed `page.accessibility` in v1.57.
- `ariaSnapshot` is Playwright's own JavaScript role and name computation, with no live, atomic, relevant or busy properties. An Arm B based only on it could not see live-region semantics, which would inflate what B2 and C appear to add.
- CDP `Accessibility.getFullAXTree` returns Chrome's real tree with those properties. Its domain is marked experimental, which is another reason to pin Chrome.
- `@axe-core/playwright` `analyze()` opens and closes a new tab in the same context, which steals focus in headed Chrome.

**Options considered.**

| Question | Options |
|---|---|
| Tree source | `ariaSnapshot` only; `getFullAXTree` only; both |
| axe placement | Same context near AT segments; legacy single-page mode; its own browser context |

**Decision.**

> D9 Arm B: Chrome's tree via CDP Accessibility.getFullAXTree (including live, atomic, relevant, busy), plus ariaSnapshot for structure. axe runs in its own browser context, never near an AT segment.

**Consequences.**

- Arm B evidence is axe, `getFullAXTree` (including live, atomic, relevant and busy) and `ariaSnapshot`. These go in `StepEvidence.axe`, `axTree` and `ariaSnapshot`, captured at segment boundaries and never during an AT segment.
- axe runs in its own browser context, away from any AT segment. Arms A and B are produced in the NVDA-absent leg (DR-0020).
- CfT stays pinned at 153.0.8010.12 because the CDP Accessibility domain is experimental (DR-0007).

## DR-0019 D10 B2 scope and listener

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved: P2 approved by the owner 2026-10-03 (DR-0046), P3 approved by the owner 2026-10-03 (DR-0052); the rest resolved by DR-0030 |
| Owner label | D10 |
| Amended by | DR-0037 (2026-10-02): the K6 insertion-to-content delay grading is approved and replaces the v1.0 same-batch flag now DR-0046 (2026-10-03): `actions/setup-dotnet` for the listener build is approved (P2). DR-0052 (2026-10-03): the listener's event scope is approved (P3), with the final ranges confirmed from M2 data. |
| HANDOFF v1.1 | §5 (R4), §7.1, §8.2 (rewritten), §10.1 |

**Context.** Desk research (events dimension, with verifier corrections):

- Every web-content MSAA and IA2 WinEvent comes from Chrome's browser process, on the `Chrome_RenderWidgetHostHWND` window.
- **IA2 calls.** Out-of-process IA2 calls need proxy registration. NVDA registers it only inside the processes it injects. If the listener registered its own in-process proxy, B2 output would differ between NVDA-present and NVDA-absent runs.
- **UIA is always on.** Chrome's UIA provider cannot be turned off since M151. Chrome raises UIA events only for clients it has seen register. NVDA's global UIA registrations change which UIA events a B2 listener receives, even when NVDA itself uses IA2.
- **Focus needs the foreground.** Chrome suppresses focus events whenever its window lacks focus.
- **AXMode.** Passing a value to `--force-renderer-accessibility` locks the accessibility mode, so NVDA's detection cannot change it mid-run.
- **Language.** The HANDOFF default was Python 3.12 with comtypes. Python 3.12's `time.time()` is coarse, and the GIL makes concurrent WinEvent and UIA threads harder. Claude's first session recommended C# on .NET 8: typed COM interop that compiles on Linux CI, and a precise clock.

**Options considered.**

| Question | Options | Outcome |
|---|---|---|
| Listener language | Python 3.12 + comtypes (HANDOFF default; needs four mitigations); C# | C# |
| .NET version | 8 (preinstalled; Claude's first proposal); 9; 10 | 10: .NET 8 and 9 leave support on 10 Nov 2026 |
| IA2 identity | `QueryService(IA2)` with a system-wide IA2 proxy built from the BSD IDL; MSAA plus UIA property reads only | MSAA plus UIA only |
| UIA events | Scored channel (needs a registration probe or `--disable-features=UiaEventOptimization` merged into Playwright's list); diagnostic only | Diagnostic only |
| AXMode | Bare `--force-renderer-accessibility` (mode can still change); `=screen-reader` (locked) | `=screen-reader` |
| Renderer sandbox | Playwright default (`--no-sandbox`); `chromiumSandbox: true` | `true` |

**Decision.**

> - WinEvents are the primary channel: MSAA and IA2 event IDs, plus EVENT_SYSTEM_ALERT, EVENT_SYSTEM_FOREGROUND and EVENT_OBJECT_DESCRIPTIONCHANGE.
> - Resolve identity through MSAA and UIA property reads (AutomationId, LiveSetting, AriaRole). No IA2 QueryService and no proxy registration.
> - UIA events are diagnostic only.
> - Lock AXMode with --force-renderer-accessibility=screen-reader in every arm and log it. chromiumSandbox: true.
> - Listener in C# on .NET 10 (.NET 8 and 9 leave support on 10 Nov 2026).

**Consequences.**

- **Listener.** C# on .NET 10 in `listener/`: SDK 10.0.401, runtime 10.0.12. It is built with `actions/setup-dotnet` v6.0.0 (DR-0008). The owner approved that Action on 2026-10-03 (P2; DR-0046), and its env.lock status is `pinned` (DR-0008). `listener/**/bin` and `obj` are gitignored. It stamps with `Stopwatch.GetTimestamp()`, and `listener/**/WallAnchor.cs` is its only allowlisted wall-clock reader (DR-0027).
- **Channels.** WinEvents are primary. UIA events are recorded with `channel: "UIA"` and `diagnostic: true`, and never form part of a G2 signature (DR-0026).
- **Identity.** Resolved through MSAA (role, name, state) and UIA property reads: AutomationId, which is the HTML id, LiveSetting and AriaRole. No IA2 QueryService and no proxy registration anywhere.
- **Text.** IA2 `get_newText` cannot work out of process, so inserted text is re-read after the event or taken from the DOM timeline.
- **Chrome flags.** `--force-renderer-accessibility=screen-reader` in every arm, logged per run. `env/env.lock.json` records `chromeFlags` and `chromiumSandbox: true`. The manifest records `axMode` and `chromeSandbox` (DR-0026). The harness passes no `--disable-features` of its own, because Chrome keeps only the last value of a repeated switch and would silently drop Playwright's list.
- **Focus.** Focus signatures need Chrome in the foreground, so the foreground handover and its preflight run in every leg (DR-0021, DR-0024).
- Listener design details, from the desk research. The status of each row follows DR-0030.

| Aspect | Proposal | Status |
|---|---|---|
| Hooks | Global out-of-context hooks over narrow ranges, filtered by the browser PID (from CDP `SystemInfo.getProcessInfo`) and window class: EVENT_SYSTEM_ALERT (0x0002), EVENT_SYSTEM_FOREGROUND (0x0003), EVENT_OBJECT_SHOW–FOCUS (0x8002–0x8005), STATECHANGE (0x800A), NAMECHANGE (0x800C), DESCRIPTIONCHANGE (0x800D), VALUECHANGE (0x800E), LIVEREGIONCHANGED (0x8019), and the IA2 range (0x0101–0x0123). LOCATIONCHANGE is excluded. Final ranges are fixed in M2. | **Approved by the owner 2026-10-03 (P3; DR-0052).** The ranges, filters and exclusions set which events B2 observes, while D10 names "MSAA and IA2 event IDs" without exclusions |
| Threads | The hook thread only stamps QPC and enqueues. A resolver thread reads properties and keeps a cache, so later HIDE events can still be labelled. | **Decided by Claude under DR-0045 (2026-10-03)** |
| Browser-UI alerts | Excluded by `hwndClass` (`Chrome_WidgetWin_1` against `Chrome_RenderWidgetHostHWND`) | **Approved by the owner 2026-10-03 (P3; DR-0052)**, with the hooks |
| Linux CI | The listener compiles in Linux CI (Windows targeting enabled), so interop errors surface before a Windows run | **Decided by Claude under DR-0045 (2026-10-03)**: a free standard runner, with minutes that are not material. Installing the .NET SDK there depends on P2 |
| Mutation timeline: shadow DOM | Patch `Element.prototype.attachShadow` before page scripts run, so every shadow root is observed (HANDOFF §8.3) | **Approved by the owner 2026-10-02 (DR-0030)** |
| Mutation timeline: ordering | Call `takeRecords()` inside the focus, history and title handlers before logging them, so records keep causal order (HANDOFF §8.3) | **Approved by the owner 2026-10-02 (DR-0030)** |
| Mutation timeline: K6 delay grading | Record the insertion-to-content delay and treat a fill within Chrome's accessibility serialisation window (one non-immediate serialisation per 150 ms after load, 350 ms before) as possibly indistinguishable from a populated insertion. Until the owner approves this, the v1.0 same-batch flag is the rule in force (HANDOFF §8.3; basis DR-0029) | **Approved by the owner 2026-10-02 (DR-0030).** The sentence about the same-batch flag is **superseded by DR-0037**: the grading replaces the flag now |

## DR-0020 D11 Separate legs

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | One pending owner item (P4, collectors in the NVDA-present leg), marked inline; the rest resolved by DR-0030 |
| Owner label | D11 |
| Amended by | DR-0031 (2026-10-02): C uses the NVDA-absent B2 evidence, as D does; legs are combined at item level, each from its own repetitions, and repetition indices are never paired across legs DR-0046 (2026-10-03): the collectors in the NVDA-present leg and its MSAA-only focus read are approved (P4). |
| HANDOFF v1.1 | §7.4, §8.4 (rewritten), §9 (M2) |

**Context.**

- HANDOFF v1.0 §8.4 derived A, B, B2 and C from one instrumented run with NVDA present. It planned an M5 test of whether A, B and B2 verdicts were invariant to NVDA's presence.
- The desk research found several ways NVDA's presence changes B2: Chrome's accessibility mode, which UIA events Chrome raises, IA2 call behaviour, activation through accessibility actions rather than keypresses, browse-mode scrolling, and load on Chrome's UI thread.
- Claude's first session listed this as the second-largest risk, with separate arms roughly doubling compute.

**Options considered.**

| Option | Outcome |
|---|---|
| Nested evidence from one NVDA-present run, with an M5 invariance test | Rejected |
| Separate legs: A, B and B2 without NVDA; C with NVDA | Adopted |

**Decision.**

> - A, B and B2 run without NVDA, as the product would; C runs with NVDA.
> - Drop the invariance test. The NVDA on/off B2 comparison becomes a 20-run diagnostic, not a G2 criterion.
> - D applies triggers to the NVDA-absent B2 evidence and takes NVDA evidence from the NVDA-present leg.

**Consequences.**

| Leg | NVDA | Evidence for |
|---|---|---|
| `nvda-absent` | Not running | A, B, B2 (axe, accessibility tree, ARIA snapshot, DOM timeline, WinEvents). G2 is measured here. |
| `nvda-present` | Running (Guidepup, tap, NVDA log) | C's NVDA evidence |

- `EvidencePackage.leg` records the leg. The nvda-present leg requires `injectionMarkerOk`, `audioOk` and `synthOk` in its preflight (DR-0026).
- The M5 invariance test is dropped. The HANDOFF M2 deliverable "a comparison of B2 signatures with NVDA present and absent" becomes a 20-run diagnostic, reported but not a G2 criterion.
- **Arm D.** `protocol/triggers.v1.json` is applied to the NVDA-absent B2 evidence, and NVDA evidence for triggered steps comes from the NVDA-present leg. D's runtime is still estimated from the durations of triggered NVDA segments.
- Both legs run within one dispatch (DR-0006). Running both legs roughly doubles the runs; runners stay free (DR-0005).
- Claude's proposals. The status of each row follows DR-0030.

| Item | Proposal | Status |
|---|---|---|
| C's combination rules | D11 does not say which leg's B2 evidence C's UNION and ADJUDICATED rules (R3) use. Proposal: the NVDA-absent B2 evidence, as for D, so that C and D differ only in trigger masking. Needs owner confirmation before M5. | **Approved by the owner 2026-10-02 (DR-0030)**; amended by DR-0031 (combination at item level) |
| Cross-leg matching | Evidence is matched across legs by item, side and repetition index (HANDOFF R8). | **Superseded by DR-0031:** legs are joined on the item; each leg derives its own per-item result from its own repetitions (k of n), and repetition indices are kept for traceability only |
| B2 collectors in the present leg | B2 collectors also run in the NVDA-present leg, for the 20-run diagnostic and for latency joins. Their output never feeds G2 or arm verdicts. | Approved by the owner 2026-10-03 (P4; DR-0046), narrowed: the WinEvent listener runs in the NVDA-present leg only for the owner's 20-run on/off diagnostic (D11), not in G1 runs. Its UIA property reads register it as a UIA client, which can change what Chrome raises (see Context of DR-0019), so it stays out of the leg that produces C's evidence. The in-page DOM timeline runs in both legs, because latency is measured from the canary events themselves (D1). Platform focus in the NVDA-present leg is verified by an MSAA-only focus read, with no UIA client (DR-0024). Present-leg B2 output never feeds G2 or arm verdicts. It went to the owner as P4 because which collectors run alongside NVDA changes which events are captured in the leg that produces C's evidence, so it is a hard-rule-12 item (what is measured). PR #1 item 1 covered which leg's B2 evidence C uses, not which collectors run in this leg. |
| Order | Leg order within a dispatch is counterbalanced or randomised with a recorded seed, as in §7.4. | **Decided by Claude under DR-0045 (2026-10-03)** |

## DR-0021 D12 Gates and validity

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; labels updated inline |
| Owner label | D12 |
| Amended by | DR-0032 (2026-10-02): a check may produce INCONCLUSIVE only if the thing being judged cannot cause it to fail; a post-block canary never converts observed outcomes. DR-0035 (2026-10-02): from M4 the side-aware rule replaces the Phase 0 rule. DR-0038 (2026-10-02): per-canary INCONCLUSIVE rates are reported and any canary above 10% is flagged; the pooled 5% limit stays the rule. |
| HANDOFF v1.1 | §2 (thresholds row), §5 (R7), §9 (M1 and M2 thresholds, gate reports) |

**Context.**

- HANDOFF v1.0 §9 set G1 at 98% success per canary on K1–K5, with 90–98% leading to a remediation round. G2 required each canary's B2 signature in at least 98% of runs. At 50 runs, 98% allows one failure per canary.
- Claude's first session noted that a perfect 50/50 shows only that the true rate is above 92.9% (Wilson lower bound). It also noted that the existing NVDA evidence comes from lenient, retried test suites.
- HANDOFF R7 asked the protocol to cap the INCONCLUSIVE rate. Hard rule 7 forbids converting INCONCLUSIVE by hand.

**Options considered.** The HANDOFF v1.0 per-canary 98% thresholds (exploratory, owner may tighten), or a pooled rule with per-canary caps. The owner replaced the thresholds.

**Decision.**

> D12 Gates (replace HANDOFF §9 thresholds):
> - INCONCLUSIVE is decided only by checks completed before the outcome is known (foreground HWND, injection marker, audio, clock, pre-canary), never by inspecting the outcome.
> - Validity: INCONCLUSIVE ≤ 5% of attempts.
> - G1: windows-2025, retries off, 50 valid runs per canary. Pooled K1–K5: at most 5 failures in 250, and no single canary with more than 3.
> - G2: the same structure for B2 signature matches in the NVDA-absent leg.
> - Report Wilson intervals throughout; label every Phase 0 result exploratory.

**Gate rules.**

| Gate | Runner | Leg | Unit of failure | Per canary (K1–K5) | Pooled K1–K5 | Validity |
|---|---|---|---|---|---|---|
| G1 | `windows-2025`, retries off | nvda-present | Expected NVDA outcome not observed | ≥ 50 valid runs; at most 3 failures | At most 5 failures (in 250 valid runs) | (attempts − valid) / attempts ≤ 0.05, pooled across K1–K5 (pooling approved by the owner 2026-10-02, DR-0030; D12 does not name the unit) |
| G2 | `windows-2025`, retries off | nvda-absent | Expected B2 signature not matched | ≥ 50 valid runs; at most 3 failures | At most 5 failures (in 250 valid runs) | (attempts − valid) / attempts ≤ 0.05, pooled across K1–K5 (pooling approved by the owner 2026-10-02, DR-0030; D12 does not name the unit) |

- **Retries off.** No test-runner retries and no re-running of failed attempts. Every attempt counts as valid or INCONCLUSIVE.
- **Boundaries.** 5 pooled failures pass and 6 fail; 3 failures on one canary pass and 4 fail; 50 valid runs pass and 49 fail; exactly 5% INCONCLUSIVE passes and anything above fails.

**INCONCLUSIVE comes only from pre-outcome checks.** Each run's preflight is evaluated from data completed before the outcome is known. The validity function takes preflight data only, never outcome data. Reason codes:

| Code | Condition | Source |
|---|---|---|
| `FOREGROUND_HWND` | Real foreground window is not the Chrome window, or platform focus is not on the declared anchor | D12, DR-0024 |
| `PRE_CANARY` | Pre-block canary failed | D12; HANDOFF §7.4 |
| `MANIFEST_INVALID` | Environment manifest invalid | HANDOFF §4 rule 11 |
| `CLOCK_NATIVE_SELF_TEST` | Native self-test disagreement > 0.5 ms | D1 |
| `CLOCK_PAGE_MAPPING` | Page-mapping uncertainty > 2 ms | D1 |
| `CLOCK_SEGMENT_DRIFT` | Drift > 1 ms within a segment | D1 |
| `CLOCK_LOW_RES_TIMETICKS` | Chrome on low-resolution TimeTicks | D1 |
| `CLOCK_RAF_GAP` | rAF gap > 100 ms | D1 |
| `NVDA_INJECTION_MARKER` | nvda-present only: `nvdaHelperRemote*.dll` not loaded or "Buffer load took" absent | D8 |
| `AUDIO` | nvda-present only (leg restriction approved by the owner 2026-10-02, DR-0030; D3 names no leg): no audio endpoint, or Audiosrv not running | D3 |
| `SYNTH_FALLBACK` | nvda-present only: the active synth is not the declared one | D8 |

- A value strictly greater than its limit is INCONCLUSIVE; a value equal to the limit passes. In the nvda-present leg, a missing check counts as failed.

**Wilson 95% reference values** (z = 1.959964, computed by Claude).

| Result | Interval |
|---|---|
| 50/50 | [0.9287, 1.0000] |
| 49/50 | [0.8950, 0.9965] |
| 47/50 (3 failures, the per-canary cap) | [0.8378, 0.9794] |
| 250/250 | [0.9849, 1.0000] |
| 245/250 (5 failures, the pooled cap) | [0.9540, 0.9914] |

Passing G1 or G2 is consistent with true per-canary rates well below 98%. The gates are falsification screens, not reliability demonstrations: HANDOFF §10.3 notes that about 600 clean runs are needed to show a rate of 0.5% or less.

**Consequences.**

- `harness/src/runner/validity.ts` implements the rule (DR-0026):
  - `CLOCK_LIMITS`
  - `inconclusiveReasons(preflight, leg)`, which returns the stable codes above; an empty array means valid
  - `VALIDITY_LIMIT = 0.05`
  - `gateResult(input)`, which returns `{ pass, reasons[], pooled counts }` from per-canary `{ canary, attempts, valid, failures }`
  - Unit tests cover each boundary.
  - Amended by DR-0038: `gateResult` also reports each canary's INCONCLUSIVE rate and flags any canary above 0.10, without changing pass or fail. Amended by DR-0035: this module is scoped to Phase 0.
- Gate reports give Wilson intervals for every proportion (`harness/src/score/wilson.ts`) and label every Phase 0 result EXPLORATORY.
- HANDOFF §9's 98%/90% thresholds and the G2 98% threshold are replaced. The §2 "G1 and G2 thresholds" row now points here. R7's INCONCLUSIVE ceiling is 5% for the Phase 0 gates; the M6 protocol sets its own for the confirmatory run.
- Claude's proposals. The status of each row follows DR-0030.

| Item | Proposal | Status |
|---|---|---|
| When preflight is recorded | The runner writes the preflight into the evidence package before the observation window closes. Validity is computed from that record alone. | **Decided by Claude under DR-0045 (2026-10-03):** implements D12 as written |
| Unit of the 5% validity limit | Pooled across K1–K5: (attempts − valid) / attempts over all gating attempts in the gate run. D12 says "≤ 5% of attempts" without naming the unit. | **Approved by the owner 2026-10-02 (DR-0030)** ("keep the pooled 5% limit"); per-canary reporting added by DR-0038 |
| Audio check scope | `AUDIO` applies to the nvda-present leg only, because only that leg needs a synth and audio path. D3 names no leg. The injection-marker and synth checks are nvda-present only because they concern NVDA (D8, D11). | **Approved by the owner 2026-10-02 (DR-0030)** |
| Post-block canary (§7.4) | HANDOFF v1.0 §7.4 made a whole block INCONCLUSIVE when its post-block canary failed. A post-block canary completes after the outcome is known, so it is not among the D12 pre-outcome checks. Proposal (as HANDOFF v1.1 §7.4 and extract §3.6): a failed post-block canary is reported with its block and does not convert outcomes already observed; the next block must pass its own pre-block canary. This first matters from M4, when item blocks are first run. Owner decision needed before M4. | **Approved by the owner 2026-10-02 (DR-0030)**; the owner's principle is recorded in DR-0032 |
| Ambiguous outcome evidence | PRD §20 allows REVIEW or INCONCLUSIVE when evidence remains ambiguous. Proposal: route it to REVIEW, not INCONCLUSIVE, because INCONCLUSIVE needs a pre-outcome check (extract §3.3). | **Decided by Claude under DR-0045 (2026-10-03).** It follows from D12 and DR-0032: ambiguity is found by inspecting the outcome, and the thing being judged can cause it, so INCONCLUSIVE is ruled out and REVIEW is the only option PRD §20 leaves |

## DR-0022 D13 H2 scope

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; label updated inline |
| Owner label | D13 |
| Related | DR-0042 (2026-10-02): M5 planning note on ANNOUNCEMENT_DUPLICATED, which builds on the bias analysis below |
| HANDOFF v1.1 | §5 (R4), §6, §8.1 |

**Context.**

- HANDOFF R4 said that if speech capture lacks timestamps and cancellation events, interruption and queueing leave C's claimed scope.
- The tap records what NVDA queues to speak, with priority, and global cancels, stamped on receipt (DR-0011). It does not see NOW-priority interrupts, silent removals inside the speech manager, or audio onset. Speech queued and later cancelled still appears as a `speak` message.

**Options considered.**

| Option | Outcome |
|---|---|
| Measure H2 on audio | Rejected: needs audio capture and duration modelling |
| Measure H2 on queued speech plus cancels, excluding interruption and ordering symptoms | Adopted |
| Build the GPL add-on now to recover interruption and ordering | Deferred to the D2 add-on rule (DR-0011) |

**Decision.**

> - H2 is measured on what NVDA queues to speak plus global cancels, not on audio.
> - ANNOUNCEMENT_INTERRUPTED and ANNOUNCEMENT_ORDER_BROKEN are excluded from the primary analysis unless the D2 add-on rule brings them in.
> - Document the bias: queued-then-cancelled text counts as spoken.

**Consequences.**

- **Basis.** H2 evidence is the tap's `speak` and `cancel` messages. The NVDA log is the second record. No claim relies on audio timing.
- **Excluded symptoms.** ANNOUNCEMENT_INTERRUPTED and ANNOUNCEMENT_ORDER_BROKEN stay in the `Symptom` type, which mirrors HANDOFF §10.2, but are excluded from the primary analysis. They can enter only through the D2 add-on rule, with owner approval.
- **The bias.** Queued-then-cancelled text counts as spoken.
- **Direction of the bias** (Claude's analysis). It mainly understates C's detections of regressions whose mechanism is cancellation, such as K7b-like focus moves into an edit field: the queued text appears on both sides, so no ANNOUNCEMENT_MISSING is detected. It can also overstate ANNOUNCEMENT_DUPLICATED when a queued copy is cancelled before it is heard. The bias is stated in the G1 and G2 reports and in `protocol/PROTOCOL.md` at M6.
- **Decided by Claude under DR-0045 (2026-10-03):** corpus items whose expected symptom is one of the two excluded symptoms, if any are built, are reported separately as exploratory. This keeps them out of the primary analysis, as D13 requires.
- HANDOFF §8.1's sentence about modelling utterance duration from a speech rate no longer applies to H2.

## DR-0023 M6 pre-registration: rule-model secondary analysis

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Owner label | Pre-register at M6 |
| HANDOFF v1.1 | §9 (M6) |

**Context.** H2 asks whether real NVDA adds detections beyond B2. If a simple rule model on B2 evidence predicts most of C's verdicts, C's added value lies in the residual. Recording the analysis before any test-split data exist keeps it pre-registered.

**Options considered.** None recorded. This is an owner addition.

**Decision.**

> Pre-register at M6: a secondary analysis of how much of C's verdicts a rule model, fitted to B2 evidence on the dev split, predicts on the test split.

**Consequences.**

- `protocol/PROTOCOL.md` at M6 specifies the model class, the B2 features, the dev-split fitting procedure and the test-split agreement metric with its interval. It is frozen with the protocol hash (DR-0028).
- The analysis is secondary. It never changes primary verdicts, and fitting uses the dev split only (HANDOFF §4 rule 6).
- M3–M7 remain locked until the owner approves G2. Nothing is built for this now.

## DR-0024 Smaller fixes (approved as proposed)

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Owner label | Approved as proposed (smaller fixes) |
| HANDOFF v1.1 | §7.2, §8.2, §8.4, §9 (M0) |

**Context.** Claude's first-session reply listed four fixes it would make without asking, because they correct the means rather than what is measured.

**Options considered.** Not applicable.

**Decision.**

> Your smaller fixes.

The fixes, as listed in the context note of the owner decisions file:

| Fix | Reason |
|---|---|
| The handover checks the real foreground window (`GetForegroundWindow`) and platform focus, not page focus events | Playwright always enables CDP focus emulation, so DOM focus events and `document.hasFocus()` report "focused" even when Chrome is not in the foreground |
| axe runs separately from AT segments | axe's Playwright helper opens a new tab, which steals focus |
| The B2 listener also hooks EVENT_SYSTEM_ALERT and EVENT_SYSTEM_FOREGROUND | Needed for alert signatures (K6b) and for detecting foreground loss |
| TypeScript pinned to 6.0.3 | typescript-eslint 8.71.0 requires TypeScript below 6.1.0 |

**Consequences.**

- **Handover (HANDOFF §7.2).** The handover verifies `GetForegroundWindow()` against the Chrome top-level window, and platform focus (UIA focused element or the last B2 EVENT_OBJECT_FOCUS) on the declared anchor. A failure is INCONCLUSIVE with `FOREGROUND_HWND` (DR-0021). DOM `focusin` is evidence of DOM focus only. Pending owner item P4 (DR-0020): if no WinEvent listener runs in G1 NVDA-present runs, neither source suits that leg: the B2 focus event needs the listener, and a UIA focused-element read would register the UIA client that P4 keeps out. The platform-focus method there is open until the owner decides; Claude proposes an MSAA-only focus read.
- axe placement is fixed by DR-0018. The listener hooks are in DR-0019. The TypeScript pin is in DR-0007.

## DR-0025 M1a runner probes

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; labels updated inline |
| Owner label | Approved as proposed (M1a probes) |
| Amended by | DR-0040 (2026-10-02): the audio probe also records the Scream Authenticode status, signer and issuer. DR-0041 (2026-10-02): the eSpeak rate is NVDA's default; M1a records the effective rate and raises it only if there is a reason. |
| HANDOFF v1.1 | §9 (M1) |

**Context.** Most open questions in the desk research can be settled only on a runner. Claude's first-session plan proposed an M1a runner probe on both labels, estimated at 2–3 Windows round trips. It covered audio, the desktop session, display, clocks, which voice NVDA loads, CfT launch, foreground handling, title latency and the NVDA channel.

**Options considered.** Probe both labels, or the gate label only. With or without the title-latency probe, which D1 makes moot.

**Decision.**

> M1a probes on both labels, minus the title-latency probe.

**Consequences.**

- M1a runs on `windows-2025` and `windows-2022`. The `windows-2022` job lives only in a workflow file whose name contains "probe" (policy rule W6).
- **Probe scope.** The empirical questions are listed in `docs/LAB_NOTEBOOK.md` (entry of 2026-10-02). The areas are those of the approved plan (see Context, minus title latency); the "Records" column says how the probe covers each area.

| Area | Records | Feeds |
|---|---|---|
| Audio | Endpoints and Audiosrv state, with and without Scream; the Scream signer thumbprint (DR-0040 adds the Authenticode status, signer and issuer) | DR-0012, DR-0040 |
| Image | Image name and version, `ImageOS` and Windows build (approved by the owner 2026-10-02, DR-0030; also required by DR-0006) | DR-0006 |
| Desktop session | Process integrity levels and session IDs of NVDA, Chrome, the listener and the input path (approved by the owner 2026-10-02, DR-0030) | DR-0024 |
| Synth | Which synth NVDA loads, with and without Scream (DR-0041 adds the effective eSpeak NG rate, expected 30) | DR-0017, DR-0041 |
| NVDA channel | Which channel NVDA uses for Chrome under `[UIA] allowInChromium=3` (IA2 expected) | DR-0017 |
| Injection | The injection marker and "Buffer load took" | DR-0017 |
| Foreground | Foreground-lock behaviour | DR-0024 |
| Chrome | CfT infobars | DR-0007 |
| Clocks | Whether Chrome TimeTicks share an epoch with `process.hrtime.bigint()` and `Stopwatch`; whether CDP NavigationStart equals the page time origin, cross-checked against a 16-ping minimum-RTT estimate | DR-0010 |
| Display | Resolution and DPI | — |
| Reliability | First-launch virtual-buffer failure rate | DR-0021 |

- Dropped: the title-latency probe (D1 removes the marker).
- Each probe job also records `ImageOS`, `ImageVersion` and the image name. That follows from DR-0006 (every run records them), not from the probe plan; the label check that uses them is decided by Claude under DR-0045 in DR-0006.
- Results are logged as EXPLORATORY entries in `docs/LAB_NOTEBOOK.md`.
- **Superseded by DR-0040 and DR-0041 (2026-10-02):** values that need an owner decision are brought to the owner before G1 runs. These are the declared eSpeak rate (DR-0017) and the Scream signer thumbprint (DR-0012). (DR-0041: the rate is NVDA's default and comes back to the owner only if M1a gives a reason. DR-0040: Claude pins the thumbprint without asking when the Authenticode chain is valid and the signer is consistent with the release; a self-signed driver is brought to the owner.)

## DR-0026 Schema v1.1 additions

| | |
|---|---|
| Date | 2026-10-02 (accepted with amendments in the owner review of 2026-10-02; recorded 2026-10-03) |
| Status | Accepted with amendments (owner review 2026-10-02) |
| Proposed parts | None pending. The whole record was drafted by Claude; the owner accepted it with amendments (a), (b) and (c) below (DR-0030). |
| Owner label | Owner review 2026-10-02, key item 3. Implements D1–D4, D8 and D10–D13. |
| Amended by | Amendments (a)–(c) below; DR-0035 (2026-10-02) for (c); DR-0038 (2026-10-02) adds per-canary INCONCLUSIVE reporting to `gateResult` |
| HANDOFF v1.1 | §9 (M0), §10.2 |

**Owner acceptance with amendments (2026-10-02, recorded 2026-10-03).**

> 3. Schema (DR-0026): accepted, with amendments:
>    (a) gate evidence must carry leg, preflight and segmentId, enforced by the runner;
>    (b) Utterance.priority is required in nvda-present packages;
>    (c) validity.ts is Phase 0-scoped (see item 6).

| Amendment | Implementation |
|---|---|
| (a) Gate evidence | `GateEvidencePackage` type and `GateEvidencePackageSchema` in `harness/src/schema/`: an `EvidencePackage` in which `leg` and `preflight` are required and every step has a non-empty `segmentId`. The M1 runner validates every gate package against it. The type-equality test covers the new type. Invalid fixtures: a gate package with a step missing `segmentId`; a gate package without `leg`. This supersedes the Proposed bullet on gate packages at the end of this record. |
| (b) Priority | The `EvidencePackage` refinement also requires `priority` on every utterance of every step when `leg === "nvda-present"`. The valid nvda-present fixture carries a priority on each utterance; an invalid fixture omits one. NVDA-absent packages and §10.2 documents without `leg` are unaffected. |
| (c) Phase 0 scope | `harness/src/runner/validity.ts` is scoped to Phase 0, where canaries are fixed pages. From M4 the side-aware rule replaces it (DR-0035). Its header comment states this and the DR-0032 principle. |

**Context.** M0 requires zod schemas mirroring HANDOFF §10.2, with tests. The owner's decisions require data the §10.2 contracts cannot hold: QPC time semantics, speech priority and global cancels, segment IDs, platform-event identity, environment details (image, synth, audio, channel, AXMode), legs, and preflight results. The requirement is the owner's. The field design below is Claude's.

**Options considered.** Change §10.2 types in place (breaking), or mirror §10.2 exactly and add optional fields only (additive). The additive approach was chosen so §10.2 documents stay valid, with the documented exceptions listed under "Constraints beyond §10.2" in the consequences.

**Decision (accepted with amendments, owner review 2026-10-02).**

*Mirroring.* Every §10.2 type, field, optionality and literal is mirrored exactly. `Arm` and the adapter name enum (`"guidepup" | "atdriver"`) stay as in §10.2, even though AT Driver is cut in Phase 0 (DR-0011).

*Additions.* Each carries a JSDoc comment citing its decision.

| Ref | Addition | Type | Decision |
|---|---|---|---|
| a | Time semantics for `t`, `startedAt`, `endedAt`, `cancelledAt`, `focusTrace[].t` and `speechCancels[].t` | `number`; zod enforces integer, safe integer, ≥ 0. Value is QPC nanoseconds since boot. | D1 (DR-0010) |
| b | `Utterance.priority?` | `"NORMAL" \| "NEXT" \| "NOW"` | D2 relay tap (DR-0011) |
| c | `StepEvidence.speechCancels?` | `Array<{ t: number }>`: global cancels from the relay | D2, D13 (DR-0011, DR-0022) |
| d | `StepEvidence.segmentId?` | `string`: orchestrator-issued segment ID used to join logs | D1 (DR-0010) |
| e | `PlatformEvent.eventId?`, `hwndClass?`, `automationId?`, `liveSetting?`, `ariaRole?`, `diagnostic?` | `number` (raw WinEvent or UIA id), `string`, `string`, `string`, `string`, `boolean` (true for UIA events, which are diagnostic only) | D10 (DR-0019) |
| f | `EnvManifest.imageName?` | `string` (e.g. `"windows-2025-vs2026"`) | DR-0006 |
| f | `EnvManifest.playwrightVersion?` | `string` | DR-0007 |
| f | `EnvManifest.chromeSandbox?`, `axMode?` | `boolean`, `string` | D10 (DR-0019) |
| f | `EnvManifest.nvdaChannel?` | `"IA2" \| "UIA"` | D8 (DR-0017) |
| f | `EnvManifest.synth?` | `{ name: string; voice?: string; rate?: number; rateBoost?: boolean }` | D8 (DR-0017) |
| f | `EnvManifest.audio?` | `{ endpointCount: number; audiosrvRunning: boolean; driver?: string }` | D3 (DR-0012) |
| f | `EnvManifest.dotnetVersion?` | `string` | D10 (DR-0019) |
| g | `EvidencePackage.leg?` | `"nvda-absent" \| "nvda-present"` | D11 (DR-0020) |
| h | `EvidencePackage.preflight?` | `Preflight` (below) | D12 (DR-0021) |
| i | `EvidencePackage.maxClockSkewMs` | Stays required. **Redefined** as `max(nativeSelfTestDisagreementMs, pageMappingUncertaintyMs)`; no longer a title-pulse skew. | Derived from the D1 limits (DR-0010); D1 does not mention the field |
| j | `CanaryId`, `GATING_CANARIES`, `RECORD_ONLY_CANARIES` | See below | D4 (DR-0013) |

```ts
interface ClockChecks {
  nativeSelfTestDisagreementMs: number;
  pageMappingUncertaintyMs: number;
  segmentDriftMs: number;
  timeTicksHighResolution: boolean;
  maxRafGapMs: number;
}
interface Preflight {
  foregroundHwndOk: boolean;
  preCanaryOk: boolean;
  manifestValid: boolean;
  clock: ClockChecks;
  injectionMarkerOk?: boolean; // required when leg === "nvda-present"
  audioOk?: boolean;           // required when leg === "nvda-present"
  synthOk?: boolean;           // required when leg === "nvda-present"
}
export type CanaryId = "K1" | "K2" | "K3" | "K4" | "K5" | "K6a" | "K6b" | "K6e" | "K7a" | "K7b";
export const GATING_CANARIES = ["K1", "K2", "K3", "K4", "K5"] as const;
export const RECORD_ONLY_CANARIES = ["K6a", "K6b", "K6e", "K7a", "K7b"] as const;
```

*Validation and drift control.*

| Rule | Implementation |
|---|---|
| Unknown keys rejected | zod `z.strictObject` throughout |
| nvda-present checks present | A zod refinement on `EvidencePackage`: when `leg === "nvda-present"`, `injectionMarkerOk`, `audioOk` and `synthOk` must be present, so an nvda-present package without a preflight is rejected |
| Priority in nvda-present packages | Owner amendment (b) extends the refinement above: when `leg === "nvda-present"`, every utterance of every step must carry `priority` |
| Skew consistent with clock checks | A second refinement: when `preflight` is present, `maxClockSkewMs` must equal `max(preflight.clock.nativeSelfTestDisagreementMs, preflight.clock.pageMappingUncertaintyMs)` |
| Types cannot drift from schemas | A type-level test asserts each hand-written interface equals `z.infer` of its schema (`expectTypeOf`) |
| Samples | Valid and invalid sample documents in `harness/src/schema/__fixtures__/*.json`, validated by tests |

*File layout.*

| File | Contents |
|---|---|
| `harness/src/schema/types.ts` | Hand-written interfaces and types |
| `harness/src/schema/schemas.ts` | zod schemas |
| `harness/src/schema/index.ts` | Re-exports |

*Validity module* (`harness/src/runner/validity.ts`, D1 and D12):

| Export | Definition |
|---|---|
| `CLOCK_LIMITS` | `{ nativeSelfTestDisagreementMs: 0.5, pageMappingUncertaintyMs: 2, segmentDriftMs: 1, maxRafGapMs: 100 } as const` |
| `inconclusiveReasons(preflight, leg)` | Returns stable reason codes; empty means valid. Codes: `FOREGROUND_HWND`, `PRE_CANARY`, `MANIFEST_INVALID`, `CLOCK_NATIVE_SELF_TEST`, `CLOCK_PAGE_MAPPING`, `CLOCK_SEGMENT_DRIFT`, `CLOCK_LOW_RES_TIMETICKS`, `CLOCK_RAF_GAP`; for nvda-present also `NVDA_INJECTION_MARKER`, `AUDIO`, `SYNTH_FALLBACK` (missing counts as failed). A value strictly greater than its limit is INCONCLUSIVE; equal passes. Takes only preflight data, never outcome data. |
| `VALIDITY_LIMIT` | `0.05` (INCONCLUSIVE ≤ 5% of attempts) |
| `gateResult(input)` | Input: per-canary `{ canary, attempts, valid, failures }` for K1–K5. Passes iff every canary has ≥ 50 valid runs, pooled failures ≤ 5, no single canary has > 3 failures, and pooled (attempts − valid) / attempts ≤ 0.05. Returns `{ pass, reasons[], pooled counts }`. Unit tests cover 5 vs 6 pooled, 3 vs 4 single, 50 vs 49 valid, and exactly 5% vs just over. Amended by DR-0038: it also returns each canary's INCONCLUSIVE rate and flags any canary above `PER_CANARY_INCONCLUSIVE_FLAG` (0.10); flags never change pass or fail. |

*Validity behaviour beyond the rule.* The thresholds and limits above come from D1 and D12. The behaviour below is Claude's, accepted with this record. The module as a whole is scoped to Phase 0 by amendment (c) (DR-0035).

| Behaviour | Definition | Status |
|---|---|---|
| Fail closed on bad clock values | In `inconclusiveReasons`, a NaN, negative or infinite clock measurement counts as failing its check, so the attempt is INCONCLUSIVE with that check's code | Approved by the owner 2026-10-02 (DR-0030) |
| `gateResult` reason codes | `CANARY_MISSING` (no tally for a gating canary), `INSUFFICIENT_VALID_RUNS` (fewer than 50 valid), `CANARY_FAILURES` (more than 3 on one canary), `POOLED_FAILURES` (more than 5 pooled), `VALIDITY_RATE` (pooled INCONCLUSIVE rate above 0.05) | Approved by the owner 2026-10-02 (DR-0030); the conditions are D12's |
| `gateResult` malformed input | Throws `RangeError` for a count that is not a non-negative safe integer, `valid` greater than `attempts`, `failures` greater than `valid`, a duplicate tally, or a canary outside K1–K5 | Approved by the owner 2026-10-02 (DR-0030) |
| Zero attempts | The pooled INCONCLUSIVE rate is reported as `null`; the gate still fails, on `CANARY_MISSING` or `INSUFFICIENT_VALID_RUNS` | Approved by the owner 2026-10-02 (DR-0030) |

**Consequences.**

- **Constraints beyond §10.2.** §10.2 types these fields only as `number`. The schemas add the constraints below. Those marked "Yes" in the last column reject documents that a literal §10.2 mirror would accept, so the additive rule has these exceptions. (zod 4 rejects NaN and infinite values for every `number`.)

| Constraint | Fields | Basis | Rejects a §10.2-valid document? |
|---|---|---|---|
| Non-negative safe integer (QPC nanoseconds) | `t`, `startedAt`, `endedAt`, `cancelledAt`, `focusTrace[].t`, `speechCancels[].t` | Follows from D1 (DR-0010); the validation is approved by the owner 2026-10-02 (DR-0030) | Yes: fractions, negatives and values of 2^53 or more |
| Non-negative integer | `EvidencePackage.repetition`, `EvidencePackage.orderIndex` | Approved by the owner 2026-10-02 (DR-0030) | Yes |
| Non-negative integer | `EnvManifest.audio.endpointCount` | Approved by the owner 2026-10-02 (DR-0030) | No (new field) |
| Integer, at least 1 | `CorpusItem.repetitions`, `AtStep.until.maxAttempts` | Approved by the owner 2026-10-02 (DR-0030) | Yes: for example `repetitions: 0` or `maxAttempts: 0` |
| Finite, non-negative milliseconds | `AtStep.observeMs`, `EvidencePackage.maxClockSkewMs` | Approved by the owner 2026-10-02 (DR-0030) | Yes: for example `observeMs: -5` or `maxClockSkewMs: -1` |
| Finite, non-negative milliseconds | `ClockChecks.nativeSelfTestDisagreementMs`, `pageMappingUncertaintyMs`, `segmentDriftMs`, `maxRafGapMs` | Approved by the owner 2026-10-02 (DR-0030) | No (new fields) |
| Integer from 0 to 0xFFFFFFFF (the DWORD range) | `PlatformEvent.eventId` | Approved by the owner 2026-10-02 (DR-0030) | No (new field) |
| Number from 0 to 100 | `EnvManifest.synth.rate` | Approved by the owner 2026-10-02 (DR-0030) | No (new field) |
| `maxClockSkewMs` equals the clock maximum when `preflight` is present | `EvidencePackage` refinement | Approved by the owner 2026-10-02 (DR-0030) | No (`preflight` is new) |
| Unknown keys rejected | Every object (`z.strictObject`) | Approved by the owner 2026-10-02 (DR-0030) | Yes, for documents carrying extra keys |
- `preflight` and `leg` are optional for compatibility with §10.2. Gate packages must carry them (amendment (a)).
- **Superseded by owner amendment (a) (2026-10-02):** evidence packages used for G1 and G2 must carry both. The M1 runner enforces this. (Amendment (a) makes this the owner's rule and adds `segmentId` on every step; `GateEvidencePackageSchema` expresses it.)
- On owner acceptance, this record's status changes to Accepted, with the date. Done: accepted with amendments (a)–(c) in the owner review of 2026-10-02, recorded 2026-10-03 (DR-0030).

## DR-0027 Collector clock rule enforcement

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; label updated inline |
| Owner label | D1 (clock test) |
| HANDOFF v1.1 | §7.3, §9 (M0) |

**Context.** D1 makes QPC the only timebase and requires a test forbidding wall-clock reads in collectors. Wall-clock reads in other runtime code (adapters, runner, listener) would break the timebase the same way.

**Options considered.** Scan collectors only, for the three named reads (the owner's minimum), or scan every runtime directory for the equivalent reads in each harness language.

**Decision.** (D1, first bullet, in part.)

> Add a test forbidding Date.now(), performance.timeOrigin and time.time() in collectors.

**Implementation.** The owner's minimum is the three named reads in collectors. **Decided by Claude under DR-0045 (2026-10-03):** everything beyond that minimum. It is a stricter guard on the D1 timebase and changes nothing that is measured.

| Aspect | Value |
|---|---|
| Files | `harness/src/policy/clockPolicy.ts` (scanner) and `harness/test/policy/clock.test.ts` (policy test) |
| Scanned directories | `harness/src/collectors/**`, `harness/src/adapters/**`, `harness/src/runner/**`, `harness/src/clock/**`, `listener/**` |
| File types | `.ts`, `.js`, `.mjs`, `.cs`, `.py`; `*.test.ts` skipped |
| Forbidden reads | `Date.now(`, `performance.timeOrigin`, `new Date(`, `time.time(`, `time.time_ns(`, `DateTime.Now`, `DateTime.UtcNow`, `DateTimeOffset.Now`, `DateTimeOffset.UtcNow` |
| Allowlist (exact) | `harness/src/clock/wallAnchor.ts` and `listener/**/WallAnchor.cs` |
| Tests | Unit tests prove each pattern is caught and the allowlist works. The policy test asserts zero violations in the repository. |

**Consequences.**

- Any wall-clock read outside the two anchor files fails CI.
- **Limits.** The scan is textual: a tripwire, not a proof.
  - It matches comments and strings too, so documentation of a forbidden call inside scanned code must be phrased differently.
  - It can be evaded by aliasing, so code review still applies.
  - It does not cover in-page scripts outside the scanned directories. The in-page collector must use `performance.now()` mapped through CDP (DR-0010), not `Date.now()`.

## DR-0028 Protocol freeze guard

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Resolved by DR-0030; labels updated inline |
| Owner label | HANDOFF §10.3 (freeze guard); hard rule 5 |
| Amended by | DR-0033 (2026-10-02): the guard hashes the frozen set listed in `protocol/frozen-paths.txt`, not `protocol/` alone. DR-0034 (2026-10-02): hard rule 5 covers execution; from M4 the runner checks the guard before executing any test-split item. |
| HANDOFF v1.1 | §4 (rule 5), §9 (M6), §10.3 |

**Context.** Hard rule 5 says test-split items must not be executed before the freeze, enforced in code. HANDOFF §10.3 requires `npm run score -- --split test` to exit non-zero unless the hash of `protocol/` equals the hash recorded in the freeze tag. At M6 the owner reviews, tags and publishes. Claude never pushes tags (hard rule 2).

**Options considered.** The HANDOFF fixes the requirement but not the hash construction, the tag format or the CLI behaviour, so those are Claude's design.

**Decision.** HANDOFF v1.0 §10.3 (owner-authored):

> **Freeze guard:** `npm run score -- --split test` must exit non-zero unless the hash of `protocol/` equals the hash recorded in the freeze tag.

**Implementation.** **Approved by the owner 2026-10-02 (DR-0030); scope amended by DR-0033:** the design below.

| Component | Specification |
|---|---|
| Protocol hash (`harness/src/score/protocolHash.ts`) | `computeProtocolHash(rootDir = "protocol")` returns a SHA-256 hex digest over the regular files git tracks under `protocol/` (`git ls-files`), excluding `.gitkeep`. Paths are POSIX paths relative to `protocol/`, sorted by code unit. For each file it feeds `path + "\n" + sha256hex(blob) + "\n"`, where `blob` is the file's committed git blob, so a Windows checkout with `core.autocrlf=true` hashes the same as a macOS or Linux one. Computing the hash throws while `protocol/` has any staged, unstaged or untracked change. Symbolic links and submodules are refused. Run `npm run protocol:hash` to print the `protocol-sha256: <hex>` line for the freeze tag message. Hashing committed blobs and requiring a clean `protocol/` (rather than hashing every file on disk, as first specified) is part of this design. **Superseded by DR-0033 (scope):** the hash covers the tracked files under every path listed in `protocol/frozen-paths.txt`, with repo-relative paths, and refuses while any listed path is dirty. The functions are now `computeProtocolHash(repoRoot)` and `listFrozenFiles(repoRoot)`, and the clean-tree checks as built are listed in DR-0033. |
| Freeze tag | An annotated git tag named `protocol-freeze-v<N>`, whose message contains exactly one line `protocol-sha256: <64 lowercase hex>`. Created and pushed by the owner. |
| Guard (`harness/src/score/freezeGuard.ts`) | `assertSplitAllowed(split, deps)`, with injectable `deps { listFreezeTags(): string[]; readTagMessage(tag): string; computeHash(): string }`. `dev` is always allowed. `test` is allowed only if at least one freeze tag exists, the latest tag (highest N, compared numerically) records a parseable hash, and that hash equals `computeHash()`. Otherwise it refuses with a clear reason. DR-0033: the live hash is computed only when a freeze tag exists. DR-0034: `harness/src/runner/splitGuard.ts` applies the same guard to execution. |
| CLI (`harness/src/score/cli.ts`) | `npm run score -- --split <dev\|test>`. An unknown or missing split exits 2. A refused `test` exits 1. Otherwise it prints "Scorer not implemented until M5." and exits 3. |
| Wilson helper (`harness/src/score/wilson.ts`) | Wilson 95% interval with z = 1.959964, tested against known values (49/50 lower bound about 0.8950; 50/50 lower bound about 0.9287). |
| Tests | Unit tests with injected deps; one integration test that creates a temporary git repository with an annotated tag; one test that spawns `node harness/src/score/cli.ts --split test` in this repository, where no freeze tag exists, and asserts a non-zero exit. DR-0033: no test computes this repository's real frozen hash; hash tests use temporary git repositories. |

**Consequences.**

- Until M6, `--split test` always exits non-zero, because no freeze tag exists.
- Numeric comparison of N prevents `v10` from sorting before `v9`.
- `protocol/AMENDMENTS.md` lies inside `protocol/`, so it is part of the hash. A post-freeze amendment changes the hash, and test-split scoring is then refused until the owner creates `protocol-freeze-v<N+1>` with the new hash. The original analysis stays reproducible from the earlier tag's tree. This is how AMENDMENTS.md's "report both analyses" rule is enforced. **Amended by DR-0033:** an amendment is any post-freeze change to the frozen set, not only to `protocol/`, and `protocol/AMENDMENTS.md` states that scope.
- The guard compares the hash of the committed `protocol/` files with the tag's recorded hash, and refuses while `protocol/` has uncommitted changes. It does not require the working tree to be at the tagged commit. **Superseded by DR-0033 (scope):** the comparison and the clean-tree requirement cover every path in the frozen set.

## DR-0029 Desk research basis (2026-10-02)

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted (see the status note under "Decision") |
| Owner label | None |
| HANDOFF v1.1 | §8.3, §10.1; also cited by DR-0006 to DR-0025 |

**Context.** The owner decisions of 2 October respond to Claude's first-session reply, which rested on desk research carried out on 2 October 2026.

**Options considered.** Not applicable.

**Decision.** This record names the evidence basis. It is not an owner decision. Status note: "Accepted" means it is the current basis for the records above; it does not mean the owner has reviewed the research document.

**What the research is.**

| Item | Detail |
|---|---|
| Location | `docs/research/2026-10-02-phase0-feasibility.md` |
| Kind | Desk research, labelled EXPLORATORY. **Not runner observation:** nothing in it has been observed on a GitHub-hosted runner by this project. |
| Method | Seven research agents, one per dimension: Guidepup, AT Driver, platform events, runners, timing, canary premises, Playwright. Each read primary sources: cloned repositories, `gh api`, Chromium and NVDA source, and third-party CI logs. An adversarial verifier per dimension then tried to refute each decision-critical claim. |
| Precedence | Where researcher and verifier disagree, the verifier's correction wins. |
| Confidence | Claims labelled INFERENCE, and every open question, need empirical confirmation in M1a–M2 (DR-0025, `docs/LAB_NOTEBOOK.md`). |

**Consequences.**

- Versions and SHAs quoted from the research were re-checked where this record set relies on them (DR-0008).
- Any finding that M1a or M2 contradicts is recorded in the lab notebook, and the affected decision record is superseded by a new record.

## DR-0030 Owner review of M0: approvals

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02 (opening line; key items 1–3; other rulings) |
| HANDOFF v1.2 | "Changes in v1.2"; every v1.1 passage labelled "Proposed by Claude (not yet owner-approved)": §5 R3, R8, R9; §7.1, §7.2, §7.3, §7.4; §8.2, §8.3, §8.4; §9 M1, G1 rule, G2 rule; §9.1 (K6a rule); §9.2; §10.2 |

**Context.**

- PR #1 (`m0-bootstrap`) ended with ten numbered items under "Proposed by Claude: needs your yes or no". They filled gaps the owner decisions of 2 October 2026 did not cover.
- DR-0001 to DR-0029 also carry inline parts labelled "Proposed by Claude (not yet owner-approved)". Most belong to one of the ten items; some do not.
- The owner reviewed M0 on 2 October 2026 and delegated everything except hard-rule-12 items to Claude (DR-0045).
- This record maps each of the ten items, and each inline part, to its outcome, so that no label is left ambiguous.

**Options considered.** Not applicable. The outcomes are the owner's, or follow from the owner's delegation (DR-0045).

**Decision.** Owner review of 2 October 2026, opening line:

> Owner review of m0-bootstrap, 2 October 2026. Record these in DECISIONS.md, as new records where they change an Accepted decision. Anything in your Proposed list not mentioned below is approved.

Explicit approvals in the same review:

> 1. C's B2 evidence (DR-0020): approved. C uses the NVDA-absent B2 evidence, as D does, so C and D differ only in trigger masking.

> 2. Post-block canary (DR-0021): approved. It never converts observed outcomes.

> 3. Schema (DR-0026): accepted, with amendments:

> - K6 delay grading (DR-0019): approved. It replaces the v1.0 same-batch flag now.

> - INCONCLUSIVE: keep the pooled 5% limit. Also report per-canary rates and flag any canary above 10%.

**Outcome of the PR #1 Proposed list.**

| # | PR #1 item | Outcome | Record |
|---|---|---|---|
| 1 | C's evidence split (DR-0020): C_UNION and C_ADJUDICATED use NVDA-absent B2 evidence plus NVDA-present NVDA evidence; legs matched by item, side and repetition | Approved with amendment. The evidence split is approved (key item 1). Matching by repetition is superseded: legs are combined at item level, and repetition indices are never paired across legs | DR-0031 |
| 2 | Post-block canary (DR-0021, HANDOFF §7.4): reported with its block, never converts observed outcomes; the next block needs its own pre-block canary | Approved (key item 2). The owner's INCONCLUSIVE principle is recorded with it | DR-0032 |
| 3 | Validity unit (DR-0021): the 5% ceiling pooled across K1–K5 | Approved ("keep the pooled 5% limit"), with per-canary reporting and a 10% flag added | DR-0038 |
| 4 | Audio check scope (DR-0012): the audio preflight in the NVDA-present leg only | Approved (not mentioned) | This record |
| 5 | Schema v1.1 (DR-0026), including the `maxClockSkewMs` redefinition | Approved with amendments (a), (b) and (c) (key item 3) | DR-0026 (status changed in place); DR-0035 for (c) |
| 6 | Clock details (DR-0010): the native self-test method; the interim Node wall anchor | Approved (not mentioned). The owner ruled separately on bucketing NVDA log lines | This record; DR-0039 |
| 7 | K6 details (DR-0013, DR-0019): "announced" for the K6a rule; insertion-to-content delay grading; `attachShadow` patch; `takeRecords` ordering | Approved. The K6a rule is evaluated on the NVDA-present leg (DR-0036); the delay grading replaces the same-batch flag now (DR-0037) | This record; DR-0036; DR-0037 |
| 8 | Freeze guard design (DR-0028): committed blobs, a clean tree, tag `protocol-freeze-v<N>` with a `protocol-sha256:` line | Approved with amendment. The design stands (not mentioned); its scope widens from `protocol/` to the frozen set (gaps item 4), and hard rule 5 now covers execution (gaps item 5) | DR-0033; DR-0034 |
| 9 | Policy extensions (DR-0016, DR-0014): stricter W1 and W4; the tripwire stored as digests | Approved (not mentioned) | This record |
| 10 | M1 plan details (DR-0025, HANDOFF §9): a strict pilot before the G1 runs; image-identity and process-integrity probe items; the eSpeak rate proposed from M1a data | Approved, except the eSpeak-rate part, which the owner superseded: NVDA's default rate, rate boost off | This record; DR-0041 |

**Outcome of each inline Proposed part in DR-0001 to DR-0029.** The test for "hard-rule-12 item" is the one in DR-0045. Each part's label has been replaced in place with the outcome shown; the text of the part is kept.

| Record | Inline part | Outcome | Basis |
|---|---|---|---|
| DR-0003 | Cost table in the G2 report (CI round trips, Windows job-minutes, runtime per canary run per leg, INCONCLUSIVE rate, model spend) | Decided by Claude under DR-0045 | Reporting only; it changes neither cost nor what is measured |
| DR-0004 | Decisions between gates batched into one weekly list | Superseded by DR-0045 | The owner's process replaces it |
| DR-0005 | Claude flags token-heavy work before running it and estimates spend in each gate report | Decided by Claude under DR-0045 | Claude's own reporting. Flagging token-heavy work before it runs is the cost escalation that hard rule 12 already requires |
| DR-0005 | The owner monitors the £150 cap, because Claude cannot meter its own spend | **Pending owner item P7** | It gives the owner a duty over the cost envelope, which the owner has not accepted (cost) |
| DR-0006 | `ubuntu-24.04` for Linux CI | Decided by Claude under DR-0045 | A free standard runner (hard rule 4) with an explicit label, never `*-latest` |
| DR-0006 | Image-label check that fails fast; report legs that ran on different image versions | Decided by Claude under DR-0045 | A restrictive check; nothing observed changes |
| DR-0007 | M0 implementation choices: no build step and the `tsconfig.json` settings; exact dev-dependency pins other than `yaml`; committed lockfile with `npm ci`; local Node 26 against CI 24.21.0; browser-version assertion at launch | Decided by Claude under DR-0045 | The dev toolchain HANDOFF §9 M0 names (TypeScript, ESLint, Vitest, zod) and its companions: typescript-eslint (named in the owner-approved smaller fixes, DR-0024), @eslint/js (published by the ESLint project) and @types/node (type declarations, which do not execute). Dev-only, exactly pinned, run with a read-only token and no secrets. The browser assertion only restricts |
| DR-0007 | The `yaml` 2.9.1 dev dependency for the workflow policy test | Listed as pending owner item P5; **resolved: decided by Claude under DR-0045 (2026-10-03)** | Listed first as new third-party code that runs in CI and that no owner-authored text names (security). Resolved because it is dev-only with no dependencies of its own, exactly pinned with a lockfile integrity hash, ISC-licensed, run only in the Linux CI job under `contents: read` with no secrets, and there to enforce hard rule 3 (DR-0007) |
| DR-0008 | Pinning the latest release of each Action as of 2026-10-02 | Decided by Claude under DR-0045 for `actions/checkout`, `actions/setup-node` and `actions/upload-artifact`. **Pending owner item P2** for `actions/setup-dotnet` | A version choice for Actions the owner-authored v1.0 skeleton already names adds no new third-party code. `actions/setup-dotnet` is a new third-party Action (security) |
| DR-0009 | `@guidepup/setup` 0.29.1 pin and the `npx @guidepup/setup@0.29.1 install` path | Decided by Claude under DR-0045 | The only provisioning path for the owner-approved Guidepup 0.35.0 (D2). The archived setup-action in the owner-authored v1.0 skeleton bundled `@guidepup/setup` 0.23.0, so this is a version change of a component already in the plan, from the same publisher; the asset it fetches is checksum-verified |
| DR-0009 | The tap reads the relay CA or fingerprint from the session directory after each NVDA start | Decided by Claude under DR-0045: **not adopted in Phase 0**. The tap verifies the relay's certificate against the CA in the pinned, checksum-verified NVDA asset, as Guidepup 0.35.0 does | The conservative choice adds no trust beyond the owner-approved Guidepup's (D2) and nothing to any certificate store. Reading the CA from the session directory would be a new trust step (security), and it would not extend the shelf life, since Guidepup itself trusts only the build's CA |
| DR-0009 | Operating note: cache `%LOCALAPPDATA%\guidepup` | Decided by Claude under DR-0045: **not adopted in Phase 0** | Adoption would need `actions/cache`, a new Action pin (security). Not caching costs about 10–15 s per NVDA job |
| DR-0009 | Operating notes: install root without spaces; NVDA only on ephemeral hosted runners | Decided by Claude under DR-0045 | The first avoids an unquoted-path failure. The second only restricts exposure and matches D3's rule for the same runners |
| DR-0010 | Interim Node wall anchor (coarse on Windows until M2; display only) | Approved by the owner 2026-10-02 (DR-0030), item 6 | — |
| DR-0010 | `maxClockSkewMs` redefined as max(native self-test disagreement, page-mapping uncertainty) | Approved by the owner 2026-10-02 (DR-0030), item 5 | DR-0026 accepted with amendments |
| DR-0010 | Methods table: native self-test disagreement | Approved by the owner 2026-10-02 (DR-0030), item 6 | — |
| DR-0010 | Methods table: page-mapping uncertainty, segment drift, low-resolution TimeTicks, rAF gap | **Pending owner item P6**. The working definitions are used only to collect M1a and M1b exploratory data; the final computation, fixed from M1a data, goes to the owner before any G1 run | They decide when an attempt is INCONCLUSIVE (validity, so what is measured under DR-0045), and the rAF method adds a heartbeat to the page under observation. Item 6 covered only the native self-test method and the interim Node wall anchor |
| DR-0010 | Methods table: NVDA log parity, with the note that a finer join needs an owner decision | Amended by DR-0039 | The owner allows wall-anchor bucketing for parity counts and diagnostics only |
| DR-0011 | M1a measures the CPU and latency overhead of DEBUG logging | Decided by Claude under DR-0045 | A diagnostic inside M1a's existing jobs |
| DR-0011 | The form of the GPL add-on, if one is ever approved | Decided by Claude under DR-0045, as the form any proposal would take | Building the add-on still needs owner approval under the D2 add-on rule |
| DR-0012 | Install sequence (ARIA-AT recipe) | Amended by DR-0040 (step 4 becomes the Authenticode check). The other steps are decided by Claude under DR-0045, as implementing D3 | Holds only if `devcon` comes from the runner image or the pinned Scream archive; a separate download would be a new hard-rule-12 item |
| DR-0012 | Audio check in the NVDA-present leg only | Approved by the owner 2026-10-02 (DR-0030), item 4 | — |
| DR-0013 | Desk-research predictions of platform events and priorities | Decided by Claude under DR-0045, as predictions only | They are not criteria. Any change they lead to in a G1 or G2 criterion is a hard-rule-12 item and needs a new record |
| DR-0013 | K2 matched on text only; no "alert" prefix expected or required | Decided by Claude under DR-0045 | Applies K2's expected outcome as written ("Utterance containing the text"); no criterion changes |
| DR-0013 | K6a rule reading: trigger (2 or more of 20 runs) | Decided by Claude under DR-0045 | Restates the owner's "more than 1 of 20" |
| DR-0013 | K6a rule reading: "announced" | Approved by the owner 2026-10-02 (DR-0030), item 7; amended by DR-0036 | Evaluated on the NVDA-present leg |
| DR-0013 | K6a rule reading: membership of the creation-time regression family, and the mechanisms not affected | **Pending owner item P1** | It decides what leaves the M3 catalogue (what is measured). Item 7 covered "announced", not the family |
| DR-0014 | Tripwire stored as SHA-256 digests | Approved by the owner 2026-10-02 (DR-0030), item 9 | — |
| DR-0015 | Archive details: layout, manifest contents, binary exclusion, size splitting, reproduction command | Decided by Claude under DR-0045 | Implements D6; the binary exclusion only restricts |
| DR-0016 | Stricter W1 and W4 | Approved by the owner 2026-10-02 (DR-0030), item 9 | — |
| DR-0017 | Numeric eSpeak rate proposed from M1a | Superseded by DR-0041 | NVDA's default rate, rate boost off |
| DR-0017 | "Report dynamic content changes" stays at NVDA's default (on) | Decided by Claude under DR-0045 | No setting changes; NVDA's defaults stand unless the owner decides otherwise |
| DR-0019 | Listener hooks: ranges, browser-PID and window-class filtering, LOCATIONCHANGE excluded | **Pending owner item P3** | Sets which events B2 observes; D10 names "MSAA and IA2 event IDs" without exclusions |
| DR-0019 | Browser-UI alerts excluded by `hwndClass` | **Pending owner item P3**, with the hooks | Removes events from what B2 observes |
| DR-0019 | Hook thread stamps and enqueues; a resolver thread reads properties and caches | Decided by Claude under DR-0045 | Implementation detail that protects stamp accuracy |
| DR-0019 | The listener compiles in Linux CI | Decided by Claude under DR-0045 | A free standard runner; the minutes are not material. Its .NET install depends on P2 |
| DR-0019 | `attachShadow` patch; `takeRecords` ordering | Approved by the owner 2026-10-02 (DR-0030), item 7 | — |
| DR-0019 | K6 insertion-to-content delay grading | Approved by the owner 2026-10-02 (DR-0030), item 7; amended by DR-0037 | It replaces the same-batch flag now |
| DR-0020 | C's combination rules use the NVDA-absent B2 evidence | Approved by the owner 2026-10-02 (DR-0030), item 1; amended by DR-0031 | — |
| DR-0020 | Cross-leg matching by item, side and repetition index | Superseded by DR-0031 | Legs are combined at item level; repetitions are never paired across legs |
| DR-0020 | B2 collectors in the NVDA-present leg | **Pending owner item P4**. Claude's proposal is narrowed: the WinEvent listener runs in the NVDA-present leg only for the owner's 20-run on/off diagnostic, not in G1 runs; the in-page DOM timeline runs in both legs; platform focus in that leg is verified by an MSAA-only focus read | Which collectors run alongside NVDA changes which events are captured in the leg that produces C's evidence (what is measured). Item 1 covered which leg's B2 evidence C uses, not which collectors run in this leg. The narrowing also changes the G1 latency path (DR-0010) and the platform-focus method in that leg (DR-0024) |
| DR-0020 | Leg order within a dispatch counterbalanced or randomised with a recorded seed | Decided by Claude under DR-0045 | Applies HANDOFF §7.4 to legs |
| DR-0021 | Pooling of the 5% limit (gate-rules table) | Approved by the owner 2026-10-02 (DR-0030), item 3 | — |
| DR-0021 | `AUDIO` row: leg restriction | Approved by the owner 2026-10-02 (DR-0030), item 4 | — |
| DR-0021 | When preflight is recorded | Decided by Claude under DR-0045 | Implements D12 as written |
| DR-0021 | Unit of the 5% limit | Approved by the owner 2026-10-02 (DR-0030), item 3 | Per-canary reporting added by DR-0038 |
| DR-0021 | Audio check scope | Approved by the owner 2026-10-02 (DR-0030), item 4 | — |
| DR-0021 | Post-block canary | Approved by the owner 2026-10-02 (DR-0030), item 2 | Principle recorded in DR-0032 |
| DR-0021 | Ambiguous outcome evidence routed to REVIEW | Decided by Claude under DR-0045 | Follows from D12 and DR-0032: ambiguity found by inspecting the outcome cannot give INCONCLUSIVE, which leaves REVIEW as the only option PRD §20 allows |
| DR-0022 | Items whose expected symptom is excluded are reported separately as exploratory | Decided by Claude under DR-0045 | Keeps them out of the primary analysis, as D13 requires |
| DR-0025 | Image probe item | Approved by the owner 2026-10-02 (DR-0030), item 10 | — |
| DR-0025 | Desktop-session probe item | Approved by the owner 2026-10-02 (DR-0030), item 10 | — |
| DR-0025 | Note that the label check is Proposed in DR-0006 | Updated to follow DR-0006 (decided by Claude under DR-0045) | — |
| DR-0025 | Values brought to the owner before G1 (eSpeak rate; Scream thumbprint) | Superseded by DR-0040 and DR-0041 | — |
| DR-0026 | The whole record, including the validity behaviour and the schema constraints | Accepted with amendments, item 5 | Status changed in place |
| DR-0026 | Gate packages must carry `leg` and `preflight` | Superseded by owner amendment (a) | The owner makes it the rule and adds `segmentId` |
| DR-0027 | Scope beyond the owner's minimum | Decided by Claude under DR-0045 | A stricter guard on the D1 timebase |
| DR-0028 | Freeze guard design | Approved by the owner 2026-10-02 (DR-0030), item 8; scope amended by DR-0033 | — |

**Matching passages in HANDOFF v1.1 and the technical extract.** Recorded here so that HANDOFF v1.2 and the extract relabel consistently. Passages that restate a record above follow that record.

| Document | Passage | Outcome |
|---|---|---|
| HANDOFF v1.1 §5 R3, R8; §8.4 | C's evidence split; cross-leg matching | As DR-0020: approved, amended by DR-0031 |
| HANDOFF v1.1 §8.4 and §7.2 (step 2); extract §2.4 | B2 collectors in the NVDA-present leg; the platform-focus method in that leg | As DR-0020 and DR-0024: pending owner item P4 |
| HANDOFF v1.1 §7.1 | Browser-version assertion | As DR-0007: decided by Claude under DR-0045 |
| HANDOFF v1.1 §7.1, §7.3, §10.2 | v1.1 manifest fields; `maxClockSkewMs` redefinition | As DR-0026: accepted with amendments |
| HANDOFF v1.1 §7.2 | Placement of the D8, D2 and D1 checks in the handover; the order of steps 3–6 | Decided by Claude under DR-0045: procedure that implements owner-decided checks |
| HANDOFF v1.1 §7.3 | Native self-test method; interim Node wall anchor | As DR-0010: approved by the owner 2026-10-02 (DR-0030) |
| HANDOFF v1.1 §7.4 | Image-mismatch report; audio check's leg; post-block canary | As DR-0006 (decided), DR-0012 (approved) and DR-0021 (approved; DR-0032) |
| HANDOFF v1.1 §8.2 | Hook and resolver thread split | As DR-0019: decided by Claude under DR-0045 |
| HANDOFF v1.1 §8.3 | `attachShadow` patch; `takeRecords` ordering; delay grading | As DR-0019: approved; the grading replaces the same-batch flag (DR-0037) |
| HANDOFF v1.1 §9 M1 | Strict pilot; image-identity and process-integrity probe items | Approved by the owner 2026-10-02 (DR-0030), item 10 |
| HANDOFF v1.1 §9 G1 rule | Pooled validity unit | As DR-0021: approved; DR-0038 adds per-canary flags |
| HANDOFF v1.1 §9.2 | Step and script names | Decided by Claude under DR-0045 |
| HANDOFF v1.1 §9.2 | Scream install sequence | As DR-0012: amended by DR-0040 |
| Extract §3.3, §3.6, §5.4, §6.1, §8 | Open points: post-block canary, ambiguous evidence, C's B2 leg, cross-leg matching, audio scope, validity unit, "announced", family membership, native self-test method | As the corresponding DR-0010, DR-0013, DR-0020 and DR-0021 rows above; family membership is pending owner item P1 |
| Extract §4.5 | BenignType working descriptions | Decided by Claude under DR-0045, as working descriptions only. They are not used in Phase 0. The final descriptions belong in `protocol/PROTOCOL.md` and come to the owner as a hard-rule-12 item at the M6 freeze review |
| Extract §5.3 | Event-level canary expectations | As the DR-0013 predictions: decided, predictions only |

**Consequences.**

- Every inline label in DR-0001 to DR-0029 has been replaced as tabled. Seven items were left Proposed, all hard-rule-12 items: P1 (DR-0013), P2 (DR-0008, DR-0019), P3 (DR-0019), P4 (DR-0020), P5 (DR-0007), P6 (DR-0010) and P7 (DR-0005). P5 was resolved on 2026-10-03 (decided by Claude under DR-0045), so six remain. All seven keep their numbers under "Pending owner items (hard rule 12)" after the index.
- The approval covers what PR #1 proposed. Anything recorded after the review (DR-0031 to DR-0045) states its own authority.
- HANDOFF v1.2 and the extract replace their matching labels as tabled above. Code comments that carried the Proposed label (for example in `harness/src/runner/validity.ts`) are updated to the same outcomes.

## DR-0031 Item-level leg combination for C and D (amends DR-0020)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, key item 1 |
| Amends | DR-0020: C's evidence split approved; cross-leg matching replaced |
| HANDOFF v1.2 | §5 R3, R8; §8.4; §9 M5 |

**Context.**

- D11 (DR-0020) put A, B and B2 in the NVDA-absent leg and C's NVDA evidence in the NVDA-present leg. It said D applies triggers to the NVDA-absent B2 evidence and takes NVDA evidence from the NVDA-present leg. It did not say which leg's B2 evidence C uses.
- PR #1 item 1 proposed the NVDA-absent B2 evidence for C as well, and matching evidence across legs by item, side and repetition index.
- The legs are separate jobs, usually on separate runners. Repetition r in one leg shares neither a browser process nor a time window with repetition r in the other, so pairing them would treat independent runs as matched observations.
- Each arm's per-item result is computed from repetitions: an item FAILs when the symptom is seen in k of n repetitions (extract §3.5; exploratory defaults n = 3 per side, n = 5 for absence-based symptoms, k = n).

**Options considered.**

| Option | Outcome |
|---|---|
| C takes its B2 evidence from the NVDA-present leg | Not proposed: B2 under NVDA is not what the product would run (D11) |
| C takes NVDA-absent B2 evidence; legs matched by item, side and repetition index | PR #1 item 1. The evidence split is approved; repetition matching is replaced |
| C takes NVDA-absent B2 evidence; legs combined at item level, each from its own repetitions | Adopted (owner amendment) |

**Decision.**

> 1. C's B2 evidence (DR-0020): approved. C uses the NVDA-absent B2 evidence, as D does, so C and D differ only in trigger masking.
>    Amendment: combine legs at item level. Each leg derives its own per-item result from its own repetitions (k of n). Repetition indices are kept for traceability only and are never paired across legs.

**Consequences.**

| Arm | B2 evidence | NVDA evidence | Combination (R3), at item level |
|---|---|---|---|
| C_UNION | NVDA-absent leg | NVDA-present leg | FAIL if either leg's per-item result is FAIL |
| C_ADJUDICATED | NVDA-absent leg | NVDA-present leg | NVDA may downgrade a B2 FAIL to REVIEW when the NVDA-present leg's per-item result shows NVDA output unchanged between base and candidate |
| D (UNION and ADJUDICATED) | NVDA-absent leg, with triggers applied | NVDA-present leg, for triggered steps | As C, restricted by trigger masking |

- Within each leg, base and candidate are paired as before (HANDOFF §7.4), and the leg's per-item result comes from its own k of n repetitions. The two legs are then joined on the item alone.
- `EvidencePackage.repetition` stays. It identifies a run for traceability and never keys a join across legs.
- C and D now differ only in trigger masking, which keeps the H3 comparison clean.
- The M5 scorer implements the combination. No M0 code changes.
- Supersedes the "Cross-leg matching" row of DR-0020. HANDOFF v1.2 R3, R8 and §8.4, and extract §2.4 and §8, state the C split as approved and drop matching by repetition index.

## DR-0032 INCONCLUSIVE principle and the post-block canary (amends DR-0021)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, key item 2 |
| Amends | DR-0021: the post-block canary row is approved and a governing principle is added |
| HANDOFF v1.2 | §5 R9; §7.4; §12 (golden rule on INCONCLUSIVE) |

**Context.**

- D12 (DR-0021): INCONCLUSIVE only from checks completed before the outcome is known.
- HANDOFF v1.0 §7.4 voided a whole block when its post-block canary failed. A post-block canary completes after the outcome is known, so PR #1 item 2 proposed reporting the failure without converting observed outcomes.
- Timing alone is not enough. A check completed before the outcome is known can still be failed by the thing being judged; from M4, for example, a candidate build can take the foreground. The owner states the principle beneath both points.

**Options considered.**

| Option | Outcome |
|---|---|
| Void the block when its post-block canary fails (HANDOFF v1.0 §7.4) | Rejected: the block's own pages may have broken NVDA, so voiding the block could hide a finding |
| Report the failure with the block; never convert observed outcomes; the next block must pass its own pre-block canary | Adopted (PR #1 item 2) |

**Decision.**

> 2. Post-block canary (DR-0021): approved. It never converts observed outcomes.
>    Record this principle: a check may produce INCONCLUSIVE only if the thing being judged cannot cause it to fail. A post-block canary can fail because the block's own pages broke NVDA, so it cannot void outcomes.

**Consequences.**

- **The principle.** A check may produce INCONCLUSIVE only if the thing being judged cannot cause it to fail. It applies together with D12: an INCONCLUSIVE check must complete before the outcome is known, and must be one that the thing being judged cannot fail.
- **Post-block canary.** A failed post-block canary is reported with its block and never converts observed outcomes. The next block must pass its own pre-block canary. This applies from M4, when item blocks are first run.
- **Phase 0.** The pages run in Phase 0 are canaries, and the owner noted that "Canaries are fixed pages, so the current rule stands for Phase 0" (DR-0035). The D12 reason codes in `harness/src/runner/validity.ts` are unchanged.
- **From M4.** Candidate builds can fail checks themselves. The side-aware rule in DR-0035 applies the principle.
- **Ambiguous outcome evidence** goes to REVIEW, not INCONCLUSIVE (DR-0021, DR-0030): ambiguity is found by inspecting the outcome, and the thing being judged can cause it.
- `harness/src/runner/validity.ts` states the principle in its header comment.
- HANDOFF v1.2 §7.4 and R9, and extract §3.6, record the post-block handling as approved and state the principle.

## DR-0033 Freeze scope: protocol/frozen-paths.txt (amends DR-0028)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, gaps item 4 |
| Amends | DR-0028: the scope of the hash and of the clean-tree check |
| HANDOFF v1.2 | §5 R5; §9 M0 (freeze guard bullet), M6; §10.1 (layout); §10.3 (freeze-guard note); §12 (`npm run protocol:hash` command) |

**Context.**

- DR-0028 hashed the tracked files under `protocol/` only, following HANDOFF §10.3 ("the hash of `protocol/`", owner-authored v1.0).
- Split assignments (`corpus/`), scoring and runner code (`harness/src/`), journeys, the listener and the pins (`env/env.lock.json`, `package-lock.json`) can each change a verdict. Under DR-0028 any of them could change after the freeze without changing the hash.

**Options considered.**

| Option | Outcome |
|---|---|
| Hash `protocol/` only (DR-0028) | Rejected: leaves split assignments, scoring code and pins unfrozen |
| Hash every tracked file | Not adopted: documentation and gate reports would change the hash without changing any verdict |
| Hash a declared list of the paths that can change a verdict, kept inside `protocol/` | Adopted (owner) |

**Decision.**

> 4. Freeze guard scope (DR-0028): hashing protocol/ alone leaves split assignments, scoring code and pins unfrozen.
>    Add protocol/frozen-paths.txt listing every path that can change a verdict: at minimum protocol/, corpus/, journeys/, harness/src/, listener/, env/env.lock.json and package-lock.json. The guard hashes that set. Because the list lives in protocol/, changing it changes the hash.

**The frozen set** (`protocol/frozen-paths.txt`).

| Path | How it can change a verdict | Source |
|---|---|---|
| `protocol/` | Protocol, oracles, triggers, amendments, and this list | Owner minimum |
| `corpus/` | Items, patches and split assignments | Owner minimum |
| `journeys/` | Journey definitions and anchors | Owner minimum |
| `harness/src/` | Runner, collectors, adapters, oracles, scorer, validity rules | Owner minimum |
| `listener/` | B2 platform-event capture | Owner minimum |
| `env/env.lock.json` | Environment pins | Owner minimum |
| `package-lock.json` | Resolved dependency tree | Owner minimum |
| `fixtures/` | Canary pages, the SPA and the Prompt to Page exports | Decided by Claude under DR-0045 (2026-10-03) |
| `package.json` | npm scripts, including `score`, and the dependency declarations | Decided by Claude under DR-0045 (2026-10-03) |
| `.nvmrc` | Node version | Decided by Claude under DR-0045 (2026-10-03) |
| `.github/workflows/` | Run steps and flags, and the NVDA, Scream and listener setup | Decided by Claude under DR-0045 (2026-10-03) |

The four additions each control what runs or how it runs, so each can change a verdict. Freezing more paths only restricts; it is not a hard-rule-12 item.

**File format.**

- Plain text, one repo-relative POSIX path per line. Lines starting with `#` and blank lines are ignored. A trailing `/` marks a directory; any other entry is a single file. A header comment cites DR-0033.
- The list must contain `protocol/`. Absolute paths, `..` segments, backslashes and duplicate entries are rejected. The implementation adds further entry checks (see "Implementation as built").

**Hash construction** (`harness/src/score/protocolHash.ts`, replacing DR-0028's scope).

1. Read `protocol/frozen-paths.txt` from the blob committed at HEAD.
2. Collect the tracked regular files under every listed path (`git ls-files`), excluding `.gitkeep`, without duplicates.
3. Sort the repo-relative POSIX paths by code unit.
4. For each file, feed `path + "\n" + sha256hex(committed blob) + "\n"` into SHA-256.

- Computing the hash throws unless every listed path is clean. The checks are listed under "Implementation as built". Symbolic links and submodules are still refused.
- Paths are now relative to the repository root, not to `protocol/` as in DR-0028.
- `npm run protocol:hash` still prints `protocol-sha256: <hex>`, which now covers the frozen set. The tag format is unchanged: `protocol-freeze-v<N>` with one `protocol-sha256:` line.

**Implementation as built** (`harness/src/score/protocolHash.ts`; tests in `harness/src/score/protocolHash.test.ts`). **Decided by Claude under DR-0045 (2026-10-03):** the API and the checks below put into practice the owner's scope and the design approved in DR-0028 (committed blobs, a clean frozen set). Each check only adds a refusal; none changes the hash of a clean frozen set.

| Aspect | As built |
|---|---|
| API | `computeProtocolHash(repoRoot)` returns the hash as 64 lowercase hex characters. `listFrozenFiles(repoRoot)` returns the sorted repo-relative paths the hash covers, without running the clean-tree checks. These two replace DR-0028's `computeProtocolHash(rootDir = "protocol")` and `listProtocolFiles`. `repoRoot` must be the top level of a git working tree. `parseFrozenPaths(text)` validates the text of the list. `node harness/src/score/protocolHash.ts [repository root]`, which `npm run protocol:hash` runs, prints the tag line; the root defaults to this repository. The freeze guard's `repositoryFreezeDeps()`, shared by the scorer CLI and the execution guard (DR-0034), calls `computeProtocolHash` only once a freeze tag exists |
| Where the list is read | From HEAD (`HEAD:protocol/frozen-paths.txt`), never from the working tree. Hashing throws if the list is not committed. An uncommitted edit to the list makes `protocol/` dirty, so it is refused as well |
| Entries | Beyond the file format: `.` and empty segments are rejected. Every entry must match at least one tracked file (a `.gitkeep` counts), so a mistyped entry cannot silently freeze nothing. An entry without a trailing `/` that names a directory is rejected, and the error asks for the `/` |
| Files | Regular files only. Symbolic links, submodules and unresolved merge conflicts are refused |
| Git access | Read-only commands, with literal pathspecs and without optional index locks, so hashing never writes to the index. `GIT_DIR`, `GIT_WORK_TREE` and `GIT_INDEX_FILE` are not inherited, so the hash cannot be redirected to another repository |

**Clean-tree and name checks.** Computing the hash throws if any of these holds under a listed path:

| Check | What it refuses |
|---|---|
| Staged change | A change in the index that `git status` reports |
| Unstaged change | A modified or deleted working-tree file that `git status` reports |
| Untracked file | A file git does not track (`git status --untracked-files=all`) |
| Hidden index flags | An index entry flagged assume-unchanged or skip-worktree (`git ls-files -v`). Both flags hide working-tree edits from `git status` |
| Working tree against index | A frozen file whose working-tree content matches its index blob neither byte for byte nor after git's clean filters (`git hash-object`). The filtered comparison lets a `core.autocrlf=true` checkout pass. The check catches edits that `git status` misses, for example behind a stale stat cache |
| Ignored files | A git-ignored file other than operating-system noise (`.DS_Store`, `Thumbs.db`) and listener build output (any `bin/` or `obj/` directory under `listener/`). The harness reads the working tree, so an ignored file under a frozen path could change what runs without changing the hash. This is also why `.gitignore` can stay outside the frozen set |
| Control characters in names | A tracked path that contains a character from U+0000 to U+001F, or U+007F. With no newline in any path, each `path + "\n" + hex + "\n"` record parses one way, so two different frozen sets cannot feed the same bytes |

**Provenance of the checks.** The staged, unstaged and untracked checks carry DR-0028's approved clean-tree rule over to the frozen set. The hidden-flag, working-tree, ignored-file and control-character checks came from Claude's internal review during the owner-directed implementation of this record (2026-10-03). They are not auto-fixes. DR-0044's fence applies only to fixes made in response to auto-fix events, which are CI failures and review comments relayed by the desktop app. A comment in `protocolHash.ts` that attributed these checks to the PR #1 auto-fix was wrong and has been corrected. Their regression tests in `protocolHash.test.ts` belong to the same owner-directed batch.

**Consequences.**

- Changing the list, or any tracked file under a listed path, changes the hash. After a freeze, test-split scoring and execution (DR-0034) are refused until the owner tags a new freeze with the new hash.
- The freeze guard computes the live repository hash only when a freeze tag exists. `npm test` and `npm run score -- --split test` therefore behave correctly in a working tree with uncommitted changes; until M6, `--split test` still exits non-zero. No test computes this repository's real frozen hash; the hash tests use temporary git repositories.
- The hash quoted in PR #1 (`b6659e0c…c157a`) covered `protocol/` only and no longer applies.
- At freeze time, every listed path must be clean.
- Not frozen: `docs/` (decision records, lab notebook, extract, research, gate reports), `HANDOFF.md`, `CLAUDE.md`, `README.md`, `LICENSE`, `NOTICE`, `.gitignore`, `tsconfig.json`, `eslint.config.js` and `vitest.config.ts`. None of them changes what the runner executes or what the scorer computes.
- `.github/workflows/` also holds `ci.yml`, which cannot change a verdict. Freezing the whole directory is the simpler rule and errs towards freezing.
- **Decided by Claude under DR-0045 (2026-10-03):** `.github/actions/` (local composite actions) does not exist yet. A local action runs steps just as a workflow does, so it can change a verdict. Because every entry must match a tracked file, the directory cannot be listed before it exists. The change that first creates `.github/actions/` must also add `.github/actions/` to `protocol/frozen-paths.txt`. Freezing more only restricts.
- If a GPL add-on is ever approved (DR-0011), `adapters/nvda-addon/` is added to the list by a new record.
- **Amendments follow the frozen set.** After the first freeze tag exists, a change to any tracked file under a path in `protocol/frozen-paths.txt` is a protocol amendment, recorded in `protocol/AMENDMENTS.md` (DR-0028). Amendments are no longer limited to files under `protocol/`. Any such change also changes the protocol hash, so the owner must create a new freeze tag.
- HANDOFF v1.2 §9 M6 and §10.3: the hash is of the frozen set. §10.1 adds `protocol/frozen-paths.txt` to the layout.

## DR-0034 Execution guard for the test split (hard rule 5)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, gaps item 5 |
| Amends | DR-0028: the guard now covers execution as well as scoring |
| HANDOFF v1.2 | §4 (rule 5); §5 R5; §9 M4; §10.1 (layout); §10.3 (execution guard); §12 (golden rule on the test split) |

**Context.** Hard rule 5 says test-split items must not be executed before the freeze, enforced in code. DR-0028 implemented the guard for scoring only (`npm run score -- --split test`). Nothing yet stopped a runner from executing a test-split item.

**Options considered.**

| Option | Outcome |
|---|---|
| Guard scoring only (DR-0028) | Rejected: execution is what hard rule 5 forbids |
| Guard execution as well, with the same freeze check | Adopted |

**Decision.**

> 5. Hard rule 5 covers execution, not just scoring. From M4, the runner calls assertSplitAllowed before executing any test-split item.

**Consequences.**

- `harness/src/runner/splitGuard.ts` exports `assertItemExecutable(item, deps?)`. `item` is an `ExecutableItem`, the `id` and `split` of a corpus item.
  - A dev-split item always passes, without consulting git or the hash.
  - Any other split is treated as the test split (fail closed), so an unknown split value from untyped data is guarded too. The function calls `assertSplitAllowed("test", deps ?? repositoryFreezeDeps())`, the scorer's freeze guard over this repository's freeze tags and frozen set (DR-0028, DR-0033).
  - A refusal throws `ItemExecutionRefusal`, which carries `itemId` and `reason` and whose message names hard rule 5 and DR-0034. The guard turns a dependency failure, such as a frozen set that cannot be hashed because it is dirty, into a refusal.
  - When execution is allowed, the function returns the freeze decision. For the test split, that decision carries the freeze tag and hash for the run record.
  - Unit tests (`harness/src/runner/splitGuard.test.ts`) inject the deps.
- From M4, the runner calls it before executing any test-split item. M0 to M2 run canaries only and execute no corpus items.
- The guard uses the frozen-set hash (DR-0033). It refuses while no freeze tag exists, and after a freeze whenever a frozen path differs from the tagged hash.
- HANDOFF v1.2 R5 and §9 M4 state that the guard covers execution; §10.1 adds the file.

## DR-0035 Side-aware validity from M4; validity.ts is Phase 0-scoped (record now, implement before M4)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted (recorded now; implemented before M4) |
| Owner label | Owner review 2026-10-02, item 6 ("record now, implement before M4") and key item 3, amendment (c) |
| Amends | DR-0021: the validity rule, from M4. DR-0026: amendment (c) |
| HANDOFF v1.2 | §5 R9; §7.4; §9 M4; §10.1 (layout: `validity.ts`); §10.2 (amendment (c)) |

**Context.**

- The D12 checks (foreground, injection marker, audio, clock, pre-canary) were designed for Phase 0, whose pages are fixed canaries.
- From M4, base and candidate builds run in pairs. A candidate build can itself take the foreground, stall frames (a rAF gap) or crash NVDA. Under the Phase 0 rule such an attempt would be INCONCLUSIVE, which counts as a miss (R7), so a regression would be hidden. That would also breach the DR-0032 principle.

**Options considered.**

| Option | Outcome |
|---|---|
| Keep the Phase 0 rule from M4 | Rejected: check failures caused by the candidate would become INCONCLUSIVE |
| Side-aware rule from M4 | Adopted |

**Decision.**

> 3. Schema (DR-0026): accepted, with amendments:
>    (c) validity.ts is Phase 0-scoped (see item 6).

> 6. Side-aware validity. From M4, candidate builds can themselves steal foreground, stall frames or crash NVDA.
>    - A check failing on both sides gives INCONCLUSIVE.
>    - Failing on the candidate only is a finding (REVIEW unless a FAIL rule covers it).
>    - Failing on the base only gives INCONCLUSIVE for that item.
>    Canaries are fixed pages, so the current rule stands for Phase 0.

**Rule from M4.**

| A check fails on | Result |
|---|---|
| Both base and candidate | INCONCLUSIVE |
| Candidate only | A finding: REVIEW, unless a FAIL rule covers it |
| Base only | INCONCLUSIVE for that item |
| Neither | Valid |

**Consequences.**

- **Phase 0.** `harness/src/runner/validity.ts` keeps the current rule. Its header comment states the Phase 0 scope, the M4 rule and the DR-0032 principle.
- **Before M4.** `validity.ts` gains the side-aware rule, taking a preflight result per side. **Decided by Claude under DR-0045 (2026-10-03):** a check that covers both sides at once, such as the environment manifest, counts as failing on both sides.
- Which FAIL rules cover which check failures is set with the M5 oracles. That decides what counts as detection, so it comes to the owner (hard rule 12).
- Pre-block canaries are fixed pages, not sides, so their rule is unchanged. Post-block canaries follow DR-0032.
- HANDOFF v1.2 §7.4, R9 and §9 M4, and extract §3.6, record the Phase 0 scope and the M4 rule.

## DR-0036 K6 and K7 in both legs; K6a rule on the NVDA-present leg (amends DR-0013)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, other rulings |
| Amends | DR-0013: the legs for K6 and K7, and the leg on which the K6a rule is read |
| HANDOFF v1.2 | §8.4; §9 G1 report; §9 M2 and the G2 report; §9.1 (introduction, canary rules and the K6a rule) |

**Context.** DR-0013 left the legs for K6 and K7 open ("The legs for K6 and K7 are not yet decided"). Each of these canaries has an expected NVDA outcome and an expected B2 signature, and D11 puts B2 in the NVDA-absent leg.

**Options considered.**

| Option | Outcome |
|---|---|
| NVDA-present leg only (speech outcomes; no clean B2 signatures) | Not adopted |
| Both legs: speech outcomes from the NVDA-present leg, B2 signatures from the NVDA-absent leg | Adopted (owner) |

**Decision.**

> - K6 and K7 run in both legs: speech outcomes from nvda-present, B2 signatures from nvda-absent. The K6a rule is evaluated on the nvda-present leg.

**Consequences.**

| Canaries | NVDA-present leg | NVDA-absent leg |
|---|---|---|
| K6a, K6b, K6e, K7a, K7b | Speech outcome from the relay tap; the K6a rule | B2 signature |

- Run volume: 190 record-only runs per leg (K6a 60, K6b 20, K6e 70, K7a 20, K7b 20), 380 across both legs, on top of the gating runs. Runners stay free (DR-0005). The extra job-minutes appear in the G2 cost table (DR-0003), and M1a measures the per-run duration in each leg (lab notebook, 2026-10-03).
- K6 and K7 stay record-only and never decide G1 or G2 (DR-0013, DR-0021).
- The K6a rule reads "announced" (approved, DR-0030) from the NVDA-present leg's relay tap only.
- The G1 report includes the K6 and K7 speech outcomes; the G2 report includes their B2 signatures.
- No M0 code changes. The M1 and M2 runners schedule both legs.

## DR-0037 K6 insertion-to-content delay grading replaces the same-batch flag (amends DR-0013, DR-0019, HANDOFF §8.3)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, other rulings |
| Amends | DR-0013 ("flagged" in the K6a and K6b B2 signatures); DR-0019 (the delay-grading row); HANDOFF §8.3 |
| Amended by | DR-0052 (2026-10-03): for polite regions filled after load, the observed boundary replaces 150 ms (P9, provisional until confirmed against M2's NVDA-absent K6e signatures) |
| HANDOFF v1.2 | §8.3; §9 M2 and the G2 report; §9.1 (K6a and K6b signature cells) |

**Context.**

- HANDOFF v1.0 §8.3 flags live regions inserted with non-empty content in the same mutation batch. The K6 B2 signature ("Insertion with non-empty content flagged") relies on that flag.
- After load, Chrome sends non-immediate accessibility changes at most once per 150 ms (350 ms before load). A region inserted empty and filled within that window can reach the platform as though it had been inserted populated, and the same-batch flag misses it (DR-0029).
- DR-0019 proposed grading by the insertion-to-content delay and kept the flag in force until the owner approved.

**Options considered.**

| Option | Outcome |
|---|---|
| Same-batch flag (HANDOFF v1.0 §8.3) | Replaced |
| Insertion-to-content delay grading (DR-0019, PR #1 item 7) | Adopted now |

**Decision.**

> - K6 delay grading (DR-0019): approved. It replaces the v1.0 same-batch flag now.

**Consequences.**

- The mutation timeline records each live region's insertion-to-content delay in milliseconds. A fill within Chrome's serialisation window (150 ms after load, 350 ms before) is graded as possibly indistinguishable from a populated insertion.
- The same-batch flag is no longer the rule. "Flagged" in the K6a and K6b B2 signatures (HANDOFF §9.1) now means graded by this delay.
- K6e (fills after 0 ms, one rAF, 50, 100, 150, 250 and 500 ms) shows where the boundary falls on the runner. If K6e data contradict the 150 ms and 350 ms boundaries, the change goes to the owner (hard rule 12).
- The grading is implemented in the M2 in-page collector (`harness/src/collectors/`). No M0 code changes.
- HANDOFF v1.2 §8.3 drops the sentence keeping the flag in force.

## DR-0038 Per-canary INCONCLUSIVE reporting (amends DR-0021)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, other rulings |
| Amends | DR-0021: adds per-canary reporting to the pooled validity rule |
| HANDOFF v1.2 | §5 R9; §9 G1 report, G1 rule, G2 report, G2 rule |

**Context.** DR-0021 pools the 5% INCONCLUSIVE limit across K1–K5 (PR #1 item 3). A pooled rate can hide one canary with a high INCONCLUSIVE rate, for example a page that consistently fails a check.

**Options considered.**

| Option | Outcome |
|---|---|
| A 5% limit per canary | Not adopted |
| Pooled limit only (PR #1 item 3) | Approved, and extended |
| Pooled limit, plus per-canary rates with a flag above 10% | Adopted (owner) |

**Decision.**

> - INCONCLUSIVE: keep the pooled 5% limit. Also report per-canary rates and flag any canary above 10%.

**Consequences.**

- Pass and fail are unchanged: the pooled rate, (attempts − valid) / attempts over K1–K5, must be at most 0.05.
- For each canary, `inconclusiveRate = (attempts − valid) / attempts`. The threshold is the exported constant `PER_CANARY_INCONCLUSIVE_FLAG = 0.1` in `harness/src/runner/validity.ts`. A canary whose rate is strictly greater than 0.1 is flagged; exactly 10% is not. Flags are reported and never change pass or fail, so a gate with a flagged canary and a pooled rate within 5% still passes.
- `gateResult(input)` in `harness/src/runner/validity.ts` returns a `GateResult` with two fields for this record, tested in `validity.test.ts`:
  - `GateResult.perCanary` holds one `CanaryInconclusive` for each canary supplied, in K1–K5 order, with `attempts`, `valid`, `inconclusive`, `inconclusiveRate` (null when there were no attempts) and `flagged`.
  - `GateResult.flags` holds one `GateFlag` (code `CANARY_INCONCLUSIVE_RATE`, with the canary, its rate and a message) for each canary above `PER_CANARY_INCONCLUSIVE_FLAG`.
  - `GateResult.pass` is decided by `reasons` alone, so flags never change it. `gateResult` accepts the gating canaries K1–K5 only, so the record-only rates below are computed outside it, with the same formula and threshold.
- **Decided by Claude under DR-0045 (2026-10-03):** the same rate and flag are also reported for the record-only canaries, in the G1 and G2 reports, for each leg in which they run (DR-0036); they never affect any result. The owner's ruling sits with the pooled K1–K5 limit, so this extension is Claude's; it is reporting only, not a hard-rule-12 item.
- Gate reports list each canary's INCONCLUSIVE rate with its Wilson interval, the flags, and the reason codes behind each flagged canary.

## DR-0039 NVDA log bucketing via the wall anchor (amends DR-0010, DR-0011)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, other rulings |
| Amends | DR-0010 (the NVDA log parity row of the methods table); DR-0011 (tap-versus-log parity) |
| HANDOFF v1.2 | §6 (note for M5); §7.3 (NVDA log bucketing); §8.1 (second record); §12 (golden rule on NVDA log bucketing) |

**Context.**

- D1 allows one precise wall-clock anchor per process, "for human-readable times only". NVDA's log stamps its lines with wall-clock times, not QPC.
- D2 asks for tap-versus-log message-count parity per NVDA run. DR-0010 noted that a finer join (per segment) would need the wall anchor, and therefore an owner decision.

**Options considered.**

| Option | Outcome |
|---|---|
| Parity per NVDA run only | Kept, and extended |
| Bucket log lines into segments via the wall anchor, for parity counts and diagnostics | Adopted (owner) |
| Use the same bucketing for latency, ordering or validity | Rejected (owner) |

**Decision.**

> - NVDA log: bucketing log lines into segments via the wall anchor is allowed for parity counts and diagnostics. Never use it for latency, ordering or validity.

**Consequences.**

| Use of wall-anchor bucketing of NVDA log lines | Allowed |
|---|---|
| Per-segment message-count parity (tap `speak` messages against the log's "Speaking" lines) | Yes |
| Diagnostics, such as the failure taxonomy or NVDA errors near a segment | Yes |
| Latency | No |
| Ordering of evidence | No |
| Validity (INCONCLUSIVE) | No |

- Segment boundaries (QPC) are converted to wall time through the process's wall anchor, and log lines are assigned by their wall times. Until M2 the Node anchor is coarse on Windows (0 to about 15.6 ms, DR-0010), so a line near a boundary can land in the wrong segment. **Decided by Claude under DR-0045 (2026-10-03):** the boundary handling is fixed in M1b and recorded in the lab notebook.
- Per-run parity (D2) remains required.
- Corroborating a detection with segment-level log lines is not a parity count or a diagnostic, so it falls outside this ruling (see DR-0042).

## DR-0040 Scream Authenticode verification (amends DR-0012)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, other rulings |
| Amends | DR-0012: the signer check, install step 4 and the TOFU paragraph. Also DR-0025 (the audio probe) |
| HANDOFF v1.2 | §7.1 (audio); §9 M1a (probe items); §9 G1 report; §9.2 (install step) |

**Context.**

- D3: verify the signer certificate thumbprint before adding the certificate to TrustedPublisher. DR-0012 left the thumbprint `pending-M1a`. The SHA-256 pin is trust on first use, because GitHub publishes no digest for the release.
- A thumbprint identifies the certificate that signed the driver. It does not show whether the signature verifies or whether the certificate chains to a trusted root. Adding a certificate to `LocalMachine\TrustedPublisher` trusts every driver it signs.

**Options considered.**

| Option | Outcome |
|---|---|
| Thumbprint only (D3 as written) | Extended |
| Authenticode signature status, signer and issuer, as well as the thumbprint | Adopted (owner) |

**Decision.**

> - Scream (DR-0012): check the Authenticode signature status, not just the thumbprint, and record signer and issuer.
>   - If the chain is valid and the signer is consistent with the release, pin the thumbprint without asking me.
>   - If it is self-signed, state in DR-0012 that authenticity rests on trust on first use, and ask.

**Consequences.**

| M1a result | Action |
|---|---|
| Chain valid, and signer consistent with the release | Claude pins the thumbprint in `env/env.lock.json` (status `pinned`) and records status, signer and issuer, without asking |
| Self-signed | DR-0012 gains a statement that authenticity rests on trust on first use. The owner is asked (a hard-rule-12 security item) before anything is added to TrustedPublisher |
| Any other result, for example unsigned, a hash mismatch, or a chain that fails for another reason | **Decided by Claude under DR-0045 (2026-10-03):** treated like the self-signed case, as the conservative reading. The result is recorded, nothing is added to TrustedPublisher, and the owner is asked |

- `env/env.lock.json`: the `scream` entry gains `signatureStatus`, `signer` and `issuer`, each `null` with status `pending-M1a` until M1a records them, alongside `signerThumbprint`. `harness/src/policy/envLock.ts` and its tests validate the new fields.
- Install step 4 (DR-0012) becomes: verify the Authenticode signature status, signer, issuer and thumbprint against env.lock, and fail on any mismatch.
- The M1a lab-notebook entry records the evidence for "consistent with the release" next to the values it judges.
- M1a also records where `devcon` comes from. A separate download would be a hard-rule-12 security item (DR-0012).

## DR-0041 eSpeak NG at NVDA's default rate (amends DR-0017)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, other rulings |
| Amends | DR-0017: the numeric rate. Also DR-0025 (the values to bring to the owner before G1) |
| HANDOFF v1.2 | §7.1 (NVDA configuration); §9 M1a; §9 G1 report |

**Context.**

- D8: "eSpeak NG bundled with NVDA, declared rate, rate boost off". DR-0017 left the numeric rate to be proposed from M1a data, and PR #1 item 10 repeated this.
- What NVDA's default is, read from NVDA release-2026.2 source (desk reading; verified before the review was recorded):

| Source (NVDA release-2026.2) | Finding |
|---|---|
| `source/synthDrivers/espeak.py:216` | The eSpeak NG driver's `__init__` sets `self.rate = 30` |
| `source/synthDriverHandler.py:365-385` | On the first load of a synth's configuration section, `SynthDriver.initSettings` keeps the driver's own initial values and saves them |
| `source/autoSettingsUtils/driverSetting.py:91` | The generic numeric driver-setting default of 50, which does not apply because eSpeak sets its rate in `__init__` |
| `source/synthDrivers/espeak.py:388` | `_rateBoost` defaults to `False` |

- So NVDA's default eSpeak NG rate on a fresh configuration is 30 on NVDA's 0–100 scale, with rate boost off.

**Options considered.**

| Option | Outcome |
|---|---|
| A numeric rate proposed from M1a data (DR-0017; PR #1 item 10) | Superseded |
| NVDA's default rate for eSpeak NG, rate boost off | Adopted (owner) |

**Decision.**

> - eSpeak rate (DR-0017): NVDA's default rate for eSpeak NG, rate boost off. Bring it back only if M1a gives a reason.

**Consequences.**

- The declared rate (D8) is NVDA's default for eSpeak NG: 30 on a fresh configuration. Rate boost is off.
- The `nvda.ini` committed in M1 must not set an eSpeak rate. The effective rate is read from the running synth and recorded in every run's manifest (`EnvManifest.synth.rate`).
- `env/env.lock.json` gains `nvda.synth`: `{ name: "espeak", rate: "nvda-default", rateBoost: false }`, with a note that the expected value is 30 (`espeak.py:216`; `synthDriverHandler.py:365-385`) and that the effective rate is recorded per run. `harness/src/policy/envLock.ts` and its tests validate it.
- M1a checks the effective rate (lab notebook, 2026-10-03). A value other than 30 is a reason under the owner's wording and goes back to the owner (hard rule 12). One way it could happen: an inherited configuration that already holds an eSpeak section, since the Guidepup build's own configuration pins oneCore settings (DR-0017).
- A rate that differs from 30 is not a synth fallback, so `SYNTH_FALLBACK` is unchanged.
- Supersedes DR-0017's numeric-rate part and the rate half of DR-0025's last bullet.

## DR-0042 M5 planning note: ANNOUNCEMENT_DUPLICATED is anti-conservative (relates to DR-0022)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted (planning note for M5) |
| Owner label | Owner review 2026-10-02, other rulings |
| Relates to | DR-0022 (the bias analysis); DR-0039 (limits on log bucketing) |
| HANDOFF v1.2 | §5 R10; §6 (note for M5); §9 M5 |

**Context.**

- D13 (DR-0022) measures H2 on what NVDA queues to speak plus global cancels. Claude's analysis of the resulting bias in DR-0022 says it "can also overstate ANNOUNCEMENT_DUPLICATED when a queued copy is cancelled before it is heard".
- An overstated duplicate credits C with detections a listener would not hear. For H2 that is anti-conservative: it favours the hypothesis.

**Options considered.** For M5 to settle: duplicates need corroboration from the NVDA log, or route to REVIEW.

**Decision.**

> - Note for M5: your own bias analysis shows ANNOUNCEMENT_DUPLICATED is anti-conservative. Plan for duplicates to need NVDA-log corroboration or to route to REVIEW.

**Consequences.**

- M5 plans the ANNOUNCEMENT_DUPLICATED oracle so that a duplicate seen only in the relay tap either needs corroboration from the NVDA log or routes to REVIEW.
- Which of the two, and what counts as corroboration, decides what counts as detection. It comes to the owner at M5 (hard rule 12).
- Constraint to carry into M5: DR-0039 allows wall-anchor bucketing of log lines only for parity counts and diagnostics. Corroborating a detection with segment-level log lines would need another join method or a further owner decision.
- The G1 and G2 reports state the bias (DR-0022). No Phase 0 code changes; M3–M7 stay locked until the owner approves G2.

## DR-0043 Schedule: G1 target 23 Oct 2026; M2 in parallel with M1 (amends DR-0003)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, schedule |
| Amends | DR-0003 (schedule within the stop dates); DR-0004 (the G1 target date Claude was to propose) |
| HANDOFF v1.2 | §2 (Schedule row, added); §9 (introduction: schedule paragraph; M2); §9.2 (M2 workflow changes may land before G1); §12 (CLAUDE.md "Current authorisation") |

**Context.**

- DR-0003: the G2 report is due by Fri 6 Nov 2026, otherwise stop and report; the Phase 1 decision is on Fri 27 Nov 2026. DR-0004: gate reviews take up to 3 working days, and Claude was to propose a G1 target in the M1 plan.
- HANDOFF v1.1 §9 sequenced M2 after G1. With a review window of up to 3 working days after G1, a fully sequential M2 would leave little time before 6 Nov.

**Options considered.**

| Option | Outcome |
|---|---|
| Sequential: M2 starts after the owner approves G1 | Replaced |
| The M2 listener and the NVDA-absent leg are built in parallel with M1; only the G2 report waits for G1 | Adopted (owner) |

**Decision.**

> - G1 report target: Fri 23 Oct 2026.
> - Build the M2 listener and the NVDA-absent leg in parallel with M1. Only the G2 report waits for G1.

**Consequences.**

| Date | Event | Source |
|---|---|---|
| After PR #1 is merged | M1a starts | DR-0045 |
| Fri 23 Oct 2026 | G1 report target | This record |
| By Wed 28 Oct 2026 | Owner's G1 review (3 working days) | DR-0004 |
| By Fri 6 Nov 2026 | G2 report, otherwise stop and report | DR-0003, unchanged |
| Fri 27 Nov 2026 | Phase 1 proceed/stop decision | DR-0003, unchanged |

- Branches `m1-*` and `m2-*` may run in parallel. Each milestone keeps its own branch, and the owner merges at gates (HANDOFF §9, §11).
- Only the G2 report waits for G1. Work on the listener and the NVDA-absent leg, and the G2 runs, may proceed before the owner's G1 decision; the G2 report is opened after it.
- The G2 report is still due by 6 Nov 2026 (DR-0003). A G1 review completed by 28 Oct leaves 7 working days (29 Oct to 6 Nov) for it.
- Authorisation is unchanged: M0–M2 only. M3 onwards stays locked until the owner approves G2.

## DR-0044 Auto-fix fence for PR #1

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, auto-fix |
| HANDOFF v1.2 | §12 (change-log note only: the fence is not in the CLAUDE.md block) |

**Context.** Auto-fix was enabled for PR #1 on 2026-10-02 through the desktop app's CI monitor. It lets Claude push fixes in response to auto-fix events: a failed CI check, or a review comment that the desktop app relays. Some files carry decisions or guard rules, and changing them to turn CI green would defeat the guards.

**Options considered.**

| Option | Outcome |
|---|---|
| No auto-fix | Not adopted |
| Unrestricted auto-fix | Not adopted |
| Auto-fix for PR #1, with a fence | Adopted (owner) |

**Decision.**

> - Yes, for this PR, with a fence. Fixes may change code, but never tests, policy rules, workflow permissions or pins, env.lock, protocol/ or decision records. If a fix needs any of those, stop and ask.

**Consequences.**

- Scope: PR #1 only. The permission ends when PR #1 is merged or closed.
- **Decided by Claude under DR-0045 (2026-10-03):** how the fence maps to paths. Anything in doubt counts as fenced.

| Fenced item (owner's words) | Paths |
|---|---|
| Tests | `**/*.test.ts`, `harness/test/**`, `harness/src/schema/__fixtures__/**` |
| Policy rules | `harness/src/policy/**`, including the rule tables and the tripwire digests |
| Workflow permissions or pins | `permissions:` blocks and `uses:` lines in `.github/workflows/**` |
| env.lock | `env/env.lock.json` |
| protocol/ | `protocol/**`, including `protocol/frozen-paths.txt` |
| Decision records | `docs/DECISIONS.md` |

- An auto-fix may change other code, such as `harness/src/**` outside the fenced paths. If a fix needs a fenced path, Claude stops and asks.
- **Decided by Claude under DR-0045 (2026-10-03):** the fence applies only to fixes made in response to an auto-fix event. Work that implements the owner's review is owner-directed, not auto-fix, so the fence does not apply to it. The same holds for Claude's internal-review fixes to that work and for regression tests of code written in it. That work comprises:
  - directed by the owner: `protocol/frozen-paths.txt`, the frozen-set hash and the freeze guard, with their tests (DR-0033); the amendment scope in `protocol/AMENDMENTS.md`, which follows the frozen set (DR-0033); the execution guard and its tests (DR-0034); the schema amendments with their tests and fixtures (DR-0026, amendments (a) and (b)); the per-canary flag and the Phase 0 scope note in `validity.ts`, with their tests (DR-0038; DR-0026 amendment (c), DR-0035); and these decision records;
  - Claude's implementation of owner rulings, decided under DR-0045: the env.lock Scream and synth fields, with their `envLock.ts` schema and tests (DR-0040, DR-0041);
  - Claude's decisions logged under DR-0045 in the same batch: the env.lock status `pending-owner` for `actions/setup-dotnet`, with its `envLock.ts` schema and the env.lock test that enforces it (DR-0008, P2), and the resolution of P5 (DR-0007);
  - fixes from Claude's internal review of that work, with their regression tests: for example, the hidden-flag, working-tree, ignored-file and control-character checks in `protocolHash.ts` (DR-0033);
  - label and DR-reference updates in code comments and test names, including in policy files, which change no rule (DR-0030).
- A comment in `protocolHash.ts` attributed the internal-review checks to the PR #1 auto-fix. That attribution was wrong and has been corrected (DR-0033).

## DR-0045 Escalation and gate-brief process (owner delegation)

| | |
|---|---|
| Date | 2026-10-02 (owner review; recorded 2026-10-03) |
| Status | Accepted |
| Owner label | Owner review 2026-10-02, process |
| Amends | DR-0004 (the weekly-list proposal) |
| HANDOFF v1.2 | §2 (Escalation row, added); §4 (rule 12); §9 (introduction: gate brief); §11 (escalation, gate-report item 4, gate brief); §12 (golden rule on stopping to ask, now including security and limited to hard-rule-12 items; golden rule on the gate brief); notes on conditional items that go to the owner in §5 R9, §6, §7.1 and §9.2; the "Decided by Claude under DR-0045" labels throughout |

**Context.**

- Hard rule 12: stop and ask whenever a choice would change what the experiment measures, what counts as detection, or the cost envelope.
- In M0 every gap Claude filled was labelled "Proposed by Claude (not yet owner-approved)", and PR #1 asked ten yes/no questions. DR-0004 proposed a weekly list. The owner has 3 hours a week (DR-0004).

**Options considered.**

| Option | Outcome |
|---|---|
| Every gap Claude fills goes to the owner (M0 practice) | Replaced |
| A weekly batched list (DR-0004 proposal) | Replaced |
| Only hard-rule-12 items go to the owner, with a one-page brief at each gate | Adopted (owner) |

**Decision.**

> - From now on, bring me only hard-rule-12 items: what is measured, what counts as detection, cost and security. Decide and log everything else yourself.
> - At each gate, give me a one-page brief with at most 10 yes/no items, each with your recommendation.
> - I will apply the D7 settings, then merge once CI is green. Start M1a after the merge.

**Consequences.**

- **Escalation set.** The owner's four categories: what is measured, what counts as detection, cost and security. Security joins hard rule 12's three.
- **Classification. Decided by Claude under DR-0045 (2026-10-03), applied strictly:**

| Category | Includes |
|---|---|
| What is measured | NVDA, Chrome or listener settings that change what is observed; which events, speech or DOM records are captured; corpus and catalogue scope; validity rules beyond putting the owner's wording into practice |
| What counts as detection | Verdict rules, FAIL definitions, combination rules, canary outcomes and signatures, gate criteria |
| Cost | Anything that raises CI minutes or model spend materially; any paid service; larger runners |
| Security | Any new third-party Action, download, driver or other code that runs in CI or on a runner; any step that accepts a new risk, such as trusting a certificate that no owner-approved component already trusts, or adding one to a system store |

- **P5, the `yaml` dev dependency. Decided by Claude under DR-0045 (2026-10-03):** resolved without escalation, although it was first listed under the security row (DR-0007). The facts that decided it are specific to this package. It is dev-only, has no dependencies of its own, is exactly pinned with a lockfile integrity hash and carries the ISC licence. It runs only in the Linux CI job, under `contents: read` with no secrets, and it exists to enforce hard rule 3. The decision sets no general exemption: other new third-party code that runs in CI or on a runner stays a security item.
- Restrictions that only reduce exposure, cost or perturbation are decided by Claude, unless they also change what is observed. Removing a collector from a leg is a measurement change, not such a restriction, because it changes which events are captured. The method that then takes over the removed collector's job is a measurement change for the same reason; an example is how platform focus is verified in the NVDA-present leg. Both stay **Proposed by Claude (not yet owner-approved)** as pending owner item P4 (DR-0020), and neither is in force until the owner decides. Where a conservative choice avoids an escalation, Claude takes it and logs it: for example, NVDA caching with `actions/cache` is not adopted in Phase 0, and NVDA settings stay at NVDA's defaults unless the owner decided otherwise.
- **Logging.** Claude's decisions carry "Decided by Claude under DR-0045 (<date>)" where they appear, and substantive ones get a decision record.
- **Pending items.** Hard-rule-12 items keep "Proposed by Claude (not yet owner-approved)" and are listed under "Pending owner items (hard rule 12)" after the index.
- **Gate brief.** At each gate the PR carries a one-page brief, alongside `docs/gates/G<n>.md`, with at most 10 yes/no items, each with Claude's recommendation. An item needed before a gate is put to the owner when it is first needed, in the same yes/no form with a recommendation. Items not needed before the next gate wait, so that each brief stays within 10.
- **Owner actions.** The owner applies the D7 settings (DR-0016) and merges PR #1 once CI is green. M1a starts after the merge.
- Supersedes DR-0004's weekly-list proposal. HANDOFF v1.2 §11 adds the gate brief, and the CLAUDE.md golden rule on stopping to ask adds security.

## DR-0046 Owner approvals of 2026-10-03

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted |
| Owner label | Owner reply 2026-10-03 |
| HANDOFF v1.3 | Header; Changes in v1.3; §7.2 (step 2); §8.4; §9.1; §9.2; §12 |

**Context.** After applying the owner review of M0, Claude put five hard-rule-12 questions to the owner, each with a recommendation (DR-0045). Four were needed before M1b and M2 work; the fifth concerned model spend against the £150 cap (DR-0005).

| # | Question | Claude's recommendation |
|---|---|---|
| 1 | Add the `ghs_`, `ghu_` and `ghr_` GitHub token families to the repository-safety test (PR #1 review comment; outside the auto-fix fence, DR-0044) | Yes |
| 2 | P1: fix the reading of the K6a rule (creation-time family membership) as listed in DR-0013, before any K6a data exist | Yes |
| 3 | P2: adopt `actions/setup-dotnet` v6.0.0 (`a98b56852c35b8e3190ac28c8c2271da59106c68`) for the listener build | Yes |
| 4 | P4: in the NVDA-present leg, run the WinEvent listener only for the 20-run on/off diagnostic, and verify platform focus there with an MSAA-only read (no UIA client) | Yes |
| 5 | Cost: about 10 million subagent tokens were used by four multi-agent runs; use multi-agent review only at gates and work lighter in between | Yes |

**Options considered.** Yes or no on each item.

**Decision.**

> Yes to all five; merged, start M1a

**Consequences.**

- Item 1: `harness/test/policy/repoSafety.test.ts` detects GitHub App installation (`ghs_`), user-to-server (`ghu_`) and refresh (`ghr_`) tokens, with token-shaped test samples.
- Item 2: P1 is resolved; DR-0013's reading of the creation-time family is fixed before any K6a data exist (HANDOFF §9.1).
- Item 3: P2 is resolved; `env/env.lock.json` gives `actions/setup-dotnet` the status `pinned`. The `pending-owner` mechanism and its tests stay for any future Action (DR-0008).
- Item 4: P4 is resolved (HANDOFF §7.2, §8.4; DR-0020, DR-0024).
- Item 5: multi-agent orchestration is used only for gate reviews; between gates Claude works single-agent, flags token-heavy work before running it, and estimates model spend in each gate report (golden rule in HANDOFF §12 and `CLAUDE.md`). P7 (who monitors the cap) stays pending for the G1 brief.
- Pending owner items after this record: P3, P6 and P7.
- PR #1 was merged on 2026-10-03 and M1a starts on branch `m1-nvda`.
- **Decided by Claude under DR-0045 (2026-10-03):** placeholder `phase0-probe.yml` and `phase0-nvda.yml` workflows are added to `main` with only a `workflow_dispatch` trigger and a single echo step on `ubuntu-24.04`, because GitHub dispatches a workflow only if its file exists on the default branch; `gh workflow run <file> --ref <branch>` then runs the branch's version. The M1a probe workflow on `m1-nvda` also runs on pushes to that branch that touch its files, so probes do not wait for this pull request.

## DR-0047 Scream pinned from M1a; in-repository installer; both legs

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted |
| Owner label | Decided by Claude under DR-0040 (the owner's rule for pinning a valid signature) and DR-0045 |
| HANDOFF v1.4 | §7.1 (audio); §9.2 |

**Context.** The M1a probe runs on 2026-10-03 (lab notebook, "M1a runner probes") recorded Scream 3.6's Authenticode signature and showed that, without an audio device, eSpeak NG cannot open audio and NVDA falls back to oneCore, which D8 makes INCONCLUSIVE. Scream's archive bundles `devcon.exe`, which is not signed.

**Options considered.**

| Question | Options | Outcome |
|---|---|---|
| Scream signature | Pin (valid chain, signer consistent with the release); ask the owner (self-signed or other) | Pin: `Scream.sys` and `scream.cat` are Authenticode `Valid`; signer Tom Kistner, who is the GitHub release author `duncanthrax`; issuer Sectigo RSA Code Signing CA, chaining to USERTrust; timestamped; not self-signed |
| Creating the device | The archive's unsigned `devcon.exe`; the Windows Kits `devcon.exe` (present on `windows-2022` only); a separate WDK download (a security item for the owner); an in-repository SetupAPI installer | In-repository installer: no unsigned third-party executable and no new download |
| Legs | NVDA-present leg only; both legs | Both legs, so the two legs differ only in NVDA |

**Decision.** Under the owner's rule in DR-0040 ("If the chain is valid and the signer is consistent with the release, pin the thumbprint without asking me") and under DR-0045:

- `env/env.lock.json` pins the signature status `Valid`, the signer, the issuer and the signer thumbprint `B2353603B4837C7A86A01D12A2B34DA7B5F2D368`.
- `harness/src/probes/scream.ps1` creates the device with `RootDevice`, which makes the same SetupAPI and `newdev` calls as `devcon install` (`SetupDiCreateDeviceInfo`, `DIF_REGISTERDEVICE`, `UpdateDriverForPlugAndPlayDevices`), only after the signature matches the pins and the certificate is added to TrustedPublisher. The archive's `devcon.exe` is never run.
- Scream is installed in both legs. The audio preflight check stays in the NVDA-present leg only (approved by the owner, DR-0030).

**Consequences.**

- M1a run 37112285497 installed Scream this way on both labels: "Scream (WDM)" and the endpoint "Speakers (Scream (WDM))", both OK. eSpeak NG then loaded with no audio errors.
- The effective eSpeak NG rate was 30 with rate boost off, as DR-0041 predicted, so its conditional owner question does not arise.
- The M1a checks behind P4 (MSAA-only focus read: 80 of 80) and D8 (injection marker and virtual buffer: 40 of 40) passed; P6's clock data are in the lab notebook and go to the owner with the segment-drift data from the M1b pilot, before any G1 run.
- The Scream signer certificate expired in 2023 and validates through its timestamp; Windows loaded the driver on both images. If a future image refused it, the audio preflight would make every NVDA-present attempt INCONCLUSIVE rather than silently changing the synth.

## DR-0048 M1b canary-run design

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted (P8 approved by the owner on 2026-10-03, DR-0049; the speech-matching rule, P11, approved by the owner on 2026-10-03, DR-0052) |
| Owner label | Decided by Claude under DR-0045; P8 approved by the owner (DR-0049) |
| HANDOFF v1.4 | §7.2, §8.1, §9 (M1b, M1d), §9.1 (implemented as stated) |

**Context.** M1b builds the canary runner, the relay tap and the report. The smoke pilot (run 37114407343, `windows-2025`, K1–K5 twice each) showed the instrument path working end to end: every preflight valid, every evidence package valid, tap-versus-log parity 76 of 76. All 10 gating attempts were scored FAIL only because NVDA's speech dictionaries rewrite text before it is queued ("K1" arrives as "K 1"); re-scored with the matching below, all 10 pass, 557–636 ms after activation.

**Decision.**

| Item | Decision |
|---|---|
| Speech matching (P11) | **Approved by the owner 2026-10-03 (P11; DR-0052):** an utterance "contains the text" when its letters and digits, lower-cased, contain the expected text's letters and digits (`speechKey`); K3 requires the name immediately followed by the role ("K3 target button" then "button"). It is more lenient than literal matching (case, spaces and punctuation are ignored) and was adopted after the smoke run scored 10 conveyed canaries as FAIL; G1's result rests on it, so it went to the owner, who ratified it at G1 |
| Relay tap | Attached once per NVDA run, right after NVDA starts, so it is attached before every segment (D2) and tap-versus-log parity covers the whole run |
| Activation | NVDA-present leg: OS-level Enter through NVDA on the focused "Start canary" button (the NVDA-absent leg uses a Playwright click; DR-0053); the canary behaviour runs 500 ms later (D4); the observation window is 4000 ms from activation; K1's deadline is 3.5 s after activation (3 s after insertion) |
| Handover order | Foreground and verify; DOM-focus the anchor in setup; MSAA-only focus read (P4); injection marker and virtual buffer (D8); clock checks; 1.5 s settle; segment |
| Evidence | One gate evidence package per attempt (DR-0026 amendment a), `side: "base"` (canaries have no candidate), item id with any variant suffix (for example `K6a:polite`) |
| K6a | Run once, in the G1 dispatch, so the pre-registered rule (DR-0013) has a single look; pilots exclude K6a |
| Pre-canary (P8) | **Approved by the owner 2026-10-03 (DR-0049):** in Phase 0 canary runs `preCanaryOk` is always true, because each canary is itself the known-answer check (PRD §19); a capture failure therefore counts as a canary failure. The anchor's focus announcement is recorded per attempt (`anchorSpeech`) so the alternative can be computed |

**Consequences.**

- `report:phase0` scores G1 from the recorded tap events with these rules; the decision does not change any gate number.
- Until the owner answers P8, G1 runs use the conservative reading above. If the owner prefers the anchor announcement as the pre-canary, it can be applied to the recorded data without re-running.

## DR-0049 Owner approvals of P6 and P8

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted |
| Owner label | Owner reply 2026-10-03 |
| HANDOFF v1.4 | No text change; the gate rules it relies on are unchanged |

**Context.** Before the G1 run, Claude put the two hard-rule-12 items it needed to the owner, with the M1a and M1d pilot data (lab notebook 2026-10-03): P6, the computation of four D1 clock checks (DR-0010), and P8, the Phase 0 reading of the pre-canary check (DR-0048).

**Decision.**

> Yes to P6 and P8; dispatch the G1 run

**Consequences.**

- P6: the DR-0010 methods for page-mapping uncertainty, segment drift, low-resolution TimeTicks and the rAF gap are the D1 INCONCLUSIVE tests, as implemented in `harness/src/runner/clockChecks.ts`.
- P8: in Phase 0 canary runs `preCanaryOk` is always true; a capture failure counts as a canary failure. The anchor announcement stays recorded per attempt.
- Pending owner items after this record: P3 (listener event scope, before any G2 run) and P7 (spend monitoring, for the G1 brief). The K6e result has triggered DR-0037's conditional question, now pending as P9 in the G1 brief.
- The G1 run is dispatched on 2026-10-03 with these rules in force.

## DR-0050 G1 top-up and evidence archive

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted |
| Owner label | Decided by Claude under DR-0045 |
| HANDOFF v1.4 | §9 (G1), R12 (archive) |

**Context.** The G1 run (37115887572; 50 attempts per gating canary) left K2 with 49 valid runs, because one attempt was INCONCLUSIVE (`FOREGROUND_HWND`). D12 requires at least 50 valid runs per canary. D6 requires the gate evidence to be archived from the local machine.

**Decision.**

- **Top-up.** A gating canary short of 50 valid runs gets a separate dispatch on the same commit, with a new recorded seed and retries off. Size: the shortfall plus 2, fixed before dispatch. Every top-up attempt counts, whatever its outcome. This rule was set after the G1 run's outcomes were known (0 failures), but the top-up's size depended only on the INCONCLUSIVE count. For G1: 3 K2 attempts (run 37116418050, commit `f81bcd7`, seed 20261006), all valid and all passing; K2 has 52 valid runs of 53.
- **Archive.** All eight M1 workflow runs (probes 37111758115, 37111906022, 37112285497 and 37114407991, the last push-triggered by commit 8992346; smoke 37114407343; pilot 37114709402; G1 37115887572; top-up 37116418050) and the combined report are in `g1/g1-evidence.tar.zst` on the orphan `results` branch (1,128,179 bytes; SHA-256 `9e8a6d7b0e21a71e8237b8de4b6d5e9ab8999bf7757478e9f0e554ab5e3c4ca0`), with `MANIFEST.json` (run IDs, head commits, image versions, pins, the G1 result) and `SHA256SUMS`. The bundle holds logs, JSON, INI and screenshots only, and was scanned for token-shaped secrets before commit. A first bundle (seven runs) was replaced after the G1 gate review found the eighth run missing.

**Consequences.**

- `docs/gates/G1.md` reports the G1 run and the top-up together. Its reproduction steps rebuild §2.1, §2.2, the cancel timing, §2.4 and the validity, parity and clock rows of §2.5 from the archived bundle with `report:phase0`, verified on 2026-10-03.

## DR-0051 Handover focus-read retry

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted (P10 approved by the owner on 2026-10-03, DR-0052) |
| Owner label | P10, approved by the owner 2026-10-03 (DR-0052) |
| HANDOFF v1.5 | §7.2 (step 2) |

**Context.** Both G1 INCONCLUSIVEs (2 of 443 attempts) were the handover's platform-focus check: Chrome was in the foreground, but the MSAA focus read, taken 300 ms after the anchor's DOM focus, returned the document. NVDA announced the anchor afterwards in both attempts, so platform focus most likely settled later (inferred).

**Options considered.** Keep the single read at 300 ms; retry the read until it returns the anchor or 1 s has passed.

**Decision.** **Approved by the owner 2026-10-03 (P10; DR-0052):** from M2 onwards, the check retries the MSAA read every 100 ms for up to 1 s and rules `FOREGROUND_HWND` only if the anchor is not returned by then. The check stays pre-outcome. G1's results are unchanged.

**Consequences.** Fewer attempts should be INCONCLUSIVE for a reason unrelated to the canary; the number of reads is recorded per attempt.

## DR-0052 Owner approvals at the G1 gate

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted |
| Owner label | Owner reply 2026-10-03 |
| HANDOFF v1.5 | Header; label legend; §7.2 (step 2); §8.2; §8.3; §9 (G1 accepted); §9.1 (speech matching) |

**Context.** The G1 pull request (#4) carried the G1 report and a one-page brief with six yes/no items, each recommended Yes: accept G1 and merge M1; P3 (listener event scope); P7 (owner monitors model spend); P9 (post-load K6 boundary for polite regions); P10 (focus-read retry); P11 (canary speech matching).

**Decision.**

> Yes to all six; merged, continue M2

**Consequences.**

- G1 is accepted: the speech instrument (relay tap, canary runner, report) passes the D12 rule with the K2 top-up of DR-0050. M1 is merged to `main` (pull request #4, merge commit `3c3b183`). The G2 report may now be written when its runs are done (DR-0043).
- P3: the listener's hook ranges, browser-PID and window-class filtering and the browser-UI alert exclusion (DR-0019) are in force for the G2 runs. The final ranges are confirmed from M2 data; a change that adds or removes events goes back to the owner.
- P7: the owner monitors model spend against the £150 cap; Claude keeps flagging token-heavy work and estimating spend in each gate report (DR-0005).
- P9: for polite live regions filled after page load, a fill in the same frame (0 ms or one rAF) is graded as a populated insertion, a fill 50 ms or more after insertion as a separate update, and a fill between one frame and 50 ms routes to REVIEW. The 350 ms pre-load boundary and other region roles keep DR-0037's grading until tested. The rule is provisional: the G2 report confirms it against the NVDA-absent K6e B2 signatures, and data that contradict it go back to the owner.
- P10: from M2 the handover's MSAA focus read is retried every 100 ms for up to 1 s (DR-0051). G1's results are unchanged.
- P11: the canary speech-matching rule of DR-0048 is ratified.
- No owner items are pending after this record.

## DR-0053 M2 build: listener integration and B2 signatures

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted (P12 and P13 approved by the owner on 2026-10-03, DR-0055) |
| Owner label | Decided by Claude under DR-0045; P12 and P13 approved by the owner (DR-0055) |
| HANDOFF v1.5 | §7.2, §8.2, §8.3, §8.4, §9 (M2), §9.1, §9.2 (implemented as stated); §7.3 with one departure (wall anchor, below) |

**Context.** M2 integrates the B2 listener (DR-0019) and the DOM mutation timeline (HANDOFF §8.3) with the canary runs, and verifies the expected B2 signature of each gating canary in the NVDA-absent leg (G2). The smoke run [37119067877](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37119067877) (NVDA-absent leg, K1–K5 twice each, commit `8e7bce1`) was the listener's first Windows run: all six hook ranges installed, the UIA self-check validated in 10 of 10 attempts, Chrome exposed each DOM id as the UIA AutomationId, and all 10 attempts matched their signatures.

**Decisions (Decided by Claude under DR-0045).**

| Aspect | Decision |
|---|---|
| Listener lifetime | One listener per attempt, started for that attempt's browser process after launch and before the handover, stopped after the observation window. Each job first starts and stops it against the Node process, so a broken build fails the job before any attempt |
| Native self-test | The approved method (DR-0010) pings each native collector: in the NVDA-absent leg the Windows helper and the listener, over stdin and stdout; the recorded disagreement is the larger of the two. Both values are kept |
| Timeline | Installed with `addInitScript` in both legs (P4). Insertions record their parent, so a text change inside a region can be attributed. Page times map to QPC as NavigationStart + `performance.now()` minus the minimum-RTT offset (HANDOFF §7.3) |
| Raw evidence | Every listener event of the attempt and the whole DOM timeline are written to the attempt record, and the evidence package carries those inside the observation window, so signatures can be re-scored offline |
| P10 | The MSAA focus read is retried every 100 ms for up to 1 s after the first read at 300 ms; the number of reads is recorded |
| eSpeak rate | Read from the session `nvda.ini` at each NVDA start, as in M1a (DR-0041); with no `[[espeak]]` section the effective rate is 30 and rate boost off. Recorded in the manifest and the job summary |
| P4 latency | Each gating attempt records the time of the canary's own DOM change (the first DOM component of its signature), so the G1 report gives DOM-change-to-tap latency, QPC on both sides |
| Workflow | Both legs in one dispatch (R8); the listener is built in each job with the pinned `actions/setup-dotnet` (P2); the `present_listener` input runs it in the NVDA-present leg for the on/off diagnostic only (P4), and those attempts are marked and excluded from G1 |
| On/off diagnostic | A separate dispatch of both legs, K1–K5 20 times each, with `present_listener` on, compared within that dispatch (DR-0020). It never feeds the G2 rule |
| G2 sizing | 52 runs per gating canary (DR-0050's margin of two, applied before dispatch), with DR-0050's top-up rule if a canary is still short of 50 valid runs |
| Activation, NVDA-absent leg | A Playwright click on `#start`, as since M1 (commit `a047d18`): no AT segment exists in that leg, so DevTools input is allowed (HANDOFF §7.2 forbids it only inside AT segments). It leaves pointer-state STATECHANGE events (inferred), outside every signature; the on/off diagnostic therefore changes NVDA presence and activation together |
| Wall anchor (departure from DR-0030's plan) | From the gate-review fix, the Node process adopts the listener's (QPC, wall) pair in jobs that run the listener. In G1-type NVDA-present jobs no listener runs (P4), so the coarse Node anchor (up to about 16 ms) remains there; it labels times and buckets parity only (DR-0039). Listed in the G2 brief for information |

**Signature definitions (P12; approved by the owner 2026-10-03, DR-0055, as narrowed by the amendments below).** A platform event is attributed to a canary element by UIA AutomationId (the DOM id), then MSAA name, UIA AriaRole, UIA LiveSetting or MSAA role; the path used is recorded. Evidence counts only inside the observation window (activation to 4 s). EVENT_SYSTEM_ALERT on `Chrome_WidgetWin_1` is browser UI and excluded (P3). A gating attempt matches when every required component is found.

| Canary | HANDOFF §9.1 | Required components |
|---|---|---|
| K1 | Text mutation inside the live region; live-region or text events | DOM text change inside `#live`; EVENT_OBJECT_LIVEREGIONCHANGED or an IA2 text event (inserted, updated, changed) on the region |
| K2 | EVENT_OBJECT_LIVEREGIONCHANGED plus IA2 TEXT_INSERTED on the alert (not EVENT_SYSTEM_ALERT) | Both platform events on the alert. EVENT_SYSTEM_ALERT and the DOM text change are recorded, not required |
| K3 | focusin; focus WinEvent | DOM `focusin` on the button; EVENT_OBJECT_FOCUS on it |
| K4 | Dialog inserted or shown; focus events | The dialog shown in the DOM (`hidden` removed, or inserted) and EVENT_OBJECT_SHOW on it; DOM `focusin` on its first control and EVENT_OBJECT_FOCUS on it |
| K5 | History event; focus events. No title dependency | DOM `pushState`; DOM `focusin` on the `h1`; EVENT_OBJECT_FOCUS on it. The title is not read |

Record-only canaries are described, not scored: for K6, the region's insertion-to-content delay and grade (DR-0037 with P9), the platform events attributed to it, and whether a live-region or text event on the region follows its insertion ("separate update"); for K7, whether the polite update precedes the focus move in the DOM (timeline order) and on the platform (QPC). P9's "same frame" is implemented as a fill at most one 60 Hz frame (1000/60 ms) after the insertion; G1's K6e page logs put every one-rAF fill at 4.9–14.9 ms.

**Amendments after the G2 gate review (2026-10-03; after the G2 run).** The review confirmed 50 findings (`docs/gates/G2.md` §3). The code changes, all re-scored against the raw evidence with no change to any G2 verdict or record-only trace:

- **Part of P12 (approved by the owner 2026-10-03, DR-0055):** an event that carries an AutomationId matches only by it; LiveSetting is no longer an identity, because Chrome reports it on every descendant of a live region (it had attributed each K6e fill's text node to the region); events on `Chrome_WidgetWin_1` are excluded from all matching, implementing P3's window-class filter as approved; K7 order is read per platform event type; and with timeline version 2, "same frame" is the same task or a fill made in a rAF callback within one frame, other fills under 50 ms routing to REVIEW (version 1 records, including the G2 run's, keep the pre-registered one-frame threshold).
- **P13 (approved by the owner 2026-10-03, DR-0055, with malformed output lines added):** listener failures (start, fewer hooks than ranges, ping, stop, not drained) and errors after activation count as failures, not INCONCLUSIVE (DR-0032); setup errors before activation stay `ENV_FAILURE`.
- **Decided by Claude under DR-0045:** each attempt records the listener's readiness line; the listener writes its JSON with `Utf8JsonWriter` and reports whether its resolver drained (version 0.3.0); a listener that fails to become ready is killed; the timeline records each change's live-region root, so nested children count; P10's retry stays within 1 s of the first read; the applied page mapping's half-RTT is recorded as a diagnostic; `report:phase0` re-scores B2 from raw evidence and reports the comparison, the K6 platform timing, clock percentiles, the on/off systematic differences and speech with the listener present.

**Consequences.**

- G2 is scored with these definitions; P12 asks the owner to ratify them at the G2 gate, as P11 did for speech matching at G1. The raw evidence allows re-scoring under another reading without new runs.
- K4's platform SHOW component was made required after the smoke run, where it was present in 2 of 2; it was fixed before the pilot and the G2 runs.
- The gate-review code was checked on Windows by a verification run before the G2 pull request (DR-0054).

## DR-0054 G2 runs, diagnostic and evidence archive

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted |
| Owner label | Decided by Claude under DR-0045 |
| HANDOFF v1.5 | §9 (M2 and the G2 report), §9.2 (dispatch inputs) |

**Context.** M2's signature definitions and run size were fixed in DR-0053 (commit `68019bc`) before the G2 runs. The G2 rule reads B2 signature matches for K1–K5 in the NVDA-absent leg (HANDOFF §9).

**Decision.**

- **G2 run.** [37119632093](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37119632093): NVDA-absent leg, 52 runs per gating canary and every record-only canary at its D4 count, 10 shards, seed 20261012, commit `14fd612`. No top-up was needed: every gating canary had 52 valid runs.
- **On/off diagnostic.** [37119638620](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37119638620): both legs, K1–K5 20 times each, `present_listener` on, seed 20261013, commit `14fd612`. It is reported in G2 and never feeds the G2 rule (DR-0020). It changes NVDA presence and the activation method together (DR-0053).
- **Verification run.** [37122536874](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37122536874): both legs, K1–K5 once, K6e one rAF and 50 ms and K7a, seed 20261014, commit `3076d67`, to check the gate-review code on Windows before the pull request. It is not G2 evidence.
- **Archive.** All five M2 runs (smoke 37119067877, pilot 37119295670, G2 37119632093, diagnostic 37119638620, verification 37122536874), with `report.md` and `report-g2.md` regenerated by `report:phase0` at the gate-review code, are in `g2/g2-evidence.tar.zst` on the orphan `results` branch (768,146 bytes; SHA-256 `860478b101e4cfc08e1507b09fa2bfd0c59d71046ce675bae79069fa965947b2`), with `MANIFEST.json` (run IDs, head commits, image versions, listener builds, pins, the G2 result, the re-scoring comparison and the on/off table) and `SHA256SUMS`. The bundle holds JSON, JSON lines, NVDA logs and Markdown only, no NVDA binaries, and was scanned for token-shaped secrets before commit. A first bundle (four runs, with reports from the pre-review code) was replaced after the gate review. Rebuilding the G2 run's report from the bundle gives an identical `report-g2.md`.
- **Report code.** `report:phase0` writes the G2 report (`report-g2.*`) beside the G1 report and re-scores B2 from the raw evidence. With the M2 code it still rebuilds the G1 report from the G1 bundle unchanged. A directory with no G1 attempts says the G1 rule is not applicable, and one holding the on/off diagnostic says the G2 rule is not evaluated.

**Consequences.**

- G2 rule: PASS, with 260 valid of 260 attempts, 0 failures and INCONCLUSIVE at 0% (`docs/gates/G2.md`), under the definitions fixed before the run and under the narrowed definitions of the gate review.
- The NVDA-absent K6e signatures agree with P9's boundary as tested (one-rAF fills and fills from 50 ms). Timer fills under 50 ms were not tested. The G2 brief asks the owner to make P9 final as tested; until then it stays provisional (DR-0052).
- Every required component of the canary signatures was observed within the approved P3 ranges, so they are unchanged and nothing goes back to the owner under DR-0052. Whether the ranges suffice for the M3 and M5 oracles is untested.
- Pending owner items for the G2 brief: P12, P13, and making P9 final.

## DR-0055 Owner approvals at the G2 gate

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted |
| Owner label | Owner reply 2026-10-03 |
| HANDOFF v1.6 | Header (authorised scope); §7.4 (errors); §8.3 (P9 final); §9 (G2 accepted; M3 heading); §9.1 (B2 signatures); §12 (current authorisation) |

**Context.** The G2 pull request (#3) carried the G2 report and a one-page brief with four yes/no items, each recommended Yes: accept G2 and merge M2, which unlocks M3; P12 (the B2 signature definitions, as narrowed by the gate review); make P9 final as tested; P13 (which errors may be INCONCLUSIVE). The owner merged the pull request (merge commit `4b5f687`). Automated reviewers (Devin and Codex) then left six comments on it; Claude checked each against the code and the evidence, found none that changes a G2 number, and proposed folding the fixes into a follow-up pull request, with the rule that a trace with malformed listener lines is a failure added to P13.

**Decision.**

> Yes to all four; fold the fixes in and open the PR

**Consequences.**

- G2 is accepted: the B2 instruments (the WinEvent listener and the DOM mutation timeline) pass the D12 rule. M2 is merged and **M3 is unlocked**. M4 onwards was not part of the question, so Claude asks the owner before starting M4; the Phase 1 proceed/stop decision stays on 27 November 2026 (DR-0003).
- P12: the B2 signature definitions of DR-0053, as narrowed by the gate review, are in force.
- P9 is final as tested for polite regions filled after load: a fill in the same task, or in a rAF callback within one 60 Hz frame, is graded as a populated insertion; a fill 50 ms or more after insertion as a separate update; every other fill under 50 ms routes to REVIEW. The 350 ms pre-load boundary and other roles keep DR-0037's grading until tested.
- P13: only setup errors before activation are INCONCLUSIVE (`ENV_FAILURE`); a B2 listener failure (start, fewer hooks than ranges, ping, stop, not drained, or malformed output lines) or any error after activation counts as a failure.
- **Follow-up fixes (Decided by Claude under DR-0045, except the malformed-line rule, approved as part of P13):** the listener reads an event's child object with CHILDID_SELF when MSAA returns one, so a child never takes its parent's identity (listener 0.3.1); timeline version 3 names the element that took focus inside an open shadow root, with the host recorded (a closed root shows only the host); in `report:phase0`, valid attempts with no B2 outcome stay in every component denominator, record-only rows show a "No B2 trace" count, and the re-scoring comparison checks every K7 order field the run-time outcome recorded. Re-scoring the five M2 runs with this code changes no verdict, grade or order; the record-only table gains one column, so a report rebuilt with this code differs from the archived G2 reports only in that column. A Windows verification run checked the code before the follow-up pull request (lab notebook).
- No owner items are pending after this record.

## DR-0056 M3 start: SPA evaluation, corpus scaffolding and the corpus plan

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted, except P14–P18 (pending) |
| Owner label | Decided by Claude under DR-0045; P14–P18 pending |
| HANDOFF v1.6 | §9 (M3), §10.2 (`CorpusItem`), R1, R5, R6 |

**Context.** The owner unlocked M3 (DR-0055) and asked Claude to start it. M3 selects the SPA after evaluating at least three candidates, integrates de-branded Prompt to Page exports, builds mutation tooling, mines open-source regressions and assigns the split by `patternId`.

**Decisions (Decided by Claude under DR-0045).**

| Aspect | Decision |
|---|---|
| SPA evaluation | Four candidates against the ten HANDOFF criteria (`docs/research/2026-10-03-spa-candidates.md`). Three were built and probed on the gate runner by `m3-spa-probe.yml` (run 37126215365): pinned commits; install and build timed; the production build loaded offline in the pinned Chrome with every outside request blocked and recorded. Angular's Tour of Heroes was assessed from its source only |
| Probe security | Third-party code runs only on standard runners, with `contents: read`, no secrets, install scripts off, and an npm cache separate from the harness's (never saved). Nothing from the candidates ran on the owner's machine; their metadata were read through the GitHub API |
| Corpus scaffolding | `harness/src/corpus/`: `validate.ts` checks every item (schema, ids, candidate, patches, split consistency, against `corpus/split.json`); `split.ts` assigns dev or test by pattern, stratified by the pattern's modal expected class, with a recorded seed and mulberry32; `npm run corpus -- validate | split`. The seed and test fraction are an owner decision (P15) and are recorded before the split is run |
| Corpus plan | Drafted as a proposal (`docs/research/2026-10-03-m3-corpus-plan.md`): scope, sources, sizes, split, catalogues, mutation tooling and mining method. The parts that decide what is measured go to the owner as P14–P18 |

**Consequences.**

- Atomic CRM is recommended (P14). react-admin's example also meets every criterion; TanStack's kitchen sink fails "deterministic data" and lacks a dialog, a status update and a composite widget.
- No corpus item is built until P14–P18 are answered. Meanwhile Claude builds app-agnostic tooling and the mining search, which run read-only.

## DR-0057 Owner approvals for the M3 corpus

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted |
| Owner label | Owner reply 2026-10-03 |
| HANDOFF v1.6 | §9 (M3) |

**Context.** Claude put five items to the owner before building corpus items (DR-0056): P14 (Atomic CRM as the SPA), P15 (sizes and split), P16 (regression and benign catalogues), P17 (vendoring Atomic CRM and installing its dependencies in CI) and P18 (Prompt to Page exports and customer defects).

**Decision.**

> Yes to P14–P17; skip P2P for now

**Consequences.**

- P14: the M3 SPA is Atomic CRM's demo build at `b23289b`, with `faker` seeded, the clock fixed in journey setup, telemetry off and remote images replaced by local ones.
- P15: 110 regression patterns (33 dev, 77 test), benign about 1:1, one unchanged control per journey, test fraction 0.7, stratified, seed 20261004; M3 builds the dev split only.
- P16: the catalogues of the corpus plan are in force. Without Prompt to Page exports, patterns come from two contexts: the SPA and mined open-source pairs. Whether 110 regression patterns can be reached from those two contexts is reported to the owner once the patterns are enumerated, before the split is run, because a shortfall changes the sample size (what is measured).
- P17: about 3 MB of Atomic CRM's source is vendored into `fixtures/spa/atomic-crm/` without its agent instruction files, and CI installs its locked dependencies with install scripts off, `contents: read`, no secrets and a separate npm cache.
- P18: Prompt to Page exports are skipped for now, and there are no reconstructed items for now. Either can be added later as a new owner decision.

## DR-0058 M3: SPA integrated, tooling, and the pattern count

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted, except P19 (pending) |
| Owner label | Decided by Claude under DR-0045; P19 pending |
| HANDOFF v1.6 | §9 (M3) |

**Context.** After the owner's approvals (DR-0057), Claude vendored and integrated Atomic CRM, built the mutation tooling and surveyed open-source regressions. DR-0057 asks for the achievable pattern count to be reported before the split, because a shortfall changes the sample size.

**Decisions (Decided by Claude under DR-0045).**

| Aspect | Decision |
|---|---|
| Vendoring | Atomic CRM at `b23289b` in `fixtures/spa/atomic-crm/`, unmodified in one commit, integration changes in the next (`UPSTREAM.md` lists them), so every change from upstream is reviewable. Upstream's agent instruction files are left out. The app imports its `CHANGELOG.md` as text, so that file was added after the first CI build failed without it |
| Integration (P14) | Both `faker` locale instances seeded with 20261004; the CRM's telemetry request off; local placeholder logos and avatars, generated in this repository, replace `marmelab.com` images. The clock is fixed in journey setup |
| CI build | `m3-spa-build.yml` builds the vendored demo on `windows-2025` and probes it offline with the clock fixed. Run 37129009688: install 23.4 s, build 9.3 s, no outside requests, no console errors, and identical ARIA snapshots across two fresh loads on all four paths probed |
| Lint scope | ESLint ignores `fixtures/spa/` (third-party code under its own conventions) |
| Mutation tooling | `harness/src/corpus/catalogue.ts` holds the approved catalogue as data (37 regression operators over the 13 primary-analysis symptoms; one benign operator per BenignType). A spec in `corpus/specs/` names an operator and anchored edits; `npm run corpus -- mutate` writes the patch (paths relative to the repository root) and the corpus item, and checks the patch with `git apply --check` |
| Mining survey | A first, title-only survey of 12 libraries (`docs/research/2026-10-03-oss-regression-survey.md`): about 15 plausible pairs; 20–30 usable pairs expected after a deeper search and verification |

**The pattern count (P19).** With Prompt to Page set aside, patterns come from the SPA, at most one per mechanism (37), and from mined pairs (about 20–30): about 57–67 regression patterns against P15's 110. At a test fraction of 0.7 that is about 43 test patterns, so the 95% margin at p = 0.15 is about ±0.107, against ±0.08 for 77. The options:

| Option | Patterns (approx.) | Margin at p = 0.15 | Note |
|---|---|---|---|
| A. Add react-admin's "simple" example as a second SPA context | 94–104 | about ±0.084 (69 test) | Different component library (MUI) and app, so its patterns are independent of Atomic CRM's; meets every criterion (DR-0056). Recommended |
| B. Keep two contexts | 57–67 | about ±0.107 (43 test) | Less work; wider intervals |
| C. Count each component family in the SPA as its own pattern | Over 110 | Looks narrower | Rejected: patterns in one app share code and conventions, so they are not independent, and the bootstrap intervals would be too narrow |
| D. Bring Prompt to Page back | Depends on exports | – | Needs the owner's exports (P18) |

**Consequences.** No split is run until P19 is answered. Building the dev-split specs on Atomic CRM continues meanwhile, because their patterns exist under every option.

## DR-0059 A second SPA, and the dev-split specs

| | |
|---|---|
| Date | 2026-10-03 |
| Status | Accepted |
| Owner label | Owner reply 2026-10-03 (P19); Decided by Claude under DR-0045 (method details) |
| HANDOFF v1.6 | §9 (M3), R5 |

**Context.** Claude reported that P15's 110 regression patterns were not reachable from Atomic CRM and mined pairs alone, and proposed a second SPA context (P19, DR-0058).

**Decision.**

> Yes to P19; start the dev-split specs

**Decisions (Decided by Claude under DR-0045).**

| Aspect | Decision |
|---|---|
| Second SPA | react-admin's `examples/simple` at `4789067` vendored into `fixtures/spa/react-admin-simple/` by a sparse, blob-filtered fetch (284 KB, 50 files, no agent instruction files), with the repository's MIT `LICENSE.md`. Integration: the Google web-font loader removed, telemetry off. Its data are static. It has no lockfile; CI generates one with `--package-lock-only` and it is committed after review |
| Pattern registry | `corpus/patterns.json` lists every planned pattern before any item exists: one per catalogue mechanism per context. Seeded specs and items must name a planned pattern |
| Split in batches | P15's split (stratified, seed 20261004, test fraction 0.7) is applied per batch: first the SPA regression patterns, later the mined pairs once verified, and benign patterns once planned. A batch never changes an earlier assignment, so dev work can start without leaking into the test split |
| Drops before the split | Five SPA regression patterns are dropped from the base alone, before the split: `route-focus-removed` and `route-change-silent` in both apps (neither base conveys a route change: no focus move, no announcement), and `drag-only-reorder` in react-admin (no drag-and-drop). A later drop must also rest on the base alone, never on a run's result |
| Dev only | Specs are written only for dev patterns; test patterns wait for M5's power table (P15) |

**Consequences.**

- The SPA regression batch has 69 planned patterns (74 less 5 dropped) and is split with seed 20261004 at a test fraction of 0.7 after this record is committed.
- ROUTE_CHANGE_SILENT has no SPA pattern, because neither base conveys route changes. Seeding it would mean adding a route announcer to a base, which changes the application, so that would be a new owner decision. It is reported with the pattern count.
