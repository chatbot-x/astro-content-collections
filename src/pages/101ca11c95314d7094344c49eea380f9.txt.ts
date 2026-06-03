import { createIndexNowKeyRoute } from '@jdevalk/astro-seo-graph';

/**
 * IndexNow key verification route.
 * Search engines fetch this file to verify you own the domain
 * before accepting IndexNow submissions.
 *
 * IMPORTANT: This route must be deployed and accessible at
 * https://example.com/101ca11c95314d7094344c49eea380f9.txt
 * BEFORE enabling the indexNow config in astro.config.mjs.
 */
export const GET = createIndexNowKeyRoute({
  key: process.env.INDEXNOW_KEY || '101ca11c95314d7094344c49eea380f9',
});
