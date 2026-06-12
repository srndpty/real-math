import { render, screen, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { useFocusTrap } from '../src/hooks/useFocusTrap';

const TrapHarness = ({ active }: { active: boolean }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useFocusTrap(ref, active);
  return (
    <div>
      <button type="button">outside</button>
      <div ref={ref}>
        <button type="button">first</button>
        <button type="button">last</button>
      </div>
    </div>
  );
};

describe('useFocusTrap', () => {
  it('wraps focus from last to first element on Tab', () => {
    render(<TrapHarness active />);
    screen.getByRole('button', { name: 'last' }).focus();

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('wraps focus from first to last element on Shift+Tab', () => {
    render(<TrapHarness active />);
    screen.getByRole('button', { name: 'first' }).focus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();
  });

  it('pulls focus back into the container when focus is outside', () => {
    render(<TrapHarness active />);
    screen.getByRole('button', { name: 'outside' }).focus();

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('does nothing when inactive', () => {
    render(<TrapHarness active={false} />);
    const outside = screen.getByRole('button', { name: 'outside' });
    outside.focus();

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(outside).toHaveFocus();
  });
});
