/**
 * Worker thread for the receive-only relay tap (DR-0011 D2; HANDOFF §8.1).
 *
 * Connects to NVDA's self-hosted Remote Access relay over TLS, trusting only
 * the relay CA that the pinned Guidepup build already trusts (DR-0009), sends
 * exactly the join and protocol-version messages, and from then on only
 * reads. Every received line is stamped with the QPC time of the chunk that
 * completed it (D1) and posted to the parent thread. Running in a worker
 * keeps the stamps independent of the main thread's event loop.
 */
import { readFileSync } from "node:fs";
import { connect } from "node:tls";
import { parentPort, workerData } from "node:worker_threads";

import { qpcNowNs } from "../clock/qpc.ts";
import { JOIN_MESSAGE, LineFramer, parseRelayLine, PROTOCOL_MESSAGE } from "./relayProtocol.ts";

interface TapWorkerData {
  host: string;
  port: number;
  caPath: string;
}

const { host, port, caPath } = workerData as TapWorkerData;
const port_ = parentPort;
if (port_ === null) throw new Error("relayTapWorker must run as a worker thread");

const socket = connect(port, host, { ca: [readFileSync(caPath)], checkServerIdentity: () => undefined }, () => {
  // The only writes the tap ever makes (D2: receive-only).
  socket.write(JOIN_MESSAGE);
  socket.write(PROTOCOL_MESSAGE);
});
socket.setEncoding("utf8");

const framer = new LineFramer();
let chunk = 0;
socket.on("data", (data: string) => {
  const t = qpcNowNs();
  chunk++;
  for (const line of framer.push(data)) {
    const message = parseRelayLine(line, t);
    if (message !== null) port_.postMessage({ ...message, chunk });
  }
});
socket.on("error", (error: Error) => {
  port_.postMessage({ kind: "error", t: qpcNowNs(), message: error.message });
});
socket.on("close", () => {
  port_.postMessage({ kind: "closed", t: qpcNowNs() });
});
port_.on("message", (message) => {
  if (message === "stop") socket.end();
});
