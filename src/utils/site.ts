/**
 * Centralized site configuration.
 * Single source of truth for the site URL — used by schema builders,
 * RSS feeds, sitemap, OG images, and llms-full.txt generation.
 *
 * FIX (ARCH-001): Eliminated the dual-reader pattern where both
 * astro.config.mjs and this file independently read site.config.json.
 * Now, astro.config.mjs is the single source of truth (it sets `site`),
 * and this module reads the resolved value via `import.meta.env.SITE`,
 * which Astro automatically populates from the config.
 *
 * This removes:
 *   - site.config.json (no longer needed)
 *   - The fallback URL validation warning workaround
 *   - The possibility of URL inconsistency between config and runtime
 */

// Astro automatically sets import.meta.env.SITE from the `site` field
// in astro.config.mjs. This is the canonical, single source of truth.
// In rare cases where it's not set (e.g., direct vitest execution),
// fall back to a sensible default.
const SITE_URL = import.meta.env.SITE || 'https://astro-content-collections.pages.dev';

export { SITE_URL };
export const SITE_NAME = 'Astro + TailwindCSS';
export const SITE_DESCRIPTION =
  'A modern static site built with Astro v6, TailwindCSS v4, and type-safe Content Collections. Features blog posts, project showcases, dark mode, AI-ready SEO with structured data and knowledge graphs.';
