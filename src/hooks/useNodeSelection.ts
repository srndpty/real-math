import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GraphNode } from '../content/types';
import { getNodeIdFromSearch, withNodeId } from '../lib/urlState';

export const useNodeSelection = (nodesById: Map<string, GraphNode>) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const panelTitleRef = useRef<HTMLHeadingElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const selectedNodeId = getNodeIdFromSearch(searchParams);
  const selectedNode = selectedNodeId
    ? (nodesById.get(selectedNodeId) ?? null)
    : null;

  useEffect(() => {
    if (selectedNode) {
      lastFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      window.setTimeout(() => panelTitleRef.current?.focus(), 0);
      return;
    }
    lastFocusedRef.current?.focus();
  }, [selectedNode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedNode) {
        setSearchParams(withNodeId(searchParams, null), { replace: true });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchParams, selectedNode, setSearchParams]);

  const selectNode = (nodeId: string) => {
    setSearchParams(withNodeId(searchParams, nodeId), { replace: true });
  };

  const closePanel = () => {
    setSearchParams(withNodeId(searchParams, null), { replace: true });
  };

  return {
    searchParams,
    setSearchParams,
    selectedNode,
    selectNode,
    closePanel,
    panelTitleRef
  };
};
