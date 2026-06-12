# エンタープライズレベル化ロードマップ

現状評価と、品質・安定性・運用・機能を段階的に引き上げる計画。
（作成日: 2026-06-12 / 対象: real-math v0.1.0）

## 現状評価

すでに整っているもの:

- strict TypeScript / ESLint / Prettier
- unit + component + a11y (jest-axe) + e2e (Playwright) のテスト階層
- Zod によるコンテンツ検証 (`validate:content`) と CI 統合
- ADR によるアーキテクチャ決定の記録
- i18n (URL ロケール分離)、代替操作 UI（グラフ非依存のノード一覧）

エンタープライズ水準との主な差分:

| 領域         | 不足点                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| 信頼性       | ErrorBoundary なし。`loadContent.ts` がモジュールロード時に `parse` するため、不正データで白画面になる |
| CI/CD        | CI に `npm run build` がない（ビルド破壊を検知できない）。デプロイパイプライン・プレビュー環境なし     |
| テスト       | カバレッジ計測・閾値なし。Playwright は chromium のみ。GraphCanvas（Canvas 描画）は実質未テスト        |
| 可観測性     | エラー監視 (Sentry 等)・Web Vitals 計測なし                                                            |
| セキュリティ | CSP/セキュリティヘッダなし。Dependabot/Renovate・CodeQL・SECURITY.md なし                              |
| リリース管理 | バージョン 0.1.0 固定、CHANGELOG・タグ運用なし                                                         |
| ガバナンス   | CONTRIBUTING / CODEOWNERS / PR テンプレート / pre-commit フックなし                                    |
| 機能         | フィルタ・検索状態が URL に載らない（共有 URL の再現性が不完全）。SEO/OGP 未対応                       |
| コード衛生   | `scripts/validate-content.mjs` と `.ts` の重複。App.tsx へのロジック集中                               |

---

## Phase 0: 即効性のある土台固め（〜1週間） — ✅ 2026-06-12 実装済み（branch protection の手動設定を除く）

**P0-1. CI にビルド検証を追加**
`quality` ジョブに `npm run build` を追加。`dist` をアーティファクト化すれば後続のデプロイにも使える。

**P0-2. ErrorBoundary とコンテンツロードの防御**

- ルートに ErrorBoundary を追加し、フォールバック UI（再読み込み導線つき）を表示
- `loadContent.ts` を `safeParse` 化し、失敗時はエラー画面 + コンソールに Zod issue を出力

**P0-3. テストカバレッジの計測と閾値**

- `vitest --coverage` (v8) を導入し、`vite.config.ts` に閾値（例: lines 80%）を設定
- CI でカバレッジレポートをアーティファクト化

**P0-4. 依存関係の自動管理**

- Dependabot（または Renovate）を npm + GitHub Actions 向けに設定
- CI に `npm audit --audit-level=high` 相当のチェックを追加

**P0-5. リポジトリガバナンス一式**

- `CONTRIBUTING.md`、`.github/PULL_REQUEST_TEMPLATE.md`、issue テンプレート
- husky + lint-staged（prettier/eslint を staged ファイルに）+ commitlint（Conventional Commits）
- main の branch protection（CI 必須・レビュー必須）を設定

**P0-6. コード衛生**

- `scripts/validate-content.mjs` / `.ts` の重複解消（tsx で `.ts` に一本化）
- CI ワークフローに `concurrency`（同一 PR の旧 run キャンセル）と `timeout-minutes` を設定、actions を SHA ピン留め

## Phase 1: 品質・安定性の本格強化（2〜4週間） — ✅ 2026-06-12 実装済み

実装メモ:

- デプロイ先は Vercel を採用（`vercel.json` で CSP 等を定義）。ダッシュボードでのリポジトリ Import は手動作業
- Sentry は `VITE_SENTRY_DSN` 設定時のみ有効化される opt-in 方式。Web Vitals は browserTracingIntegration が収集するため `web-vitals` パッケージは不要
- リリース自動化は release-please を採用（Conventional Commits 前提が Phase 0 で整っているため）
- GraphCanvas のビジュアルリグレッションは未実装: force レイアウトとフォントレンダリングが OS 依存で、Windows ローカルと Linux CI のスクリーンショット基準が一致しないため。導入する場合は Docker でベースライン生成する運用が前提（Phase 2 以降の検討事項）

**P1-1. デプロイパイプライン**

- 本番デプロイ（Vercel / Cloudflare Pages 推奨）+ PR ごとのプレビューデプロイ
- セキュリティヘッダ（CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy）をホスティング設定で付与
- GitHub Environments で本番デプロイに承認ゲート

**P1-2. エラー監視と計測**

- Sentry（ソースマップアップロード込み）で実行時エラーを捕捉
- `web-vitals` で CWV を計測し、プライバシー配慮型アナリティクス（Plausible 等）へ送信

**P1-3. テスト拡充**

- Playwright を firefox / webkit / モバイルビューポートへ拡大
- e2e 追加: 検索 → 絞り込み → 選択 → 共有 URL 復元、ロケール切替、フィルタ操作
- GraphCanvas のビジュアルリグレッション（Playwright スクリーンショット比較）
- 失敗時の trace / report を CI アーティファクトに保存

**P1-4. パフォーマンス管理**

- `react-force-graph-2d` と KaTeX の遅延ロード（初期バンドル削減。現在は全量を初期ロード）
- `rollup-plugin-visualizer` でバンドル分析、`size-limit` で CI にサイズ予算を設定
- Lighthouse CI（性能・a11y・SEO スコアの回帰検知）

**P1-5. リリース管理**

- Changesets（または semantic-release）で SemVer + CHANGELOG 自動生成 + GitHub Release
- コンテンツスキーマの `version` フィールドに対する互換性ポリシーを明文化

**P1-6. アーキテクチャ整理**

- App.tsx からカスタムフックを抽出（`useGraphFilters` / `useNodeSelection` / `useIsMobile`）
- `isMobile` を resize リスナーから `matchMedia` ベースへ
- GraphCanvas のレンダーコールバックを `useCallback` / メモ化で安定化（ノード数増加への備え）

## Phase 2: 機能・スケール対応（1〜2ヶ月）

**P2-1. URL 状態の完全化** — ✅ 2026-06-12 実装済み
検索クエリ・kind/industry フィルタを URL クエリへ載せ、共有 URL で画面状態を完全再現（既存の `?node=` と統合）。

- `?q=` / `?kind=` / `?ind=` を `useGraphFilters` が読み書きする。デフォルト状態ではパラメータを載せず URL を汚さない。不正値はデフォルトにフォールバック

**P2-2. SEO/OGP（既存ロードマップ P0 と整合）** — ⚠️ 部分実装（2026-06-12）

- ✅ react-helmet-async によるメタタグ・OGP・canonical・JSON-LD の動的生成
- ✅ robots.txt / sitemap.xml（`public/`。**ドメイン確定後にプレースホルダ `real-math.example.com` の置換が必要**）
- ❌ 未実装: ノード詳細の静的ページ生成（vite-ssg / プリレンダ）。**SPA のクライアントサイド meta 更新は、JS を実行しない OGP クローラー（Slack/X/LINE 等）には見えない**ため、ノード単位の OGP を効かせるにはプリレンダが必須。残タスクとして保留

**P2-3. グラフ機能拡張（既存ロードマップ P1）**

- エッジ種別フィルタ UI、近傍深さ (1-hop/2-hop) 切替
- ノード数百規模を見据えた described レイアウト最適化（クラスタリング・LOD 描画）

**P2-4. コンテンツ運用ワークフロー**

- コンテンツ変更専用の PR フロー: `status: draft → reviewed` の承認プロセスを CODEOWNERS + CI 検証で担保
- スキーマ変更時のマイグレーションスクリプトと差分レポート
- コンテンツ品質 lint（リンク切れ検査、未翻訳検出、LaTeX 構文検証）

**P2-5. アクセシビリティ深化**

- 詳細パネルのフォーカストラップ、`prefers-reduced-motion` 対応（グラフアニメーション抑制）
- スクリーンリーダー実機確認の手順書、WCAG 2.1 AA セルフチェックリスト

## Phase 3: 長期（2ヶ月〜）

- headless CMS 連携 or 管理 UI（コンテンツ量と編集者数が増えた場合のみ）
- 学習導線モード（中高生/社会人）、関連ノード推薦（キーワード + グラフ距離）
- PWA / オフライン対応
- 多言語追加（locale 拡張のコスト検証）

---

## 優先順位の考え方

1. **壊れたら気づける状態**（Phase 0: ビルド検証・ErrorBoundary・カバレッジ）が最優先。コストが低く効果が大きい。
2. **本番で何が起きているか見える状態**（Phase 1: デプロイ + 監視）が次。エンタープライズ品質の核心は「障害の検知と復旧の速さ」。
3. 機能拡張（Phase 2 以降）は土台の上に載せる。特に SEO/SSG はアーキテクチャに影響するため、Phase 1 のリリース管理を整えてから着手する。
