/**
 * Minimal, dependency-free CSV helpers for the admin export endpoints
 * (GET /api/admin/export/users|resumes|templates).
 *
 * Deliberately not pulling in a CSV library for three columns of escaping —
 * RFC 4180 quoting is a handful of lines (Part 21: "avoid unnecessary
 * dependencies").
 */

/**
 * Escapes a single CSV field per RFC 4180: any value containing a comma,
 * double quote, or newline is wrapped in double quotes, with internal
 * double quotes doubled. null/undefined become an empty field rather than
 * the literal string "null"/"undefined".
 */
export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Builds a full CSV document (header row + data rows) from column headers
 *  and an array of row objects, pulling each column by key. */
export function toCsv<T extends object>(headers: { key: keyof T; label: string }[], rows: T[]): string {
  const headerLine = headers.map((h) => csvEscape(h.label)).join(',');
  const lines = rows.map((row) => headers.map((h) => csvEscape(row[h.key])).join(','));
  // CRLF line endings are the RFC 4180 norm and what Excel expects.
  return [headerLine, ...lines].join('\r\n') + '\r\n';
}
