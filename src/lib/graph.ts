import type {
  GraphContent,
  GraphEdge,
  GraphNode,
  Locale
} from '../content/types';

export const isSupportedLocale = (value?: string): value is Locale =>
  value === 'ja' || value === 'en';

export const getNodeLabel = (node: GraphNode, locale: Locale): string =>
  node.labels[locale];

export const getNodeSearchText = (node: GraphNode): string => {
  const fields = [
    node.labels.ja,
    node.labels.en,
    ...node.aliases,
    ...node.keywords.flatMap((keyword) => [keyword.ja, keyword.en])
  ];
  return fields.join(' ').toLowerCase();
};

export const filterGraph = ({
  content,
  query,
  kindFilter,
  industryFilter
}: {
  content: GraphContent;
  query: string;
  kindFilter: Set<'pure_concept' | 'application'>;
  industryFilter: Set<string>;
}): { nodes: GraphNode[]; edges: GraphEdge[]; searchMatchedNodeIds: Set<string> } => {
  const normalizedQuery = query.trim().toLowerCase();
  const nodes = content.nodes.filter((node) => {
    if (
      !kindFilter.has(
        node.kind === 'application' ? 'application' : 'pure_concept'
      )
    ) {
      return false;
    }
    if (
      node.kind === 'application' &&
      node.industryCategory &&
      industryFilter.size > 0 &&
      !industryFilter.has(node.industryCategory)
    ) {
      return false;
    }
    return true;
  });

  const searchMatchedNodeIds =
    normalizedQuery.length === 0
      ? new Set<string>()
      : new Set(
          nodes
            .filter((node) => getNodeSearchText(node).includes(normalizedQuery))
            .map((node) => node.id)
        );

  const visibleIds = new Set(nodes.map((node) => node.id));
  const edges = content.edges.filter(
    (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)
  );

  return { nodes, edges, searchMatchedNodeIds };
};

export const createAdjacencyIndex = (
  edges: GraphEdge[]
): Map<string, Set<string>> => {
  const map = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!map.has(edge.source)) {
      map.set(edge.source, new Set());
    }
    if (!map.has(edge.target)) {
      map.set(edge.target, new Set());
    }
    map.get(edge.source)?.add(edge.target);
    map.get(edge.target)?.add(edge.source);
  }
  return map;
};

export const getHighlightedNodeIds = (
  selectedNodeId: string | null,
  adjacency: Map<string, Set<string>>
): Set<string> => {
  if (!selectedNodeId) {
    return new Set();
  }
  const highlighted = new Set<string>([selectedNodeId]);
  const neighbors = adjacency.get(selectedNodeId);
  neighbors?.forEach((neighborId) => highlighted.add(neighborId));
  return highlighted;
};
