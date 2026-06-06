# Contributing to astro-content-collections

Thank you for your interest in contributing! This document covers key security
boundaries and architectural decisions that every contributor should understand.

---

## Security Boundaries

### FeatureCard `icon` prop (SEC-003)

The `FeatureCard` component uses `set:html` to inject SVG icon markup from the
`icon` prop. **This prop must ONLY contain trusted, hardcoded SVG strings —
never user-generated content.** Passing untrusted input to this prop would
create an XSS vulnerability.

**Rule:** The `icon` prop must only be populated from hardcoded SVG definitions
in `Features.astro` or similar trusted sources. If you need to render dynamic
icons, use Astro's slot mechanism or component composition instead of
`set:html`.

### CSP Meta Tag Workaround (SEC-001)

The project currently uses CSP meta tags instead of HTTP headers due to a known
Astro bug that omits hashes for some inline scripts. This is documented in
`astro.config.mjs` with a TODO. **Do not switch to HTTP header CSP until the
upstream issue is resolved.** Re-evaluate on every Astro upgrade.

### FeatureCard `set:html` Usage

When adding new components that use `set:html`:
1. Document the security boundary in a code comment
2. Ensure the prop is never populated from user input
3. Consider using Astro's `<slot />` or component composition as an alternative

---

## Architecture Decision Records

### ADR-001: Custom Dark Mode Implementation (ARCH-002)

**Decision:** We use a custom 3-mode dark mode system (Light / Dark / System)
instead of an existing community integration like `astro-theme-toggle`.

**Context:** The project requires:
- 3-mode toggle (Light / Dark / System), not just light/dark
- Full WAI-ARIA keyboard navigation (roving tabindex, arrow keys)
- Cross-tab synchronization via localStorage `storage` event
- Zero FOUC (Flash of Unstyled Content) via inline script in `<head>`
- Pagefind UI theming for both light and dark modes

**Alternatives considered:**
- `astro-theme-toggle` — Only supports 2-mode (light/dark), no WAI-ARIA
- `starlight-theme-toggle` — Designed for Starlight docs, not general use
- CSS `prefers-color-scheme` only — No user override, no persistence

**Rationale:** No existing integration provides all the required features
together. The custom implementation (`ThemeProvider.astro` +
`ThemeToggle.astro`) delivers all requirements in ~140 lines of inline script
with full accessibility support. The maintenance burden is manageable given
the small, well-scoped implementation.

**Consequences:** The team owns the dark mode implementation and must maintain
it across Astro upgrades. If a community integration adds all required features
in the future, we should re-evaluate.

### ADR-002: SITE_URL Single Source of Truth (ARCH-001)

**Decision:** `astro.config.mjs` is the single source of truth for the site URL.
`src/utils/site.ts` reads it via `import.meta.env.SITE`.

**Context:** Previously, both files independently read `site.config.json`,
creating a dual-reader pattern that risked URL inconsistency.

**Rationale:** Astro automatically populates `import.meta.env.SITE` from the
`site` config. Using this built-in mechanism eliminates the shared config file
and the validation warning workaround.

### ADR-003: External Code Examples (QUAL-001)

**Decision:** Code examples displayed on the About page are loaded from
external files via `?raw` imports, not hardcoded as string literals.

**Rationale:** External files are easier to maintain, can be validated
independently, and can potentially be auto-synced with actual source files via
a build step.

---

## Code Style

- Follow existing patterns in the codebase
- Add `FIX (ID):` comments when addressing specific audit findings
- Use TypeScript strict mode (extends `astro/tsconfigs/strict`)
- Run `npm run lint` before committing
- Run `npm test` before committing
