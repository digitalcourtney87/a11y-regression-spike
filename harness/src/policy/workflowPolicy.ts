/**
 * Workflow supply-chain policy (DR-0016 D7 SHA pinning and repository
 * settings; DR-0006 Runner images; DR-0008 GitHub Action pins; HANDOFF §4
 * hard rules 3 and 4).
 *
 * `checkWorkflow` is pure: it takes a workflow's YAML text and file name and
 * returns every violation it finds. `checkActionManifest` applies the rules
 * that make sense for a local action (`action.yml`), because local
 * `uses: ./…` entries are exempt from W1 in workflows. Rules:
 *
 * | Rule | Requirement |
 * |---|---|
 * | W0 | The file parses as a YAML mapping with `on` and a non-empty `jobs` mapping |
 * | W1 | Every `uses:` is a local path (`./…`, with no `..` segment) or `owner/repo[/path]@<40 lowercase hex>` with a trailing `# v<semver>` comment on the same line. A local action must be composite, so its steps can be checked |
 * | W2 | Top-level `permissions` is exactly `{ contents: read }`; job-level `permissions`, if present, maps scopes to `read` or `none` only |
 * | W3 | No `${{` inside any `run:` value |
 * | W4 | No `secrets.` (or `secrets[`) reference anywhere, and no `secrets:` key. Inside every `${{ … }}` expression and every `if:` value (an implicit expression): no reference to the `secrets` context at all (for example `toJSON(secrets)`), and no `github.token`, `github['token']`, computed `github[…]` index or whole `github` context (which contains the token)\* |
 * | W5 | No `pull_request_target` or `workflow_run` trigger |
 * | W6 | Every job's `runs-on` is `ubuntu-24.04` or `windows-2025`, or `windows-2022` only in a file whose name contains "probe"; a `${{ matrix.<key> }}` reference is resolved against the job's matrix |
 * | W7 | Every job sets a positive numeric `timeout-minutes` |
 * | W8 | Every `actions/checkout` step sets `with.persist-credentials: false` |
 *
 * \* The `github.token` and whole-`github` part of W4 goes beyond the literal
 * S7 rule ("no `secrets.` reference anywhere"). It was approved by the owner
 * 2026-10-02 (DR-0030): `github.token` is the GITHUB_TOKEN under another name,
 * and `toJSON(secrets)` or `toJSON(github)` piped through base64 gets past
 * log masking.
 *
 * | Applies to | Rules |
 * |---|---|
 * | Workflows (`.github/workflows/*.yml`) | W0–W8 |
 * | Local action manifests (`action.yml`) | W0, W1, W3, W4, W8 (W2, W5, W6 and W7 have no meaning in an action) |
 */

import { basename } from "node:path";
import { isMap, isNode, isScalar, isSeq, LineCounter, parseDocument, visit } from "yaml";
import type { Pair } from "yaml";

export type WorkflowRule = "W0" | "W1" | "W2" | "W3" | "W4" | "W5" | "W6" | "W7" | "W8";

export interface Violation {
  rule: WorkflowRule;
  file: string;
  /** 1-based line number, or null when the violation has no single location. */
  line: number | null;
  message: string;
}

/** Runner labels allowed in every workflow (DR-0006). */
export const RUNNER_ALLOWLIST: readonly string[] = ["ubuntu-24.04", "windows-2025"];
/** Runner labels allowed only in workflows whose file name contains "probe" (DR-0025). */
export const PROBE_ONLY_RUNNERS: readonly string[] = ["windows-2022"];

export const FORBIDDEN_TRIGGERS: readonly string[] = ["pull_request_target", "workflow_run"];

/** A local path: starts with `./` and has no `..` segment. */
const LOCAL_USES = /^(?!.*(?:^|\/)\.\.(?:\/|$))\.\/\S*$/;
const REMOTE_USES = /^([A-Za-z0-9-]+\/[A-Za-z0-9._-]+)((?:\/[^\s@]+)?)@([0-9a-f]{40})$/;
const VERSION_COMMENT = /^\s+#\s*(v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)(?:\s.*)?$/;
const SECRETS_REFERENCE = /\bsecrets\s*[.[]/;
/** Every `${{ … }}` expression in the raw text. */
const EXPRESSION = /\$\{\{([\s\S]*?)\}\}/g;
/** A single-quoted expression string literal (quotes escaped by doubling). */
const STRING_LITERAL = /'(?:[^']|'')*'/g;
/** A context name that is not itself a property (`inputs.secrets` and `my-github` are not contexts). */
const SECRETS_CONTEXT = /(?<![.\w-])secrets\b/i;
const GITHUB_TOKEN_PROPERTY = /(?<![.\w-])github\s*\.\s*token\b/i;
const GITHUB_TOKEN_INDEX = /(?<![.\w-])github\s*\[\s*(?:'token'\s*\]|[^'\s])/i;
const WHOLE_GITHUB_CONTEXT = /(?<![.\w-])github\b(?!\s*[.[])/i;
const MATRIX_REFERENCE = /^\$\{\{\s*matrix\.([A-Za-z0-9_-]+)\s*\}\}$/;

/** One `uses:` entry as written in a workflow. */
export interface UsesEntry {
  /** The `uses:` value. */
  value: string;
  /** 1-based line number. */
  line: number;
  /** For remote actions: `owner/repo`, else null. */
  repo: string | null;
  /** For remote actions: the pinned SHA, else null. */
  sha: string | null;
  /** The `v<semver>` from the trailing comment, if present. */
  versionComment: string | null;
}

type ParsedDoc = ReturnType<typeof parseDocument>;

interface Ctx {
  file: string;
  text: string;
  doc: ParsedDoc;
  lc: LineCounter;
  out: Violation[];
}

function add(ctx: Ctx, rule: WorkflowRule, line: number | null, message: string): void {
  ctx.out.push({ rule, file: ctx.file, line, message });
}

function lineOf(ctx: Ctx, node: unknown): number | null {
  if (isNode(node) && node.range) return ctx.lc.linePos(node.range[0]).line;
  return null;
}

function pairOf(node: unknown, key: string): Pair | undefined {
  if (!isMap(node)) return undefined;
  for (const item of node.items) {
    if (isScalar(item.key) && item.key.value === key) return item;
  }
  return undefined;
}

function keyLine(ctx: Ctx, pair: Pair | undefined): number | null {
  return pair === undefined ? null : lineOf(ctx, pair.key);
}

function toJs(ctx: Ctx, node: unknown): unknown {
  return isNode(node) ? (node.toJS(ctx.doc) as unknown) : node;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) collectStrings(v, out);
  else if (isRecord(value)) for (const v of Object.values(value)) collectStrings(v, out);
}

function restOfLine(text: string, offset: number): string {
  const end = text.indexOf("\n", offset);
  return text.slice(offset, end === -1 ? undefined : end).replace(/\r$/, "");
}

function parse(text: string): { doc: ParsedDoc; lc: LineCounter } {
  const lc = new LineCounter();
  const doc = parseDocument(text, { lineCounter: lc, prettyErrors: false });
  return { doc, lc };
}

function readUses(ctx: Ctx): Array<UsesEntry | { invalid: true; line: number | null }> {
  const entries: Array<UsesEntry | { invalid: true; line: number | null }> = [];
  visit(ctx.doc, {
    Pair(_, pair) {
      if (!isScalar(pair.key) || pair.key.value !== "uses") return;
      const node = pair.value;
      if (!isScalar(node) || typeof node.value !== "string" || !node.range) {
        entries.push({ invalid: true, line: lineOf(ctx, pair.key) });
        return;
      }
      const value = node.value;
      const line = ctx.lc.linePos(node.range[0]).line;
      const comment = VERSION_COMMENT.exec(restOfLine(ctx.text, node.range[1]));
      const remote = REMOTE_USES.exec(value);
      entries.push({
        value,
        line,
        repo: remote?.[1] ?? null,
        sha: remote?.[3] ?? null,
        versionComment: comment?.[1] ?? null,
      });
    },
  });
  return entries;
}

/**
 * Lists every `uses:` entry in a workflow (used by the env.lock consistency
 * test). Entries that are not plain strings are omitted; `checkWorkflow`
 * reports them under W1.
 */
export function extractUses(yamlText: string): UsesEntry[] {
  const { doc, lc } = parse(yamlText);
  if (doc.errors.length > 0) return [];
  const ctx: Ctx = { file: "", text: yamlText, doc, lc, out: [] };
  return readUses(ctx).filter((e): e is UsesEntry => !("invalid" in e));
}

function checkUses(ctx: Ctx): void {
  for (const entry of readUses(ctx)) {
    if ("invalid" in entry) {
      add(ctx, "W1", entry.line, "`uses:` must be a plain string");
      continue;
    }
    if (LOCAL_USES.test(entry.value)) continue;
    if (entry.sha === null) {
      add(ctx, "W1", entry.line, `\`uses: ${entry.value}\` must be a local path (./…) or owner/repo[/path]@<40 lowercase hex SHA>`);
      continue;
    }
    if (entry.versionComment === null) {
      add(ctx, "W1", entry.line, `\`uses: ${entry.value}\` must carry a trailing \`# v<semver>\` comment on the same line`);
    }
  }
}

function checkPermissions(ctx: Ctx, root: unknown, jobs: Array<{ id: string; node: unknown }>): void {
  const top = pairOf(root, "permissions");
  if (top === undefined) {
    add(ctx, "W2", null, "top-level `permissions` is missing; it must be exactly `{ contents: read }`");
  } else {
    const value = toJs(ctx, top.value);
    const exact = isRecord(value) && Object.keys(value).length === 1 && value.contents === "read";
    if (!exact) add(ctx, "W2", keyLine(ctx, top), "top-level `permissions` must be exactly `{ contents: read }`");
  }
  for (const { id, node } of jobs) {
    const pair = pairOf(node, "permissions");
    if (pair === undefined) continue;
    const value = toJs(ctx, pair.value);
    const ok = isRecord(value) && Object.values(value).every((v) => v === "read" || v === "none");
    if (!ok) add(ctx, "W2", keyLine(ctx, pair), `job \`${id}\` permissions may only grant \`read\` or \`none\``);
  }
}

function checkRun(ctx: Ctx): void {
  visit(ctx.doc, {
    Pair(_, pair) {
      if (!isScalar(pair.key) || pair.key.value !== "run") return;
      const strings: string[] = [];
      collectStrings(toJs(ctx, pair.value), strings);
      if (strings.some((s) => s.includes("${{"))) {
        add(ctx, "W3", lineOf(ctx, pair.key), "`run:` must not contain `${{`; pass values through `env:`");
      }
    },
  });
}

/**
 * Why an expression's text exposes a secret or the GitHub token, or null.
 * String literals are blanked first, so `'refs/heads/github'` is not a context.
 */
export function expressionSecretProblem(expression: string): string | null {
  if (GITHUB_TOKEN_INDEX.test(expression)) return "must not index `github` by `'token'` or by a computed value";
  const code = expression.replace(STRING_LITERAL, "''");
  if (SECRETS_CONTEXT.test(code)) return "must not reference the `secrets` context";
  if (GITHUB_TOKEN_PROPERTY.test(code)) return "must not reference `github.token` (the GITHUB_TOKEN)";
  if (WHOLE_GITHUB_CONTEXT.test(code)) return "must not use the whole `github` context, which contains the token";
  return null;
}

function checkSecrets(ctx: Ctx): void {
  // One W4 violation per line, whichever check finds it first.
  const found = new Map<number | null, string>();
  const flag = (line: number | null, message: string): void => {
    if (!found.has(line)) found.set(line, message);
  };
  ctx.text.split("\n").forEach((line, index) => {
    if (SECRETS_REFERENCE.test(line)) flag(index + 1, "workflows must not reference `secrets`");
  });
  for (const match of ctx.text.matchAll(EXPRESSION)) {
    const problem = expressionSecretProblem(match[1] ?? "");
    if (problem !== null) flag(ctx.lc.linePos(match.index).line, `expression \`\${{${match[1] ?? ""}}}\` ${problem}`);
  }
  visit(ctx.doc, {
    Pair(_, pair) {
      if (!isScalar(pair.key)) return;
      if (pair.key.value === "secrets") {
        flag(lineOf(ctx, pair.key), "workflows must not pass `secrets`");
      } else if (pair.key.value === "if" && isScalar(pair.value) && typeof pair.value.value === "string") {
        const problem = expressionSecretProblem(pair.value.value);
        if (problem !== null) flag(lineOf(ctx, pair.key), `\`if: ${pair.value.value}\` ${problem}`);
      }
    },
  });
  for (const [line, message] of found) add(ctx, "W4", line, message);
}

function checkTriggers(ctx: Ctx, onPair: Pair): void {
  const value = toJs(ctx, onPair.value);
  let triggers: string[] = [];
  if (typeof value === "string") triggers = [value];
  else if (Array.isArray(value)) triggers = value.filter((v): v is string => typeof v === "string");
  else if (isRecord(value)) triggers = Object.keys(value);
  for (const t of triggers) {
    if (FORBIDDEN_TRIGGERS.includes(t)) add(ctx, "W5", keyLine(ctx, onPair), `trigger \`${t}\` is not allowed`);
  }
}

function runnerProblem(label: string, allowed: readonly string[]): string | null {
  if (allowed.includes(label)) return null;
  if (label.endsWith("-latest")) return `\`${label}\` is a moving label; use an explicit image`;
  if (label === "self-hosted") return "self-hosted runners are not allowed";
  if (PROBE_ONLY_RUNNERS.includes(label)) return `\`${label}\` is allowed only in a probe workflow (file name containing "probe")`;
  return `runner label \`${label}\` is not in the allowlist (${allowed.join(", ")}); larger and other runners are not allowed`;
}

function matrixValues(strategy: unknown, key: string): unknown[] | null {
  if (!isRecord(strategy) || !isRecord(strategy.matrix)) return null;
  const matrix = strategy.matrix;
  const values: unknown[] = [];
  const direct = matrix[key];
  if (Array.isArray(direct)) values.push(...(direct as unknown[]));
  else if (direct !== undefined) return null;
  const include = matrix.include;
  if (Array.isArray(include)) {
    for (const entry of include as unknown[]) {
      if (isRecord(entry) && key in entry) values.push(entry[key]);
    }
  } else if (include !== undefined) {
    return null;
  }
  return values.length > 0 ? values : null;
}

function checkRunsOn(ctx: Ctx, id: string, node: unknown, allowed: readonly string[]): void {
  const pair = pairOf(node, "runs-on");
  if (pair === undefined) {
    add(ctx, "W6", lineOf(ctx, node), `job \`${id}\` must set \`runs-on\` (reusable-workflow calls are not allowed)`);
    return;
  }
  const line = keyLine(ctx, pair);
  const value = toJs(ctx, pair.value);
  if (typeof value !== "string") {
    add(ctx, "W6", line, `job \`${id}\` \`runs-on\` must be a single runner label`);
    return;
  }
  const matrixRef = MATRIX_REFERENCE.exec(value);
  if (matrixRef?.[1] !== undefined) {
    const values = matrixValues(toJs(ctx, pairOf(node, "strategy")?.value), matrixRef[1]);
    if (values === null) {
      add(ctx, "W6", line, `job \`${id}\` \`runs-on: ${value}\` must resolve to a literal list in \`strategy.matrix\``);
      return;
    }
    for (const v of values) {
      const problem = typeof v === "string" ? runnerProblem(v, allowed) : "matrix runner values must be literal labels";
      if (problem !== null) add(ctx, "W6", line, `job \`${id}\`: ${problem}`);
    }
    return;
  }
  if (value.includes("${{")) {
    add(ctx, "W6", line, `job \`${id}\` \`runs-on\` may only use a literal label or \`\${{ matrix.<key> }}\``);
    return;
  }
  const problem = runnerProblem(value, allowed);
  if (problem !== null) add(ctx, "W6", line, `job \`${id}\`: ${problem}`);
}

function checkTimeout(ctx: Ctx, id: string, node: unknown): void {
  const pair = pairOf(node, "timeout-minutes");
  const value = pair === undefined ? undefined : toJs(ctx, pair.value);
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    add(ctx, "W7", pair === undefined ? lineOf(ctx, node) : keyLine(ctx, pair), `job \`${id}\` must set a positive numeric \`timeout-minutes\``);
  }
}

/** W8 over a `steps` sequence; `where` names the job or action in messages. */
function checkCheckout(ctx: Ctx, where: string, steps: unknown): void {
  if (!isSeq(steps)) return;
  for (const step of steps.items) {
    const usesPair = pairOf(step, "uses");
    const uses = usesPair === undefined ? undefined : toJs(ctx, usesPair.value);
    if (typeof uses !== "string" || !/^actions\/checkout@/i.test(uses)) continue;
    const withValue = toJs(ctx, pairOf(step, "with")?.value);
    const persist = isRecord(withValue) ? withValue["persist-credentials"] : undefined;
    if (persist !== false && persist !== "false") {
      add(ctx, "W8", keyLine(ctx, usesPair), `${where}: actions/checkout must set \`with.persist-credentials: false\``);
    }
  }
}

/**
 * Checks one workflow file. `fileName` may be a path; only its base name is
 * used (for the probe-only runner rule and in messages).
 */
export function checkWorkflow(yamlText: string, fileName: string): Violation[] {
  const name = basename(fileName);
  const { doc, lc } = parse(yamlText);
  const ctx: Ctx = { file: name, text: yamlText, doc, lc, out: [] };

  if (doc.errors.length > 0) {
    for (const error of doc.errors) {
      add(ctx, "W0", lc.linePos(error.pos[0]).line, `YAML parse error: ${error.message}`);
    }
    return ctx.out;
  }

  const root = doc.contents;
  if (!isMap(root)) {
    add(ctx, "W0", null, "workflow must be a YAML mapping");
    return ctx.out;
  }

  const jobsPair = pairOf(root, "jobs");
  const jobs: Array<{ id: string; node: unknown }> = [];
  if (jobsPair === undefined || !isMap(jobsPair.value) || jobsPair.value.items.length === 0) {
    add(ctx, "W0", keyLine(ctx, jobsPair), "workflow must define a non-empty `jobs` mapping");
  } else {
    for (const item of jobsPair.value.items) {
      const id = isScalar(item.key) ? String(item.key.value) : "?";
      if (!isMap(item.value)) {
        add(ctx, "W0", lineOf(ctx, item.key), `job \`${id}\` must be a mapping`);
        continue;
      }
      jobs.push({ id, node: item.value });
    }
  }

  const onPair = pairOf(root, "on");
  if (onPair === undefined) add(ctx, "W0", null, "workflow must declare `on`");
  else checkTriggers(ctx, onPair);

  checkUses(ctx);
  checkPermissions(ctx, root, jobs);
  checkRun(ctx);
  checkSecrets(ctx);

  const allowed = name.toLowerCase().includes("probe") ? [...RUNNER_ALLOWLIST, ...PROBE_ONLY_RUNNERS] : RUNNER_ALLOWLIST;
  for (const { id, node } of jobs) {
    checkRunsOn(ctx, id, node, allowed);
    checkTimeout(ctx, id, node);
    checkCheckout(ctx, `job \`${id}\``, pairOf(node, "steps")?.value);
  }

  return ctx.out;
}

/**
 * Checks one local action manifest (`action.yml` or `action.yaml`). Local
 * `uses: ./…` entries are exempt from W1 in workflows, so the action's own
 * steps are checked here. The action must be composite: a JavaScript or Docker
 * action would hide its dependencies from W1. `fileName` is used as given in
 * messages (pass the repository-relative path).
 */
export function checkActionManifest(yamlText: string, fileName: string): Violation[] {
  const { doc, lc } = parse(yamlText);
  const ctx: Ctx = { file: fileName, text: yamlText, doc, lc, out: [] };

  if (doc.errors.length > 0) {
    for (const error of doc.errors) {
      add(ctx, "W0", lc.linePos(error.pos[0]).line, `YAML parse error: ${error.message}`);
    }
    return ctx.out;
  }

  const root = doc.contents;
  if (!isMap(root)) {
    add(ctx, "W0", null, "action manifest must be a YAML mapping");
    return ctx.out;
  }

  const runsPair = pairOf(root, "runs");
  const using = toJs(ctx, pairOf(runsPair?.value, "using")?.value);
  const steps = pairOf(runsPair?.value, "steps")?.value;
  if (runsPair === undefined || !isMap(runsPair.value)) {
    add(ctx, "W0", keyLine(ctx, runsPair), "action manifest must define a `runs` mapping");
  } else if (using !== "composite") {
    add(ctx, "W1", keyLine(ctx, runsPair), `local actions must be composite (\`runs.using: composite\`), so W1 can check every step; found \`${String(using)}\``);
  } else if (!isSeq(steps) || steps.items.length === 0) {
    add(ctx, "W0", keyLine(ctx, runsPair), "a composite action must define a non-empty `runs.steps` sequence");
  }

  checkUses(ctx);
  checkRun(ctx);
  checkSecrets(ctx);
  checkCheckout(ctx, "action", steps);

  return ctx.out;
}
