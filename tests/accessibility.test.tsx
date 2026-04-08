import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../src/App';

vi.mock('react-force-graph-2d', () => ({
  default: ({
    graphData
  }: {
    graphData: { nodes: Array<{ id: string; labels: { ja: string } }> };
  }) => (
    <div>
      {graphData.nodes.map((node) => (
        <span key={node.id}>{node.labels.ja}</span>
      ))}
    </div>
  )
}));

describe('accessibility', () => {
  it('has no major a11y violations on main route', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ja']}>
        <App />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
