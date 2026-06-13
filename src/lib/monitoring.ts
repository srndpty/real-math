const dsn = import.meta.env.VITE_SENTRY_DSN;

// Sentry は VITE_SENTRY_DSN が設定されたビルドでのみ有効。
// 動的 import なので、未設定時に SDK がクライアントへ配信されることはない。
export const initMonitoring = (): void => {
  if (!dsn) {
    return;
  }
  void import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      // browserTracingIntegration が Web Vitals (LCP/CLS/INP) も収集する
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 0.2
    });
  });
};

export const reportError = (
  error: unknown,
  context?: Record<string, unknown>
): void => {
  if (!dsn) {
    return;
  }
  void import('@sentry/react').then((Sentry) => {
    Sentry.captureException(error, { extra: context });
  });
};
