// Builds one mined-regression fixture with Vite's JS API (DR-0063). It is
// copied into a tools directory that has vite and @vitejs/plugin-react
// installed at current versions, so the build tooling never depends on what
// existed when the release under test was published; the fixture's own
// imports resolve from its own node_modules, installed with npm --before.
//
//   node <tools>/ossBuild.mjs <fixture build dir> <react|vanilla|web-components|vue>
//
// For "vue" (Vue 2), "vue" is aliased to its full build, so templates compile
// in the browser and a UMD library that requires "vue" shares the same copy.
import { build } from "vite";
import react from "@vitejs/plugin-react";

const [root, stack] = process.argv.slice(2);
await build({
  root,
  configFile: false,
  logLevel: "warn",
  plugins: stack === "react" ? [react()] : [],
  resolve: stack === "vue" ? { alias: [{ find: /^vue$/, replacement: "vue/dist/vue.esm.js" }] } : {},
});
