export const NODE_QUERY_KEY = 'node';
export const SEARCH_QUERY_KEY = 'q';
export const KIND_FILTER_KEY = 'kind';
export const INDUSTRY_FILTER_KEY = 'ind';
export const RELATION_FILTER_KEY = 'rel';

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

export const getRelationFilterFromSearch = (
  searchParams: URLSearchParams
): string[] => {
  const param = searchParams.get(RELATION_FILTER_KEY);
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
    industryFilter,
    relationFilter = null
  }: {
    query: string;
    kindFilter: Set<string> | null;
    industryFilter: Set<string> | null;
    relationFilter?: Set<string> | null;
  }
): URLSearchParams => {
  const next = new URLSearchParams(searchParams.toString());

  if (query) {
    next.set(SEARCH_QUERY_KEY, query);
  } else {
    next.delete(SEARCH_QUERY_KEY);
  }

  const setOrDelete = (key: string, values: Set<string> | null) => {
    if (values && values.size > 0) {
      next.set(key, Array.from(values).sort().join(','));
    } else {
      next.delete(key);
    }
  };
  setOrDelete(KIND_FILTER_KEY, kindFilter);
  setOrDelete(INDUSTRY_FILTER_KEY, industryFilter);
  setOrDelete(RELATION_FILTER_KEY, relationFilter);

  return next;
};
