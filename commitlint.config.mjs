export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 日本語サブジェクトは英単語（ErrorBoundary 等）始まりが頻発し、
    // 大文字始まり禁止ルールが誤反応するため無効化する
    'subject-case': [0],
    // 本文には URL や自動生成の長い行が入るため行長制限を無効化する
    // （ヘッダ行の 100 文字制限は維持）
    'body-max-line-length': [0]
  }
};
