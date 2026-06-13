import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { graphContentSchema } from '../src/content/schema';
import type { GraphContentOutput } from '../src/content/schema';
import type { Locale } from '../src/content/types';

// Vercel のプロジェクト設定で SITE_URL を上書きできる（カスタムドメイン移行時など）
export const DEFAULT_SITE_URL = 'https://real-math.vercel.app';

const LOCALES: Locale[] = ['ja', 'en'];

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export type PageMeta = {
  lang: Locale;
  title: string;
  description: string;
  url: string;
  jsonLd: Record<string, unknown> | null;
};

export const buildPageMeta = (
  node: GraphContentOutput['nodes'][number] | null,
  locale: Locale,
  siteUrl: string
): PageMeta => {
  if (!node) {
    return {
      lang: locale,
      title: 'Real Math Map',
      description:
        locale === 'ja'
          ? '数学概念と現実世界の応用を同じ地図で探索する'
          : 'Explore math concepts and real-world applications on one map',
      url: `${siteUrl}/${locale}`,
      jsonLd: null
    };
  }
  const url = `${siteUrl}/${locale}/node/${node.id}`;
  return {
    lang: locale,
    title: `${node.labels[locale]} | Real Math Map`,
    description: node.shortSummary[locale],
    url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name: node.labels[locale],
      description: node.shortSummary[locale],
      url
    }
  };
};

export const injectMeta = (template: string, meta: PageMeta): string => {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(meta.url);

  const extraTags = [
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<link rel="canonical" href="${url}" />`,
    ...(meta.jsonLd
      ? [
          // </script> 挿入による HTML 破壊を防ぐため < をエスケープする
          `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>`
        ]
      : [])
  ].join('\n    ');

  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${meta.lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${description}" />`
    )
    .replace('</head>', `    ${extraTags}\n  </head>`);
};

export const buildSitemap = (urls: string[]): string => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const entries = urls
    .map(
      (url) =>
        `  <url>\n    <loc>${escapeHtml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
};

export const buildRobots = (siteUrl: string): string =>
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

const prerender = () => {
  const siteUrl = process.env.SITE_URL ?? DEFAULT_SITE_URL;
  const distDir = resolve(process.cwd(), 'dist');
  const template = readFileSync(resolve(distDir, 'index.html'), 'utf-8');
  const rawContent: unknown = JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'src/content/graph-content.json'),
      'utf-8'
    )
  );
  const content = graphContentSchema.parse(rawContent);

  const urls: string[] = [];
  let pageCount = 0;

  for (const locale of LOCALES) {
    // ロケールのランディングページ
    const landingDir = resolve(distDir, locale);
    mkdirSync(landingDir, { recursive: true });
    writeFileSync(
      resolve(landingDir, 'index.html'),
      injectMeta(template, buildPageMeta(null, locale, siteUrl))
    );
    urls.push(`${siteUrl}/${locale}`);
    pageCount += 1;

    // ノード詳細ページ
    for (const node of content.nodes) {
      const nodeDir = resolve(distDir, locale, 'node', node.id);
      mkdirSync(nodeDir, { recursive: true });
      writeFileSync(
        resolve(nodeDir, 'index.html'),
        injectMeta(template, buildPageMeta(node, locale, siteUrl))
      );
      urls.push(`${siteUrl}/${locale}/node/${node.id}`);
      pageCount += 1;
    }
  }

  writeFileSync(resolve(distDir, 'sitemap.xml'), buildSitemap(urls));
  writeFileSync(resolve(distDir, 'robots.txt'), buildRobots(siteUrl));

  console.log(
    `Prerender complete: ${pageCount} pages, sitemap (${urls.length} URLs), robots.txt → dist/`
  );
};

const isDirectRun =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  prerender();
}
