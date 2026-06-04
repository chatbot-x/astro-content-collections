// Astro type references — required for .astro file type checking
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />

/**
 * Environment variable type declarations.
 * These are used by `process.env` in astro.config.mjs and API routes.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    /** IndexNow API key for instant search engine indexing. */
    INDEXNOW_KEY?: string;
  }
}
