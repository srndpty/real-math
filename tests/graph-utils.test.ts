import { describe, expect, it } from 'vitest';
import { createAdjacencyIndex, getHighlightedNodeIds } from '../src/lib/graph';
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
});
