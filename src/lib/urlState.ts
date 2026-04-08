export const NODE_QUERY_KEY = 'node';

export const getNodeIdFromSearch = (
  searchParams: URLSearchParams
): string | null => searchParams.get(NODE_QUERY_KEY);

export const withNodeId = (
  searchParams: URLSearchParams,
  nodeId: string | null
): URLSearchParams => {
  const next = new URLSearchParams(searchParams.toString());
  if (!nodeId) {
    next.delete(NODE_QUERY_KEY);
  } else {
    next.set(NODE_QUERY_KEY, nodeId);
  }
  return next;
};
