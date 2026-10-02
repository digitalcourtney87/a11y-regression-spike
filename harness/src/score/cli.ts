/**
 * Scorer entry point: `npm run score -- --split <dev|test>` (DR-0028).
 *
 * Exit codes:
 *
 * | Code | Meaning |
 * |---|---|
 * | 1 | Test split refused by the freeze guard |
 * | 2 | Missing or unknown split, or unknown arguments |
 * | 3 | Split allowed, but the scorer is not implemented until M5 |
 */

import { resolve } from "node:path";
import { parseArgs } from "node:util";

import { evaluateSplit, gitFreezeDeps, isSplit } from "./freezeGuard.ts";
import type { FreezeGuardDeps } from "./freezeGuard.ts";
import { computeProtocolHash } from "./protocolHash.ts";

export const EXIT_REFUSED = 1;
export const EXIT_USAGE = 2;
export const EXIT_NOT_IMPLEMENTED = 3;

const USAGE = "usage: npm run score -- --split <dev|test>";

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

/** The repository root, located from this file rather than the working directory. */
export const REPO_ROOT = resolve(import.meta.dirname, "../../..");

export function defaultDeps(repoRoot: string = REPO_ROOT): FreezeGuardDeps {
  return gitFreezeDeps(repoRoot, () => computeProtocolHash(resolve(repoRoot, "protocol")));
}

/** Runs the scorer CLI and returns its exit code. */
export function runScoreCli(argv: readonly string[], deps: FreezeGuardDeps = defaultDeps(), io: CliIo = consoleIo): number {
  let split: string | undefined;
  try {
    const parsed = parseArgs({
      args: [...argv],
      options: { split: { type: "string" } },
      strict: true,
      allowPositionals: false,
    });
    split = parsed.values.split;
  } catch (error) {
    io.err(error instanceof Error ? error.message : String(error));
    io.err(USAGE);
    return EXIT_USAGE;
  }

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

  io.out("Scorer not implemented until M5.");
  return EXIT_NOT_IMPLEMENTED;
}

if (import.meta.main) {
  process.exitCode = runScoreCli(process.argv.slice(2));
}
