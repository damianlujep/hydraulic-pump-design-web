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
| Chart plot accents | `--data-blue`, `--data-green`, `--data-orange`, `--danger` (Pb line), `--amber` (design point), `--text-faint` (transition line), `--chart-plot`, `--grid` | Read via a JS palette bridge (`useChartPalette`, see §5), not applied directly as CSS — the charts render to `<canvas>`, which can't resolve `var(--…)` |
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
| Modals / auth card | 16px | `rounded-[16px]` / `rounded-2xl` |

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

### `EmptyPanel` (`src/components/workspace/atoms/EmptyPanel.tsx`)
The single reusable "no data yet" placeholder — used in the four Workspace canvas spots (survey, trajectory, IPR chart, PVT chart) and, with a different `title`/`message` per situation, the Explorer's empty project list (see `ProjectsTable` in §3). Fixed `h-[300px]`, `border-dashed`, diagonal hatch background (`repeating-linear-gradient(45deg, var(--surface) 0 9px, var(--surface-2) 9px 10px)`), 48px icon tile, title (13.5px/600), message (11.5px), and an optional primary CTA button with a pencil icon. Props: `title`, `message`, `cta?`, `onCta?` — omit both for a purely informational state (no button renders).

### `Modal` (`src/components/Modal.tsx`)
Shared overlay (`fixed inset-0`, `rgba(5,8,13,.62)` + `backdrop-blur-[4px]`, `animate-fade`) and card (`rounded-[16px]`, `shadow-app`, `animate-pop-in`). Configurable via props: `maxWidthPx`, `zIndex` (new-project 50, survey 60, size-picker 70, change-password 70, `UserMenu`'s logout confirmation 100 — matches original stacking), `align` (`center` | `start`, the size picker anchors near the top), `scroll` (`inner` = header/body/footer each manage their own scroll region; `outer` = the whole card scrolls, used by the new-project modal), `sheetBelowMd?: boolean` (default `false`) — when set, the card becomes a slide-up bottom sheet below `md` (top radius 24, grab handle chrome is the caller's responsibility, new `animate-slide-up` keyframe) and the ordinary centered dialog at `md`+; only `ChangePasswordDialog` uses this today.

### `UserMenu` (`src/components/explorer/UserMenu.tsx`)
The header account dropdown, mounted in the Explorer header, the Workspace navbar, and the Mi cuenta header (not screen-specific despite its folder). Trigger button (avatar + name/role + chevron, or `variant="compact"` for avatar+chevron only — built for a future mobile layout, unused today) opens a 270px `absolute right-0` panel: identity header (avatar, name, role, mono email), grouped "Cuenta"/"Sistema" items — "Mi perfil" navigates to `/account`; `Configuración de cuenta`, `Preferencias de notificación`, `Ayuda y soporte`, `Atajos de teclado ⌘K` are still no-ops that just close the menu — then a `text-danger` "Cerrar sesión" row. Opens with the `animate-menu-pop` keyframe (downward pop, distinct from `Modal`'s upward `animate-pop-in`). Escape (via the shared `useEscapeKey` hook, `src/hooks/useEscapeKey.ts`) and an invisible `fixed inset-0` backdrop close the panel. Selecting "Cerrar sesión" closes the panel and opens a `Modal`-based confirmation dialog before calling the real `useLogout()`.

### `AccountCard` / `DataRow` (`src/components/account/AccountCard.tsx`)
A second, visually distinct card shell used only on the Mi cuenta screen — **not** a duplicate of `GroupCard` (§2 below is `GroupCard`'s own entry): `AccountCard` has a bolder, non-uppercase 13px title and looser `p-[13px_18px]`/`px-[18px]` padding, matching the design handoff's dashboard-card spec, versus `GroupCard`'s compact uppercase-label data-entry treatment. `DataRow` (`{ label, value, mono? }`) is its paired read-only key/value row (`py-[11px]`, faint label left, `text-text`/mono value right, `—` fallback). Use `GroupCard` for workspace data-entry cards, `AccountCard` for Mi cuenta's summary cards — don't merge the two.

### Buttons (no shared component — classes composed inline per usage)
- **Primary**: `bg-primary text-primary-fg`, `rounded-[9-11px]`, `shadow-[0_5-6px_16-18px_var(--primary-ring)]`, `hover:bg-primary-hover`.
- **Secondary**: `bg-surface-2 border border-border`, `hover:border-border-strong`.
- **Destructive**: transparent, `border-danger text-danger`, `hover:bg-danger hover:text-white`.
- **Pill/tab**: `rounded-full`; selected = `bg-primary-soft border-primary` + 3px primary ring; locked = `bg-surface-2 text-text-faint cursor-not-allowed`.

### Icons (`src/components/icons.tsx`)
All Feather-style inline SVGs (24×24 viewBox, `stroke="currentColor"`, round caps/joins, stroke widths 1.8–3.2 matched per original usage). No icon library dependency.

## 3. Screens

### Project Explorer (`/`)
Fixed 238px sidebar (logo lockup, grouped nav with active-item soft-primary background + inset ring, pinned "Nube conectada" status card) + flexible main column (60px header with workspace-switcher button, search input, theme toggle, `UserMenu`; scrollable body with page title, 4-up stat card grid, filter pills, and a CSS-grid projects table `grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_150px_132px_100px]`).

**Filter pills** (`FilterPills.tsx`) — four `scope` filters, one active at a time: "Todos los proyectos" / "Mis proyectos" / "Compartidos conmigo" / "Organización" (`all`/`own`/`shared`/`org`), a row of `<button>`s (`flex gap-[6px]`) left of the "{shown} de {total} proyectos" count (`ml-auto`, `text-text-faint`, `font-mono`). Both states share the pill shape (`px-[13px] py-[6px] rounded-[8px] text-xs`); only fill/border/weight change:
- **Active**: `font-semibold`, `bg-primary-soft`, `text-text`, `shadow-[inset_0_0_0_1px_var(--primary-ring)]` (no border utility — the inset shadow doubles as the ring).
- **Inactive**: `font-medium`, `bg-surface`, `text-text-dim`, `border border-border`, `hover:text-text`.

Clicking a pill sets `?scope=` in the URL (via `useExplorerFilters`) and resets to page 0, same as a new search. There's no "loading" pill state — the count/table skeleton already covers the in-flight fetch.

**Empty project list** (`ProjectsTable.tsx`'s `emptyStateContent`) — the `EmptyPanel` shown when a query returns zero rows reads per the active `q`/`scope` combo, not one generic message:
- **Active search** (`q` set, any scope): "Sin resultados para tu búsqueda" / quotes the term back, suggests trying another term — no CTA.
- **Scope `all`/`own`, no search**: "Aún no hay proyectos" / "Aún no tienes proyectos propios" — the only two variants with a "Crear proyecto" CTA, which opens a second, independent `NewProjectModal` instance via its `renderTrigger` prop (own internal `open` state, same modal component/form as the header's "Crear Nuevo Proyecto").
- **Scope `shared`/`org`, no search**: "Nadie ha compartido proyectos contigo" / "Sin proyectos en tu organización" — informational only, no CTA (a newly created project can't retroactively be shared-with-you or org-visible).

### Workspace (`/workspace`)
58px navbar (back button, project identity, cloud-save status, theme toggle, `UserMenu`) → chevron progress-tab bar (Completación ✓ / Fluidos y PVT ✓ / IPR y OPR active / Cálculos locked) → 45/55 split: left column scrolls (data-entry forms per active tab), right column is a fixed-width canvas stack (charts/tables per active tab) on a `surface-2` background.

### Mi cuenta (`/account`)
Same shell pattern as the Explorer: fixed 238px `Sidebar` (now `active="account"`, highlighting the "Mi cuenta" item added under Recursos) + flexible main column with a page-specific 60px `AccountHeader` (`ArrowLeftIcon` "Regresar al Explorador" secondary button, "Mi cuenta / Perfil" breadcrumb, theme toggle, divider, `UserMenu`) and a scrollable body (`p-[26px_30px_44px]`).

Body, top to bottom: a full-width **identity banner** (`rounded-[14px]`, `linear-gradient(120deg, var(--primary-soft), transparent 62%), var(--surface)` background, 64px initials avatar on the primary gradient, name/role·org/mono email); a mobile-first grid (`grid gap-4 md:grid-cols-2`) of **Información personal** (every `auth/me` field as a `DataRow`), **Seguridad** (one row — lock icon tile, "Contraseña" + masked meta, "Cambiar" button), and **Preferencias** (Tema de la interfaz with a live "Oscuro"/"Claro" label + "Cambiar" button that calls the real `toggleTheme()`, and a read-only Sistema de unidades row); then a full-width **Roles y permisos** card (role pill in the header, an Organización row, and a 2-col ✓/✕ permission grid driven by the static `PERMISSIONS` table in `src/lib/auth/rolePermissions.ts` — illustrative, not enforced).

**Cambiar contraseña** opens as a `Modal` with `sheetBelowMd` (§2 above): centered dialog (470px, lock-icon header, X close, footer with Cancelar/Actualizar contraseña) at `md`+; a full-height bottom sheet (grab handle, "Cancelar" text button + centered title in place of the desktop header, single full-width primary CTA footer) below `md`. Fields: Contraseña actual / Nueva contraseña / Confirmar nueva contraseña, each a mono-font bordered input with an eye/eye-off visibility toggle. Below "Nueva contraseña": a 5px strength track (color + width driven by `computePasswordStrength`'s 0–4 score: `--border`/`--danger`/`--amber`/`--data-blue`/`--green`) and a 2×2 requirements checklist (green dot + check once satisfied). Below "Confirmar": a live match/mismatch line (green check / danger alert icon). A blue-tinted note (`bg-tint-blue`, shield icon) warns that updating the password revokes all other sessions. Submit stays disabled until the form is fully valid.

### Login (`/login`)
Full-viewport shell — `radial-gradient(130% 100% at 50% 0%, var(--surface-2), var(--bg))` behind a subtle 30px technical grid overlay (`--grid`, opacity .5, `pointer-events-none`) — lives in `(auth)/layout.tsx`, not the page, so any future auth screen (signup, forgot-password) reuses it for free. `login/page.tsx` (server component) renders only the centered 372px card (`rounded-2xl`, `shadow-app`, padding `34px 34px 28px`) with the logo mark/title/subtitle header, then hands off to `LoginForm` (client component) for the interactive form. Single column at all sizes — the card just narrows on mobile, no reflow. No theme toggle on this screen (first-time visitors get the OS-preferred theme from the no-flash script; returning users keep whatever they last set in the authenticated app).

Fields (email, password) share one wrapper style: `bg-surface-3` border, `focus-within:` primary ring, swapping to a `border-danger` + `--danger-ring` ring when that field has a validation error — invalid state always wins over focus state. Password has a trailing eye-icon toggle (`EyeIcon`) that flips the input between `password`/`text`. Validation is `react-hook-form` + `zodResolver` against `loginSchema.ts`: errors are silent until first submit, then recompute live as the user types. A submitted server-side auth failure (e.g. 401) renders the same error-row style between the password field and the submit button. The submit button has three label/visual states: idle ("Iniciar sesión") → pending ("Verificando…" + a left-aligned `SpinnerIcon` spinning via `animate-spin-fast`, button dimmed) → success ("Sesión iniciada", shown briefly while the redirect resolves).

## 4. State & interactions

- **Theme**: `dark`/`light`, toggled app-wide via `data-theme` on `<html>`, persisted to `localStorage`, restored pre-hydration by an inline script in `layout.tsx` (no flash).
- **Accent**: `indigo` (default) / `cyan` / `emerald` / `amber`, same persistence mechanism, no UI picker yet.
- **Explorer → Workspace**: "Abrir" on a project row navigates to `/workspace` (seeded data). "Crear Nuevo Proyecto" → modal → "Continuar" navigates to `/workspace?new=1` (empty state: `surveyLoaded`/`iprReady`/`pvtReady` all `false`, so all four `EmptyPanel`s render). Casing/tubing seed sections are present either way — they aren't gated by the empty-state flag, matching the original.
- **Progress tabs**: `activeTab` state (`completion | fluids | ipr | calc`, default `ipr`). Only the locked `calc` tab is unclickable. The Completación/Fluidos "completed" check icons are static (not derived from readiness state) — this is a fixed demo scenario in the original design, not a computed status.
- **IPR calculation**: "Ejecutar Cálculo IPR" (label switches to "Recalcular IPR", and the chart card gains an amber "Resultado desactualizado" pill, once a calc-relevant input changes after a successful run) opens `modals/IprCalcModal.tsx` — a pre-flight surface, not an inline run. It shows three read-only chips mirroring Ps/Pb/BSW by their full field names ("Presión estática del reservorio, Ps", "Presión de burbuja, Pb", "Corte de agua, BSW"); a blank one renders amber and clickable ("Falta — ir a completar en {tab}"), closing the modal and switching to the owning tab. Below that: a reservoir-model select (Vogel/Fetkovich), an editable test-point list (row 1 always shown; Fetkovich adds a second row plus a dashed "Agregar punto" affordance and a per-row ✕ once beyond 2 rows), and an optional "Tasa deseada de petróleo" field. Calcular stays disabled with the reason shown as visible inline text (not just a hover tooltip) until every input is valid; a rejected backend calc renders inline in a `bg-danger-soft` box, translated to Spanish. Button states: idle → running (spinner + "Calculando…") → the modal closes on success.
- **Casing/Tubing**: up to 3 sections each, labeled Superior/Intermedio/Inferior (or "Tramo único" when just one), cycling through blue/amber/green tints and accents. "Agregar tramo" is disabled and dimmed at the 3-section cap. Remove button only shows when more than one section exists. The size button opens a shared, kind-aware (`casing`/`tubing`) search-filterable catalog modal.
- **Survey**: an "Editar survey direccional" button opens a modal with editable MD/TVD columns (read-only HD/ángulo) over the full 20-station dataset; "Guardar survey" sets `surveyLoaded: true` and closes it.

## 5. Charts (`src/components/workspace/canvas/` + shared infra in `src/components/charts/`)
ECharts (`echarts`, tree-shaken `echarts/core` — no charting-library dependency beyond that), not hand-rolled SVG — chosen so the engineering charts get real interactive reading (crosshair tooltips, zoom) instead of a static plot. Token-driven styling still holds: colors/fonts are read from the same CSS custom properties as the rest of the app via a JS bridge (`useChartPalette`, since a `<canvas>` can't resolve `var(--…)` the way SVG could), so a chart always matches the current theme/accent with no chart-specific color logic.

- **`IprChart`** — true XY chart (`docs-user/ipr-chart-spec.md`): Qt (total liquid, blue) and Qo (oil, green) curves share flowing-bottomhole-pressure on Y; Qo is hidden when water cut is 0 (the two curves would coincide). Three labeled horizontal reference lines — Ps (static reservoir pressure, orange), Pb (bubble point, **red/`--danger`**), and the transition pressure (gray/`--text-faint`). When a design oil rate was requested, an amber "Diseño" marker plots on both curves with dashed guide lines down/left to the axes, and the stat row below gains the Fetkovich exponent (`n`) and the design point's Pwf/Q/Qo values. Native ECharts legend (swaps to "— Vogel"/"— Fetkovich" in the card title) replaces the old inline dot/line legend row. Hover shows a crosshair tooltip with Pwf/Qt/Qo/Qw; wheel-zoom/pan on both axes.
- **`PvtChart`** — Bo/Rs/μo vs pressure, normalized 0–1, with a dashed **red** Pb reference line (not orange — Pb is red on every chart that has one, to keep one color = one meaning). Still synthetic demo data (no backend PVT endpoint exists yet); only the rendering layer is ECharts.
- **`TrajectoryChart`** — a genuinely different shape from the other two: two independent X quantities (inclination angle on the bottom axis, horizontal displacement on the top axis) share one inverted Y axis (TVD/depth, 0 at top). Native legend ("Ángulo (°)" blue / "Trayectoria MD/HD" green) replaces the old dot-legend row. The tooltip crosshair is a single horizontal read-line (not the usual crosshair) since a vertical line would be ambiguous across two unrelated X scales; hovering shows MD/TVD/Ángulo/HD for the nearest station. Zoom only affects the shared depth axis, never the two X axes together.

All three: axis names use fixed, generous chart margins (not an auto-shrinking layout) so they stay legible at any zoom level, and every zoomable axis has a minimum zoom-in floor so it can't be zoomed into a degenerate near-zero range. See `CLAUDE.md`'s "Charts — ECharts stack" section for the implementation-level detail and gotchas.
