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

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',

  // Phase 3: Built-in HTML minification
  compressHTML: true,

  // Phase 3: Prefetch on hover for faster perceived navigation
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
    ignoreSlowConnection: true,
  },

  // Phase 3: Content Security Policy
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' https://example.com data:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-src 'none'",
      ],
      styleDirective: {
        resources: ["'self'", "'unsafe-inline'"], // TailwindCSS needs unsafe-inline
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
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Homepage: highest priority
        if (item.url === 'https://example.com/' || item.url === 'https://example.com') {
          return { ...item, priority: 1.0, changefreq: 'daily' };
        }
        // Blog listing: high priority, frequently updated
        if (item.url === 'https://example.com/blog/') {
          return { ...item, priority: 0.9, changefreq: 'daily' };
        }
        // Blog posts: high priority
        if (item.url.includes('/blog/') && !item.url.endsWith('/blog/')) {
          return { ...item, priority: 0.8, changefreq: 'weekly' };
        }
        // Projects: medium priority
        if (item.url.includes('/projects/')) {
          return { ...item, priority: 0.7, changefreq: 'monthly' };
        }
        // About: lower priority, rarely changes
        if (item.url.includes('/about')) {
          return { ...item, priority: 0.5, changefreq: 'monthly' };
        }
        return item;
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

  markdown: unified({
    rehypePlugins: [
      [rehypeCallouts, { theme: 'github', showIndicator: true }],
    ],
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});
