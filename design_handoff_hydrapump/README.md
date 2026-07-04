# Handoff: HydraPump Design Suite

## Overview
HydraPump Design Suite is a data-dense engineering application for designing and
redesigning hydraulic pumping systems (Jet & Piston lift) for oil wells. It has two
primary screens — a **Project Explorer** and a split-screen **Workspace** with a
chevron "shopping-cart" progress bar that walks the engineer through simulation steps.
The UI is in **Spanish**; all technical/system notes are in English.

Target stack for the rebuild (specified by the client):
**Next.js (App Router) + React + TypeScript + Tailwind CSS 4.**

## About the design files
The files in `design-references/` are **design references authored in HTML** — working
prototypes that show the intended look, spacing, and behavior. They are **not** production
code to copy verbatim. Your task is to **recreate these designs inside a real Next.js +
React + TypeScript + Tailwind 4 app**, using idiomatic React components and Tailwind
utilities.

- `HydraPump Design Suite (standalone).html` — **open this in a browser first.** It is
  the fully self-contained prototype (both screens, both themes, all four accent colors,
  all interactions). Use it as the source of truth for visuals and behavior.
- `HydraPump Design Suite.dc.html` — the same app in authoring form. The `<script
  data-dc-script>` block near the bottom (≈ line 718) contains the **complete component
  logic and all the seed/dummy data** (projects list, casing/tubing catalogs, deviation
  survey, state machine). Read it to understand state and data shapes.
- `Casing Tubing Options.dc.html` — an isolated exploration of the casing/tubing section
  UI (the size-picker modal and section cards). Reference for that sub-component.
- `DESIGN_CONTRACT.md` — **the design system contract.** This is the authoritative token
  and density spec. Every color, radius, padding value, and component standard is defined
  here. Treat it as law.
- `TAILWIND_MIGRATION.md` — **read this before writing any code.** Step-by-step plan for
  moving the CSS-custom-property token system into Tailwind 4 with **zero fidelity loss**,
  including the exact `@theme` block to paste into `globals.css`.

> These are the `.dc.html` authoring format from a design tool. Ignore the `<x-dc>`,
> `<helmet>`, `<sc-if>`, `<sc-for>`, and `{{ }}` wrappers — they are template scaffolding.
> The real content is: the inline-styled markup (→ your JSX + Tailwind) and the
> `class Component` logic block (→ your React state).

## Fidelity: HIGH
These are pixel-level hi-fi mockups with final colors, typography, spacing, radii,
shadows, and interactions. **Recreate them pixel-perfectly.** Do not substitute a generic
component library's defaults — the density and token values in `DESIGN_CONTRACT.md` are
intentional and must be reproduced exactly.

---

## The #1 concern: not losing anything in the CSS → Tailwind 4 move

The whole design is driven by **CSS custom properties** (`--surface`, `--primary`,
`--text-dim`, …) that are re-defined under `[data-theme="light"]` and `[data-accent="…"]`
attribute selectors. **This maps onto Tailwind 4 almost 1:1** — Tailwind 4 is CSS-variable
native. The strategy is:

1. **Keep the CSS variables exactly as they are.** Paste the `:root`, `[data-theme="light"]`,
   and `[data-accent="…"]` blocks (verbatim, from `DESIGN_CONTRACT.md` / the standalone file
   `<style>`) into `app/globals.css`. Theme + accent switching keeps working by toggling
   `data-theme` / `data-accent` on `<html>` — no JS color logic needed.
2. **Register those variables with `@theme inline`** so they become Tailwind utilities
   (`bg-surface`, `text-dim`, `border-strong`, `rounded-card`, …). Because you use
   `@theme inline`, the utilities resolve to `var(--…)` at runtime, so the data-attribute
   overrides still cascade — dark/light/accent all keep working through the utilities.
3. **Rebuild layout with Tailwind utilities**, but pull any value that isn't on Tailwind's
   default scale (e.g. `238px` sidebar, `11px` radius, `13.5px` font) from the tokens or
   arbitrary values `[238px]`, `text-[13.5px]`, `rounded-[11px]`.

`TAILWIND_MIGRATION.md` has the copy-paste `@theme` block and the full utility mapping.
**Follow it and nothing is lost.**

---

## Screens / Views

### 1. Explorador de Proyectos (Project Explorer)
- **Purpose:** landing screen; pick or create a pumping-design project, then open it in the
  Workspace.
- **Layout:** fixed 2-column app shell.
  - **Sidebar** — `width: 238px`, `flex: none`, `bg var(--surface)`, right border
    `1px var(--border)`. Contains: logo lockup (34px indigo rounded square + "HydraPump /
    DESIGN SUITE · v4.2"); grouped nav ("Espacio de trabajo": Explorador de Proyectos
    [active], Catálogo de Bombas, Historial de Simulaciones; "Recursos": Documentación
    técnica, Configuración); and a "Nube conectada" status card pinned at the bottom.
    Active nav item = `bg var(--primary-soft)` + `inset 0 0 0 1px var(--primary-ring)`.
  - **Main column** — `flex: 1`, min-width 0. Top: 60px `header` (workspace switcher button,
    search input max-width 440px, theme toggle, user chip). Body: scrollable, padding
    `26px 30px 40px`.
    - Page title "Panel de Proyectos" (23px/700, letter-spacing -.022em) + subtitle, with
      "Importar Datos" (secondary) and "Crear Nuevo Proyecto" (primary) buttons on the right.
    - **4-up stat cards** (`grid-template-columns: repeat(4,1fr)`, gap 14px): Proyectos
      activos 24, Pozos en diseño 11, Simulaciones (mes) 187, Sincronizados 92% (green).
      Card = `bg var(--surface)`, `1px var(--border)`, radius 12px, pad `15px 16px`; big
      number is 26px/700 IBM Plex Mono.
    - **Filter pills** row (Todos [active] / Sincronizados / Caché local) + "6 de 24
      proyectos" count on the right.
    - **Projects table** — CSS grid, columns
      `minmax(0,2.4fr) minmax(0,1.2fr) 150px 132px 100px`. Header row `bg var(--surface-2)`,
      10.5px uppercase faint labels. Each row: 34px project icon tile, name (13px/600) +
      `well · type` mono subline, campo, sync-status badge (green "Sincronizado" pill /
      amber "Caché local" pill), modified date (mono), "Abrir" button → navigates to
      Workspace. Row hover `bg var(--surface-2)`.
- **Seed data:** 6 projects — see the `this.projects` array in the logic block.

### 2. Workspace
- **Purpose:** the actual pump-design engine. Left half = scrollable data-input forms; right
  half = fixed canvas/chart stack. Driven by a chevron progress tab bar.
- **Layout:**
  - 58px navbar: "Regresar al Explorador" back button, project title/breadcrumb, actions.
  - **Chevron progress tab bar** ("shopping-cart" style) — each step is a chevron with a
    per-step status: **Completed** (green check, `var(--green)` / `var(--green-fg)`),
    **Active** (`var(--primary-soft)` bg + `var(--primary)` border + 3px `var(--primary-ring)`
    ring), or **Locked** (`var(--surface-2)` bg, `var(--text-faint)` fg, padlock icon,
    `cursor: not-allowed`). Steps include IPR, PVT, Survey/Desviación, Casing/Tubing, etc.
    (`activeTab` state; default `'ipr'`).
  - **45 / 55 split** below the tab bar: left column scrolls (the data-entry "engine"),
    right column is a fixed canvas stack (charts / wellbore schematic).
- **Key sub-components:**
  - **Data-entry group card:** radius 11px, header pad `10px 14px`, body pad 6px.
  - **Input row:** pad `6px 10px`, radius 7px.
  - **Unit field (MUI endAdornment pattern):** a single unified box, width 150px,
    `inline-flex`, `bg var(--surface-3)`, `1px var(--border)`, radius 6px, `overflow:hidden`;
    focus-within → border `var(--primary)` + `0 0 0 2px var(--primary-ring)`. Inside: a
    borderless transparent `<input>` (flex:1, left-aligned, pad `5px 0 5px 10px`) + a
    content-hugging unit "addon" span pinned right (`bg var(--surface-2)`, left border,
    10.5px mono, faint, `pointer-events:none`). **Numbers share one left edge, units share
    one right edge.** See `DESIGN_CONTRACT.md` for the exact rules (do not revert to a
    fixed-width unit chip). Error state = wrapper border/shadow in `var(--danger)`.
  - **Casing / Tubing section builder:** up to 3 sections each (Superior / Intermedio /
    Inferior, or "Tramo único" when only one). Each section card has a tint
    (`--tint-blue`/`--tint-amber`/`--tint-green`), a size row that opens the **size-picker
    modal** (search over the casing/tubing catalog), a length input, and a remove button
    (shown only when >1 section). See `Casing Tubing Options.dc.html`.
- **Modals:** "Crear Nuevo Proyecto" modal (`modalOpen`), survey-import modal
  (`surveyModalOpen`), and casing/tubing size picker (`sizeModal`).

### Empty states (REQUIRED — do not skip)
When there is no data yet (`emptyState` prop, or `surveyLoaded` / `iprReady` / `pvtReady`
false), the right-hand canvas cards render a **placeholder panel instead of the chart/table**.
This is a single reusable component — in the prototype it is `emptyPanel(title, msg, cta,
onCta)` — used in four places. Recreate it as one shared `<EmptyPanel>` React component.

**`EmptyPanel` visual spec (exact):**
- Container: `height: 300px`, flex column, centered (align + justify center), `gap: 13px`,
  **`border: 1.5px dashed var(--border)`**, `border-radius: 10px`, and a diagonal hatch
  background: `repeating-linear-gradient(45deg, var(--surface) 0 9px, var(--surface-2) 9px 10px)`.
- Icon tile: 48×48, `border-radius: 13px`, `bg var(--surface)`, `1px var(--border)`,
  `color var(--text-faint)`, holding a 22px line-chart SVG (axes + rising line, stroke 1.8).
- Title: 13.5px / 600, `var(--text-dim)`, centered, max-width 300px.
- Message: 11.5px, `var(--text-faint)`, `margin-top 4px`, line-height 1.45, centered.
- CTA button: primary style — `bg var(--primary)`, `color var(--primary-fg)`, `padding
  8px 15px`, `radius 9px`, `box-shadow 0 4px 12px var(--primary-ring)`, 12px/600, with a
  14px pencil icon (stroke 2.1) to the left of the label.

**The four instances (title / message / CTA):**
1. **Survey empty** (`surveyEmpty`, shown in the survey/completación panel):
   - "Sin survey direccional cargado"
   - "Importe o inserte las estaciones de survey para visualizar la tabla y calcular TVD por interpolación."
   - CTA "Insertar datos de survey" → opens the survey-import modal.
2. **Trajectory chart empty** (`trajEmpty`, completación bottom card):
   - "Sin trayectoria para graficar"
   - "Complete el survey direccional para generar el perfil de trayectoria y desviación del pozo."
   - CTA "Editar datos de trayectoria" → opens survey editor/modal.
3. **IPR chart empty** (`iprEmpty`, IPR canvas card):
   - "Sin curva IPR generada"
   - "Ingrese los parámetros del yacimiento y ejecute el cálculo para obtener la curva de rendimiento."
   - CTA "Ejecutar cálculo IPR" → runs the calc (`runCalc`: sets `running` → after 1.3s
     `done` + `iprReady:true`, spinner during; back to `idle` after 4.4s).
4. **PVT chart empty** (`pvtEmpty`, Fluidos y PVT canvas card):
   - "Sin propiedades PVT calculadas"
   - "Defina la composición del fluido y las correlaciones para generar las curvas Bo, Rs y μo vs presión."
   - CTA "Calcular propiedades PVT" → runs the PVT calc.

Note: in the completación **empty** layout, the survey card and the trajectory card are
stacked (`gap 16px`) and vertically centered as a group (`margin: auto 0`); when data is
present the trajectory card is top-aligned instead. The survey card in the empty completación
view also shows an "Editar survey direccional" pencil button in its header.

To preview all four in the prototype, flip the `emptyState` prop to `true` (it's exposed as
a boolean tweak on the root component).

---

## Interactions & Behavior
- **Theme toggle** (top bar, both screens): flips `theme` between `dark` / `light`, which
  toggles the `data-theme` attribute on the app root. Both themes fully specified.
- **Accent switch:** four accents (indigo default, cyan, emerald, amber) via `data-accent`.
  Exposed as a prop in the prototype; wire to a setting or leave as indigo.
- **Explorer → Workspace:** the "Abrir" button on a project row and "Crear Nuevo Proyecto"
  set `screen: 'workspace'`. "Regresar al Explorador" sets it back.
- **Progress tab bar:** clicking an unlocked/active step changes `activeTab`. Locked steps
  are not clickable. Completed steps show a check.
- **Casing/Tubing:** add section (`addSec`, capped at 3), open size picker (`onOpen`), pick
  a catalog entry (`pickSize`), edit length (`onLen`), remove section (`onRemove`).
- **Empty state:** an `emptyState` prop clears `surveyLoaded` / `iprReady` / `pvtReady` to
  show the pre-data state. Recreate as a real "no data yet" condition.
- **Animations:** screen transitions use a `fade` (0.25s ease) and content uses `popIn`
  (opacity + translateY(14px) scale(.985)); spinners use `spin`. Keyframes are in the
  `<style>` block. Reproduce with Tailwind `animate-*` / small keyframes in `globals.css`.
- **Transitions:** pills/tabs transition `box-shadow, border-color, background` at `.15s`.

## State management
All state lives in one component in the prototype; split sensibly in React (e.g. a
Workspace context or a `useReducer`). State variables to reproduce:
- `theme` (`'dark' | 'light'`), `accent` (`'indigo' | 'cyan' | 'emerald' | 'amber'`)
- `screen` (`'explorer' | 'workspace'`)
- `activeTab` (progress step id; default `'ipr'`), `calcStatus` (`'idle' | …`)
- `modalOpen`, `surveyModalOpen`, `sizeModal { open, kind, target, search }`
- `surveyLoaded`, `iprReady`, `pvtReady` (gated by `emptyState`)
- `casing: [{ sizeIdx, length }]`, `tubing: [{ sizeIdx, length }]`
- Reference data (put in `/lib` or fetch later): `casingCat`, `tubingCat`, `survey`,
  `surveyFull`, `projects` — all seeded in the logic block. Copy them verbatim.

## Design tokens
Full authoritative list is in `DESIGN_CONTRACT.md`. Summary:
- **Colors:** semantic tokens for bg/surface(×3 elevation)/border(×2)/text(×3)/primary(indigo,
  +hover/soft/ring/fg)/green(+soft/fg)/amber(+soft)/danger(+hover/soft/ring)/data plot accents
  (blue/green/orange)/tints. Both dark and light values defined, plus 4 accent overrides.
- **Type:** UI = `IBM Plex Sans`; all numeric data (tables, inputs, axes, metrics) =
  `IBM Plex Mono`. Import both from Google Fonts (weights 400/450/500/600/700 sans,
  400/500/600 mono). Prefer `next/font/google` in Next.js.
- **Radii:** input 6–7px, section card 11px, dashboard card 12px, button 9–11px, pill 999px.
- **Density:** panel padding `18px 20px`, card gap in panels 14px, input row `6px 10px`,
  group-card header `10px 14px` / body 6px. Reuse these exact pixel values.
- **Shadows:** `--shadow` (dark: `0 18px 50px rgba(0,0,0,.55)`, light: `…rgba(15,23,42,.16)`);
  primary button `0 5–6px 16–18px var(--primary-ring)`.

## Assets
No raster/image assets. All icons are **inline SVGs** (Feather-style, 1.9–2.4 stroke width,
`stroke="currentColor"`, round caps/joins) written directly in the markup. In React, either
copy the SVG paths into small icon components or swap to a matching set (e.g. `lucide-react`,
which is the same visual family). Fonts come from Google Fonts (see above).

## Files (in this bundle)
- `design-references/HydraPump Design Suite (standalone).html` — open-in-browser prototype
- `design-references/HydraPump Design Suite.dc.html` — authoring form + full logic/data
- `design-references/Casing Tubing Options.dc.html` — casing/tubing sub-component
- `design-references/DESIGN_CONTRACT.md` — authoritative token + density spec
- `TAILWIND_MIGRATION.md` — CSS-vars → Tailwind 4 migration plan (read first)
