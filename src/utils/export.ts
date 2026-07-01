import { db, type Habit, type HabitLog, createHabit, logCheckIn } from '../db';

function habitsToCSV(habits: Habit[], logs: HabitLog[]): string {
  const lines = ['habit,date,value'];
  const habitMap = new Map(habits.map((h) => [h.id, h.name]));

  for (const log of logs) {
    const name = habitMap.get(log.habitId) ?? log.habitId;
    const escapedName = name.includes(',') ? `"${name}"` : name;
    lines.push(`${escapedName},${log.date},${log.value}`);
  }

  return lines.join('\n');
}

function habitsToJSON(habits: Habit[], logs: HabitLog[]): string {
  return JSON.stringify({ habits, logs }, null, 2);
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportCSV() {
  const habits = await db.table('habits').toArray() as Habit[];
  const logs = await db.table('habitLogs').toArray() as HabitLog[];
  const csv = habitsToCSV(habits, logs);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `habits-export-${date}.csv`, 'text/csv');
}

export async function exportJSON() {
  const habits = await db.table('habits').toArray() as Habit[];
  const logs = await db.table('habitLogs').toArray() as HabitLog[];
  const json = habitsToJSON(habits, logs);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(json, `habits-export-${date}.json`, 'application/json');
}

function parseCSV(text: string): { habitName: string; date: string; value: number }[] {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const entries: { habitName: string; date: string; value: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let habitName: string;
    let rest: string;

    if (line.startsWith('"')) {
      const endQuote = line.indexOf('"', 1);
      habitName = line.substring(1, endQuote);
      rest = line.substring(endQuote + 2);
    } else {
      const firstComma = line.indexOf(',');
      habitName = line.substring(0, firstComma);
      rest = line.substring(firstComma + 1);
    }

    const [date, valueStr] = rest.split(',');
    const value = parseInt(valueStr, 10);

    if (date && !isNaN(value)) {
      entries.push({ habitName, date, value });
    }
  }

  return entries;
}

export async function importCSV(csvText: string): Promise<{ imported: number; skipped: number }> {
  const entries = parseCSV(csvText);
  let imported = 0;
  let skipped = 0;

  const existingHabits = await db.table('habits').toArray() as Habit[];
  const habitNameMap = new Map(existingHabits.map((h) => [h.name.toLowerCase(), h.id]));

  const newHabitNames = new Set<string>();
  for (const entry of entries) {
    if (!habitNameMap.has(entry.habitName.toLowerCase())) {
      newHabitNames.add(entry.habitName);
    }
  }

  for (const name of newHabitNames) {
    const id = await createHabit(name);
    habitNameMap.set(name.toLowerCase(), id);
  }

  for (const entry of entries) {
    const habitId = habitNameMap.get(entry.habitName.toLowerCase());
    if (!habitId) {
      skipped++;
      continue;
    }

    await logCheckIn(habitId, entry.date, entry.value);
    imported++;
  }

  return { imported, skipped };
}
