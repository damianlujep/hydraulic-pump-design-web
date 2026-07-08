# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **yarn** (`yarn.lock` is authoritative — don't run plain `npm install`, it rewrites the lockfile with npm registry URLs and desyncs `node_modules`).

```bash
yarn dev          # start dev server (Turbopack) on :3000
yarn build        # production build (also runs the TypeScript check)
yarn start        # run the production build
yarn lint         # eslint (eslint-config-next core-web-vitals + typescript)
yarn typecheck    # tsc --noEmit
yarn api:sync     # regenerate src/lib/api/schema.d.ts from the running backend's OpenAPI spec
```

There is no test suite/framework configured in this project.

The Spring Boot backend (sibling repo `hydraulic-pump-design-api`) must be running on `http://localhost:8080` (dev profile) for `yarn api:sync` and for any authenticated page/route to work. `API_URL` in `.env.local` points at it. The OpenAPI spec (`/api-docs`) is only served in the dev profile — `yarn api:sync` cannot be run against prod.

If the dev server ever serves pages with zero CSS applied or throws `SyntaxError: Unexpected end of JSON input` / `Error: Manifest file is empty`, it's a stale Turbopack dev cache — stop the process, `rm -rf .next`, and restart `yarn dev`. This has been observed after many rapid file edits while the dev server stays running.

## Architecture

This is a Next.js App Router rebuild of a Claude-Design HTML prototype (see `design_handoff_hydrapump/`) — a data-dense engineering tool for designing hydraulic pumping systems (Jet & Piston lift) for oil wells. UI copy is Spanish; code identifiers are English.

### Three routes
- `/` — **Project Explorer** (`src/app/(workspace)/page.tsx`): landing/project list. The page shell is server-rendered; `ProjectsTable` is a client component fetching real projects via TanStack Query (see Backend Integration below). Protected — unauthenticated requests are redirected to `/login` by `src/proxy.ts`.
- `/login` — sign-in form (`src/app/(full-width-pages)/(auth)/login/page.tsx` + `src/components/auth/LoginForm.tsx`), gated in `PUBLIC_PATHS` in `src/proxy.ts` rather than excluded from the matcher — an already-authenticated visit gets bounced to `safeRedirectPath(?redirect)` instead of rendering the form.
- `/workspace` — **Workspace** (`src/app/(workspace)/workspace/page.tsx` → `WorkspaceScreen`): the actual pump-design engine, entirely client-rendered. `?new=1` on the URL means "just created" — it opens with empty data (all four canvas panels show `EmptyPanel` placeholders) instead of the seeded example project. This flag is read via `useSearchParams`, so `WorkspacePage` wraps `WorkspaceScreen` in `<Suspense>`. **Still runs entirely on seed data from `src/lib/data.ts`** — the backend integration below covers auth and the Project Explorer only; casing/tubing catalogs, survey data, and the IPR calc are not yet wired to the API.
- `/` and `/workspace` live under the `(workspace)` route group, `/login` under `(full-width-pages)/(auth)` — both group layouts are currently bare passthroughs (`<>{children}</>`); `(auth)/layout.tsx` carries the login screen's full-viewport gradient/grid shell so `login/page.tsx` only renders the card. Route groups don't affect the URLs.

### Design-token theming (do not bypass)
The entire visual system is CSS custom properties defined in `src/styles/globals.css`, redeclared under `[data-theme="light"]` and `[data-accent="cyan|emerald|amber"]` attribute selectors on `<html>`, then re-exposed as Tailwind v4 utilities via `@theme inline` (`bg-surface`, `text-dim`, `border-strong`, `rounded-card`, `shadow-app`, etc.). Because `@theme inline` resolves to `var(--…)` instead of baking in a value, theme/accent switching works purely by flipping the `data-theme`/`data-accent` attributes — no JS color maps. `ThemeProvider` (`src/context/ThemeContext.tsx`) owns that state, persists to `localStorage`, and a blocking inline script in `layout.tsx` sets the attributes before hydration to avoid a flash.

**Theme init/device-default/toggle invariants — do not reintroduce the old bugs:**
- The inline script in `layout.tsx` (`NO_FLASH_SCRIPT`) only falls back to `prefers-color-scheme` when `localStorage["hydrapump-theme"]` holds neither `"dark"` nor `"light"` — i.e. the OS preference is a **one-time** default for first-time visitors, not a live-followed setting. Once any value is persisted, the OS is never consulted again.
- `ThemeProvider`'s `theme`/`accent` state **must** initialize via a lazy `useState(() => …)` that reads `document.documentElement.getAttribute("data-theme"/"data-accent")` — never re-read `localStorage` in a mount effect. The DOM already reflects what the inline script painted; re-syncing from storage after mount causes a visible flash back to the SSR default before snapping to the stored value.
- `<html>` needs `suppressHydrationWarning` because the inline script mutates `data-theme`/`data-accent` before React hydrates.
- `ThemeToggle` (`src/components/ThemeToggle.tsx`) swaps its icon/label via the `light:` Tailwind variant (`@custom-variant light (&:is([data-theme="light"] *));` in `globals.css`), not a JS conditional on `theme` — both variants always render, one hidden via CSS. This sidesteps a hydration mismatch now that `theme`'s initial client value can legitimately differ from the SSR default.

**When adding UI, reuse existing tokens/utilities — never invent a new hex color or hardcode light/dark values.** Off-Tailwind-scale spacing/radii/font-sizes from the original design (e.g. `w-[150px]`, `rounded-[11px]`, `text-[13.5px]`) are intentional and pervasive; match them rather than rounding to the default scale.

### Backend integration (BFF pattern)
The Spring Boot API is never called from the browser directly. Next.js Route Handlers under `src/app/api/` act as a backend-for-frontend: they hold the only code that talks to `http://localhost:8080`, and re-mint their own first-party httpOnly cookies (`access_token`, `refresh_token`, both `Path=/`) for the browser.

Only **auth** and **projects (list/create/delete)** are wired end-to-end. Project detail (`GET`/`PATCH`), casing/tubing catalogs, survey persistence, the real IPR calc endpoint, and design-data save/locking all exist in the backend's OpenAPI spec but have no proxy route yet — see `docs/refactor-roadmap.md` for the staged plan to wire them.

- **`src/lib/api/schema.d.ts`** — generated by `yarn api:sync` (openapi-typescript). Committed; never hand-edit. Re-run after any backend contract change.
- **`src/lib/api/server-client.ts`** — `createServerClient()` builds a per-request `openapi-fetch` client with the `access_token` cookie attached as a Bearer header. Also exports `forwardOpenApiResponse`/`forwardOpenApiVoidResponse`, the two helpers every proxy route handler should use to turn a `client.GET/POST/DELETE(...)` result into a `NextResponse`.
  - **Non-obvious gotcha driving this**: the backend's generated OpenAPI spec documents no 4xx/5xx responses at all (every operation only has a `200`/`201` entry), so `openapi-fetch`'s `error` field types as `never` on every operation. Writing `if (error || !data)` type-checks but TypeScript narrows the `error`-truthy branch as unreachable and collapses everything inside it (including unrelated variables like `response`) to `never`. **Always branch on `response.ok`, never on `error`'s truthiness** — `response` stays a plain `Response` regardless, and `error` still holds the real backend error body at runtime despite its static type. Use `forwardOpenApiResponse` for endpoints with a response body, `forwardOpenApiVoidResponse` for endpoints whose success response has `content?: never` in the generated schema (e.g. delete) — the ordinary helper would wrongly 502 those since `data` is `undefined` on success too.
- **`src/lib/api/auth-cookies.ts`** — cookie read/write helpers used only by the auth routes: `parseRefreshToken` (extracts `refresh_token` from the backend's `Set-Cookie` headers via `getSetCookie()`, not `.get("set-cookie")` which comma-joins — thin wrapper over `parseSetCookieValue` in `cookies.ts`), `readRequestCookie` (extracts a cookie value from an incoming request's `Cookie` header — Route Handlers don't get `next/headers` `cookies()` cookies from the *backend's* perspective on outgoing manual `fetch`, so this is done by hand), `setAuthCookies`/`clearAuthCookies`/`clearAccessCookie`.
- **`src/lib/api/cookies.ts`** — the client/middleware-safe half (no `server-only` import, unlike `auth-cookies.ts`): the two cookie name/maxAge constant pairs, plus `parseSetCookieValue(setCookies, name)` — extracts a named cookie's value from an array of raw `Set-Cookie` headers. `src/proxy.ts` needs this to read the fresh `access_token` off the refresh route's response without importing a server-only module.
- **`src/lib/api/client-fetch.ts`** — `apiFetch`, the client-side fetch wrapper every TanStack hook uses instead of raw `fetch`. On a `401` it single-flights a `POST /api/auth/refresh` (module-level `refreshPromise` guard — the backend rotates refresh tokens on every use, so two concurrent 401s must not each trigger their own refresh) and retries once; a failed refresh redirects to `/login`.
- **`src/app/api/auth/{login,refresh,logout,me}/route.ts`** — the only code that calls the backend's auth endpoints. Status/cookie contract on `refresh`: no refresh cookie → 401, deletes the access cookie only; backend 401/403 → 401, deletes the access cookie only (**the refresh route never deletes the refresh cookie — only `logout` does**); backend unreachable/malformed → 502, **both cookies kept** (a transient backend outage must not log anyone out); success → 200, both cookies rotated. `refresh` also single-flights per refresh token at the route level (module-level `Map`, ~30s straggler cache for requests still holding the just-rotated-out token) — this is a *second* single-flight layer, independent of `apiFetch`'s and `proxy.ts`'s, because the browser and the middleware can both call this route concurrently. `login` forwards the backend's real status + a `Retry-After` header passthrough (429 rate-limit) and 502s if the backend itself is unreachable. `login`/`refresh` use raw `fetch` (not the typed client) because they need the raw `Set-Cookie` header, not just a parsed body.
- **`src/app/api/projects/{route.ts,[id]/route.ts}`** — the proxy routes for the projects resource; this is the template to copy for future resources (casings, tubings, calculations, etc.). Query params (`page`, `size`, `q`, `sort`, `scope`) pass straight through to the backend.
- **`src/lib/api/{query-keys,auth,projects}.ts`** — `queryKeys` is the single registry (no inline key arrays at call sites, no `auth` group — the current user isn't a query, see AuthContext below); `auth.ts`/`projects.ts` are one-file-per-resource TanStack Query hooks (`useLogin`, `useLogout`, `useProjectList`, `useCreateProject`, `useDeleteProject`) that call the proxy routes above, never the backend directly. `useLogin` reads `useAuth()` internally and calls `setUser` on success — no component needs to wire that up itself.
- **`src/proxy.ts`** — Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` (exported function is named `proxy`, not `middleware`); don't reintroduce a `middleware.ts`, it's deprecated and Next.js 16 warns on it. Checks presence of `access_token`. Present → `next()` (except an authed visit to `/login`, which redirects to `safeRedirectPath(?redirect)`). Missing + no `refresh_token` → redirect to `/login?redirect=<path+search>`. Missing + `refresh_token` present → the middleware **does** attempt a refresh: single-flights an internal `POST /api/auth/refresh` per refresh-token value (own `Map`, ~30s straggler cache — separate from the refresh route's own single-flight, needed because concurrent RSC/prefetch requests hit the middleware directly), reads the new access token off the response's `Set-Cookie` headers via `parseSetCookieValue` (not the JSON body — the refresh route returns `{ user }`, not `{ accessToken }`, so the token is never exposed to a body a script could read), rewrites the **current** request's `cookie` header (`NextResponse.next({ request: { headers } })`) so server components in this same render pass see the fresh token, and appends the `Set-Cookie` headers to the outgoing response for the browser. Three call sites now single-flight refresh independently (middleware, the refresh route itself, `apiFetch`) — each guards against a different pair of concurrent callers racing the one-time-use refresh token. Matcher includes `/login` (now gated via `PUBLIC_PATHS`, not the matcher) and must keep excluding `api` — the middleware's own internal refresh fetch would otherwise recurse into itself.
- **`src/lib/auth/`** — `auth-context.tsx` (`AuthProvider`/`useAuth`, holds `User | null` in plain `useState`, no client-side fetch — the initial value is server-bootstrapped, see root layout below), `guards.ts` (`requireUser()`/`requireRole(...roles)` for RSC-level role gating — `redirect()` throws `NEXT_REDIRECT` so it must stay outside any `try/catch`; nothing consumes these yet, they're the pattern for the first role-gated page), `safe-redirect.ts` (`safeRedirectPath` — local path only, rejects `//...` and `/login` to avoid a post-logout redirect loop).
- **Root layout `initialUser` bootstrap** (`src/app/layout.tsx`) — the layout is `async`; if the `access_token` cookie is present it calls `createServerClient().GET("/api/v1/auth/me")` (try/catch, branch on `response.ok`) once per full page load and passes the result into `<AuthProvider initialUser={...}>`. No client-side "who am I" fetch, no loading skeleton — `useAuth()` reads the user synchronously everywhere. This makes every route dynamically rendered (a `cookies()` call in the root layout) — expected, don't try to make routes static again.
- **`src/context/ReactQueryProvider.tsx`** — the `QueryClientProvider` (with devtools), mounted inside `ThemeProvider` in `layout.tsx`, itself wrapping `AuthProvider`. `staleTime: 30_000`, `retry: false`.
- **Error shape**: the generated spec has no `ErrorResponse` schema (same root cause as above — springdoc doesn't introspect the global exception handler). It's hand-declared in `src/lib/api/errors.ts` (`{ status, code, message, timestamp, details }`) along with an `isErrorResponse` type guard; mutation hooks throw the parsed error body as `unknown` and call sites narrow with that guard.
- **Dev login**: the backend bootstraps a `SUPER_ADMIN` on startup (dev profile) — `admin@hpd.local` / `ChangeMe123!` (from the backend's `application-dev.yml`). Note this account has no `organizationId`, so it **cannot create projects** (backend rule: "An organization is required to own a project") — create an organization + a `MEMBER`/`ADMIN` user under it via `POST /api/v1/organizations` and `/api/v1/users` to test project creation end-to-end.

### TanStack Query conventions

- Provider mounted in root layout. Defaults: `staleTime 30s`, `refetchOnWindowFocus: false`, `retry: 1`.
- **Always use `src/lib/api/query-keys.ts`** — never inline string arrays.
- One hook file per resource in `src/lib/api/`. Hooks fetch the **proxy**, not the backend.
- Smooth pagination: `placeholderData: (prev) => prev`.

**Mutation hooks — required patterns:**
```ts
const err: unknown = await res.json().catch(() => ({}));
throw err;                                                  // throw unknown so callers can cast for field errors

onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.resource.all }),   // void the floating promise
```

**Async event handlers — required patterns:**
```tsx
<form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
onClick={() => void handleConfirm()}
onFileSelected={(file) => void handleUpload(file)}
```

### Workspace state
All workspace state (active tab, casing/tubing sections, calc status, modals) lives in one `useReducer` in `src/components/workspace/reducer.ts`, exposed via React context in `WorkspaceContext.tsx` (`useWorkspace()` hook). `WorkspaceLeftPanel` and `WorkspaceRightCanvas` switch on `state.activeTab` (`'completion' | 'fluids' | 'ipr' | 'calc'`) to pick which form/canvas to render — the 4th tab (`calc`) is permanently locked and has no panel. The three unlocked tabs are independent; the "check" icon on the Completación/Fluidos tabs in `ProgressTabs.tsx` is a static per-step icon (not derived from data-readiness state), matching the original design's fixed demo scenario.

The "Ejecutar Cálculo IPR" button's idle → running → done → idle sequence is driven by two `setTimeout`s fired from `WorkspaceContext`'s `runCalc()` (not chained — both scheduled from the same click), not from the reducer itself, since reducers must stay pure.

### Shared atoms encode the design contract
`src/components/workspace/{UnitField,InputRow,GroupCard,SelectField,EmptyPanel}.tsx` are the load-bearing primitives — nearly every data-entry row and the four empty-state panels are built from them. `UnitField` in particular implements the "MUI endAdornment" pattern from the design spec: a single bordered wrapper (not a fixed-width chip) so numbers share one left edge and units hug their own right edge regardless of unit string length. Modifying these affects the whole app; don't create parallel one-off input styles.

`src/components/Modal.tsx` is the shared overlay/card wrapper (fade + pop-in animation, configurable width/z-index/alignment/scroll mode) used by the three modals (new-project, survey editor, casing/tubing size picker) and the logout confirmation dialog inside `UserMenu`.

### Header user menu
`src/components/explorer/UserMenu.tsx` is the shared account dropdown mounted in both `ExplorerHeader.tsx` and `WorkspaceNavbar.tsx` — despite living under `explorer/`, it isn't Explorer-specific; import it from there for any future header too. Self-contained: reads the user synchronously via `useAuth()` (`src/lib/auth/auth-context.tsx` — no loading state, the value is server-bootstrapped in the root layout) and signs out via `useLogout()` (`src/lib/api/auth.ts`), no user-data props. A `null` user (server-side `/me` failed at page load, e.g. backend down) falls back to "Usuario"/"?" rather than a skeleton. The dropdown's menu items (Mi perfil, Configuración de cuenta, Preferencias de notificación, Ayuda y soporte, Atajos de teclado) are wired as no-ops that just close the menu — wire them to real routes/features as those land. "Cerrar sesión" opens a confirmation dialog (built on the shared `Modal`) before actually calling `logout.mutate()`. Takes `variant?: "full" | "compact"` (`"full"` = avatar+name+role+chevron, `"compact"` = avatar+chevron only) — built for a future mobile layout; nothing renders `variant="compact"` yet, both current headers use the `"full"` default.

### Reference data
`src/lib/data.ts` holds the casing/tubing catalogs and directional survey stations — copied verbatim from the original prototype's logic block. `src/components/workspace/canvas/{TrajectoryChart,IprChart,PvtChart}.tsx` are hand-rolled inline SVG charts (no charting library) porting the original prototype's pixel-space math (margins, tick arrays, the Vogel IPR curve) 1:1; if the underlying data or chart size changes, the tick arrays and margins are hardcoded per component and must be updated together.

This data is still seed-only and the Workspace hasn't been wired to the API — see `docs/refactor-roadmap.md` (Stages 1-2) for the plan to replace it with real catalog/survey/IPR endpoints.

### Icons
All icons are inline SVGs in `src/components/icons.tsx` (no icon library dependency) — copied from the Feather-style paths in the original design so stroke widths/sizes match exactly.

## Conventions

- **Server Components by default.** `"use client"` only when needed.
- **No `useEffect` for data fetching.**
- **`cn()` utility** (`src/utils/cn.ts`, clsx + tailwind-merge) for dynamic classes only; plain strings stay plain.
- Path alias: `@/*` → `src/*`.
- Mobile-first (`sm:` `md:` `lg:` for larger).
- No comments unless genuinely non-obvious.
- Shared types in `src/interfaces/` — never inside `"use client"` files. Currently `workspace.ts` (`TabId`, `CalcStatus`, `PipeKind`, `CatalogEntry`, `PipeSection`, `SurveyStation`, `SurveyFullStation`, `SizeModalState`), `theme.ts` (`ThemeContext`, `Accent`, consumed by `context/ThemeContext.tsx`), `user.ts` (`User`, `UserRole`, consumed by `lib/auth/auth-context.tsx` and `lib/auth/guards.ts`), and `project.ts` (`ProjectListParams`, consumed by `lib/api/query-keys.ts` and `lib/api/projects.ts`). One file per domain — add new ones the same way rather than growing an existing file across unrelated concerns.

## Loading states

`react-loading-skeleton` (stylesheet imported once in `app/layout.tsx`). Use for noticeable waits (lists, dashboards, tables). Match skeleton shape to the element. Don't wrap every inline value. Pass `baseColor`/`highlightColor` as design tokens (e.g. `"var(--surface-2)"` / `"var(--surface-3)"`) — never hardcode skeleton colors. See `ProjectsTable.tsx` for a reference implementation. (`UserMenu.tsx` no longer needs one — the current user is server-bootstrapped into `AuthContext`, not fetched client-side.)

## Function syntax

Arrow functions everywhere — components, page/layout files, route handlers, plain helpers, hooks. Never the `function` keyword (`function foo() {}`, `export function foo() {}`, `async function foo() {}`), not even for top-level named functions:
```tsx
const MyComponent = ({ prop }: Props) => {
  return <div>{prop}</div>;
};
export default MyComponent;
```
Named exports: `export const X = (...) => { ... };`. Never `export default function` / `export function`. This also applies to Next.js Route Handlers — `export const POST = async (request: Request) => { ... };`, not `export async function POST(...) { ... }`. Close with `};`.

## Lint check

After any 2+ file change:
```bash
npx tsc --noEmit && yarn lint
```
Fix errors only. Pre-existing warnings (useReactTable, watch(), route `req.json()`) are intentional. Don't add `eslint-disable` without need.

## Commit hygiene

Don't commit unless explicitly asked. When asked, show staged diff and wait for confirmation.

## Source of truth for visual fidelity
`design_handoff_hydrapump/design-references/` contains the original prototype (`HydraPump Design Suite (standalone).html`, open-in-browser), the design token/density contract (`DESIGN_CONTRACT.md`), and the CSS→Tailwind migration plan (`TAILWIND_MIGRATION.md`). When in doubt about a spacing, color, or interaction detail, check there before guessing.

**`DESIGN.md`** (repo root) documents the design system as actually implemented in this codebase — token-to-Tailwind-utility mapping, component specs, screen layouts, and the state/interaction model. Read it before any styling or new-component work.
