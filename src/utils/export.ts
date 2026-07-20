import { db, type Habit, type HabitLog, createHabit, logCheckIn } from '../db';

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function habitsToCSV(habits: Habit[], logs: HabitLog[]): string {
  const lines = ['habit,date,value'];
  const habitMap = new Map(habits.map((h) => [h.id, h.name]));

  for (const log of logs) {
    const name = habitMap.get(log.habitId) ?? log.habitId;
    lines.push(`${csvEscape(name)},${log.date},${log.value}`);
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
  const habits = (await db.table('habits').toArray() as Habit[]).filter((h) => !h.archived);
  const habitIds = new Set(habits.map((h) => h.id));
  const logs = (await db.table('habitLogs').toArray() as HabitLog[]).filter((l) => habitIds.has(l.habitId));
  const csv = habitsToCSV(habits, logs);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `habits-export-${date}.csv`, 'text/csv');
}

export async function exportJSON() {
  const habits = (await db.table('habits').toArray() as Habit[]).filter((h) => !h.archived);
  const habitIds = new Set(habits.map((h) => h.id));
  const logs = (await db.table('habitLogs').toArray() as HabitLog[]).filter((l) => habitIds.has(l.habitId));
  const json = habitsToJSON(habits, logs);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(json, `habits-export-${date}.json`, 'application/json');
}

function parseCSV(text: string): { habitName: string; date: string; value: number }[] {
  // Strip BOM if present
  const clean = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;

  const entries: { habitName: string; date: string; value: number }[] = [];
  const rows = parseCSVRows(clean);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 3) continue;

    const habitName = row[0].trim();
    const date = row[1].trim();
    const value = parseInt(row[2].trim(), 10);

    if (habitName && date && !isNaN(value)) {
      entries.push({ habitName, date, value });
    }
  }

  return entries;
}

function parseCSVRows(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        current.push(field);
        field = '';
        i++;
      } else if (ch === '\r') {
        current.push(field);
        field = '';
        rows.push(current);
        current = [];
        if (i + 1 < text.length && text[i + 1] === '\n') i++;
        i++;
      } else if (ch === '\n') {
        current.push(field);
        field = '';
        rows.push(current);
        current = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Last field/row
  if (field || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  return rows;
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

  const createdIds: string[] = [];
  for (const name of newHabitNames) {
    const id = await createHabit(name);
    habitNameMap.set(name.toLowerCase(), id);
    createdIds.push(id);
  }

  // Track dates already logged per habit so a re-import doesn't duplicate.
  const existingLogKeys = new Set<string>();
  const allHabitIds = [
    ...existingHabits.map((h) => h.id),
    ...createdIds,
  ];
  for (const habitId of allHabitIds) {
    const logs = await db.table('habitLogs').where('habitId').equals(habitId).toArray() as HabitLog[];
    for (const log of logs) {
      existingLogKeys.add(`${log.habitId}|${log.date}`);
    }
  }

  for (const entry of entries) {
    const habitId = habitNameMap.get(entry.habitName.toLowerCase());
    if (!habitId) {
      skipped++;
      continue;
    }

    if (existingLogKeys.has(`${habitId}|${entry.date}`)) {
      skipped++;
      continue;
    }

    await logCheckIn(habitId, entry.date, entry.value);
    imported++;
  }

  return { imported, skipped };
}
