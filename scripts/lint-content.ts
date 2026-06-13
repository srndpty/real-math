import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import katex from 'katex';
import { graphContentSchema } from '../src/content/schema';

// スキーマ検証（validate-content.ts）より一段深い品質チェック:
// - LaTeX 構文（KaTeX で実レンダリングして検証）
// - ラベル重複
// - 未翻訳の可能性（ja/en が同一の本文）
// - キーワード欠落
// エラーは exit 1、警告は表示のみ。

const path = resolve(process.cwd(), 'src/content/graph-content.json');
const parsedJson: unknown = JSON.parse(readFileSync(path, 'utf-8'));
const content = graphContentSchema.parse(parsedJson);

const errors: string[] = [];
const warnings: string[] = [];

// LaTeX 構文検証
for (const node of content.nodes) {
  const formulas = [
    ...(node.mathNotationLatex?.inline ?? []),
    ...(node.mathNotationLatex?.block ?? [])
  ];
  for (const formula of formulas) {
    try {
      katex.renderToString(formula, { throwOnError: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${node.id}: invalid LaTeX "${formula}" — ${message}`);
    }
  }
}

// ラベル重複検出
const seenLabels = new Map<string, string>();
for (const node of content.nodes) {
  for (const locale of ['ja', 'en'] as const) {
    const key = `${locale}:${node.labels[locale]}`;
    const existing = seenLabels.get(key);
    if (existing) {
      errors.push(
        `duplicate ${locale} label "${node.labels[locale]}": ${existing}, ${node.id}`
      );
    }
    seenLabels.set(key, node.id);
  }
}

// 未翻訳の可能性・キーワード欠落
for (const node of content.nodes) {
  for (const field of [
    'shortSummary',
    'friendlyExplanation',
    'detailedExplanation'
  ] as const) {
    if (node[field].ja === node[field].en) {
      warnings.push(`${node.id}: ${field} の ja/en が同一（未翻訳の可能性）`);
    }
  }
  if (node.keywords.length === 0) {
    warnings.push(`${node.id}: keywords が空`);
  }
}

const statusCounts = new Map<string, number>();
for (const node of content.nodes) {
  statusCounts.set(node.status, (statusCounts.get(node.status) ?? 0) + 1);
}

for (const warning of warnings) {
  console.warn(`WARN  ${warning}`);
}
for (const error of errors) {
  console.error(`ERROR ${error}`);
}

const statusSummary = Array.from(statusCounts.entries())
  .map(([status, count]) => `${status}=${count}`)
  .join(', ');
console.log(
  `Content lint: ${errors.length} errors, ${warnings.length} warnings ` +
    `(nodes=${content.nodes.length}, edges=${content.edges.length}, status: ${statusSummary})`
);

if (errors.length > 0) {
  process.exit(1);
}
