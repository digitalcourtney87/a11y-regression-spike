/**
 * Node side of the Arm B2 platform-event listener (DR-0019 D10; HANDOFF §8.2).
 * Starts `listener/` (C#, .NET 10) for one Chrome browser process, answers the
 * native self-test through its "ping" command (D1, DR-0010: ping-pong between
 * the orchestrator and each native collector) and reads its JSON-lines output
 * after "stop". Times are QPC nanoseconds stamped by the listener on callback
 * entry; timeouts here use QPC too (DR-0027).
 */
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

import type { PlatformEvent } from "../schema/types.ts";

/** The Release build's executable, relative to the repository root. */
export const LISTENER_EXE = "listener/bin/Release/net10.0-windows/a11y-listener.exe";

/** One line of the listener's output (listener/Resolver.cs). */
export interface ListenerEvent {
  t: number;
  channel: "MSAA" | "IA2";
  event: string;
  eventId: number;
  hwndClass: string;
  idObject: number;
  idChild: number;
  role?: string;
  name?: string;
  automationId?: string;
  liveSetting?: string;
  ariaRole?: string;
  error?: string;
}

/** The listener's readiness line. */
export interface ListenerReady {
  ready: true;
  pid: number;
  hooks: number;
  ranges: number;
  frequency: number;
  anchorQpcNs: number;
  anchorWall: string;
  version: string;
  runtime?: string;
}

/** The listener's answer to "ping": a QPC reading for the native self-test. */
export interface ListenerPing {
  ticks: number;
  frequency: number;
  uia: string;
}

/** Parses the listener's output file, skipping blank or malformed lines (they are counted). */
export function parseListenerOutput(text: string): { events: ListenerEvent[]; malformed: number } {
  const events: ListenerEvent[] = [];
  let malformed = 0;
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === "") continue;
    try {
      const value = JSON.parse(line) as Partial<ListenerEvent>;
      if (typeof value.t === "number" && typeof value.event === "string" && (value.channel === "MSAA" || value.channel === "IA2")) events.push(value as ListenerEvent);
      else malformed++;
    } catch {
      malformed++;
    }
  }
  return { events, malformed };
}

/** Maps a listener event to the evidence schema's PlatformEvent (WinEvents are never diagnostic). */
export function toPlatformEvent(e: ListenerEvent): PlatformEvent {
  return {
    t: e.t,
    channel: e.channel,
    event: e.event,
    eventId: e.eventId,
    hwndClass: e.hwndClass,
    ...(e.role === undefined ? {} : { role: e.role }),
    ...(e.name === undefined ? {} : { name: e.name }),
    ...(e.automationId === undefined ? {} : { automationId: e.automationId }),
    ...(e.liveSetting === undefined ? {} : { liveSetting: e.liveSetting }),
    ...(e.ariaRole === undefined ? {} : { ariaRole: e.ariaRole }),
  };
}

interface Waiter {
  match: (value: Record<string, unknown>) => boolean;
  resolve: (value: Record<string, unknown>) => void;
}

export class ListenerProcess {
  readonly #child: ChildProcessWithoutNullStreams;
  readonly #outPath: string;
  readonly #waiters: Waiter[] = [];
  readonly #stderr: string[] = [];
  #exited: number | null = null;
  ready: ListenerReady | null = null;

  private constructor(child: ChildProcessWithoutNullStreams, outPath: string) {
    this.#child = child;
    this.#outPath = outPath;
    createInterface({ input: child.stdout }).on("line", (line) => {
      let value: Record<string, unknown>;
      try {
        value = JSON.parse(line) as Record<string, unknown>;
      } catch {
        return;
      }
      const index = this.#waiters.findIndex((w) => w.match(value));
      if (index >= 0) this.#waiters.splice(index, 1)[0]?.resolve(value);
    });
    createInterface({ input: child.stderr }).on("line", (line) => this.#stderr.push(line));
    child.on("exit", (code) => {
      this.#exited = code ?? -1;
    });
  }

  /** Starts the listener for `pid`, writing events to `outPath`, and waits for its readiness line. */
  static async start(options: { exe: string; pid: number; outPath: string; timeoutMs?: number }): Promise<ListenerProcess> {
    const exe = resolve(options.exe);
    if (!existsSync(exe)) throw new Error(`listener not built: ${exe}`);
    const child = spawn(exe, ["--pid", String(options.pid), "--out", options.outPath], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    const listener = new ListenerProcess(child, options.outPath);
    try {
      const ready = await listener.#next((v) => v.ready === true, options.timeoutMs ?? 15_000, "readiness");
      listener.ready = ready as unknown as ListenerReady;
    } catch (error) {
      // Never leave an orphan holding hooks for the rest of the job.
      listener.kill();
      throw error;
    }
    return listener;
  }

  #next(match: (value: Record<string, unknown>) => boolean, timeoutMs: number, what: string): Promise<Record<string, unknown>> {
    return new Promise((resolvePromise, rejectPromise) => {
      const waiter: Waiter = {
        match,
        resolve: (value) => {
          clearTimeout(timer);
          resolvePromise(value);
        },
      };
      const timer = setTimeout(() => {
        const index = this.#waiters.indexOf(waiter);
        if (index >= 0) this.#waiters.splice(index, 1);
        rejectPromise(new Error(`listener ${what} timed out after ${String(timeoutMs)} ms (exit ${String(this.#exited)}; stderr: ${this.#stderr.join(" | ")})`));
      }, timeoutMs);
      this.#waiters.push(waiter);
    });
  }

  /** One native self-test reading (D1): the listener's QPC, answered over stdin and stdout. */
  async qpc(): Promise<{ ticks: number; frequency: number; uia: string }> {
    const answer = this.#next((v) => typeof v.ticks === "number", 5000, "ping");
    this.#child.stdin.write("ping\n");
    return (await answer) as unknown as ListenerPing;
  }

  /**
   * Unhooks, drains and returns every event the listener wrote, with its final
   * UIA status. `drained` is false when the listener's resolver had not
   * finished writing (its output is then incomplete), or when it had already
   * exited.
   */
  async stop(): Promise<{ events: ListenerEvent[]; malformed: number; uia: string | null; drained: boolean; remaining: number | null; stderr: string[] }> {
    let uia: string | null = null;
    let drained = false;
    let remaining: number | null = null;
    if (this.#exited === null) {
      const stopped = this.#next((v) => v.stopped === true, 20_000, "stop");
      this.#child.stdin.write("stop\n");
      try {
        const line = await stopped;
        uia = String(line.uia);
        drained = line.drained === true;
        remaining = typeof line.remaining === "number" ? line.remaining : null;
      } finally {
        this.#child.stdin.end();
      }
      await new Promise<void>((done) => {
        if (this.#exited !== null) done();
        else
          this.#child.once("exit", () => {
            done();
          });
      });
    }
    const text = existsSync(this.#outPath) ? readFileSync(this.#outPath, "utf8") : "";
    return { ...parseListenerOutput(text), uia, drained, remaining, stderr: [...this.#stderr] };
  }

  /** Kills the process without draining (error paths only). */
  kill(): void {
    if (this.#exited === null) this.#child.kill();
  }
}
