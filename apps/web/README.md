# Astranox Web Frontend (`apps/web`)

Modern web client for Astranox, built with React 19, TypeScript, Vite 5, Tailwind CSS v4, React Router v7, Zustand, TanStack Query, Radix UI primitives, Socket.io client, and Vitest.

---

## 1. Architecture & Directory Structure

The frontend is organized around a strict unidirectional dependency graph:
```
features / pages ──> components / layout ──> lib
```

`components/ui` represents our design system primitives and has **zero** domain knowledge. It is isolated from game state, features, and route pages.

```
apps/web/src/
├── components/
│   ├── ui/                     # Design system primitives (Button, Card, Dialog, Select, etc.)
│   │   ├── <Name>/             # Each primitive is a directory with component, CVA variants, and unit test
│   │   └── index.ts            # Public barrel export for all UI primitives
│   └── layout/                 # Shell and layout components (Header, AdminLayout, PageContainer)
│       └── index.ts            # Public barrel export for layout components
├── features/                   # Domain feature modules
│   ├── admin/                  # Admin management dashboards and event controls
│   ├── auth/                   # Authentication (login, register, session store, guard)
│   ├── battle/                 # Battle system (presenter, session hook, action modals)
│   ├── events/                 # Game events and active challenge tracking
│   ├── explore/                # Overworld area exploration & zone encounters
│   ├── home/                   # Player lobby / landing overview
│   ├── inventory/              # Bag, consumable items, and storage
│   ├── marketplace/            # Trading system, market listings, and Pokémart
│   ├── overworld/              # 2D canvas tile engine and movement loop
│   ├── pokedex/                # Pokémon encyclopedia and species lookup
│   ├── pokemon/                # Team management, stat boosting, moveset customization
│   ├── profile/                # Trainer profile and statistics
│   ├── rift/                   # Void Rift dungeon mode
│   ├── social/                 # Trainer rankings and leaderboard
│   ├── tower/                  # Infinity Tower gauntlet mode
│   └── index.ts                # Root features barrel
├── pages/                      # Thin route wrappers mapping routes to feature containers
│   ├── admin/
│   └── index.ts                # Route pages barrel
├── lib/                        # Cross-cutting infrastructural singletons and utilities
│   ├── api.ts                  # Axios HTTP client, token refresh interceptor & endpoints
│   ├── cn.ts                   # Tailwind class merge utility (clsx + tailwind-merge)
│   ├── logger.ts               # Structured frontend logging & toast integration
│   ├── queryClient.ts          # TanStack Query client configuration
│   ├── QueryProvider.tsx       # Query client context provider
│   ├── SocketContext.tsx       # Real-time WebSocket connection context
│   └── index.ts                # Barrel export for lib utilities
├── hooks/                      # Generic cross-feature React hooks (e.g. useFocusTrap)
├── styles/
│   └── globals.css             # Tailwind CSS v4 tokens, design variables, and global themes
├── routes.tsx                  # React Router v7 route definitions and hierarchy
└── main.tsx                    # Application entrypoint and React root mounting
```

---

## 2. Component Contribution Guidelines

### Adding New UI Primitives (`components/ui`)
1. **Directory Structure:** Create a folder under `src/components/ui/<PrimitiveName>/`:
   ```
   src/components/ui/<PrimitiveName>/
   ├── <PrimitiveName>.tsx
   └── <PrimitiveName>.test.tsx
   ```
2. **Compound Components:** Use compound component patterns where appropriate (e.g., `Card`, `Card.Header`, `Card.Body`, `Card.Footer`).
3. **Styling with CVA:** Define variant styles using `class-variance-authority`:
   - Keep variant definitions co-located with the component.
   - Export variant definitions (e.g. `buttonVariants`) for composition.
   - Combine with `cn()` from `@/lib/cn`.
4. **React 19 Ref Handling:** Do not use `React.forwardRef`. In React 19, `ref` is a standard component prop (`{ ref, ...props }: ButtonProps`).
5. **No Number Spinners:** For numeric inputs, do **not** use `<input type="number">`. Use text inputs with digit-only sanitization (`e.target.value.replace(/\D/g, '')`) to prevent browser arrow spinners.
6. **Encapsulate Radix UI:** Any `@radix-ui/*` primitives (Dialog, Select, VisuallyHidden) must be wrapped inside `components/ui` and styled. Do not import `@radix-ui/*` outside `components/ui`.
7. **Barrel Export:** Always export the new primitive and its prop types in `src/components/ui/index.ts`.
8. **Unit Tests:** Always accompany primitives with a Vitest unit test exercising default rendering, variant classes, disabled states, and user interactions.

---

## 3. Import Conventions

Always use `@/` path aliases configured in `tsconfig.json`:

```typescript
// Shared UI Primitives
import { Button, Card, Dialog, Input, Select, Badge, Spinner } from '@/components/ui';

// Layout Components
import { Header, PageContainer, AdminLayout } from '@/components/layout';

// Domain Features
import { BattleScreen } from '@/features/battle';
import { useAuthStore } from '@/features/auth';
import { PokemonManagement } from '@/features/pokemon';

// Route Pages
import { BattlePage, TeamPage } from '@/pages';

// Infrastructural Utilities
import { cn, api, queryClient } from '@/lib';
```

### Dependency Rules & Guardrails
- `components/ui` **must never** import from `features/*` or `pages/*`.
- Only `components/ui` is permitted to import directly from `@radix-ui/*`.
- Enforcement is monitored via `oxlint` (`.oxlintrc.json`).

---

## 4. Development & Verification Commands

```bash
# Start development server
pnpm dev

# Typecheck TypeScript files
pnpm typecheck

# Lint with Oxlint
pnpm lint

# Run Vitest unit tests
pnpm test

# Build production bundle
pnpm build
```
