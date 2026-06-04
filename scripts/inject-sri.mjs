#!/usr/bin/env node
/**
 * Post-build SRI (Subresource Integrity) injection for Pagefind assets.
 *
 * After `astro build`, this script:
 * 1. Computes SHA-384 hashes of the Pagefind CSS and JS files in dist/pagefind/
 * 2. Finds the minified SearchModal inline script in built HTML files
 * 3. Injects integrity attributes into the dynamic createElement calls
 *
 * Usage: node scripts/inject-sri.mjs
 *
 * This addresses AUD-005: No SRI for dynamically loaded Pagefind JS/CSS.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST_DIR = join(import.meta.dirname, '..', 'dist');

function computeSRI(filePath) {
  const content = readFileSync(filePath);
  const hash = createHash('sha384').update(content).digest('base64');
  return `sha384-${hash}`;
}

function findHtmlFiles(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findHtmlFiles(fullPath));
      } else if (extname(entry.name) === '.html') {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

function computePagefindSRI() {
  const pagefindDir = join(DIST_DIR, 'pagefind');
  const sriMap = {};
  try {
    const entries = readdirSync(pagefindDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = extname(entry.name);
        if (ext === '.js' || ext === '.css' || ext === '.wasm') {
          const filePath = join(pagefindDir, entry.name);
          sriMap[`/pagefind/${entry.name}`] = computeSRI(filePath);
          console.log(`  SRI for /pagefind/${entry.name}: ${sriMap[`/pagefind/${entry.name}`].substring(0, 30)}...`);
        }
      }
    }
  } catch (err) {
    console.warn('Warning: Could not read pagefind directory:', err.message);
  }
  return sriMap;
}

function injectSRIIntoHtml(htmlFiles, sriMap) {
  let modifiedCount = 0;
  const cssSri = sriMap['/pagefind/pagefind-component-ui.css'];
  const jsSri = sriMap['/pagefind/pagefind-component-ui.js'];

  if (!cssSri && !jsSri) {
    console.log('No component UI assets found for SRI injection.');
    return 0;
  }

  for (const htmlFile of htmlFiles) {
    let content = readFileSync(htmlFile, 'utf-8');
    let modified = false;

    // Inject integrity into CSS link creation in minified Astro output
    // Minified pattern: e.href="/pagefind/pagefind-component-ui.css",e.rel="stylesheet"
    if (cssSri) {
      const cssPattern = /(\w+\.href\s*=\s*["']\/pagefind\/pagefind-component-ui\.css["']\s*,\s*\w+\.rel\s*=\s*["']stylesheet["'])/;
      if (cssPattern.test(content)) {
        content = content.replace(cssPattern, `$1,e.integrity="${cssSri}"`);
        modified = true;
      }
      // Also handle unminified format
      const cssPattern2 = /(link\.href\s*=\s*["']\/pagefind\/pagefind-component-ui\.css["'];?\s*\n)/;
      if (!modified && cssPattern2.test(content)) {
        content = content.replace(cssPattern2, `$1        link.integrity = '${cssSri}';\n`);
        modified = true;
      }
    }

    // Inject integrity into JS script creation in minified Astro output
    // Minified pattern: e.src="/pagefind/pagefind-component-ui.js",e.type="module"
    if (jsSri) {
      const jsPattern = /(\w+\.src\s*=\s*["']\/pagefind\/pagefind-component-ui\.js["']\s*,\s*\w+\.type\s*=\s*["']module["'])/;
      if (jsPattern.test(content)) {
        content = content.replace(jsPattern, `$1,e.integrity="${jsSri}"`);
        modified = true;
      }
      // Also handle unminified format
      const jsPattern2 = /(script\.src\s*=\s*["']\/pagefind\/pagefind-component-ui\.js["'];?\s*\n)/;
      if (!modified && jsPattern2.test(content)) {
        content = content.replace(jsPattern2, `$1        script.integrity = '${jsSri}';\n`);
        modified = true;
      }
    }

    if (modified) {
      writeFileSync(htmlFile, content, 'utf-8');
      modifiedCount++;
    }
  }

  return modifiedCount;
}

// ── Main ──
console.log('SRI Injection for Pagefind assets\n');

const sriMap = computePagefindSRI();

if (Object.keys(sriMap).length === 0) {
  console.log('No Pagefind assets found. Skipping SRI injection.');
  process.exit(0);
}

const htmlFiles = findHtmlFiles(DIST_DIR);
console.log(`\nFound ${htmlFiles.length} HTML files to process.`);

const modifiedCount = injectSRIIntoHtml(htmlFiles, sriMap);
console.log(`Modified ${modifiedCount} HTML files with SRI hashes.`);
console.log('SRI injection complete.');
