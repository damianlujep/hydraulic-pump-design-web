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
- `/workspace/[id]` — **Workspace** (`src/app/(workspace)/workspace/[id]/page.tsx`, async RSC → `WorkspaceScreen`): the pump-design engine for one project, id in the path (not a query param — a project is scoped to its owner/org, and only one can be open at a time). The page fetches the project + both catalogs server-side via `createServerClient()` in parallel; a 404 from the backend calls `notFound()` (route-scoped `not-found.tsx`), a 403 renders a "sin acceso" card, other failures render a generic error card — all via `layout/WorkspaceErrorCard.tsx`. Data is handed to the client `WorkspaceScreen` as TanStack `initialData` (real hooks, no extra fetch on first paint); a route-level `loading.tsx` (`layout/WorkspaceSkeleton.tsx`) covers slower navigations. Bare `/workspace` (no id) just `redirect("/")`s. `?new=1` no longer means anything — a fresh project has empty `designData`, so the panels render empty on their own.
  - **Known quirk, not a bug**: this segment's `loading.tsx` makes Next stream the response — the shell (with the 200 status) flushes before the async page component resolves, so by the time it calls `notFound()`, the status code can't be changed anymore. The rendered content is correct (the real not-found UI shows), but a raw HTTP status check (`curl -w "%{http_code}"`, a monitoring probe, an integration test) will see `200`, not `404`. This is standard Next.js App Router streaming behavior for any segment that has both an async data-fetching page and a sibling `loading.tsx` — don't "fix" it by removing the skeleton without a real reason, and don't rely on the top-level status code for this route in tooling.
- `/` and `/workspace/[id]` live under the `(workspace)` route group, `/login` under `(full-width-pages)/(auth)` — both group layouts are currently bare passthroughs (`<>{children}</>`); `(auth)/layout.tsx` carries the login screen's full-viewport gradient/grid shell so `login/page.tsx` only renders the card. Route groups don't affect the URLs.

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

**Auth, projects (list/create/delete/detail/metadata), design-data save, edit locking, casing/tubing catalogs, and the IPR calculation** are all wired end-to-end — see `docs-user/refactor-roadmap.md` for what's still open (fluids/PVT persistence needs a backend `DesignDataDto` extension; Fetkovich + multi-test-point support; Stage 3 UX items).

- **`src/lib/api/schema.d.ts`** — generated by `yarn api:sync` (openapi-typescript). Committed; never hand-edit. Re-run after any backend contract change.
- **`src/lib/api/server-client.ts`** — `createServerClient()` builds a per-request `openapi-fetch` client with the `access_token` cookie attached as a Bearer header. Also exports `forwardOpenApiResponse`/`forwardOpenApiVoidResponse`, the two helpers every proxy route handler should use to turn a `client.GET/POST/DELETE(...)` result into a `NextResponse`.
  - **Non-obvious gotcha driving this**: the backend's generated OpenAPI spec documents no 4xx/5xx responses at all (every operation only has a `200`/`201` entry), so `openapi-fetch`'s `error` field types as `never` on every operation. Writing `if (error || !data)` type-checks but TypeScript narrows the `error`-truthy branch as unreachable and collapses everything inside it (including unrelated variables like `response`) to `never`. **Always branch on `response.ok`, never on `error`'s truthiness** — `response` stays a plain `Response` regardless, and `error` still holds the real backend error body at runtime despite its static type. Use `forwardOpenApiResponse` for endpoints with a response body, `forwardOpenApiVoidResponse` for endpoints whose success response has `content?: never` in the generated schema (e.g. delete) — the ordinary helper would wrongly 502 those since `data` is `undefined` on success too.
- **`src/lib/api/auth-cookies.ts`** — cookie read/write helpers used only by the auth routes: `parseRefreshToken` (extracts `refresh_token` from the backend's `Set-Cookie` headers via `getSetCookie()`, not `.get("set-cookie")` which comma-joins — thin wrapper over `parseSetCookieValue` in `cookies.ts`), `readRequestCookie` (extracts a cookie value from an incoming request's `Cookie` header — Route Handlers don't get `next/headers` `cookies()` cookies from the *backend's* perspective on outgoing manual `fetch`, so this is done by hand), `setAuthCookies`/`clearAuthCookies`/`clearAccessCookie`.
- **`src/lib/api/cookies.ts`** — the client/middleware-safe half (no `server-only` import, unlike `auth-cookies.ts`): the two cookie name/maxAge constant pairs, plus `parseSetCookieValue(setCookies, name)` — extracts a named cookie's value from an array of raw `Set-Cookie` headers. `src/proxy.ts` needs this to read the fresh `access_token` off the refresh route's response without importing a server-only module.
- **`src/lib/api/client-fetch.ts`** — `apiFetch`, the client-side fetch wrapper every TanStack hook uses instead of raw `fetch`. On a `401` it single-flights a `POST /api/auth/refresh` (module-level `refreshPromise` guard — the backend rotates refresh tokens on every use, so two concurrent 401s must not each trigger their own refresh) and retries once; a failed refresh redirects to `/login`.
- **`src/app/api/auth/{login,refresh,logout,me}/route.ts`** — the only code that calls the backend's auth endpoints. Status/cookie contract on `refresh`: no refresh cookie → 401, deletes the access cookie only; backend 401/403 → 401, deletes the access cookie only (**the refresh route never deletes the refresh cookie — only `logout` does**); backend unreachable/malformed → 502, **both cookies kept** (a transient backend outage must not log anyone out); success → 200, both cookies rotated. `refresh` also single-flights per refresh token at the route level (module-level `Map`, ~30s straggler cache for requests still holding the just-rotated-out token) — this is a *second* single-flight layer, independent of `apiFetch`'s and `proxy.ts`'s, because the browser and the middleware can both call this route concurrently. `login` forwards the backend's real status + a `Retry-After` header passthrough (429 rate-limit) and 502s if the backend itself is unreachable. `login`/`refresh` use raw `fetch` (not the typed client) because they need the raw `Set-Cookie` header, not just a parsed body.
- **`src/app/api/projects/{route.ts,[id]/route.ts,[id]/design-data/route.ts,[id]/lock/route.ts}`, `src/app/api/{casings,tubings}/route.ts`, `src/app/api/calculations/ipr/route.ts`** — the full set of proxy routes; `projects/route.ts` + `projects/[id]/route.ts` remain the template to copy for future resources. Query params (`page`, `size`, `q`, `sort`, `scope`) pass straight through to the backend on the list endpoint. Lock's `DELETE` (release) and the design-data `PUT`'s success both forward via `forwardOpenApiVoidResponse`/`forwardOpenApiResponse` respectively — the design-data route's `PUT` returns the fresh `ProjectResponse` (including the bumped `version`), and a stale `version` in the request body surfaces as a 409 with `code: "VERSION_CONFLICT"` that passes through untouched.
- **`src/lib/api/{query-keys,auth,projects,casings,tubings,calculations}.ts`** — `queryKeys` is the single registry (no inline key arrays at call sites, no `auth` group — the current user isn't a query, see AuthContext below); one-file-per-resource TanStack Query hooks that call the proxy routes above, never the backend directly. `projects.ts` also exports three **imperative, non-hook** lock helpers (`acquireProjectLock`, `heartbeatProjectLock`, `releaseProjectLock`) — lock acquire/heartbeat/release is a network *lifecycle* tied to mount/unmount, not a query. `releaseProjectLock` uses a raw `fetch(..., { keepalive: true })`, not `apiFetch`, so it survives `pagehide` and doesn't get caught in the 401-refresh dance. `useLogin` reads `useAuth()` internally and calls `setUser` on success — no component needs to wire that up itself.
- **`src/proxy.ts`** — Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` (exported function is named `proxy`, not `middleware`); don't reintroduce a `middleware.ts`, it's deprecated and Next.js 16 warns on it. Checks presence of `access_token`. Present → `next()` (except an authed visit to `/login`, which redirects to `safeRedirectPath(?redirect)`). Missing + no `refresh_token` → redirect to `/login?redirect=<path+search>`. Missing + `refresh_token` present → the middleware **does** attempt a refresh: single-flights an internal `POST /api/auth/refresh` per refresh-token value (own `Map`, ~30s straggler cache — separate from the refresh route's own single-flight, needed because concurrent RSC/prefetch requests hit the middleware directly), reads the new access token off the response's `Set-Cookie` headers via `parseSetCookieValue` (not the JSON body — the refresh route returns `{ user }`, not `{ accessToken }`, so the token is never exposed to a body a script could read), rewrites the **current** request's `cookie` header (`NextResponse.next({ request: { headers } })`) so server components in this same render pass see the fresh token, and appends the `Set-Cookie` headers to the outgoing response for the browser. Three call sites now single-flight refresh independently (middleware, the refresh route itself, `apiFetch`) — each guards against a different pair of concurrent callers racing the one-time-use refresh token. Matcher includes `/login` (now gated via `PUBLIC_PATHS`, not the matcher) and must keep excluding `api` — the middleware's own internal refresh fetch would otherwise recurse into itself.
- **`src/lib/auth/`** — `auth-context.tsx` (`AuthProvider`/`useAuth`, holds `User | null` in plain `useState`, no client-side fetch — the initial value is server-bootstrapped, see root layout below), `guards.ts` (`requireUser()`/`requireRole(...roles)` for RSC-level role gating — `redirect()` throws `NEXT_REDIRECT` so it must stay outside any `try/catch`; nothing consumes these yet, they're the pattern for the first role-gated page), `safe-redirect.ts` (`safeRedirectPath` — local path only, rejects `//...` and `/login` to avoid a post-logout redirect loop).
- **Root layout `initialUser` bootstrap** (`src/app/layout.tsx`) — the layout is `async`; if the `access_token` cookie is present it calls `createServerClient().GET("/api/v1/auth/me")` (try/catch, branch on `response.ok`) once per full page load and passes the result into `<AuthProvider initialUser={...}>`. No client-side "who am I" fetch, no loading skeleton — `useAuth()` reads the user synchronously everywhere. This makes every route dynamically rendered (a `cookies()` call in the root layout) — expected, don't try to make routes static again.
- **`src/context/ReactQueryProvider.tsx`** — the `QueryClientProvider` (with devtools), mounted inside `ThemeProvider` in `layout.tsx`, itself wrapping `AuthProvider`. `staleTime: 30_000`, `retry: false`.
- **Error shape**: the generated spec has no `ErrorResponse` schema (same root cause as above — springdoc doesn't introspect the global exception handler). It's hand-declared in `src/lib/api/errors.ts` (`{ status, code, message, timestamp, details }`) along with an `isErrorResponse` type guard; mutation hooks throw the parsed error body as `unknown` and call sites narrow with that guard.
- **Dev login**: the backend bootstraps a `SUPER_ADMIN` on startup (dev profile) — `admin@hpd.local` / `ChangeMe123!` (from the backend's `application-dev.yml`). Note this account has no `organizationId`, so it **cannot create projects** (backend rule: "An organization is required to own a project") — create an organization + a `MEMBER`/`ADMIN` user under it via `POST /api/v1/organizations` and `/api/v1/users` (called directly against `:8080` with the `SUPER_ADMIN`'s token — no proxy route exists for these yet) to test project creation end-to-end.
- **Testing with a raw backend JWT**: don't paste a token straight into a cookie/header and expect it to stay usable for a testing session — this backend's dev config issues access tokens with a ~15 minute expiry (check `exp - iat` before relying on one). For anything beyond a single quick curl, log in through the real flow instead: `curl -c cookies.txt -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"...","password":"..."}'`, then reuse `cookies.txt` (`-b`) against the `:3000` proxy routes — this mints a fresh cookie session through the actual BFF path instead of racing a short-lived token.

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

### Workspace component organization
`src/components/workspace/` is grouped by role rather than left flat: `atoms/` (`UnitField`, `InputRow`, `SelectField`, `GroupCard`, `EmptyPanel`), `state/` (`WorkspaceContext.tsx`, `reducer.ts`, `useEditLock.ts`, `schemas.ts`, `designData.ts`, `survey.ts`), `layout/` (`WorkspaceScreen`, `WorkspaceNavbar`, `WorkspaceLeftPanel`, `WorkspaceRightCanvas`, `WorkspaceSkeleton`, `WorkspaceErrorCard`, `ProgressTabs`, `ReadOnlyBanner`), `modals/` (`SurveyModal`, `SizePickerModal`, `ConflictDialog`), `casing-tubing/` (`CasingTubingBuilder.tsx`, `casingTubing.ts`), plus the pre-existing `panels/` (RHF forms) and `canvas/` (hand-rolled SVG charts). Put new workspace files in whichever bucket matches their role instead of adding them flat.

### Workspace state — reducer + hoisted RHF forms hybrid
Document data that's genuinely just text fields (completion depths, fluids, IPR inputs) lives in three **hoisted** `react-hook-form` instances (`zodResolver`, `mode: "onTouched"`, schemas in `state/schemas.ts`) created once in `WorkspaceProvider` and exposed via context as `forms: { completion, fluids, ipr }` — hoisted because the left panel unmounts per tab, so form state must live above it. Everything else (`activeTab`, `calcStatus`, `survey` rows, `casing`/`tubing` sections, `iprResult`, save/version state, modals) lives in one `useReducer` in `state/reducer.ts`, exposed via the same `state/WorkspaceContext.tsx` (`useWorkspace()` hook).

**Step completion is derived, never stored**: `completion`, `fluids`, `ipr` (`StepId` in `interfaces/workspace.ts`) are independent and all accessible from the start (no wizard gating between them). `stepDone: StepDoneMap` in context is computed each render — `completion` needs its RHF form valid *and* every casing/tubing section picked+lengthed *and* `state.survey.length > 0`; `fluids`/`ipr` need their whole form valid (every visible numeric field filled, not just the ones sent to the backend); `ipr` additionally needs `state.iprResult !== null` with its stored fingerprint matching the current form values (`iprFingerprint`, set by `CALC_SUCCESS`) — editing any calc-relevant field after a successful calc reverts the pill to in-progress even though the chart stays visible. The `calc` tab pill (`layout/ProgressTabs.tsx`) unlocks only once all three `stepDone` entries are true; its panel is a placeholder (view still in development).

Validation errors only render once a field's `formState.touchedFields[name]` is true (blur-driven, via `mode: "onTouched"`) — `formState.isValid`/`.errors` are still computed from mount (`completionForm.trigger()` etc. fire once on mount in `WorkspaceContext`) so step pills are accurate without flashing error text at untouched fields.

The "Ejecutar Cálculo IPR" button calls the real `POST /api/calculations/ipr` (Vogel only this session — the model select is a single fixed option; Fetkovich + a multi-test-point editor is a planned follow-up). `runCalc()` in `WorkspaceContext` pre-validates with `iprForm.trigger()` + `buildIprRequest()` (`state/designData.ts`, mirrors the backend's Vogel validation plus the Pb≤Ps cross-form rule) before sending anything — an invalid request is never dispatched to the network.

### Design-data autosave, optimistic locking, and edit locking
`PUT .../design-data` replaces the **entire** `designData` object — there's no partial-update endpoint. `toDesignDataDto()` (`state/designData.ts`) therefore always re-includes `state.newProjectInfo` verbatim (the project-creation metadata, hydrated once from the initial fetch and never edited in the Workspace) alongside whatever changed. If a future edit to `toDesignDataDto` drops that passthrough, the next autosave will silently erase the project's name/well/company/etc. from the backend — there's no error, it just vanishes on the next successful save.

`state/WorkspaceContext.tsx` autosaves the persistable slice of state (completion form values + casing/tubing sections + survey, via `toDesignDataDto()`) 2s after the last change, with a 10s max-wait checkpoint during continuous typing. Saves are serialized (an edit arriving mid-save is queued, never fired concurrently) and skipped if the serialized payload didn't actually change since the last successful save. `state/reducer.ts`'s `revision` counter (bumped by data-mutating actions, including the synthetic `MARK_DIRTY` the completion form's `watch()` subscription dispatches) drives the debounce effect and lets `SAVE_SUCCESS` tell whether the save it's resolving is still current (`saveStatus: "saved"`) or was superseded by further edits mid-flight (`saveStatus: "dirty"`). A `pagehide` listener flushes a final keepalive `PUT` + releases the lock so a closed tab doesn't strand an editor. `version` (from the backend's optimistic lock) is taken from each successful save's response, never refetched. A 409 `VERSION_CONFLICT` sets `saveStatus: "conflict"`, which renders `modals/ConflictDialog.tsx` (reload the server copy vs. keep editing).

`state/useEditLock.ts` acquires the edit lock on mount (skipped entirely for `VIEWER`/`NONE` permission — no API call), heartbeats at half the server's TTL (min 15s, one 5s retry on failure before dropping to read-only), and releases on unmount. `canEdit` in context is `true` only when the caller has `OWNER`/`EDITOR` permission *and* holds the lock; `layout/WorkspaceLeftPanel` wraps its content in `<fieldset disabled={!canEdit}>` (one line disables every input) and `layout/ReadOnlyBanner.tsx` explains why (no permission / held by another user with a manual retry / lock error).

### Shared atoms encode the design contract
`src/components/workspace/atoms/{UnitField,InputRow,GroupCard,SelectField,EmptyPanel}.tsx` are the load-bearing primitives — nearly every data-entry row and the four empty-state panels are built from them. `UnitField` in particular implements the "MUI endAdornment" pattern from the design spec: a single bordered wrapper (not a fixed-width chip) so numbers share one left edge and units hug their own right edge regardless of unit string length. `UnitField` is wrapped in `forwardRef` (needed so `react-hook-form`'s `register()` can attach its ref for focus-on-error) — `SelectField` isn't, since no `<select>` is RHF-registered yet. Modifying these affects the whole app; don't create parallel one-off input styles.

`src/components/Modal.tsx` is the shared overlay/card wrapper (fade + pop-in animation, configurable width/z-index/alignment/scroll mode) used by the modals (new-project, survey editor, casing/tubing size picker, design-data conflict) and the confirmation dialogs — logout inside `UserMenu`, delete-project inside `ProjectsTable`.

**Destructive-action confirmation pattern**: any action that permanently destroys data (delete-project is the existing example) must confirm via a `Modal`-based dialog before firing — never `window.confirm`. Copy the shape from `ProjectsTable.tsx`'s delete confirm or `UserMenu.tsx`'s logout confirm: `role="alertdialog"` with an `aria-labelledby` tied to the heading, a danger-tinted icon circle, a message naming the specific item being destroyed, and two buttons ("Cancelar" / the destructive action in `bg-danger`). Track the pending target in local state (e.g. `{ id, name } | null`) rather than a boolean, so the dialog can name what's about to be deleted.

### Numeric inputs: sanitize-on-change, not `type="number"`
Every numeric field in completion/fluids/IPR/survey is a plain text input (never `type="number"`) sanitized on each keystroke via `sanitizeNumeric` (`state/numericInput.ts`) — digits plus one decimal point, capped at 3 decimals, no minus sign (every field in these forms is positive or non-negative). `type="number"` was rejected because it still permits `e`/`+`/`-`, can't cap decimal places, and — combined with RHF's uncontrolled `register()` — clears itself on a momentarily-unparseable value like `"1."` while typing. `UnitField` defaults to `inputMode="decimal"` for the mobile keypad.

For RHF-registered fields, use `registerNumeric(form, name)` instead of `form.register(name)` — it wraps the returned `onChange` to sanitize `e.target.value` in place before RHF sees it (safe because register-bound inputs are uncontrolled via `ref`, so there's no `value` prop fighting the correction). Plain non-RHF numeric inputs (e.g. `CasingTubingBuilder`'s pipe-length field, which is `dispatch`-controlled) call `sanitizeNumeric` directly in their own `onChange`.

**`InputRow` must render the same element tree in both its error and non-error states** (`label > row-div > span + children`, with the error message as an added/removed trailing sibling) — it used to be two structurally different branches (error wrapped `children` in an extra `div`), so the moment a field's error cleared mid-type, React saw a different element type at the input's position and unmounted/remounted it, dropping focus after every keystroke.

**Don't let a field's error boolean/message be independently re-derived by two different consumers.** `UnitField`'s red border and `InputRow`'s error text must come from the *same* computed value, not two separate reads of RHF's Proxy-backed `formState.errors`/`touchedFields` — under React Compiler's memoization, a child component whose props (`form`, `name`, `unit`) don't themselves change can bail out of re-rendering even though what it reads from `form.formState` internally has changed, leaving it stale relative to a sibling that reads the same state directly in a render that isn't skipped. This is why `FieldUnit` (in `FluidsForm.tsx`/`IprForm.tsx`) takes `error` as a prop instead of computing it from `form.formState` itself, and why `CompletionForm.tsx` computes each field's error into a local `const` once and passes that same value to both `InputRow` and `UnitField`.

### Header user menu
`src/components/explorer/UserMenu.tsx` is the shared account dropdown mounted in both `ExplorerHeader.tsx` and `WorkspaceNavbar.tsx` — despite living under `explorer/`, it isn't Explorer-specific; import it from there for any future header too. Self-contained: reads the user synchronously via `useAuth()` (`src/lib/auth/auth-context.tsx` — no loading state, the value is server-bootstrapped in the root layout) and signs out via `useLogout()` (`src/lib/api/auth.ts`), no user-data props. A `null` user (server-side `/me` failed at page load, e.g. backend down) falls back to "Usuario"/"?" rather than a skeleton. The dropdown's menu items (Mi perfil, Configuración de cuenta, Preferencias de notificación, Ayuda y soporte, Atajos de teclado) are wired as no-ops that just close the menu — wire them to real routes/features as those land. "Cerrar sesión" opens a confirmation dialog (built on the shared `Modal`) before actually calling `logout.mutate()`. Takes `variant?: "full" | "compact"` (`"full"` = avatar+name+role+chevron, `"compact"` = avatar+chevron only) — built for a future mobile layout; nothing renders `variant="compact"` yet, both current headers use the `"full"` default.

### Reference data
`src/lib/data.ts` (seed catalogs/survey) is gone — casings/tubings come from `GET /api/casings` / `GET /api/tubings` (`useCasings`/`useTubings`, `staleTime: Infinity`), survey rows live in `state.survey`, hydrated from `designData.directionalSurvey`. `src/components/workspace/canvas/{TrajectoryChart,IprChart,PvtChart}.tsx` are still hand-rolled inline SVG charts (no charting library) using the original prototype's pixel-space scaffolding (margins hardcoded per component), but `TrajectoryChart`/`IprChart` now take their data as props and compute axis maxima/ticks via `canvas/chartScale.ts` (`niceMax`/`buildTicks`) instead of hardcoded constants. `PvtChart` is still a static demo (no backend PVT endpoint exists yet).

`src/components/workspace/casing-tubing/casingTubing.ts`'s `PipeSection` is keyed by backend catalog `id` (`{ catalogId: number | null; length: string }`), not a seed-array index — `state/designData.ts`'s `toCompletionDto`/`fromCompletionDto` map sections positionally (index 0/1/2 → Upper/Middle/Bottom) to `CompletionDto`'s per-slot OD/ID/length fields, with `casingSelectionId`/`tubingSelectionId` taken from the bottom-most picked section and reconstructed on hydrate via an OD+ID catalog lookup (`findTubularByDiameters`, selection id as tiebreaker) — the backend only stores one selection id per pipe kind, so a hydrate-time OD/ID collision across different weights/grades is a known lossy edge case (flagged for the API team, not fixed frontend-side).

### Icons
All icons are inline SVGs in `src/components/icons.tsx` (no icon library dependency) — copied from the Feather-style paths in the original design so stroke widths/sizes match exactly.

## Conventions

- **Server Components by default.** `"use client"` only when needed.
- **No `useEffect` for data fetching.**
- **`cn()` utility** (`src/utils/cn.ts`, clsx + tailwind-merge) for dynamic classes only; plain strings stay plain.
- Path alias: `@/*` → `src/*`.
- Mobile-first (`sm:` `md:` `lg:` for larger).
- No comments unless genuinely non-obvious.
- Shared types in `src/interfaces/` — never inside `"use client"` files. Currently `workspace.ts` (`TabId`, `CalcStatus`, `PipeKind`, `PipeSection`, `SurveyRow`, `SizeModalState`, `SaveStatus`, `StepId`, `StepDoneMap`, `LockView`), `theme.ts` (`ThemeContext`, `Accent`, consumed by `context/ThemeContext.tsx`), `user.ts` (`User`, `UserRole`, consumed by `lib/auth/auth-context.tsx` and `lib/auth/guards.ts`), and `project.ts` (`ProjectListParams`, consumed by `lib/api/query-keys.ts` and `lib/api/projects.ts`). One file per domain — add new ones the same way rather than growing an existing file across unrelated concerns. RHF form-value types (`CompletionFormValues`, `FluidsFormValues`, `IprFormValues`) live in `src/components/workspace/state/schemas.ts` instead, since they're `z.infer` derivations of the zod schemas there, not hand-declared interfaces.

## Loading states

`react-loading-skeleton` (stylesheet imported once in `app/layout.tsx`). Use for noticeable waits (lists, dashboards, tables). Match skeleton shape to the element. Don't wrap every inline value. Pass `baseColor`/`highlightColor` as design tokens (e.g. `"var(--surface-2)"` / `"var(--surface-3)"`) — never hardcode skeleton colors. See `ProjectsTable.tsx` for a reference implementation. (`UserMenu.tsx` no longer needs one — the current user is server-bootstrapped into `AuthContext`, not fetched client-side.)

## Toasts

`sonner`, mounted once as `<AppToaster />` in `app/layout.tsx` (inside `AuthProvider`, after `{children}`). Styled via the `.app-toast*` classes in `globals.css` (tokens only, no hex) rather than sonner's own theme prop. Use `toast.error(...)` for background/async failures (autosave errors, lost edit lock, IPR calc errors) — not for inline form validation, which stays as rendered field errors.

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

**React Compiler (`reactCompiler: true` in `next.config.ts`) enforces two rules as lint `error`s, not warnings, and both are easy to trip in hook-heavy code:**
- `react-hooks/purity` — calling `Date.now()`/`new Date()` (or other impure calls) anywhere lexically inside a component/hook function body is flagged, even inside a nested closure that's only ever invoked from a callback/effect, never during render. The compiler's static analysis doesn't trace call sites — it just scans the hook's own source text. Fix: move the impure logic into a plain function declared at module scope (outside the hook) that takes whatever it needs as parameters; the compiler doesn't analyze code outside the hook body. See `state/useEditLock.ts` — `heartbeatDelay`/`scheduleHeartbeat`/`runHeartbeat`/`acquireLock` are module-level, not nested inside `useEditLock`, specifically to avoid this.
- `react-hooks/set-state-in-effect` — calling `setState` as a direct statement in a `useEffect` body (the common "reset local state when some flag changes" pattern) is flagged, even for a one-line guard. Fix: use React's documented "adjust state during render" idiom instead — track the previous value of the triggering condition in its own state, compare it during render, and call `setState` directly in the render body (not inside `useEffect`) when it changes. See `modals/SurveyModal.tsx`'s `wasOpen`/`draft` reset for the pattern.

## Commit hygiene

Don't commit unless explicitly asked. When asked, show staged diff and wait for confirmation.

## Source of truth for visual fidelity
`design_handoff_hydrapump/design-references/` contains the original prototype (`HydraPump Design Suite (standalone).html`, open-in-browser), the design token/density contract (`DESIGN_CONTRACT.md`), and the CSS→Tailwind migration plan (`TAILWIND_MIGRATION.md`). When in doubt about a spacing, color, or interaction detail, check there before guessing.

**`DESIGN.md`** (repo root) documents the design system as actually implemented in this codebase — token-to-Tailwind-utility mapping, component specs, screen layouts, and the state/interaction model. Read it before any styling or new-component work.
