import { Category, CategoryNode } from './types';

export function buildCategoryTree(items: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  items.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  items.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort children alphabetically for consistency
  const sortTree = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function statusBadgeColor(status: Category['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 ring-1 ring-green-200';
    case 'inactive':
      return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
    case 'archived':
      return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
  }
}
