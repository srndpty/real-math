import { describe, expect, it } from 'vitest';
import {
  buildPageMeta,
  buildRobots,
  buildSitemap,
  escapeHtml,
  injectMeta
} from '../scripts/prerender';
import { graphContent } from '../src/content/loadContent';

const TEMPLATE = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="description"
      content="placeholder"
    />
    <title>Real Math Map</title>
  </head>
  <body></body>
</html>`;

const siteUrl = 'https://example.com';

describe('prerender', () => {
  it('escapes html special characters', () => {
    expect(escapeHtml('<a href="x">&</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;'
    );
  });

  it('builds node meta with locale-specific labels', () => {
    const node = graphContent.nodes.find((n) => n.id === 'differentiation');
    expect(node).toBeDefined();
    const meta = buildPageMeta(node!, 'en', siteUrl);
    expect(meta.title).toContain('Differentiation');
    expect(meta.url).toBe('https://example.com/en/node/differentiation');
    expect(meta.jsonLd).toMatchObject({ '@type': 'Thing' });
  });

  it('injects title, description, OGP, canonical, and JSON-LD', () => {
    const node = graphContent.nodes.find((n) => n.id === 'differentiation');
    const html = injectMeta(TEMPLATE, buildPageMeta(node!, 'ja', siteUrl));

    expect(html).toContain('<title>微分 | Real Math Map</title>');
    expect(html).toContain('<html lang="ja">');
    expect(html).toContain(
      '<link rel="canonical" href="https://example.com/ja/node/differentiation" />'
    );
    expect(html).toContain('og:title');
    expect(html).toContain('application/ld+json');
    expect(html).not.toContain('placeholder');
  });

  it('escapes < in JSON-LD to prevent script breakout', () => {
    const node = {
      ...graphContent.nodes[0]!,
      shortSummary: { ja: '</script><b>x</b>', en: 'x' }
    };
    const html = injectMeta(TEMPLATE, buildPageMeta(node, 'ja', siteUrl));
    expect(html).not.toContain('</script><b>');
  });

  it('builds sitemap and robots with the site url', () => {
    const sitemap = buildSitemap([`${siteUrl}/ja`, `${siteUrl}/en`]);
    expect(sitemap).toContain('<loc>https://example.com/ja</loc>');
    expect(buildRobots(siteUrl)).toContain(
      'Sitemap: https://example.com/sitemap.xml'
    );
  });
});
