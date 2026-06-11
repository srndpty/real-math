# Real Math Map

「数学って何の役に立つの？」に、概念と応用を同じ地図で答える Web アプリです。  
数学の内部構造だけでなく、産業・技術・製品との接続を、探索可能なグラフ UI と詳細解説で示します。

## これは何か

- 主役はインタラクティブ概念マップ（ズーム/パン/選択）
- `pure_concept` は青い円ノード
- `application` は産業カテゴリ色の四角ノード
- ノード選択で詳細パネル表示（PC: 右ドック / モバイル: 下部ボトムシート）
- 深いリンク: `/:locale?node=<nodeId>`
- 代替操作としてノード一覧を提供（グラフ UI 依存を回避）

## なぜこの設計にしたか

- データ駆動: `src/content/graph-content.json` + Zod schema で拡張しやすく検証可能
- i18n: URLロケール (`/ja`, `/en`) と翻訳辞書を分離
- UI: グラフ探索 + テキスト理解を両立
- 品質: strict TS, lint, unit/component/a11y/e2e, CI
- 詳細は ADR を参照
  - `docs/adr/0001-tech-stack.md`
  - `docs/adr/0002-math-rendering.md`

## 技術スタック

- React + TypeScript + Vite
- Tailwind CSS
- react-force-graph
- i18next + react-i18next
- KaTeX (react-katex)
- Zod
- Vitest + Testing Library + jest-axe + Playwright

## 起動方法

```bash
npm ci
npm run dev
```

ブラウザ:

- 日本語: `http://localhost:5173/ja`
- 英語: `http://localhost:5173/en`
- 深いリンク例: `http://localhost:5173/ja?node=finite_field`

## テスト方法

```bash
npm run lint
npm run typecheck
npm run validate:content
npm run test
npm run test:coverage
npm run test:e2e
```

まとめて実行:

```bash
npm run check
```

## コントリビューション

開発フロー・コミット規約（Conventional Commits）・Git フックについては `CONTRIBUTING.md` を参照してください。

## コンテンツ追加方法

1. `src/content/graph-content.json` にノード/エッジを追加
2. スキーマ要件を満たす（`src/content/schema.ts`）
3. `npm run validate:content` を実行
4. 必要なら `keywords`, `references`, `utilityProfile` を補強

ノードは以下フィールドを持てます:

- `id`, `kind`, `industryCategory`
- `labels.ja/en`, `aliases`
- `shortSummary`, `friendlyExplanation`, `detailedExplanation`
- `mathNotationLatex`, `keywords`, `references`, `tags`
- `difficultyLevel`, `utilityProfile`, `certaintyLevel`, `status`

## i18n 追加方法

1. `src/i18n/resources.ts` に翻訳キーを追加
2. 必要な UI で `t('key.path')` を参照
3. ノード本文は `graph-content.json` の `ja/en` を更新

## ディレクトリ構成

```text
.
├─ src
│  ├─ components
│  ├─ content
│  ├─ i18n
│  ├─ lib
│  └─ styles
├─ tests
│  └─ e2e
├─ docs
│  ├─ adr
│  └─ future-roadmap.md
├─ scripts
└─ .github/workflows/ci.yml
```

## デプロイ候補

- Vercel (Vite静的配信)
- Netlify
- Cloudflare Pages
- GitHub Pages (SPAリライト設定が必要)

## 今後の課題

- 概念詳細を静的ページ化して SEO/OGP を強化
- エッジ種別・近傍深さフィルタを UI 追加
- コンテンツ編集ワークフロー（レビュー承認）を整備
- ノード数が数百規模になった際のレイアウト最適化
