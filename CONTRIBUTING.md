# Contributing Guide

## 開発フロー

1. `main` からブランチを切る（例: `feat/edge-filter`, `fix/search-offset`）
2. 変更を加え、`npm run check` がローカルで通ることを確認する
3. PR を作成する（テンプレートに従う）
4. CI がグリーンになり、レビュー承認を得てからマージする

## セットアップ

```bash
npm ci
npm run dev
```

`npm ci` 実行時に husky の Git フックが自動で有効化されます。

## コミット規約

[Conventional Commits](https://www.conventionalcommits.org/ja/) に従います（commit-msg フックで commitlint により検証されます）。

```text
feat: エッジ種別フィルタを追加
fix: 検索結果とグラフ強調のズレを修正
docs: README にデプロイ手順を追記
chore: 依存関係を更新
```

主な type: `feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore` / `ci`

## Git フック

- **pre-commit**: lint-staged により、ステージされたファイルへ ESLint + Prettier を適用。`graph-content.json` 変更時はスキーマ検証も実行
- **commit-msg**: commitlint によるコミットメッセージ検証

## 品質チェック

| コマンド                   | 内容                           |
| -------------------------- | ------------------------------ |
| `npm run lint`             | ESLint                         |
| `npm run format:check`     | Prettier 検証                  |
| `npm run typecheck`        | TypeScript 型検査              |
| `npm run validate:content` | コンテンツのスキーマ検証       |
| `npm run test`             | unit / component / a11y テスト |
| `npm run test:coverage`    | カバレッジ計測（閾値あり）     |
| `npm run test:e2e`         | Playwright E2E                 |
| `npm run check`            | 上記主要チェックの一括実行     |

カバレッジ閾値は `vite.config.ts` の `test.coverage.thresholds` で管理しています。閾値を下げる変更は原則禁止です（理由を PR に明記した場合のみ可）。

## コンテンツ変更

`src/content/graph-content.json` の変更は通常のコード変更と同じ PR フローで行います。
詳細な運用ルール（status の扱い・スキーマ変更ポリシー・自動チェックの内容）は
`docs/content-operations.md` を参照してください。

1. ノード/エッジを追加・編集（スキーマ: `src/content/schema.ts`）
2. `npm run validate:content` と `npm run lint:content` で検証
3. 新規ノードは `status: "draft"` で追加し、レビュー承認後に `reviewed` へ変更

## ブランチ保護（リポジトリ管理者向け設定）

GitHub リポジトリ設定で以下を有効にしてください:

- `main` への直接 push を禁止（PR 必須）
- Required status checks: `quality`, `e2e`
- Require a pull request before merging（approval 1 件以上）
- Require branches to be up to date before merging
