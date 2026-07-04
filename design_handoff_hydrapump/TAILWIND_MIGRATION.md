# CSS custom properties → Tailwind 4 — zero-loss migration

This app's entire visual system is CSS custom properties re-declared under attribute
selectors (`[data-theme="light"]`, `[data-accent="…"]`). **Tailwind 4 is CSS-variable
native, so this ports almost 1:1.** Follow these steps in order and no color, radius,
spacing value, theme, or accent is lost.

---

## Step 0 — Scaffold

```bash
npx create-next-app@latest hydrapump --typescript --tailwind --app --eslint
```

This gives you Next.js App Router + Tailwind 4 (Tailwind 4 ships as the default in current
`create-next-app`; confirm `tailwindcss` is v4 in `package.json` and that `app/globals.css`
starts with `@import "tailwindcss";`).

## Step 1 — Fonts (`next/font`, no layout shift)

`app/layout.tsx`:

```tsx
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const sans = IBM_Plex_Sans({
  subsets: ["latin"], weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark" data-accent="indigo"
          className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

> IBM Plex Sans has no 450 weight on Google Fonts — the prototype's `font-weight:450` maps
> to `500`. Everywhere else the weights match.

## Step 2 — Paste the tokens verbatim into `globals.css`

Keep the variable blocks **exactly as authored** (copy from `DESIGN_CONTRACT.md` or the
`<style>` in the standalone HTML). Theme + accent switching then works purely by toggling
`data-theme` / `data-accent` on `<html>` — no JS color maps.

```css
@import "tailwindcss";

/* ---- tokens: copied 1:1 from the prototype ---- */
:root {
  --bg:#0a0e14; --surface:#10151e; --surface-2:#151c27; --surface-3:#1b2433;
  --border:#243044; --border-strong:#34435c;
  --text:#e7eef7; --text-dim:#9aa7b8; --text-faint:#647082;
  --primary:#6366f1; --primary-hover:#818cf8; --primary-fg:#ffffff;
  --primary-soft:rgba(99,102,241,.16); --primary-ring:rgba(99,102,241,.34);
  --green:#34d399; --green-soft:rgba(52,211,153,.14); --green-fg:#04140d;
  --amber:#fbbf24; --amber-soft:rgba(251,191,36,.14);
  --danger:#fb5b78; --danger-hover:#ff7089; --danger-soft:rgba(251,91,120,.12); --danger-ring:rgba(251,91,120,.30);
  --grid:rgba(255,255,255,.06); --chart-plot:#0b111d;
  --data-blue:#5b9dff; --data-green:#3ddc97; --data-orange:#fb923c;
  --tint-blue:rgba(91,157,255,.09); --tint-amber:rgba(251,191,36,.08); --tint-green:rgba(61,220,151,.09);
  --shadow:0 18px 50px rgba(0,0,0,.55);
}
[data-theme="light"] {
  --bg:#e9edf3; --surface:#ffffff; --surface-2:#f3f6fb; --surface-3:#eaf0f7;
  --border:#dde3ec; --border-strong:#c3ccd9;
  --text:#1b2433; --text-dim:#5b687b; --text-faint:#8c97a8;
  --primary-soft:rgba(99,102,241,.1); --primary-ring:rgba(99,102,241,.26);
  --green:#059669; --green-soft:rgba(5,150,105,.12); --green-fg:#ffffff;
  --amber:#d97706; --amber-soft:rgba(217,119,6,.12);
  --danger:#e11d48; --danger-hover:#f43f5e; --danger-soft:rgba(225,29,72,.08); --danger-ring:rgba(225,29,72,.22);
  --grid:rgba(15,23,42,.07); --chart-plot:#fbfcfe;
  --data-blue:#2563eb; --data-green:#059669; --data-orange:#ea7a2a;
  --tint-blue:rgba(37,99,235,.06); --tint-amber:rgba(217,119,6,.07); --tint-green:rgba(5,150,105,.06);
  --shadow:0 18px 50px rgba(15,23,42,.16);
}
[data-accent="cyan"]    { --primary:#06b6d4; --primary-hover:#22d3ee; --primary-fg:#03161b; --primary-soft:rgba(6,182,212,.16);  --primary-ring:rgba(6,182,212,.34); }
[data-accent="emerald"] { --primary:#10b981; --primary-hover:#34d399; --primary-fg:#04140d; --primary-soft:rgba(16,185,129,.16); --primary-ring:rgba(16,185,129,.34); }
[data-accent="amber"]   { --primary:#f59e0b; --primary-hover:#fbbf24; --primary-fg:#1c1206; --primary-soft:rgba(245,158,11,.16); --primary-ring:rgba(245,158,11,.34); }
```

## Step 3 — Expose the tokens as Tailwind utilities with `@theme inline`

Because the same variable name is redefined under `[data-theme]`/`[data-accent]`, you MUST
use **`@theme inline`** (not plain `@theme`). `inline` makes the generated utilities emit
`var(--…)` instead of baking the value — so `bg-surface` re-reads the variable and the
data-attribute overrides keep cascading. This is the single most important line for "not
losing the theming."

```css
@theme inline {
  /* colors → bg-*, text-*, border-* utilities */
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-text: var(--text);
  --color-text-dim: var(--text-dim);
  --color-text-faint: var(--text-faint);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-fg: var(--primary-fg);
  --color-primary-soft: var(--primary-soft);
  --color-primary-ring: var(--primary-ring);
  --color-green: var(--green);
  --color-green-soft: var(--green-soft);
  --color-green-fg: var(--green-fg);
  --color-amber: var(--amber);
  --color-amber-soft: var(--amber-soft);
  --color-danger: var(--danger);
  --color-danger-hover: var(--danger-hover);
  --color-danger-soft: var(--danger-soft);
  --color-danger-ring: var(--danger-ring);
  --color-data-blue: var(--data-blue);
  --color-data-green: var(--data-green);
  --color-data-orange: var(--data-orange);
  --color-tint-blue: var(--tint-blue);
  --color-tint-amber: var(--tint-amber);
  --color-tint-green: var(--tint-green);
  --color-grid: var(--grid);
  --color-chart-plot: var(--chart-plot);

  /* fonts → font-sans / font-mono */
  --font-sans: var(--font-sans), system-ui, sans-serif;
  --font-mono: var(--font-mono), monospace;

  /* the app's non-default radii → rounded-input / rounded-card / rounded-section */
  --radius-input: 7px;
  --radius-section: 11px;
  --radius-card: 12px;
  --radius-btn: 10px;

  /* the elevation shadow → shadow-app */
  --shadow-app: var(--shadow);
}
```

Now these all work and stay theme-aware:
`bg-surface`, `bg-surface-2`, `text-dim`, `text-faint`, `border-border`, `border-strong`,
`bg-primary text-primary-fg`, `text-green`, `bg-amber-soft`, `rounded-card`,
`rounded-section`, `shadow-app`, `font-mono`, etc.

## Step 4 — Theme + accent toggling in React

Since colors live in CSS, the toggle is just an attribute flip:

```tsx
// dark ⇄ light
document.documentElement.setAttribute("data-theme", next); // "dark" | "light"
// accent
document.documentElement.setAttribute("data-accent", accent); // indigo|cyan|emerald|amber
```

Persist to `localStorage` and read it back on mount (guard against SSR hydration mismatch —
set the initial attribute in a small inline script or in `layout.tsx` defaults).

## Step 5 — Convert markup to JSX + utilities

- Straightforward inline styles → utilities: `background:var(--surface)` → `bg-surface`,
  `color:var(--text-dim)` → `text-text-dim`, `border:1px solid var(--border)` →
  `border border-border`, `border-radius:12px` → `rounded-card`.
- **Off-scale one-offs** (they're everywhere here — this is a high-density UI): use arbitrary
  values keyed to a token or literal — `w-[238px]`, `h-[60px]`, `text-[13.5px]`,
  `p-[6px_10px]`, `rounded-[11px]`, `gap-[14px]`, `tracking-[-0.022em]`,
  `shadow-[0_5px_16px_var(--primary-ring)]`, `bg-[var(--tint-blue)]`.
- **`style-hover` / `style-focus` / `style-focus-within`** in the prototype → Tailwind
  `hover:` / `focus:` / `focus-within:` variants. E.g. the input focus ring becomes
  `focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]`; the unit field wrapper
  uses `focus-within:border-primary focus-within:shadow-[0_0_0_2px_var(--primary-ring)]`.
- **`sc-if` / `sc-for`** are just conditionals/loops → React `{cond && …}` and `.map()`.
- **Grid tables** keep their exact template:
  `grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_150px_132px_100px]`.
- **Keyframes** (`fade`, `popIn`, `spin`) → declare `@keyframes` in `globals.css` and expose
  `--animate-fade: fade .25s ease;` in `@theme` so `animate-fade` works; or apply inline.

## Step 6 — Componentize (suggested structure)

```
app/
  layout.tsx            fonts + <html data-theme data-accent>
  globals.css           tokens + @theme inline
  (explorer)/page.tsx   Project Explorer
  workspace/page.tsx    Workspace
components/
  AppSidebar.tsx  TopBar.tsx  ThemeToggle.tsx
  StatCard.tsx    ProjectsTable.tsx  StatusBadge.tsx
  ProgressChevrons.tsx      // the "shopping-cart" step bar
  DataGroupCard.tsx  InputRow.tsx  UnitField.tsx   // ← match DESIGN_CONTRACT exactly
  CasingTubingBuilder.tsx  SizePickerModal.tsx
  Modal.tsx
lib/
  data.ts               casingCat, tubingCat, survey, surveyFull, projects (copy verbatim)
  types.ts
```

Build `UnitField`, `InputRow`, and `DataGroupCard` as the shared atoms first and reuse them
— the `DESIGN_CONTRACT.md` "Atomic component standards" section is the spec for each.

## Verification checklist (proves nothing was lost)
- [ ] Dark ↔ light toggle recolors the entire app (every surface, text, border, badge).
- [ ] All four accents (indigo/cyan/emerald/amber) recolor primary buttons, active nav,
      active pill/tab, and focus rings.
- [ ] Numeric text renders in IBM Plex Mono; UI text in IBM Plex Sans.
- [ ] Unit fields: numbers share one left edge, unit tabs hug their unit on one right edge;
      short units (°F, psi) and long units (scf/stb, ppm Cl⁻) both look right; error state
      shows danger border + ring.
- [ ] Progress chevrons show Completed / Active / Locked exactly (green check / primary ring
      / padlock + not-allowed).
- [ ] Explorer stat cards, filter pills, and projects table match spacing & radii.
- [ ] Workspace holds the 45/55 split with the left column scrolling and right column fixed.
- [ ] Focus rings are `0 0 0 2px var(--primary-ring)` on inputs, `0 0 0 3px` ring on active
      pill/tab.

Diff against `HydraPump Design Suite (standalone).html` side-by-side at each screen.
