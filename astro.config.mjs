// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import seoGraph from '@jdevalk/astro-seo-graph/integration';
import astroAiRobotsTxt from 'astro-ai-robots-txt';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [
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

      // llms.txt generation — auto-generated from built pages
      llmsTxt: {
        title: 'Astro + TailwindCSS',
        siteUrl: 'https://example.com',
        summary: 'A modern static site built with Astro v6, TailwindCSS v4, and type-safe Content Collections. Features blog posts, project showcases, dark mode, AI-ready SEO with structured data and knowledge graphs.',
      },

      // IndexNow — disabled by default; enable after deploying the key route
      // indexNow: {
      //   key: process.env.INDEXNOW_KEY!,
      //   host: 'example.com',
      //   siteUrl: 'https://example.com',
      // },
    }),
    astroAiRobotsTxt(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
