import type { FlatNode } from './flat-node';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Minimum shape required for tree operations */
export interface TreeNode {
  id: string;
  children?: TreeNode[];
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Recursively flatten a tree into FlatNode[], only expanding nodes in `expandedIds`.
 *
 * @example
 * const flat = flattenTree(treeData, expandedIds);
 */
export function flattenTree<T extends TreeNode>(
  nodes: T[],
  expandedIds: Set<string>,
  depth = 0,
): FlatNode<T>[] {
  const result: FlatNode<T>[] = [];
  for (const node of nodes) {
    const children = node.children as T[] | undefined;
    const hasChildren = !!children?.length;
    result.push({ item: node, depth, hasChildren });
    if (hasChildren && children && expandedIds.has(node.id)) {
      result.push(...flattenTree(children, expandedIds, depth + 1));
    }
  }
  return result;
}

/**
 * Search a tree by keyword, returning all matching nodes as a flat list at depth 0.
 *
 * @param searchFields - callback returning strings to match against for each node
 *
 * @example
 * const results = searchTree(data, 'CNC', (n) => [n.name, n.code, n.type ?? '']);
 */
export function searchTree<T extends TreeNode>(
  nodes: T[],
  keyword: string,
  searchFields: (node: T) => string[],
): FlatNode<T>[] {
  const lower = keyword.toLowerCase();
  const result: FlatNode<T>[] = [];

  const walk = (list: T[]) => {
    for (const node of list) {
      const fields = searchFields(node);
      if (fields.some((f) => f.toLowerCase().includes(lower))) {
        result.push({ item: node, depth: 0, hasChildren: false });
      }
      const children = node.children as T[] | undefined;
      if (children?.length) walk(children);
    }
  };

  walk(nodes);
  return result;
}

/**
 * Recursively collect all node IDs from a tree.
 *
 * @example
 * const allIds = collectIds(treeData); // for "expand all"
 */
export function collectIds<T extends TreeNode>(nodes: T[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    const children = node.children as T[] | undefined;
    if (children?.length) ids.push(...collectIds(children));
  }
  return ids;
}
