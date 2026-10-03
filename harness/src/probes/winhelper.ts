/**
 * Node client for winhelper.ps1, the Windows helper used by the M1a probes and
 * the M1b handover (DR-0025, DR-0024, DR-0046). Requests and responses are JSON
 * lines; each request carries an id and gets exactly one response.
 */
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

export interface WindowInfo {
  hwnd: number;
  pid: number;
  class: string;
  title: string;
  visible: boolean;
}

export interface ActivateResult {
  method: "SetForegroundWindow" | "AttachThreadInput" | "AltKey" | null;
  tried: string[];
  foreground: WindowInfo;
}

export interface MsaaFocus {
  name?: string | null;
  role?: number;
  roleText?: string | null;
  depth?: number;
  error?: string;
}

export interface ProcessInfo {
  pid: number;
  name: string | null;
  session: number | null;
  integrity: string;
}

export interface QpcSample {
  ticks: number;
  frequency: number;
  highResolution: boolean;
}

interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

interface Response {
  id: number | null;
  ok: boolean;
  result?: unknown;
  error?: string;
}

/** A running winhelper.ps1 process. Windows only. */
export class WinHelper {
  readonly #child: ChildProcessWithoutNullStreams;
  readonly #pending = new Map<number, Pending>();
  #nextId = 1;

  private constructor(child: ChildProcessWithoutNullStreams) {
    this.#child = child;
    const lines = createInterface({ input: child.stdout });
    lines.on("line", (line) => {
      this.#onLine(line);
    });
    child.on("exit", (code) => {
      for (const pending of this.#pending.values()) pending.reject(new Error(`winhelper exited with code ${String(code)}`));
      this.#pending.clear();
    });
  }

  /** Starts winhelper.ps1 under Windows PowerShell 5.1 and waits until it answers. */
  static async start(): Promise<WinHelper> {
    const script = resolve(import.meta.dirname, "winhelper.ps1");
    const child = spawn("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", script], {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    const helper = new WinHelper(child);
    await helper.call("ping");
    return helper;
  }

  get pid(): number | undefined {
    return this.#child.pid;
  }

  #onLine(line: string): void {
    let response: Response;
    try {
      response = JSON.parse(line) as Response;
    } catch {
      return;
    }
    if (response.id === null) return;
    const pending = this.#pending.get(response.id);
    if (pending === undefined) return;
    this.#pending.delete(response.id);
    if (response.ok) pending.resolve(response.result);
    else pending.reject(new Error(response.error ?? "winhelper error"));
  }

  /** Sends one command and resolves with its result. */
  call(cmd: string, args: Record<string, unknown> = {}): Promise<unknown> {
    const id = this.#nextId++;
    return new Promise((resolvePromise, rejectPromise) => {
      this.#pending.set(id, { resolve: resolvePromise, reject: rejectPromise });
      this.#child.stdin.write(`${JSON.stringify({ id, cmd, ...args })}\n`);
    });
  }

  async qpc(): Promise<QpcSample> {
    return (await this.call("qpc")) as QpcSample;
  }

  async foreground(): Promise<WindowInfo> {
    return (await this.call("foreground")) as WindowInfo;
  }

  async windowsForPid(pid: number): Promise<WindowInfo[]> {
    return (await this.call("windowsForPid", { pid })) as WindowInfo[];
  }

  async activate(hwnd: number): Promise<ActivateResult> {
    return (await this.call("activate", { hwnd })) as ActivateResult;
  }

  async msaaFocus(hwnd: number): Promise<MsaaFocus> {
    return (await this.call("msaaFocus", { hwnd })) as MsaaFocus;
  }

  async processInfo(pid: number): Promise<ProcessInfo> {
    return (await this.call("processInfo", { pid })) as ProcessInfo;
  }

  async modules(pid: number, pattern: string): Promise<{ pid: number; modules?: string[]; error?: string }> {
    return (await this.call("modules", { pid, pattern })) as { pid: number; modules?: string[]; error?: string };
  }

  async pidsByName(name: string): Promise<number[]> {
    return (await this.call("pidsByName", { name })) as number[];
  }

  async display(): Promise<unknown> {
    return this.call("display");
  }

  async screenshot(path: string): Promise<unknown> {
    return this.call("screenshot", { path });
  }

  stop(): void {
    this.#child.stdin.end();
  }
}
