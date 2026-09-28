/** Display text for a release year the catalog may not have. */
export function formatYear(year: number | null): string {
  return year === null ? "Unknown" : String(year);
}
