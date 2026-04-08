import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.cwd(), 'src/content/graph-content.json');
const content = JSON.parse(readFileSync(path, 'utf-8'));

if (!Array.isArray(content.nodes) || !Array.isArray(content.edges)) {
  throw new Error('content must include nodes[] and edges[]');
}

const nodeIds = new Set();
for (const node of content.nodes) {
  if (!node.id || typeof node.id !== 'string') {
    throw new Error('node.id must be non-empty string');
  }
  if (nodeIds.has(node.id)) {
    throw new Error(`duplicate node id: ${node.id}`);
  }
  nodeIds.add(node.id);
}

const edgeIds = new Set();
for (const edge of content.edges) {
  if (!edge.id || typeof edge.id !== 'string') {
    throw new Error('edge.id must be non-empty string');
  }
  if (edgeIds.has(edge.id)) {
    throw new Error(`duplicate edge id: ${edge.id}`);
  }
  edgeIds.add(edge.id);

  if (!nodeIds.has(edge.source)) {
    throw new Error(`edge source not found: ${edge.id} -> ${edge.source}`);
  }
  if (!nodeIds.has(edge.target)) {
    throw new Error(`edge target not found: ${edge.id} -> ${edge.target}`);
  }
}

console.log(
  `content validation passed: nodes=${content.nodes.length}, edges=${content.edges.length}`
);
