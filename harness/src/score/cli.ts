/**
 * Scorer entry point: `npm run score -- --split <dev|test> --runs <dir>[,<dir>…]
 * [--out <report.md>] [--json <scores.json>]` (DR-0028; the freeze covers the
 * frozen set listed in protocol/frozen-paths.txt, DR-0033). The run
 * directories are downloaded artefacts (`gh run download <run> -D
 * artefacts/<run>`); a later directory's blocks replace an earlier one's for
 * the same item and leg.
 *
 * This file only parses the arguments and applies the freeze guard; the
 * scoring code (`scoreRuns.ts`) is loaded only once the guard allows the split.
 *
 * Exit codes:
 *
 * | Code | Meaning |
 * |---|---|
 * | 0 | Scored |
 * | 1 | Test split refused by the freeze guard |
 * | 2 | Missing or unknown split, missing runs, unknown arguments, or no item blocks for the split |
 */

import { parseArgs } from "node:util";

import { evaluateSplit, isSplit, REPO_ROOT, repositoryFreezeDeps } from "./freezeGuard.ts";
import type { FreezeGuardDeps } from "./freezeGuard.ts";

export { REPO_ROOT };

export const EXIT_OK = 0;
export const EXIT_REFUSED = 1;
export const EXIT_USAGE = 2;

const USAGE = "usage: npm run score -- --split <dev|test> --runs <dir>[,<dir>...] [--out <report.md>] [--json <scores.json>]";

/** A scoring request that has passed the freeze guard (`scoreRuns.ts`). */
export interface ScoreRequest {
  split: "dev" | "test";
  runs: string[];
  out?: string;
  json?: string;
}

export interface CliIo {
  out(line: string): void;
  err(line: string): void;
}

const consoleIo: CliIo = {
  out: (line) => {
    process.stdout.write(`${line}\n`);
  },
  err: (line) => {
    process.stderr.write(`${line}\n`);
  },
};

export function defaultDeps(repoRoot: string = REPO_ROOT): FreezeGuardDeps {
  return repositoryFreezeDeps(repoRoot);
}

/**
 * Parses the arguments and applies the freeze guard. Returns an exit code when
 * the CLI stops here, or the scoring request when the split is allowed.
 */
export function runScoreCli(argv: readonly string[], deps: FreezeGuardDeps = defaultDeps(), io: CliIo = consoleIo): number | ScoreRequest {
  let values: { split?: string; runs?: string; out?: string; json?: string };
  try {
    const parsed = parseArgs({
      args: [...argv],
      options: { split: { type: "string" }, runs: { type: "string" }, out: { type: "string" }, json: { type: "string" } },
      strict: true,
      allowPositionals: false,
    });
    values = parsed.values;
  } catch (error) {
    io.err(error instanceof Error ? error.message : String(error));
    io.err(USAGE);
    return EXIT_USAGE;
  }
  const split = values.split;

  if (split === undefined) {
    io.err("missing --split");
    io.err(USAGE);
    return EXIT_USAGE;
  }
  if (!isSplit(split)) {
    io.err(`unknown split "${split}"`);
    io.err(USAGE);
    return EXIT_USAGE;
  }

  const decision = evaluateSplit(split, deps);
  if (!decision.allowed) {
    io.err(`Refusing to score the ${split} split: ${decision.reason}`);
    return EXIT_REFUSED;
  }

  const runs = (values.runs ?? "").split(",").map((r) => r.trim()).filter((r) => r !== "");
  if (runs.length === 0) {
    io.err("missing --runs");
    io.err(USAGE);
    return EXIT_USAGE;
  }
  return { split, runs, ...(values.out === undefined ? {} : { out: values.out }), ...(values.json === undefined ? {} : { json: values.json }) };
}

if (import.meta.main) {
  const result = runScoreCli(process.argv.slice(2));
  if (typeof result === "number") process.exitCode = result;
  else {
    const { scoreRuns } = await import("./scoreRuns.ts");
    process.exitCode = scoreRuns(result, consoleIo);
  }
}
