import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorFallbackProps = {
  title: string;
  description: string;
  detail?: string;
};

export const ErrorFallback = ({
  title,
  description,
  detail
}: ErrorFallbackProps) => (
  <div className="bg-app flex min-h-screen items-center justify-center p-6">
    <div
      role="alert"
      className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {detail && (
        <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          {detail}
        </pre>
      )}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-4 rounded-lg border border-sky-700 bg-sky-50 px-4 py-2 text-sm text-sky-800"
      >
        再読み込み / Reload
      </button>
    </div>
  </div>
);

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

// i18n に依存しない静的文言にする（i18n 初期化失敗時もこの画面は出せる必要がある）
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          title="エラーが発生しました / Something went wrong"
          description="予期しないエラーにより画面を表示できませんでした。再読み込みしても解決しない場合は、issue で報告してください。 / An unexpected error prevented the page from rendering. If reloading does not help, please file an issue."
          detail={this.state.error.message}
        />
      );
    }
    return this.props.children;
  }
}
