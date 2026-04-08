import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
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
    expect(screen.getByRole('heading', { name: '微分' })).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: '積分' }).length
    ).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'background' }));
    expect(
      screen.queryByRole('heading', { name: '微分' })
    ).not.toBeInTheDocument();
  });

  it('supports deep link opening of node detail', () => {
    renderApp('/ja?node=machine_learning_app');
    expect(
      screen.getByRole('heading', { name: '機械学習' })
    ).toBeInTheDocument();
  });

  it('switches locale via route controls', async () => {
    const user = userEvent.setup();
    renderApp('/ja');

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByText('Search Nodes')).toBeInTheDocument();
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
