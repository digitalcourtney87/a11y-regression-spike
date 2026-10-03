import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, test } from "vitest";

import { FixtureSchema, packageJsonFor } from "./ossFixture.ts";

const root = resolve(import.meta.dirname, "../../../fixtures/oss");

describe("ossFixture", () => {
  test("puts the release under test in dependencies, or in overrides for a transitive package", () => {
    const base = { id: "x", stack: "react" as const, package: "lib", mode: "dependency" as const, versions: ["1.0.0", "1.1.0"], dependencies: { react: "18.3.1" }, issue: "u" };
    expect(packageJsonFor(base, "1.1.0")).toMatchObject({ dependencies: { react: "18.3.1", lib: "1.1.0" }, devDependencies: { vite: "8.3.2", "@vitejs/plugin-react": "6.0.1" } });
    expect(packageJsonFor({ ...base, mode: "override" }, "1.1.0")).toMatchObject({ dependencies: { react: "18.3.1" }, overrides: { lib: "1.1.0" } });
    expect(packageJsonFor({ ...base, stack: "vanilla" }, "1.0.0").devDependencies).toEqual({ vite: "8.3.2" });
  });
  test("every committed fixture is valid and pins exact versions", () => {
    for (const id of readdirSync(root)) {
      const fixture = FixtureSchema.parse(JSON.parse(readFileSync(join(root, id, "fixture.json"), "utf8")));
      expect(fixture.id).toBe(id);
      for (const v of [...fixture.versions, ...Object.values(fixture.dependencies)]) expect(v).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });
});
