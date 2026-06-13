import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { graphContent } from '../content/loadContent';
import {
  EDGE_RELATIONS,
  INDUSTRY_CATEGORIES,
  type EdgeRelation
} from '../content/types';
import { filterGraph, getNodeSearchText } from '../lib/graph';
import {
  getIndustryFilterFromSearch,
  getKindFilterFromSearch,
  getRelationFilterFromSearch,
  getSearchQueryFromSearch,
  withFilters
} from '../lib/urlState';

export type KindFilterValue = 'pure_concept' | 'application';

const DEFAULT_KIND_FILTER = new Set<KindFilterValue>([
  'pure_concept',
  'application'
]);
const DEFAULT_INDUSTRY_FILTER = new Set<string>(INDUSTRY_CATEGORIES);
const DEFAULT_RELATION_FILTER = new Set<EdgeRelation>(EDGE_RELATIONS);

const isEdgeRelation = (value: string): value is EdgeRelation =>
  (EDGE_RELATIONS as readonly string[]).includes(value);

const parseRelationFilter = (
  searchParams: URLSearchParams
): Set<EdgeRelation> => {
  const values =
    getRelationFilterFromSearch(searchParams).filter(isEdgeRelation);
  return values.length > 0 ? new Set(values) : new Set(DEFAULT_RELATION_FILTER);
};

const isKindFilterValue = (value: string): value is KindFilterValue =>
  value === 'pure_concept' || value === 'application';

const parseKindFilter = (
  searchParams: URLSearchParams
): Set<KindFilterValue> => {
  const values =
    getKindFilterFromSearch(searchParams).filter(isKindFilterValue);
  return values.length > 0 ? new Set(values) : new Set(DEFAULT_KIND_FILTER);
};

const parseIndustryFilter = (searchParams: URLSearchParams): Set<string> => {
  const values = getIndustryFilterFromSearch(searchParams).filter((value) =>
    DEFAULT_INDUSTRY_FILTER.has(value)
  );
  return values.length > 0 ? new Set(values) : new Set(DEFAULT_INDUSTRY_FILTER);
};

const toggleInSet = <T>(prev: Set<T>, value: T, fallback: Set<T>): Set<T> => {
  const next = new Set(prev);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next.size === 0 ? new Set(fallback) : next;
};

export const useGraphFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 初期状態は URL から復元する（共有 URL の完全再現）
  const [query, setQuery] = useState(() =>
    getSearchQueryFromSearch(searchParams)
  );
  const [kindFilter, setKindFilter] = useState<Set<KindFilterValue>>(() =>
    parseKindFilter(searchParams)
  );
  const [industryFilter, setIndustryFilter] = useState<Set<string>>(() =>
    parseIndustryFilter(searchParams)
  );
  const [relationFilter, setRelationFilter] = useState<Set<EdgeRelation>>(() =>
    parseRelationFilter(searchParams)
  );

  // フィルタ変更を URL へ反映する。デフォルト状態のときはパラメータを
  // 載せず、URL を汚さない。同一文字列なら書き込まない（無限ループ防止）。
  useEffect(() => {
    const isDefaultKind = kindFilter.size === DEFAULT_KIND_FILTER.size;
    const isDefaultIndustry =
      industryFilter.size === DEFAULT_INDUSTRY_FILTER.size;
    const isDefaultRelation =
      relationFilter.size === DEFAULT_RELATION_FILTER.size;
    const next = withFilters(searchParams, {
      query: query.trim(),
      kindFilter: isDefaultKind ? null : kindFilter,
      industryFilter: isDefaultIndustry ? null : industryFilter,
      relationFilter: isDefaultRelation ? null : relationFilter
    });
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [
    query,
    kindFilter,
    industryFilter,
    relationFilter,
    searchParams,
    setSearchParams
  ]);

  const filtered = useMemo(
    () =>
      filterGraph({
        content: graphContent,
        // Keep graph topology stable while typing in search.
        query: '',
        kindFilter,
        industryFilter,
        relationFilter
      }),
    [industryFilter, kindFilter, relationFilter]
  );

  const isSearchActive = query.trim().length > 0;

  const searchMatchedNodeIds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return new Set<string>();
    }
    return new Set(
      filtered.nodes
        .filter((node) => getNodeSearchText(node).includes(normalizedQuery))
        .map((node) => node.id)
    );
  }, [filtered.nodes, query]);

  const listedNodes = useMemo(() => {
    if (!isSearchActive) {
      return filtered.nodes;
    }
    return filtered.nodes.filter((node) => searchMatchedNodeIds.has(node.id));
  }, [filtered.nodes, isSearchActive, searchMatchedNodeIds]);

  const toggleKind = (kind: KindFilterValue) => {
    setKindFilter((prev) => toggleInSet(prev, kind, DEFAULT_KIND_FILTER));
  };

  const toggleIndustry = (industry: string) => {
    setIndustryFilter((prev) =>
      toggleInSet(prev, industry, DEFAULT_INDUSTRY_FILTER)
    );
  };

  const toggleRelation = (relation: EdgeRelation) => {
    setRelationFilter((prev) =>
      toggleInSet(prev, relation, DEFAULT_RELATION_FILTER)
    );
  };

  const resetFilters = () => {
    setQuery('');
    setKindFilter(new Set(DEFAULT_KIND_FILTER));
    setIndustryFilter(new Set(DEFAULT_INDUSTRY_FILTER));
    setRelationFilter(new Set(DEFAULT_RELATION_FILTER));
  };

  return {
    query,
    setQuery,
    kindFilter,
    industryFilter,
    relationFilter,
    filtered,
    isSearchActive,
    searchMatchedNodeIds,
    listedNodes,
    toggleKind,
    toggleIndustry,
    toggleRelation,
    resetFilters
  };
};

export type GraphFilters = ReturnType<typeof useGraphFilters>;
