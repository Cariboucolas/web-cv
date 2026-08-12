# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Build for production (Firebase preset)
pnpm generate     # Static site generation
pnpm preview      # Preview production build
pnpm deploy       # Deploy to Firebase Hosting
```

Linting/formatting uses **Biome** (not ESLint/Prettier):

```bash
pnpm biome check .        # Lint and check formatting
pnpm biome format --write .  # Auto-format
pnpm biome lint --write . # Auto-fix lint issues
```

## Tests: a deliberate derogation

**This project has no test suite, and that is a decision rather than an omission.** It overrides any global rule
demanding unit, integration and E2E coverage — do not scaffold a test suite here, and do not treat its absence as
technical debt to repay.

The reasoning: this is a single-page site whose risk is almost entirely visual. What breaks here is pixels, and the
headless screenshot procedure at both breakpoints (see **UI verification** below) is the regression test that actually
matches that risk. A unit suite over presentational components would cost maintenance and catch nothing that a
screenshot does not.

The one place that would genuinely repay tests is `app/utils/career.ts` — three pure date functions with an anniversary
edge case already documented in their comments. If a fourth arrives, write tests for that module alone.

`pnpm typecheck` and `pnpm biome check` are the automated gates, and CI enforces both.

## Architecture

This is a **Nuxt 4** single-page CV/portfolio site deployed to Firebase Hosting.

### Key tech decisions

- **Vuetify 3** for UI components — registered globally via `app/plugins/vuetify.ts`. Primary color is `#42b883` (Vue
  green).
- **No Tailwind** — removed on 2026-08-11. The project only used six utility occurrences (`w-full`, `sm:hidden`,
  `hidden sm:block`) across two files, now replaced by `.section-full`, `.mobile-only` and `.desktop-only` in
  `app/assets/css/main.css`, at the 640px threshold Tailwind's `sm` breakpoint used. The part of Tailwind's preflight
  the layout actually depended on — `box-sizing` and `margin: 0` on text elements — was ported into the same file.
  Verified by pixel diff of the `pnpm generate` artifact at both breakpoints: identical rendering. Without that reset,
  the project cards gained 137px at 1440px. `postcss` in `nuxt.config.ts` now carries autoprefixer alone.
- **`@nuxtjs/i18n`** — bilingual FR/EN support. Default locale is `fr`. Translation strings live in `i18n/locales/fr.json`
  and `i18n/locales/en.json` (v10 forces `restructureDir: 'i18n'` and resolves `langDir` relative to it). Use `useI18n()` and `$t('key')` in components. Strategy is `no_prefix` (no URL prefix for
  locale).
- **`@nuxt/icon`** with `@iconify-json/material-symbols` — use `<Icon name="material-symbols:..." />` for icons.

### Component structure (Atomic Design)

```
app/components/
  atoms/       # DeviceFrame, IconButton, LanguageIndicator, ProjectBadge
  molecules/   # AboutSection, ExperienceCard, HeaderBar, NavigationIcon, ProjectModal, ProjectShowcase
  organisms/   # CharacterPanel, ExperiencesSection, ProfileSection, ProjectsSection, SkillsSection
```

Nuxt auto-imports components by path — `AtomsLanguageIndicator` maps to `app/components/atoms/LanguageIndicator.vue`,
`MoleculesNavigationIcon` to `app/components/molecules/NavigationIcon.vue`, etc.

### Page structure (`app/pages/index.vue`)

The single page stacks the section organisms (`ProfileSection`, then `experiences`/`projects`/`skills`/`about`) inside
one scrolling column. Navigation is anchor-based: `MoleculesHeaderBar` links to `#experiences`, `#projects`, `#skills`
and `#about`, and each `<section>` in `app/pages/index.vue` carries the matching `id`. There is no `activeSection`
state or section-change event — `HeaderBar` also owns language switching directly via `useI18n()` (`locale.value`), with
no event bubbled up to the page.

**The order is deliberate and the anchors must follow it.** It is the order a recruiter reads a CV in — who are you,
where have you worked, what have you shipped. `about` closes the page because it is the least scannable block on the
site, and whoever reaches it is already interested. Reordering the sections without reordering the header links makes
the navigation announce an order the page does not keep.

### Design system

Since the lot 1 redesign, three typographic roles are defined as CSS variables in `app/assets/css/main.css`:

- `--font-display` (Jost) — section titles and hero text
- `--font-body` (Mona Sans) — running text
- `--font-mono` (JetBrains Mono) — dates, durations, tech stack, labels

Vertical rhythm follows an explicit spacing scale, also in `app/assets/css/main.css`:

| Variable           | Desktop | ≤640px                   |
|--------------------|---------|--------------------------|
| `--space-section`  | 64px    | 48px                     |
| `--space-column`   | 48px    | 32px ≤900px, 24px ≤640px |
| `--space-entry`    | 32px    | 16px                     |
| `--space-title`    | 16px    | 16px                     |
| `--space-grid`     | 16px    | 16px                     |
| `--space-inner-md` | 8px     | 8px                      |
| `--space-inner-sm` | 4px     | 4px                      |

The guiding principle: no bordered card wraps the major sections anymore — spacing alone structures the page, with a 4:1
ratio between what separates (`--space-section`) and what groups (`--space-title`). Cards survive only where they signal
an action (project cards, which open `ProjectModal`) or where hover doesn't exist (experience cards on mobile and touch
devices, gated on `@media (hover: none)` rather than a width, so touch tablets get them too).

Experience cards have **no hover state at all** on desktop — deliberately. An outline appearing under the cursor
promises an action the card doesn't offer, since nothing inside it is clickable. Don't reintroduce one.

See `docs/superpowers/specs/2026-07-30-refonte-ui-lot1-design.md` for the full rationale.

The project showcase wraps screenshots in a device frame (`DeviceFrame`), picked from the `Project` model's existing
`orientation` field: phone for `portrait`, browser for `landscape`. On the desktop grid the frame is tilted by
`--showcase-tilt` and cropped by the card; inside `ProjectModal` it sits upright. Frame proportions use container query
units (`cqw`), so one component scales from 156px on a card to 458px in the modal with no size prop.

Screenshots are served as WebP at two widths, named `<base>-<width>.webp` — so the `images` field carries **no suffix
and no extension**. Widths are 380/570 for portrait and 560/940 for landscape, hardcoded in `ProjectShowcase`: a project
added with mismatched variants 404s silently. Regenerate variants with `cwebp`, never `sips` (see the project memory on
WebP conversion).

The `Project` model lives in `app/types/project.ts` and is imported explicitly by `ProjectsSection` and `ProjectModal`
(`import type { Project } from '~/types/project'`). Nuxt auto-imports components but not types, so the interface was
previously copied into both files and the two copies had already drifted apart in their documentation without
`pnpm typecheck` noticing — each stayed locally coherent. Add fields there, not in a component.

See `docs/superpowers/specs/2026-07-30-vitrine-projets-design.md` for the full rationale.

### Content

The copy is written for recruiters first, and the site must not settle the employment question — a long contracting
mission and a permanent role are both open. That single principle decides most content calls: no day rate on the page,
no "freelance" in the opening line, a call to action that names the project rather than the contract.

Two rules keep the sections from repeating each other. **Projects carries the result and the numbers; experiences
carries the trajectory and the client context.** And **the skills section is the exhaustive inventory**, so an
experience card lists only what characterised that mission. Both rules exist because duplicated facts drift: the same
project once claimed the KYC flow in one section and the fundraise in the other, with neither typecheck nor lint nor
screenshot able to notice.

When a fact changes, grep for it rather than trusting memory of where it was written.

See `docs/superpowers/specs/2026-08-12-refonte-contenu-recruteurs-design.md` for the full rationale.

### Styling conventions

- Dark background (`#0a0a0a` page background, `#111`/`#1a1a1a`/`#1e1e1e` for cards and inset panels)
- Emerald green accent (`#42b883`) for highlights — matches Vue/Nuxt brand colors
- Scoped `<style scoped>` in each component; global styles and CSS variables in `app/assets/css/main.css`
- Prefer Vuetify `v-*` components for structure. For spacing and layout, use scoped CSS and the spacing scale variables
  — there is no utility framework anymore

### Deployment

- Build with `pnpm build` (uses `--preset=firebase`)
- Deploy with `pnpm deploy` (runs `firebase deploy --only hosting`)
- Firebase config is in `firebase.json`

## Naming conventions

Never use single-letter or abbreviated variable names. Use domain-meaningful names (e.g. `steamAppSummary` not `s`,
`rawPlayerRecord` not `r`), including in map/filter/reduce callbacks and test fixtures.

## Dev servers

Before starting a Nuxt/Vite dev server, check for existing ones: `lsof -ti:3000-3010` and `pgrep -fl nuxt`. Kill orphans
before starting a new one. Never leave more than one dev server running at the end of a task, and always report the
exact port the user should open.

## UI verification

For any visual/CSS change, verify with a headless screenshot before claiming it is fixed, and check BOTH mobile and
desktop breakpoints. If a screenshot appears to show no problem, do not conclude the bug does not exist — add temporary
outlines/background colors to candidate elements and re-screenshot.

## Git & GitHub

This repo's remote uses HTTPS while `gh` is authenticated over SSH. Use `gh` for PR operations and `git push` only after
confirming remote protocol with `git remote -v`. Standard flow for finished work: commit → push → `gh pr create` →
verify CI is green before reporting done.

## Working style

When the user describes a concrete change (spacing, tokens, copy), implement it immediately and show the result — do not
wait for design approval unless the request is explicitly ambiguous or architectural.

## Toolchain

Node is managed by volta and pinned via `.nvmrc`. Always run `node -v` before installing or building; do not use bare
`npx` (a stale pnpm shim previously broke it) — prefer `volta run npx` or the project's package scripts.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`Cariboucolas/web-cv`), driven through the `gh` CLI. See
`docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` and one `docs/adr/` at the repo root, both created lazily. See
`docs/agents/domain.md`.
