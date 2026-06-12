# Agent Guide

このファイルは、このリポジトリで作業する AI coding agent 向けの共通指示です。ツール固有の文書は薄く保ち、このファイルを参照してください。

## 返答言語

- ユーザーへの返答は日本語で行ってください。
- コード、コマンド、ログ、識別子、外部仕様名は原文のままで構いません。
- ユーザーが明示的に別言語を指定した場合は、その指示を優先してください。

## プロジェクト概要

Real Math Map は、数学の概念と応用をインタラクティブなグラフ UI で説明する React + TypeScript + Vite アプリです。

- アプリ本体: `src/`
- コンテンツデータ: `src/content/graph-content.json`
- コンテンツスキーマ: `src/content/schema.ts`
- テスト: `tests/`
- E2E テスト: `tests/e2e/`
- 運用ドキュメント: `docs/`
- デプロイ用ヘッダーと rewrite: `vercel.json`

## 作業原則

- 既存のパターンに合わせた、小さく焦点の合った変更を優先してください。
- `dist/`、`coverage/`、`playwright-report/`、`test-results/` などの生成物はコミットしないでください。
- 品質ゲート、カバレッジ閾値、CSP などのセキュリティヘッダー、コンテンツ検証ルールは、タスクで明示されない限り弱めないでください。弱める必要がある場合は理由を文書化してください。
- 作業ツリーにあるユーザーの変更を保持してください。変更済みの可能性があるファイルは、編集前に内容を確認してください。
- 新規ファイルは原則 ASCII を使ってください。ただし、このファイルのように日本語で書く理由がある場合や、周辺ファイルがすでに非 ASCII を使っている場合は例外です。

## コマンド

Node.js 22.12 以上を使ってください。

```bash
npm ci
npm run dev
npm run check
```

よく使う個別チェック:

```bash
npm run lint
npm run typecheck
npm run validate:content
npm run lint:content
npm run test
npm run test:e2e
npm run size
```

作業中は変更範囲をカバーする最小のチェックを実行してください。広めの変更を引き渡す前には `npm run check` を優先し、ユーザー向けのナビゲーションやブラウザ挙動を変えた場合は `npm run test:e2e` を実行してください。

## アーキテクチャ上の注意

- ルーティングは locale 対応です。`/ja` と `/en` の挙動を揃えてください。
- グラフコンテンツはデータ駆動で、Zod により検証されます。データ契約を変える場合は `src/content/schema.ts` とテストを更新してください。
- UI 翻訳は `src/i18n/resources.ts`、ノード本文は `src/content/graph-content.json` にあります。
- 数式レンダリングは `react-katex` 経由の KaTeX を使います。数式用に ad hoc な HTML レンダリングを追加しないでください。
- ノード詳細の SEO メタデータは Helmet と prerendering で出力されます。JSON-LD やその他の inline script を変更する場合は、`vercel.json` の CSP がデプロイ後の意図した挙動を許可しているか確認してください。

## コンテンツ変更

`src/content/graph-content.json` を変更する場合:

- `npm run validate:content` と `npm run lint:content` で検証してください。
- 日本語と英語のフィールドを同期してください。
- タスクで明示されない限り、新規ノードは `status: "draft"` で追加してください。
- 応用例に関する主張には、具体的で確認可能な参照を優先してください。

## テスト方針

- 挙動を変える場合は、焦点を絞ったテストを追加または更新してください。
- 可能な限り、影響範囲に近いテストを使ってください。
- 決定的なロジックは unit/component テストで確認し、Playwright はブラウザワークフローが必要な場合に使ってください。
- デプロイ設定を変更する場合は、設定ファイルを直接 parse する軽量なテストを追加してください。

## Git Hooks

Husky hook は Git index 上で実行可能である必要があります。一度 `100755` としてコミットされれば、開発者が毎回気にする必要はありません。

`.husky/` 以下に hook を追加または作り直した場合は、次を実行してください。

```bash
git update-index --chmod=+x .husky/<hook-name>
git ls-files -s .husky/<hook-name>
```

期待される mode は `100755` です。`100644` の場合、Husky が `core.hooksPath` を `.husky` に設定しても Git はその hook を実行しません。

現在の hook:

- `.husky/pre-commit`: lint-staged を実行
- `.husky/commit-msg`: commitlint を実行

## Pull Request Checklist

- 関連するテストがローカルで通っている、または実行しなかった理由が明記されている。
- コンテンツ変更は `validate:content` と `lint:content` を通している。
- セキュリティヘッダー変更は、特に CSP についてデプロイ後の挙動と照らして確認している。
- 新しい Husky hook は Git index 上で実行可能になっている。
- コマンド、ワークフロー、デプロイ挙動、コンテンツルールを変えた場合はドキュメントを更新している。
