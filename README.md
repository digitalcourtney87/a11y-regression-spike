# results

Orphan branch for Phase 0 gate evidence (DR-0015, D6). Each gate has a folder with a `tar.zst` bundle under 50 MB, a `MANIFEST.json` (run IDs, head commits, image versions, pinned versions and the gate result) and `SHA256SUMS`. Bundles are archived from the local machine with `gh run download`, so workflows stay `contents: read`, and they never contain NVDA binaries. Everything here is EXPLORATORY.

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
    mkdir -p artefacts/g2-repro/g2-only artefacts/g2-repro/onoff-only
    cp -R artefacts/g2-repro/g2-evidence/run-37119632093 artefacts/g2-repro/g2-only/
    cp -R artefacts/g2-repro/g2-evidence/run-37119638620 artefacts/g2-repro/onoff-only/
    npm run report:phase0 -- artefacts/g2-repro/g2-only
    npm run report:phase0 -- artefacts/g2-repro/onoff-only

The bundle holds all four M2 runs: the smoke run, the pilot, the G2 run and the on/off diagnostic. The G2 numbers come from run 37119632093 alone and the on/off diagnostic from run 37119638620 alone; each directory gets `report-g2.md` (B2, NVDA-absent leg) and, where the NVDA-present leg ran, `report.md`. Run the report at commit `14fd612` or later on the M2 branch.
