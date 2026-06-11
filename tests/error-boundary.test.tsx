import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary, ErrorFallback } from '../src/components/ErrorBoundary';

const Bomb = () => {
  throw new Error('boom');
};

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <p>safe content</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('safe content')).toBeInTheDocument();
  });

  it('renders fallback with error detail when a child throws', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /再読み込み/ })
    ).toBeInTheDocument();

    consoleError.mockRestore();
  });
});

describe('ErrorFallback', () => {
  it('reloads the page when the reload button is clicked', () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });

    render(<ErrorFallback title="t" description="d" />);
    screen.getByRole('button', { name: /再読み込み/ }).click();

    expect(reload).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
});
