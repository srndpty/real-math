import { useEffect, useMemo, useRef, useState } from 'react';
import { forceCollide } from 'd3-force';
import ForceGraph2D from 'react-force-graph-2d';
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
  onSelectNode: (nodeId: string) => void;
  onBackgroundClick: () => void;
};

type RuntimeNode = GraphNode & {
  x?: number;
  y?: number;
  collisionRadius?: number;
};

type RuntimeEdge = GraphEdge & {
  source: RuntimeNode | string;
  target: RuntimeNode | string;
};

type BubbleMetrics = {
  width: number;
  height: number;
  fontSize: number;
  label: string;
};

const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 14;
const BUBBLE_HEIGHT = 30;
const BUBBLE_PADDING_X = 14;
const COLLISION_PADDING = 7;
const EXTRA_LINK_GAP = 20;

type ForceGraphHandle = {
  d3Force: (name: string, force?: unknown) => unknown;
  d3ReheatSimulation: () => void;
  zoomToFit: (transitionMs?: number, padding?: number) => void;
};

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
    Math.min(MAX_FONT_SIZE, 13 / globalScale)
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
  Math.max(estimateBubbleWidth(node.labels.ja), estimateBubbleWidth(node.labels.en));

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

export const GraphCanvas = ({
  locale,
  nodes,
  edges,
  selectedNodeId,
  highlightedNodeIds,
  onSelectNode,
  onBackgroundClick
}: GraphCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<ForceGraphHandle | null>(null);
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
        const estimatedWidth = estimateStableNodeWidth(node);
        return {
          ...node,
          collisionRadius:
            Math.max(estimatedWidth / 2, BUBBLE_HEIGHT / 2) + COLLISION_PADDING
        };
      }),
      links: edges
    }),
    [edges, nodes]
  );

  useEffect(() => {
    if (!graphRef.current) {
      return;
    }
    graphRef.current.d3Force(
      'collide',
      forceCollide<RuntimeNode>((node) => node.collisionRadius ?? 28).iterations(
        3
      )
    );
    graphRef.current.d3ReheatSimulation();
    const timerId = window.setTimeout(() => {
      graphRef.current?.zoomToFit(500, 64);
    }, 280);
    return () => window.clearTimeout(timerId);
  }, [graphData]);

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
        linkDirectionalParticles={0}
        cooldownTicks={120}
        onNodeClick={(node) => onSelectNode((node as RuntimeNode).id)}
        onBackgroundClick={onBackgroundClick}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const runtimeNode = node as RuntimeNode;
          const x = runtimeNode.x ?? 0;
          const y = runtimeNode.y ?? 0;
          const bubble = measureBubble(ctx, runtimeNode, locale, globalScale);
          const isSelected = runtimeNode.id === selectedNodeId;
          const isDimmed =
            Boolean(selectedNodeId) &&
            highlightedNodeIds.size > 0 &&
            !highlightedNodeIds.has(runtimeNode.id);

          const baseColor = getNodeColor(runtimeNode);
          const alpha = isDimmed ? 0.2 : 1;
          const bubbleX = x - bubble.width / 2;
          const bubbleY = y - bubble.height / 2;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = baseColor;
          ctx.strokeStyle =
            runtimeNode.kind === 'pure_concept'
              ? PURE_CONCEPT_BORDER
              : '#111827';
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
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
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
        }}
        linkColor={(edge) => {
          const runtimeEdge = edge as RuntimeEdge;
          const source = resolveNode(runtimeEdge.source);
          const target = resolveNode(runtimeEdge.target);
          const sourceId = source?.id ?? String(runtimeEdge.source);
          const targetId = target?.id ?? String(runtimeEdge.target);
          const isDimmed =
            Boolean(selectedNodeId) &&
            highlightedNodeIds.size > 0 &&
            (!highlightedNodeIds.has(sourceId) ||
              !highlightedNodeIds.has(targetId));
          const color = getEdgeColor(runtimeEdge, source, target);
          return isDimmed ? `${color}55` : color;
        }}
        linkWidth={(edge) => {
          const runtimeEdge = edge as RuntimeEdge;
          const source = resolveNode(runtimeEdge.source);
          const target = resolveNode(runtimeEdge.target);
          return getEdgeWidth(runtimeEdge, source, target);
        }}
        linkLineDash={(edge) => getRelationDash((edge as RuntimeEdge).relation)}
        linkDirectionalArrowLength={(edge) =>
          getArrowLengthByRelation((edge as RuntimeEdge).relation)
        }
        linkDirectionalArrowRelPos={0.88}
        linkDistance={(edge) => {
          const runtimeEdge = edge as RuntimeEdge;
          const source = resolveNode(runtimeEdge.source);
          const target = resolveNode(runtimeEdge.target);
          const sourceRadius = source?.collisionRadius ?? 28;
          const targetRadius = target?.collisionRadius ?? 28;
          return sourceRadius + targetRadius + EXTRA_LINK_GAP;
        }}
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.25}
        linkDirectionalArrowColor={(edge) => {
          const runtimeEdge = edge as RuntimeEdge;
          return getEdgeColor(
            runtimeEdge,
            resolveNode(runtimeEdge.source),
            resolveNode(runtimeEdge.target)
          );
        }}
      />
    </div>
  );
};
