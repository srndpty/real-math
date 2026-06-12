import { describe, expect, it } from 'vitest';
import {
  createAdjacencyIndex,
  filterGraph,
  getHighlightedNodeIds
} from '../src/lib/graph';
import { graphContent } from '../src/content/loadContent';
import type { GraphEdge } from '../src/content/types';

describe('graph utilities', () => {
  it('builds highlighted node set including selected and neighbors', () => {
    const edges: GraphEdge[] = [
      { id: '1', source: 'a', target: 'b', relation: 'related_to' },
      { id: '2', source: 'a', target: 'c', relation: 'used_in' }
    ];
    const adjacency = createAdjacencyIndex(edges);
    const highlighted = getHighlightedNodeIds('a', adjacency);

    expect(highlighted.has('a')).toBe(true);
    expect(highlighted.has('b')).toBe(true);
    expect(highlighted.has('c')).toBe(true);
    expect(highlighted.has('d')).toBe(false);
  });

  it('expands highlighted set to 2-hop neighbors when depth is 2', () => {
    const edges: GraphEdge[] = [
      { id: '1', source: 'a', target: 'b', relation: 'related_to' },
      { id: '2', source: 'b', target: 'c', relation: 'used_in' },
      { id: '3', source: 'c', target: 'd', relation: 'enables' }
    ];
    const adjacency = createAdjacencyIndex(edges);

    const oneHop = getHighlightedNodeIds('a', adjacency, 1);
    expect(oneHop.has('b')).toBe(true);
    expect(oneHop.has('c')).toBe(false);

    const twoHop = getHighlightedNodeIds('a', adjacency, 2);
    expect(twoHop.has('b')).toBe(true);
    expect(twoHop.has('c')).toBe(true);
    expect(twoHop.has('d')).toBe(false);
  });

  it('filters edges by relation while keeping nodes', () => {
    const allKinds = new Set<'pure_concept' | 'application'>([
      'pure_concept',
      'application'
    ]);
    const allIndustries = new Set<string>(
      graphContent.nodes
        .map((node) => node.industryCategory)
        .filter((v): v is NonNullable<typeof v> => Boolean(v))
    );

    const unfiltered = filterGraph({
      content: graphContent,
      query: '',
      kindFilter: allKinds,
      industryFilter: allIndustries
    });
    const onlyUsedIn = filterGraph({
      content: graphContent,
      query: '',
      kindFilter: allKinds,
      industryFilter: allIndustries,
      relationFilter: new Set(['used_in'])
    });

    expect(onlyUsedIn.nodes.length).toBe(unfiltered.nodes.length);
    expect(onlyUsedIn.edges.length).toBeLessThan(unfiltered.edges.length);
    expect(onlyUsedIn.edges.every((edge) => edge.relation === 'used_in')).toBe(
      true
    );
  });
});
