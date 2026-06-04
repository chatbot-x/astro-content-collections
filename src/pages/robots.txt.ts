import type { APIRoute } from 'astro';
import { SITE_URL } from '../utils/site';

/**
 * Dynamic robots.txt generation.
 * FIX (AUD-009): Previously, robots.txt was a static file in public/ that
 * hardcoded the production sitemap URL. In non-production environments
 * (staging, local dev, preview deployments), this would incorrectly point
 * crawlers to the production sitemap. Now it uses the dynamic SITE_URL
 * from site.config.json so the sitemap URL always matches the actual deployment.
 */
export const GET: APIRoute = async () => {
  const content = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${SITE_URL}/sitemap-index.xml`,
  ].join('\n');

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
