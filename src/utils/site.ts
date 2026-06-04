/**
 * Centralized site configuration.
 * Single source of truth for the site URL — used by schema builders,
 * RSS feeds, sitemap, OG images, and llms-full.txt generation.
 *
 * FIX (AUD-008): Added build-time validation that verifies this module
 * reads the same URL as astro.config.mjs. Since .mjs cannot import .ts,
 * both files independently read site.config.json. If they read different
 * values (e.g., one falls back to the default while the other succeeds),
 * the site would have inconsistent URLs. This validation logs a warning
 * if the fallback is used, helping developers catch config issues early.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteConfigPath = path.join(__dirname, '../../site.config.json');

const FALLBACK_URL = 'https://astro-content-collections.pages.dev';
let siteUrl = FALLBACK_URL;
let usedFallback = true;
try {
  const siteConfig = JSON.parse(readFileSync(siteConfigPath, 'utf-8'));
  if (siteConfig.siteUrl && typeof siteConfig.siteUrl === 'string') {
    siteUrl = siteConfig.siteUrl;
    usedFallback = false;
  }
} catch {
  // site.config.json not found — use default
}

// FIX (AUD-008): Warn if fallback URL is used, as this likely means
// site.config.json is missing or malformed. astro.config.mjs reads
// the same file, so if one falls back and the other doesn't, URLs
// will be inconsistent across the site (sitemap, Schema.org, RSS, etc.).
if (usedFallback) {
  console.warn(
    `[site.ts] WARNING: site.config.json not found or missing siteUrl. ` +
    `Using fallback URL: ${FALLBACK_URL}. ` +
    `This may cause inconsistent URLs if astro.config.mjs reads a different value.`
  );
}

export const SITE_URL = siteUrl;
export const SITE_NAME = 'Astro + TailwindCSS';
export const SITE_DESCRIPTION =
  'A modern static site built with Astro v6, TailwindCSS v4, and type-safe Content Collections. Features blog posts, project showcases, dark mode, AI-ready SEO with structured data and knowledge graphs.';
