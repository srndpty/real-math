import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/App';

vi.mock('react-force-graph-2d', () => ({
  default: ({
    graphData,
    onNodeClick,
    onBackgroundClick
  }: {
    graphData: {
      nodes: { id: string; labels: { ja: string; en: string } }[];
      links: unknown[];
    };
    onNodeClick?: (node: { id: string }) => void;
    onBackgroundClick?: () => void;
  }) => (
    <div data-testid="force-graph-mock">
      <button type="button" onClick={() => onBackgroundClick?.()}>
        background
      </button>
      {graphData.nodes.map((node) => (
        <button key={node.id} type="button" onClick={() => onNodeClick?.(node)}>
          {node.labels.ja}
        </button>
      ))}
    </div>
  )
}));

const renderApp = (route: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </HelmetProvider>
  );

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: 1280
  });
});

describe('App UI flow', () => {
  it('opens detail by node click and closes by background click', async () => {
    const user = userEvent.setup();
    renderApp('/ja');

    await user.click(screen.getByRole('button', { name: '微分' }));
    expect(
      await screen.findByRole('heading', { name: '微分' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '微分' })).toHaveFocus();
    expect(
      screen.getAllByRole('button', { name: '積分' }).length
    ).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'background' }));
    expect(
      screen.queryByRole('heading', { name: '微分' })
    ).not.toBeInTheDocument();
  });

  it('supports deep link opening of node detail', async () => {
    renderApp('/ja?node=machine_learning_app');
    expect(
      await screen.findByRole('heading', { name: '機械学習' })
    ).toBeInTheDocument();
  });

  it('switches locale via route controls', async () => {
    const user = userEvent.setup();
    renderApp('/ja');

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByText('Search Nodes')).toBeInTheDocument();
  });

  it('restores search query and kind filter from shared URL', () => {
    renderApp('/ja?q=%E5%BE%AE%E5%88%86&kind=pure_concept');

    expect(
      screen.getByRole('button', { name: 'ノード詳細を開く: 微分' })
    ).toBeInTheDocument();
    // application ノードは kind=pure_concept で除外される
    expect(
      screen.queryByRole('button', { name: 'ノード詳細を開く: 機械学習' })
    ).not.toBeInTheDocument();
  });

  it('ignores invalid filter values in URL and falls back to defaults', () => {
    renderApp('/ja?kind=bogus_kind&ind=bogus_industry');

    expect(
      screen.getByRole('button', { name: 'ノード詳細を開く: 機械学習' })
    ).toBeInTheDocument();
  });

  it('uses bottom sheet on mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390
    });
    renderApp('/ja?node=differentiation');
    fireEvent(window, new Event('resize'));

    expect(screen.getByTestId('detail-panel-shell')).toHaveClass('fixed');
  });
});
