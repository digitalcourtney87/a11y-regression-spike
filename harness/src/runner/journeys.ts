/**
 * Journeys (HANDOFF §10.2; DR-0066). `journeys/<id>.json` holds one journey,
 * validated by `JourneySchema`. Each corpus item names its journey; setup
 * steps name functions in `setups.ts`. `checkJourneys` is pure: it takes the
 * parsed files, the corpus items and the registered setup names, and returns
 * errors, so the CLI and the tests share it.
 *
 * Expectation values follow one grammar, so that every arm can judge them
 * (B from the accessibility tree, B2 from platform events, C from speech):
 *
 * - `focusOn`: `<role>|<name>`, focus is on that element or inside it; after
 *   a browse strategy, the element under the virtual cursor (NVDA's reading
 *   position) rather than system focus;
 * - `stateIs`: `<role>|<name>|<state>=<value>`, for example
 *   `checkbox|Mark as done|checked=true`;
 * - `announcementContains`: text an announcement contains;
 * - `orderBefore`: excluded from the primary analysis (DR-0022);
 * - a name of `*` matches any name, for an element the step has just reached;
 *   a name of `#<id>` names the element with that DOM id (B2's identity, P12),
 *   for an element without an accessible name.
 *
 * A goal identifies its target by what the item's regression does not change,
 * so that the regression shows in an expectation rather than as an
 * UNREACHABLE step, except where reachability is itself the symptom
 * (NAV_TARGET_UNREACHABLE, JOURNEY_BLOCKED; Decided by Claude under DR-0045,
 * DR-0068). The anchor `body` stands for the document, for pages with nothing
 * focusable.
 */
import { JourneySchema } from "../schema/schemas.ts";
import type { CorpusItem, Journey } from "../schema/index.ts";

export interface JourneyCheck {
  journeys: Map<string, Journey>;
  errors: string[];
}

const FOCUS_ON = /^[A-Za-z]+\|.+$/;
const STATE_IS = /^[A-Za-z]+\|.+\|[a-z]+=.+$/;

export function checkJourneys(files: ReadonlyMap<string, unknown>, items: readonly CorpusItem[], setupNames: ReadonlySet<string>): JourneyCheck {
  const journeys = new Map<string, Journey>();
  const errors: string[] = [];
  for (const [file, content] of [...files.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const parsed = JourneySchema.safeParse(content);
    if (!parsed.success) {
      errors.push(`${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      continue;
    }
    const j = parsed.data;
    if (`${j.id}.json` !== file) errors.push(`${file}: id "${j.id}" must match the file name`);
    const stepIds = new Set<string>();
    for (const step of j.steps) {
      if (stepIds.has(step.id)) errors.push(`${file}: duplicate step id "${step.id}"`);
      stepIds.add(step.id);
      if (step.kind === "setup") {
        if (!setupNames.has(step.fn)) errors.push(`${file}: step "${step.id}" names unknown setup "${step.fn}"`);
        continue;
      }
      if (step.strategy === "TYPE" && (step.text ?? "") === "") errors.push(`${file}: TYPE step "${step.id}" needs text`);
      for (const e of step.expectations) {
        if (e.type === "focusOn" && !FOCUS_ON.test(e.value)) errors.push(`${file}: step "${step.id}": focusOn "${e.value}" is not <role>|<name>`);
        if (e.type === "stateIs" && !STATE_IS.test(e.value)) errors.push(`${file}: step "${step.id}": stateIs "${e.value}" is not <role>|<name>|<state>=<value>`);
      }
    }
    if (!j.steps.some((s) => s.kind === "at")) errors.push(`${file}: a journey needs at least one AT step`);
    journeys.set(j.id, j);
  }
  for (const item of items) {
    const j = journeys.get(item.journeyId);
    if (j === undefined) errors.push(`item "${item.id}": journey "${item.journeyId}" not found`);
    else if (j.app !== item.app) errors.push(`item "${item.id}": journey "${j.id}" is for app "${j.app}", not "${item.app}"`);
  }
  return { journeys, errors };
}
