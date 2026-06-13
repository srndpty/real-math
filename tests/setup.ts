import '@testing-library/jest-dom/vitest';
import '../src/i18n/config';
import { afterEach, beforeAll, vi } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';
import { cleanup } from '@testing-library/react';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom には matchMedia がないため、innerWidth と resize イベントに連動する実装を与える
const createMatchMediaMock = (query: string): MediaQueryList => {
  const maxWidth = /\(max-width:\s*(\d+(?:\.\d+)?)px\)/.exec(query)?.[1];
  const matches = () =>
    maxWidth !== undefined && window.innerWidth <= Number(maxWidth);
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  window.addEventListener('resize', () => {
    const event = { matches: matches(), media: query } as MediaQueryListEvent;
    listeners.forEach((listener) => listener(event));
  });
  return {
    media: query,
    get matches() {
      return matches();
    },
    onchange: null,
    addEventListener: (_type: string, listener: unknown) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (_type: string, listener: unknown) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false
  } as MediaQueryList;
};

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  vi.stubGlobal('matchMedia', createMatchMediaMock);
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined)
    },
    configurable: true
  });
});

expect.extend(toHaveNoViolations);
afterEach(() => cleanup());
