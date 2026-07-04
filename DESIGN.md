# HydraPump Design Suite — Design Specification

This documents the design system as implemented in this codebase. It reflects `design_handoff_hydrapump/design-references/DESIGN_CONTRACT.md` (the original authority) translated into the actual Tailwind 4 tokens/utilities and React components shipped here. When the two disagree, the reference folder wins and this file should be updated to match.

Language: all UI copy, labels, and seed/dummy data are **Spanish**. All code identifiers, types, and comments are **English**.

## 1. Design tokens

All tokens are CSS custom properties in `src/app/globals.css`, re-declared under `[data-theme="light"]` and `[data-accent="cyan|emerald|amber"]`, and exposed as Tailwind utilities via `@theme inline` (so `bg-surface`, `text-dim`, etc. stay reactive to the attributes on `<html>`).

### Color roles
| Role | Token(s) | Tailwind utility |
|---|---|---|
| App background | `--bg` | `bg-bg` |
| Surface elevation (3-step) | `--surface`, `--surface-2`, `--surface-3` | `bg-surface`, `bg-surface-2`, `bg-surface-3` |
| Borders | `--border`, `--border-strong` | `border-border`, `border-border-strong` |
| Text (3-step) | `--text`, `--text-dim`, `--text-faint` | `text-text` (default), `text-text-dim`, `text-text-faint` |
| Primary / accent | `--primary`, `--primary-hover`, `--primary-fg`, `--primary-soft`, `--primary-ring` | `bg-primary`, `hover:bg-primary-hover`, `text-primary-fg`, `bg-primary-soft`, arbitrary `shadow-[0_0_0_2px_var(--primary-ring)]` |
| Success / completed | `--green`, `--green-soft`, `--green-fg` | `text-green`, `bg-green-soft`, `text-green-fg` |
| Warning / cached | `--amber`, `--amber-soft` | `text-amber`, `bg-amber-soft` |
| Destructive | `--danger`, `--danger-hover`, `--danger-soft`, `--danger-ring` | `text-danger`, `hover:bg-danger-hover`, `bg-danger-soft` |
| Chart plot accents | `--data-blue`, `--data-green`, `--data-orange`, `--chart-plot`, `--grid` | `text-data-blue` / used directly as SVG `stroke`/`fill` |
| Section tints (casing/tubing) | `--tint-blue`, `--tint-amber`, `--tint-green` | inline `style={{ background: ... }}` (cycled per section index) |
| Elevation shadow | `--shadow` | `shadow-app` |

Accent (`indigo` default, `cyan`, `emerald`, `amber`) only overrides the primary-* variables. There is no accent picker in the UI yet — `ThemeProvider` (`src/components/theme.tsx`) supports and persists an accent value, ready to be wired to a settings control later.

### Typography
- UI text: **IBM Plex Sans** (400/500/600/700), loaded via `next/font/google` as `--font-sans-ibm` → Tailwind `font-sans`.
- All numeric/tabular data (inputs, tables, chart axes, stat values): **IBM Plex Mono** (400/500/600) → Tailwind `font-mono`. Applied explicitly per element; it is not the ambient font.
- Common one-off sizes not on Tailwind's default scale are used as arbitrary values throughout (`text-[13.5px]`, `text-[10.5px]`, `text-[11.5px]`, `text-[23px]` for page titles, `text-[26px]` for stat numbers).

### Radii
| Use | Value | Utility |
|---|---|---|
| Inputs / unit fields | 6–7px | `rounded-[6px]` / `rounded-[7px]` |
| Data-entry group card | 11px | `rounded-[11px]` |
| Dashboard/canvas card | 12px | `rounded-card` |
| Buttons | 9–11px | `rounded-[9px]` / `rounded-[10px]` / `rounded-[11px]` |
| Pills / tabs | full | `rounded-full` |
| Modals | 16px | `rounded-[16px]` |

### Density scale (reused verbatim everywhere)
- Data-entry group card: header padding `10px 14px`, body padding `6px` (`GroupCard`).
- Input row: padding `6px 10px`, radius `7px` (`InputRow`).
- Panel padding: `18px 20px 24px` (workspace left/right columns).
- Card gap inside panels: `14px`–`16px`.
- Sidebar width: `238px`. Explorer header height: `60px`. Workspace navbar height: `58px`. Progress tab bar: `11px 22px`.

### Shadows
- Elevation: `--shadow` → `shadow-app` (dark `0 18px 50px rgba(0,0,0,.55)`, light `0 18px 50px rgba(15,23,42,.16)`).
- Primary button glow: `shadow-[0_5px_16px_var(--primary-ring)]` (or `0_6px_18px_...` for larger CTAs).
- Focus ring on inputs: `focus:shadow-[0_0_0_2px_var(--primary-ring)]` (danger variant swaps in `--danger-ring`).
- Active pill/tab ring: `shadow-[0_0_0_3px_var(--primary-ring)]`.

## 2. Core components

### `UnitField` (`src/components/workspace/UnitField.tsx`)
The MUI-endAdornment-style numeric input. A single bordered wrapper (`w-[150px]` by default, `inline-flex`, `bg-surface-3`, `border-border`, `rounded-[6px]`, `overflow-hidden`) contains a borderless transparent `<input>` (`flex-1`, left-aligned, mono 13px/500) and a content-hugging unit "addon" span pinned right (`bg-surface-2`, left border, mono 10.5px, `text-faint`, `pointer-events-none`). Numbers all share one left edge; units all hug one right edge regardless of unit-string length (`°F` vs `scf/stb` vs `ppm Cl⁻`). Focus state moves the ring to the wrapper (`focus-within:border-primary` + ring). An `error` prop swaps the wrapper border/ring to danger colors. **Do not** replace this with a fixed-width unit chip or an absolutely-positioned suffix — both break on short/long units.

### `InputRow` (`src/components/workspace/InputRow.tsx`)
Label + field row (`flex justify-between`, `p-[6px_10px]`, `rounded-[7px]`, `hover:bg-surface-2`). An `error` prop switches to a column layout with a `--danger-soft` background and an inline alert-icon message below the field (used for the one "required field" state in the Completación tab).

### `GroupCard` (`src/components/workspace/GroupCard.tsx`)
Wraps a set of `InputRow`s: `rounded-[11px]` border, `surface-2` header (`p-[10px_14px]`, 11px uppercase label, optional small primary bullet square), `p-[6px]` body.

### `SelectField` (`src/components/workspace/SelectField.tsx`)
Same visual language as `UnitField`'s input but for `<select>`; supports a `disabled` variant (dimmed, `cursor-not-allowed`) used for the "locked by correlation" Rs field in Fluidos y PVT.

### `EmptyPanel` (`src/components/workspace/EmptyPanel.tsx`)
The single reusable "no data yet" placeholder, used in all four required spots (survey, trajectory, IPR chart, PVT chart). Fixed `h-[300px]`, `border-dashed`, diagonal hatch background (`repeating-linear-gradient(45deg, var(--surface) 0 9px, var(--surface-2) 9px 10px)`), 48px icon tile, title (13.5px/600), message (11.5px), and a primary CTA button with a pencil icon. Props: `title`, `message`, `cta`, `onCta`.

### `Modal` (`src/components/Modal.tsx`)
Shared overlay (`fixed inset-0`, `rgba(5,8,13,.62)` + `backdrop-blur-[4px]`, `animate-fade`) and card (`rounded-[16px]`, `shadow-app`, `animate-pop-in`). Configurable via props: `maxWidthPx`, `zIndex` (new-project 50, survey 60, size-picker 70 — matches original stacking), `align` (`center` | `start`, the size picker anchors near the top), `scroll` (`inner` = header/body/footer each manage their own scroll region; `outer` = the whole card scrolls, used by the new-project modal).

### Buttons (no shared component — classes composed inline per usage)
- **Primary**: `bg-primary text-primary-fg`, `rounded-[9-11px]`, `shadow-[0_5-6px_16-18px_var(--primary-ring)]`, `hover:bg-primary-hover`.
- **Secondary**: `bg-surface-2 border border-border`, `hover:border-border-strong`.
- **Destructive**: transparent, `border-danger text-danger`, `hover:bg-danger hover:text-white`.
- **Pill/tab**: `rounded-full`; selected = `bg-primary-soft border-primary` + 3px primary ring; locked = `bg-surface-2 text-text-faint cursor-not-allowed`.

### Icons (`src/components/icons.tsx`)
All Feather-style inline SVGs (24×24 viewBox, `stroke="currentColor"`, round caps/joins, stroke widths 1.8–3.2 matched per original usage). No icon library dependency.

## 3. Screens

### Project Explorer (`/`)
Fixed 238px sidebar (logo lockup, grouped nav with active-item soft-primary background + inset ring, pinned "Nube conectada" status card) + flexible main column (60px header with workspace-switcher button, search input, theme toggle, user chip; scrollable body with page title, 4-up stat card grid, filter pills, and a CSS-grid projects table `grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_150px_132px_100px]`).

### Workspace (`/workspace`)
58px navbar (back button, project identity, cloud-save status, theme toggle) → chevron progress-tab bar (Completación ✓ / Fluidos y PVT ✓ / IPR y OPR active / Cálculos locked) → 45/55 split: left column scrolls (data-entry forms per active tab), right column is a fixed-width canvas stack (charts/tables per active tab) on a `surface-2` background.

## 4. State & interactions

- **Theme**: `dark`/`light`, toggled app-wide via `data-theme` on `<html>`, persisted to `localStorage`, restored pre-hydration by an inline script in `layout.tsx` (no flash).
- **Accent**: `indigo` (default) / `cyan` / `emerald` / `amber`, same persistence mechanism, no UI picker yet.
- **Explorer → Workspace**: "Abrir" on a project row navigates to `/workspace` (seeded data). "Crear Nuevo Proyecto" → modal → "Continuar" navigates to `/workspace?new=1` (empty state: `surveyLoaded`/`iprReady`/`pvtReady` all `false`, so all four `EmptyPanel`s render). Casing/tubing seed sections are present either way — they aren't gated by the empty-state flag, matching the original.
- **Progress tabs**: `activeTab` state (`completion | fluids | ipr | calc`, default `ipr`). Only the locked `calc` tab is unclickable. The Completación/Fluidos "completed" check icons are static (not derived from readiness state) — this is a fixed demo scenario in the original design, not a computed status.
- **IPR calculation**: clicking "Ejecutar Cálculo IPR" runs `idle → running` immediately, `→ done` after 1.3s (sets `iprReady: true`), `→ idle` after 4.4s from the original click (both timers scheduled together, not chained).
- **Casing/Tubing**: up to 3 sections each, labeled Superior/Intermedio/Inferior (or "Tramo único" when just one), cycling through blue/amber/green tints and accents. "Agregar tramo" is disabled and dimmed at the 3-section cap. Remove button only shows when more than one section exists. The size button opens a shared, kind-aware (`casing`/`tubing`) search-filterable catalog modal.
- **Survey**: an "Editar survey direccional" button opens a modal with editable MD/TVD columns (read-only HD/ángulo) over the full 20-station dataset; "Guardar survey" sets `surveyLoaded: true` and closes it.

## 5. Charts (`src/components/workspace/canvas/`)
Hand-rolled inline SVG (no charting library) so stroke/grid/label styling stays token-driven:
- `TrajectoryChart` — dual-axis MD/HD vs TVD polyline plot (green = trajectory, blue = inclination angle).
- `IprChart` — Vogel IPR curve with a static reservoir pressure line and a marked bubble point (Pb).
- `PvtChart` — Bo/Rs/μo vs pressure, normalized 0–1, with a dashed Pb marker.

Each chart hardcodes its own pixel-space margins and tick arrays matching the original prototype's math; changing the underlying data ranges requires updating those constants in the same file.
