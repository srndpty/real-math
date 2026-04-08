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

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined)
    },
    configurable: true
  });
});

expect.extend(toHaveNoViolations);
afterEach(() => cleanup());
