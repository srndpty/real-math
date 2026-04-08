# ADR 0001: MVP技術選定

- Date: 2026-04-08
- Status: Accepted

## Context

要件は以下を同時に求める。

- グラフ主役の UI（ズーム/パン/クリック/ハイライト）
- 日本語中心の i18n と深いリンク
- データ駆動コンテンツとスキーマ検証
- 単体/コンポーネント/e2e/アクセシビリティ検証
- 個人開発でも運用可能な保守性

## Decision

- Framework: React + TypeScript + Vite
- Styling: Tailwind CSS
- Graph: react-force-graph (2D)
- i18n: i18next + react-i18next
- Data schema: Zod
- Test: Vitest + Testing Library + Playwright + jest-axe

## Options Considered

### Framework

- React + Vite: 高速開発、学習コスト低、テスト基盤が成熟
- Next.js: SEO/SSRは強いが今回MVPには過剰
- SvelteKit: 軽量だがチーム普及性でReactに劣る

### Graph

- react-force-graph: 力学レイアウト、ノード増加時の拡張性、カスタム描画が容易
- Cytoscape.js: 機能豊富だが設計・学習コストが増える

### i18n

- i18next: React連携が成熟、URLロケール運用と相性が良い
- FormatJS: メッセージ管理は強いが初期設定がやや重い

### Testing

- Vitest: Viteとの統合が軽く高速
- Jest: 実績はあるがVite環境ではVitestがシンプル

## Consequences

- MVPとしては高速に実装可能
- Canvasベースのグラフ操作はDOMテストが難しいため、代替リストUIとモック戦略を採用
- 将来SEOを強化する場合は概念詳細の静的生成ページを追加する方針
