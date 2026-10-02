# Decision records

Lightweight decision records for the Accessibility Regression CI falsification spike, Phase 0. Everything before the protocol freeze (M6) is **exploratory**.

## Format

Each record follows HANDOFF §11: **date, context, options considered, decision, consequences**.

| Status | Meaning |
|---|---|
| Accepted | In force. |
| Superseded | Replaced by a later record, which it names. The decision text is kept unchanged. |
| Proposed | Drafted by Claude; not in force until the owner accepts it. |

Conventions:

- **Owner's wording is verbatim.** Under "Decision", the owner's words are quoted in a blockquote. The source is the owner decisions of 2 October 2026 (the open §2 items, D1–D13, and the "approved as proposed" items) unless a record names another owner-authored source, such as HANDOFF v1.0.
- **Gap-filling is labelled.** Anything Claude had to supply that the owner did not decide is marked **Proposed by Claude (not yet owner-approved)**. An Accepted record can contain such parts; the index flags them. A Proposed part becomes Accepted only when the owner says so, and that approval is then recorded in the record with its date.
- **Evidence.** Context and options come from the desk research in `docs/research/2026-10-02-phase0-feasibility.md` (DR-0029) and from Claude's first-session proposals of 2 October 2026. Where the researcher and the verifier disagree, the verifier's correction is used.
- **HANDOFF references.** Section numbers refer to HANDOFF v1.1, which keeps the v1.0 numbering.
- **No commercial content.** The PRD's commercial content is out of scope for this repository and is not summarised here (DR-0014).
- **Changes.** The decision of an Accepted record is never edited. A change is a new record that supersedes the old one.

## Index

| ID | Title | Status | Date | Owner label | Proposed parts |
|---|---|---|---|---|---|
| [DR-0001](#dr-0001-repository-visibility-and-licence) | Repository, visibility and licence | Accepted | 2026-10-02 | §2 Repository, Licence (HANDOFF defaults) | No |
| [DR-0002](#dr-0002-copyright-holder) | Copyright holder | Accepted | 2026-10-02 | §2 Copyright holder | No |
| [DR-0003](#dr-0003-time-box-and-stop-dates) | Time box and stop dates | Accepted | 2026-10-02 | §2 Stop dates | Yes |
| [DR-0004](#dr-0004-owner-review-cadence) | Owner review cadence | Accepted | 2026-10-02 | §2 Owner review | Yes |
| [DR-0005](#dr-0005-spend) | Spend | Accepted | 2026-10-02 | §2 Spend | Yes |
| [DR-0006](#dr-0006-runner-images) | Runner images | Accepted | 2026-10-02 | §2 Runner | Yes |
| [DR-0007](#dr-0007-toolchain-pins) | Toolchain pins | Accepted | 2026-10-02 | Approved as proposed (toolchain) | Yes |
| [DR-0008](#dr-0008-github-action-pins) | GitHub Action pins | Accepted | 2026-10-02 | HANDOFF hard rule 3, §9.2 | Yes |
| [DR-0009](#dr-0009-nvda-provisioning-via-guidepup-setup-action-archived) | NVDA provisioning via Guidepup (setup-action archived) | Accepted | 2026-10-02 | D2 (provisioning) | Yes |
| [DR-0010](#dr-0010-d1-clock-alignment) | D1 Clock alignment | Accepted | 2026-10-02 | D1 | Yes |
| [DR-0011](#dr-0011-d2-speech-capture-incl-prd-48-at-driver-teardown) | D2 Speech capture (incl. PRD §48 AT Driver teardown) | Accepted | 2026-10-02 | D2 | Yes |
| [DR-0012](#dr-0012-d3-virtual-audio) | D3 Virtual audio | Accepted | 2026-10-02 | D3 | Yes |
| [DR-0013](#dr-0013-d4-canaries-incl-pre-registered-k6a-rule) | D4 Canaries (incl. pre-registered K6a rule) | Accepted | 2026-10-02 | D4 | Yes |
| [DR-0014](#dr-0014-d5-prd-publication) | D5 PRD publication | Accepted | 2026-10-02 | D5 | No |
| [DR-0015](#dr-0015-d6-evidence-archive) | D6 Evidence archive | Accepted | 2026-10-02 | D6 | Yes |
| [DR-0016](#dr-0016-d7-sha-pinning-and-repository-settings) | D7 SHA pinning and repository settings | Accepted | 2026-10-02 | D7 | No |
| [DR-0017](#dr-0017-d8-nvda-channel-and-voice) | D8 NVDA channel and voice | Accepted | 2026-10-02 | D8 | Yes |
| [DR-0018](#dr-0018-d9-arm-b-evidence) | D9 Arm B evidence | Accepted | 2026-10-02 | D9 | No |
| [DR-0019](#dr-0019-d10-b2-scope-and-listener) | D10 B2 scope and listener | Accepted | 2026-10-02 | D10 | Yes |
| [DR-0020](#dr-0020-d11-separate-legs) | D11 Separate legs | Accepted | 2026-10-02 | D11 | Yes |
| [DR-0021](#dr-0021-d12-gates-and-validity) | D12 Gates and validity | Accepted | 2026-10-02 | D12 | Yes |
| [DR-0022](#dr-0022-d13-h2-scope) | D13 H2 scope | Accepted | 2026-10-02 | D13 | Yes |
| [DR-0023](#dr-0023-m6-pre-registration-rule-model-secondary-analysis) | M6 pre-registration: rule-model secondary analysis | Accepted | 2026-10-02 | Pre-register at M6 | No |
| [DR-0024](#dr-0024-smaller-fixes-approved-as-proposed) | Smaller fixes (approved as proposed) | Accepted | 2026-10-02 | Approved as proposed (smaller fixes) | No |
| [DR-0025](#dr-0025-m1a-runner-probes) | M1a runner probes | Accepted | 2026-10-02 | Approved as proposed (M1a probes) | Yes |
| [DR-0026](#dr-0026-schema-v11-additions) | Schema v1.1 additions | Proposed | 2026-10-02 | None (implements D1–D4, D8, D10–D13) | Yes (whole record) |
| [DR-0027](#dr-0027-collector-clock-rule-enforcement) | Collector clock rule enforcement | Accepted | 2026-10-02 | D1 (clock test) | Yes |
| [DR-0028](#dr-0028-protocol-freeze-guard) | Protocol freeze guard | Accepted | 2026-10-02 | HANDOFF §10.3 | Yes |
| [DR-0029](#dr-0029-desk-research-basis-2026-10-02) | Desk research basis (2026-10-02) | Accepted | 2026-10-02 | None (provenance) | No |

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
| Proposed parts | Yes, marked inline |
| Owner label | §2 Stop dates |
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
- **Proposed by Claude (not yet owner-approved):** the G2 report includes a cost table to support that re-plan: CI round trips, Windows job-minutes, runtime per canary run per leg, INCONCLUSIVE rate, and model spend to date.
- Dates that fall inside or near the window:

| Date | Event | Effect |
|---|---|---|
| 2026-10-20 | Node 24 enters maintenance | None; the pin stays at 24.21.0 (DR-0007) |
| 2026-10-28 | Node 26 becomes LTS | None; no upgrade mid-phase (DR-0007) |
| 2026-11-10 | .NET 8 and 9 leave support | Reason for .NET 10 (DR-0019) |
| about 2027-05-29 | Guidepup relay certificate expected to stop working | Outside Phase 0 and the Phase 1 decision (DR-0009) |
| 90 days after each run | Workflow runs and artefacts deleted | Archive at each gate (DR-0015) |

## DR-0004 Owner review cadence

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
| Owner label | §2 Owner review |
| HANDOFF v1.1 | §2, §9 (gates) |

**Context.** HANDOFF v1.0 §2 proposed "[N] hours per week; gate reviews within 3 working days".

**Options considered.** Not applicable: the owner supplied the values.

**Decision.**

> Owner review: 3 hours/week; gate reviews within 3 working days.

**Consequences.**

- At each gate Claude opens a PR with `docs/gates/G<n>.md` (HANDOFF §11 template) and stops. The review window is up to 3 working days from the PR.
- The G1 report must leave room for a review of up to 3 working days and for all of M2 before 6 Nov 2026 (DR-0003). Claude will propose a G1 target date in the M1 plan.
- **Proposed by Claude (not yet owner-approved):** decisions needed between gates are batched into one consolidated list per week, so they fit inside 3 hours.

## DR-0005 Spend

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
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
- **Proposed by Claude (not yet owner-approved):** Claude cannot meter its own model spend exactly, so the owner monitors the £150 cap. Claude flags token-heavy work, such as multi-agent research or verification passes, before running it, and gives a spend estimate in each gate report.

## DR-0006 Runner images

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
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
| Linux CI (lint, typecheck, unit tests) | `ubuntu-24.04`: **Proposed by Claude (not yet owner-approved)**. The owner did not name a Linux label; an explicit LTS label follows the "never `*-latest`" rule. |

- Workflow policy rule W6 allows exactly `ubuntu-24.04` and `windows-2025`, plus `windows-2022` only in a workflow file whose name contains "probe".
- The NVDA-absent and NVDA-present legs (DR-0020) run within one workflow dispatch.
- Weekly image rollouts can still put jobs in one dispatch on different image versions. Every run records `ImageOS`, `ImageVersion` and the image name in its environment manifest (`imageName`, DR-0026).
- **Proposed by Claude (not yet owner-approved):** each job checks that its image matches the expected label and fails fast if not. Reports flag pairs whose legs ran on different image versions.
- HANDOFF §9.2: `runs-on` becomes `windows-2025`.

## DR-0007 Toolchain pins

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
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
- **Proposed by Claude (not yet owner-approved):** implementation choices made in M0.

| Item | Choice |
|---|---|
| Build | None. Node runs `.ts` directly through its native type stripping. `tsconfig.json`: strict, `noUncheckedIndexedAccess`, `erasableSyntaxOnly` (no enums, namespaces or parameter properties), `verbatimModuleSyntax`, `allowImportingTsExtensions` (relative imports end in `.ts`). ESM (`"type": "module"`). |
| Exact pins | zod 4.6.5, vitest 5.0.3, eslint 10.11.0, typescript-eslint 8.71.0, @eslint/js 10.0.1, yaml 2.9.1, @types/node 24.19.1 (plus typescript 6.0.3). |
| Lockfile | `package-lock.json` committed; CI runs `npm ci`. |
| Local machine | The owner's machine runs Node 26; CI runs 24.21.0. `package.json` declares `engines.node >=24.21.0`. CI is authoritative. |
| Browser check (M1) | At launch, assert `browser.version() === "153.0.8010.12"` and fail fast on a mismatch. |

## DR-0008 GitHub Action pins

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
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
| actions/setup-dotnet | v6.0.0 | `a98b56852c35b8e3190ac28c8c2271da59106c68` | lightweight | Listener build (M2, DR-0019) |

**How they were resolved.**

1. `gh api repos/<owner>/<repo>/releases/latest` gave the latest release tag.
2. `gh api repos/<owner>/<repo>/git/ref/tags/<tag>` returned `object.type` = `commit` for all four, so the tags are lightweight and `object.sha` is the commit SHA. An annotated tag would need one more step (`git/tags/<sha>`); none of these needed it.
3. The decisions writer re-ran step 2 for all four on 2026-10-02 and got the same SHAs.

**Consequences.**

- Every `uses:` line carries the full SHA and a trailing `# v<semver>` comment. Workflow policy rule W1 enforces this.
- `env/env.lock.json` records the same four pins. A test fails if any workflow uses a SHA that differs from env.lock.
- Not used: `guidepup/setup-action`, which was archived on 2026-09-26 (DR-0009).
- The desk research also resolved `actions/setup-python` v7.0.0, `actions/download-artifact` v8.0.1 and `actions/cache` v6.1.0. None is adopted. Adopting any action needs a new row here and in env.lock.
- Relevant behaviour: checkout v7 refuses fork-PR checkouts under `pull_request_target` and `workflow_run`, and policy rule W5 forbids both triggers anyway. Every checkout sets `persist-credentials: false` (W8).
- **Proposed by Claude (not yet owner-approved):** pinning the latest release of each action as of 2026-10-02.

## DR-0009 NVDA provisioning via Guidepup (setup-action archived)

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
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
| @guidepup/setup | 0.29.1 | MIT. The CLI that installs the asset: `npx @guidepup/setup@0.29.1 install`. **Proposed by Claude (not yet owner-approved):** this pin and this install path. They follow from D2, because setup-action cannot provision Guidepup 0.35.0. |
| NVDA Remote Access relay | TLS on 127.0.0.1:6837, channel `guidepup` | Built into NVDA since 2025.1. Guidepup and the harness tap (DR-0011) both connect as leaders. |

- NVDA 2026.2 is the only NVDA build published for Guidepup 0.34 and 0.35, and it is NVDA's latest stable release (2026-08-31). Guidepup's `NVDA.version` returns the asset string, so the real NVDA version is read separately, from `nvda.exe` or the NVDA log.

**Relay-certificate shelf life.**

- The relay certificate in the Guidepup build is valid from 2026-06-28 to 2027-06-28.
- NVDA regenerates its relay certificate once 30 days or fewer remain, which is from about 2027-05-29. Guidepup trusts only the CA in the extracted build. From about that date, a pinned Guidepup 0.35.0 with NVDA 0.2.1-2026.2 is expected to fail with `ERR_NVDA_CANNOT_CONNECT`.
- This is inferred from source and has not been tested. Exact pinning therefore has a shelf life. Phase 0 (to 6 Nov 2026) and the Phase 1 decision (27 Nov 2026) fall well inside it. Any work after about May 2027 must re-pin or patch.
- **Proposed by Claude (not yet owner-approved):** the harness tap reads the CA or fingerprint from the session directory after each NVDA start, rather than from the extracted build.

**Consequences.**

- The HANDOFF §9.2 setup-action step is replaced by `npm ci` (with Guidepup pinned exactly) followed by `npx @guidepup/setup@0.29.1 install`. @guidepup/guidepup and @guidepup/setup are added to `package.json` in M1.
- `env/env.lock.json` records `guidepup` 0.35.0, `guidepupSetup` 0.29.1, and `nvda` {version 2026.2, guidepupAsset 0.2.1-2026.2, sha256}, all with status `pinned`.
- **Proposed by Claude (not yet owner-approved):** operating notes from the desk research.

| Note | Reason |
|---|---|
| Cache `%LOCALAPPDATA%\guidepup`, keyed on the manifest sha256 | Saves about 10–15 s and 105 MB per job. Needs `actions/cache`, which is not yet pinned (DR-0008). |
| Keep the cache root path free of spaces | Guidepup spawns NVDA with `shell: true` and unquoted paths. |
| Run NVDA only on ephemeral hosted runners | NVDA's self-hosted relay binds all interfaces, and the Guidepup build uses a public password and a private key committed to a public repo. The risk is negligible on hosted runners but real on a developer machine. A README note is requested (outside this writer's files). |

- NVDA (GPL-2.0-or-later) is downloaded at CI time, runs as a separate process, and never appears in artefacts or archives (DR-0015).

## DR-0010 D1 Clock alignment

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
| Owner label | D1 |
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
- **Wall anchor.** One per process: `harness/src/clock/wallAnchor.ts` `captureWallAnchor()` returns `{ qpcNs, wallIso }`, and the listener has an equivalent `WallAnchor.cs`. These are the only harness files allowed to read the wall clock. They are used for human-readable times only, never for measurement, alignment or validity. **Proposed by Claude (not yet owner-approved):** the Node anchor reads `Date.now()`, which on Windows can trail UTC by 0 to about 15.6 ms, so it falls short of D1's "precise" until M2; from M2 the Node process adopts the (QPC, wall) pair measured by the listener's `WallAnchor.cs`. Because the anchor only labels times for humans, this does not affect any measurement.
- **Enforcement.** The owner's test is implemented as the clock policy (DR-0027).
- **Page time.** Page QPC is approximately `NavigationStart + performance.now()`, using CDP `Performance.getMetrics`. It is recomputed after every full navigation; `pushState` keeps the time origin. M1a verifies two things against a 16-ping minimum-RTT estimate (LAB_NOTEBOOK): whether `NavigationStart` equals the page time origin, and whether Chrome TimeTicks share an epoch with `process.hrtime.bigint()` and `Stopwatch`.
- **Validity limits.** `harness/src/runner/validity.ts` exports `CLOCK_LIMITS = { nativeSelfTestDisagreementMs: 0.5, pageMappingUncertaintyMs: 2, segmentDriftMs: 1, maxRafGapMs: 100 }`, plus a flag for low-resolution TimeTicks. Following the owner's ">", a value strictly greater than its limit is INCONCLUSIVE and a value equal to the limit passes (DR-0021, DR-0026).
- **`maxClockSkewMs` redefined.** **Proposed by Claude (not yet owner-approved; DR-0026):** the field stays required, but it now means `max(nativeSelfTestDisagreementMs, pageMappingUncertaintyMs)`, derived from the D1 limits. It is no longer a title-pulse skew. D1 itself does not mention the field.
- **Title marker removed.** No title nonce is emitted and no check uses one. The DOM timeline still records title mutations as ordinary DOM data, because K5 changes the title. The M1a title-latency probe is dropped (DR-0025).
- **Joins.** Logs are joined by QPC and by `StepEvidence.segmentId`, which the orchestrator issues. Latency is measured from the canary events themselves, for example DOM mutation (page QPC) → WinEvent receipt → tap receipt.
- **Speech tap.** It stamps on receipt in a worker thread, so Playwright's event loop cannot delay the stamps (DR-0011).
- **Proposed by Claude (not yet owner-approved):** how each quantity is computed. These definitions are to be finalised from M1a data.

| Quantity | Proposed method |
|---|---|
| Native self-test disagreement | Named-pipe ping-pong between the Node orchestrator and each native collector, both sides stamping QPC. Disagreement is the largest offset estimate beyond zero. |
| Page-mapping uncertainty | How far the CDP `Timestamp` falls outside an `hrtime` bracket around the `getMetrics` call, plus the 100 µs clamp. Cross-checked against the 16-ping estimate in M1a. |
| Segment drift | Change in the page mapping between the start and the end of a segment. |
| Low-resolution TimeTicks | Histogram of `performance.now()` steps: about 100 µs steps means QPC; steps of 1 ms or more means low resolution. |
| rAF gap | Largest gap in an in-page `requestAnimationFrame` heartbeat during the segment. |
| NVDA log parity | Computed from message counts per NVDA run, as D2 requires: tap `speak` messages against the log's "Speaking" lines (DR-0011). NVDA log wall times are display-only and never used to order or align evidence. Any finer join of log lines (per segment or per line) would need the wall anchor or in-log markers for alignment, which goes beyond D1's "human-readable times only", so it would need an owner decision first. |

## DR-0011 D2 Speech capture (incl. PRD §48 AT Driver teardown)

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
| Owner label | D2 |
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
  - **Proposed by Claude (not yet owner-approved):** M1a measures the CPU and latency overhead of DEBUG logging on NVDA's main thread.
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
- **Proposed by Claude (not yet owner-approved):** if it is ever approved, its form would be as follows.

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
| Proposed parts | Yes, marked inline |
| Owner label | D3 |
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

**Trust on first use (TOFU).** GitHub publishes no digest for this 2020 release asset. Claude downloaded `Scream3.6.zip` from the GitHub release on 2026-10-02 and computed the SHA-256 above. The hash proves later downloads match what was fetched that day; it does not prove the file is authentic. Authenticity rests on the driver signature. M1a records the signer certificate thumbprint of the driver before anything is added to TrustedPublisher. The thumbprint entry in env.lock then moves from `pending-M1a` to `pinned`.

**Product-risk note** (owner's instruction): requiring a kernel driver in customer CI is a hard sell. Phase 0 uses one to make NVDA's queueing realistic on hosted runners. Any later product design that depends on it carries that adoption risk. Gate reports should therefore say whether a finding depends on the virtual audio device.

**Consequences.**

- **Proposed by Claude (not yet owner-approved):** the install sequence, following ARIA-AT's recipe.
  1. Start the audio services.
  2. Download the pinned URL and verify its SHA-256.
  3. Extract the archive.
  4. Read the driver's signer certificate thumbprint and compare it with the value recorded in M1a. Fail on a mismatch.
  5. Add the certificate to `LocalMachine\TrustedPublisher`.
  6. Run `devcon install` on the Scream INF.
- Ephemeral GitHub-hosted runners only: never a developer machine, never a self-hosted runner.
- **Preflight `audioOk`.** At least one audio endpoint and Audiosrv running; otherwise the run is INCONCLUSIVE with code `AUDIO` (DR-0021). The manifest records `audio: { endpointCount, audiosrvRunning, driver }` (DR-0026). **Proposed by Claude (not yet owner-approved):** the check applies to the nvda-present leg only, because only that leg needs a synth and audio path. D3 names no leg (DR-0021).
- Scream is downloaded at CI time and never redistributed or archived (DR-0015).
- M1a probes `windows-2022` as well. If Scream 3.6 does not install there, that affects only the probe, not the gates (DR-0006).

## DR-0013 D4 Canaries (incl. pre-registered K6a rule)

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
| Owner label | D4 |
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

**Desk-research predictions (DR-0029), Proposed by Claude (not yet owner-approved); signatures fixed in M2.** These come from Chromium source and Chromium's own Windows event-dump tests. They are not gate criteria. M2 checks them in the NVDA-absent leg (DR-0020), and any signature change they lead to is made by a new record.

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
- **Proposed by Claude (not yet owner-approved):** K2 is matched on text only; no "alert" prefix is expected or required.
- K5 does not depend on the title.

**Pre-registered K6a rule.**

- Recorded now, before M3 and before any K6a data exist. Applied when the G1 data are available.
- **Proposed by Claude (not yet owner-approved):** how the rule is read.

| Term | Proposed reading |
|---|---|
| Trigger | Any one K6a variant (polite, status or assertive) announced in 2 or more of its 20 runs |
| Announced | The tap records a `speak` message containing the region's text within the observation window |
| Creation-time regression family | Mechanisms that rely on content present at region creation being silent: a conditionally rendered, populated toast or status message; unhiding a populated region with `display:none` or the `hidden` attribute; re-mounting or re-keying the region element on each update; filling a region within the same accessibility snapshot as its insertion; downgrading a conditionally rendered message from `role=alert` to `role=status`; switching `aria-live` from off to polite on an already-populated node |
| Not affected | Mechanisms that do not depend on K6 stay eligible: `aria-busy` left true; an `aria-hidden` or `inert` ancestor; `aria-live=off` descendants; `aria-relevant` exclusions; focus moving into an edit field and cancelling speech (K7b); loss of foreground |

**Consequences.**

- Gates are computed on K1–K5 only (DR-0021). K6 and K7 are reported, with Wilson intervals, as exploratory observations.
- The schema exports `CanaryId`, `GATING_CANARIES` (K1–K5) and `RECORD_ONLY_CANARIES` (K6a, K6b, K6e, K7a, K7b) (DR-0026).
- Run volume: 250 valid gating runs per gate leg (plus up to 5% INCONCLUSIVE), and 190 record-only runs (K6a 60, K6b 20, K6e 70, K7a 20, K7b 20) in each leg in which they run. The legs for K6 and K7 are not yet decided.
- K7 results feed the GPL add-on rule (DR-0011) and the H2 scope (DR-0022).

## DR-0014 D5 PRD publication

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
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
  - A commercial-content tripwire in the same test fails if any committed file contains a set of commercial phrases. The repository holds only SHA-256 digests of the phrases (`harness/src/policy/tripwire.ts`), and the owner keeps the plain-text list privately; short phrases can be recovered from digests by dictionary search, so this keeps the list from casual readers rather than making it secret (Proposed by Claude, not yet owner-approved).
- Writers never quote or summarise commercial content in any repository file. Where it must be mentioned, it is called "commercial content".
- HANDOFF references to `docs/PRD-v0.3.md` mean the local copy. The in-repo reference is the extract.

## DR-0015 D6 Evidence archive

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
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
- **Proposed by Claude (not yet owner-approved):**

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
- **Proposed by Claude (not yet owner-approved):** two extensions to the workflow policy beyond the M0 specification. W1 also forbids `..` in local `uses:` paths and checks the steps of local composite actions. W4 also forbids secrets reached through expressions and `if:` values, `github.token`, `github['token']`, a computed index into `github`, and passing the whole `github` context. Both are listed in the rule table in `harness/src/policy/workflowPolicy.ts`.

## DR-0017 D8 NVDA channel and voice

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
| Owner label | D8 |
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
| Rate boost | Off |
| Say-all on page load (`autoSayAllOnPageLoad`) | Off |
| Speech Viewer at startup (`showSpeechViewerAtStartup`) | Off |
| Logging | DEBUG with the D2 categories (DR-0011) |

- **Proposed by Claude (not yet owner-approved):** the numeric rate. It is declared in the committed configuration and in env.lock before G1, proposed from M1a observations. "Report dynamic content changes" stays at NVDA's default (on).
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
| Proposed parts | Yes, marked inline |
| Owner label | D10 |
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

- **Listener.** C# on .NET 10 in `listener/`: SDK 10.0.401, runtime 10.0.12. It is built with `actions/setup-dotnet` v6.0.0 (DR-0008). `listener/**/bin` and `obj` are gitignored. It stamps with `Stopwatch.GetTimestamp()`, and `listener/**/WallAnchor.cs` is its only allowlisted wall-clock reader (DR-0027).
- **Channels.** WinEvents are primary. UIA events are recorded with `channel: "UIA"` and `diagnostic: true`, and never form part of a G2 signature (DR-0026).
- **Identity.** Resolved through MSAA (role, name, state) and UIA property reads: AutomationId, which is the HTML id, LiveSetting and AriaRole. No IA2 QueryService and no proxy registration anywhere.
- **Text.** IA2 `get_newText` cannot work out of process, so inserted text is re-read after the event or taken from the DOM timeline.
- **Chrome flags.** `--force-renderer-accessibility=screen-reader` in every arm, logged per run. `env/env.lock.json` records `chromeFlags` and `chromiumSandbox: true`. The manifest records `axMode` and `chromeSandbox` (DR-0026). The harness passes no `--disable-features` of its own, because Chrome keeps only the last value of a repeated switch and would silently drop Playwright's list.
- **Focus.** Focus signatures need Chrome in the foreground, so the foreground handover and its preflight run in every leg (DR-0021, DR-0024).
- **Proposed by Claude (not yet owner-approved):** listener design details, from the desk research.

| Aspect | Proposal |
|---|---|
| Hooks | Global out-of-context hooks over narrow ranges, filtered by the browser PID (from CDP `SystemInfo.getProcessInfo`) and window class: EVENT_SYSTEM_ALERT (0x0002), EVENT_SYSTEM_FOREGROUND (0x0003), EVENT_OBJECT_SHOW–FOCUS (0x8002–0x8005), STATECHANGE (0x800A), NAMECHANGE (0x800C), DESCRIPTIONCHANGE (0x800D), VALUECHANGE (0x800E), LIVEREGIONCHANGED (0x8019), and the IA2 range (0x0101–0x0123). LOCATIONCHANGE is excluded. Final ranges are fixed in M2. |
| Threads | The hook thread only stamps QPC and enqueues. A resolver thread reads properties and keeps a cache, so later HIDE events can still be labelled. |
| Browser-UI alerts | Excluded by `hwndClass` (`Chrome_WidgetWin_1` against `Chrome_RenderWidgetHostHWND`) |
| Linux CI | The listener compiles in Linux CI (Windows targeting enabled), so interop errors surface before a Windows run |
| Mutation timeline: shadow DOM | Patch `Element.prototype.attachShadow` before page scripts run, so every shadow root is observed (HANDOFF §8.3) |
| Mutation timeline: ordering | Call `takeRecords()` inside the focus, history and title handlers before logging them, so records keep causal order (HANDOFF §8.3) |
| Mutation timeline: K6 delay grading | Record the insertion-to-content delay and treat a fill within Chrome's accessibility serialisation window (one non-immediate serialisation per 150 ms after load, 350 ms before) as possibly indistinguishable from a populated insertion. Until the owner approves this, the v1.0 same-batch flag is the rule in force (HANDOFF §8.3; basis DR-0029) |

## DR-0020 D11 Separate legs

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
| Owner label | D11 |
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
- **Proposed by Claude (not yet owner-approved):**

| Item | Proposal |
|---|---|
| C's combination rules | D11 does not say which leg's B2 evidence C's UNION and ADJUDICATED rules (R3) use. Proposal: the NVDA-absent B2 evidence, as for D, so that C and D differ only in trigger masking. Needs owner confirmation before M5. |
| Cross-leg matching | Evidence is matched across legs by item, side and repetition index (HANDOFF R8). |
| B2 collectors in the present leg | B2 collectors also run in the NVDA-present leg, for the 20-run diagnostic and for latency joins. Their output never feeds G2 or arm verdicts. |
| Order | Leg order within a dispatch is counterbalanced or randomised with a recorded seed, as in §7.4. |

## DR-0021 D12 Gates and validity

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
| Owner label | D12 |
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
| G1 | `windows-2025`, retries off | nvda-present | Expected NVDA outcome not observed | ≥ 50 valid runs; at most 3 failures | At most 5 failures (in 250 valid runs) | (attempts − valid) / attempts ≤ 0.05, pooled across K1–K5 (pooling Proposed by Claude, not yet owner-approved; D12 does not name the unit) |
| G2 | `windows-2025`, retries off | nvda-absent | Expected B2 signature not matched | ≥ 50 valid runs; at most 3 failures | At most 5 failures (in 250 valid runs) | (attempts − valid) / attempts ≤ 0.05, pooled across K1–K5 (pooling Proposed by Claude, not yet owner-approved; D12 does not name the unit) |

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
| `AUDIO` | nvda-present only (leg restriction Proposed by Claude, not yet owner-approved; D3 names no leg): no audio endpoint, or Audiosrv not running | D3 |
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
- Gate reports give Wilson intervals for every proportion (`harness/src/score/wilson.ts`) and label every Phase 0 result EXPLORATORY.
- HANDOFF §9's 98%/90% thresholds and the G2 98% threshold are replaced. The §2 "G1 and G2 thresholds" row now points here. R7's INCONCLUSIVE ceiling is 5% for the Phase 0 gates; the M6 protocol sets its own for the confirmatory run.
- **Proposed by Claude (not yet owner-approved):**

| Item | Proposal |
|---|---|
| When preflight is recorded | The runner writes the preflight into the evidence package before the observation window closes. Validity is computed from that record alone. |
| Unit of the 5% validity limit | Pooled across K1–K5: (attempts − valid) / attempts over all gating attempts in the gate run. D12 says "≤ 5% of attempts" without naming the unit. |
| Audio check scope | `AUDIO` applies to the nvda-present leg only, because only that leg needs a synth and audio path. D3 names no leg. The injection-marker and synth checks are nvda-present only because they concern NVDA (D8, D11). |
| Post-block canary (§7.4) | HANDOFF v1.0 §7.4 made a whole block INCONCLUSIVE when its post-block canary failed. A post-block canary completes after the outcome is known, so it is not among the D12 pre-outcome checks. Proposal (as HANDOFF v1.1 §7.4 and extract §3.6): a failed post-block canary is reported with its block and does not convert outcomes already observed; the next block must pass its own pre-block canary. This first matters from M4, when item blocks are first run. Owner decision needed before M4. |
| Ambiguous outcome evidence | PRD §20 allows REVIEW or INCONCLUSIVE when evidence remains ambiguous. Proposal: route it to REVIEW, not INCONCLUSIVE, because INCONCLUSIVE needs a pre-outcome check (extract §3.3). |

## DR-0022 D13 H2 scope

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
| Owner label | D13 |
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
- **Proposed by Claude (not yet owner-approved):** corpus items whose expected symptom is one of the two excluded symptoms, if any are built, are reported separately as exploratory.
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

- **Handover (HANDOFF §7.2).** The handover verifies `GetForegroundWindow()` against the Chrome top-level window, and platform focus (UIA focused element or the last B2 EVENT_OBJECT_FOCUS) on the declared anchor. A failure is INCONCLUSIVE with `FOREGROUND_HWND` (DR-0021). DOM `focusin` is evidence of DOM focus only.
- axe placement is fixed by DR-0018. The listener hooks are in DR-0019. The TypeScript pin is in DR-0007.

## DR-0025 M1a runner probes

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
| Owner label | Approved as proposed (M1a probes) |
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
| Audio | Endpoints and Audiosrv state, with and without Scream; the Scream signer thumbprint | DR-0012 |
| Image | Image name and version, `ImageOS` and Windows build (Proposed by Claude, not yet owner-approved; also required by DR-0006) | DR-0006 |
| Desktop session | Process integrity levels and session IDs of NVDA, Chrome, the listener and the input path (Proposed by Claude, not yet owner-approved) | DR-0024 |
| Synth | Which synth NVDA loads, with and without Scream | DR-0017 |
| NVDA channel | Which channel NVDA uses for Chrome under `[UIA] allowInChromium=3` (IA2 expected) | DR-0017 |
| Injection | The injection marker and "Buffer load took" | DR-0017 |
| Foreground | Foreground-lock behaviour | DR-0024 |
| Chrome | CfT infobars | DR-0007 |
| Clocks | Whether Chrome TimeTicks share an epoch with `process.hrtime.bigint()` and `Stopwatch`; whether CDP NavigationStart equals the page time origin, cross-checked against a 16-ping minimum-RTT estimate | DR-0010 |
| Display | Resolution and DPI | — |
| Reliability | First-launch virtual-buffer failure rate | DR-0021 |

- Dropped: the title-latency probe (D1 removes the marker).
- Each probe job also records `ImageOS`, `ImageVersion` and the image name. That follows from DR-0006 (every run records them), not from the probe plan; the label check that uses them is Proposed in DR-0006.
- Results are logged as EXPLORATORY entries in `docs/LAB_NOTEBOOK.md`.
- **Proposed by Claude (not yet owner-approved):** values that need an owner decision are brought to the owner before G1 runs. These are the declared eSpeak rate (DR-0017) and the Scream signer thumbprint (DR-0012).

## DR-0026 Schema v1.1 additions

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Proposed |
| Proposed parts | Whole record (Proposed by Claude, not yet owner-approved) |
| Owner label | None. Implements D1–D4, D8 and D10–D13. |
| HANDOFF v1.1 | §9 (M0), §10.2 |

**Context.** M0 requires zod schemas mirroring HANDOFF §10.2, with tests. The owner's decisions require data the §10.2 contracts cannot hold: QPC time semantics, speech priority and global cancels, segment IDs, platform-event identity, environment details (image, synth, audio, channel, AXMode), legs, and preflight results. The requirement is the owner's. The field design below is Claude's.

**Options considered.** Change §10.2 types in place (breaking), or mirror §10.2 exactly and add optional fields only (additive). The additive approach was chosen so §10.2 documents stay valid, with the documented exceptions listed under "Constraints beyond §10.2" in the consequences.

**Decision (Proposed).**

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
| `gateResult(input)` | Input: per-canary `{ canary, attempts, valid, failures }` for K1–K5. Passes iff every canary has ≥ 50 valid runs, pooled failures ≤ 5, no single canary has > 3 failures, and pooled (attempts − valid) / attempts ≤ 0.05. Returns `{ pass, reasons[], pooled counts }`. Unit tests cover 5 vs 6 pooled, 3 vs 4 single, 50 vs 49 valid, and exactly 5% vs just over. |

*Validity behaviour beyond the rule.* The thresholds and limits above come from D1 and D12. The behaviour below is Claude's.

| Behaviour | Definition | Status |
|---|---|---|
| Fail closed on bad clock values | In `inconclusiveReasons`, a NaN, negative or infinite clock measurement counts as failing its check, so the attempt is INCONCLUSIVE with that check's code | Proposed by Claude (not yet owner-approved) |
| `gateResult` reason codes | `CANARY_MISSING` (no tally for a gating canary), `INSUFFICIENT_VALID_RUNS` (fewer than 50 valid), `CANARY_FAILURES` (more than 3 on one canary), `POOLED_FAILURES` (more than 5 pooled), `VALIDITY_RATE` (pooled INCONCLUSIVE rate above 0.05) | Proposed by Claude (not yet owner-approved); the conditions are D12's |
| `gateResult` malformed input | Throws `RangeError` for a count that is not a non-negative safe integer, `valid` greater than `attempts`, `failures` greater than `valid`, a duplicate tally, or a canary outside K1–K5 | Proposed by Claude (not yet owner-approved) |
| Zero attempts | The pooled INCONCLUSIVE rate is reported as `null`; the gate still fails, on `CANARY_MISSING` or `INSUFFICIENT_VALID_RUNS` | Proposed by Claude (not yet owner-approved) |

**Consequences.**

- **Constraints beyond §10.2.** §10.2 types these fields only as `number`. The schemas add the constraints below. Those marked "Yes" in the last column reject documents that a literal §10.2 mirror would accept, so the additive rule has these exceptions. (zod 4 rejects NaN and infinite values for every `number`.)

| Constraint | Fields | Basis | Rejects a §10.2-valid document? |
|---|---|---|---|
| Non-negative safe integer (QPC nanoseconds) | `t`, `startedAt`, `endedAt`, `cancelledAt`, `focusTrace[].t`, `speechCancels[].t` | Follows from D1 (DR-0010); the validation is Proposed by Claude (not yet owner-approved) | Yes: fractions, negatives and values of 2^53 or more |
| Non-negative integer | `EvidencePackage.repetition`, `EvidencePackage.orderIndex` | Proposed by Claude (not yet owner-approved) | Yes |
| Non-negative integer | `EnvManifest.audio.endpointCount` | Proposed by Claude (not yet owner-approved) | No (new field) |
| Integer, at least 1 | `CorpusItem.repetitions`, `AtStep.until.maxAttempts` | Proposed by Claude (not yet owner-approved) | Yes: for example `repetitions: 0` or `maxAttempts: 0` |
| Finite, non-negative milliseconds | `AtStep.observeMs`, `EvidencePackage.maxClockSkewMs` | Proposed by Claude (not yet owner-approved) | Yes: for example `observeMs: -5` or `maxClockSkewMs: -1` |
| Finite, non-negative milliseconds | `ClockChecks.nativeSelfTestDisagreementMs`, `pageMappingUncertaintyMs`, `segmentDriftMs`, `maxRafGapMs` | Proposed by Claude (not yet owner-approved) | No (new fields) |
| Integer from 0 to 0xFFFFFFFF (the DWORD range) | `PlatformEvent.eventId` | Proposed by Claude (not yet owner-approved) | No (new field) |
| Number from 0 to 100 | `EnvManifest.synth.rate` | Proposed by Claude (not yet owner-approved) | No (new field) |
| `maxClockSkewMs` equals the clock maximum when `preflight` is present | `EvidencePackage` refinement | Proposed by Claude (not yet owner-approved) | No (`preflight` is new) |
| Unknown keys rejected | Every object (`z.strictObject`) | Proposed by Claude (not yet owner-approved) | Yes, for documents carrying extra keys |
- `preflight` and `leg` are optional for compatibility with §10.2.
- **Proposed by Claude (not yet owner-approved):** evidence packages used for G1 and G2 must carry both. The M1 runner enforces this.
- On owner acceptance, this record's status changes to Accepted, with the date.

## DR-0027 Collector clock rule enforcement

| | |
|---|---|
| Date | 2026-10-02 |
| Status | Accepted |
| Proposed parts | Yes, marked inline |
| Owner label | D1 (clock test) |
| HANDOFF v1.1 | §7.3, §9 (M0) |

**Context.** D1 makes QPC the only timebase and requires a test forbidding wall-clock reads in collectors. Wall-clock reads in other runtime code (adapters, runner, listener) would break the timebase the same way.

**Options considered.** Scan collectors only, for the three named reads (the owner's minimum), or scan every runtime directory for the equivalent reads in each harness language.

**Decision.** (D1, first bullet, in part.)

> Add a test forbidding Date.now(), performance.timeOrigin and time.time() in collectors.

**Implementation.** The owner's minimum is the three named reads in collectors. **Proposed by Claude (not yet owner-approved):** everything beyond that minimum.

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
| Proposed parts | Yes, marked inline |
| Owner label | HANDOFF §10.3 (freeze guard); hard rule 5 |
| HANDOFF v1.1 | §4 (rule 5), §9 (M6), §10.3 |

**Context.** Hard rule 5 says test-split items must not be executed before the freeze, enforced in code. HANDOFF §10.3 requires `npm run score -- --split test` to exit non-zero unless the hash of `protocol/` equals the hash recorded in the freeze tag. At M6 the owner reviews, tags and publishes. Claude never pushes tags (hard rule 2).

**Options considered.** The HANDOFF fixes the requirement but not the hash construction, the tag format or the CLI behaviour, so those are Claude's design.

**Decision.** HANDOFF v1.0 §10.3 (owner-authored):

> **Freeze guard:** `npm run score -- --split test` must exit non-zero unless the hash of `protocol/` equals the hash recorded in the freeze tag.

**Implementation.** **Proposed by Claude (not yet owner-approved):** the design below.

| Component | Specification |
|---|---|
| Protocol hash (`harness/src/score/protocolHash.ts`) | `computeProtocolHash(rootDir = "protocol")` returns a SHA-256 hex digest over the regular files git tracks under `protocol/` (`git ls-files`), excluding `.gitkeep`. Paths are POSIX paths relative to `protocol/`, sorted by code unit. For each file it feeds `path + "\n" + sha256hex(blob) + "\n"`, where `blob` is the file's committed git blob, so a Windows checkout with `core.autocrlf=true` hashes the same as a macOS or Linux one. Computing the hash throws while `protocol/` has any staged, unstaged or untracked change. Symbolic links and submodules are refused. Run `npm run protocol:hash` to print the `protocol-sha256: <hex>` line for the freeze tag message. Hashing committed blobs and requiring a clean `protocol/` (rather than hashing every file on disk, as first specified) is part of this Proposed design. |
| Freeze tag | An annotated git tag named `protocol-freeze-v<N>`, whose message contains exactly one line `protocol-sha256: <64 lowercase hex>`. Created and pushed by the owner. |
| Guard (`harness/src/score/freezeGuard.ts`) | `assertSplitAllowed(split, deps)`, with injectable `deps { listFreezeTags(): string[]; readTagMessage(tag): string; computeHash(): string }`. `dev` is always allowed. `test` is allowed only if at least one freeze tag exists, the latest tag (highest N, compared numerically) records a parseable hash, and that hash equals `computeHash()`. Otherwise it refuses with a clear reason. |
| CLI (`harness/src/score/cli.ts`) | `npm run score -- --split <dev\|test>`. An unknown or missing split exits 2. A refused `test` exits 1. Otherwise it prints "Scorer not implemented until M5." and exits 3. |
| Wilson helper (`harness/src/score/wilson.ts`) | Wilson 95% interval with z = 1.959964, tested against known values (49/50 lower bound about 0.8950; 50/50 lower bound about 0.9287). |
| Tests | Unit tests with injected deps; one integration test that creates a temporary git repository with an annotated tag; one test that spawns `node harness/src/score/cli.ts --split test` in this repository, where no freeze tag exists, and asserts a non-zero exit. |

**Consequences.**

- Until M6, `--split test` always exits non-zero, because no freeze tag exists.
- Numeric comparison of N prevents `v10` from sorting before `v9`.
- `protocol/AMENDMENTS.md` lies inside `protocol/`, so it is part of the hash. A post-freeze amendment changes the hash, and test-split scoring is then refused until the owner creates `protocol-freeze-v<N+1>` with the new hash. The original analysis stays reproducible from the earlier tag's tree. This is how AMENDMENTS.md's "report both analyses" rule is enforced.
- The guard compares the hash of the committed `protocol/` files with the tag's recorded hash, and refuses while `protocol/` has uncommitted changes. It does not require the working tree to be at the tagged commit.

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
