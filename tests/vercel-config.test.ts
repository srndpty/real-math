import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Header = {
  key: string;
  value: string;
};

type HeaderRule = {
  headers: Header[];
};

describe('vercel config', () => {
  it('allows prerendered JSON-LD scripts under the CSP', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
      headers: HeaderRule[];
    };
    const csp = config.headers
      .flatMap((rule) => rule.headers)
      .find((header) => header.key === 'Content-Security-Policy')?.value;

    expect(csp).toBeDefined();
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
  });
});
