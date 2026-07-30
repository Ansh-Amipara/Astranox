# Enterprise React Frontend Architecture & Codebase Review

**Date:** July 30, 2026
**Reviewer:** Principal Frontend Architect (Antigravity)
**Scope:** `Astranox/client` Codebase

---

## 1. Executive Summary
The Astranox frontend has made significant architectural strides by adopting Feature-Sliced Design (FSD). The structural division into `modules`, `widgets`, and `shared` layers is well on its way to supporting a massive enterprise-scale application. The recent addition of React Error Boundaries and Playwright End-to-End (E2E) tests has notably increased application stability.

However, several architectural violations, technical debt, and missing enterprise patterns must be addressed before this application is completely production-ready for hundreds of thousands of users.

---

## 2. Folder Structure Review

The application aims for Feature-Sliced Design (FSD) but has "leaks".

- **`src/modules/*`**: Correctly implemented feature slices (e.g., `auth`, `battle`, `pokemon`). Each contains `api`, `components`, `pages`, `store`, etc.
  - *Critique:* Some inner folders (`pages`) have subfolders named after the component (e.g., `admin-dashboard/ui/AdminDashboard.tsx`). This is a solid FSD pattern, but we must ensure no module imports directly from another module to prevent circular dependencies.
- **`src/shared/*`**: Contains shared components and utilities.
  - *Critique (Inconsistency):* There are two overlapping UI directories: `src/shared/components/ui/` (containing `ErrorFallback.tsx`) and `src/shared/ui/` (containing `Button.tsx`, `Card.tsx`). These should be merged into a single standard directory (e.g., `src/shared/ui`).
- **`src/widgets/*`**: Correctly houses `admin-layout` and `navbar`.
- **Violations (Stray Folders)**:
  - `src/services/explore.service.ts` exists outside the `modules/explore` boundary.
  - `src/utils/pokemonUtils.ts` exists globally instead of inside `shared/utils` or `modules/pokemon/utils`.
  - `src/views` and `src/store` exist globally but appear to be legacy artifacts. FSD dictates these should not exist at the root `src/` level.

---

## 3. React Architecture & Components Review

- **Component Size**: Currently, core features like `Home.tsx` and `BattleScreen.tsx` are "God Components". They mix data-fetching, UI rendering, layout, and complex state management.
  - *Recommendation*: Implement the **Container/Presenter** pattern. The Container handles the TanStack Query hooks and Zustand interactions, and the Presenter (a dumb component) receives props and renders the UI.
- **State Management**:
  - Global UI/Auth state is correctly managed by `zustand` (e.g., `auth.store.ts`).
  - Asynchronous data fetching is correctly managed by TanStack Query (`query-client.ts`).
- **Error Handling**: 
  - *Excellent*: A robust `react-error-boundary` architecture is in place at both the Global (`main.tsx`) and Module (`AdminLayout`, `GameLayout`) levels. This guarantees that isolated widget crashes do not bring down the entire Single Page Application.

---

## 4. UI/UX & Styling Review

- **Styling**: Tailwind CSS is used effectively for rapid prototyping, but heavily bloated inline class names are prevalent.
  - *Recommendation*: Use `cva` (Class Variance Authority) combined with `tailwind-merge` and `clsx` (e.g., a `cn()` utility) to clean up `Badge.tsx`, `Button.tsx`, and complex layouts.
- **Micro-interactions & Aesthetics**: The UI implements Glassmorphism (`Card variant="glass"`) and pulsing animations (`animate-pulse-slow`), which meets the "WOW" factor for premium design.

---

## 5. Security & Accessibility Review

- **Security**: 
  - Token handling is correct: the `accessToken` is stored strictly in memory (via Zustand), and the `refreshToken` is handled safely via `httpOnly` cookies from the backend.
  - Playwright E2E tests generate unique users per test run, successfully simulating secure, parallel-safe execution.
- **Accessibility (a11y)**:
  - *Critical Gap*: Custom UI components lack proper `aria-*` tags and keyboard navigation. Forms and buttons must be navigable via the `Tab` key with visible focus rings (`focus-visible:ring-2`) to meet WCAG 2.2 standards.

---

## 6. Scorecard (/10)

| Category | Score | Notes |
|---|---|---|
| **Architecture** | 7/10 | Strong FSD foundation, but plagued by root-level stray folders and inconsistencies. |
| **Code Quality** | 6/10 | High technical debt inside God components. Needs Container/Presenter separation. |
| **UI/UX** | 8/10 | Modern, glassmorphic design language. |
| **Accessibility** | 4/10 | Missing keyboard navigation and semantic ARIA tagging. |
| **Performance** | 7/10 | Good client-side caching with TanStack Query. Needs React virtualization for large lists. |
| **Security** | 9/10 | Excellent JWT + httpOnly cookie session implementation. |
| **Testing** | 7/10 | Solid initial Playwright coverage, but needs component-level tests (Vitest). |

---

## 7. Issue Register

| Problem | Risk | Recommendation | Effort |
|---|---|---|---|
| **Stray Root Folders** | High | Move `src/services`, `src/utils`, `src/views` to `src/shared` or respective `modules`. | Low |
| **UI Directory Split** | Medium | Merge `shared/components/ui` into `shared/ui`. | Low |
| **God Components** | High | Refactor `Home.tsx` and `BattleScreen.tsx` into Container/Presenter components. | Medium |
| **Missing Accessibility** | Medium | Implement `aria-label`, `tabIndex`, and `focus-visible` styling across the app. | Medium |

---

## 8. Enterprise Roadmap

Based on this review, here is the updated roadmap:

* **Phase 4: Component Decoupling & File Structure Refactoring (Current/Next Step)**
  - Move stray root folders (`services`, `utils`) into strict FSD boundaries.
  - Merge the split UI directories in `shared/`.
  - Refactor monolithic components (e.g., `Home.tsx`, `BattleScreen.tsx`) into clean Container/Presenter hierarchies.
* **Phase 5: Performance & Accessibility Compliance**
  - Implement WCAG 2.2 navigation and ARIA tags.
  - Introduce `React.memo` and list virtualization for the Pokedex and Inventory views.
* **Phase 6: E2E Type Safety**
  - Implement full type safety across the network boundary by linking the frontend to `@astranox/shared` backend DTOs.
