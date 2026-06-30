export interface Habit {
  id: string;          // Cryptographically secure UUID (use nanoid)
  name: string;        // Habit title (e.g., "Deep Work 90m")
  createdAt: string;   // ISO 8601 Timestamp: YYYY-MM-DDTHH:mm:ssZ
  archived: boolean;   // Soft-deletion flag to retain historical grid logs
  sortOrder: number;   // User-defined sorting sequence
}

export interface HabitLog {
  id: string;          // UUID
  habitId: string;     // Index key linking back to Habit.id
  date: string;        // Format: YYYY-MM-DD
  value: number;       // Tracks compliance (e.g., binary: 1 or 0; quantitative: numeric counts)
}