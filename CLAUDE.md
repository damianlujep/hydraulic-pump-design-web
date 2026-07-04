# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **yarn** (`yarn.lock` is authoritative — don't run plain `npm install`, it rewrites the lockfile with npm registry URLs and desyncs `node_modules`).

```bash
yarn dev          # start dev server (Turbopack) on :3000
yarn build        # production build (also runs the TypeScript check)
yarn start        # run the production build
yarn lint         # eslint (eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit  # typecheck only, no build
```

There is no test suite/framework configured in this project.

If the dev server ever serves pages with zero CSS applied or throws `SyntaxError: Unexpected end of JSON input` / `Error: Manifest file is empty`, it's a stale Turbopack dev cache — stop the process, `rm -rf .next`, and restart `yarn dev`. This has been observed after many rapid file edits while the dev server stays running.

## Architecture

This is a Next.js App Router rebuild of a Claude-Design HTML prototype (see `design_handoff_hydrapump/`) — a data-dense engineering tool for designing hydraulic pumping systems (Jet & Piston lift) for oil wells. UI copy is Spanish; code identifiers are English.

### Two screens, real routes
- `/` — **Project Explorer** (`src/app/page.tsx`): landing/project list, server-rendered except for the theme toggle and the new-project modal.
- `/workspace` — **Workspace** (`src/app/workspace/page.tsx` → `WorkspaceScreen`): the actual pump-design engine, entirely client-rendered. `?new=1` on the URL means "just created" — it opens with empty data (all four canvas panels show `EmptyPanel` placeholders) instead of the seeded example project. This flag is read via `useSearchParams`, so `WorkspacePage` wraps `WorkspaceScreen` in `<Suspense>`.

### Design-token theming (do not bypass)
The entire visual system is CSS custom properties defined in `src/app/globals.css`, redeclared under `[data-theme="light"]` and `[data-accent="cyan|emerald|amber"]` attribute selectors on `<html>`, then re-exposed as Tailwind v4 utilities via `@theme inline` (`bg-surface`, `text-dim`, `border-strong`, `rounded-card`, `shadow-app`, etc.). Because `@theme inline` resolves to `var(--…)` instead of baking in a value, theme/accent switching works purely by flipping the `data-theme`/`data-accent` attributes — no JS color maps. `ThemeProvider` (`src/components/theme.tsx`) owns that state, persists to `localStorage`, and a blocking inline script in `layout.tsx` sets the attributes before hydration to avoid a flash.

**When adding UI, reuse existing tokens/utilities — never invent a new hex color or hardcode light/dark values.** Off-Tailwind-scale spacing/radii/font-sizes from the original design (e.g. `w-[150px]`, `rounded-[11px]`, `text-[13.5px]`) are intentional and pervasive; match them rather than rounding to the default scale.

### Workspace state
All workspace state (active tab, casing/tubing sections, calc status, modals) lives in one `useReducer` in `src/components/workspace/reducer.ts`, exposed via React context in `WorkspaceContext.tsx` (`useWorkspace()` hook). `WorkspaceLeftPanel` and `WorkspaceRightCanvas` switch on `state.activeTab` (`'completion' | 'fluids' | 'ipr' | 'calc'`) to pick which form/canvas to render — the 4th tab (`calc`) is permanently locked and has no panel. The three unlocked tabs are independent; the "check" icon on the Completación/Fluidos tabs in `ProgressTabs.tsx` is a static per-step icon (not derived from data-readiness state), matching the original design's fixed demo scenario.

The "Ejecutar Cálculo IPR" button's idle → running → done → idle sequence is driven by two `setTimeout`s fired from `WorkspaceContext`'s `runCalc()` (not chained — both scheduled from the same click), not from the reducer itself, since reducers must stay pure.

### Shared atoms encode the design contract
`src/components/workspace/{UnitField,InputRow,GroupCard,SelectField,EmptyPanel}.tsx` are the load-bearing primitives — nearly every data-entry row and the four empty-state panels are built from them. `UnitField` in particular implements the "MUI endAdornment" pattern from the design spec: a single bordered wrapper (not a fixed-width chip) so numbers share one left edge and units hug their own right edge regardless of unit string length. Modifying these affects the whole app; don't create parallel one-off input styles.

`src/components/Modal.tsx` is the shared overlay/card wrapper (fade + pop-in animation, configurable width/z-index/alignment/scroll mode) used by all three modals (new-project, survey editor, casing/tubing size picker).

### Reference data
`src/lib/data.ts` holds the casing/tubing catalogs, directional survey stations, and seed projects — copied verbatim from the original prototype's logic block. `src/components/workspace/canvas/{TrajectoryChart,IprChart,PvtChart}.tsx` are hand-rolled inline SVG charts (no charting library) porting the original prototype's pixel-space math (margins, tick arrays, the Vogel IPR curve) 1:1; if the underlying data or chart size changes, the tick arrays and margins are hardcoded per component and must be updated together.

### Icons
All icons are inline SVGs in `src/components/icons.tsx` (no icon library dependency) — copied from the Feather-style paths in the original design so stroke widths/sizes match exactly.

### Source of truth for visual fidelity
`design_handoff_hydrapump/design-references/` contains the original prototype (`HydraPump Design Suite (standalone).html`, open-in-browser), the design token/density contract (`DESIGN_CONTRACT.md`), and the CSS→Tailwind migration plan (`TAILWIND_MIGRATION.md`). When in doubt about a spacing, color, or interaction detail, check there before guessing.

**`DESIGN.md`** (repo root) documents the design system as actually implemented in this codebase — token-to-Tailwind-utility mapping, component specs, screen layouts, and the state/interaction model. Read it before any styling or new-component work.
