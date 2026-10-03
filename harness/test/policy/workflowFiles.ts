/**
 * Finds the YAML files the workflow policy tests check (DR-0016 D7, DR-0008):
 * the workflows in .github/workflows, and the local action manifests their
 * `uses: ./…` steps run. Local actions are exempt from W1 in a workflow, so
 * their own steps must be checked too, or they would bypass W1, W8 and the
 * env.lock SHA cross-check.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";

import { extractUses } from "../../src/policy/workflowPolicy.ts";

const WORKFLOW_DIR = ".github/workflows";
const ACTIONS_DIR = ".github/actions";
const MANIFEST_NAMES: readonly string[] = ["action.yml", "action.yaml"];

function isYaml(name: string): boolean {
  return name.endsWith(".yml") || name.endsWith(".yaml");
}

/** Repository-relative POSIX paths of every workflow file, sorted. */
export function listWorkflowFiles(repoRoot: string): string[] {
  return readdirSync(join(repoRoot, WORKFLOW_DIR))
    .filter(isYaml)
    .sort()
    .map((name) => `${WORKFLOW_DIR}/${name}`);
}

export interface LocalActions {
  /** Repository-relative POSIX paths of local action manifests, sorted. */
  manifests: string[];
  /** Local `uses:` references with no manifest, as "<file>: <uses>". */
  unresolved: string[];
}

/**
 * Lists every `.github/actions/**\/action.{yml,yaml}`, plus the manifest of
 * every local action referenced from a workflow or from another local action
 * (followed transitively). Local reusable workflows (`./….yml`) live in
 * .github/workflows and are checked as workflows.
 */
export function listLocalActions(repoRoot: string): LocalActions {
  const manifests = new Set<string>();
  const unresolved: string[] = [];
  const pending = listWorkflowFiles(repoRoot);
  const enqueue = (rel: string): void => {
    if (manifests.has(rel)) return;
    manifests.add(rel);
    pending.push(rel);
  };

  const actionsDir = join(repoRoot, ACTIONS_DIR);
  if (existsSync(actionsDir)) {
    for (const entry of readdirSync(actionsDir, { recursive: true, encoding: "utf8" })) {
      const rel = `${ACTIONS_DIR}/${entry.split("\\").join("/")}`;
      if (MANIFEST_NAMES.includes(posix.basename(rel))) enqueue(rel);
    }
  }

  for (let next = pending.shift(); next !== undefined; next = pending.shift()) {
    for (const entry of extractUses(readFileSync(join(repoRoot, next), "utf8"))) {
      if (entry.repo !== null || !entry.value.startsWith("./") || isYaml(entry.value)) continue;
      const dir = posix.normalize(entry.value);
      if (dir === ".." || dir.startsWith("../")) continue; // W1 already rejects `..` segments
      const manifest = MANIFEST_NAMES.map((name) => posix.join(dir, name)).find((rel) => existsSync(join(repoRoot, rel)));
      if (manifest === undefined) unresolved.push(`${next}: ${entry.value}`);
      else enqueue(manifest);
    }
  }

  return { manifests: [...manifests].sort(), unresolved };
}
