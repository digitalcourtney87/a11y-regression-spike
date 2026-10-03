# results

Orphan branch for Phase 0 gate evidence (DR-0015, D6). Each gate has a folder with a `tar.zst` bundle under 50 MB, a `MANIFEST.json` (run IDs, image versions, pinned versions, the gate result) and `SHA256SUMS`. Bundles are archived from the local machine with `gh run download`, so workflows stay `contents: read`. They never contain NVDA binaries. Everything here is EXPLORATORY.

Verify and unpack:

    shasum -a 256 -c g1/SHA256SUMS
    zstd -d -c g1/g1-evidence.tar.zst | tar -xf -
    npm run report:phase0 -- g1-evidence
