/**
 * Chrome's accessibility tree, as Arm B evidence and as the NVDA-absent
 * leg's model of the page (HANDOFF §8.4, D9; P23, DR-0067).
 *
 * `pruneAxTree` keeps what the arms and the simulated virtual cursor need
 * from CDP `Accessibility.getFullAXTree`: role, name, value, the state and
 * live-region properties, and the tree links. `flattenAxTree` lists the
 * non-ignored nodes in document order (depth first from the root, descending
 * through ignored nodes), which is the order a virtual buffer presents them.
 */

/** The subset of a CDP AXNode this module reads. */
export interface CdpAxNode {
  nodeId: string;
  ignored?: boolean;
  role?: { value?: unknown };
  name?: { value?: unknown };
  value?: { value?: unknown };
  properties?: { name: string; value?: { value?: unknown } }[];
  parentId?: string;
  childIds?: string[];
  backendDOMNodeId?: number;
}

export type AxPropertyValue = string | number | boolean;

export interface AxNode {
  id: string;
  role: string;
  name: string;
  value?: string;
  ignored?: true;
  props: Record<string, AxPropertyValue>;
  parent?: string;
  children: string[];
  backendId?: number;
}

/** The properties kept: states, live-region properties and structure the oracles may need. */
export const KEPT_PROPERTIES = [
  "focusable", "focused", "editable", "readonly", "disabled", "hidden", "hiddenRoot",
  "checked", "pressed", "expanded", "selected", "required", "invalid", "level", "modal",
  "hasPopup", "multiselectable", "orientation", "autocomplete", "valuetext",
  "live", "atomic", "relevant", "busy", "root",
  "activedescendant", "controls", "labelledby", "describedby", "owns",
] as const;

const KEPT: ReadonlySet<string> = new Set(KEPT_PROPERTIES);

function scalar(value: unknown): AxPropertyValue | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((v) => (typeof v === "object" && v !== null && "idref" in v ? String((v as { idref: unknown }).idref) : String(v))).join(" ");
  return undefined;
}

export function pruneAxTree(nodes: readonly CdpAxNode[]): AxNode[] {
  return nodes.map((n) => {
    const props: Record<string, AxPropertyValue> = {};
    for (const p of n.properties ?? []) {
      if (!KEPT.has(p.name)) continue;
      const v = scalar(p.value?.value);
      if (v !== undefined) props[p.name] = v;
    }
    const value = scalar(n.value?.value);
    return {
      id: n.nodeId,
      role: typeof n.role?.value === "string" ? n.role.value : "",
      name: typeof n.name?.value === "string" ? n.name.value : "",
      ...(value === undefined || value === "" ? {} : { value: String(value) }),
      ...(n.ignored === true ? { ignored: true as const } : {}),
      props,
      ...(n.parentId === undefined ? {} : { parent: n.parentId }),
      children: n.childIds ?? [],
      ...(n.backendDOMNodeId === undefined ? {} : { backendId: n.backendDOMNodeId }),
    };
  });
}

/** Non-ignored nodes in document order. */
export function flattenAxTree(nodes: readonly AxNode[]): AxNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const root = nodes.find((n) => n.parent === undefined || !byId.has(n.parent));
  const out: AxNode[] = [];
  const seen = new Set<string>();
  const visit = (id: string): void => {
    if (seen.has(id)) return;
    seen.add(id);
    const node = byId.get(id);
    if (node === undefined) return;
    if (node.ignored !== true) out.push(node);
    for (const child of node.children) visit(child);
  };
  if (root !== undefined) visit(root.id);
  return out;
}

/** The node's ancestors, nearest first. */
export function ancestors(node: AxNode, nodes: readonly AxNode[]): AxNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out: AxNode[] = [];
  let parent = node.parent === undefined ? undefined : byId.get(node.parent);
  while (parent !== undefined && out.length < 200) {
    out.push(parent);
    parent = parent.parent === undefined ? undefined : byId.get(parent.parent);
  }
  return out;
}
