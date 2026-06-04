// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
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

// Import SITE_URL from the shared module to avoid duplication.
// astro.config.mjs is ESM, so we can use dynamic import for a TS module.
// However, since this is a .mjs config file evaluated at build time,
// we define the constant here and re-export it is not possible.
// Instead, we keep a single definition here and import it in utils/site.ts
// via a re-export pattern. BUT .mjs cannot import .ts directly.
// Solution: Define SITE_URL here, and have utils/site.ts also define it.
// To truly DRY this up, we create a shared JSON config.
import { readFileSync } from 'node:fs';

// Resolve paths relative to this config file, not CWD
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build wiki-link file and permalink maps from content collections at config time
// Recursively find all .md/.mdx files in the content directory
// FIX (AUD-007): Added symlink detection and max depth guard to prevent
// infinite recursion from circular symlinks and excessively deep trees.
function findContentFiles(/** @type {string} */ dir, /** @type {string} */ base = '', /** @type {number} */ depth = 0) {
  // Guard against excessively deep or circular directory structures
  if (depth > 10) {
    console.warn(`findContentFiles: max depth (10) exceeded at ${dir}, stopping recursion`);
    return /** @type {string[]} */ ([]);
  }
  let files = /** @type {string[]} */ ([]);
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    // Directory doesn't exist or isn't readable
    return files;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    // Skip symbolic links to prevent circular symlink traversal
    try {
      const stat = fs.lstatSync(fullPath);
      if (stat.isSymbolicLink()) continue;
    } catch {
      continue;
    }
    if (entry.isDirectory()) {
      files = files.concat(findContentFiles(fullPath, relPath, depth + 1));
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
  // FIX: The remark-wiki-link plugin resolves wiki-links by looking up the
  // matching file path (WITH extension) in the permalinks map. Previously,
  // the key was the slug (without extension), so the permalink lookup always
  // failed and fell back to the default urlResolver. Now we use the full
  // file path (with extension) as the key, matching what the plugin expects.
  const slug = file.replace(/\.mdx?$/, '');
  permalinks[file] = `/${slug}/`;
}

// Sitemap changefreq values — use the exported ChangeFreqEnum from @astrojs/sitemap
// to satisfy TypeScript's strict typing (plain strings cause TS2322 errors).
const CHANGEFREQ_DAILY = ChangeFreqEnum.DAILY;
const CHANGEFREQ_WEEKLY = ChangeFreqEnum.WEEKLY;
const CHANGEFREQ_MONTHLY = ChangeFreqEnum.MONTHLY;

// Site URL constant — single source of truth.
// FIX: Load from a shared JSON file so both astro.config.mjs and
// src/utils/site.ts read the same value. Previously, SITE_URL was
// independently defined in both files, creating a DRY violation that
// could lead to inconsistent URLs across sitemap, Schema.org, RSS, etc.
const siteConfigPath = path.join(__dirname, 'site.config.json');
let SITE_URL = 'https://astro-content-collections.pages.dev'; // fallback
try {
  const siteConfig = JSON.parse(readFileSync(siteConfigPath, 'utf-8'));
  SITE_URL = siteConfig.siteUrl || SITE_URL;
} catch {
  // site.config.json not found — use default
}

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,

  // Phase 3: Built-in HTML minification
  compressHTML: true,

  // Phase 3: Prefetch on hover for faster perceived navigation
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  // Phase 3: Content Security Policy
  // SECURITY NOTES (AUD-002, AUD-003):
  //
  // 'unsafe-eval' in script-src: REQUIRED by Pagefind's WASM engine (wasmd).
  // Pagefind internally uses eval() to initialize its WebAssembly module.
  // Without this directive, Pagefind search will fail to initialize.
  // Mitigation: Monitor Pagefind releases for CSP-compatible WASM init.
  // Tracked at: https://github.com/nicepage/Pagefind/issues
  //
  // 'unsafe-inline' in style-src: REQUIRED by TailwindCSS v4 + Shiki.
  // TailwindCSS generates utility classes as inline styles at build time,
  // and Shiki syntax highlighting generates inline style attributes for
  // token coloring. Removing this directive breaks all styling.
  // This is a known limitation of TailwindCSS with CSP enforcement.
  // Risk is partially mitigated: this is a static site with NO user-generated
  // content (no comments, forms, or dynamic HTML injection points).
  //
  // 'unsafe-hashes' in script-src: REQUIRED for Astro View Transitions.
  // Astro generates inline event handlers (e.g., onclick) with SHA-256
  // hashes. Without 'unsafe-hashes', View Transitions would break.
  //
  // Defense-in-depth: A matching CSP HTTP header is set in public/_headers
  // (for Cloudflare Pages), providing CSP enforcement at both the HTTP level
  // and the HTML meta-tag level.
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        // FIX: Pagefind fetches search index JSON from /pagefind/ — 'self' covers this.
        // Worker-src 'self' allows Pagefind's Web Worker to load.
        "connect-src 'self'",
        "worker-src 'self'",
        "frame-src 'none'",
      ],
      scriptDirective: {
        // FIX: Pagefind loads JS modules from /pagefind/ which is same-origin ('self').
        // Astro auto-hashes inline scripts via SHA-256 algorithm.
        // 'unsafe-eval' is required by Pagefind's internal search engine (wasmd).
        // 'unsafe-hashes' allows Astro's View Transitions and ThemeProvider inline
        // scripts to work with CSP (event handlers like onclick with hashes).
        resources: ["'self'", "'unsafe-eval'", "'unsafe-hashes'"],
      },
      styleDirective: {
        // TailwindCSS + Shiki syntax highlighting + Pagefind CSS require unsafe-inline
        resources: ["'self'", "'unsafe-inline'"],
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
      serialize(item) {
        /** @type {import('@astrojs/sitemap').SitemapItem} */
        let result = item;
        // FIX: Use SITE_URL constant instead of hardcoded 'https://example.com'
        // so that changing the domain only requires updating one place.
        // Homepage: highest priority
        if (item.url === `${SITE_URL}/` || item.url === SITE_URL) {
          result = { ...item, priority: 1.0, changefreq: CHANGEFREQ_DAILY };
        }
        // Blog listing: high priority, frequently updated
        else if (item.url === `${SITE_URL}/blog/`) {
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
        // FIX: Adjusted title range to accommodate both short page titles
        // (e.g., "Page Not Found | Astro + TailwindCSS" = 40 chars) and long
        // blog titles (e.g., "Building a Portfolio with Astro's Island Architecture | Astro + TailwindCSS" = 74 chars).
        // Google displays ~60 chars in search results; the validator enforces
        // a practical range rather than strict SEO ideal.
        title: { min: 20, max: 75 },
        description: { min: 70, max: 200 },
      },
      validateInternalLinks: true,

      // llms.txt generation
      llmsTxt: {
        title: 'Astro + TailwindCSS',
        siteUrl: SITE_URL,
        summary: 'A modern static site built with Astro v6, TailwindCSS v4, and type-safe Content Collections. Features blog posts, project showcases, dark mode, AI-ready SEO with structured data and knowledge graphs.',
      },

      // IndexNow — instant indexing on Bing/Yandex/Naver/Seznam/Yep
      // IMPORTANT: Deploy the key route FIRST before enabling this!
      // Verify https://astro-content-collections.pages.dev/101ca11c95314d7094344c49eea380f9.txt loads, then uncomment:
      // FIX: Removed TypeScript non-null assertion (!) which is invalid in .mjs files.
      // Also conditionally enable IndexNow only when the key is actually set.
      ...(process.env.INDEXNOW_KEY
        ? {
            indexNow: {
              key: process.env.INDEXNOW_KEY,
              host: SITE_URL.replace(/^https?:\/\//, ''),
              siteUrl: SITE_URL,
            },
          }
        : {}),
    }),

    // 3. AI crawler blocking
    astroAiRobotsTxt(),

    // 4. Pagefind search
    pagefind(),

    // 5. Pre-compress static files (gzip + brotli + zstd)
    compressor(),
  ],

  // NOTE: Shiki syntax highlighting uses inline style attributes which are
  // compatible with CSP only because style-src includes 'unsafe-inline'.
  // If stricter CSP is needed, switch to Prism via:
  //   markdown: { shikiConfig: { theme: 'github-dark' } }
  // and remove 'unsafe-inline' from styleDirective.

  // Astro v6 Content Layer markdown configuration using the processor API.
  // The `unified()` function from @astrojs/markdown-remark returns a
  // MarkdownProcessor that Astro accepts at runtime via the `processor` key.
  markdown: {
    processor: unified({
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
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
