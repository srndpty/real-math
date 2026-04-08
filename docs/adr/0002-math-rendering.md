# ADR 0002: 数式描画ライブラリ選定

- Date: 2026-04-08
- Status: Accepted

## Context

要件:

- インライン数式とディスプレイ数式
- 日本語文中での安定表示
- 初期表示の速度と運用保守性

## Decision

- KaTeX + react-katex を採用

## Options Compared

- KaTeX
  - 速いレンダリング
  - クライアント実装が簡潔
  - 初期MVPで必要十分な LaTeX 対応
- MathJax
  - 互換性は広いが、表示速度・バンドルサイズ面で不利

## Why This Is Acceptable

- 本プロダクトの数式は「百科事典級の巨大式」より「説明補助」が中心
- 速度優先のMVPに適合
- 将来MathJaxへ切替える場合も、`mathNotationLatex` フィールドはそのまま再利用可能
