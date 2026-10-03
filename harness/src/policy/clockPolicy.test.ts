import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, test } from "vitest";

import { checkSource, FORBIDDEN_PATTERNS, isAllowlisted, isScannable, isSkippedDir, scanRepoForWallClockReads } from "./clockPolicy.ts";

const COLLECTOR = "harness/src/collectors/mutations.ts";

/** One offending sample per forbidden read, in the language it would appear in. */
const SAMPLES: ReadonlyArray<{ pattern: string; file: string; source: string }> = [
  { pattern: "Date.now(", file: COLLECTOR, source: "const t = Date.now();" },
  { pattern: "performance.timeOrigin", file: COLLECTOR, source: "const o = performance.timeOrigin + 1;" },
  { pattern: "new Date(", file: "harness/src/runner/run.js", source: "const d = new Date();" },
  { pattern: "time.time(", file: "listener/probe/tap.py", source: "t = time.time()" },
  { pattern: "time.time_ns(", file: "listener/probe/tap.py", source: "t = time.time_ns()" },
  { pattern: "DateTime.Now", file: "listener/Listener/Hook.cs", source: "var t = DateTime.Now;" },
  { pattern: "DateTime.UtcNow", file: "listener/Listener/Hook.cs", source: "var t = DateTime.UtcNow;" },
  { pattern: "DateTimeOffset.Now", file: "listener/Listener/Hook.cs", source: "var t = DateTimeOffset.Now;" },
  { pattern: "DateTimeOffset.UtcNow", file: "listener/Listener/Hook.cs", source: "var t = DateTimeOffset.UtcNow;" },
];

describe("clock policy patterns", () => {
  test("every forbidden pattern has a sample", () => {
    expect(SAMPLES.map((s) => s.pattern).sort()).toEqual(FORBIDDEN_PATTERNS.map((p) => p.label).sort());
  });

  test.each(SAMPLES)("catches $pattern", ({ pattern, file, source }) => {
    const violations = checkSource(file, `// header\n${source}\n`);
    expect(violations).toEqual([{ file, line: 2, pattern, text: source }]);
  });

  test("tolerates whitespace inside the read", () => {
    expect(checkSource(COLLECTOR, "Date . now ()")).toHaveLength(1);
    expect(checkSource(COLLECTOR, "new  Date (0)")).toHaveLength(1);
  });

  test("allows QPC and page-relative reads", () => {
    const ok = [
      "const t = process.hrtime.bigint();",
      "const p = performance.now();",
      "long ts = Stopwatch.GetTimestamp();",
      "t = time.perf_counter_ns()",
      "const updated = data.nowPlaying;",
    ].join("\n");
    expect(checkSource(COLLECTOR, ok)).toEqual([]);
  });

  test("reports every match on a line, with line numbers", () => {
    const v = checkSource(COLLECTOR, "a\nb\nconst x = [Date.now(), new Date()];");
    expect(v.map((x) => [x.line, x.pattern])).toEqual([
      [3, "Date.now("],
      [3, "new Date("],
    ]);
  });
});

describe("clock policy scope", () => {
  test("allowlist is exactly wallAnchor.ts and listener/**/WallAnchor.cs", () => {
    expect(isAllowlisted("harness/src/clock/wallAnchor.ts")).toBe(true);
    expect(isAllowlisted("listener/WallAnchor.cs")).toBe(true);
    expect(isAllowlisted("listener/Listener/Clock/WallAnchor.cs")).toBe(true);
    expect(isAllowlisted("harness/src/clock/qpc.ts")).toBe(false);
    expect(isAllowlisted("harness/src/collectors/wallAnchor.ts")).toBe(false);
    expect(isAllowlisted("listener/Listener/WallAnchorHelper.cs")).toBe(false);
    expect(isAllowlisted("listener/Listener/wallanchor.cs")).toBe(false);
    expect(isAllowlisted("harness/src/clock/WallAnchor.cs")).toBe(false);
  });

  test("allowlisted files are not checked", () => {
    expect(checkSource("harness/src/clock/wallAnchor.ts", "Date.now()")).toEqual([]);
    expect(checkSource("listener/Listener/WallAnchor.cs", "DateTime.UtcNow")).toEqual([]);
  });

  test("scans only the declared roots and extensions, skipping *.test.ts", () => {
    expect(isScannable("harness/src/collectors/a.ts")).toBe(true);
    expect(isScannable("harness/src/adapters/guidepup/a.mjs")).toBe(true);
    expect(isScannable("harness/src/runner/a.js")).toBe(true);
    expect(isScannable("harness/src/clock/qpc.ts")).toBe(true);
    expect(isScannable("listener/Listener/Program.cs")).toBe(true);
    expect(isScannable("listener/probe.py")).toBe(true);
    expect(isScannable("harness/src/collectors/a.test.ts")).toBe(false);
    expect(isScannable("harness/src/score/cli.ts")).toBe(false);
    expect(isScannable("harness/src/policy/clockPolicy.ts")).toBe(false);
    expect(isScannable("harness/src/collectors/notes.md")).toBe(false);
    expect(isScannable("harness/src/collectorsX/a.ts")).toBe(false);
  });

  test("skips only what .gitignore excludes: node_modules anywhere, bin and obj under listener/", () => {
    for (const dir of ["listener/bin", "listener/obj", "listener/Listener/bin", "listener/Listener/obj", "listener/a/b/obj"]) {
      expect(isSkippedDir(dir), dir).toBe(true);
    }
    expect(isSkippedDir("harness/src/adapters/node_modules")).toBe(true);
    for (const dir of ["harness/src/collectors/bin", "harness/src/runner/obj", "listener/Listener/binaries", "listener/Listener/bin/x"]) {
      expect(isSkippedDir(dir), dir).toBe(false);
    }
  });
});

describe("scanRepoForWallClockReads", () => {
  const root = mkdtempSync(join(tmpdir(), "clock-policy-"));
  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  function put(rel: string, content: string): void {
    const full = join(root, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }

  test("walks the scan roots, honours the allowlist and skips build output", () => {
    put("harness/src/collectors/bad.ts", "export const t = Date.now();\n");
    put("harness/src/collectors/bad.test.ts", "Date.now();\n");
    put("harness/src/clock/wallAnchor.ts", "Date.now();\n");
    put("harness/src/score/elsewhere.ts", "Date.now();\n");
    put("listener/Listener/WallAnchor.cs", "DateTime.UtcNow;\n");
    put("listener/Listener/Hook.cs", "// fine\nvar t = DateTimeOffset.UtcNow;\n");
    put("listener/Listener/obj/Generated.cs", "DateTime.Now;\n");
    put("listener/Listener/bin/Release/Generated.cs", "DateTime.Now;\n");
    put("harness/src/adapters/node_modules/dep/index.js", "Date.now();\n");
    const violations = scanRepoForWallClockReads(root);
    expect(violations.map((v) => `${v.file}:${String(v.line)}:${v.pattern}`)).toEqual([
      "harness/src/collectors/bad.ts:1:Date.now(",
      "listener/Listener/Hook.cs:2:DateTimeOffset.UtcNow",
    ]);
  });

  test("scans committable bin and obj directories outside listener/", () => {
    const other = mkdtempSync(join(tmpdir(), "clock-policy-bin-"));
    try {
      for (const [rel, content] of [
        ["harness/src/collectors/bin/x.ts", "export const t = Date.now();\n"],
        ["harness/src/runner/obj/thing.ts", "export const d = new Date();\n"],
      ] as const) {
        mkdirSync(dirname(join(other, rel)), { recursive: true });
        writeFileSync(join(other, rel), content);
      }
      expect(scanRepoForWallClockReads(other).map((v) => `${v.file}:${v.pattern}`)).toEqual([
        "harness/src/collectors/bin/x.ts:Date.now(",
        "harness/src/runner/obj/thing.ts:new Date(",
      ]);
    } finally {
      rmSync(other, { recursive: true, force: true });
    }
  });
});
