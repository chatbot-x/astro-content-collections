/**
 * Centralized site configuration.
 * Single source of truth for the site URL — used by schema builders,
 * RSS feeds, sitemap, OG images, and llms.txt generation.
 *
 * FIX: Previously, SITE_URL was independently defined here AND in
 * astro.config.mjs, creating a DRY violation. If one was updated but
 * not the other, the site would have inconsistent URLs across sitemap,
 * Schema.org JSON-LD, RSS feeds, and OG images. Now both read from
 * the shared site.config.json at the project root.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteConfigPath = path.join(__dirname, '../../site.config.json');

let siteUrl = 'https://example.com'; // fallback
try {
  const siteConfig = JSON.parse(readFileSync(siteConfigPath, 'utf-8'));
  siteUrl = siteConfig.siteUrl || siteUrl;
} catch {
  // site.config.json not found — use default
}

export const SITE_URL = siteUrl;
export const SITE_NAME = 'Astro + TailwindCSS';
export const SITE_DESCRIPTION =
  'A modern static site built with Astro v6, TailwindCSS v4, and type-safe Content Collections. Features blog posts, project showcases, dark mode, AI-ready SEO with structured data and knowledge graphs.';
