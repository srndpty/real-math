import { describe, expect, it } from 'vitest';
import content from '../src/content/graph-content.json';
import { graphContentSchema } from '../src/content/schema';

describe('content schema', () => {
  it('validates graph content JSON', () => {
    const parsed = graphContentSchema.safeParse(content);
    expect(parsed.success).toBe(true);
  });
});
