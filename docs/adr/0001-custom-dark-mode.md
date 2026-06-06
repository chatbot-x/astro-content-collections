# ADR 0001: Custom Dark Mode Implementation

**Date:** 2026-06-05
**Status:** Accepted

## Context

The site implements a 3-mode dark mode system (Light / Dark / System) using a custom `ThemeProvider.astro` component rather than using an existing Astro integration or community package.

We evaluated three approaches:

### Option A: Custom ThemeProvider (Chosen)
Build a custom inline `<script is:inline>` component that runs before first paint, reads `localStorage` for persistence, respects `prefers-color-scheme` via `matchMedia`, syncs across tabs via `storage` events, and exposes a `window.__ASTRO_THEMES__` API for the toggle component.

### Option B: @darkobits/nvimo or astro-dark-mode integration
Use a community integration that wraps dark mode logic.

### Option C: Astro View Transitions + CSS-only approach
Rely solely on CSS `prefers-color-scheme` media query with no JavaScript toggle.

## Decision

We chose **Option A** (custom ThemeProvider) for the following reasons:

1. **FOUC Prevention**: The `is:inline` script in `<head>` runs before paint, preventing the flash of wrong theme. Community integrations that use Astro's bundled script pipeline load after hydration, causing a visible flash.

2. **3-Mode System**: Users want explicit Light, Dark, and System modes — not just a binary toggle. Most integrations only support binary light/dark. The System mode (which follows OS preference and auto-updates when the OS changes) is a key UX feature.

3. **Cross-Tab Sync**: The `storage` event listener ensures that changing the theme in one tab immediately updates all open tabs. This is not provided by CSS-only or most integration approaches.

4. **Astro Island Architecture Compatibility**: As a zero-JS framework by default, Astro's hydration model means interactive components may not be available on initial load. Our inline script is framework-agnostic and works regardless of island hydration timing.

5. **View Transitions Support**: The `ThemeToggle.astro` component listens for `astro:page-load` to re-initialize on View Transition navigations, and uses `AbortController` for proper cleanup. This is tightly integrated with Astro's lifecycle events.

6. **No Runtime Dependencies**: The implementation adds zero npm dependencies — it's ~70 lines of vanilla JS inline in the component. This keeps the bundle minimal, consistent with Astro's zero-JS-by-default philosophy.

## Consequences

### Positive
- Zero-FOUC dark mode that works before any Astro hydration
- 3-mode toggle (Light/Dark/System) with OS preference sync
- Cross-tab theme synchronization
- No runtime dependencies added to the bundle
- Full control over the implementation for future customization
- Works correctly with Astro View Transitions

### Negative
- Custom code to maintain (though minimal at ~70 lines)
- Uses `window.__ASTRO_THEMES__` global namespace — potential collision if other scripts use the same name, but this is unlikely for a static site
- Inline script is not CSP-compatible with strict `script-src` policies (see SEC-001: Astro CSP issue #16664)
- The `is:inline` directive means this script is not processed by Vite — no minification, no module bundling

### Risks Mitigated
- **CSP conflict**: Documented in `astro.config.mjs` with TODO and upstream issue link (#16664). When Astro fixes CSP hash computation for inline scripts, we can re-enable CSP without modifying the dark mode implementation.
- **Global namespace collision**: Prefixed with `__ASTRO_` to reduce collision risk. This follows the convention used by Astro's own runtime globals.

## Re-Evaluation Triggers

Re-evaluate this decision if:
- Astro ships built-in dark mode support with FOUC prevention and 3-mode toggle
- The Astro CSP bug (#16664) is resolved and we need strict CSP with `script-src` hashes
- A community integration emerges that provides all of: FOUC prevention, 3-mode toggle, cross-tab sync, View Transitions support, and zero runtime dependencies
