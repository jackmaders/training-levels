# UX, layout, and implementation handoff

## Decision

**Selected theme: Amber Minimal.** This is the user’s current choice and supersedes the earlier Nature recommendation. Preserve the earlier comparison below as evidence, but implement Amber Minimal if and when product work is authorized. Do not switch to Nature based on the earlier recommendation.

The source preset is [Amber Minimal](https://tweakcn.com/r/themes/amber-minimal.json). The selected preview screenshots are [light home](../../artifacts/theme-amber-minimal-light.png), [dark home](../../artifacts/theme-amber-minimal-dark.png), [light Level 1: Zen](../../artifacts/curriculum-amber-minimal-light.png), [dark Level 1: Zen](../../artifacts/curriculum-amber-minimal-dark.png), [light mobile drawer](../../artifacts/drawer-amber-minimal-light-mobile.png), and [dark mobile drawer](../../artifacts/drawer-amber-minimal-dark-mobile.png). All three candidates were previewed with the same compact shadcn `base-nova` components and Geist font. The comparison found Amber clean and legible, with strong dark contrast and orange action states.

**Current authorization:** this document is an implementation plan only. It does not authorize product-source implementation. Seek separate approval before making the proposed product changes unless a later task expressly authorizes them. Amber Minimal is the selected direction; applying its tokens still requires that authorization. Do not change project configuration or add dependencies.

## Ordered implementation plan

1. **Make theme tokens single-source.** Keep `src/app/styles/theme.css` as the canonical home for the `:root` and `.dark` theme variables. `src/app/styles/index.css` already imports it and must retain the Tailwind `@theme inline`, Geist font mapping, and base-layer mapping. Remove only duplicated token declarations there; preserve the mappings and CSS import order required to expose tokens.
2. **Apply the complete Amber Minimal palette.** Add the full official light and dark token sets to the canonical theme file, including background/foreground, card/popover, primary/secondary, muted/accent, destructive, border/input/ring, chart, and sidebar families. Preserve Geist, Base Nova component styling, and existing app layout. Apply the official radius token if the preset defines one; do not change component recipes. Do not add packages or alter configuration.
3. **Correct light-mode focus contrast.** The Amber source light ring measures about 2.15:1 against white. Adjust only the shared `--ring` token by the smallest amount needed to reach at least 3:1 against the adjacent surfaces where focus appears (including white/light background and input surfaces). Document this intentional deviation from the preset. Verify actual computed foreground/background pairs; do not infer compliance from the palette name. Check dark mode as well.
4. **Add a keyboard skip link.** In `src/app/routes/__root.tsx`, give `<main>` a stable target ID and place a skip link before the shared header. Make it visible on keyboard focus, with its focus style using the verified shared ring.
5. **Replace starter branding with approved copy.** Set the document title in `src/app/routes/__root.tsx` and the existing text wordmark in `src/app/layouts/header/header.tsx` to “Dog Training Levels.” Keep the existing icon and text treatment; do not design or add a new logo asset.
6. **Replace placeholder About/Profile content and expose Profile navigation.** Update `src/pages/about/ui/about-page.tsx` and `src/pages/profile/ui/profile-page.tsx` with product-facing copy that describes the curriculum and account profile. Add a Profile link in `src/app/layouts/header/header.tsx` only for authenticated users; the existing `MobileDrawer` reuses this link list. Do not add a password-reset flow, new account controls, or rewrite authentication.
7. **Restore visible keyboard focus on full-card links.** In `src/pages/curriculum/ui/curriculum-section-index-page.tsx`, `curriculum-article-page.tsx`, and `curriculum-page-footer.tsx`, replace the bare `focus-visible:outline-none` behavior with a clear semantic ring/border on the full clickable card link. Use the adjusted shared ring token and verify focus by keyboard on all three surfaces.
8. **Keep cleanup small.** Optionally replace `space-y-2` with `flex flex-col gap-2` in `src/pages/home/ui/home-page.tsx`, following the local shadcn styling rule. Avoid broader component refactors; the existing shared wrappers already use semantic tokens and the existing curriculum state has distinct hydration, URL-hash, and user-toggle behavior.

Password reset is deferred. No new auth controls, account flow, theme switch, or new logo are in this plan.

## Acceptance criteria

- The full Amber Minimal light and dark tokens render in the existing Base Nova/Geist application; only the shared light-mode ring is adjusted for contrast if needed.
- Verify actual contrast ratios for body text, muted text, links, selected/active states, progress, completion states, borders, and focus indicators in both modes. Text should meet applicable text contrast; focus indicators and non-text state cues should reach at least 3:1 against adjacent colors. Do not rely on a named palette or token label as evidence.
- At desktop and 390px mobile widths, inspect the sign-in/sign-up form, dense Level 1: Zen page, open mobile curriculum drawer, sidebar, cards, and footer in both modes. Confirm text remains visible, no content is clipped, and there is no horizontal page overflow.
- Verify keyboard focus and navigation through the skip link; section-index cards; theory/article and previous/next footer links; curriculum step controls; global/mobile navigation; and the mobile drawer. Escape continues to close the curriculum drawer and return focus to its trigger.
- Authenticated behavior still works: sign-in/sign-up routes to Level 1: Zen, progress persists across reload, and the header Profile link opens the protected profile route. Existing About/Profile routes remain navigable.
- Add only durable Playwright tests for user-visible outcomes. Follow `docs/engineering/TESTING.md`: page objects own navigation and interactions, while test files assert outcomes. Preserve the existing Escape drawer test in `tests/browser/curriculum-levels.test.ts`; remove one-off screenshot capture harnesses after capturing review artifacts.

## Setup and validation handoff

Use the documented local preview setup in [`docs/SETUP.md`](../SETUP.md). Install after pulling changes and before implementation. Apply migrations before testing authentication; preview D1 was previously uninitialized and caused signup HTTP 500s.

```bash
vp install
CLOUDFLARE_ENV=preview vp build
vpr db:migrate --local --env preview
```

Run the worktree’s own preview on an unused port, not the default port if it may be serving another checkout. For example, set local-only `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` for `http://localhost:4187`, then start `vp preview --port 4187`. Point Playwright at that same origin with `PLAYWRIGHT_BASE_URL=http://localhost:4187`; this config intentionally disables its managed webServer when the override is present. Do not reuse or stop a server from another worktree.

Run and report each result:

```bash
vp check
vp test
vpr check:full
vpr check:ci
vp test --coverage
vpr test:browser
```

Run browser projects Chromium, Firefox, and WebKit when available. Record an unavailable browser as a limit. During this review, Chromium passed 34/34 and coverage passed 403/403 at 100%; `vpr check:full` and `vpr check:ci` both stopped at the formatter check with the same 18 files reported. Recheck those existing failures, do not format unrelated files as part of this scope, and report whether the baseline persists.

## Historical theme evidence

The initial full-token comparison ranked Nature first, Amber Minimal as the neutral alternative, and Kodama Grove weakest. The user’s Amber choice now takes precedence over that ranking. Kodama had weaker muted/selected-state emphasis; Nature’s warm-paper/green surfaces suited the training content. The 24 desktop/mobile light/dark captures remain in [`artifacts/`](../../artifacts/). Desktop full-page screenshots place the sticky header mid-document because of capture behavior; they are palette evidence, not reliable header geometry. Mobile drawer captures were inspected with no clipping.

Contrast calculations and browser previews are useful review evidence, not a full WCAG audit. Confirm computed token pairs and keyboard focus against the final implementation.

## Applicable guidance

- [`docs/engineering/ARCHITECTURE.md`](../engineering/ARCHITECTURE.md) — shared layouts, routes, and placement.
- [`docs/engineering/CODING_STANDARDS.md`](../engineering/CODING_STANDARDS.md) — page components and component props.
- [`docs/engineering/TESTING.md`](../engineering/TESTING.md) and [Playwright best practices](../../.agents/skills/playwright-best-practices/SKILL.md) — POM and browser checks.
- [shadcn skill](../../.agents/skills/shadcn/SKILL.md) and [styling rules](../../.agents/skills/shadcn/rules/styling.md) — preserve Base Nova composition and use semantic tokens.
- [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) — skip links, focus, and contrast checks.
- [shadcn theming guide](https://ui.shadcn.com/docs/theming) — CSS-variable theme customization.
