export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 日本語サブジェクトは英単語（ErrorBoundary 等）始まりが頻発し、
    // 大文字始まり禁止ルールが誤反応するため無効化する
    'subject-case': [0]
  }
};
