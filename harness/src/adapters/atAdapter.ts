/**
 * The assistive-technology adapter (HANDOFF §8.1; DR-0011 D2). Phase 0 has one
 * implementation: Guidepup 0.35.0 for NVDA provisioning, lifecycle and input
 * only. NVDA starts with `capture: false`, so Guidepup never injects its
 * stop-speech Control key and its spoken-phrase log is never evidence; speech
 * comes from the relay tap (relayTap.ts).
 *
 * Input sent through `press` reaches NVDA as OS-level input: Guidepup sends a
 * key message over the relay and NVDA's follower calls SendInput, which NVDA's
 * keyboard hook processes (HANDOFF §7.2). Never call it inside an observation
 * window (DR-0013 D4).
 */
import { dirname, join } from "node:path";

import { nvda } from "@guidepup/guidepup";
import { getNVDAInstallationPath } from "@guidepup/guidepup/lib/windows/NVDA/getNVDAInstallationPath.js";

import { NVDA_SETTINGS } from "./nvda-settings.ts";
import type { NvdaIniSection } from "./nvda-settings.ts";

export interface AtAdapter {
  readonly name: "guidepup";
  /** The Guidepup NVDA asset version (not NVDA's runtime version, which comes from its log). */
  readonly assetVersion: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  /** Sends one key or chord as OS-level input through NVDA. */
  press(key: string): Promise<void>;
  /** Reads the current item (NVDA+Up arrow, which the plain key syntax cannot send), as OS-level input (READ_CURRENT; P23). */
  readCurrent(): Promise<void>;
  /** The relay CA the pinned build trusts, for the relay tap (DR-0009). */
  relayCaPath(): string;
}

export class GuidepupNvdaAdapter implements AtAdapter {
  readonly name = "guidepup" as const;
  readonly #settings: NvdaIniSection;

  constructor(settings: NvdaIniSection = NVDA_SETTINGS) {
    this.#settings = settings;
  }

  get assetVersion(): string {
    return nvda.version;
  }

  async start(): Promise<void> {
    await nvda.start({ capture: false, settings: this.#settings });
  }

  async stop(): Promise<void> {
    await nvda.stop();
  }

  async press(key: string): Promise<void> {
    await nvda.press(key, { capture: false });
  }

  async readCurrent(): Promise<void> {
    await nvda.perform(nvda.keyboardCommands.readLine, { capture: false });
  }

  relayCaPath(): string {
    const exe = getNVDAInstallationPath();
    if (exe === null) throw new Error("NVDA is not installed (run `npx --no-install guidepup install`)");
    return join(dirname(exe), "userConfig", "remoteAccess", "localRelay", "NvdaRemoteRelay.pem");
  }
}
