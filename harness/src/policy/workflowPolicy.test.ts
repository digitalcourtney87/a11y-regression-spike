import { describe, expect, test } from "vitest";

import { checkActionManifest, checkWorkflow, expressionSecretProblem, extractUses } from "./workflowPolicy.ts";
import type { Violation, WorkflowRule } from "./workflowPolicy.ts";

const SHA_CHECKOUT = "3d3c42e5aac5ba805825da76410c181273ba90b1";
const SHA_NODE = "820762786026740c76f36085b0efc47a31fe5020";

/** A minimal workflow that satisfies every rule; `jobBody` replaces the job's body. */
function workflow(options: { top?: string; jobBody?: string; on?: string } = {}): string {
  const top = options.top ?? "permissions:\n  contents: read\n";
  const on = options.on ?? "on:\n  pull_request:\n";
  const jobBody =
    options.jobBody ??
    [
      "    runs-on: ubuntu-24.04",
      "    timeout-minutes: 10",
      "    steps:",
      `      - uses: actions/checkout@${SHA_CHECKOUT} # v7.0.1`,
      "        with:",
      "          persist-credentials: false",
      "      - run: npm test",
    ].join("\n");
  return `name: t\n${on}${top}jobs:\n  check:\n${jobBody}\n`;
}

function job(lines: string[]): string {
  return lines.map((l) => `    ${l}`).join("\n");
}

const BASE_JOB = ["runs-on: ubuntu-24.04", "timeout-minutes: 10"];

function rules(violations: Violation[]): WorkflowRule[] {
  return [...new Set(violations.map((v) => v.rule))].sort();
}

describe("checkWorkflow baseline", () => {
  test("a compliant workflow has no violations", () => {
    expect(checkWorkflow(workflow(), "ci.yml")).toEqual([]);
  });

  test("local actions need no SHA or comment", () => {
    const wf = workflow({ jobBody: job([...BASE_JOB, "steps:", "  - uses: ./.github/actions/setup"]) });
    expect(checkWorkflow(wf, "ci.yml")).toEqual([]);
  });

  test("local paths may not contain a .. segment", () => {
    for (const ref of ["./../x", "./../../x", "./a/../../x", "./..", "./a/.."]) {
      const wf = workflow({ jobBody: job([...BASE_JOB, "steps:", `  - uses: ${ref}`]) });
      expect(rules(checkWorkflow(wf, "ci.yml")), ref).toEqual(["W1"]);
    }
    for (const ref of ["./", "./a..b/action", "./.github/actions/.setup"]) {
      const wf = workflow({ jobBody: job([...BASE_JOB, "steps:", `  - uses: ${ref}`]) });
      expect(checkWorkflow(wf, "ci.yml"), ref).toEqual([]);
    }
  });

  test("unparseable YAML is W0", () => {
    expect(rules(checkWorkflow("jobs: [unclosed", "x.yml"))).toEqual(["W0"]);
  });

  test("a workflow without jobs is W0", () => {
    expect(rules(checkWorkflow("on: push\npermissions:\n  contents: read\n", "x.yml"))).toEqual(["W0"]);
  });
});

describe("W1 action pinning", () => {
  test.each([
    ["a tag", "actions/checkout@v7"],
    ["a branch", "actions/checkout@main"],
    ["a short SHA", "actions/checkout@3d3c42e"],
    ["an uppercase SHA", `actions/checkout@${SHA_CHECKOUT.toUpperCase()}`],
    ["a docker image", "docker://alpine:3.20"],
  ])("rejects %s", (_label, ref) => {
    const wf = workflow({ jobBody: job([...BASE_JOB, "steps:", `  - uses: ${ref} # v7.0.1`]) });
    expect(rules(checkWorkflow(wf, "ci.yml"))).toContain("W1");
  });

  test("requires a trailing # v<semver> comment", () => {
    for (const suffix of ["", " # v7", " # 7.0.1", " # pinned", "\n      # v7.0.1"]) {
      const wf = workflow({ jobBody: job([...BASE_JOB, "steps:", `  - uses: actions/setup-node@${SHA_NODE}${suffix}`]) });
      const v = checkWorkflow(wf, "ci.yml");
      expect(rules(v), `suffix ${JSON.stringify(suffix)}`).toEqual(["W1"]);
      expect(v[0]?.line).toBe(11);
    }
  });

  test("accepts sub-path actions, quoted values and pre-release versions", () => {
    const wf = workflow({
      jobBody: job([
        ...BASE_JOB,
        "steps:",
        `  - uses: github/codeql-action/init@${SHA_NODE} # v4.1.0`,
        `  - uses: "actions/setup-node@${SHA_NODE}"  # v7.0.0-beta.1`,
      ]),
    });
    expect(checkWorkflow(wf, "ci.yml")).toEqual([]);
  });

  test("checks reusable-workflow uses at job level", () => {
    const wf = `on: push\npermissions:\n  contents: read\njobs:\n  call:\n    uses: org/repo/.github/workflows/x.yml@main\n`;
    expect(rules(checkWorkflow(wf, "ci.yml"))).toContain("W1");
  });
});

describe("W2 permissions", () => {
  test("missing top-level permissions", () => {
    expect(rules(checkWorkflow(workflow({ top: "" }), "ci.yml"))).toEqual(["W2"]);
  });

  test.each([
    ["write-all", "permissions: write-all\n"],
    ["read-all", "permissions: read-all\n"],
    ["contents: write", "permissions:\n  contents: write\n"],
    ["an extra scope", "permissions:\n  contents: read\n  actions: read\n"],
    ["an empty map", "permissions: {}\n"],
  ])("rejects top-level %s", (_label, top) => {
    expect(rules(checkWorkflow(workflow({ top }), "ci.yml"))).toEqual(["W2"]);
  });

  test("job-level permissions may only be read or none", () => {
    const ok = workflow({ jobBody: job([...BASE_JOB, "permissions:", "  contents: read", "  actions: none", "steps:", "  - run: echo ok"]) });
    expect(checkWorkflow(ok, "ci.yml")).toEqual([]);
    const bad = workflow({ jobBody: job([...BASE_JOB, "permissions:", "  contents: write", "steps:", "  - run: echo ok"]) });
    expect(rules(checkWorkflow(bad, "ci.yml"))).toEqual(["W2"]);
    const badString = workflow({ jobBody: job([...BASE_JOB, "permissions: write-all", "steps:", "  - run: echo ok"]) });
    expect(rules(checkWorkflow(badString, "ci.yml"))).toEqual(["W2"]);
  });
});

describe("W3 no interpolation in run", () => {
  test("rejects ${{ in a single-line run", () => {
    const wf = workflow({ jobBody: job([...BASE_JOB, "steps:", "  - run: echo ${{ github.event.pull_request.title }}"]) });
    expect(rules(checkWorkflow(wf, "ci.yml"))).toEqual(["W3"]);
  });

  test("rejects ${{ in a block run", () => {
    const wf = workflow({ jobBody: job([...BASE_JOB, "steps:", "  - run: |", "      echo start", "      echo ${{ inputs.runs }}"]) });
    expect(rules(checkWorkflow(wf, "ci.yml"))).toEqual(["W3"]);
  });

  test("allows expressions in env and shell variables in run", () => {
    const wf = workflow({
      jobBody: job([...BASE_JOB, "steps:", "  - env:", "      RUNS: ${{ inputs.runs }}", '    run: echo "$RUNS"']),
    });
    expect(checkWorkflow(wf, "ci.yml")).toEqual([]);
  });
});

describe("W4 no secrets", () => {
  test.each([
    ["in env", ["steps:", "  - env:", "      TOKEN: ${{ secrets.GITHUB_TOKEN }}", "    run: echo ok"]],
    ["in bracket form", ["steps:", "  - env:", "      TOKEN: ${{ secrets['X'] }}", "    run: echo ok"]],
    ["in an if", ["steps:", "  - if: secrets.X != ''", "    run: echo ok"]],
  ])("rejects a reference %s", (_label, lines) => {
    const wf = workflow({ jobBody: job([...BASE_JOB, ...lines]) });
    expect(rules(checkWorkflow(wf, "ci.yml"))).toEqual(["W4"]);
  });

  test("rejects a secrets: key", () => {
    const wf = workflow({ jobBody: job([...BASE_JOB, "secrets: inherit", "steps:", "  - run: echo ok"]) });
    expect(rules(checkWorkflow(wf, "ci.yml"))).toEqual(["W4"]);
  });

  test.each([
    ["the whole secrets context in env", ["steps:", "  - env:", "      T: ${{ toJSON(secrets) }}", '    run: echo "$T" | base64']],
    ["the whole secrets context in an implicit if", ["steps:", "  - if: contains(toJSON(secrets), 'x')", "    run: echo ok"]],
    ["the whole secrets context in a job-level if", ["if: ${{ toJSON(secrets) != '{}' }}", "steps:", "  - run: echo ok"]],
    ["github.token in env", ["steps:", "  - env:", "      T: ${{ github.token }}", "    run: echo ok"]],
    ["github.token with spacing and case", ["steps:", "  - env:", "      T: ${{ GitHub . Token }}", "    run: echo ok"]],
    ["github['token']", ["steps:", "  - env:", "      T: ${{ github['token'] }}", "    run: echo ok"]],
    ["a computed github index", ["steps:", "  - env:", "      T: ${{ github[format('{0}', 'token')] }}", "    run: echo ok"]],
    ["the whole github context", ["steps:", "  - env:", "      G: ${{ toJSON(github) }}", "    run: echo ok"]],
    ["github.token in an action input", ["steps:", "  - uses: ./local", "    with:", "      token: ${{ github.token }}"]],
  ])("rejects %s (Proposed by Claude: expressions and github.token)", (_label, lines) => {
    const wf = workflow({ jobBody: job([...BASE_JOB, ...lines]) });
    const v = checkWorkflow(wf, "ci.yml");
    expect(rules(v)).toEqual(["W4"]);
    expect(v).toHaveLength(1);
  });

  test("allows ordinary github properties and string literals that mention the contexts", () => {
    const wf = workflow({
      jobBody: job([
        ...BASE_JOB,
        "steps:",
        "  - if: github.event_name == 'push' && startsWith(github.ref, 'refs/heads/github')",
        "    env:",
        "      REF: ${{ github.ref }}",
        "      NOTE: ${{ format('{0} has no secrets', github.repository) }}",
        "      INPUT: ${{ github.event.inputs.token }}",
        '    run: echo "$REF"',
      ]),
    });
    expect(checkWorkflow(wf, "ci.yml")).toEqual([]);
  });

  test("expressionSecretProblem explains each finding", () => {
    expect(expressionSecretProblem(" toJSON(secrets) ")).toMatch(/secrets/);
    expect(expressionSecretProblem("github.token")).toMatch(/github\.token/);
    expect(expressionSecretProblem("github['TOKEN']")).toMatch(/index/);
    expect(expressionSecretProblem("toJSON(github)")).toMatch(/whole `github` context/);
    expect(expressionSecretProblem("github.ref")).toBeNull();
    expect(expressionSecretProblem("github['ref']")).toBeNull();
    expect(expressionSecretProblem("inputs.secrets")).toBeNull();
  });
});

describe("W5 triggers", () => {
  test.each([
    ["mapping pull_request_target", "on:\n  pull_request_target:\n"],
    ["string workflow_run", "on: workflow_run\n"],
    ["list form", "on: [push, pull_request_target]\n"],
    ["workflow_run mapping", "on:\n  workflow_run:\n    workflows: [ci]\n"],
  ])("rejects %s", (_label, on) => {
    expect(rules(checkWorkflow(workflow({ on }), "ci.yml"))).toEqual(["W5"]);
  });

  test("allows push, pull_request and workflow_dispatch", () => {
    const on = "on:\n  push:\n    branches: [main]\n  pull_request:\n  workflow_dispatch:\n";
    expect(checkWorkflow(workflow({ on }), "ci.yml")).toEqual([]);
  });
});

describe("W6 runner allowlist", () => {
  function runsOn(label: string, file = "ci.yml", extra: string[] = []): Violation[] {
    return checkWorkflow(workflow({ jobBody: job([`runs-on: ${label}`, "timeout-minutes: 10", ...extra, "steps:", "  - run: echo ok"]) }), file);
  }

  test("allows ubuntu-24.04 and windows-2025 anywhere", () => {
    expect(runsOn("ubuntu-24.04")).toEqual([]);
    expect(runsOn("windows-2025")).toEqual([]);
  });

  test("allows windows-2022 only in a probe workflow", () => {
    expect(rules(runsOn("windows-2022"))).toEqual(["W6"]);
    expect(runsOn("windows-2022", "m1a-probe.yml")).toEqual([]);
    expect(runsOn("windows-2022", ".github/workflows/runner-probe.yaml")).toEqual([]);
  });

  test.each(["windows-latest", "ubuntu-latest", "self-hosted", "windows-2025-8core", "ubuntu-22.04", "[self-hosted, windows]", "{ group: big }"])(
    "rejects %s",
    (label) => {
      expect(rules(runsOn(label, "probe.yml"))).toEqual(["W6"]);
    },
  );

  test("rejects a missing runs-on", () => {
    const wf = workflow({ jobBody: job(["timeout-minutes: 10", "steps:", "  - run: echo ok"]) });
    expect(rules(checkWorkflow(wf, "ci.yml"))).toEqual(["W6"]);
  });

  test("resolves matrix runner labels", () => {
    const matrix = ["strategy:", "  matrix:", "    os: [windows-2025, windows-2022]"];
    expect(runsOn("${{ matrix.os }}", "m1a-probe.yml", matrix)).toEqual([]);
    expect(rules(runsOn("${{ matrix.os }}", "phase0-nvda.yml", matrix))).toEqual(["W6"]);
    const include = ["strategy:", "  matrix:", "    os: [windows-2025]", "    include:", "      - os: windows-latest"];
    expect(rules(runsOn("${{ matrix.os }}", "probe.yml", include))).toEqual(["W6"]);
    const dynamic = ["strategy:", "  matrix:", "    os: ${{ fromJSON(inputs.oses) }}"];
    expect(rules(runsOn("${{ matrix.os }}", "probe.yml", dynamic))).toEqual(["W6"]);
    expect(rules(runsOn("${{ inputs.runner }}", "probe.yml"))).toEqual(["W6"]);
  });
});

describe("W7 timeout", () => {
  test.each([
    ["missing", []],
    ["zero", ["timeout-minutes: 0"]],
    ["a string", ["timeout-minutes: soon"]],
    ["an expression", ["timeout-minutes: ${{ inputs.t }}"]],
  ])("rejects a timeout that is %s", (_label, lines) => {
    const wf = workflow({ jobBody: job(["runs-on: ubuntu-24.04", ...lines, "steps:", "  - run: echo ok"]) });
    expect(rules(checkWorkflow(wf, "ci.yml"))).toEqual(["W7"]);
  });
});

describe("W8 checkout credentials", () => {
  test.each([
    ["no with", [`  - uses: actions/checkout@${SHA_CHECKOUT} # v7.0.1`]],
    ["persist-credentials true", [`  - uses: actions/checkout@${SHA_CHECKOUT} # v7.0.1`, "    with:", "      persist-credentials: true"]],
    ["another input only", [`  - uses: actions/checkout@${SHA_CHECKOUT} # v7.0.1`, "    with:", "      fetch-depth: 0"]],
  ])("rejects checkout with %s", (_label, steps) => {
    const wf = workflow({ jobBody: job([...BASE_JOB, "steps:", ...steps]) });
    expect(rules(checkWorkflow(wf, "ci.yml"))).toEqual(["W8"]);
  });
});

describe("violation metadata", () => {
  test("reports the base file name and a line", () => {
    const wf = workflow({ jobBody: job(["runs-on: windows-latest", "timeout-minutes: 10", "steps:", "  - run: echo ok"]) });
    expect(checkWorkflow(wf, "/abs/path/.github/workflows/ci.yml")).toEqual([
      expect.objectContaining({ rule: "W6", file: "ci.yml", line: 8 }),
    ]);
  });
});

describe("extractUses", () => {
  test("lists remote and local uses with SHA, repo and version comment", () => {
    const wf = workflow({
      jobBody: job([
        ...BASE_JOB,
        "steps:",
        `  - uses: actions/checkout@${SHA_CHECKOUT} # v7.0.1`,
        "    with:",
        "      persist-credentials: false",
        "  - uses: ./local",
      ]),
    });
    expect(extractUses(wf)).toEqual([
      { value: `actions/checkout@${SHA_CHECKOUT}`, line: 11, repo: "actions/checkout", sha: SHA_CHECKOUT, versionComment: "v7.0.1" },
      { value: "./local", line: 14, repo: null, sha: null, versionComment: null },
    ]);
  });
});

describe("checkActionManifest (local composite actions)", () => {
  function action(lines: string[]): string {
    return ["name: setup", "description: test action", "runs:", ...lines, ""].join("\n");
  }
  const COMPOSITE = ["  using: composite", "  steps:"];

  test("a compliant composite action has no violations", () => {
    const yamlText = action([
      ...COMPOSITE,
      `    - uses: actions/checkout@${SHA_CHECKOUT} # v7.0.1`,
      "      with:",
      "        persist-credentials: false",
      `    - uses: actions/setup-node@${SHA_NODE} # v7.0.0`,
      "    - uses: ./.github/actions/other",
      "    - env:",
      "        RUNS: ${{ inputs.runs }}",
      '      run: echo "$RUNS"',
      "      shell: bash",
    ]);
    expect(checkActionManifest(yamlText, ".github/actions/setup/action.yml")).toEqual([]);
  });

  test.each<[string, WorkflowRule, string[]]>([
    ["a JavaScript action", "W1", ["  using: node24", "  main: index.js"]],
    ["a Docker action", "W1", ["  using: docker", "  image: docker://alpine:3.20"]],
    ["an unpinned step", "W1", [...COMPOSITE, "    - uses: actions/setup-node@v7 # v7.0.0"]],
    ["a pinned step without a version comment", "W1", [...COMPOSITE, `    - uses: actions/setup-node@${SHA_NODE}`]],
    ["a local path escaping with ..", "W1", [...COMPOSITE, "    - uses: ./../outside"]],
    ["interpolation in run", "W3", [...COMPOSITE, "    - run: echo ${{ inputs.title }}", "      shell: bash"]],
    ["github.token", "W4", [...COMPOSITE, "    - uses: ./x", "      with:", "        token: ${{ github.token }}"]],
    ["checkout keeping credentials", "W8", [...COMPOSITE, `    - uses: actions/checkout@${SHA_CHECKOUT} # v7.0.1`]],
    ["no steps", "W0", ["  using: composite"]],
  ])("rejects %s", (_label, rule, lines) => {
    expect(rules(checkActionManifest(action(lines), ".github/actions/setup/action.yml"))).toEqual([rule]);
  });

  test("rejects unparseable YAML and a missing runs mapping", () => {
    expect(rules(checkActionManifest("runs: [unclosed", "action.yml"))).toEqual(["W0"]);
    expect(rules(checkActionManifest("name: x\n", "action.yml"))).toEqual(["W0"]);
  });

  test("reports the path as given", () => {
    const v = checkActionManifest(action(["  using: node24", "  main: index.js"]), ".github/actions/setup/action.yml");
    expect(v).toEqual([expect.objectContaining({ rule: "W1", file: ".github/actions/setup/action.yml", line: 3 })]);
  });
});
