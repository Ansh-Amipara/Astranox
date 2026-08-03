# Mobile View Responsiveness Implementation Plan

This document outlines the proposed strategy to make the entire Astranox web application fully responsive and optimized for mobile devices (smartphones and tablets).

## User Review Required

> [!IMPORTANT]
> Please review the **Global Navigation** proposal below. We have 13 links in the main navigation. Moving to a **Hamburger Menu (Sidebar)** or a **Bottom Navigation Bar** with a "More" drawer will significantly alter the mobile user experience. Let me know which navigation paradigm you prefer.

## Proposed Changes

---

### 1. Global Navigation (`Navbar.tsx` & `AdminLayout.tsx`)

Currently, the `Navbar.tsx` handles mobile by hiding overflowing links in an `overflow-x-auto` container, which requires horizontal scrolling.
- **[MODIFY] `client/src/widgets/navbar/ui/Navbar.tsx`**
  - Implement a Hamburger menu icon that appears on mobile (`lg:hidden`).
  - When clicked, open a full-screen or sliding Drawer containing the navigation links vertically.
  - Hide the horizontal links on screens smaller than `lg`.
  - Fix the "upper right corner" user actions so they fit nicely within the mobile header.

- **[MODIFY] `client/src/widgets/admin-layout/ui/AdminLayout.tsx`**
  - The Admin Sidebar currently takes up permanent horizontal space.
  - On mobile, convert the sidebar into a togglable off-canvas menu, ensuring the main dashboard takes up 100% width.

---

### 2. Layout Containers & Spacing (`App.tsx` & Core Pages)

The padding and margins around the main container (`p-6 md:p-12`) are sometimes too large for mobile, leaving too little room for content.
- **[MODIFY] `client/src/app/App.tsx` & Feature Pages**
  - Adjust global padding using Tailwind's responsive prefixes (e.g., `p-3 sm:p-6 lg:p-12`).
  - Ensure the `main` container is `w-full` with no horizontal clipping (`overflow-x-hidden` on body if necessary).

---

### 3. Data Grids, Lists, & Complex Pages

Many pages use `grid-cols-2` or `flex-row` which forces content to become squished on narrow 320px-400px screens.
- **[MODIFY] `client/src/modules/core/pages/home/ui/Home.tsx`**
  - Change top stat cards to `grid-cols-2 lg:grid-cols-4`.
  - Ensure "Active Party" cards stack gracefully on mobile (`grid-cols-1 sm:grid-cols-2`).

- **[MODIFY] `client/src/modules/pokemon/pages/team/ui/TeamPage.tsx` & `PokemonManagement.tsx`**
  - Update Pokémon box grids to be `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6`.
  - Ensure long Pokémon names and stats truncate or wrap properly in tight spaces.

- **[MODIFY] `client/src/modules/events/pages/events/ui/EventHistory.tsx` & `ActiveEvent.tsx`**
  - Change the `flex-row` side-by-side layout (Tasks left, Rewards right) into a `flex-col` stacked layout on mobile (`flex-col md:flex-row`).
  - Ensure the rewards panel doesn't overflow horizontally.

---

### 4. Battle & Arena Systems (`BattleScreen.tsx` & `BattleArena.tsx`)

The battle system requires careful positioning to look good on a tall, narrow screen.
- **[MODIFY] `client/src/modules/battle/components/ui/BattleArena.tsx`**
  - The sprites and health bars (Enemy Top Right, Player Bottom Left) must scale down proportionally.
  - Adjust the absolute positioning or flex spacing so they don't overlap on very small screens.

- **[MODIFY] `client/src/modules/battle/pages/battle/ui/BattleScreen.tsx`**
  - Update the "Moves / Actions" grid at the bottom.
  - On mobile, it should be a 2x2 grid (`grid-cols-2`) or a single column (`grid-cols-1`) so buttons are large enough to be easily tapped (finger-friendly touch targets).

---

### 5. Modals, Forms & Inputs

- **[MODIFY] `client/src/modules/pokemon/components/ui/PokemonActionModals.tsx`** (and other Modals)
  - Ensure Modals use `w-[95%] sm:w-full sm:max-w-md md:max-w-lg`.
  - Add `max-h-[90vh]` and `overflow-y-auto` so modal contents don't bleed off the top/bottom of a mobile screen.
- **[MODIFY] Global Inputs**
  - Ensure all `<input>` elements have a text size of at least `16px` (`text-base`) on mobile to prevent iOS Safari from automatically zooming in when a field is focused.

## Verification Plan

### Manual Verification
1. Open the application and use browser DevTools (Device Mode) to simulate iPhone SE (375px width) and iPad Mini.
2. Verify that the Hamburger Menu functions and allows full navigation.
3. Verify that Pokémon grids stack into single or double columns without horizontal scrolling.
4. Verify the Battle Arena sprites and health bars don't overlap awkwardly.
5. Deploy to a mobile device (if available) and verify that buttons have adequate touch target sizing and inputs do not trigger forced zoom.
