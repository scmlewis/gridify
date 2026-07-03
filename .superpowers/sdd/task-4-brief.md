# Task 4: Tab & Page Transitions

**Files:**
- Modify: `src/components/TodayTab.tsx`
- Modify: `src/components/CategoryGroup.tsx` (accept className/style props)
- Modify: `src/index.css` (add tab transition keyframes)

**Interfaces:**
- Consumes: `.animate-group-enter`, `.animate-shimmer` from Task 1

- [ ] **Step 1: Add tab transition keyframes to `index.css`**

Append to `src/index.css`:

```css
@keyframes tab-enter-left {
  0% { transform: translateX(-12px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
@keyframes tab-enter-right {
  0% { transform: translateX(12px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
.animate-tab-enter-left {
  animation: tab-enter-left 200ms var(--ease-smooth) forwards;
}
.animate-tab-enter-right {
  animation: tab-enter-right 200ms var(--ease-smooth) forwards;
}
```

- [ ] **Step 2: Add tab direction support to tab components**

Each tab component (`TodayTab`, `GridsTab`, `AnalyticsTab`) needs to accept a `tabDirection` prop and wrap its content in a direction-aware animation div.

In `TodayTab.tsx`, add the prop to the interface:

```tsx
interface TodayTabProps {
  onRefresh: React.Dispatch<React.SetStateAction<number>>;
  refreshKey?: number;
  onShowCategories?: () => void;
  tabDirection?: 'left' | 'right';
}
```

Update the function signature:

```tsx
export function TodayTab({ onRefresh: _onRefresh, refreshKey, onShowCategories, tabDirection = 'right' }: TodayTabProps) {
```

Wrap the return content in a direction-aware div (the main `<div className="space-y-4">`):

```tsx
return (
  <div className={tabDirection === 'right' ? 'animate-tab-enter-right' : 'animate-tab-enter-left'}>
    <div className="space-y-4">
      {/* existing content */}
    </div>
  </div>
);
```

Apply the same pattern to `GridsTab.tsx` and `AnalyticsTab.tsx`.

- [ ] **Step 3: Add tab direction state to App.tsx**

In `App.tsx`, add state to track tab navigation direction:

```tsx
const [tabDirection, setTabDirection] = useState<'left' | 'right'>('right');
```

Find where `activeTab` is set (the tab change handler). Wrap it to also compute direction:

```tsx
const tabOrder = { today: 0, grids: 1, analytics: 2 };

// In the tab change handler:
const prevIndex = tabOrder[activeTab];
const nextIndex = tabOrder[tab];
setTabDirection(nextIndex > prevIndex ? 'right' : 'left');
setActiveTab(tab);
```

Pass `tabDirection` to each tab component:

```tsx
{activeTab === 'today' && <TodayTab ... tabDirection={tabDirection} />}
{activeTab === 'grids' && <GridsTab ... tabDirection={tabDirection} />}
{activeTab === 'analytics' && <AnalyticsTab ... tabDirection={tabDirection} />}
```

- [ ] **Step 4: Add category group stagger to TodayTab**

In `TodayTab.tsx`, the `sortedCategories` map renders `CategoryGroup` components. Add `animationDelay` based on index:

```tsx
{sortedCategories.map(([category, catHabits], index) => (
  <CategoryGroup
    key={category}
    categoryName={category}
    habits={catHabits}
    onCheckIn={() => _onRefresh(n => n + 1)}
    onHabitTap={setSelectedHabit}
    onDragStart={handleDragStart}
    onDragOver={handleDragOver}
    onDrop={handleDrop}
    refreshKey={refreshKey}
    className="animate-group-enter"
    style={{ animationDelay: `${index * 60}ms` }}
  />
))}
```

- [ ] **Step 5: Update CategoryGroup to accept className and style**

In `CategoryGroup.tsx`, add `className` and `style` to the props interface:

```tsx
interface CategoryGroupProps {
  // ... existing props
  className?: string;
  style?: React.CSSProperties;
}
```

Update the function signature and forward the props to the wrapper div:

```tsx
export function CategoryGroup({ ..., className, style }: CategoryGroupProps) {
  return (
    <div className={`space-y-2 ${className ?? ''}`} style={style}>
      {/* existing content */}
    </div>
  );
}
```

- [ ] **Step 6: Add skeleton shimmer for loading state**

In `TodayTab.tsx`, replace the loading spinner with skeleton cards:

```tsx
if (isLoading || onboardingCompleted === null) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-shimmer rounded-xl h-20 w-full" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && npx vitest run`
Expected: TypeScript clean, all tests pass

- [ ] **Step 8: Commit**

```bash
git add src/components/TodayTab.tsx src/components/GridsTab.tsx src/components/AnalyticsTab.tsx src/components/CategoryGroup.tsx src/App.tsx src/index.css
git commit -m "feat: tab crossfade transitions, category stagger, skeleton loading"
```
