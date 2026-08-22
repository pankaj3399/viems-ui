/**
 * CSV Utility Functions
 *
 * Provides safe escaping for CSV exports to prevent formula injection
 * and ensure standard RFC 4180 quoting.
 */

export function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value);
  // Mitigate CSV Formula Injection by prefixing formula trigger characters with a single quote
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  // Double quote any internal quotes and wrap in quotes
  return `"${str.replace(/"/g, '""')}"`;
}
