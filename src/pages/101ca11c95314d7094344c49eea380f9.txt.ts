import type { APIRoute } from 'astro';
import { createIndexNowKeyRoute } from '@jdevalk/astro-seo-graph';

/**
 * IndexNow key verification route.
 * Search engines fetch this file to verify you own the domain
 * before accepting IndexNow submissions.
 *
 * IMPORTANT: This route must be deployed and accessible at
 * https://example.com/101ca11c95314d7094344c49eea380f9.txt
 * BEFORE enabling the indexNow config in astro.config.mjs.
 *
 * SECURITY: The key must be provided via the INDEXNOW_KEY environment variable.
 * Never commit the actual key value to source control.
 *
 * FIX: When INDEXNOW_KEY is not set, return 404 instead of passing an empty
 * string to createIndexNowKeyRoute which would fail validation (requires 8-128 chars).
 */

const indexNowKey = process.env.INDEXNOW_KEY;

// Only use the IndexNow route handler when the key is actually configured
const indexNowHandler = indexNowKey
  ? createIndexNowKeyRoute({ key: indexNowKey })
  : undefined;

export const GET: APIRoute = async (ctx) => {
  if (!indexNowHandler) {
    return new Response('IndexNow key not configured', { status: 404 });
  }
  return indexNowHandler(ctx);
};
