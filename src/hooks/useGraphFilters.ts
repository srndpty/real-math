import { useMemo, useState } from 'react';
import { graphContent } from '../content/loadContent';
import { INDUSTRY_CATEGORIES } from '../content/types';
import { filterGraph, getNodeSearchText } from '../lib/graph';

export type KindFilterValue = 'pure_concept' | 'application';

const DEFAULT_KIND_FILTER = new Set<KindFilterValue>([
  'pure_concept',
  'application'
]);
const DEFAULT_INDUSTRY_FILTER = new Set<string>(INDUSTRY_CATEGORIES);

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
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<Set<KindFilterValue>>(
    () => new Set(DEFAULT_KIND_FILTER)
  );
  const [industryFilter, setIndustryFilter] = useState<Set<string>>(
    () => new Set(DEFAULT_INDUSTRY_FILTER)
  );

  const filtered = useMemo(
    () =>
      filterGraph({
        content: graphContent,
        // Keep graph topology stable while typing in search.
        query: '',
        kindFilter,
        industryFilter
      }),
    [industryFilter, kindFilter]
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

  const resetFilters = () => {
    setQuery('');
    setKindFilter(new Set(DEFAULT_KIND_FILTER));
    setIndustryFilter(new Set(DEFAULT_INDUSTRY_FILTER));
  };

  return {
    query,
    setQuery,
    kindFilter,
    industryFilter,
    filtered,
    isSearchActive,
    searchMatchedNodeIds,
    listedNodes,
    toggleKind,
    toggleIndustry,
    resetFilters
  };
};

export type GraphFilters = ReturnType<typeof useGraphFilters>;
