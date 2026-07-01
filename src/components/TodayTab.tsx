export function TodayTab() {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-bold text-text-primary">Today's Habits</h3>
      <p className="text-sm text-text-secondary">Coming soon - track your daily progress here.</p>
    </div>
  );
}
