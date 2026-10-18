# Astranox Modernization & Hardening — Phase Status Report

**Last Updated:** October 18, 2026  
**Active Branch:** `feature/pro`  
**Current Head:** Preparing Phase 3 commit

---

## High-Level Progress Overview

| Phase | Title | Status | Commits / Artifacts |
|:---:|---|:---:|---|
| **Phase 1** | **Auth, Sockets, CORS** | **COMPLETED** | Commit `e6b2bf2` |
| **Phase 2** | **Game Integrity (Audit, Idempotency, Balance, Data Version)** | **COMPLETED** | Commit `55fe4d1` |
| **Phase 3** | **Platform (Flags, Request IDs, Admin, Backups)** | **COMPLETED** | Commit `dd2772a` |
| **Phase 4** | **Frontend Experience (Screen States, Virtualization, Mobile, DevTools)** | **COMPLETED** | Ready to commit |
| **Phase 5** | **2D Grid Exploration & Server-Authoritative Catching Loop** | **COMPLETED** | Ready to commit |

---

## Detailed Phase Breakdown

### Phase 1: Auth, Sockets, CORS (COMPLETED)
- [x] **Item 1: Cookie Auth & Token Family Rotation**
  - Migrated tokens out of `localStorage` / response bodies into secure `httpOnly` cookies (`SameSite=Lax`, `Secure` in production).
  - Access token lifetime: 15 minutes; Refresh token lifetime: 7 days.
  - Stored SHA-256 hashes of refresh tokens in MongoDB `RefreshToken` collection.
  - Enforced token rotation and reuse detection: replaying a revoked token immediately invalidates the entire token family.
  - Session endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout-all`.
  - State-changing requests protected via `SameSite=Lax` cookies and strict `Origin` header verification against `WEB_ORIGINS`.
  - Client Axios interceptor with single-flight silent refresh queue (no request storms or infinite loops).
- [x] **Item 2: Socket.io Authentication & Lifecycle**
  - Authenticated via `accessToken` cookie in `io.use(...)` handshake.
  - User ID attached to `socket.data.user`; enforced `verifySocketOwnership` on all actions.
  - Single active socket per user policy (disconnects superseded sessions with `SESSION_SUPERSEDED`).
  - Graceful token expiration handling and automatic reconnection after silent refresh.
- [x] **Item 3: CORS & Security Headers**
  - Strict `WEB_ORIGINS` whitelist for Express CORS and Socket.io origin validation.
  - Production Helmet Content Security Policy (Cloudinary, raw GitHub sprites, WebSockets).
  - Configured `trust proxy: 1` for Kubernetes ingress and accurate IP rate limiting.

---

### Phase 2: Game Integrity (COMPLETED)
- [x] **Item 4: Append-Only Audit Logging (`AuditService`)**
  - Upgraded `AuditLog` schema with `actorId`, `actorType`, `before`, `after`, `meta`, `requestId`, `ip`, and indexed on `[actorId, createdAt]`, `[entityType, entityId]`, `[requestId]`.
  - Built transactional `AuditService.log(entry, tx)`.
  - Integrated audit logs into logins/failures, Pokémart purchases, marketplace trades, and admin mutations.
  - Validated with `audit-integrity.spec.ts` (3/3 passing).
- [x] **Item 5: Idempotency with Distributed Locks & Balance Guard**
  - Added `IdempotencyKey` model with composite unique index on `[userId, key]`.
  - Implemented `requireIdempotency()` middleware with Redlock (`RedisLockService`).
  - Handles identical replays (`X-Idempotent-Replay: true`), payload mismatches (422), and in-flight conflicts (409).
  - Guaranteed non-negative balances with conditional updates inside Prisma `$transaction`.
  - Client `shopApi` passes `Idempotency-Key` on all mutating operations.
  - Validated with `idempotency-integrity.spec.ts` (4/4 passing) and `admin-and-shop.spec.ts` (12/12 passing).
- [x] **Item 6: Game Balance Constants Centralization**
  - Centralized game rules into `@astranox/constants` under `packages/constants/src/balance/`:
    - `battle.ts`: STAB (1.5), crit (1.5), Shedinja 1 HP, IV bounds (0–31), stat offsets.
    - `catch.ts`: Pokéball, Great, Ultra, Master ball multipliers; sleep/freeze/para status bonuses.
    - `progression.ts`: Level formulas (`(level - 1) * 100 + 1`), rank orders, potential max levels.
    - `economy.ts`: Starting currency (3,000 Astral Coins), smelt ratio (0.60), shop refund (0.75).
    - `limits.ts`: Party size (6), move slots (4), box limits.
    - `data-version.ts`: `CURRENT_DATA_VERSION = 1`.
  - Replaced inline magic numbers across API & Web. Validated with `constants-formulas.test.ts` (9/9 passing).
  - *Documented Discrepancy:* `inventory.service.ts` uses cubic growth (`level^3`) while `level-math.ts` uses flat 100 XP per level. Formulas preserved as per policy.
- [x] **Item 7: Data Versioning & Migration Runner**
  - Added `dataVersion Int @default(1)` to `TrainerSave`, `OwnedPokemon`, `InventoryItem`, and `BattleSession`.
  - Created lightweight migration runner (`apps/api/src/migrations/runner.ts`) with `MigrationRun` collection.
  - Initial migration: `0001_initial_data_version.ts`.
  - Added in-memory `migrateOnRead` fallback and CLI runner (`pnpm --filter api migrate:data`).
  - Validated with `migration-runner.spec.ts` (3/3 passing).

---

### Phase 3: Platform (COMPLETED)
- [x] **Item 8: Request IDs and Logging**
  - Middleware generating/sanitizing `X-Request-Id` and storing in Node `AsyncLocalStorage` (`RequestContextStore`).
  - Returned in response header `X-Request-Id` and attached to `pino-http` log lines via `genReqId` and `customProps`.
  - Sentry scope tagging with `requestId`.
  - Automatic propagation into `AuditLog.requestId` and standardized API error envelope (`error.requestId`).
  - Socket.io: event-level `requestId` assigned per event, logged in context, and attached to error payloads (`verifySocketOwnership`, `verifySocketRole`, `verifySocketFeatureFlag`).
  - Redacted sensitive fields in logs (`cookie`, `authorization`, `password`, `token`, `refreshToken`, `accessToken`, `secret`).
  - Web: displayed `requestId` in error toast descriptions (`Request ID: <id>`) so players can easily report issues.
- [x] **Item 9: Feature Flags**
  - Enhanced `FeatureFlag` model in Prisma (`key`, `name`, `description`, `enabled`, `rolloutPercent`, `allowUserIds`, `updatedBy`, `updatedAt`).
  - Synchronized MongoDB database via `prisma db push` and generated updated Prisma Client.
  - `FeatureFlagService` with Redis caching, automatic invalidation on change, user whitelist bypass, and deterministic percentage rollouts.
  - Seeded default flags: `shop`, `battles`, `trading`, `newRegistrations`, `maintenanceMode`.
  - `requireFlag(key)` middleware returning HTTP 503 (`FEATURE_DISABLED`) with error envelope.
  - Public `GET /flags` endpoint for client hydration and reactive `useFlag(key)` hook on web.
  - `MaintenanceGuard` screen with staff/admin bypass for uninterrupted operations.
- [x] **Item 10: Admin Tooling & Inspection**
  - Role hierarchy (`USER`, `MODERATOR`, `ADMIN`) enforced via `requireRole` on API and sockets.
  - Added admin inspection route: `GET /admin/battles/:id` for detailed battle state examination.
  - User moderation: ban/unban with mandatory reason, token family revocation, and active socket termination via `disconnectUserSockets`.
  - Idempotent currency and item grants.
  - Web `/admin` portal: virtualized data tables, confirm dialogs with mandatory reason input.
- [x] **Item 11: MongoDB Backups & Restore Runbooks**
  - Kubernetes CronJob manifest (`k8s/mongo-backup-cronjob.yaml`) executing daily `mongodump --archive --gzip` with 7-day daily / 4-week weekly retention policy and S3 upload.
  - Local Docker Compose backup profile (`docker-compose.yml` with `mongo-backup` service).
  - Restore runbook (`scripts/restore.md`) and automated restore test scripts (`scripts/restore-test.sh` & `scripts/restore-test.ts`).

---

### Phase 4: Frontend Experience (COMPLETED)
- [x] **Item 12: Comprehensive Screen States**
  - Reusable primitives created: `Skeleton` (rectangular, circular, text, card variants), `EmptyState` (with icon, title, description, action), `ErrorState` (with retry button & `requestId` display), and `OfflineBanner` (network status detection).
  - Wired loading, empty, and error states across all 7 core data screens: Pokédex, Inventory (Bag), Battle, Marketplace, Pokémart (Shop), Profile, and Admin (DataTable).
  - Module error boundary fallbacks integrated per route.
- [x] **Item 13: Sprite Preloading & Optimization**
  - `<PokemonSprite>` component with explicit dimensions, error fallback icon, skeleton loader, and Cloudinary auto-format/auto-quality transformations (`f_auto,q_auto`).
  - Sprite preloading utilities: `preloadSprites(urls)` using HTMLImageElement async decode API.
  - Battle screen sprite prefetching for both active combatants and full player/opponent party rosters before battle initiation.
- [x] **Item 14: Virtualized Lists**
  - Virtualized Pokédex (`useWindowVirtualizer`), Bag / Inventory (`useVirtualizer`), and Admin tables (`DataTable` with `@tanstack/react-virtual` for > 50 records).
  - Fluid mobile-responsive layouts with stable item keys and keyboard accessibility.
- [x] **Item 15: Mobile-First Responsive Design**
  - Mobile audit at 360px, 390px, 768px, and desktop widths.
  - Enforced minimum 44px tap targets (`min-touch-target`), `dvh` units, safe-area insets (`pb-safe`, `pt-safe`), and zero horizontal overflow.
- [x] **Item 16: Accessibility & Reduced Motion**
  - Global CSS `@media (prefers-reduced-motion: reduce)` in `globals.css` disabling animations and transitions.
  - `useReducedMotion()` hook dynamically responding to OS media query changes.
- [x] **Item 17: Developer Showcase (`/dev/components`)**
  - Dev-only route (`/dev/components`) accessible only when `import.meta.env.DEV` is true.
  - Interactive showcase of all UI primitives, states, 360px mobile preview container toggle, and reduced-motion emulation.
  - Verified completely dead-code eliminated from production Vite bundle.

---

### Phase 5: 2D Grid Exploration & Server-Authoritative Catching Loop (COMPLETED)
- [x] **Item 18: Shared Game Logic Packages (`@astranox/game-map` & `@astranox/battle-engine`)**
  - Pure packages independent of database or network with zero external runtime dependencies.
  - `packages/game-map`: Tile types (`WALKABLE`, `WALL`, `GRASS`, `WATER`, `WARP`), maps (`pallet-town`, `route-1`), collision checks (`canMove`), and weighted encounter table rolls (`rollEncounter`).
  - `packages/battle-engine`: Deterministic Mulberry32 seeded PRNG, Gen 5 damage calculation with intermediate truncation, Gen V+ 4-shake capture thresholds (`calculateCapture`), and pure turn resolver `(state, action, rng) => { state, events }` supporting `USE_MOVE`, `THROW_BALL`, `SWITCH_POKEMON`, `RUN` and outcomes `WON`, `CAPTURED`, `DEFEATED`, `FLED`.
  - Comprehensive unit test suites (8 tests in game-map, 15 tests in battle-engine, all passing).
- [x] **Item 19: Data Model & Persistence**
  - Schema updates: Added overworld tracking fields to `TrainerSave` (`currentMapId`, `posX`, `posY`, `facing`, `lastHealMapId`, `lastHealX`, `lastHealY`, `stepsSinceEncounter`).
  - Added `EncounterHistory` model with compound indexes on `[userId, createdAt]` and `[trainerId, createdAt]`.
  - Applied schema changes to MongoDB via `prisma db push` and generated Prisma Client.
- [x] **Item 20: Server-Authoritative Exploration & Battles**
  - `ExplorationService`: Tracks authoritative position, verifies collisions and warp triggers, enforces movement rate-limiting (180ms cooldown), and awards 5 steps of encounter immunity post-battle.
  - `EncounterService`: Spawns encounters from weighted map tables, hydrates player party, and persists active session in Redis (`battle:{battleId}`).
  - `WildBattleService`: Validates intents, manages item consumption, resolves combat rounds with Redlock synchronization.
  - `BattleFinalizerService`: Executes atomic Prisma transaction on battle completion, awarding/deducting currency, applying party damage/fainting, creating `OwnedPokemon` on capture, logging `EncounterHistory`, and writing append-only `AuditLog`.
  - `ExploreGateway`: Socket.io gateway handling `explore:join`, `explore:move`, `battle:action` with schema validation, rate-limiting, and ownership verification.
  - `AdminController`: Added staff endpoint `GET /admin/exploration` returning maps, encounter tables, and balance constants.
- [x] **Item 21: Web UI & Accessibility**
  - `ExplorePage`: Responsive 2D exploration with `<canvas>` viewport (11x9 tiles, DPR-aware, monochrome patterns for WALL, GRASS, WATER, WARP), smooth camera lerp, and fallback for `prefers-reduced-motion`.
  - Controls: Touch D-pad ($\ge 48\text{px}$ targets, hold-to-repeat) and WASD / Arrow keys.
  - In-game Battle: Turn-based overlay with move selection (keyboard shortcuts 1–4, Esc), ball tossing, party switching with health bars, and accessible live combat log (`aria-live="polite"`).
  - Outcome modal (`OutcomeDialog`) with summary of rewards/penalties and return-to-map flow.
  - Screen states: Full `Skeleton`, `ErrorState`, `OfflineBanner`, and faint guard.
  - Design compliance: 100% compliant with semantic black/white/grey tokens and Outfit typography (`pnpm run check:colors` passing across all 236 files).

