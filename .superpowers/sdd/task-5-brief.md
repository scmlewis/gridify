# Task 5: Drag & Drop Polish

**Files:**
- Modify: `src/components/HabitRow.tsx`
- Modify: `src/components/TodayTab.tsx`
- Modify: `src/components/CategoryGroup.tsx`
- Modify: `src/index.css` (add drag state CSS)

**Interfaces:**
- Consumes: `.transition-spring`, `.animate-drop-pulse` from Task 1

- [ ] **Step 1: Add drag state CSS to `index.css`**

Append to `src/index.css`:

```css
/* Drag and drop states */
.dragging {
  transform: scale(1.02);
  box-shadow: 0 8px 25px -5px color-mix(in srgb, var(--color-primary) 25%, transparent);
  opacity: 0.9;
  z-index: 10;
}
.drop-target {
  border: 2px dashed color-mix(in srgb, var(--color-primary) 40%, transparent);
  animation: drop-pulse 1s ease-in-out infinite;
}
```

- [ ] **Step 2: Apply drag classes in HabitRow.tsx**

In `HabitRow.tsx`, add a `isDragging` state:

```tsx
const [isDragging, setIsDragging] = useState(false);
```

Update the drag handlers:

```tsx
const handleDragStart = (e: React.DragEvent) => {
  setIsDragging(true);
  onDragStart?.(e, habit.id);
};

const handleDragEnd = () => {
  setIsDragging(false);
};
```

Add `onDragEnd={handleDragEnd}` to the wrapper div, and apply the `dragging` class conditionally:

```tsx
<div
  draggable={true}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  onDragEnd={handleDragEnd}
  onClick={handleClick}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  className={`group flex items-center gap-3 rounded-xl bg-surface-card px-3.5 py-3 border transition-all duration-200 border-border/60 hover:border-primary/30 hover:bg-surface-card/80 cursor-pointer hover:shadow-md hover:shadow-primary/5 ${isDragging ? 'dragging' : ''}`}
  style={{ borderLeft: `3px solid ${color}` }}
>
```

- [ ] **Step 3: Add drop-target highlight in TodayTab.tsx**

In `TodayTab.tsx`, add a `dragOverHabitId` state:

```tsx
const [dragOverHabitId, setDragOverHabitId] = useState<string | null>(null);
```

Update handlers:

```tsx
const handleDragOver = (e: React.DragEvent, habitId: string) => {
  e.preventDefault();
  setDragOverHabitId(habitId);
};

const handleDrop = async (e: React.DragEvent, targetHabitId: string) => {
  e.preventDefault();
  setDragOverHabitId(null);
  // ... existing reorder logic
};

const handleDragLeave = () => {
  setDragOverHabitId(null);
};
```

Pass `dragOverHabitId` and `handleDragLeave` to `CategoryGroup`:

```tsx
<CategoryGroup
  // ... existing props
  dragOverHabitId={dragOverHabitId}
  onDragLeave={handleDragLeave}
/>
```

- [ ] **Step 4: Update CategoryGroup to forward drop target props**

In `CategoryGroup.tsx`, add to props:

```tsx
dragOverHabitId?: string | null;
onDragLeave?: () => void;
```

Forward `isDropTarget` to each `HabitRow`:

```tsx
{habits.map((habit) => (
  <HabitRow
    key={habit.id}
    habit={habit}
    isDropTarget={dragOverHabitId === habit.id}
    onDragLeave={onDragLeave}
    // ... other props
  />
))}
```

- [ ] **Step 5: Update HabitRow to accept and apply drop target**

In `HabitRow.tsx`, add to props:

```tsx
isDropTarget?: boolean;
onDragLeave?: () => void;
```

Apply the `drop-target` class when `isDropTarget` is true:

```tsx
className={`group flex items-center gap-3 rounded-xl bg-surface-card px-3.5 py-3 border transition-all duration-200 border-border/60 hover:border-primary/30 hover:bg-surface-card/80 cursor-pointer hover:shadow-md hover:shadow-primary/5 ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`}
```

Add `onDragLeave` to the wrapper div:

```tsx
onDragLeave={onDragLeave}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npx vitest run`
Expected: TypeScript clean, all tests pass

- [ ] **Step 7: Commit**

```bash
git add src/components/HabitRow.tsx src/components/TodayTab.tsx src/components/CategoryGroup.tsx src/index.css
git commit -m "feat: drag & drop polish — ghost lift, drop zone pulse, reorder transition"
```
