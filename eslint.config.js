import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    // fixtures/spa/ holds vendored third-party applications (DR-0057), linted by their own tooling.
    // fixtures/oss/ holds reproduction fixtures for third-party libraries (DR-0063), built only in CI
    // with the build script in fixtures/oss-tools/, which imports tools the harness does not install.
    ignores: ["node_modules/", "artefacts/", "coverage/", "listener/**/bin/", "listener/**/obj/", "fixtures/spa/", "fixtures/oss/", "fixtures/oss-tools/"],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    // Canary pages run in the browser as classic scripts.
    files: ["fixtures/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        location: "readonly",
        history: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        setTimeout: "readonly",
        URLSearchParams: "readonly",
      },
    },
  },
);
