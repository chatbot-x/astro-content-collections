// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import seoGraph from '@jdevalk/astro-seo-graph/integration';
import astroAiRobotsTxt from 'astro-ai-robots-txt';
import pagefind from 'astro-pagefind';
import compressor from 'astro-compressor';
import { unified } from '@astrojs/markdown-remark';
import rehypeCallouts from 'rehype-callouts';
import remarkWikiLink from '@flowershow/remark-wiki-link';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EnumChangefreq } from 'sitemap';

// Resolve paths relative to this config file, not CWD
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build wiki-link file and permalink maps from content collections at config time
// Recursively find all .md/.mdx files in the content directory
function findContentFiles(/** @type {string} */ dir, /** @type {string} */ base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = /** @type {string[]} */ ([]);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files = files.concat(findContentFiles(fullPath, relPath));
    } else if (/\.mdx?$/.test(entry.name)) {
      files.push(relPath);
    }
  }
  return files;
}

const contentDir = path.join(__dirname, 'src/content');
const contentFiles = findContentFiles(contentDir);
const permalinks = /** @type {Record<string, string>} */ ({});
for (const file of contentFiles) {
  const slug = file.replace(/\.mdx?$/, '');
  permalinks[file] = `/${slug}/`;
}

// Sitemap changefreq values — using EnumChangefreq from the sitemap package for type safety
const CHANGEFREQ_DAILY = EnumChangefreq.DAILY;
const CHANGEFREQ_WEEKLY = EnumChangefreq.WEEKLY;
const CHANGEFREQ_MONTHLY = EnumChangefreq.MONTHLY;

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',

  // Phase 3: Built-in HTML minification
  compressHTML: true,

  // Phase 3: Prefetch on hover for faster perceived navigation
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  // Phase 3: Content Security Policy
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-src 'none'",
      ],
      scriptDirective: {
        resources: ["'self'"], // Inline scripts auto-hashed by Astro via SHA-256 algorithm
      },
      styleDirective: {
        resources: ["'self'", "'unsafe-inline'"], // TailwindCSS + Shiki syntax highlighting require unsafe-inline
      },
    },
  },

  integrations: [
    // 1. Sitemap — generates sitemap-index.xml + sitemap-0.xml
    sitemap({
      filter: (page) => {
        // Exclude OG image routes (not crawlable content)
        if (page.includes('/og/')) return false;
        // Exclude utility routes
        if (page.includes('/llms-full.txt')) return false;
        // Exclude RSS feeds (discovered via <link rel="alternate">)
        if (page.includes('/rss.xml')) return false;
        // Exclude IndexNow key file
        if (page.includes('101ca11c95314d7094344c49eea380f9')) return false;
        return true;
      },
      lastmod: new Date(),
      serialize(item) {
        /** @type {import('@astrojs/sitemap').SitemapItem} */
        let result = item;
        // Homepage: highest priority
        if (item.url === 'https://example.com/' || item.url === 'https://example.com') {
          result = { ...item, priority: 1.0, changefreq: CHANGEFREQ_DAILY };
        }
        // Blog listing: high priority, frequently updated
        else if (item.url === 'https://example.com/blog/') {
          result = { ...item, priority: 0.9, changefreq: CHANGEFREQ_DAILY };
        }
        // Blog posts: high priority
        else if (item.url.includes('/blog/') && !item.url.endsWith('/blog/')) {
          result = { ...item, priority: 0.8, changefreq: CHANGEFREQ_WEEKLY };
        }
        // Projects: medium priority
        else if (item.url.includes('/projects/')) {
          result = { ...item, priority: 0.7, changefreq: CHANGEFREQ_MONTHLY };
        }
        // About: lower priority, rarely changes
        else if (item.url.includes('/about')) {
          result = { ...item, priority: 0.5, changefreq: CHANGEFREQ_MONTHLY };
        }
        return result;
      },
      namespaces: {
        news: false,   // Not a news site
        xhtml: true,   // hreflang support
        image: true,   // Image sitemap entries
        video: false,  // No video content yet
      },
    }),

    // 2. SEO Graph — validators, structured data, llms.txt, IndexNow
    seoGraph({
      // Build-time SEO validators
      validateH1: true,
      validateUniqueMetadata: true,
      validateImageAlt: true,
      validateMetadataLength: {
        title: { min: 30, max: 65 },
        description: { min: 70, max: 200 },
      },
      validateInternalLinks: true,

      // llms.txt generation
      llmsTxt: {
        title: 'Astro + TailwindCSS',
        siteUrl: 'https://example.com',
        summary: 'A modern static site built with Astro v6, TailwindCSS v4, and type-safe Content Collections. Features blog posts, project showcases, dark mode, AI-ready SEO with structured data and knowledge graphs.',
      },

      // IndexNow — instant indexing on Bing/Yandex/Naver/Seznam/Yep
      // IMPORTANT: Deploy the key route FIRST before enabling this!
      // Verify https://example.com/101ca11c95314d7094344c49eea380f9.txt loads, then uncomment:
      indexNow: {
        key: process.env.INDEXNOW_KEY || '101ca11c95314d7094344c49eea380f9',
        host: 'example.com',
        siteUrl: 'https://example.com',
      },
    }),

    // 3. AI crawler blocking
    astroAiRobotsTxt(),

    // 4. Pagefind search
    pagefind(),

    // 5. Pre-compress static files (gzip + brotli + zstd)
    compressor(),
  ],

  // @ts-expect-error — unified() returns MarkdownProcessor which Astro accepts at runtime
  // but the type definition only declares the object form for `markdown`.
  markdown: unified({
    remarkPlugins: [
      [remarkWikiLink, {
        // Provide content file names so wiki-links resolve against actual content
        files: contentFiles,
        // Map file names to their Astro route URLs
        permalinks,
        format: 'shortestPossible',
        caseInsensitive: true,
        className: 'internal',
        newClassName: 'unresolved',
        aliasDivider: '|',
      }],
    ],
    rehypePlugins: [
      [rehypeCallouts, { theme: 'github', showIndicator: true }],
    ],
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});
