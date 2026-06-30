# Technical Specification & Coding Agent Blueprint
## High-Density Habit Tracker PWA with Git-Style Contribution Grid

This document serves as the **single source of truth (SSOT)** for generating the PWA Habit Tracker application. It is designed to be fed directly into an AI coding agent to orchestrate the generation of code in structured, verifiable phases.

---

## 1. Project Overview & Architectural Stack

The goal is to build a high-performance, offline-first Progressive Web App (PWA) with zero loading latency and a high-density, minimalist user interface.

### Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React (Vite) + TypeScript |
| **Styling** | Tailwind CSS (configured with dark mode default or system-native theme detection) |
| **Local Storage/DB** | Dexie.js (Wrapper for IndexedDB) |
| **PWA Core** | vite-plugin-pwa (managing service workers, offline asset caches, and dynamic manifest serving) |

---

## 2. Core Schema & Storage (Dexie.js)

To support robust offline capability, we bypass traditional localStorage (which is synchronous, blockable, and capacity-limited) in favor of IndexedDB.

### Database Schema Definition

```ts
export interface Habit {
  id: string;          // Cryptographically secure UUID
  name: string;        // Habit title (e.g., "Deep Work 90m")
  createdAt: string;   // ISO 8601 Timestamp: YYYY-MM-DDTHH:mm:ssZ
  archived: boolean;   // Soft-deletion flag to retain historical grid logs
  sortOrder: number;   // User-defined sorting sequence
}

export interface HabitLog {
  id: string;          // UUID
  habitId: string;     // Index key linking back to Habit.id
  date: string;        // Format: YYYY-MM-DD (Strict local system standard date representation)
  value: number;       // Tracks compliance (e.g., binary: 1 or 0; quantitative: numeric counts)
}
```

### IndexedDB Indexes Configuration

Define the schema for your Dexie instance as follows:

- **habits**: `id`, `archived`, `sortOrder`
- **habitLogs**: `id`, `habitId`, `date`, `[habitId+date]` (composite index to ensure single check-ins per habit-day combination are instantaneous)

---

## 3. Contribution Grid Logic & Math

The main challenge is mapping a stream of logs over 365+ days into a coherent 7 × 53 matrix grid representing the last 53 weeks.

### Grid Matrix Calculations

Let **D_start** be the exact date of Sunday of the week occurring exactly 52 weeks prior to the current week's Sunday.

Let **D_log** be the date of any recorded habit completion.

To compute the zero-indexed coordinate position **(C, R)** where **C** is the column index (0 to 52) and **R** is the row index (0 to 6 representing Sunday to Saturday):

1. Convert both dates to standard local midnight timestamps (eliminating hour/minute time shift errors).
2. Calculate the raw elapsed day delta **N**:

   ```
   N = (T_log - T_start) / (86400 × 1000)
   ```
   *(where T represents the absolute Unix timestamp in milliseconds)*

3. Compute column index **C**:

   ```
   C = floor(N / 7)
   ```

4. Compute row index **R**:

   ```
   R = N mod 7
   ```

### Color Gradient Scaling

Let **V_day** be the sum of log values on a specific calendar day *d*. The cell intensity level **L** (ranging 0 to 4) is mapped dynamically:

| Condition | Level |
|---|---|
| V_day = 0 | 0 |
| 0 < V_day ≤ q₁ | 1 |
| q₁ < V_day ≤ q₂ | 2 |
| q₂ < V_day ≤ q₃ | 3 |
| V_day > q₃ | 4 |

*(where q_n are user-defined thresholds or dynamic quartiles computed based on the user's active check-in distributions)*

---

## 4. UI/UX Component Specifications

The application UI consists of two primary screens/views:

### 4.1 Dashboard Layout

- **Header Module**: Minimalist app brand title, system connection state flag (Online/Offline indicator), and a "Global Productivity Grid" showing the aggregated sum of all active habits.
- **Control Panel**: Quick input field to create new habits with auto-incremented sorting index.
- **Habit Tracker Body**: A vertically stacked, highly compact grid of custom card components.

### 4.2 Individual Habit Component

Each habit card must render as a dense row containing:

- **Habit Controls (Left Column)**: Name, current daily streak metric, and a rapid touch-optimized button to trigger a toggle state for "Today" (optimistically updating the UI instantly).
- **Compact Grid Viewer (Right Column)**: Individual instance of `<ContributionGrid />` showing only the history of this particular habit.
- **Visual States**: Soft-archiving toggle button when hovering over the habit controls.

---

## 5. Service Worker & Offline Blueprint

To pass Google Lighthouse PWA tests and provide a flawless offline desktop/mobile application, implement standard Service Worker life-cycling via `vite-plugin-pwa`:

- **Caching Profile**: Cache HTML shell, CSS build files, and all production JS assets with a **StaleWhileRevalidate** caching policy.
- **Update Interceptor Prompt**: Avoid silent, unexpected UI refreshes. Register a visual micro-notification (Toast UI) when a client worker detects pending compilation adjustments:
  > "A new version of this tracker is available. [Refresh and Update]"
- **Database Sync Protection**: Prevent system page lockups during poor network frames. All writes occur directly to Dexie's IndexedDB first. No remote syncing is required initially.

---

## 6. Development Phasing Roadmap

When prompting your coding agent, execute these development blocks one by one to ensure you don't run into code generation length limits or debugging traps:

| Phase | Description |
|---|---|
| **Phase 1** | Project Scaffolding & Database Layer Generation |
| **Phase 2** | Matrix Mathematical Engine & Grid Component |
| **Phase 3** | Interactive App Dashboard & Toggle Optimistic UI |
| **Phase 4** | Service Worker Activation & Manifest Integration |

---

### Phase 1 Agent Prompt

> "Scaffold a new React TypeScript application with Vite. Install Dexie.js. Create a `db.ts` file that implements the database layout, indexes, and Dexie transactions detailed in Sections 2 and 3 of the specification document. Write auxiliary functions to insert, remove, and query range entries."

### Phase 2 Agent Prompt

> "Write the `<ContributionGrid />` React Component in Tailwind CSS. Compute the continuous calendar grid of 53 columns representing weeks, mapping individual date tiles using the exact local timestamp offset mathematical conversion formula from Section 3. Use standard CSS tooltips on cell hover."

### Phase 3 Agent Prompt

> "Create the primary dashboard view as described in Section 4. Render a grid of habits where users can add, delete, and instantly check-in for the day. Use React local state to optimistically toggle active cell states in the UI while asynchronous Dexie transactions run in the background."

### Phase 4 Agent Prompt

> "Integrate PWA updates. Set up `vite-plugin-pwa` within the project. Create a service-worker updates UI element displaying an operational prompt to reload client sessions when update signals flag active caches."
