import { describe, expect, it } from 'vitest';
import {
  getIndustryFilterFromSearch,
  getKindFilterFromSearch,
  getSearchQueryFromSearch,
  withFilters,
  withNodeId
} from '../src/lib/urlState';

describe('urlState', () => {
  it('reads query and filters from search params', () => {
    const params = new URLSearchParams(
      'q=%E5%BE%AE%E5%88%86&kind=pure_concept&ind=finance,physics'
    );
    expect(getSearchQueryFromSearch(params)).toBe('微分');
    expect(getKindFilterFromSearch(params)).toEqual(['pure_concept']);
    expect(getIndustryFilterFromSearch(params)).toEqual(['finance', 'physics']);
  });

  it('returns empty values when params are absent', () => {
    const params = new URLSearchParams('');
    expect(getSearchQueryFromSearch(params)).toBe('');
    expect(getKindFilterFromSearch(params)).toEqual([]);
    expect(getIndustryFilterFromSearch(params)).toEqual([]);
  });

  it('writes filters to search params and keeps unrelated params', () => {
    const params = new URLSearchParams('node=differentiation');
    const next = withFilters(params, {
      query: '微分',
      kindFilter: new Set(['pure_concept']),
      industryFilter: new Set(['physics', 'finance'])
    });
    expect(next.get('node')).toBe('differentiation');
    expect(next.get('q')).toBe('微分');
    expect(next.get('kind')).toBe('pure_concept');
    // 並びを安定させるためソートされる
    expect(next.get('ind')).toBe('finance,physics');
  });

  it('removes filter params when null or empty (default state keeps URL clean)', () => {
    const params = new URLSearchParams(
      'node=differentiation&q=x&kind=pure_concept&ind=finance'
    );
    const next = withFilters(params, {
      query: '',
      kindFilter: null,
      industryFilter: null
    });
    expect(next.get('node')).toBe('differentiation');
    expect(next.has('q')).toBe(false);
    expect(next.has('kind')).toBe(false);
    expect(next.has('ind')).toBe(false);
  });

  it('round-trips filters (write then read)', () => {
    const written = withFilters(new URLSearchParams(''), {
      query: 'fourier',
      kindFilter: new Set(['application']),
      industryFilter: new Set(['communications'])
    });
    const reread = new URLSearchParams(written.toString());
    expect(getSearchQueryFromSearch(reread)).toBe('fourier');
    expect(getKindFilterFromSearch(reread)).toEqual(['application']);
    expect(getIndustryFilterFromSearch(reread)).toEqual(['communications']);
  });

  it('withNodeId sets and removes the node param', () => {
    const params = new URLSearchParams('q=x');
    const withNode = withNodeId(params, 'differentiation');
    expect(withNode.get('node')).toBe('differentiation');
    expect(withNode.get('q')).toBe('x');
    const removed = withNodeId(withNode, null);
    expect(removed.has('node')).toBe(false);
  });
});
