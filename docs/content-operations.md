# コンテンツ運用ガイド

`src/content/graph-content.json` の追加・編集・承認の運用ルール。

## 変更フロー

1. ブランチを切り、ノード/エッジを追加・編集する（スキーマ: `src/content/schema.ts`）
2. 新規ノードは必ず `status: "draft"` で追加する
3. ローカルで検証する
   - `npm run validate:content` — スキーマ検証（ID 重複・参照切れ等）
   - `npm run lint:content` — 品質検証（LaTeX 構文・ラベル重複・未翻訳検出）
4. PR を作成。`src/content/` は CODEOWNERS によりオーナーのレビューが必須
5. レビューで内容の正確性を確認できたら `status: "reviewed"` に変更してマージ

`status` の意味:

| 値         | 意味                                                             |
| ---------- | ---------------------------------------------------------------- |
| `draft`    | 内容未レビュー。本番に出るが、将来 UI で注記表示する可能性がある |
| `reviewed` | オーナーが数学的内容・翻訳を確認済み                             |

## 自動チェックの内容

pre-commit（lint-staged）と CI の両方で実行される。

- **validate-content**: Zod スキーマ検証。ノード/エッジ ID の重複、エッジ参照先の存在、application ノードの industryCategory 必須など
- **lint-content**:
  - LaTeX 式を KaTeX で実レンダリングして構文エラーを検出（エラー）
  - ja/en ラベルの重複（エラー）
  - 本文の ja/en が同一 = 未翻訳の可能性（警告）
  - keywords 欠落（警告）

## スキーマ変更のポリシー

`graph-content.json` の `version` フィールドはスキーマ世代を表す。

1. **後方互換の追加**（optional フィールド追加など）: `version` のマイナーを上げる。マイグレーション不要
2. **破壊的変更**（フィールドの改名・削除・必須化）:
   - `version` のメジャーを上げる
   - 変換スクリプトを `scripts/migrations/<old>-to-<new>.ts` として追加し、実行結果の差分を PR に添付する
   - スキーマ（`schema.ts`）・型（`types.ts`）・マイグレーションを同一 PR で変更する
3. プリレンダ（`scripts/prerender.ts`）と sitemap はビルド時にコンテンツから生成されるため、ノード追加・削除時の追加作業は不要

## 参考リンク切れの確認（手動）

外部 URL の死活確認は CI では行わない（外部要因で CI が不安定になるため）。
四半期に一度、references の URL を目視確認し、切れていたら更新または削除する。
