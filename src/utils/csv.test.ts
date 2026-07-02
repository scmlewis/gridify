import { describe, it, expect } from 'vitest';

// Inline the parseCSVRows and csvEscape functions for testing
// since they're not exported from export.ts

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
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

  if (field || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  return rows;
}

describe('csvEscape', () => {
  it('returns plain string unchanged', () => {
    expect(csvEscape('hello')).toBe('hello');
  });

  it('wraps commas in quotes', () => {
    expect(csvEscape('a,b')).toBe('"a,b"');
  });

  it('escapes double quotes', () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
  });

  it('wraps newlines in quotes', () => {
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"');
  });

  it('escapes carriage returns', () => {
    expect(csvEscape('a\r\nb')).toBe('"a\r\nb"');
  });
});

describe('parseCSVRows', () => {
  it('parses simple CSV', () => {
    const csv = 'a,b,c\n1,2,3';
    const rows = parseCSVRows(csv);
    expect(rows).toEqual([['a', 'b', 'c'], ['1', '2', '3']]);
  });

  it('handles quoted fields', () => {
    const csv = '"hello world",2,3';
    const rows = parseCSVRows(csv);
    expect(rows).toEqual([['hello world', '2', '3']]);
  });

  it('handles escaped quotes inside quoted field', () => {
    const csv = '"say ""hi""",2,3';
    const rows = parseCSVRows(csv);
    expect(rows).toEqual([['say "hi"', '2', '3']]);
  });

  it('handles newlines inside quoted field', () => {
    const csv = '"line1\nline2",2,3';
    const rows = parseCSVRows(csv);
    expect(rows).toEqual([['line1\nline2', '2', '3']]);
  });

  it('handles \\r\\n line endings', () => {
    const csv = 'a,b\r\nc,d';
    const rows = parseCSVRows(csv);
    expect(rows).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('handles BOM at start', () => {
    const csv = '\uFEFFa,b\n1,2';
    const rows = parseCSVRows(csv);
    // BOM is part of first field
    expect(rows[0][0]).toBe('\uFEFFa');
  });

  it('handles trailing comma', () => {
    const csv = 'a,b,\n1,2,';
    const rows = parseCSVRows(csv);
    expect(rows).toEqual([['a', 'b', ''], ['1', '2', '']]);
  });

  it('handles empty fields', () => {
    const csv = 'a,,c\n1,,3';
    const rows = parseCSVRows(csv);
    expect(rows).toEqual([['a', '', 'c'], ['1', '', '3']]);
  });

  it('round-trips with csvEscape', () => {
    const names = ['simple', 'with,comma', 'with"quote', 'with\nnewline'];
    const escaped = names.map(n => csvEscape(n)).join(',');
    const rows = parseCSVRows(escaped);
    expect(rows[0]).toEqual(names);
  });
});
