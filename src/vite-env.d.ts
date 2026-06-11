/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sentry の DSN。未設定の場合、エラー監視は無効になる。 */
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
