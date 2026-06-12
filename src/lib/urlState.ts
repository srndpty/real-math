export const NODE_QUERY_KEY = 'node';
export const SEARCH_QUERY_KEY = 'q';
export const KIND_FILTER_KEY = 'kind';
export const INDUSTRY_FILTER_KEY = 'ind';

export const getNodeIdFromSearch = (
  searchParams: URLSearchParams
): string | null => searchParams.get(NODE_QUERY_KEY);

export const getSearchQueryFromSearch = (
  searchParams: URLSearchParams
): string => searchParams.get(SEARCH_QUERY_KEY) ?? '';

export const getKindFilterFromSearch = (
  searchParams: URLSearchParams
): string[] => {
  const param = searchParams.get(KIND_FILTER_KEY);
  return param ? param.split(',') : [];
};

export const getIndustryFilterFromSearch = (
  searchParams: URLSearchParams
): string[] => {
  const param = searchParams.get(INDUSTRY_FILTER_KEY);
  return param ? param.split(',') : [];
};

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

// kindFilter / industryFilter に null を渡すとパラメータを削除する
// （デフォルト状態のフィルタを URL に載せないために使う）
export const withFilters = (
  searchParams: URLSearchParams,
  {
    query,
    kindFilter,
    industryFilter
  }: {
    query: string;
    kindFilter: Set<string> | null;
    industryFilter: Set<string> | null;
  }
): URLSearchParams => {
  const next = new URLSearchParams(searchParams.toString());

  if (query) {
    next.set(SEARCH_QUERY_KEY, query);
  } else {
    next.delete(SEARCH_QUERY_KEY);
  }

  if (kindFilter && kindFilter.size > 0) {
    next.set(KIND_FILTER_KEY, Array.from(kindFilter).sort().join(','));
  } else {
    next.delete(KIND_FILTER_KEY);
  }

  if (industryFilter && industryFilter.size > 0) {
    next.set(INDUSTRY_FILTER_KEY, Array.from(industryFilter).sort().join(','));
  } else {
    next.delete(INDUSTRY_FILTER_KEY);
  }

  return next;
};
