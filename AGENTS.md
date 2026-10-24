# AGENT.md

Persistent project context for Antigravity (and any other coding agent working on this repo). Follow this file on every task without being reminded. If a one-off request conflicts with architecture/security rules here, flag it before deviating — but minor style requests can override formatting preferences.

---

## 1. Project Identity

A browser-based **real Pokémon game** — actual species, actual mechanics, actual data (not an original "monster-catching" game with reskinned creatures). Fidelity to the real Pokémon games is a hard requirement for anything not explicitly marked as a house rule.

- **Data source of truth:** [Astranox-data](https://github.com/Ansh-Amipara/Astranox-data) — custom static JSON repository seeded once into MongoDB, never called live at runtime.
- **Mechanics/presentation reference:** [PokémonDB](https://pokemondb.net/) — tie-breaker for battle-relevant mechanics when PokeAPI's raw data is ambiguous; reference for dex-page structure (not copied text/design).
- **Mechanics baseline: locked to Gen 9-era rules** unless a mechanic is explicitly marked below as a house rule. This was previously an open item — it is now closed.
- **No invented species, typing rules, or stat formulas.** If a mechanic isn't in the real games, it must be explicitly flagged as a house rule (see Section 9), never blended in as if canon.

---

## 2. Tech Stack (locked)

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Frontend state/data | Zustand (client state — access token + user only, in-memory), TanStack Query (server state) |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | MongoDB |
| Auth | JWT access token (in-memory, short-lived) + refresh token (rotated, stored hashed server-side, delivered via `httpOnly` cookie) |
| Package manager | pnpm (monorepo: `/client`, `/server`, `/packages/shared`) |

Don't introduce a new dependency or swap any of the above without asking first.

---

## 3. Repo Structure (current, actual)

```
/client
  src/
    pages/
      Home.tsx
      Login.tsx / Register.tsx
      StarterSelection.tsx
      TrainerDashboard.tsx
      BattleScreen.tsx
      admin/AdminLogin.tsx, AdminDashboard.tsx, UserDetail.tsx
    services/           # api.ts + per-feature services, no fetch/axios in components
    store/              # auth.store.ts (Zustand — access token + user, in-memory only)
    components/ui/      # shared Button/Dialog/Badge/Card etc.
/server
  src/
    game/                       # pure, DB-free domain logic
      battle/                   # stats.ts, damage.ts — Phase 3
      instance/                 # PokemonInstance factory/service — Phase 4
      battle-state/             # turn-order.ts, status-effects.ts, turn-resolver.ts — Phase 5
      constants/natures.ts
    modules/
      auth/                     # register/login/refresh/logout, requireAuth/requireAdmin
      admin/                    # user management, audit log
      trainers/                 # TrainerSave, party/PC, starter selection
      battles/                  # BattleSession, wild encounters, wild-ai, turn wiring — Phase 7
    common/
      middleware/                # require-auth, require-admin, rate-limiter, error-handler
      errors/                     # AppError + subclasses
      utils/
      constants/
    config/                     # env.ts (Zod-validated), logger.ts (pino)
    scripts/seed/                # PokeAPI seed pipeline — Phase 2
    prisma/
      schema.prisma
      migrations/
    app.ts
    server.ts
```

Feature-based modules. Shared/cross-cutting code only in `common/`. Don't import across unrelated feature modules directly.

---

## 4. Architecture Rules (non-negotiable)

**Dependency direction:** `routes → controller → service → repository → database`. Never the reverse.

- **Routes:** wire up endpoint + middleware only. No logic.
- **Controllers:** parse request, call service, shape response. Never touch Prisma directly.
- **Services:** business logic. Never contain direct Prisma calls (call the repository).
- **Repositories:** all Prisma queries live here.
- **`game/` modules (`battle/`, `instance/`, `battle-state/`) are pure and DB-free.** No Prisma imports anywhere inside them, ever. Static reference data they need (species base stats, type matchups, learnsets) is passed in by the caller as a context object (`SpeciesContext`, `BattleContext`) — the repository/service layer does the DB reads and injects the data. This boundary has been enforced consistently since Phase 3 and must not be violated by future phases.
- **Mapping layer:** `trainers/owned-pokemon.mapper.ts` converts between the DB row shape (`OwnedPokemon`) and the pure `PokemonInstance` domain type. The mapper itself must not do DB lookups (e.g. species base stats must be passed in as a parameter, not fetched internally) — this preserves the purity boundary above.
- **Server-Authoritative Exploration & Battles:** Exploration and battles are server-authoritative; the client sends intents only. Game rules live in packages/battle-engine and packages/game-map (pure, seeded RNG). Battle outcomes are WON | CAPTURED | DEFEATED and are finalized exactly once, in a transaction, with an audit entry.

**Frontend:** components are presentational; business/data logic lives in hooks or services. No `fetch`/`axios` in components — always through `services/` + a TanStack Query hook.

---

## 5. Conventions

**Naming:** camelCase functions/variables (verb-first functions), PascalCase types/components, `UPPER_SNAKE_CASE` constants, booleans prefixed `is/has/can/should`.

**UI Inputs:** Do NOT use `<input type="number">` as it introduces unwanted browser styling (spinners). Instead, use `<input type="text">` and strip non-digit characters in the `onChange` handler (e.g., `e.target.value.replace(/\D/g, '')`) to enforce digit-only input.

**TypeScript:** no `any`. Explicit interfaces for all payloads/DTOs/domain types.

**API response envelope** (used everywhere, typed once in shared types):
```json
{ "success": true, "data": {}, "meta": { "page": 1, "total": 0 } }
{ "success": false, "error": { "code": "SOME_CODE", "message": "..." } }
```

**Errors:** typed (`AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`) from services/controllers, formatted by one global Express error-handling middleware. Never hand-roll per-route error JSON. Never `console.log` — use the pino logger.

**Randomness in game logic:** every RNG-dependent function (damage roll, accuracy, paralysis/freeze/speed-tie checks) takes an optional injected override value for deterministic testing, generating real randomness only when omitted. This pattern is established from Phase 3 onward — keep using it for any new randomized mechanic.

---

## 6. Database Rules

- Every table: `id (uuid)`, `createdAt`, `updatedAt`.
- Explicit `onDelete` behavior on every foreign key.
- Index every foreign key and every column used in a hot-path `WHERE`/`ORDER BY`.
- Multi-step atomic writes go inside `prisma.$transaction` (e.g. party slot swaps, starter selection + `starterChosenAt` update).
- Sensitive fields (`passwordHash`, token hashes) excluded via explicit `select` — verified by a dedicated test that no endpoint ever returns them.
- Schema changes are additive where possible; changes to existing models are called out explicitly and checked against dependent modules (e.g. a `TrainerSave` field addition should prompt re-running `auth` and `battles` tests too, not just `trainers`).

---

## 7. Auth & Sockets (Phase 1 implementation)

- **Cookie auth only:** No tokens in JS-readable storage (`localStorage`, `sessionStorage`, or Zustand state). Both the short-lived access token (15m) and rotating refresh token (7d) are delivered as `httpOnly` cookies (`SameSite=Lax`, `Secure` in production, domain via env `COOKIE_DOMAIN`).
- **Refresh Token Family & Reuse Detection:** Only SHA-256 hashes of refresh tokens are stored in MongoDB (`RefreshToken` collection with `userId`, `tokenHash`, `expiresAt`, `revokedAt`, `replacedBy`, `userAgent`, `ip`). When refreshing, tokens rotate. If a revoked token is replayed, the entire token family is immediately revoked, forcing re-login across all devices.
- **Session Endpoints:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` (revokes current session), and `POST /auth/logout-all` (revokes all refresh tokens and disconnects active user sockets).
- **CSRF Protection:** State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) are protected via `SameSite=Lax` cookies combined with strict `Origin` header verification matching `WEB_ORIGINS`.
- **Socket.io Authentication & Policy:** Handshake authenticates via the `accessToken` cookie. Enforces a single active socket per user (kicking superseded sessions with `SESSION_SUPERSEDED`), disconnects cleanly on token expiration, and verifies user ownership on all actions (`verifySocketOwnership`).
- **CORS & Security:** Dynamic CORS and Socket.io origin validation against `WEB_ORIGINS` (no wildcards in production), production Helmet CSP (Cloudinary, raw GitHub sprites, WebSockets), and Express `trust proxy` enabled for ingress/k8s.
- **Client Request Queue:** On 401, Axios queues concurrent requests behind a single silent `/auth/refresh` call, preventing loops and duplicate refresh storms.

---

## 8. Core Game Systems — status

| System | Status | Notes |
|---|---|---|
| Astranox-data seed pipeline | Built (Replaced PokeAPI) | Fetches static JSON from custom GitHub repo |
| Stat/damage math | Built (Phase 3) | Exact Gen V+ intermediate truncation (verified: level-47 case, 38 vs. naive 39) |
| `PokemonInstance` state | Built (Phase 4) | Pure, `SpeciesContext`-injected, validated (IV/EV/nature/ability/moveset) |
| Turn-based battle engine | Built (Phase 5) | Damage-only moves; pre-existing status effects (burn/poison/paralysis/sleep/freeze) implemented; moves that inflict new statuses/stat changes are NOT built — blocked on `Move` schema lacking structured `ailment`/`stat_changes` data from PokeAPI |
| Trainer/Party/PC persistence | Built (Phase 6) | Party (6, no gaps), infinite paginated Pokemon list (PC boxes removed), mapper round-trips `PokemonInstance` |
| End-to-end wild battle | Built (Phase 7) | `BattleSession`, wild encounter placeholder, random wild AI, Struggle stubbed (see house rules) |
| Frontend UI (trainer/battle) | Built (Phase 8) | Dashboard, battle screen, TanStack Query hooks, no direct fetch in components |
| Auth session persistence | Fixed | httpOnly refresh cookie + in-memory access token + silent boot rehydration |
| Starter selection | Built | See house rule below |
| Move-inflicted status/stat effects | Not built | Needs `Move` schema patch (structured `ailment`, `ailment_chance`, `stat_changes`) |
| Catching wild Pokémon | Built | Canonical Gen V+ 4-shake threshold algorithm via `@astranox/battle-engine` |
| XP/leveling from battle | Not built | |
| Zone/encounter tables | Built | 7 elemental Wilderness Realms covering all 18 types and 100% of species in Astranox-data |
| Team switching mid-battle | Not built | Battle currently ends if the lead faints |
| Abilities/items/weather effects | Not built | |

---

## 9. House Rules (explicit deviations from canon — do not present as real-game mechanics)

- **Starters are the classic Grass/Fire/Water trio from Generations 1-9** (Bulbasaur to Quaxly). One-time choice, enforced server-side (`TrainerSave.starterChosenAt`). Generated at level 5 with standard random IVs and a level-appropriate moveset from the real learnset data.
- **Mega Evolution & Gigantamax unlock via Battle**: Mega Stones and Dynamax items (e.g. Wishing Pieces, Max Mushrooms) are completely removed from the game. To unlock Mega Evolution or Gigantamax for a Pokémon, the player must defeat that specific Mega or G-Max species in battle (which adds the species ID to `TrainerSave.unlockedForms`). Once unlocked, the player can freely evolve and devolve their Pokémon on the Pokemon page.
- **Wilderness Realms**: Wild encounters occur across 7 elemental Wilderness Realms (Volcano, Ocean, Storm Peaks, Forest, Shadow Hollow, Mind Temple, Iron Dojo) covering all 18 types and all species. 2D grid/tile movement is removed; exploration is realm-based.
- **Wild AI is a placeholder**: picks a random valid move. Not real battle AI.
- **No PP**: The concept of Power Points (PP) is completely removed. Moves can be used infinitely. As a result, Struggle is also removed.

---

## 10. Security Checklist (apply to every new endpoint)

- [ ] `requireAuth` applied if the endpoint needs a logged-in user
- [ ] Ownership check — does this user actually own the resource being read/modified? (Not just "are they logged in.")
- [ ] Input validated with Zod before it reaches business logic
- [ ] Rate limiting on auth/sensitive endpoints
- [ ] No secrets/connection strings/API keys hardcoded — pulled from validated env config
- [ ] No raw SQL string concatenation
- [ ] Error responses don't leak stack traces or internal details
- [ ] `passwordHash`/token hashes never appear in any response, including admin endpoints

---

## 11. Testing

- Services: unit tested, repository mocked.
- Routes: integration tested (supertest) against a real test MongoDB instance — cookie-based auth flows use `request.agent(app)` to persist cookies across calls, not manual token-passing.
- Game logic (`game/` modules): pure unit tests, no DB access, deterministic via injected RNG overrides. Known-good values cross-checked against real game/PokémonDB data (e.g. exact stat totals, exact damage at non-level-50 values) — not just "the formula runs."
- Persistence round-trips (e.g. the `PokemonInstance` ↔ `OwnedPokemon` mapper) get an explicit round-trip equality test, not just "creation works."
- When a schema field changes, re-run the full suite (all modules), not just the module actively being edited — cross-module breakage is easy to miss otherwise.
- `pnpm lint` and `pnpm typecheck` must pass project-wide before a task is considered done, not just on the touched module.

---

## 12. Working Agreement for Antigravity

- **Read existing code before writing new code.** Match existing patterns in the module you're touching.
- **Minimal scope changes.** A phase's scope guard (stated in its build prompt) means don't touch files outside it — if something outside scope seems necessary, stop and ask rather than editing it.
- **No unrequested business rules or features.** Do not invent product decisions (e.g. hardcoded admin limits, extra UI flows, new endpoints) that weren't asked for. If you think something is missing, flag it as a question, don't silently add it.
- **Explain deviations.** If you diverge from a rule in this file, say so explicitly and why.
- **No new dependencies without approval.**
- **Prefer editing over duplicating.** Search for an existing component/hook/service/util before creating a new one.
- **Run before claiming done.** Lint, typecheck, and the relevant *and full* test suite must actually pass — state clearly which scope was actually run, not just "tests pass."
- **State which real-game source you're implementing from** before building any battle mechanic (a PokeAPI field or a PokémonDB page). If you can't point to one, stop and ask rather than inventing a plausible-sounding number.

---

## 13. Commands

```bash
# Install
pnpm install

# Dev (client + server)
pnpm dev

# Lint / typecheck (run project-wide, not per-module, before calling a task done)
pnpm lint
pnpm typecheck

# Tests
pnpm test                              # full suite
npx vitest run <path>                  # scoped, for iteration only — not a substitute for the full run before done

# Prisma
pnpm prisma db push
pnpm prisma studio

# Seed (Astranox-data → MongoDB)
pnpm run seed

# Build
pnpm build
```

---

## 14. Open Items

- [ ] **Single-admin lockout** in `admin.service.ts` — confirm intentional or revert (unresolved).
- [ ] `Move` schema patch for structured secondary effects (`ailment`, `ailment_chance`, `stat_changes`, `flinch_chance`, etc.) — needed before status-inflicting/stat-changing moves or real Struggle can be built.
- [ ] Real zone/encounter-table system to replace the wild encounter placeholder.
- [ ] Catching mechanic.
- [ ] XP/leveling from battle.
- [ ] Team switching mid-battle.
- [ ] Verify the separate admin-portal login flow got the same httpOnly-cookie auth fix as the player login flow (built somewhat independently earlier — confirm it wasn't missed).

---

## 15. DESIGN RULES (strict)

- **Base Theme:** White background with supporting black and grey palette.
- **Functional State Colors (Authorized):** Green, amber, and red are authorized for Pokémon health bars (`health-high`, `health-mid`, `health-low`) and critical feedback (`success`, `warning`, `danger`).
- All colors and fonts live in `apps/web/src/styles/globals.css` under `@theme`.
- In components use only semantic tokens: `bg-background`, `bg-surface`, `bg-surface-raised`, `border-border`, `text-foreground`, `text-muted`, `text-subtle`, `bg-primary`, `text-primary-foreground`, `bg-health-high`, `bg-health-mid`, `bg-health-low`, `bg-success`, `bg-warning`, `bg-danger`, `text-success`, `text-warning`, `text-danger`.
- Never use raw Tailwind color classes (e.g. `text-red-500`, `bg-green-600`), hex, rgb, or hsl values in components.
- Only font is Outfit. Never add font-family or other fonts.
- Need a new shade? Add a token in `globals.css` first, then use it.
- Never restyle colors line by line in pages; change the token instead.

---

## 16. Toast System (Sonner) Rules

- **Centralized Wrapper:** All client-side notifications MUST use `notify` from `@/lib/toast` (`notify.success`, `notify.error`, `notify.info`, `notify.warning`, `notify.promise`, `notify.dismiss`).
- **Direct Sonner Imports Banned:** Direct `import { toast } from 'sonner'` is strictly forbidden in application components and hooks. Only `apps/web/src/lib/toast.ts` (wrapper) and `apps/web/src/main.tsx` (mounter) may touch `sonner`. Enforced by `pnpm run check:colors`.
- **Monochrome Tokens Only:** Toasts follow the design system tokens (`bg-surface`, `text-foreground`, `border-border`, `font-sans`). Do not enable `richColors` in `<Toaster />`.
- **Deduplication:** Always pass an optional `id` parameter to `notify.error` or `notify.warning` when handling API errors or repeated events to prevent duplicate stacked toasts.

---

## 17. Validation & Error Handling Architecture

- **Single Source of Truth:** All validation schemas are defined once in `@astranox/types` (`packages/types/src/`) and shared end-to-end between API and Web.
- **Frontend Form Validation:** All forms MUST use `react-hook-form` with `@hookform/resolvers/zod` using the shared schemas.
- **Accessible Field Component:** Wrap form inputs with `<Field label="..." error={errors.field?.message}><Input ... /></Field>` from `@/components/ui`. Field automatically wires `aria-invalid` and `aria-describedby` accessibility attributes.
- **Suppression of Global Toast for Form Validation:** Global axios interceptors and query caches MUST suppress generic error toasts when `isValidationError` is true, ensuring field-level errors are displayed directly under inputs without redundant toast spam.
- **Backend API Validation:** All endpoints accepting inputs MUST use `validate({ body?: Schema, query?: Schema, params?: Schema })` or `validate(schema)` from `core/middleware/validate.ts`.
- **Standard API Error Envelope:** Every API error response adheres to:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input",
      "fields": {
        "fieldName": "Clear error message"
      }
    }
  }
  ```
- **Prisma & Centralized Error Handler:** `core/middleware/error-handler.ts` maps Prisma `P2002` to `CONFLICT` (409) and `P2025` to `NOT_FOUND` (404), logs errors to pino and Sentry, and masks unhandled errors with 500 `INTERNAL_ERROR` without leaking stack traces.
- **Real-Time Socket Validation:** Socket events validate incoming payloads with shared schemas and emit `"error:validation"` with structured fields or `"error"` with code and message, guarded by per-socket rate limiting.

---

## 18. Admin Panel & Pokémart Economy Architecture

- **Role-Based Access Control:** Roles are `USER`, `MODERATOR`, and `ADMIN`.
  - `MODERATOR`: Read/operational access to Users, Announcements, AuditLog, and Events.
  - `ADMIN`: Full authority including Pokémart price management, bulk adjustments, Economy overview, and Feature Flags.
  - Enforced on the server via `requireStaff` and `requireAdmin` middleware. Client-side routes and actions are guarded with `<RequireRole allowedRoles={...}>`.
- **Pokémart Dynamic Pricing & Promotions:**
  - Item catalog stored in MongoDB `ShopItem` with base price, optional `salePrice`, `saleStartAt`, and `saleEndAt`.
  - The server calculates the authoritative effective price dynamically (`salePrice` during valid active window, else regular `price`).
  - Purchases require `expectedPrice`. If the price changed while the user was browsing, the server responds with 409 `PRICE_CHANGED` containing the new price. The frontend prompts player confirmation before executing at the updated price.
- **Audit Logging & Mandatory Reasons:**
  - All mutating admin/staff operations (banning/unbanning users, granting currency/items, modifying shop prices, updating feature flags) create an `AuditLog` entry.
  - A `reason` string of at least 5 characters (`SHOP_LIMITS.MIN_REASON_LENGTH`) is strictly required for every modifying action.
- **Idempotency Safeguards:**
  - Financial operations and grants require an `Idempotency-Key` header with distributed lock/caching safeguards to prevent double-charging or duplicate grants.
- **Safe Price Adjustments:**
  - Price changes exceeding 50% (`SHOP_LIMITS.EXTREME_PRICE_CHANGE_PERCENT`) require explicit confirmation (`confirmExtreme: true`).
  - Bulk price adjustments support dry-run preview mode (`dryRun: true`) before applying changes.

---

## 19. Game Integrity, Idempotency & Balance Architecture

- **Cookie Auth Only:** No tokens in JS-readable storage (`localStorage`, `sessionStorage`, or client state). Both access tokens (15m) and refresh tokens (7d) are delivered as `httpOnly` cookies.
- **Idempotency on Mutations:** Every mutation of currency or items (purchases, trades, rewards, claims, shop sell, admin grants) strictly requires an `Idempotency-Key` header with distributed lock and MongoDB `IdempotencyKey` caching safeguards.
- **Immutable Audit Logging:** Every mutating transaction (currency changes, item grants/removals, purchases, trades, admin actions, bans, feature flag updates) writes an append-only `AuditLog` entry inside the transaction.
- **Game Balance Centralization:** Balance numbers, formulas, and thresholds live ONLY in `@astranox/constants` (`battle`, `catch`, `progression`, `economy`, `limits`). Never inline magic numbers in pages or services.
- **Guarded Balances:** Balances and quantities can never go negative. Enforce conditional balance checks inside transactional boundaries (`prisma.$transaction`).
- **Data Versioning & Migrations:** Game-balance-dependent documents (`TrainerSave`, `OwnedPokemon`, `InventoryItem`, `BattleSession`, `ShopItem`) carry a `dataVersion` integer tracking `CURRENT_DATA_VERSION`. Migrations run sequentially via `pnpm --filter api migrate:data` and support in-memory `migrateOnRead` fallback.
- **Virtualized Lists:** Every list potentially exceeding 50 items must be virtualized using `@tanstack/react-virtual`.
- **Comprehensive Screen States:** Every data-fetching screen must explicitly render loading, empty, error, and offline states.
- **Feature Flags:** All risky or newly introduced features must be guarded behind `FeatureFlagService` and `requireFeatureFlag` middleware.

---

## 20. Mobile-First Responsive & Touch Architecture

- **Viewport & Zoom Safeguards:**
  - Viewport meta in `apps/web/index.html` must remain `width=device-width, initial-scale=1, viewport-fit=cover`. Never disable user zooming (`maximum-scale=1` and `user-scalable=no` are forbidden).
  - Safe-area utilities (`pt-safe`, `pb-safe`) must be applied to sticky navigation headers, bottom nav bars, and full-screen drawer/modal overlays.
- **Dynamic Viewport Heights:**
  - Never use raw `100vh` (which causes jumpiness on mobile Safari/Chrome when the address bar hides). Always use dynamic viewport units (`100dvh` or `100svh`). Enforced by `pnpm run check:responsive`.
- **Zero Horizontal Overflow:**
  - Never use unconstrained `w-screen` (which adds scrollbar width and causes horizontal overflow). Use `w-full` or container `max-w-*`.
  - The root document enforces `overflow-x: clip`. Every page and modal must satisfy `document.documentElement.scrollWidth <= document.documentElement.clientWidth` across all viewports (`320px` to `1440px+`).
- **Touch Target & Ergonomics Standard:**
  - Every interactive element (buttons, tabs, inputs, icon triggers, close buttons, modal actions) must provide an active tap target of $\ge$ 44x44px (`min-h-[44px] min-w-[44px]`) on mobile devices.
  - Buttons and interactive items must include `touch-manipulation select-none` to eliminate the 300ms mobile tap delay and prevent accidental text selection during multi-tap gestures.
- **iOS Auto-Zoom Prevention:**
  - All text and search inputs must render font size $\ge$ 16px on mobile screens (`text-base sm:text-sm` or `text-base sm:text-xs`) to prevent iOS WebKit from forcing page zooming on input focus.
  - Number inputs must use `<input type="text">` with digit stripping in `onChange` (never `<input type="number">`).
- **Responsive Dialogs & Action Sheets:**
  - Dialogs and action modals must render as bottom sheets on viewports below `md` (`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4`, with card `rounded-t-3xl sm:rounded-2xl max-h-[85dvh] sm:max-h-[90dvh] pb-safe` and a mobile drag handle indicator `<div className="sm:hidden mx-auto ..."`).
- **Mobile Navigation Bar (BottomNav):**
  - Mobile bottom navigation (`Explore`, `Pokédex`, `Bag`, `Shop`, `Team`) is anchored in the thumb zone (`pb-safe`, `lg:hidden`) and automatically suppressed during active battles (`/battle`).
  - Main game layout applies `pb-16 lg:pb-0` to guarantee zero content clipping behind the mobile navigation bar.
- **Reduced Motion Support:**
  - All animated transitions, bottom sheet slides, and layout morphs must respect `prefers-reduced-motion: reduce` via `motion-reduce:*` utility classes or `useReducedMotion()`.

