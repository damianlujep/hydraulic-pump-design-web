# Hydraulic Pump Design Application — Project Contract

## BASELINE v1.0 — LOCKED (do not alter without explicit instruction)
The file `HydraPump Design Suite.dc.html` is the official structural baseline. The following
foundation elements are FROZEN. Do not modify them unless the user explicitly says to alter the foundation:
- Global 2-column app layout (sidebar + main column).
- Sidebar navigation (Explorador de Proyectos, Catálogo de Bombas, Historial de Simulaciones).
- Workspace 45 / 55 split-screen architecture (left = scrollable data-input engine, right = fixed canvas stack).
- High-density spacing rhythm (compact card padding, tight input rows).
- Chevron "shopping-cart" progress tab bar with per-step status (Completed / Active / Locked).
All future requests are built ON TOP of this exact structure.

## Language
All user-facing UI text, labels, buttons, dummy data = SPANISH. Technical/system notes = English.

## Implementation reality
This is a Design Component (.dc.html) → **inline styles only**, no Tailwind classes, no external stylesheet.
"Tokens" = CSS custom properties defined in the root `[data-theme]` block of the component.
"Density scale" = consistent inline pixel values reused everywhere (NOT py-1.5/p-3 utility classes).

## DESIGN TOKENS (defined in :root of HydraPump Design Suite.dc.html — reuse, never invent new colors)
### Semantic colors (dark + light variants both defined)
- Main background:        var(--bg)
- Container background:    var(--surface), var(--surface-2), var(--surface-3)   (3-step elevation scale)
- Borders:                 var(--border), var(--border-strong)
- Text primary:            var(--text)
- Text secondary:          var(--text-dim)
- Text faint/labels:       var(--text-faint)
- Monospace data:          font-family 'IBM Plex Mono' + var(--text) / var(--data-blue/green/orange)
- Status ACTIVE/primary:   var(--primary), var(--primary-hover), var(--primary-soft), var(--primary-ring), var(--primary-fg)
- Status COMPLETED:        var(--green), var(--green-soft); on-green text/icons MUST use var(--green-fg) (theme-aware: dark on bright dark-mode green, white on deeper light-mode green) — never hardcode the checkmark color
- Status WARNING:          var(--amber), var(--amber-soft)
- Status LOCKED:           var(--surface-2) bg + var(--text-faint) fg (disabled, padlock icon)
- Destructive:             var(--danger), var(--danger-hover)
- Status ERROR/invalid:    input border var(--danger) + box-shadow 0 0 0 2px var(--danger-ring), row bg var(--danger-soft), helper text var(--danger) with alert icon
- Data plot accents:       var(--data-blue), var(--data-green), var(--data-orange); chart plot bg var(--chart-plot); gridlines var(--grid)
- Group tints:             var(--tint-blue), var(--tint-amber)
- Accent themes switchable via [data-accent]: indigo (default), cyan, emerald, amber.

### Density scale (reuse these exact values)
- Data-entry group card:   border-radius 11px, header padding 10px 14px, body padding 6px
- Input row:               padding 6px 10px, border-radius 7px
- Numeric input:           font 13px/500 IBM Plex Mono, **text-align LEFT** (form of heterogeneous params, not a comparison table — left edge stays consistent across number/unitless/select fields; right-align only for true same-unit data tables).
- Unit field (MUI endAdornment pattern): a SINGLE unified box is the wrapper — width 150px, display:inline-flex, align-items:center, bg var(--surface-3), 1px var(--border), border-radius 6px, overflow:hidden, style-focus-within = border var(--primary) + box-shadow 0 0 0 2px var(--primary-ring). Inside: the `<input>` is borderless/transparent (flex:1, min-width:0, padding 5px 0 5px 10px, text-align:left, no border, outline:none) so the focus ring lives on the wrapper; then the unit as a content-hugging addon tab pinned right — span with align-self:stretch, display:flex, align-items:center, flex:none, padding 0 10px, bg var(--surface-2), border-left 1px var(--border), font 10.5px IBM Plex Mono, color var(--text-faint), white-space:nowrap, pointer-events:none. Error state = wrapper border/shadow var(--danger)/var(--danger-ring). Strip the "(unit)" from the field label.
  - Result: numbers share one LEFT start edge, units share one RIGHT edge, divider tab hugs each unit (no fixed-width empty void). Do NOT revert to a fixed-width unit chip (causes empty space on short units like °F/psi) and do NOT use per-unit padding on an absolutely-positioned suffix (long units like scf/stb, ppm Cl⁻, fracción overlap the number).
- Section/dashboard card:  border-radius 12px
- Panel padding:           18px 20px
- Card gap in panels:      14px

### Atomic component standards (identical across all instances)
- Text/numeric input:  bg var(--surface-3), 1px solid var(--border), radius 6–7px,
                        focus = border var(--primary) + box-shadow 0 0 0 2px var(--primary-ring)
- Dropdown (select):   same as input, cursor pointer
- Primary button:      bg var(--primary), color var(--primary-fg), radius 9–11px,
                        box-shadow 0 5–6px 16–18px var(--primary-ring), hover bg var(--primary-hover)
- Secondary button:    bg var(--surface-2), 1px solid var(--border), radius 9px, hover border var(--border-strong)
- Destructive button:  transparent, 1px solid var(--danger), color var(--danger), hover bg var(--danger)+#fff
- Pill/tab:            radius 999px, selected = primary-soft bg + primary border + 3px primary-ring ring
- Theme toggle lives in every top bar; dark + light both fully supported.

## Typography
- UI: 'IBM Plex Sans'. All numeric data (tables, inputs, axes, metrics): 'IBM Plex Mono'.
