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
| **Phase 3** | **Platform (Flags, Request IDs, Admin, Backups)** | **COMPLETED** | Ready to commit |
| **Phase 4** | **Frontend Experience (Screen States, Virtualization, Mobile, DevTools)** | **IN PROGRESS (NEXT)** | Ready to begin on continue |

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

### Phase 4: Frontend Experience (IN PROGRESS - NEXT)
- [ ] **Item 12: Comprehensive Screen States**
  - Reusable primitives: `Skeleton`, `EmptyState`, `ErrorState` (with retry + `requestId`), `OfflineBanner`.
  - Implement loading, empty, error, and offline states across all data-driven screens: Pokédex, Inventory, Battle, Trading, Shop, Profile, and Admin.
  - Error boundaries per feature with fallback UI.
- [ ] **Item 13: Sprite Preloading & Optimization**
  - `<Img>` / `<PokemonSprite>` component with explicit dimensions, error fallback, skeleton loader, and Cloudinary auto-format/quality transformations.
  - Preload battle sprites (both combatants and party icons) before battle screen renders; prefetch subsequent sprites.
- [ ] **Item 14: Virtualized Lists**
  - Virtualize Pokédex, Inventory, and Admin tables over 50 items using `@tanstack/react-virtual`.
  - Support responsive grid layouts, stable keys, scroll position restoration, and keyboard accessibility.
- [ ] **Item 15: Mobile-First Responsive Design**
  - Mobile audit at 360px, 390px, 768px, and desktop widths.
  - Minimum 44px tap targets, zero horizontal scrolling, `dvh` units, safe-area padding.
  - Playwright mobile viewport tests.
- [ ] **Item 16: Accessibility & Reduced Motion**
  - Global CSS `@media (prefers-reduced-motion: reduce)` disabling transitions.
  - `useReducedMotion()` hook for game animations (HP bars, battle effects).
- [ ] **Item 17: Developer Showcase (`/dev/components`)**
  - Dev-only route (`import.meta.env.DEV`) showcasing all UI primitives, variants, 360px viewport frame, and reduced-motion toggle.
  - Verified excluded from production build bundle.
