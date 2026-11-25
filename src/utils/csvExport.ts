export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Escapes a single CSV cell value according to RFC 4180 and neutralizes
 * spreadsheet formula injection (cells starting with =, +, -, @, tab, or CR)
 * while preserving numeric values cleanly.
 */
export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Converts an array of typed rows and column definitions into a UTF-8 CSV string
 * with a BOM prefix (\uFEFF) so Microsoft Excel opens Unicode characters (such as ₹) cleanly.
 */
export function buildCsvContent<T>(rows: T[], columns: CsvColumn<T>[], includeBom = true): string {
  const headerLine = columns.map((col) => escapeCsvCell(col.header)).join(',');
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(col.accessor(row))).join(',')
  );
  const body = [headerLine, ...dataLines].join('\r\n');
  return includeBom ? `\uFEFF${body}` : body;
}

export function sanitizeFilenameSegment(segment: string): string {
  return segment
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'export';
}

export function triggerCsvDownload(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
