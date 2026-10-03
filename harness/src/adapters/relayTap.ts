/**
 * The receive-only relay tap (DR-0011 D2 Speech capture; HANDOFF §8.1): the
 * speech record for Arm C. It runs in a worker thread (relayTapWorker.ts) and
 * records every speech sequence NVDA queues, with its priority, and every
 * global cancel, each stamped with QPC receipt time (D1). Speech is measured
 * on what NVDA queues, not on audio (D13, DR-0022).
 *
 * Attach it before each segment (HANDOFF §7.2 step 4) and let NVDA's
 * "Connected as controlled computer" announcement pass before an observation
 * window opens (lab notebook 2026-10-03, M1a design inputs).
 */
import { Worker } from "node:worker_threads";

import { qpcNowNs } from "../clock/qpc.ts";
import type { TapMessage } from "./relayProtocol.ts";

export type TapEvent = (TapMessage & { chunk?: number }) | { kind: "error"; t: number; message: string } | { kind: "closed"; t: number };

export interface RelayTapOptions {
  caPath: string;
  host?: string;
  port?: number;
  /** How long to wait for `channel_joined`, in ms. */
  joinTimeoutMs?: number;
}

/** A running relay tap. */
export class RelayTap {
  readonly #worker: Worker;
  readonly #events: TapEvent[] = [];
  readonly attachedQpcNs: number;
  /** QPC receipt time (ns) of the relay's join confirmation: the tap sees everything queued after it. */
  joinedQpcNs: number | null = null;

  private constructor(worker: Worker, attachedQpcNs: number) {
    this.#worker = worker;
    this.attachedQpcNs = attachedQpcNs;
    worker.on("message", (event: TapEvent) => {
      this.#events.push(event);
    });
  }

  /** Starts the worker and resolves once the relay confirms the join. */
  static async attach(options: RelayTapOptions): Promise<RelayTap> {
    const worker = new Worker(new URL("./relayTapWorker.ts", import.meta.url), {
      workerData: { host: options.host ?? "127.0.0.1", port: options.port ?? 6837, caPath: options.caPath },
    });
    const tap = new RelayTap(worker, qpcNowNs());
    const timeoutMs = options.joinTimeoutMs ?? 10_000;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`relay tap: no channel_joined within ${String(timeoutMs)} ms`));
      }, timeoutMs);
      const onMessage = (event: TapEvent): void => {
        if (event.kind === "joined") {
          tap.joinedQpcNs = event.t;
          clearTimeout(timer);
          worker.off("message", onMessage);
          resolve();
        } else if (event.kind === "error" || event.kind === "closed") {
          clearTimeout(timer);
          worker.off("message", onMessage);
          reject(new Error(`relay tap: ${event.kind === "error" ? event.message : "connection closed"} before channel_joined`));
        }
      };
      worker.on("message", onMessage);
      worker.once("error", (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
    return tap;
  }

  /** Every event received so far, in arrival order. */
  events(): readonly TapEvent[] {
    return this.#events;
  }

  /** Events received at or after a QPC time (ns). */
  since(t: number): TapEvent[] {
    return this.#events.filter((event) => event.t >= t);
  }

  /** Events received in [from, to] (QPC ns). */
  between(from: number, to: number): TapEvent[] {
    return this.#events.filter((event) => event.t >= from && event.t <= to);
  }

  /** Closes the connection and stops the worker. */
  async detach(): Promise<void> {
    this.#worker.postMessage("stop");
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    await this.#worker.terminate();
  }
}
