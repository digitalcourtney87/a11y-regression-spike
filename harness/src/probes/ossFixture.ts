/**
 * Writes one build directory for a mined-regression fixture at one release
 * of the package under test (DR-0063). Windows CI only.
 *
 *   node harness/src/probes/ossFixture.ts --fixture fixtures/oss/<id> --version <v> --out <dir>
 *
 * `fixture.json` names the package, the releases to test and the other
 * dependencies (exact versions). The package goes into `dependencies`, or
 * into npm `overrides` when it is a transitive dependency (`"mode": "override"`).
 * The fixture's `index.html` and `src/` are copied as they are. The build
 * tools are not listed: CI installs this package.json with `npm install
 * --before=<that release's publish time + 1 day>`, so each release resolves
 * its dependencies as a user installing it then would have (a shared date
 * broke older releases of monorepo packages, whose sibling packages moved on);
 * the pinned dependencies must therefore predate the first listed release.
 * It builds them with `fixtures/oss-tools/ossBuild.mjs` from a separate
 * tools directory.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { z } from "zod";

export const FixtureSchema = z.strictObject({
  id: z.string(),
  /** "vue" is Vue 2 with its full build, which the build aliases "vue" to (templates compile in the browser). */
  stack: z.enum(["react", "vanilla", "web-components", "vue"]),
  package: z.string(),
  mode: z.enum(["dependency", "override"]).default("dependency"),
  /** Releases to test, ascending; the first is the reported last good release. */
  versions: z.array(z.string()).min(2),
  dependencies: z.record(z.string(), z.string()),
  issue: z.string(),
});

export type Fixture = z.infer<typeof FixtureSchema>;

/** The package.json for one release. */
export function packageJsonFor(fixture: Fixture, version: string): Record<string, unknown> {
  const deps: Record<string, string> = { ...fixture.dependencies };
  const pkg: Record<string, unknown> = { name: `oss-fixture-${fixture.id}`, private: true, type: "module" };
  if (fixture.mode === "override") pkg.overrides = { [fixture.package]: version };
  else deps[fixture.package] = version;
  pkg.dependencies = deps;
  return pkg;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const { values } = parseArgs({ options: { fixture: { type: "string" }, version: { type: "string" }, out: { type: "string" } } });
  if (values.fixture === undefined || values.version === undefined || values.out === undefined) throw new Error("--fixture, --version and --out are required");
  const dir = resolve(values.fixture);
  const fixture = FixtureSchema.parse(JSON.parse(readFileSync(join(dir, "fixture.json"), "utf8")));
  mkdirSync(values.out, { recursive: true });
  for (const name of ["index.html", "src"]) if (existsSync(join(dir, name))) cpSync(join(dir, name), join(values.out, name), { recursive: true });
  writeFileSync(join(values.out, "package.json"), `${JSON.stringify(packageJsonFor(fixture, values.version), null, 2)}\n`);
}
