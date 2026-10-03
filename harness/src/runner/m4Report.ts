/**
 * M4 run report (`npm run m4:report -- artefacts/<run-id>`; DR-0072). Reads
 * every item block the runner wrote (`blocks/<item>.json.gz`, any depth
 * below the given directory) and writes `report-m4.md` and `report-m4.json`
 * beside them: per item and leg, the side-aware validity, the bracketing
 * canaries, journey completion per side, and each step's outcomes per side.
 *
 * It judges no expectation and gives no verdict: oracles and scoring are M5.
 * A journey completes when every AT step it ran was REACHED or PATH_CHANGED
 * and no step was left unrun. Every result is EXPLORATORY.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { gunzipSync } from "node:zlib";

type Outcome = "REACHED" | "PATH_CHANGED" | "UNREACHABLE" | "ENV_FAILURE";

export interface BlockStep {
  stepId: string;
  kind: "at" | "setup";
  outcome?: Outcome;
}

export interface BlockAttempt {
  side: "base" | "candidate";
  reasons: string[];
  steps: BlockStep[];
  notRun?: string[];
  error?: string;
  pageErrors?: string[];
  external?: string[];
  /** NVDA-absent leg: whether B2's platform events are complete (the listener ran without failure). */
  b2Evidence?: "complete" | "missing" | "not-in-leg";
}

export interface Block {
  item: { id: string; expected: { kind: string; symptom?: string; benignType?: string } };
  journeyId: string;
  leg: string;
  n: number;
  pre: { ok?: boolean } | null;
  post: { ok?: boolean } | null;
  validity: { result: string; inconclusive: { reason: string; on: string }[]; candidateFindings: string[] };
  attempts: BlockAttempt[];
  packageErrors: (string[] | null)[];
}

export interface SideSummary {
  attempts: number;
  completed: number;
  /** Attempts whose B2 platform events are missing (a listener failure counts as a failure, P13). */
  b2Missing: number;
  steps: Record<string, Partial<Record<Outcome | "NOT_RUN", number>>>;
}

export interface BlockSummary {
  itemId: string;
  expected: string;
  journeyId: string;
  leg: string;
  n: number;
  pre: boolean | null;
  post: boolean | null;
  validity: string;
  inconclusive: string[];
  candidateFindings: string[];
  base: SideSummary;
  candidate: SideSummary;
  pageErrors: number;
  external: number;
  invalidPackages: number;
}

/** Whether an attempt ran its whole journey with every AT step reached. */
export function completed(a: BlockAttempt): boolean {
  if (a.error !== undefined || (a.notRun ?? []).length > 0) return false;
  const at = a.steps.filter((s) => s.kind === "at");
  return at.length > 0 && at.every((s) => s.outcome === "REACHED" || s.outcome === "PATH_CHANGED");
}

function side(attempts: readonly BlockAttempt[]): SideSummary {
  const steps: SideSummary["steps"] = {};
  for (const a of attempts) {
    for (const s of a.steps) {
      if (s.kind !== "at" || s.outcome === undefined) continue;
      const tally = (steps[s.stepId] ??= {});
      tally[s.outcome] = (tally[s.outcome] ?? 0) + 1;
    }
    for (const id of a.notRun ?? []) {
      const tally = (steps[id] ??= {});
      tally.NOT_RUN = (tally.NOT_RUN ?? 0) + 1;
    }
  }
  return { attempts: attempts.length, completed: attempts.filter(completed).length, b2Missing: attempts.filter((a) => a.b2Evidence === "missing").length, steps };
}

export function summariseBlock(b: Block): BlockSummary {
  const e = b.item.expected;
  return {
    itemId: b.item.id,
    expected: e.kind === "regression" ? `regression:${e.symptom ?? "?"}` : e.kind === "benign" ? `benign:${e.benignType ?? "?"}` : e.kind,
    journeyId: b.journeyId,
    leg: b.leg,
    n: b.n,
    pre: b.pre === null ? null : b.pre.ok === true,
    post: b.post === null ? null : b.post.ok === true,
    validity: b.validity.result,
    inconclusive: b.validity.inconclusive.map((c) => `${c.reason}@${c.on}`),
    candidateFindings: b.validity.candidateFindings,
    base: side(b.attempts.filter((a) => a.side === "base")),
    candidate: side(b.attempts.filter((a) => a.side === "candidate")),
    pageErrors: b.attempts.reduce((k, a) => k + (a.pageErrors?.length ?? 0), 0),
    external: b.attempts.reduce((k, a) => k + (a.external?.length ?? 0), 0),
    invalidPackages: b.packageErrors.filter((p) => p !== null).length,
  };
}

function stepCell(s: SideSummary, id: string): string {
  const t = s.steps[id] ?? {};
  return Object.entries(t)
    .map(([k, v]) => `${k === "REACHED" ? "R" : k === "PATH_CHANGED" ? "P" : k === "UNREACHABLE" ? "U" : k === "ENV_FAILURE" ? "E" : "–"}${String(v)}`)
    .join(" ");
}

export function renderReport(summaries: readonly BlockSummary[]): string {
  const lines: string[] = ["# M4 item run (EXPLORATORY)", "", "Per item and leg: side-aware validity (DR-0035), the K1 bracketing canaries, journey completion per side, attempts whose B2 platform events are missing (a listener failure is a failure, not INCONCLUSIVE, P13), invalid or missing evidence packages, and step outcomes per side (R reached, P path changed, U unreachable, E env failure, – not run). No expectation is judged here; oracles and verdicts are M5.", ""];
  for (const leg of [...new Set(summaries.map((s) => s.leg))].sort()) {
    const rows = summaries.filter((s) => s.leg === leg);
    const inconclusive = rows.filter((r) => r.validity !== "VALID").length;
    lines.push(`## ${leg}`, "", `${String(rows.length)} items; ${String(inconclusive)} INCONCLUSIVE; base journeys completed in every attempt: ${String(rows.filter((r) => r.base.completed === r.base.attempts && r.base.attempts > 0).length)} of ${String(rows.length)}.`, "");
    lines.push("| Item | Expected | n | Canaries | Validity | Base complete | Candidate complete | B2 events missing | Packages invalid | Steps (base / candidate) |", "|---|---|---|---|---|---|---|---|---|---|");
    for (const r of rows.sort((a, b) => (a.itemId < b.itemId ? -1 : 1))) {
      const ids = [...new Set([...Object.keys(r.base.steps), ...Object.keys(r.candidate.steps)])];
      const steps = ids.map((id) => `${id}: ${stepCell(r.base, id)} / ${stepCell(r.candidate, id)}`).join("<br>");
      const canaries = `${r.pre === null ? "–" : r.pre ? "pre ok" : "pre FAIL"}, ${r.post === null ? "–" : r.post ? "post ok" : "post FAIL"}`;
      const validity = r.validity === "VALID" ? `VALID${r.candidateFindings.length > 0 ? ` (findings: ${r.candidateFindings.join(", ")})` : ""}` : `INCONCLUSIVE (${r.inconclusive.join(", ")})`;
      lines.push(`| ${r.itemId} | ${r.expected} | ${String(r.n)} | ${canaries} | ${validity} | ${String(r.base.completed)}/${String(r.base.attempts)} | ${String(r.candidate.completed)}/${String(r.candidate.attempts)} | ${String(r.base.b2Missing + r.candidate.b2Missing)} | ${String(r.invalidPackages)} | ${steps} |`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function blockFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...blockFiles(path));
    else if (name.endsWith(".json.gz") && !name.includes(" 2.")) out.push(path);
  }
  return out;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const dir = process.argv[2];
  if (dir === undefined) throw new Error("usage: npm run m4:report -- artefacts/<run-id>");
  const summaries = blockFiles(resolve(dir)).map((f) => summariseBlock(JSON.parse(gunzipSync(readFileSync(f)).toString("utf8")) as Block));
  writeFileSync(join(dir, "report-m4.json"), `${JSON.stringify({ label: "EXPLORATORY", summaries }, null, 2)}\n`);
  writeFileSync(join(dir, "report-m4.md"), renderReport(summaries));
  process.stdout.write(`${String(summaries.length)} blocks summarised into ${join(dir, "report-m4.md")}\n`);
}
