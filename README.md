# results

Orphan branch for Phase 0 gate evidence (DR-0015, D6). Each gate has a folder with a `tar.zst` bundle under 50 MB, a `MANIFEST.json` (run IDs, head commits, image versions, pinned versions and the gate result) and `SHA256SUMS`. Bundles are archived from the local machine with `gh run download`, so workflows stay `contents: read`, and they never contain NVDA binaries. G1 and G2 are EXPLORATORY. G4 is CONFIRMATORY.

## Verify and rebuild G1

From a checkout of the main repository (with this branch available as a worktree at `../results-wt`):

    (cd ../results-wt/g1 && shasum -a 256 -c SHA256SUMS)
    mkdir -p artefacts/g1-repro
    zstd -d -c ../results-wt/g1/g1-evidence.tar.zst | tar -xf - -C artefacts/g1-repro
    mkdir -p artefacts/g1-repro/g1-only
    cp -R artefacts/g1-repro/g1-evidence/run-37115887572 artefacts/g1-repro/g1-evidence/run-37116418050 artefacts/g1-repro/g1-only/
    npm run report:phase0 -- artefacts/g1-repro/g1-only

The bundle holds all eight M1 runs. Run the report on the two G1 runs only: running it on the whole bundle would mix in the smoke and pilot attempts. The report writes `report.json` and `report.md` into the directory it is given.

## Verify and rebuild G2

    (cd ../results-wt/g2 && shasum -a 256 -c SHA256SUMS)
    mkdir -p artefacts/g2-repro
    zstd -d -c ../results-wt/g2/g2-evidence.tar.zst | tar -xf - -C artefacts/g2-repro
    mkdir -p artefacts/g2-repro/g2-only artefacts/g2-repro/onoff-only artefacts/g2-repro/pilot-only
    cp -R artefacts/g2-repro/g2-evidence/run-37119632093 artefacts/g2-repro/g2-only/
    cp -R artefacts/g2-repro/g2-evidence/run-37119638620 artefacts/g2-repro/onoff-only/
    cp -R artefacts/g2-repro/g2-evidence/run-37119295670 artefacts/g2-repro/pilot-only/
    npm run report:phase0 -- artefacts/g2-repro/g2-only
    npm run report:phase0 -- artefacts/g2-repro/onoff-only
    npm run report:phase0 -- artefacts/g2-repro/pilot-only

The bundle holds all five M2 runs: the smoke run, the pilot, the G2 run, the on/off diagnostic and the gate-review verification run. The G2 numbers come from run 37119632093 alone and the on/off diagnostic from run 37119638620 alone. Each directory gets `report-g2.md` (B2, NVDA-absent leg) and `report.md` (speech, NVDA-present leg). The archived reports were regenerated with the gate-review code; run the report from the G2 pull request's head commit (or later), whose code re-scores B2 from the raw evidence.

`g2-followup-evidence.tar.zst` holds run 37125153236, the Windows check of the fixes made after the G2 merge (DR-0055). It is not G2 evidence.

## Verify G4

Extract the three corpus bundles into one directory. The block bundles hold `.json.gz` files; the meta bundle holds everything else from run 38156720011, including `report-m5-test.md`.

    (cd ../results-wt/g4 && shasum -a 256 -c SHA256SUMS)
    mkdir -p artefacts/g4-repro/corpus artefacts/g4-repro/soak
    for b in g4-corpus-meta g4-corpus-blocks-a g4-corpus-blocks-b; do
      zstd -d -c ../results-wt/g4/$b.tar.zst | tar -xf - -C artefacts/g4-repro/corpus
    done
    zstd -d -c ../results-wt/g4/g4-soak.tar.zst | tar -xf - -C artefacts/g4-repro/soak

Scoring the corpus needs a checkout whose frozen hash matches `protocol-freeze-v3`. The soak report is `npm run report:phase0 -- artefacts/g4-repro/soak`.

## Verify and rebuild the G4 second round

The owner accepted the amended77-pattern analysis by merging PR14 on2026-10-12. `g4-second-round/` preserves all704 files of run38276928082 plus the combined scorer outputs. The original59-pattern corpus and soak remain under `g4/`. No evidence or NVDA binaries were added to the main branch archive.

    (cd ../results-wt/g4-second-round && shasum -a 256 -c SHA256SUMS)
    mkdir -p artefacts/g4-repro/second-round
    zstd -d -c ../results-wt/g4-second-round/g4-second-round-evidence.tar.zst | tar -xf - -C artefacts/g4-repro/second-round
    npm run score -- --split test --runs artefacts/g4-repro/corpus,artefacts/g4-repro/second-round

First rebuild the original corpus with the three bundles above. Combined scoring requires a checkout whose frozen hash matches `protocol-freeze-v4`, not v3. The second-round MANIFEST lists every raw file hash, the freeze commit/hash, run ids, image and package pins. The prepared bundle was verified byte-for-byte before publication and is under50MB.

## Verify the M8 exploratory archives

Both M8 archives are EXPLORATORY and outside the frozen experiment. `m8-calibration/` holds the complete partial P40 pilot, run 38299059098, accepted by the owner's PR16 merge. `m8-working-recovery/` holds the complete P41 working-only recovery, run 38307364080, accepted by the owner's PR17 merge. Each `archive-manifest.json` lists every raw file's SHA-256, the run, the head commit and the image and package pins. Neither archive contains NVDA binaries.

    (cd ../results-wt/m8-calibration && echo "fe7354308098544a2e239ce25b0be3ca7bf7a9fe3b4c692d39b1cb1bbd31ee01  m8-calibration.tar.zst" | shasum -a 256 -c -)
    (cd ../results-wt/m8-working-recovery && shasum -a 256 -c SHA256SUMS)
    mkdir -p artefacts/m8-repro/calibration artefacts/m8-repro/recovery
    zstd -d -c ../results-wt/m8-calibration/m8-calibration.tar.zst | tar -xf - -C artefacts/m8-repro/calibration
    zstd -d -c ../results-wt/m8-working-recovery/m8-working-recovery.tar.zst | tar -xf - -C artefacts/m8-repro/recovery

Findings and limits are in `docs/reports/M8-calibration.md` and `docs/reports/M8-working-recovery.md` on main. They are not revised M7 detection rates.

## Verify the M9 registered evaluation

`m9-registered-evaluation/` holds the complete P42 run 38315343825, accepted by the owner's PR21 merge. It is EXPLORATORY and outside the frozen experiment. Its controls and criteria were registered on main before the run: `docs/plans/2026-10-12-m9-registered-criteria.md`, with checksums in `docs/research/m9-registration/`. `archive-manifest.json` lists every raw file's SHA-256, the run, the head commit and the image and package pins. The archive contains no NVDA binaries.

    (cd ../results-wt/m9-registered-evaluation && shasum -a 256 -c SHA256SUMS)
    mkdir -p artefacts/m9-repro
    zstd -d -c ../results-wt/m9-registered-evaluation/m9-registered-evaluation.tar.zst | tar -xf - -C artefacts/m9-repro
    python3 -I docs/research/m9-evaluation-evidence/derive-registered-results.py artefacts/m9-repro

The last command reproduces `docs/research/m9-evaluation-evidence/registered-results.json` on main byte for byte. Findings and limits are in `docs/reports/M9-registered-evaluation.md`. They do not change any M7 result.
