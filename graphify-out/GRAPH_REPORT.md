# Graph Report - .  (2026-07-12)

## Corpus Check
- Corpus is ~43,978 words - fits in a single context window. You may not need a graph.

## Summary
- 514 nodes · 1060 edges · 38 communities (25 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Analytics & Charts
- Data Layer & Forms
- UI Component Library
- App Shell & Toast
- Header & About
- Insights & Stats
- Animation Rationales
- TypeScript Config
- Blueprint & Schemas
- Category & Grid Data
- Build Tool Config
- Dev Dependencies
- Year Comparison
- NPM Packages
- Linting Rules
- Package Scripts
- Grid & Input Design
- Package Metadata
- Confetti Effect
- Graphify Plugin
- TS Project References
- OxLint
- PostCSS
- Tailwind CSS
- Node Types
- React Types
- TypeScript
- PWA Plugin
- React Vite Plugin
- Workbox
- GitHub Actions
- Social Icons

## God Nodes (most connected - your core abstractions)
1. `formatDate()` - 42 edges
2. `react` - 38 edges
3. `addDays()` - 35 edges
4. `Habit` - 27 edges
5. `dexie` - 24 edges
6. `Progressive Simplicity Redesign Progress Ledger` - 22 edges
7. `compilerOptions` - 18 edges
8. `processCheckIn()` - 16 edges
9. `compilerOptions` - 15 edges
10. `calculateStreak()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Task 10: Goal Setting Report` --references--> `ColorPicker Component`  [EXTRACTED]
  .superpowers/sdd/task-10-report.md → src/components/ColorPicker.tsx
- `Task 10: Goal Setting Report` --references--> `useHabits Hook`  [EXTRACTED]
  .superpowers/sdd/task-10-report.md → src/hooks/useHabits.ts
- `Task 11: Habit Detail Sheet Report` --references--> `CategoryGroup Component`  [EXTRACTED]
  .superpowers/sdd/task-11-report.md → src/components/CategoryGroup.tsx
- `Task 12: Category Filters Brief` --references--> `GridsTab Component`  [EXTRACTED]
  .superpowers/sdd/task-12-brief.md → src/components/GridsTab.tsx
- `Task 12: Category Filters Report` --references--> `GridsTab Component`  [EXTRACTED]
  .superpowers/sdd/task-12-report.md → src/components/GridsTab.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase 1: Foundation Implementation** — phase_1_foundation, task_1_database_migration, task_2_tab_navigation, task_3_summary_card, task_4_empty_state, task_5_category_groups, task_6_onboarding_flow, task_7_menu_integration, task_8_grids_tab [EXTRACTED 1.00]
- **Habit Detail Sheet Feature Set** — task_11_habit_detail, habit_detail_sheet, stats_card, day_of_week_heatmap, trend_sparkline, today_tab, grids_tab [EXTRACTED 1.00]
- **Analytics Feature Set** — task_13_trend_sparkline, task_14_analytics_utilities, task_15_insights_panel, src_analytics_utilities, src_insights_utilities, insights_panel [EXTRACTED 1.00]
- **Premium Interactions Implementation Pipeline** — task-2_habitcard-interactions, task-3_sheet-modal-animations, task-4_tab-page-transitions, task-5_drag-drop-polish, task-6_toast-spring-curve, task-7_final-integration-polish [INFERRED 0.95]
- **Fix Report Review Issues** — superpowers_sdd_task_fix_report, rationale_sheet-open-stagger-fallback, rationale_reorder-transition-spring, rationale_ripple-guard-uncheck, rationale_glow-pulse-prevent-replay [EXTRACTED 1.00]
- **CSS Animation System Design** — rationale_glow-pulse-animation, rationale_backdrop-blur-stagger, rationale_drag-state-css, rationale_cleanup-superseded-keyframes, rationale_skeleton-loading-state [INFERRED 0.85]
- **Premium Interactions Motion Design System** — premium_interactions_plan, premium_interactions_spec, MotionTokens_rationale [EXTRACTED 0.90]
- **Gridify Development Roadmap** — progressive_simplicity_redesign_plan, premium_interactions_plan, grid_ux_fixes_plan, gridify_2_enhancement_plan [EXTRACTED 0.85]
- **Contribution Grid System** — ContributionGrid_rationale, GridVerticalOrientation_rationale, grid_ux_fixes_plan [INFERRED 0.80]

## Communities (38 total, 13 thin omitted)

### Community 0 - "Analytics & Charts"
Cohesion: 0.08
Nodes (47): AnalyticsBarChart(), DAY_LETTERS, formatShort(), ViewMode, AnalyticsTab(), AnalyticsTabProps, CompletionDistribution(), CompletionDistributionProps (+39 more)

### Community 1 - "Data Layer & Forms"
Cohesion: 0.08
Nodes (49): dexie, dexie, AddHabitSheet(), AddHabitSheetProps, CategoryManagement(), CategoryManagementProps, PRESET_COLORS, ColorPicker() (+41 more)

### Community 2 - "UI Component Library"
Cohesion: 0.07
Nodes (59): AddHabitSheet Component, CategoryGroup Component, ColorPicker Component, DayOfWeekHeatmap Component, GridsTab Component, HabitCard Component, HabitDetailSheet Component, HabitRow Component (+51 more)

### Community 3 - "App Shell & Toast"
Cohesion: 0.05
Nodes (31): react, AchievementToast(), AchievementToastProps, AddHabitFormProps, BottomNav(), BottomNavProps, DAY_LABELS, DayOfWeekHeatmap() (+23 more)

### Community 4 - "Header & About"
Cohesion: 0.11
Nodes (24): AboutSheet(), AboutSheetProps, FEATURES, AnalyticsBarChartProps, Header(), HeaderProps, OnlineStatus(), THEMES (+16 more)

### Community 5 - "Insights & Stats"
Cohesion: 0.14
Nodes (18): InsightsPanel(), ObservationCard(), ObservationCardProps, calculateCompletionRate(), calculateDayOfWeekStats(), parseDate(), calculateJaccardSimilarity(), Correlation (+10 more)

### Community 6 - "Animation Rationales"
Cohesion: 0.08
Nodes (28): Backdrop Blur & Stagger Design, Cleanup Superseded Keyframes Rationale, Drag State CSS Design, Glow Pulse Animation Design, Glow Pulse Prevent Replay on Mount Rationale, Reorder Transition Spring Rationale, Ripple Click-Trigger Design, Ripple Guard on Uncheck Rationale (+20 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 8 - "Blueprint & Schemas"
Cohesion: 0.12
Nodes (22): Technical Specification & Coding Agent Blueprint, Category System, Contribution Grid, Gamification System, Grid Vertical Orientation, Gridify Product Philosophy, HabitLog Schema, Habit Schema (+14 more)

### Community 9 - "Category & Grid Data"
Cohesion: 0.14
Nodes (18): HabitGridData, CategoryGroup(), CategoryGroupProps, getCollapsedCategories(), saveCollapsedCategories(), HabitCardProps, HabitDetailSheetProps, HabitRow() (+10 more)

### Community 10 - "Build Tool Config"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 11 - "Dev Dependencies"
Cohesion: 0.15
Nodes (13): autoprefixer, devDependencies, autoprefixer, @tailwindcss/postcss, @types/react-dom, vite, vitest, @vitest/coverage-v8 (+5 more)

### Community 12 - "Year Comparison"
Cohesion: 0.27
Nodes (6): YearComparison(), YearComparisonProps, computeBestStreak(), getYearComparison(), YearComparison, YearData

### Community 13 - "NPM Packages"
Cohesion: 0.22
Nodes (9): lucide-react, nanoid, dependencies, lucide-react, nanoid, react, react-dom, react (+1 more)

### Community 14 - "Linting Rules"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 15 - "Package Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, test:watch

### Community 16 - "Grid & Input Design"
Cohesion: 0.29
Nodes (7): Numeric Stepper Pattern Design, Performance Memoization Strategy, Task 8: Grids Tab Report, Task 9: Numeric Check-in Report, Task 19: Performance Optimization, Task 8: Grids Tab, Task 9: Numeric Check-in

### Community 17 - "Package Metadata"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 18 - "Confetti Effect"
Cohesion: 0.50
Nodes (4): COLORS, Confetti(), ConfettiProps, randomBetween()

## Knowledge Gaps
- **137 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dexie` connect `Data Layer & Forms` to `Category & Grid Data`, `Header & About`, `NPM Packages`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `dependencies` connect `NPM Packages` to `Package Metadata`, `Data Layer & Forms`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `react` connect `App Shell & Toast` to `Analytics & Charts`, `Data Layer & Forms`, `Header & About`, `Category & Grid Data`, `Year Comparison`, `Linting Rules`, `Confetti Effect`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `IMPORTANT: keep the reminder string free of backticks and $(...) constructs.`, `$schema`, `typescript` to the rest of the system?**
  _149 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Analytics & Charts` be split into smaller, more focused modules?**
  _Cohesion score 0.08296751536435469 - nodes in this community are weakly interconnected._
- **Should `Data Layer & Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.08192090395480225 - nodes in this community are weakly interconnected._
- **Should `UI Component Library` be split into smaller, more focused modules?**
  _Cohesion score 0.06545879602571596 - nodes in this community are weakly interconnected._