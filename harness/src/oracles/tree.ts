/**
 * Reading Chrome's accessibility tree (CDP `Accessibility.getFullAXTree`,
 * pruned by `pruneAxTree`) for the tree oracle (Arm B). Ignored nodes are not
 * in the accessible tree: aria-hidden content and its descendants are
 * ignored, so they never match an expectation.
 */
import type { AxNode } from "../runner/axTree.ts";
import { nameMatches, roleMatches } from "../runner/goals.ts";
import { speechKey } from "../runner/outcome.ts";
import type { NodeRef } from "./evidence.ts";

export class Tree {
  readonly nodes: readonly AxNode[];
  private readonly byId: Map<string, AxNode>;
  private readonly byBackend: Map<number, AxNode>;

  constructor(nodes: readonly AxNode[]) {
    this.nodes = nodes;
    this.byId = new Map(nodes.map((n) => [n.id, n]));
    this.byBackend = new Map(nodes.flatMap((n) => (n.backendId === undefined ? [] : [[n.backendId, n] as const])));
  }

  node(id: string | undefined): AxNode | undefined {
    return id === undefined ? undefined : this.byId.get(id);
  }

  byBackendId(backendId: number | undefined): AxNode | undefined {
    return backendId === undefined ? undefined : this.byBackend.get(backendId);
  }

  /** The focused node; the document (RootWebArea) when nothing inside it has focus. */
  focused(): AxNode | undefined {
    const inner = this.nodes.find((n) => n.props.focused === true && n.role !== "RootWebArea");
    return inner ?? this.nodes.find((n) => n.props.focused === true);
  }

  ancestors(node: AxNode): AxNode[] {
    const out: AxNode[] = [];
    for (let p = this.node(node.parent); p !== undefined && out.length < 500; p = this.node(p.parent)) out.push(p);
    return out;
  }

  children(node: AxNode): AxNode[] {
    return node.children.flatMap((c) => {
      const n = this.byId.get(c);
      return n === undefined ? [] : [n];
    });
  }

  /**
   * Nodes that count as "focus is on that element or inside it": the node, its
   * ancestors, and the descendants reached through only children. The last
   * covers a focused wrapper whose single child is the element, as MUI's
   * dialog container is for its dialog.
   */
  focusScope(node: AxNode): AxNode[] {
    return [...this.self(node), ...this.ancestors(node).filter((n) => n.ignored !== true)];
  }

  /** The node and the descendants reached through only children: the element itself, for telling a lost name from a lost role. */
  self(node: AxNode): AxNode[] {
    const down: AxNode[] = [];
    for (let cur = node, guard = 0; guard < 20; guard++) {
      const kids = this.children(cur).filter((k) => k.ignored !== true || this.children(k).length > 0);
      const only = kids.length === 1 ? kids[0] : undefined;
      if (only === undefined) break;
      down.push(only);
      cur = only;
    }
    return [node, ...down].filter((n) => n.ignored !== true);
  }

  /** The text a node presents: its name, or the names of its static-text descendants. */
  text(node: AxNode): string {
    const parts: string[] = [];
    // Ignored nodes are structure: their own text is not presented, but accessible descendants below them are.
    const visit = (n: AxNode, depth: number): void => {
      if (depth > 80) return;
      if (n.ignored !== true && (n.role === "StaticText" || n.role === "staticText")) {
        parts.push(n.name);
        return;
      }
      if (n.role === "InlineTextBox") return;
      for (const k of this.children(n)) visit(k, depth + 1);
    };
    visit(node, 0);
    const inner = parts.join(" ");
    return inner.trim() === "" ? node.name : inner;
  }

  /** Accessible (not ignored) nodes. */
  accessible(): AxNode[] {
    return this.nodes.filter((n) => n.ignored !== true);
  }
}

export function matchesRole(role: string, node: { role: string }): boolean {
  return roleMatches(role, node.role);
}

/** Name match as the goal check makes it (P24), with `*` matching any name. */
export function matchesName(name: string, node: { name: string }): boolean {
  return name === "*" || nameMatches(name, node.name);
}

/** Whether a node's text contains the expected text (letters and digits, by containment). */
export function textContains(text: string, expected: string): boolean {
  const wanted = speechKey(expected);
  return wanted !== "" && speechKey(text).includes(wanted);
}

export function refOf(n: AxNode): NodeRef {
  return { name: n.name, role: n.role, ...(n.backendId === undefined ? {} : { backendId: n.backendId }) };
}

/** A tree state property as the expectation grammar names it, as a string ("true", "false", "mixed"); a missing property is "false". */
export function stateValue(node: AxNode, state: string): string {
  const v = node.props[state];
  if (v === undefined) return "false";
  return String(v);
}
