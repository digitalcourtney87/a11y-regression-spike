/**
 * Reading item blocks from downloaded run artefacts (`gh run download <run>
 * -D artefacts/<run>`) and pairing each item's two legs with its journey.
 * When several runs hold the same item and leg, the later directory given
 * wins, so a re-run of some items can be laid over a full run.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { gunzipSync } from "node:zlib";

import { JourneySchema } from "../schema/schemas.ts";
import type { Journey } from "../schema/index.ts";
import type { Block, ItemEvidence } from "./evidence.ts";

function blockFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name.includes(" 2.")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...blockFiles(path));
    else if (name.endsWith(".json.gz") && path.split(/[\\/]/).includes("blocks")) out.push(path);
  }
  return out;
}

export function readBlocks(dirs: readonly string[]): Map<string, Block> {
  const out = new Map<string, Block>();
  for (const dir of dirs) {
    for (const f of blockFiles(resolve(dir))) {
      const b = JSON.parse(gunzipSync(readFileSync(f)).toString("utf8")) as Block;
      out.set(`${b.item.id}|${b.leg}`, b);
    }
  }
  return out;
}

export function readJourneys(dir: string): Map<string, Journey> {
  const out = new Map<string, Journey>();
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".json") || name.includes(" 2.")) continue;
    const j = JourneySchema.parse(JSON.parse(readFileSync(join(dir, name), "utf8")));
    out.set(j.id, j);
  }
  return out;
}

/** Every item found in the blocks, with both legs (null where a leg is missing) and its journey. */
export function itemEvidence(blocks: ReadonlyMap<string, Block>, journeys: ReadonlyMap<string, Journey>): ItemEvidence[] {
  const ids = [...new Set([...blocks.values()].map((b) => b.item.id))].sort();
  return ids.map((id) => {
    const absent = blocks.get(`${id}|nvda-absent`) ?? null;
    const present = blocks.get(`${id}|nvda-present`) ?? null;
    const item = (absent ?? present)?.item;
    if (item === undefined) throw new Error(`no block for ${id}`);
    const journey = journeys.get(item.journeyId);
    if (journey === undefined) throw new Error(`no journey ${item.journeyId} for ${id}`);
    return { item, journey, absent, present };
  });
}
