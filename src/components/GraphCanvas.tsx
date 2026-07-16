import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { forceCollide, forceManyBody } from 'd3-force';
import ForceGraph2D from 'react-force-graph-2d';
import type {
  ForceGraphMethods,
  LinkObject,
  NodeObject
} from 'react-force-graph-2d';
import type { GraphEdge, GraphNode, Locale } from '../content/types';
import { getNodeLabel } from '../lib/graph';
import {
  getEdgeColor,
  getEdgeWidth,
  getNodeColor,
  getRelationDash,
  PURE_CONCEPT_BORDER
} from './graphStyle';

type GraphCanvasProps = {
  locale: Locale;
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  highlightedNodeIds: Set<string>;
  searchMatchedNodeIds: Set<string>;
  isSearchActive: boolean;
  reducedMotion?: boolean;
  onSelectNode: (nodeId: string) => void;
  onBackgroundClick: () => void;
};

type RuntimeNode = GraphNode & {
  x?: number;
  y?: number;
  visualWidth?: number;
  visualHeight?: number;
  visualRadius?: number;
  collisionRadius?: number;
};

type RuntimeEdge = GraphEdge & {
  source: RuntimeNode | string;
  target: RuntimeNode | string;
};

type ForceGraphNode = NodeObject<RuntimeNode>;
type ForceGraphLink = LinkObject<RuntimeNode, RuntimeEdge>;
type GraphRef = ForceGraphMethods<ForceGraphNode, ForceGraphLink>;
type LinkDistanceForce = {
  distance: (distance: (link: ForceGraphLink) => number) => unknown;
};

type BubbleMetrics = {
  width: number;
  height: number;
  fontSize: number;
  label: string;
};

const MIN_FONT_SIZE = 9;
const MAX_FONT_SIZE = 12;
const BUBBLE_HEIGHT = 24;
const BUBBLE_PADDING_X = 10;
const COLLISION_PADDING = 16;
const EXTRA_LINK_GAP = 42;

const resolveNode = (
  candidate: RuntimeNode | string
): RuntimeNode | undefined =>
  typeof candidate === 'string' ? undefined : candidate;

const measureBubble = (
  ctx: CanvasRenderingContext2D,
  node: RuntimeNode,
  locale: Locale,
  globalScale = 1
): BubbleMetrics => {
  const label = getNodeLabel(node, locale);
  const fontSize = Math.max(
    MIN_FONT_SIZE,
    Math.min(MAX_FONT_SIZE, 12 / globalScale)
  );
  ctx.font = `600 ${fontSize}px "IBM Plex Sans", "Noto Sans JP", sans-serif`;
  const textWidth = ctx.measureText(label).width;
  return {
    width: Math.max(56, textWidth + BUBBLE_PADDING_X * 2),
    height: BUBBLE_HEIGHT,
    fontSize,
    label
  };
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height
  );
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
};

const getContrastTextColor = (hexColor: string): string => {
  const normalized = hexColor.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : normalized;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.52 ? '#F8FAFC' : '#0B1220';
};

const estimateBubbleWidth = (label: string): number => {
  let width = 0;
  for (const char of label) {
    width += /[\u3040-\u30ff\u3400-\u9fff]/.test(char) ? 14 : 8.5;
  }
  return Math.max(56, width + BUBBLE_PADDING_X * 2);
};

const estimateStableNodeWidth = (node: GraphNode): number =>
  Math.max(
    estimateBubbleWidth(node.labels.ja),
    estimateBubbleWidth(node.labels.en)
  );

const getArrowLengthByRelation = (relation: GraphEdge['relation']): number => {
  switch (relation) {
    case 'enables':
      return 20;
    case 'used_in':
    case 'prerequisite_of':
      return 22;
    case 'example_of':
      return 21;
    default:
      return 20;
  }
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const getNodeCornerRadius = (node: RuntimeNode): number =>
  node.kind === 'application' ? 7 : 15;

const getRoundedRectBoundaryDistance = (
  dx: number,
  dy: number,
  halfWidth: number,
  halfHeight: number,
  radius: number
): number => {
  const lineLength = Math.hypot(dx, dy);
  if (lineLength < 1) {
    return 0;
  }

  const unitX = dx / lineLength;
  const unitY = dy / lineLength;
  const absUnitX = Math.abs(unitX);
  const absUnitY = Math.abs(unitY);
  const safeRadius = Math.min(radius, halfWidth, halfHeight);
  const sideHalfWidth = halfWidth - safeRadius;
  const sideHalfHeight = halfHeight - safeRadius;

  const xSideDistance =
    absUnitX > 0 ? halfWidth / absUnitX : Number.POSITIVE_INFINITY;
  const xSideY = Math.abs(unitY * xSideDistance);
  if (xSideY <= sideHalfHeight) {
    return xSideDistance;
  }

  const ySideDistance =
    absUnitY > 0 ? halfHeight / absUnitY : Number.POSITIVE_INFINITY;
  const ySideX = Math.abs(unitX * ySideDistance);
  if (ySideX <= sideHalfWidth) {
    return ySideDistance;
  }

  const cornerCenterX = Math.sign(unitX || 1) * sideHalfWidth;
  const cornerCenterY = Math.sign(unitY || 1) * sideHalfHeight;
  const projection = unitX * cornerCenterX + unitY * cornerCenterY;
  const cornerCenterDistanceSq =
    cornerCenterX * cornerCenterX + cornerCenterY * cornerCenterY;
  const discriminant =
    projection * projection -
    (cornerCenterDistanceSq - safeRadius * safeRadius);

  if (discriminant < 0) {
    return Math.min(xSideDistance, ySideDistance);
  }

  return projection + Math.sqrt(discriminant);
};

const getArrowRelPos = (runtimeEdge: RuntimeEdge): number => {
  const source = resolveNode(runtimeEdge.source);
  const target = resolveNode(runtimeEdge.target);
  if (
    !source ||
    !target ||
    typeof source.x !== 'number' ||
    typeof source.y !== 'number' ||
    typeof target.x !== 'number' ||
    typeof target.y !== 'number'
  ) {
    return 0.93;
  }

  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const centerDistance = Math.hypot(dx, dy);
  if (centerDistance < 1) {
    return 0.9;
  }

  const targetBoundaryDistance = getRoundedRectBoundaryDistance(
    source.x - target.x,
    source.y - target.y,
    (target.visualWidth ?? 56) / 2,
    (target.visualHeight ?? BUBBLE_HEIGHT) / 2,
    getNodeCornerRadius(target)
  );
  const arrowLength = getArrowLengthByRelation(runtimeEdge.relation);
  const availableLineLength = centerDistance - arrowLength;
  if (availableLineLength <= 0) {
    return 1;
  }

  const arrowHeadDistance = centerDistance - targetBoundaryDistance;
  const relPos = (arrowHeadDistance - arrowLength) / availableLineLength;
  return clamp(relPos, 0, 1);
};

const getLinkDistance = (edge: ForceGraphLink): number => {
  const runtimeEdge = edge as RuntimeEdge;
  const source = resolveNode(runtimeEdge.source);
  const target = resolveNode(runtimeEdge.target);
  const sourceRadius = source?.collisionRadius ?? 28;
  const targetRadius = target?.collisionRadius ?? 28;
  return sourceRadius + targetRadius + EXTRA_LINK_GAP;
};

const getRenderedEdgeWidth = (edge: ForceGraphLink): number => {
  const runtimeEdge = edge as RuntimeEdge;
  const source = resolveNode(runtimeEdge.source);
  const target = resolveNode(runtimeEdge.target);
  return getEdgeWidth(runtimeEdge, source, target);
};

const getRenderedLinkDash = (edge: ForceGraphLink): number[] | null =>
  getRelationDash((edge as RuntimeEdge).relation);

const getRenderedArrowLength = (edge: ForceGraphLink): number =>
  getArrowLengthByRelation((edge as RuntimeEdge).relation);

const getRenderedArrowRelPos = (edge: ForceGraphLink): number =>
  getArrowRelPos(edge as RuntimeEdge);

export const GraphCanvas = ({
  locale,
  nodes,
  edges,
  selectedNodeId,
  highlightedNodeIds,
  searchMatchedNodeIds,
  isSearchActive,
  reducedMotion = false,
  onSelectNode,
  onBackgroundClick
}: GraphCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<GraphRef | undefined>(undefined);
  const hasInitialFitRef = useRef(false);
  const [size, setSize] = useState({ width: 300, height: 300 });

  useEffect(() => {
    const target = containerRef.current;
    if (!target) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) {
        return;
      }
      setSize({
        width: Math.max(300, Math.floor(rect.width)),
        height: Math.max(320, Math.floor(rect.height))
      });
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(
    () => ({
      nodes: nodes.map((node) => {
        const stableWidth = estimateStableNodeWidth(node);
        const visualRadius = Math.max(stableWidth / 2, BUBBLE_HEIGHT / 2);
        const collisionRadius =
          Math.max(stableWidth / 2, BUBBLE_HEIGHT / 2) + COLLISION_PADDING;
        return {
          ...node,
          visualWidth: stableWidth,
          visualHeight: BUBBLE_HEIGHT,
          visualRadius,
          collisionRadius
        };
      }),
      links: edges
    }),
    [edges, nodes]
  );

  const getRenderedEdgeColor = useCallback(
    (edge: ForceGraphLink): string => {
      const runtimeEdge = edge as RuntimeEdge;
      const source = resolveNode(runtimeEdge.source);
      const target = resolveNode(runtimeEdge.target);
      const sourceId = source?.id ?? String(runtimeEdge.source);
      const targetId = target?.id ?? String(runtimeEdge.target);
      const isDimmedBySelection =
        Boolean(selectedNodeId) &&
        highlightedNodeIds.size > 0 &&
        (!highlightedNodeIds.has(sourceId) ||
          !highlightedNodeIds.has(targetId));

      const baseColor = isSearchActive
        ? '#334155'
        : getEdgeColor(runtimeEdge, source, target);

      if (isDimmedBySelection) {
        return `${baseColor}55`;
      }
      if (isSearchActive) {
        return `${baseColor}CC`;
      }
      return baseColor;
    },
    [highlightedNodeIds, isSearchActive, selectedNodeId]
  );

  useEffect(() => {
    if (!graphRef.current) {
      return;
    }
    const linkForce = graphRef.current.d3Force('link') as
      | LinkDistanceForce
      | undefined;
    linkForce?.distance(getLinkDistance);
    graphRef.current.d3Force(
      'collide',
      forceCollide<RuntimeNode>(
        (node) => node.collisionRadius ?? 28
      ).iterations(5)
    );
    graphRef.current.d3Force(
      'charge',
      forceManyBody<RuntimeNode>().strength(-120).distanceMax(420)
    );
    graphRef.current.d3ReheatSimulation();
    if (hasInitialFitRef.current) {
      return;
    }
    hasInitialFitRef.current = true;
    const timerId = window.setTimeout(() => {
      graphRef.current?.zoomToFit(reducedMotion ? 0 : 500, 64);
    }, 280);
    return () => window.clearTimeout(timerId);
  }, [graphData, reducedMotion]);

  useEffect(() => {
    if (!selectedNodeId || !graphRef.current) {
      return;
    }

    const centerSelectedNode = () => {
      const targetNode = graphData.nodes.find(
        (node) => node.id === selectedNodeId
      ) as RuntimeNode | undefined;
      if (
        !targetNode ||
        typeof targetNode.x !== 'number' ||
        typeof targetNode.y !== 'number'
      ) {
        return false;
      }
      const duration = reducedMotion ? 0 : 400;
      const currentZoom = graphRef.current?.zoom();
      graphRef.current?.centerAt(targetNode.x, targetNode.y, duration);
      if (typeof currentZoom === 'number') {
        graphRef.current?.zoom(currentZoom, duration);
      }
      return true;
    };

    if (centerSelectedNode()) {
      return;
    }
    const timerId = window.setTimeout(centerSelectedNode, 120);
    return () => window.clearTimeout(timerId);
  }, [graphData.nodes, reducedMotion, selectedNodeId]);

  const drawNode = useCallback(
    (
      node: ForceGraphNode,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const runtimeNode = node as RuntimeNode;
      const x = runtimeNode.x ?? 0;
      const y = runtimeNode.y ?? 0;
      const isSelected = runtimeNode.id === selectedNodeId;
      const isDimmedBySelection =
        Boolean(selectedNodeId) &&
        highlightedNodeIds.size > 0 &&
        !highlightedNodeIds.has(runtimeNode.id);
      const isDimmedBySearch =
        isSearchActive &&
        !isSelected &&
        !searchMatchedNodeIds.has(runtimeNode.id);

      const baseColor = getNodeColor(runtimeNode);
      const alpha =
        (isDimmedBySelection ? 0.25 : 1) * (isDimmedBySearch ? 0.25 : 1);

      // LOD: 強いズームアウト時はテキスト計測・描画を省略する
      // （ノード数百規模でのフレーム落ち対策。文字は読めない倍率なので情報損失はない）
      if (globalScale < 0.45 && !isSelected) {
        const lodWidth = runtimeNode.visualWidth ?? 56;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = baseColor;
        drawRoundedRect(
          ctx,
          x - lodWidth / 2,
          y - BUBBLE_HEIGHT / 2,
          lodWidth,
          BUBBLE_HEIGHT,
          runtimeNode.kind === 'application' ? 7 : 15
        );
        ctx.fill();
        ctx.restore();
        return;
      }

      const bubble = measureBubble(ctx, runtimeNode, locale, globalScale);
      const bubbleX = x - bubble.width / 2;
      const bubbleY = y - bubble.height / 2;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = baseColor;
      ctx.strokeStyle =
        runtimeNode.kind === 'pure_concept' ? PURE_CONCEPT_BORDER : '#111827';
      ctx.lineWidth = isSelected ? 3 : 1.5;

      drawRoundedRect(
        ctx,
        bubbleX,
        bubbleY,
        bubble.width,
        bubble.height,
        runtimeNode.kind === 'application' ? 7 : 15
      );
      ctx.fill();
      ctx.stroke();

      if (isSelected) {
        ctx.save();
        ctx.strokeStyle = '#11182755';
        ctx.lineWidth = 6;
        drawRoundedRect(
          ctx,
          bubbleX - 2,
          bubbleY - 2,
          bubble.width + 4,
          bubble.height + 4,
          runtimeNode.kind === 'application' ? 8 : 16
        );
        ctx.stroke();
        ctx.restore();
      }

      ctx.font = `600 ${bubble.fontSize}px "IBM Plex Sans", "Noto Sans JP", sans-serif`;
      ctx.fillStyle = getContrastTextColor(baseColor);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bubble.label, x, y + 0.5);
      ctx.restore();
    },
    [
      highlightedNodeIds,
      isSearchActive,
      locale,
      searchMatchedNodeIds,
      selectedNodeId
    ]
  );

  const paintNodePointerArea = useCallback(
    (node: ForceGraphNode, color: string, ctx: CanvasRenderingContext2D) => {
      const runtimeNode = node as RuntimeNode;
      const x = runtimeNode.x ?? 0;
      const y = runtimeNode.y ?? 0;
      const bubble = measureBubble(ctx, runtimeNode, locale);
      const bubbleX = x - bubble.width / 2;
      const bubbleY = y - bubble.height / 2;

      ctx.fillStyle = color;
      drawRoundedRect(
        ctx,
        bubbleX,
        bubbleY,
        bubble.width,
        bubble.height,
        runtimeNode.kind === 'application' ? 7 : 15
      );
      ctx.fill();
    },
    [locale]
  );

  const handleNodeClick = useCallback(
    (node: ForceGraphNode) => onSelectNode((node as RuntimeNode).id),
    [onSelectNode]
  );

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      data-testid="graph-canvas-container"
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={size.width}
        height={size.height}
        nodeId="id"
        nodeRelSize={0}
        linkDirectionalParticles={0}
        // reduced-motion 時はレイアウトを事前計算し、整列アニメーションを表示しない
        warmupTicks={reducedMotion ? 150 : 0}
        cooldownTicks={reducedMotion ? 0 : 120}
        onNodeClick={handleNodeClick}
        onBackgroundClick={onBackgroundClick}
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={paintNodePointerArea}
        linkColor={getRenderedEdgeColor}
        linkWidth={getRenderedEdgeWidth}
        linkLineDash={getRenderedLinkDash}
        linkDirectionalArrowLength={getRenderedArrowLength}
        linkDirectionalArrowRelPos={getRenderedArrowRelPos}
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.25}
        linkDirectionalArrowColor={getRenderedEdgeColor}
      />
    </div>
  );
};
